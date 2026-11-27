import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  FileText,
  Lightbulb,
  MessageCircle,
  Search,
  Share2,
  TriangleAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ARTICLES_DATA, ArticleItem } from '../data/articlesData';

interface BlogPageProps {
  slug?: string;
}

function ArticleCover({
  src,
  alt,
  className = 'w-full h-56 object-cover',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 dark:from-[#2A201B] dark:to-[#1F1815] text-orange-700 dark:text-orange-300 p-6 ${className}`}
      >
        <FileText className="w-10 h-10 mb-2 opacity-80" />
        <span className="text-xs font-medium text-center line-clamp-2 max-w-xs">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function ArticleDetailView({ article }: { article: ArticleItem }) {
  const { navigate, showToast, trackLinkClick } = useApp();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.slug]);

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${article.slug}`
      : `https://kodraewjob.com/blog/${article.slug}`;

  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}&quote=${encodeURIComponent(article.title)}`;

  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(`${article.title} — กดแล้วจบ`)}`;

  const handleCopyCommand = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCmd(code);
    showToast({ type: 'success', title: 'คัดลอกคำสั่งแล้ว' });
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleCopyArticleUrl = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopiedLink(true);
    showToast({ type: 'success', title: 'คัดลอกลิงก์บทความแล้ว' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const relatedArticles = useMemo(
    () =>
      ARTICLES_DATA.filter((item) => item.slug !== article.slug).slice(0, 4),
    [article.slug]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 text-xs sm:text-sm font-semibold text-[#1E1B18] dark:text-orange-100 hover:border-orange-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          กลับไปหน้าบทความทั้งหมด
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span>{article.section === 'latest' ? 'บทความล่าสุด' : 'บทความแนะนำ'}</span>
          <span aria-hidden="true">·</span>
          <span>{article.category}</span>
        </div>
      </div>

      {/* Main 2-Column Editorial Layout (Article Body 8 cols + Margin Sidebar 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <article className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card">
          <ArticleCover
            src={article.coverImage}
            alt={article.title}
            className="w-full h-56 sm:h-80 object-cover"
          />

          <div className="p-6 sm:p-10 space-y-8">
            {/* Editorial Title Header & Unboxed Metadata */}
            <header className="space-y-4 border-b border-orange-100 dark:border-orange-900/40 pb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {article.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>{article.date}</span>
                <span aria-hidden="true">·</span>
                <span>อ่าน {article.readTime}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{article.views} ครั้ง</span>
                <span aria-hidden="true">·</span>
                <span>โดย {article.author}</span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1E1B18] dark:text-orange-50 leading-snug text-balance">
                {article.title}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-prose">
                {article.summary}
              </p>

              {/* Share Toolbar */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  แชร์บทความนี้:
                </span>
                <a
                  href={fbShareHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackLinkClick(
                      `share-fb-${article.slug}`,
                      `แชร์ Facebook: ${article.title}`,
                      fbShareHref
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  แชร์ Facebook
                </a>
                <a
                  href={lineShareHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackLinkClick(
                      `share-line-${article.slug}`,
                      `แชร์ LINE: ${article.title}`,
                      lineShareHref
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  แชร์ LINE
                </a>
                <button
                  type="button"
                  onClick={handleCopyArticleUrl}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs font-semibold text-[#1E1B18] dark:text-orange-100 hover:border-orange-400 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-orange-600" />
                  )}
                  {copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
                </button>
              </div>
            </header>

            {/* Key Highlights Summary */}
            <section className="rounded-2xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200/80 dark:border-orange-900/40 p-5 space-y-3">
              <h2 className="font-display font-bold text-sm sm:text-base text-[#1E1B18] dark:text-orange-50">
                สิ่งที่คุณจะได้เรียนรู้จากคู่มือนี้
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                {article.highlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono tabular-nums font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{hl}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Full Content Sections */}
            <div className="space-y-10">
              {article.contentSections.map((sec, sIdx) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="space-y-4 scroll-mt-24"
                >
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
                    {sIdx + 1}. {sec.heading}
                  </h2>

                  {sec.paragraphs?.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-prose"
                    >
                      {p}
                    </p>
                  ))}

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-2.5 pl-1 text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-prose">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.table && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {sec.table.caption}
                      </p>
                      <div className="overflow-x-auto rounded-2xl border border-orange-200/80 dark:border-orange-900/40">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-[#FFF7ED] dark:bg-[#2A201B] border-b border-orange-200/80 dark:border-orange-900/40 text-[#1E1B18] dark:text-orange-100">
                            <tr>
                              {sec.table.headers.map((h) => (
                                <th key={h} className="py-3 px-4 font-display font-semibold whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="hover:bg-orange-50/50 dark:hover:bg-[#261D18] transition-colors"
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-3 px-4 align-top leading-relaxed ${
                                      cIdx === 0
                                        ? 'font-semibold text-[#1E1B18] dark:text-orange-100 whitespace-nowrap'
                                        : 'text-stone-700 dark:text-stone-300'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sec.steps && sec.steps.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {sec.steps.map((st) => (
                        <div
                          key={st.stepNumber}
                          className="rounded-2xl bg-[#FFFDF9] dark:bg-[#241C18] border border-orange-200/70 dark:border-orange-900/40 p-5 space-y-2.5"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-mono tabular-nums text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {st.stepNumber}
                            </span>
                            <div className="flex-1 space-y-2 min-w-0">
                              <h3 className="font-display font-bold text-base sm:text-lg text-[#1E1B18] dark:text-orange-50">
                                {st.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                {st.detail}
                              </p>

                              {st.subPoints && st.subPoints.length > 0 && (
                                <ul className="space-y-1.5 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                                  {st.subPoints.map((sp, spIdx) => (
                                    <li key={spIdx} className="flex items-start gap-2 leading-relaxed">
                                      <span className="text-orange-500 font-bold">•</span>
                                      <span>{sp}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {st.command && (
                                <div className="mt-2 rounded-xl bg-[#1E1B18] text-orange-100 p-3.5 relative">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-mono text-stone-400">
                                      Command / Terminal
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCommand(st.command!)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-300 hover:text-orange-200"
                                    >
                                      {copiedCmd === st.command ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                      {copiedCmd === st.command ? 'คัดลอกแล้ว' : 'คัดลอก'}
                                    </button>
                                  </div>
                                  <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                                    {st.command}
                                  </pre>
                                </div>
                              )}

                              {st.tip && (
                                <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{st.tip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.commandBlock && (
                    <div className="rounded-xl bg-[#1E1B18] text-orange-100 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-stone-400">
                          {sec.commandBlock.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(sec.commandBlock!.code)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-300 hover:text-orange-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          คัดลอก
                        </button>
                      </div>
                      <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {sec.commandBlock.code}
                      </pre>
                    </div>
                  )}

                  {sec.callout && (
                    <div
                      className={`rounded-2xl p-5 border flex items-start gap-3 ${
                        sec.callout.variant === 'warning'
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-100'
                          : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-100'
                      }`}
                    >
                      {sec.callout.variant === 'warning' ? (
                        <TriangleAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-sm sm:text-base">
                          {sec.callout.title}
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {sec.callout.body}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Bottom Related Action CTA */}
            {article.relatedAction && (
              <div className="pt-6 border-t border-orange-100 dark:border-orange-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    เครื่องมือและไฟล์พร้อมใช้ที่เกี่ยวข้อง
                  </p>
                  <p className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                    {article.relatedAction.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(article.relatedAction!.path)}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
                >
                  เปิดใช้งานทันที
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Right Margin Sidebar (Table of Contents + Related Articles) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card space-y-3">
            <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
              สารบัญเนื้อหาในหน้านี้
            </h3>
            <nav className="space-y-2">
              {article.contentSections.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block text-xs sm:text-sm text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors leading-snug"
                >
                  <span className="font-mono tabular-nums text-orange-500 mr-1.5">
                    0{idx + 1}.
                  </span>
                  {sec.heading}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                บทความอื่นที่น่าสนใจ
              </h3>
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                ดูทั้งหมด
              </button>
            </div>
            <div className="divide-y divide-orange-100 dark:divide-orange-900/30">
              {relatedArticles.map((rel) => (
                <button
                  key={rel.slug}
                  type="button"
                  onClick={() => navigate(`/blog/${rel.slug}`)}
                  className="w-full text-left py-3 first:pt-0 last:pb-0 group space-y-1"
                >
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {rel.category} · {rel.readTime}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#1E1B18] dark:text-orange-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    {rel.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BlogPage({ slug }: BlogPageProps) {
  const { navigate } = useApp();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'latest' | 'recommended'>('all');

  if (slug) {
    const found = ARTICLES_DATA.find((a) => a.slug === slug);
    if (found) {
      return <ArticleDetailView article={found} />;
    }
  }

  const normalizedQuery = search.trim().toLowerCase();

  const matchesQuery = (item: ArticleItem) => {
    if (!normalizedQuery) return true;
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.summary.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery)
    );
  };

  const latestArticles = ARTICLES_DATA.filter(
    (a) => a.section === 'latest' && matchesQuery(a)
  );
  const recommendedArticles = ARTICLES_DATA.filter(
    (a) => a.section === 'recommended' && matchesQuery(a)
  );

  const showLatest = sectionFilter === 'all' || sectionFilter === 'latest';
  const showRecommended = sectionFilter === 'all' || sectionFilter === 'recommended';

  const leadArticle = latestArticles[0];
  const secondaryLatest = latestArticles.slice(1);

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
      {/* Editorial Hub Header */}
      <header className="space-y-6 border-b border-orange-200/80 dark:border-orange-900/40 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              คลังบทความ &amp; คู่มือสอนทำ Step-by-Step
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#1E1B18] dark:text-orange-50 text-balance">
              บทความเทคนิค IT, Excel, Cloud และ Windows ฉบับสมบูรณ์
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              รวบรวมคู่มือสอนทำจริงทีละขั้นตอน ตั้งแต่งานเอกสาร PDF, ฟอนต์ราชการ, แก้ปัญหา Windows ไปจนถึงการเลือก Server และระบบธุรกิจ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาบทความ (เช่น PDF, Windows 11, NAS)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm text-[#1E1B18] dark:text-orange-50 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Interactive Section Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              sectionFilter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            ทั้งหมด ({ARTICLES_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter('latest')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              sectionFilter === 'latest'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            บทความล่าสุด (4)
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter('recommended')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              sectionFilter === 'recommended'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            บทความแนะนำ (7)
          </button>
        </div>
      </header>

      {/* Empty Search State */}
      {latestArticles.length === 0 && recommendedArticles.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-10 text-center space-y-3">
          <p className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
            ไม่พบบทความที่ตรงกับคำค้นหา "{search}"
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSectionFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold"
          >
            แสดงบทความทั้งหมด
          </button>
        </div>
      )}

      {/* SECTION 1: บทความล่าสุด */}
      {showLatest && latestArticles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-orange-200/70 dark:border-orange-900/40 pb-3">
            <h2 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50">
              บทความล่าสุด
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
              {latestArticles.length} บทความ
            </span>
          </div>

          {/* Lead Story */}
          {leadArticle && (
            <article
              onClick={() => navigate(`/blog/${leadArticle.slug}`)}
              className="cursor-pointer group rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card grid grid-cols-1 lg:grid-cols-12 items-stretch hover:border-orange-400 transition-colors"
            >
              <div className="lg:col-span-6 overflow-hidden">
                <ArticleCover
                  src={leadArticle.coverImage}
                  alt={leadArticle.title}
                  className="w-full h-60 lg:h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {leadArticle.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{leadArticle.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>อ่าน {leadArticle.readTime}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{leadArticle.views} อ่าน</span>
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                    {leadArticle.title}
                  </h3>

                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                    {leadArticle.summary}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-orange-100 dark:border-orange-900/30">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
                    อ่านคู่มือฉบับเต็ม
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Latest Cards - 4 Columns on Full Screen */}
          {secondaryLatest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {secondaryLatest.map((art) => (
                <article
                  key={art.slug}
                  onClick={() => navigate(`/blog/${art.slug}`)}
                  className="cursor-pointer group rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card flex flex-col justify-between hover:border-orange-400 transition-colors"
                >
                  <div>
                    <div className="overflow-hidden">
                      <ArticleCover
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {art.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>อ่าน {art.readTime}</span>
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#1E1B18] dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-orange-100 dark:border-orange-900/30 flex items-center justify-between text-xs">
                    <span className="text-stone-400 tabular-nums">{art.views} อ่าน</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1">
                      อ่านต่อ
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: บทความแนะนำ */}
      {showRecommended && recommendedArticles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-orange-200/70 dark:border-orange-900/40 pb-3">
            <h2 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50">
              บทความแนะนำ
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
              {recommendedArticles.length} บทความ
            </span>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 divide-y divide-orange-100 dark:divide-orange-900/30 soft-card">
            {recommendedArticles.map((art, idx) => (
              <article
                key={art.slug}
                onClick={() => navigate(`/blog/${art.slug}`)}
                className="cursor-pointer group p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-orange-50/60 dark:hover:bg-[#261D18] transition-colors first:rounded-t-3xl last:rounded-b-3xl"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="font-mono tabular-nums text-sm font-bold text-orange-500 pt-1 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {art.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{art.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>อ่าน {art.readTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{art.views} อ่าน</span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#1E1B18] dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed max-w-3xl">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-8 md:pl-0">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs font-semibold text-orange-700 dark:text-orange-300 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors whitespace-nowrap">
                    อ่านคู่มือสอนทำ
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
