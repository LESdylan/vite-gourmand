import { useState } from 'react';
import { Menu, X, User as UserIcon, LogOut, ChefHat, Crown, Briefcase } from 'lucide-react';
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

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  user = null, 
  onLogout,
  isDemoMode = false 
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'employee':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-gray-500';
    switch (user.role) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'employee':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin':
        return 'Administrateur';
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
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2 sm:space-x-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300">
                <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors hidden xs:block">
                Vite & Gourmand
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.page 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-3 ml-4 pl-4 border-l border-gray-200">
                {/* Demo Mode Badge */}
                {isDemoMode && (
                  <Badge className={`${getRoleBadgeColor()} flex items-center gap-1`}>
                    {getRoleIcon()}
                    <span className="hidden lg:inline">{getRoleLabel()}</span>
                  </Badge>
                )}
                
                {(user.role === 'admin' || user.role === 'employee') && (
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="outline"
                    size="sm"
                    className="text-xs lg:text-sm"
                  >
                    Administration
                  </Button>
                )}
                <Button
                  onClick={() => handleNavClick('user-profile')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm hidden lg:inline">{user.firstName}</span>
                </Button>
                {onLogout && (
                  <Button
                    onClick={onLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = '/portal'}
                className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
              >
                Connexion
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-1 border-t border-gray-100">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.page 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-3 mt-3 border-t border-gray-100">
              {user ? (
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('user-profile')}
                    className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium flex items-center"
                  >
                    <UserIcon className="h-5 w-5 mr-3 text-orange-500" />
                    Mon Espace
                  </button>
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium flex items-center"
                    >
                      <Briefcase className="h-5 w-5 mr-3 text-orange-500" />
                      Administration
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium flex items-center"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Déconnexion
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-4 py-2">
                  <Button
                    onClick={() => window.location.href = '/portal'}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Connexion
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
