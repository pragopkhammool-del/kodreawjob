import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingAssistant } from './components/FloatingAssistant';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { SolverPage } from './pages/SolverPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ForumPage } from './pages/ForumPage';
import { WebAppErpPage } from './pages/WebAppErpPage';
import { LearnFormulasPage } from './pages/LearnFormulasPage';
import { WebAppsDemoPage } from './pages/WebAppsDemoPage';
import { ExcelTemplatesLibraryPage } from './pages/ExcelTemplatesLibraryPage';
import { BlogPage } from './pages/BlogPage';
import { GoogleSheetsPage } from './pages/GoogleSheetsPage';
import {
  AboutPage,
  CoffeeSupportPage,
  ContactPage,
  LegalDocumentPage,
  PricingPage,
  SolutionsPage,
} from './pages/InfoPages';

function MainRouter() {
  const { route, setAuthModalOpen } = useApp();
  const pathname = route.split('?')[0] || '/';

  if (pathname === '/' || pathname === '') {
    return <HomePage />;
  }
  if (pathname === '/learn') {
    return <LearnFormulasPage />;
  }
  if (pathname === '/webapps-demo') {
    return <WebAppsDemoPage />;
  }
  if (
    pathname === '/excel-templates' ||
    pathname === '/project-management-templates' ||
    pathname === '/project-templates'
  ) {
    return <ExcelTemplatesLibraryPage />;
  }
  if (pathname === '/google-sheets' || pathname === '/category/google-sheets') {
    return <GoogleSheetsPage />;
  }
  if (pathname === '/coffee') {
    return <CoffeeSupportPage />;
  }
  if (pathname === '/legal/file-license') {
    return <LegalDocumentPage mode="file-license" />;
  }
  if (pathname === '/legal/terms') {
    return <LegalDocumentPage mode="terms" />;
  }
  if (pathname === '/legal/pdpa') {
    return <LegalDocumentPage mode="pdpa" />;
  }
  if (pathname === '/forum') {
    return <ForumPage />;
  }
  if (pathname === '/webapp') {
    return <WebAppErpPage />;
  }
  if (pathname === '/templates') {
    return <CatalogPage />;
  }
  if (pathname.startsWith('/templates/')) {
    const slug = pathname.replace('/templates/', '');
    return <ProductDetailPage slug={slug} />;
  }
  if (pathname.startsWith('/category/')) {
    const catSlug = pathname.replace('/category/', '');
    return <CatalogPage initialCategory={catSlug} />;
  }
  if (pathname === '/solutions') {
    return <SolutionsPage />;
  }
  if (pathname === '/pricing') {
    return <PricingPage />;
  }
  if (pathname === '/about') {
    return <AboutPage />;
  }
  if (pathname === '/blog') {
    return <BlogPage />;
  }
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '');
    return <BlogPage slug={slug} />;
  }
  if (pathname === '/contact') {
    return <ContactPage />;
  }
  if (pathname === '/solve') {
    return <SolverPage />;
  }
  if (pathname === '/cart') {
    return <CartCheckoutPage mode="cart" />;
  }
  if (pathname === '/checkout') {
    return <CartCheckoutPage mode="checkout" />;
  }
  if (pathname === '/dashboard') {
    return <DashboardPage />;
  }
  if (pathname.startsWith('/download/')) {
    const token = pathname.replace('/download/', '');
    return <DashboardPage lookupToken={token} />;
  }
  if (pathname.startsWith('/admin')) {
    return <AdminPage />;
  }
  if (pathname === '/login' || pathname === '/register') {
    setTimeout(() => setAuthModalOpen(true), 0);
    return <HomePage />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen flex flex-col app-shell-bg bg-[#FFF7ED] text-[#1E1B18] dark:bg-[#14100E] dark:text-orange-50 transition-colors">
          <Navbar />
          <main className="flex-1">
            <MainRouter />
          </main>
          <Footer />
          <FloatingAssistant />
          <ToastContainer />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}
