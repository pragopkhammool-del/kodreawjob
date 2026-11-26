import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  downloadClientWorkbookFallback,
  fetchJsonSafe,
  getLocalCategories,
  resolveApiUrl,
} from '../lib/catalogClient';
import { Category, DbUser, Product, ToastMessage } from '../types';

interface AppContextValue {
  route: string;
  navigate: (to: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  firebaseUser: User | null;
  dbUser: DbUser | null;
  isAdmin: boolean;
  authLoading: boolean;
  getIdToken: () => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  categories: Category[];
  uniqueVisitors: number;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  downloadProtectedFile: (downloadUrl: string, suggestedFilename?: string) => Promise<boolean>;
  downloadFreeProduct: (product: Product) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | null>(null);

function getOrCreateVisitorToken(): string {
  const key = 'kodraewjob_visitor_id';
  let existing = localStorage.getItem(key);
  if (!existing) {
    existing =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(key, existing);
  }
  return existing;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<string>(
    () => window.location.pathname + window.location.search
  );
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kodraewjob_theme') || localStorage.getItem('sutsamret_theme');
    return saved === 'dark';
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(1);
  const idTokenRef = useRef<string | null>(null);

  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved =
        localStorage.getItem('kodraewjob_cart') || localStorage.getItem('sutsamret_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved =
        localStorage.getItem('kodraewjob_wishlist') || localStorage.getItem('sutsamret_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('kodraewjob_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('kodraewjob_theme', 'light');
    }
  }, [darkMode]);

  // Persist cart & wishlist
  useEffect(() => {
    localStorage.setItem('kodraewjob_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kodraewjob_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', to);
      setRoute(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load categories + track unique visitor + verify Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection();

    fetchJsonSafe<Category[]>('/api/categories').then((res) => {
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories(getLocalCategories());
      }
    });

    const visitorToken = getOrCreateVisitorToken();
    fetchJsonSafe<{ uniqueVisitors?: number }>('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorToken }),
    }).then((res) => {
      if (res.ok && typeof res.data.uniqueVisitors === 'number') {
        setUniqueVisitors(res.data.uniqueVisitors);
      }
    });
  }, []);

  // Sync user's public profile to Firestore for Forum / Messenger
  const syncFirestoreProfile = useCallback(async (user: User) => {
    if (!user.emailVerified) return;
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const snap = await getDoc(profileRef);
      const displayName = (
        user.displayName ||
        user.email?.split('@')[0] ||
        'สมาชิก กดแล้วจบ'
      ).slice(0, 120);
      const photoURL = user.photoURL ? user.photoURL.slice(0, 512) : undefined;

      if (!snap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          displayName,
          ...(photoURL ? { photoURL } : {}),
          createdAt: serverTimestamp(),
        });
      } else {
        const existing = snap.data();
        if (existing.displayName !== displayName || (photoURL && existing.photoURL !== photoURL)) {
          await updateDoc(profileRef, {
            displayName,
            ...(photoURL ? { photoURL } : {}),
          });
        }
      }
    } catch (error) {
      console.warn('Profile sync skipped:', error);
    }
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          idTokenRef.current = token;
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.user);
            setIsAdmin(Boolean(data.isAdmin));
          }
          await syncFirestoreProfile(user);
        } catch {
          // Ignore transient sync error
        }
      } else {
        idTokenRef.current = null;
        setDbUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [syncFirestoreProfile]);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken();
    idTokenRef.current = token;
    return token;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      idTokenRef.current = token;
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setIsAdmin(Boolean(data.isAdmin));
      }
      await syncFirestoreProfile(result.user);
      setAuthModalOpen(false);
      showToast({
        type: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับคุณ ${result.user.displayName || result.user.email}`,
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: error?.message || 'กรุณาอนุญาตป๊อปอัปเบราว์เซอร์แล้วลองใหม่อีกครั้ง',
      });
    }
  }, [showToast, syncFirestoreProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    idTokenRef.current = null;
    setDbUser(null);
    setIsAdmin(false);
    showToast({ type: 'info', title: 'ออกจากระบบแล้ว' });
    navigate('/');
  }, [navigate, showToast]);

  const downloadProtectedFile = useCallback(
    async (downloadUrl: string, suggestedFilename = 'template.xlsx'): Promise<boolean> => {
      const token = await getIdToken();
      if (!token || !auth.currentUser) {
        showToast({
          type: 'info',
          title: 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลดไฟล์',
          description: 'ล็อกอินด้วย Gmail / บัญชี Google เพื่อยืนยันสิทธิ์การดาวน์โหลด',
        });
        setAuthModalOpen(true);
        return false;
      }

      try {
        const res = await fetch(resolveApiUrl(downloadUrl), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setAuthModalOpen(true);
          showToast({
            type: 'info',
            title: 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลด',
          });
          return false;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          showToast({
            type: 'error',
            title: errData.error || 'ไม่สามารถดาวน์โหลดไฟล์ได้',
          });
          return false;
        }

        const blob = await res.blob();
        const disposition = res.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/i);
        const filename = match?.[1] || suggestedFilename;

        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        return true;
      } catch {
        showToast({ type: 'error', title: 'เกิดข้อผิดพลาดระหว่างดาวน์โหลดไฟล์' });
        return false;
      }
    },
    [getIdToken, showToast]
  );

  const downloadFreeProduct = useCallback(
    async (product: Product): Promise<boolean> => {
      const token = await getIdToken();
      if (!token || !auth.currentUser) {
        showToast({
          type: 'info',
          title: 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลดไฟล์',
          description: 'เข้าสู่ระบบด้วย Gmail (Google) หรือ LINE/Facebook เพื่อดาวน์โหลดไฟล์ฟรีทันที',
        });
        setAuthModalOpen(true);
        return false;
      }

      try {
        const res = await fetch(resolveApiUrl(`/api/products/${product.slug}/free-download`), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          downloadClientWorkbookFallback(product);
          showToast({
            type: 'success',
            title: 'ดาวน์โหลดไฟล์ Excel สำเร็จ',
            description: product.title,
          });
          return true;
        }
        const data = await res.json();
        if (res.ok && data.downloadUrl) {
          showToast({
            type: 'success',
            title: 'กำลังดาวน์โหลดไฟล์ .xlsx',
            description: product.title,
          });
          return await downloadProtectedFile(data.downloadUrl, `${product.slug}.xlsx`);
        }
        if (res.status === 401) {
          setAuthModalOpen(true);
        }
        showToast({ type: 'error', title: data.error || 'ไม่สามารถดาวน์โหลดได้' });
        return false;
      } catch {
        downloadClientWorkbookFallback(product);
        showToast({
          type: 'success',
          title: 'ดาวน์โหลดไฟล์ Excel สำเร็จ',
          description: product.title,
        });
        return true;
      }
    },
    [downloadProtectedFile, getIdToken, showToast]
  );

  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        if (prev.some((item) => item.id === product.id)) {
          showToast({
            type: 'info',
            title: 'สินค้านี้อยู่ในตะกร้าแล้ว',
            description: product.title,
          });
          return prev;
        }
        showToast({
          type: 'success',
          title: 'เพิ่มลงตะกร้าแล้ว',
          description: product.title,
        });
        return [...prev, product];
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: number) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        showToast({
          type: 'info',
          title: exists ? 'นำออกจากรายการโปรดแล้ว' : 'บันทึกในรายการโปรดแล้ว',
        });
        return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [showToast]
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        darkMode,
        toggleDarkMode,
        firebaseUser,
        dbUser,
        isAdmin,
        authLoading,
        getIdToken,
        loginWithGoogle,
        logout,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        categories,
        uniqueVisitors,
        toasts,
        showToast,
        dismissToast,
        authModalOpen,
        setAuthModalOpen,
        downloadProtectedFile,
        downloadFreeProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
