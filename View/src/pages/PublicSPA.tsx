/**
 * PublicSPA - Single Page Application for public-facing website
 *
 * This component handles all public pages (Home, Menus, Contact, Legal)
 * using internal state navigation to maintain SPA efficiency.
 * Smooth transitions between pages give the impression of content changing
 * rather than navigating to a new page.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import HomePage from './Home';
import MenusPage from './Menus';
import ContactPage from './Contact';
import LegalPage from './LegalPage';
import OrderPage from './OrderPage';
import Navbar, { type Page, type UserType } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PromoBanner from '../components/layout/PromoBanner';
import NotificationPanel from '../components/layout/NotificationPanel';
import { AiAssistantWidget } from '../components/ui/AiAssistantWidget';
import { PublicDataProvider } from '../contexts/PublicDataContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fetchActivePromotions, type ActivePromotion } from '../services/public';
import { confirmNewsletter, unsubscribeNewsletter } from '../services/newsletter';

interface PublicSPAProps {
  user?: UserType | null;
  onLogout?: () => void;
}

/** Redirect component to avoid side-effects during render */
function RedirectToDashboard() {
  useEffect(() => {
    window.location.href = '/dashboard';
  }, []);
  return null;
}

export default function PublicSPA({ user = null, onLogout }: PublicSPAProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedPage, setDisplayedPage] = useState<Page>('home');
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [orderMenuId, setOrderMenuId] = useState<number | null>(null);
  const [newsletterMsg, setNewsletterMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const currentPageRef = useRef<Page>('home');

  // Handle newsletter confirm/unsubscribe from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('newsletter');
    const token = params.get('token');

    if (!action || !token) return;

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    if (action === 'confirm') {
      confirmNewsletter(token)
        .then((res) => setNewsletterMsg({ type: 'success', text: res.message }))
        .catch(() => setNewsletterMsg({ type: 'error', text: 'Token invalide ou expiré.' }));
    } else if (action === 'unsubscribe') {
      unsubscribeNewsletter(token)
        .then((res) => setNewsletterMsg({ type: 'success', text: res.message }))
        .catch(() => setNewsletterMsg({ type: 'error', text: 'Token invalide.' }));
    }
  }, []);

  // Auto-dismiss newsletter message after 8 seconds
  useEffect(() => {
    if (!newsletterMsg) return;
    const timer = setTimeout(() => setNewsletterMsg(null), 8000);
    return () => clearTimeout(timer);
  }, [newsletterMsg]);

  const handleBannerHeightChange = useCallback((h: number) => {
    setBannerHeight(h);
  }, []);

  const handleBannerDismiss = useCallback(() => {
    setBannerHeight(0);
  }, []);

  // Fetch active promotions on mount (lightweight, only 1 call)
  useEffect(() => {
    fetchActivePromotions()
      .then(setPromotions)
      .catch(() => setPromotions([]));
  }, []);

  // Smooth page transition: fade out → switch → fade in
  const handlePageChange = useCallback((newPage: Page) => {
    if (newPage === currentPageRef.current) return;
    currentPageRef.current = newPage;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setDisplayedPage(newPage);
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);
  }, []);

  // Handler for ordering from menus page
  const handleOrderMenu = useCallback(
    (menuId: number) => {
      setOrderMenuId(menuId);
      handlePageChange('order');
    },
    [handlePageChange],
  );

  // Render the current page content based on internal navigation state
  const renderPage = () => {
    switch (displayedPage) {
      case 'home':
        return <HomePage setCurrentPage={handlePageChange} />;

      case 'menu':
        return (
          <>
            <MenusPage setCurrentPage={handlePageChange} onOrderMenu={handleOrderMenu} />
            <Footer setCurrentPage={handlePageChange} />
          </>
        );

      case 'order':
        return (
          <>
            <OrderPage setCurrentPage={handlePageChange} preSelectedMenuId={orderMenuId} />
            <Footer setCurrentPage={handlePageChange} />
          </>
        );

      case 'contact':
        return (
          <>
            <ContactPage />
            <Footer setCurrentPage={handlePageChange} />
          </>
        );

      case 'legal-mentions':
        return (
          <>
            <LegalPage section="mentions" setCurrentPage={handlePageChange} />
            <Footer setCurrentPage={handlePageChange} />
          </>
        );

      case 'legal-cgv':
        return (
          <>
            <LegalPage section="cgv" setCurrentPage={handlePageChange} />
            <Footer setCurrentPage={handlePageChange} />
          </>
        );

      case 'user-profile':
        return <RedirectToDashboard />;

      default:
        return <HomePage setCurrentPage={handlePageChange} />;
    }
  };

  // Total fixed header height = banner + navbar (h-14 = 56px, sm:h-16 = 64px)
  const navHeight = 56; // matches h-14, sm uses 64 but 56 is safe minimum

  return (
    <NotificationProvider>
      <PublicDataProvider>
        <div className="min-h-screen bg-[#FFF8F0]">
          {/* Promotional banner — fixed at very top */}
          <PromoBanner
            promotions={promotions}
            onDismiss={handleBannerDismiss}
            onHeightChange={handleBannerHeightChange}
          />

          {/* Navigation — fixed, sits right below the banner */}
          <Navbar
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            user={user}
            onLogout={onLogout}
            topOffset={bannerHeight}
          />

          {/* Floating notification panel — below navbar */}
          <NotificationPanel topOffset={bannerHeight + navHeight} />

          {/* Main content with smooth transition */}
          <main
            ref={mainRef}
            className={`transition-opacity duration-150 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            style={
              currentPage !== 'home' ? { paddingTop: `${bannerHeight + navHeight}px` } : undefined
            }
          >
            {renderPage()}
          </main>

          {/* Floating AI Assistant — show on all pages except contact (which has its own AI chat) */}
          {currentPage !== 'contact' && (
            <AiAssistantWidget
              pageContext={
                currentPage === 'menu' ? 'menu' : currentPage === 'order' ? 'order' : 'home'
              }
              onNavigateToContact={() => handlePageChange('contact')}
            />
          )}

          {/* Newsletter confirmation/unsubscribe toast */}
          {newsletterMsg && (
            <div
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90vw] px-5 py-4 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 transition-all duration-300 ${
                newsletterMsg.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span>{newsletterMsg.type === 'success' ? '✅' : '❌'}</span>
              <span className="flex-1">{newsletterMsg.text}</span>
              <button
                onClick={() => setNewsletterMsg(null)}
                className="text-white/70 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </PublicDataProvider>
    </NotificationProvider>
  );
}
