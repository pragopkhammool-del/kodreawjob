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
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  downloadClientWorkbookFallback,
  fetchJsonSafe,
  getLocalCategories,
  resolveApiUrl,
} from '../lib/catalogClient';
import {
  Category,
  DbUser,
  Product,
  SiteConfig,
  ThemeConfig,
  ToastMessage,
} from '../types';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  presetId: 'orange-pastel',
  name: 'Orange Light พาสเทล (ค่าเริ่มต้น)',
  primaryColor: '#F97316',
  primaryHover: '#EA580C',
  bgLight: '#FFF7ED',
  surfaceLight: '#FFEDD5',
  darkAccent: '#231915',
};

const DEFAULT_PROMPTPAY_QR = '/assets/aistudio/Untitled_e84a513c.jpg';
const DEFAULT_LINE_QR = '/assets/aistudio/L_556fsrdw_GW_6a59b22f.png';

interface AppContextValue {
  route: string;
  navigate: (to: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  firebaseUser: User | null;
  dbUser: DbUser | null;
  isAdmin: boolean;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
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
  refreshCategories: () => Promise<void>;
  siteConfig: SiteConfig;
  refreshSiteConfig: () => Promise<void>;
  getQrUrl: (code: 'promptpay' | 'line' | string, fallback?: string) => string;
  trackLinkClick: (linkKey: string, label: string, targetUrl: string) => void;
  uniqueVisitors: number;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authDomainError: string | null;
  clearAuthDomainError: () => void;
  loginWithEmail: (name: string, email: string, lineId?: string) => Promise<boolean>;
  downloadProtectedFile: (downloadUrl: string, suggestedFilename?: string) => Promise<boolean>;
  downloadFreeProduct: (product: Product) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | null>(null);

function getOrCreateVisitorToken(): string {
  const key = 'kodraewjob_visitor_id';
  let existing = localStorage.getItem(key);
  const validPattern = /^[a-zA-Z0-9_\-]{8,128}$/;
  if (!existing || !validPattern.test(existing)) {
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
  // Admin passcode JWT/HMAC token kept strictly in JS memory (never localStorage/sessionStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pgVisitors, setPgVisitors] = useState<number>(0);
  const [fsVisitors, setFsVisitors] = useState<number>(0);
  const uniqueVisitors = Math.max(pgVisitors, fsVisitors);
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
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    theme: DEFAULT_THEME_CONFIG,
    qrCodes: [],
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);

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

  const applyThemeToDocument = useCallback((theme: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor || DEFAULT_THEME_CONFIG.primaryColor);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover || DEFAULT_THEME_CONFIG.primaryHover);
    root.style.setProperty('--theme-bg-light', theme.bgLight || DEFAULT_THEME_CONFIG.bgLight);
    root.style.setProperty('--theme-surface-light', theme.surfaceLight || DEFAULT_THEME_CONFIG.surfaceLight);
    root.style.setProperty('--theme-dark-accent', theme.darkAccent || DEFAULT_THEME_CONFIG.darkAccent);
    const isCustom =
      theme.presetId !== 'orange-pastel' ||
      theme.primaryColor.toUpperCase() !== DEFAULT_THEME_CONFIG.primaryColor;
    if (isCustom) {
      root.setAttribute('data-custom-theme', 'true');
    } else {
      root.removeAttribute('data-custom-theme');
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    const res = await fetchJsonSafe<Category[]>('/api/categories');
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      setCategories(res.data);
    } else {
      setCategories(getLocalCategories());
    }
  }, []);

  const refreshSiteConfig = useCallback(async () => {
    const res = await fetchJsonSafe<SiteConfig>('/api/site-config');
    if (res.ok && res.data?.theme) {
      setSiteConfig({
        theme: { ...DEFAULT_THEME_CONFIG, ...res.data.theme },
        qrCodes: Array.isArray(res.data.qrCodes) ? res.data.qrCodes : [],
      });
      applyThemeToDocument({ ...DEFAULT_THEME_CONFIG, ...res.data.theme });
    }
  }, [applyThemeToDocument]);

  const getQrUrl = useCallback(
    (code: 'promptpay' | 'line' | string, fallback?: string): string => {
      const matched = siteConfig.qrCodes.find((q) => q.code === code && q.isActive);
      if (matched?.imageUrl) return resolveApiUrl(matched.imageUrl);
      if (fallback) return fallback;
      if (code === 'promptpay') return DEFAULT_PROMPTPAY_QR;
      if (code === 'line') return DEFAULT_LINE_QR;
      return DEFAULT_PROMPTPAY_QR;
    },
    [siteConfig.qrCodes]
  );

  const trackLinkClick = useCallback((linkKey: string, label: string, targetUrl: string) => {
    try {
      const visitorToken = getOrCreateVisitorToken();
      const payload = JSON.stringify({ linkKey, label, targetUrl, visitorToken });
      const endpoint = resolveApiUrl('/api/analytics/click');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore analytics error
    }
  }, []);

  // Load categories, site config + real-time unique visitor counter (Firestore + Postgres)
  useEffect(() => {
    testFirestoreConnection();
    refreshCategories();
    refreshSiteConfig();

    const visitorToken = getOrCreateVisitorToken();

    // 1. Track on Express + PostgreSQL when backend server is active
    fetchJsonSafe<{ uniqueVisitors?: number }>('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorToken }),
    }).then((res) => {
      if (res.ok && typeof res.data.uniqueVisitors === 'number') {
        setPgVisitors(res.data.uniqueVisitors);
      }
    });

    // 2. Real-time Firestore listener + atomic unique visitor registration (works on Cloudflare Workers too)
    const statsRef = doc(db, 'site_stats', 'visitors');
    const visitorRef = doc(db, 'visitors', visitorToken);

    const unsubscribeStats = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const total = Number(snap.data()?.totalCount || 0);
          if (Number.isFinite(total) && total > 0) {
            setFsVisitors(total);
          }
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'site_stats/visitors');
        } catch {
          // keep fallback Postgres count active
        }
      }
    );

    runTransaction(db, async (tx) => {
      const visitorSnap = await tx.get(visitorRef);
      if (visitorSnap.exists()) {
        const statsSnap = await tx.get(statsRef);
        return statsSnap.exists() ? Number(statsSnap.data()?.totalCount || 0) : 0;
      }

      const statsSnap = await tx.get(statsRef);
      const nextCount = statsSnap.exists() ? Number(statsSnap.data()?.totalCount || 0) + 1 : 1;

      tx.set(visitorRef, {
        visitorId: visitorToken,
        createdAt: serverTimestamp(),
      });

      if (statsSnap.exists()) {
        tx.update(statsRef, {
          totalCount: nextCount,
          lastVisitorId: visitorToken,
          updatedAt: serverTimestamp(),
        });
      } else {
        tx.set(statsRef, {
          totalCount: 1,
          lastVisitorId: visitorToken,
          updatedAt: serverTimestamp(),
        });
      }
      return nextCount;
    })
      .then((count) => {
        if (typeof count === 'number' && count > 0) {
          setFsVisitors(count);
        }
      })
      .catch((err) => {
        try {
          handleFirestoreError(err, OperationType.WRITE, `visitors/${visitorToken}`);
        } catch {
          // keep fallback Postgres count active
        }
      });

    return () => {
      unsubscribeStats();
    };
  }, [refreshCategories, refreshSiteConfig]);

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

  const syncBackendOrClientUser = useCallback(async (user: User, token: string) => {
    const authRes = await fetchJsonSafe<{ user: DbUser; isAdmin: boolean }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (authRes.ok && authRes.data?.user) {
      setDbUser(authRes.data.user);
      setIsAdmin(Boolean(authRes.data.isAdmin));
      return;
    }
    const email = user.email || '';
    setDbUser({
      id: 0,
      uid: user.uid,
      name: user.displayName || email.split('@')[0] || 'สมาชิก กดแล้วจบ',
      email,
      avatar: user.photoURL || null,
      role: email.toLowerCase() === 'pragopkhammool@gmail.com' ? 'admin' : 'user',
    });
    setIsAdmin(email.toLowerCase() === 'pragopkhammool@gmail.com');
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          idTokenRef.current = token;
          await syncBackendOrClientUser(user, token);
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
  }, [syncBackendOrClientUser, syncFirestoreProfile]);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken();
    idTokenRef.current = token;
    return token;
  }, []);

  const clearAuthDomainError = useCallback(() => {
    setAuthDomainError(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setAuthDomainError(null);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      idTokenRef.current = token;
      await syncBackendOrClientUser(result.user, token);
      await syncFirestoreProfile(result.user);
      setAuthModalOpen(false);
      showToast({
        type: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับคุณ ${result.user.displayName || result.user.email}`,
      });
    } catch (error: any) {
      const code = String(error?.code || '');
      if (code === 'auth/unauthorized-domain' || String(error?.message || '').includes('unauthorized-domain')) {
        const host = window.location.hostname || 'kodreawjob.pragopkhammool.workers.dev';
        setAuthDomainError(host);
        setAuthModalOpen(true);
        showToast({
          type: 'error',
          title: 'โดเมนนี้ยังไม่ได้อนุญาตใน Firebase Auth',
          description: `กรุณาเพิ่มโดเมน ${host} ใน Firebase Console → Authentication → Authorized domains`,
        });
        return;
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        showToast({
          type: 'info',
          title: 'ยกเลิกการเข้าสู่ระบบ',
          description: 'คุณได้ปิดหน้าต่างเข้าสู่ระบบ Google ก่อนดำเนินการเสร็จ',
        });
        return;
      }
      if (code === 'auth/popup-blocked') {
        showToast({
          type: 'error',
          title: 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป',
          description: 'กรุณาอนุญาต Popup สำหรับเว็บไซต์นี้แล้วกดเข้าสู่ระบบอีกครั้ง',
        });
        return;
      }
      showToast({
        type: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: error?.message || 'กรุณาอนุญาตป๊อปอัปเบราว์เซอร์แล้วลองใหม่อีกครั้ง',
      });
    }
  }, [showToast, syncBackendOrClientUser, syncFirestoreProfile]);

  const loginWithEmail = useCallback(
    async (name: string, email: string, lineId?: string) => {
      try {
        const res = await fetch('/api/auth/email-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, lineId }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setDbUser(data.user);
          setIsAdmin(Boolean(data.isAdmin));
          localStorage.setItem('kodreawjob_email_token', data.token);
          setAuthModalOpen(false);
          showToast({
            type: 'success',
            title: 'ลงทะเบียนและเข้าสู่ระบบสำเร็จ',
            description: `ยินดีต้อนรับคุณ ${data.user.name} บันทึกรายชื่อลงฐานข้อมูลเรียบร้อย`,
          });
          return true;
        } else {
          showToast({ type: 'error', title: data.error || 'ไม่สามารถลงทะเบียนได้' });
          return false;
        }
      } catch {
        showToast({ type: 'error', title: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
        return false;
      }
    },
    [showToast]
  );

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
        adminToken,
        setAdminToken,
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
        refreshCategories,
        siteConfig,
        refreshSiteConfig,
        getQrUrl,
        trackLinkClick,
        uniqueVisitors,
        toasts,
        showToast,
        dismissToast,
        authModalOpen,
        setAuthModalOpen,
        authDomainError,
        clearAuthDomainError,
        loginWithEmail,
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
