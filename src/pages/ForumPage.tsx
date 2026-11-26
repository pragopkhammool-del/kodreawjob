import React, { useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BookOpen,
  Check,
  Heart,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  Mic,
  Plus,
  Send,
  ShieldCheck,
  Smile,
  Square,
  ThumbsUp,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const FORUM_BANNER = '/src/assets/images/forum_community_banner_1795678106886.jpg';
const BRAND_BANNER =
  '/assets/aistudio/810659720_983970528045836_3360242927367859030_n_fcb7cbf0.png';

type ForumTab = 'feed' | 'pages' | 'groups' | 'messenger';
type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad';

interface ForumProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}

interface ForumPageItem {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: string;
  description?: string;
  coverImage?: string;
  createdAt?: any;
}

interface ForumGroupItem {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  privacy: 'public' | 'members';
  description?: string;
  createdAt?: any;
}

interface ForumPostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  contextType: 'feed' | 'page' | 'group';
  contextId?: string;
  contextName?: string;
  likesCount: number;
  commentsCount: number;
  createdAt?: any;
}

interface ForumCommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt?: any;
}

interface ConversationItem {
  id: string;
  participantA: string;
  participantB: string;
  participantAName: string;
  participantBName: string;
  lastMessage?: string;
  updatedAt?: any;
}

interface DirectMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt?: any;
}

const REACTIONS: Array<{ type: ReactionType; emoji: string; label: string; color: string }> = [
  { type: 'like', emoji: '👍', label: 'ถูกใจ', color: 'text-orange-600 dark:text-orange-400' },
  { type: 'love', emoji: '❤️', label: 'รักเลย', color: 'text-rose-600 dark:text-rose-400' },
  { type: 'haha', emoji: '😆', label: 'ฮ่าๆ', color: 'text-amber-600 dark:text-amber-400' },
  { type: 'wow', emoji: '😮', label: 'ว้าว', color: 'text-amber-500' },
  { type: 'sad', emoji: '😢', label: 'เศร้า', color: 'text-sky-600 dark:text-sky-400' },
];

function formatTimestamp(ts: any): string {
  if (!ts) return 'เมื่อสักครู่';
  try {
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return date.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'เมื่อสักครู่';
  }
}

function PostCard({
  post,
  currentUid,
  currentName,
  currentAvatar,
  isAdmin,
  onRequireAuth,
  onToast,
}: {
  post: ForumPostItem;
  currentUid: string | null;
  currentName: string;
  currentAvatar?: string;
  isAdmin: boolean;
  onRequireAuth: () => void;
  onToast: (t: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}) {
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ForumCommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Subscribe to post reactions
  useEffect(() => {
    const q = query(collection(db, 'posts', post.id, 'reactions'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const counts: Record<string, number> = {};
        let mine: ReactionType | null = null;
        snap.forEach((d) => {
          const data = d.data();
          const t = data.type as ReactionType;
          counts[t] = (counts[t] || 0) + 1;
          if (currentUid && d.id === currentUid) {
            mine = t;
          }
        });
        setReactionCounts(counts);
        setMyReaction(mine);
      },
      (err) => {
        console.warn('Reactions listener error:', err);
      }
    );
    return () => unsub();
  }, [post.id, currentUid]);

  // Subscribe to comments when expanded
  useEffect(() => {
    if (!commentsOpen) return;
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ForumCommentItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ForumCommentItem, 'id'>),
        }));
        setComments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `posts/${post.id}/comments`)
    );
    return () => unsub();
  }, [commentsOpen, post.id]);

  const handleReact = async (type: ReactionType) => {
    if (!currentUid) {
      onRequireAuth();
      return;
    }
    setShowReactionPicker(false);
    const reactRef = doc(db, 'posts', post.id, 'reactions', currentUid);
    const postRef = doc(db, 'posts', post.id);
    try {
      if (myReaction === type) {
        await deleteDoc(reactRef);
        await updateDoc(postRef, { likesCount: Math.max(0, post.likesCount - 1) });
      } else if (myReaction) {
        await updateDoc(reactRef, { type });
      } else {
        await setDoc(reactRef, {
          userId: currentUid,
          type,
          createdAt: serverTimestamp(),
        });
        await updateDoc(postRef, { likesCount: increment(1) });
      }
    } catch (error) {
      onToast({ type: 'error', title: 'ไม่สามารถแสดงความรู้สึกได้ กรุณาลองใหม่' });
      console.error(error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUid) {
      onRequireAuth();
      return;
    }
    const text = commentText.trim();
    if (!text) return;
    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        authorId: currentUid,
        authorName: currentName.slice(0, 120),
        ...(currentAvatar ? { authorAvatar: currentAvatar.slice(0, 512) } : {}),
        text: text.slice(0, 1500),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', post.id), {
        commentsCount: increment(1),
      });
      setCommentText('');
      setCommentsOpen(true);
    } catch (error) {
      onToast({ type: 'error', title: 'ไม่สามารถส่งความคิดเห็นได้' });
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      onToast({ type: 'info', title: 'ลบโพสต์เรียบร้อยแล้ว' });
    } catch {
      onToast({ type: 'error', title: 'ไม่มีสิทธิ์ลบโพสต์นี้' });
    }
  };

  const activeReactionMeta = REACTIONS.find((r) => r.type === myReaction);
  const totalReacts = Object.values(reactionCounts).reduce((a, b) => a + b, 0) || post.likesCount;

  return (
    <article className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 soft-card overflow-visible">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-orange-300 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-display font-bold flex items-center justify-center shrink-0">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 truncate">
                {post.authorName}
              </p>
              {post.contextType !== 'feed' && post.contextName && (
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  · ใน{post.contextType === 'page' ? 'เพจ' : 'กลุ่ม'} {post.contextName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </div>

        {(currentUid === post.authorId || isAdmin) && (
          <button
            onClick={handleDeletePost}
            aria-label="ลบโพสต์"
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      {post.content && (
        <div className="px-4 sm:px-5 pb-3 text-sm sm:text-[15px] text-[#1E1B18] dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>
      )}

      {post.imageUrl && (
        <div className="bg-orange-50/50 dark:bg-black/20 border-y border-orange-100 dark:border-orange-900/30">
          <img
            src={post.imageUrl}
            alt="รูปประกอบโพสต์"
            loading="lazy"
            className="w-full max-h-[460px] object-contain mx-auto"
          />
        </div>
      )}

      {post.audioUrl && (
        <div className="px-4 sm:px-5 pb-3 pt-1">
          <div className="rounded-xl bg-orange-50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 p-3 flex items-center gap-3">
            <Mic className="w-4 h-4 text-orange-600 shrink-0" />
            <audio controls src={post.audioUrl} className="w-full h-9" />
          </div>
        </div>
      )}

      {/* Reaction Summary */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-orange-100/80 dark:border-orange-900/30">
        <div className="flex items-center gap-1.5">
          {Object.entries(reactionCounts).map(([t, c]) => {
            const meta = REACTIONS.find((r) => r.type === t);
            return meta && c > 0 ? <span key={t}>{meta.emoji}</span> : null;
          })}
          <span className="tabular-nums">
            {totalReacts > 0 ? `${totalReacts} ความรู้สึก` : 'ยังไม่มีการกดความรู้สึก'}
          </span>
        </div>
        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className="hover:underline tabular-nums"
        >
          {post.commentsCount} ความคิดเห็น
        </button>
      </div>

      {/* Action Bar */}
      <div className="px-2 sm:px-4 py-1.5 border-t border-orange-100 dark:border-orange-900/30 grid grid-cols-2 gap-1 relative">
        <div
          className="relative"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {showReactionPicker && (
            <div className="absolute bottom-full left-2 mb-1 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-[#2A201B] border border-orange-200 dark:border-orange-800 shadow-xl">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => handleReact(r.type)}
                  title={r.label}
                  className="text-xl hover:scale-125 transition-transform px-1"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleReact(myReaction || 'like')}
            className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors ${
              activeReactionMeta
                ? activeReactionMeta.color
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            {activeReactionMeta ? (
              <span className="text-base">{activeReactionMeta.emoji}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>{activeReactionMeta ? activeReactionMeta.label : 'ถูกใจ'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="w-full py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>แสดงความคิดเห็น</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {commentsOpen && (
        <div className="px-4 sm:px-5 py-4 border-t border-orange-100 dark:border-orange-900/30 bg-[#FFF7ED]/70 dark:bg-[#17120F] space-y-3 rounded-b-2xl">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                currentUid
                  ? 'เขียนความคิดเห็นของคุณ...'
                  : 'เข้าสู่ระบบด้วย Gmail เพื่อแสดงความคิดเห็น'
              }
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#261E1A] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shrink-0"
            >
              ส่ง
            </button>
          </form>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-2">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่ร่วมพูดคุยได้เลยครับ
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  {c.authorAvatar ? (
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">
                      {c.authorName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 rounded-2xl bg-white dark:bg-[#261E1A] border border-orange-100 dark:border-orange-900/40 px-3.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-semibold text-xs text-[#1E1B18] dark:text-orange-100">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatTimestamp(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-0.5">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function ForumPage() {
  const {
    firebaseUser,
    dbUser,
    isAdmin,
    getIdToken,
    setAuthModalOpen,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<ForumTab>('feed');
  const [posts, setPosts] = useState<ForumPostItem[]>([]);
  const [pages, setPages] = useState<ForumPageItem[]>([]);
  const [groups, setGroups] = useState<ForumGroupItem[]>([]);
  const [profiles, setProfiles] = useState<ForumProfile[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [selectedContext, setSelectedContext] = useState<{
    type: 'feed' | 'page' | 'group';
    id?: string;
    name?: string;
  }>({ type: 'feed' });

  // Post Composer state
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [postAudioUrl, setPostAudioUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Voice Recorder state
  const [recordingFor, setRecordingFor] = useState<'post' | 'dm' | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Create Page / Group modals
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pageCategory, setPageCategory] = useState('Excel & ธุรกิจ SME');
  const [pageDesc, setPageDesc] = useState('');

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupPrivacy, setGroupPrivacy] = useState<'public' | 'members'>('public');
  const [groupDesc, setGroupDesc] = useState('');

  // Messenger state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessageItem[]>([]);
  const [dmText, setDmText] = useState('');
  const [dmImageUrl, setDmImageUrl] = useState<string | null>(null);
  const [dmAudioUrl, setDmAudioUrl] = useState<string | null>(null);

  const currentUid = firebaseUser?.uid || null;
  const currentName =
    dbUser?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'สมาชิก กดแล้วจบ';
  const currentAvatar = dbUser?.avatar || firebaseUser?.photoURL || undefined;

  // Listen to Posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ForumPostItem, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'posts')
    );
    return () => unsub();
  }, []);

  // Listen to Pages & Groups
  useEffect(() => {
    const unsubPages = onSnapshot(
      query(collection(db, 'pages'), orderBy('createdAt', 'desc')),
      (snap) => {
        setPages(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ForumPageItem, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'pages')
    );

    const unsubGroups = onSnapshot(
      query(collection(db, 'groups'), orderBy('createdAt', 'desc')),
      (snap) => {
        setGroups(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ForumGroupItem, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'groups')
    );

    return () => {
      unsubPages();
      unsubGroups();
    };
  }, []);

  // Listen to Profiles & Conversations when signed in
  useEffect(() => {
    if (!currentUid) {
      setProfiles([]);
      setConversations([]);
      return;
    }

    const unsubProfiles = onSnapshot(
      collection(db, 'profiles'),
      (snap) => {
        setProfiles(
          snap.docs
            .map((d) => d.data() as ForumProfile)
            .filter((p) => p.uid !== currentUid)
        );
      },
      (err) => console.warn('Profiles list error:', err)
    );

    // Must match firestore.rules list rule: participantA == uid || participantB == uid
    const convQuery = query(
      collection(db, 'conversations'),
      or(where('participantA', '==', currentUid), where('participantB', '==', currentUid))
    );

    const unsubConvs = onSnapshot(
      convQuery,
      (snap) => {
        const list: ConversationItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ConversationItem, 'id'>),
        }));
        list.sort((a, b) => {
          const tA = a.updatedAt?.toMillis?.() || 0;
          const tB = b.updatedAt?.toMillis?.() || 0;
          return tB - tA;
        });
        setConversations(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'conversations')
    );

    return () => {
      unsubProfiles();
      unsubConvs();
    };
  }, [currentUid]);

  // Check group memberships for current user
  useEffect(() => {
    if (!currentUid || groups.length === 0) {
      setJoinedGroupIds(new Set());
      return;
    }
    let cancelled = false;
    Promise.all(
      groups.map(async (g) => {
        try {
          const snap = await getDoc(doc(db, 'groups', g.id, 'members', currentUid));
          return snap.exists() ? g.id : null;
        } catch {
          return null;
        }
      })
    ).then((ids) => {
      if (!cancelled) {
        setJoinedGroupIds(new Set(ids.filter(Boolean) as string[]));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentUid, groups]);

  // Listen to Active Conversation Messages
  useEffect(() => {
    if (!activeConv || !currentUid) {
      setDmMessages([]);
      return;
    }
    const q = query(
      collection(db, 'conversations', activeConv.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDmMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<DirectMessageItem, 'id'>),
          }))
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `conversations/${activeConv.id}/messages`)
    );
    return () => unsub();
  }, [activeConv, currentUid]);

  const uploadCommunityMedia = async (file: File): Promise<string | null> => {
    const token = await getIdToken();
    if (!token) {
      setAuthModalOpen(true);
      return null;
    }
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/community/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url as string;
      }
      showToast({ type: 'error', title: data.error || 'อัปโหลดไฟล์ไม่สำเร็จ' });
      return null;
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถอัปโหลดสื่อได้' });
      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  const startVoiceRecording = async (target: 'post' | 'dm') => {
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast({
        type: 'error',
        title: 'เบราว์เซอร์ไม่รองรับการอัดเสียงสด',
        description: 'คุณสามารถกดอัปโหลดไฟล์เสียง (.mp3 / .wav) แทนได้ครับ',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRecordSeconds(0);
        setRecordingFor(null);
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const voiceFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        const url = await uploadCommunityMedia(voiceFile);
        if (url) {
          if (target === 'post') setPostAudioUrl(url);
          else setDmAudioUrl(url);
          showToast({ type: 'success', title: 'บันทึกเสียงเรียบร้อยแล้ว' });
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingFor(target);
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      showToast({
        type: 'error',
        title: 'ไม่สามารถเข้าถึงไมโครโฟนได้',
        description: 'กรุณาอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์',
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    if (!postContent.trim() && !postImageUrl && !postAudioUrl) {
      showToast({ type: 'info', title: 'กรุณาพิมพ์ข้อความ แนบรูปภาพ หรืออัดเสียงก่อนโพสต์' });
      return;
    }
    setPublishing(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: currentUid,
        authorName: currentName.slice(0, 120),
        ...(currentAvatar ? { authorAvatar: currentAvatar.slice(0, 512) } : {}),
        content: postContent.trim().slice(0, 4000),
        ...(postImageUrl ? { imageUrl: postImageUrl.slice(0, 512) } : {}),
        ...(postAudioUrl ? { audioUrl: postAudioUrl.slice(0, 512) } : {}),
        contextType: selectedContext.type,
        ...(selectedContext.id ? { contextId: selectedContext.id.slice(0, 128) } : {}),
        ...(selectedContext.name ? { contextName: selectedContext.name.slice(0, 120) } : {}),
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setPostContent('');
      setPostImageUrl(null);
      setPostAudioUrl(null);
      showToast({ type: 'success', title: 'เผยแพร่โพสต์เรียบร้อยแล้ว' });
    } catch (error) {
      showToast({ type: 'error', title: 'ไม่สามารถโพสต์ได้ กรุณาลองใหม่' });
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const ref = await addDoc(collection(db, 'pages'), {
        ownerId: currentUid,
        ownerName: currentName.slice(0, 120),
        name: pageName.trim().slice(0, 100),
        category: pageCategory.trim().slice(0, 60),
        ...(pageDesc.trim() ? { description: pageDesc.trim().slice(0, 500) } : {}),
        createdAt: serverTimestamp(),
      });
      setCreatePageOpen(false);
      setPageName('');
      setPageDesc('');
      setSelectedContext({ type: 'page', id: ref.id, name: pageName.trim() });
      setTab('feed');
      showToast({ type: 'success', title: 'สร้างเพจเรียบร้อยแล้ว' });
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถสร้างเพจได้' });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const ref = await addDoc(collection(db, 'groups'), {
        ownerId: currentUid,
        ownerName: currentName.slice(0, 120),
        name: groupName.trim().slice(0, 100),
        privacy: groupPrivacy,
        ...(groupDesc.trim() ? { description: groupDesc.trim().slice(0, 500) } : {}),
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'groups', ref.id, 'members', currentUid), {
        uid: currentUid,
        displayName: currentName.slice(0, 120),
        joinedAt: serverTimestamp(),
      });
      setCreateGroupOpen(false);
      setGroupName('');
      setGroupDesc('');
      setSelectedContext({ type: 'group', id: ref.id, name: groupName.trim() });
      setTab('feed');
      showToast({ type: 'success', title: 'สร้างกลุ่มชุมชนเรียบร้อยแล้ว' });
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถสร้างกลุ่มได้' });
    }
  };

  const handleJoinGroup = async (g: ForumGroupItem) => {
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    const memberRef = doc(db, 'groups', g.id, 'members', currentUid);
    try {
      if (joinedGroupIds.has(g.id)) {
        await deleteDoc(memberRef);
        setJoinedGroupIds((prev) => {
          const next = new Set(prev);
          next.delete(g.id);
          return next;
        });
        showToast({ type: 'info', title: `ออกจากกลุ่ม ${g.name} แล้ว` });
      } else {
        await setDoc(memberRef, {
          uid: currentUid,
          displayName: currentName.slice(0, 120),
          joinedAt: serverTimestamp(),
        });
        setJoinedGroupIds((prev) => new Set(prev).add(g.id));
        showToast({ type: 'success', title: `เข้าร่วมกลุ่ม ${g.name} แล้ว` });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถอัปเดตสมาชิกกลุ่มได้' });
    }
  };

  const startConversationWith = async (target: ForumProfile) => {
    if (!currentUid) {
      setAuthModalOpen(true);
      return;
    }
    const [uidA, uidB] = [currentUid, target.uid].sort();
    const convId = `${uidA}_${uidB}`;
    const convRef = doc(db, 'conversations', convId);
    try {
      const snap = await getDoc(convRef);
      if (!snap.exists()) {
        const nameA = uidA === currentUid ? currentName : target.displayName;
        const nameB = uidB === currentUid ? currentName : target.displayName;
        await setDoc(convRef, {
          participantA: uidA,
          participantB: uidB,
          participantAName: nameA.slice(0, 120),
          participantBName: nameB.slice(0, 120),
          lastMessage: 'เริ่มต้นสนทนา',
          updatedAt: serverTimestamp(),
        });
      }
      const latestSnap = await getDoc(convRef);
      setActiveConv({
        id: latestSnap.id,
        ...(latestSnap.data() as Omit<ConversationItem, 'id'>),
      });
      setTab('messenger');
    } catch (error) {
      showToast({ type: 'error', title: 'ไม่สามารถเปิดห้องแชทได้' });
      console.error(error);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUid || !activeConv) return;
    if (!dmText.trim() && !dmImageUrl && !dmAudioUrl) return;
    const text = dmText.trim();
    const preview = text || (dmImageUrl ? '[ส่งรูปภาพ]' : '[ส่งข้อความเสียง]');
    try {
      await addDoc(collection(db, 'conversations', activeConv.id, 'messages'), {
        senderId: currentUid,
        senderName: currentName.slice(0, 120),
        text: text.slice(0, 2000),
        ...(dmImageUrl ? { imageUrl: dmImageUrl.slice(0, 512) } : {}),
        ...(dmAudioUrl ? { audioUrl: dmAudioUrl.slice(0, 512) } : {}),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', activeConv.id), {
        lastMessage: preview.slice(0, 500),
        updatedAt: serverTimestamp(),
      });
      setDmText('');
      setDmImageUrl(null);
      setDmAudioUrl(null);
    } catch {
      showToast({ type: 'error', title: 'ส่งข้อความไม่สำเร็จ' });
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedContext.type === 'feed') return true;
    return p.contextType === selectedContext.type && p.contextId === selectedContext.id;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Facebook-style Community Cover Banner */}
      <section className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card">
        <div className="relative h-44 sm:h-56 lg:h-64 bg-[#1E1B18]">
          <img
            src={FORUM_BANNER}
            alt="ฟอรั่มชุมชน กดแล้วจบ"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B18]/90 via-[#1E1B18]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={BRAND_BANNER}
                alt="กดแล้วจบ"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-400 shadow-lg bg-slate-900"
              />
              <div className="text-white">
                <h1 className="font-display font-bold text-xl sm:text-3xl leading-tight">
                  ฟอรั่มชุมชน กดแล้วจบ
                </h1>
                <p className="text-xs sm:text-sm text-orange-200 mt-0.5">
                  แชร์เทคนิค Excel · โพสต์รูปภาพ/เสียง · สร้างเพจ · สร้างกลุ่ม · แชทส่วนตัว
                </p>
              </div>
            </div>

            {!currentUid ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-lg self-start sm:self-auto"
              >
                เข้าสู่ระบบ Google เพื่อร่วมโพสต์
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCreatePageOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/95 text-[#1E1B18] hover:bg-orange-100 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-600" />
                  สร้างเพจ
                </button>
                <button
                  onClick={() => setCreateGroupOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  สร้างกลุ่ม
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-navigation bar */}
        <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 dark:border-orange-900/40 bg-[#FFF7ED]/60 dark:bg-[#191310]">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'feed', label: 'ฟีดข่าว', icon: Smile },
              { id: 'pages', label: `เพจ (${pages.length})`, icon: BookOpen },
              { id: 'groups', label: `กลุ่ม (${groups.length})`, icon: Users },
              { id: 'messenger', label: 'แชทข้อความ', icon: MessageCircle },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as ForumTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {selectedContext.type !== 'feed' && (
            <button
              onClick={() => setSelectedContext({ type: 'feed' })}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
            >
              กำลังดู: {selectedContext.name} · กลับไปฟีดรวม
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Main 3-Column Facebook Layout */}
      {tab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Rail: Pages & Groups quick jump */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-20">
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 soft-card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                  เพจชุมชน
                </h2>
                <button
                  onClick={() => (currentUid ? setCreatePageOpen(true) : setAuthModalOpen(true))}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  + สร้างเพจ
                </button>
              </div>
              {pages.length === 0 ? (
                <p className="text-xs text-stone-500">ยังไม่มีเพจในขณะนี้</p>
              ) : (
                <div className="space-y-1.5">
                  {pages.slice(0, 6).map((pg) => (
                    <button
                      key={pg.id}
                      onClick={() => setSelectedContext({ type: 'page', id: pg.id, name: pg.name })}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedContext.id === pg.id
                          ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                          : 'hover:bg-orange-50 dark:hover:bg-orange-950/30 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate">{pg.name}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">{pg.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 soft-card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                  กลุ่มแลกเปลี่ยนสูตร
                </h2>
                <button
                  onClick={() => (currentUid ? setCreateGroupOpen(true) : setAuthModalOpen(true))}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  + สร้างกลุ่ม
                </button>
              </div>
              {groups.length === 0 ? (
                <p className="text-xs text-stone-500">ยังไม่มีกลุ่มในขณะนี้</p>
              ) : (
                <div className="space-y-1.5">
                  {groups.slice(0, 6).map((gp) => (
                    <button
                      key={gp.id}
                      onClick={() => setSelectedContext({ type: 'group', id: gp.id, name: gp.name })}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedContext.id === gp.id
                          ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                          : 'hover:bg-orange-50 dark:hover:bg-orange-950/30 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate">{gp.name}</span>
                      {joinedGroupIds.has(gp.id) && (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Center Feed Column */}
          <div className="lg:col-span-6 space-y-5">
            {/* Post Composer */}
            <form
              onSubmit={handlePublishPost}
              className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 sm:p-5 soft-card space-y-3"
            >
              <div className="flex items-start gap-3">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={currentName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-orange-300 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 font-bold flex items-center justify-center shrink-0">
                    {currentName.charAt(0)}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  onFocus={() => {
                    if (!currentUid) setAuthModalOpen(true);
                  }}
                  placeholder={
                    currentUid
                      ? `คุณกำลังคิดอะไรอยู่ ${currentName}? แชร์สูตร Excel หรือสอบถามปัญหาได้เลย...`
                      : 'เข้าสู่ระบบด้วยบัญชี Google / Gmail เพื่อโพสต์ข้อความ รูปภาพ และเสียง'
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {postImageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-orange-200 dark:border-orange-900/50">
                  <img src={postImageUrl} alt="Preview" className="max-h-56 mx-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => setPostImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {postAudioUrl && (
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-[#2A201B] p-2.5 border border-orange-200">
                  <audio controls src={postAudioUrl} className="flex-1 h-8" />
                  <button
                    type="button"
                    onClick={() => setPostAudioUrl(null)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-orange-100 dark:border-orange-900/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] hover:bg-orange-100 text-xs font-semibold text-orange-700 dark:text-orange-300 inline-flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    รูปภาพ
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadCommunityMedia(f);
                          if (url) setPostImageUrl(url);
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] hover:bg-orange-100 text-xs font-semibold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    ไฟล์เสียง
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadCommunityMedia(f);
                          if (url) setPostAudioUrl(url);
                        }
                      }}
                    />
                  </label>

                  {recordingFor === 'post' ? (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      หยุดอัด ({recordSeconds}วิ)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startVoiceRecording('post')}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] hover:bg-orange-100 text-xs font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5"
                    >
                      <Mic className="w-4 h-4" />
                      อัดเสียงพูด
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={publishing || uploadingMedia}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {uploadingMedia ? 'กำลังอัปโหลด...' : publishing ? 'กำลังโพสต์...' : 'โพสต์'}
                </button>
              </div>
            </form>

            {/* Posts Feed */}
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-10 text-center soft-card">
                <p className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                  ยังไม่มีโพสต์ในหน้านี้
                </p>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  เป็นคนแรกที่โพสต์ทักทาย แชร์ภาพหน้าจอ Excel หรือฝากข้อความเสียงได้เลยครับ
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUid={currentUid}
                    currentName={currentName}
                    currentAvatar={currentAvatar}
                    isAdmin={isAdmin}
                    onRequireAuth={() => setAuthModalOpen(true)}
                    onToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Rail: Members & Quick Messenger */}
          <aside className="lg:col-span-3 space-y-5 sticky top-20">
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 soft-card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                  เพื่อนสมาชิก &amp; แชทด่วน
                </h2>
                <button
                  onClick={() => setTab('messenger')}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  เปิดแชท
                </button>
              </div>

              {!currentUid ? (
                <div className="text-xs text-stone-500 space-y-2">
                  <p>เข้าสู่ระบบด้วยบัญชี Google เพื่อดูรายชื่อสมาชิกและส่งข้อความหากันได้ทันที</p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-orange-500 text-white font-semibold"
                  >
                    เข้าสู่ระบบ Google
                  </button>
                </div>
              ) : profiles.length === 0 ? (
                <p className="text-xs text-stone-500">
                  ยังไม่มีสมาชิกท่านอื่นออนไลน์ ชวนเพื่อนเข้าสู่ระบบด้วย Google เพื่อแชทได้เลย
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {profiles.map((prof) => (
                    <div
                      key={prof.uid}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {prof.photoURL ? (
                          <img
                            src={prof.photoURL}
                            alt={prof.displayName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {prof.displayName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-medium text-[#1E1B18] dark:text-orange-50 truncate">
                          {prof.displayName}
                        </span>
                      </div>
                      <button
                        onClick={() => startConversationWith(prof)}
                        className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[11px] font-semibold shrink-0"
                      >
                        ทักแชท
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-[#2A1D15] dark:to-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-400">
                <ShieldCheck className="w-4 h-4" />
                กติกาชุมชน กดแล้วจบ
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                แบ่งปันไฟล์ความรู้ ปรึกษาสูตร Excel / VBA / AppSheet อย่างสุภาพ หากต้องการติดต่อแอดมินด่วนทัก LINE @556fsrdw
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* TAB: PAGES */}
      {tab === 'pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50">
              เพจความรู้และธุรกิจ ({pages.length})
            </h2>
            <button
              onClick={() => (currentUid ? setCreatePageOpen(true) : setAuthModalOpen(true))}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              สร้างเพจใหม่
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map((pg) => (
              <div
                key={pg.id}
                className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                    {pg.category}
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 mt-1">
                    {pg.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">สร้างโดย {pg.ownerName}</p>
                  {pg.description && (
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 line-clamp-3">
                      {pg.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedContext({ type: 'page', id: pg.id, name: pg.name });
                    setTab('feed');
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-500 hover:text-white text-orange-800 dark:text-orange-300 text-xs font-bold transition-colors"
                >
                  เปิดดูโพสต์และโพสต์ในเพจนี้
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GROUPS */}
      {tab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50">
              กลุ่มผู้ใช้งาน ({groups.length})
            </h2>
            <button
              onClick={() => (currentUid ? setCreateGroupOpen(true) : setAuthModalOpen(true))}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              สร้างกลุ่มใหม่
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((gp) => {
              const joined = joinedGroupIds.has(gp.id);
              return (
                <div
                  key={gp.id}
                  className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card flex flex-col justify-between space-y-4"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                      {gp.privacy === 'public' ? 'กลุ่มสาธารณะ' : 'กลุ่มสมาชิก'}
                    </span>
                    <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 mt-1">
                      {gp.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">ผู้ดูแล: {gp.ownerName}</p>
                    {gp.description && (
                      <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 line-clamp-3">
                        {gp.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJoinGroup(gp)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        joined
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {joined ? 'เข้าร่วมแล้ว' : 'เข้าร่วมกลุ่ม'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContext({ type: 'group', id: gp.id, name: gp.name });
                        setTab('feed');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-orange-200 dark:border-orange-800 text-xs font-semibold"
                    >
                      เข้าดูโพสต์
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: MESSENGER (1-to-1 Direct Messages) */}
      {tab === 'messenger' && (
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 soft-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-orange-100 dark:border-orange-900/40 p-4 space-y-4">
            <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
              แชทข้อความส่วนตัว
            </h2>
            {!currentUid ? (
              <div className="space-y-2 text-xs text-stone-500">
                <p>กรุณาเข้าสู่ระบบด้วย Google เพื่อส่งข้อความหากันแบบส่วนตัว</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold"
                >
                  เข้าสู่ระบบ Google
                </button>
              </div>
            ) : (
              <>
                {conversations.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-stone-400">ห้องแชทล่าสุด</p>
                    {conversations.map((conv) => {
                      const peerName =
                        conv.participantA === currentUid
                          ? conv.participantBName
                          : conv.participantAName;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConv(conv)}
                          className={`w-full text-left p-2.5 rounded-xl transition-colors ${
                            activeConv?.id === conv.id
                              ? 'bg-orange-100 dark:bg-orange-950/60'
                              : 'hover:bg-orange-50 dark:hover:bg-orange-950/30'
                          }`}
                        >
                          <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-orange-50 truncate">
                            {peerName}
                          </p>
                          <p className="text-xs text-stone-500 truncate">{conv.lastMessage}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-orange-100 dark:border-orange-900/30">
                  <p className="text-[11px] font-semibold text-stone-400">เริ่มแชทกับสมาชิก</p>
                  {profiles.length === 0 ? (
                    <p className="text-xs text-stone-500">ยังไม่มีสมาชิกอื่นในระบบ</p>
                  ) : (
                    profiles.map((prof) => (
                      <button
                        key={prof.uid}
                        onClick={() => startConversationWith(prof)}
                        className="w-full text-left p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-2.5 text-xs font-medium"
                      >
                        <div className="w-7 h-7 rounded-full bg-orange-200 text-orange-800 font-bold flex items-center justify-center shrink-0">
                          {prof.displayName.charAt(0)}
                        </div>
                        <span className="truncate">{prof.displayName}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-8 flex flex-col">
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500">
                <MessageCircle className="w-10 h-10 text-orange-400 mb-2" />
                <p className="font-display font-semibold text-base text-[#1E1B18] dark:text-orange-50">
                  เลือกสมาชิกทางซ้ายเพื่อเริ่มสนทนา
                </p>
                <p className="text-xs mt-1">ส่งข้อความ รูปภาพ และข้อความเสียงได้แบบเรียลไทม์</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b border-orange-100 dark:border-orange-900/40 font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                  สนทนากับ{' '}
                  {activeConv.participantA === currentUid
                    ? activeConv.participantBName
                    : activeConv.participantAName}
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                  {dmMessages.map((msg) => {
                    const isMine = msg.senderId === currentUid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm space-y-2 ${
                            isMine
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-50 dark:bg-[#2A201B] text-[#1E1B18] dark:text-stone-100'
                          }`}
                        >
                          {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="ภาพในแชท"
                              className="max-h-52 rounded-xl object-contain"
                            />
                          )}
                          {msg.audioUrl && (
                            <audio controls src={msg.audioUrl} className="w-56 h-8" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(dmImageUrl || dmAudioUrl) && (
                  <div className="px-4 py-2 bg-orange-50 dark:bg-[#2A201B] flex items-center gap-3 border-t border-orange-100">
                    {dmImageUrl && (
                      <img src={dmImageUrl} alt="แนบรูป" className="h-12 rounded-lg object-cover" />
                    )}
                    {dmAudioUrl && <audio controls src={dmAudioUrl} className="h-8 flex-1" />}
                    <button
                      type="button"
                      onClick={() => {
                        setDmImageUrl(null);
                        setDmAudioUrl(null);
                      }}
                      className="text-xs text-rose-500"
                    >
                      ลบไฟล์แนบ
                    </button>
                  </div>
                )}

                <form
                  onSubmit={handleSendDirectMessage}
                  className="p-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center gap-2"
                >
                  <label className="p-2 rounded-xl bg-orange-50 dark:bg-[#2A201B] text-orange-600 cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadCommunityMedia(f);
                          if (url) setDmImageUrl(url);
                        }
                      }}
                    />
                  </label>
                  {recordingFor === 'dm' ? (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-2.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      {recordSeconds}วิ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startVoiceRecording('dm')}
                      className="p-2 rounded-xl bg-orange-50 dark:bg-[#2A201B] text-rose-500"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}

                  <input
                    type="text"
                    value={dmText}
                    onChange={(e) => setDmText(e.target.value)}
                    placeholder="พิมพ์ข้อความส่วนตัว..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Page */}
      {createPageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreatePage}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 space-y-4 soft-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                สร้างเพจใหม่
              </h2>
              <button type="button" onClick={() => setCreatePageOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">ชื่อเพจ</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="เช่น รวมสูตรบัญชี SME ไทย"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">หมวดหมู่เพจ</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={60}
                value={pageCategory}
                onChange={(e) => setPageCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">คำอธิบายเพจ</label>
              <textarea
                rows={3}
                maxLength={500}
                value={pageDesc}
                onChange={(e) => setPageDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
            >
              สร้างเพจเลย
            </button>
          </form>
        </div>
      )}

      {/* Modal: Create Group */}
      {createGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreateGroup}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 space-y-4 soft-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                สร้างกลุ่มชุมชนใหม่
              </h2>
              <button type="button" onClick={() => setCreateGroupOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">ชื่อกลุ่ม</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="เช่น ชมรม HR & Payroll ประเทศไทย"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">ความเป็นส่วนตัว</label>
              <select
                value={groupPrivacy}
                onChange={(e) => setGroupPrivacy(e.target.value as 'public' | 'members')}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              >
                <option value="public">สาธารณะ (ทุกคนอ่านโพสต์ได้)</option>
                <option value="members">กลุ่มสมาชิก (สำหรับสมาชิกกลุ่ม)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">คำอธิบายกลุ่ม</label>
              <textarea
                rows={3}
                maxLength={500}
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
            >
              สร้างกลุ่มเลย
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
