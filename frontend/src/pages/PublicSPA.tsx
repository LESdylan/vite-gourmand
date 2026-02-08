/**
 * PublicSPA - Single Page Application for public-facing website
 * 
 * This component handles all public pages (Home, Menus, Contact, Legal)
 * using internal state navigation to maintain SPA efficiency.
 * Smooth transitions between pages give the impression of content changing
 * rather than navigating to a new page.
 */
import { useState, useRef } from 'react';
import HomePage from './Home';
import MenusPage from './Menus';
import ContactPage from './Contact';
import LegalPage from './LegalPage';
import Navbar, { type Page, type UserType } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

interface PublicSPAProps {
  user?: UserType | null;
  onLogout?: () => void;
}

export default function PublicSPA({ user = null, onLogout }: PublicSPAProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedPage, setDisplayedPage] = useState<Page>('home');
  const mainRef = useRef<HTMLElement>(null);

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

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Navigation - always visible, fixed position */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        user={user}
        onLogout={onLogout}
      />
      
      {/* Main content with smooth transition */}
      <main 
        ref={mainRef}
        className={`transition-opacity duration-150 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        } ${currentPage === 'home' ? '' : 'pt-14 sm:pt-16'}`}
      >
        {renderPage()}
      </main>
    </div>
  );
}
