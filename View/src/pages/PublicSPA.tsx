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
import Navbar, { type Page, type UserType } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PromoBanner from '../components/layout/PromoBanner';
import { PublicDataProvider } from '../contexts/PublicDataContext';
import {
  fetchActivePromotions,
  type ActivePromotion,
} from '../services/public';

interface PublicSPAProps {
  user?: UserType | null;
  onLogout?: () => void;
}

export default function PublicSPA({ user = null, onLogout }: PublicSPAProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedPage, setDisplayedPage] = useState<Page>('home');
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [bannerHeight, setBannerHeight] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

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
  const handlePageChange = (newPage: Page) => {
    if (newPage === currentPage) return;
    setIsTransitioning(true);
    // After fade out completes, swap content and fade in
    setTimeout(() => {
      setCurrentPage(newPage);
      setDisplayedPage(newPage);
      window.scrollTo({ top: 0 });
      // Small delay to let new content render, then fade in
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);
  };

  // Render the current page content based on internal navigation state
  const renderPage = () => {
    switch (displayedPage) {
      case 'home':
        return <HomePage setCurrentPage={handlePageChange} />;
      
      case 'menu':
        return (
          <>
            <MenusPage setCurrentPage={handlePageChange} />
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
        window.location.href = '/dashboard';
        return null;
      
      default:
        return <HomePage setCurrentPage={handlePageChange} />;
    }
  };

  // Total fixed header height = banner + navbar (h-14 = 56px, sm:h-16 = 64px)
  const navHeight = 56; // matches h-14, sm uses 64 but 56 is safe minimum

  return (
    <PublicDataProvider>
      <div className="min-h-screen bg-[#FFF8F0]">
        {/* Promotional banner — fixed at very top */}
        <PromoBanner promotions={promotions} onDismiss={handleBannerDismiss} onHeightChange={handleBannerHeightChange} />

        {/* Navigation — fixed, sits right below the banner */}
        <Navbar
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          user={user}
          onLogout={onLogout}
          topOffset={bannerHeight}
        />
        
        {/* Main content with smooth transition */}
        <main 
          ref={mainRef}
          className={`transition-opacity duration-150 ease-in-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={currentPage !== 'home' ? { paddingTop: `${bannerHeight + navHeight}px` } : undefined}
        >
          {renderPage()}
        </main>
      </div>
    </PublicDataProvider>
  );
}
