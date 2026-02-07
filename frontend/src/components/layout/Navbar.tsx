import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, ChefHat, Crown, Briefcase, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Types for navigation
export type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

export type UserType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'user' | 'employee' | 'admin';
};

type NavbarProps = {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user?: UserType | null;
  onLogout?: () => void;
  isDemoMode?: boolean;
};

/**
 * Navbar - Premium navigation component with smooth animations
 * 
 * Color scheme from graphical chart:
 * - Deep Bordeaux (#722F37) - Primary brand color
 * - Champagne (#D4AF37) - Accent
 * - Crème (#FFF8F0) - Background
 * - Noir charbon (#1A1A1A) - Text
 */
export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  user = null, 
  onLogout,
  isDemoMode = false 
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect with throttling
  useEffect(() => {
    setMounted(true);
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return <Crown className="h-3.5 w-3.5" />;
      case 'employee':
        return <Briefcase className="h-3.5 w-3.5" />;
      default:
        return <UserIcon className="h-3.5 w-3.5" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-gray-500';
    switch (user.role) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'employee':
        return 'bg-[#722F37] text-white';
      default:
        return 'bg-[#556B2F] text-white';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employé';
      default:
        return 'Client';
    }
  };

  const navItems: Array<{ label: string; page: Page }> = [
    { label: 'Accueil', page: 'home' },
    { label: 'Nos Menus', page: 'menu' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-[#722F37]/5' 
            : 'bg-transparent'
        } ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-500 ${
            scrolled ? 'h-16' : 'h-20'
          }`}>
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#722F37] rounded-lg"
            >
              <div className={`relative transition-all duration-500 ${
                scrolled ? 'w-10 h-10' : 'w-11 h-11'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#722F37] to-[#5a252c] rounded-xl shadow-lg shadow-[#722F37]/25 group-hover:shadow-[#722F37]/40 transition-all duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className={`text-white transition-all duration-500 ${
                    scrolled ? 'h-5 w-5' : 'h-6 w-6'
                  }`} />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold transition-all duration-300 ${
                  scrolled 
                    ? 'text-[#1A1A1A] text-lg' 
                    : 'text-white text-xl drop-shadow-lg'
                } group-hover:text-[#722F37]`}>
                  Vite & Gourmand
                </span>
                <span className={`block text-xs font-medium -mt-0.5 transition-all duration-300 ${
                  scrolled ? 'text-[#D4AF37]' : 'text-[#D4AF37]/90'
                }`}>
                  Traiteur à Bordeaux
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page)}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#722F37]"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${
                    currentPage === item.page 
                      ? scrolled ? 'text-[#722F37]' : 'text-white'
                      : scrolled ? 'text-[#1A1A1A]/70 hover:text-[#722F37]' : 'text-white/80 hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {currentPage === item.page && (
                    <span 
                      className={`absolute inset-0 rounded-lg transition-colors duration-300 ${
                        scrolled ? 'bg-[#722F37]/10' : 'bg-white/10'
                      }`}
                    />
                  )}
                  <span 
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                      currentPage === item.page 
                        ? 'w-6 bg-[#D4AF37]' 
                        : 'w-0 bg-transparent'
                    }`}
                  />
                </button>
              ))}

              <div className={`w-px h-6 mx-3 transition-colors duration-300 ${
                scrolled ? 'bg-[#1A1A1A]/10' : 'bg-white/20'
              }`} />

              {user ? (
                <div className="flex items-center gap-2">
                  {isDemoMode && (
                    <Badge className={`${getRoleBadgeColor()} flex items-center gap-1.5 px-2.5 py-1 text-xs`}>
                      {getRoleIcon()}
                      <span className="hidden lg:inline">{getRoleLabel()}</span>
                    </Badge>
                  )}
                  
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      variant={scrolled ? 'secondary' : 'ghost'}
                      size="sm"
                      className={!scrolled ? 'text-white hover:bg-white/10' : ''}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Admin
                    </Button>
                  )}
                  
                  <button
                    onClick={() => handleNavClick('user-profile')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      scrolled 
                        ? 'hover:bg-[#FFF8F0]' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      scrolled 
                        ? 'bg-[#FFF8F0] border border-[#722F37]/20' 
                        : 'bg-white/20 border border-white/30'
                    }`}>
                      <UserIcon className={`h-4 w-4 ${scrolled ? 'text-[#722F37]' : 'text-white'}`} />
                    </div>
                    <span className={`hidden lg:inline text-sm font-medium transition-colors duration-300 ${
                      scrolled ? 'text-[#1A1A1A]' : 'text-white'
                    }`}>
                      {user.firstName}
                    </span>
                  </button>
                  
                  {onLogout && (
                    <Button
                      onClick={onLogout}
                      variant="ghost"
                      size="icon"
                      className={`transition-colors duration-300 ${
                        scrolled 
                          ? 'text-[#1A1A1A]/50 hover:text-red-600 hover:bg-red-50' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = '/portal'}
                  size="sm"
                  variant={scrolled ? 'default' : 'secondary'}
                  className="transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Connexion
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#722F37] ${
                scrolled 
                  ? 'text-[#1A1A1A] hover:bg-[#FFF8F0]' 
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Fermer' : 'Menu'}</span>
              <div className="relative w-5 h-5">
                <span 
                  className={`absolute left-0 block w-5 h-0.5 rounded-full transition-all duration-300 ${
                    scrolled ? 'bg-[#1A1A1A]' : 'bg-white'
                  } ${mobileMenuOpen ? 'top-2.5 rotate-45' : 'top-1'}`}
                />
                <span 
                  className={`absolute left-0 top-2.5 block w-5 h-0.5 rounded-full transition-all duration-300 ${
                    scrolled ? 'bg-[#1A1A1A]' : 'bg-white'
                  } ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                />
                <span 
                  className={`absolute left-0 block w-5 h-0.5 rounded-full transition-all duration-300 ${
                    scrolled ? 'bg-[#1A1A1A]' : 'bg-white'
                  } ${mobileMenuOpen ? 'top-2.5 -rotate-45' : 'top-4'}`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          mobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm transition-opacity duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu panel */}
        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-[#722F37]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#722F37] to-[#5a252c] rounded-xl flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A]">Vite & Gourmand</span>
                <span className="block text-xs text-[#D4AF37]">Traiteur à Bordeaux</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A]/60 hover:bg-[#FFF8F0] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation items */}
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`w-full text-left px-4 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  currentPage === item.page 
                    ? 'bg-gradient-to-r from-[#722F37] to-[#5a252c] text-white shadow-lg shadow-[#722F37]/20' 
                    : 'text-[#1A1A1A]/80 hover:bg-[#FFF8F0] hover:text-[#722F37]'
                }`}
              >
                {currentPage === item.page && (
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                )}
                {item.label}
              </button>
            ))}
          </div>

          {/* User section */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t border-[#722F37]/10 bg-[#FFF8F0]/50">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#722F37] to-[#D4AF37] flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-[#1A1A1A]/60 truncate">{user.email}</p>
                  </div>
                  {isDemoMode && (
                    <Badge className={`${getRoleBadgeColor()} px-2 py-0.5 text-xs`}>
                      {getRoleLabel()}
                    </Badge>
                  )}
                </div>
                
                <button
                  onClick={() => handleNavClick('user-profile')}
                  className="w-full px-4 py-3 rounded-xl text-[#1A1A1A]/80 hover:bg-white font-medium text-left transition-colors"
                >
                  Mon Espace
                </button>
                
                {(user.role === 'admin' || user.role === 'employee') && (
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-4 py-3 rounded-xl text-[#722F37] hover:bg-white font-medium text-left transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Administration
                  </button>
                )}
                
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-left transition-colors"
                  >
                    Déconnexion
                  </button>
                )}
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = '/portal'}
                className="w-full"
                size="lg"
              >
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
