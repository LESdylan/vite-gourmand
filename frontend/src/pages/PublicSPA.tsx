/**
 * PublicSPA - Single Page Application for public-facing website
 * 
 * This component handles all public pages (Home, Menus, Contact, Legal)
 * using internal state navigation to maintain SPA efficiency.
 * 
 * The admin/dashboard routes remain separate and are handled by React Router.
 */
import { useState } from 'react';
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

  // Render the current page content based on internal navigation state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      
      case 'menu':
        return (
          <>
            <MenusPage setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </>
        );
      
      case 'contact':
        return (
          <>
            <ContactPage />
            <Footer setCurrentPage={setCurrentPage} />
          </>
        );
      
      case 'legal-mentions':
        return (
          <>
            <LegalPage section="mentions" setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </>
        );
      
      case 'legal-cgv':
        return (
          <>
            <LegalPage section="cgv" setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </>
        );
      
      case 'user-profile':
        // For now, redirect to dashboard for user profile
        // In future, could add a dedicated user profile page here
        window.location.href = '/dashboard';
        return null;
      
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - always visible */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={onLogout}
      />
      
      {/* Main content - changes based on currentPage */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
