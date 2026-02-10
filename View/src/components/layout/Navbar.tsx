import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, ChefHat, X, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
  topOffset?: number;
};

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  user = null, 
  onLogout,
  isDemoMode = false,
  topOffset = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // On non-home pages, always show solid navbar
  const isHome = currentPage === 'home';
  const solid = hasScrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Accueil', page: 'home' as Page },
    { label: 'Menus', page: 'menu' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleLabel = () => {
    if (!user) return '';
    return user.role === 'admin' ? 'Admin' : user.role === 'employee' ? 'Employé' : 'Client';
  };

  return (
    <>
      <nav 
        className={`fixed left-0 right-0 z-50 transition-all duration-200 ${
          solid 
            ? 'bg-white shadow-sm' 
            : 'bg-black/20 backdrop-blur-sm'
        }`}
        style={{ top: `${topOffset}px` }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#722F37] rounded-lg flex items-center justify-center">
                <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold text-sm sm:text-base ${solid ? 'text-[#1A1A1A]' : 'text-white'}`}>
                  Vite & Gourmand
                </span>
                <span className="block text-[10px] text-[#D4AF37] -mt-0.5">Traiteur</span>
              </div>
            </button>

            {/* Desktop Nav - visible on sm and up */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? solid 
                        ? 'bg-[#722F37]/10 text-[#722F37]' 
                        : 'bg-white/20 text-white'
                      : solid 
                        ? 'text-[#1A1A1A]/70 hover:text-[#722F37] hover:bg-[#722F37]/5' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className={`w-px h-5 mx-2 ${solid ? 'bg-black/10' : 'bg-white/20'}`} />

              {user ? (
                <div className="flex items-center gap-2">
                  {isDemoMode && (
                    <Badge className="bg-[#722F37] text-white text-[10px] px-2 py-0.5">
                      {getRoleLabel()}
                    </Badge>
                  )}
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className={`text-xs px-2 py-1 rounded ${solid ? 'text-[#722F37] hover:bg-[#722F37]/10' : 'text-white hover:bg-white/10'}`}
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('user-profile')}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      solid ? 'bg-[#FFF8F0] text-[#722F37]' : 'bg-white/20 text-white'
                    }`}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                  </button>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className={`p-1.5 rounded ${solid ? 'text-[#1A1A1A]/40 hover:text-red-600' : 'text-white/60 hover:text-white'}`}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = '/portal'}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Connexion
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`sm:hidden p-2 rounded-lg ${solid ? 'text-[#1A1A1A]' : 'text-white'}`}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between px-4 h-14 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#722F37] rounded-lg flex items-center justify-center">
                <ChefHat className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[#1A1A1A]">Vite & Gourmand</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X className="h-5 w-5 text-[#1A1A1A]" />
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  currentPage === item.page 
                    ? 'bg-[#722F37] text-white' 
                    : 'text-[#1A1A1A] hover:bg-[#FFF8F0]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-[#FFF8F0]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center text-white font-bold">
                    {user.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{user.firstName}</p>
                    <p className="text-xs text-[#1A1A1A]/60">{user.email}</p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-red-600 text-sm font-medium text-left"
                  >
                    Déconnexion
                  </button>
                )}
              </div>
            ) : (
              <Button onClick={() => window.location.href = '/portal'} className="w-full">
                Connexion
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
