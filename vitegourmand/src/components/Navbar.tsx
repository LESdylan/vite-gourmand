import React, { useState } from 'react';
import { Menu, X, User, LogOut, ChefHat, Crown, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Page, User as UserType } from '../App';

type NavbarProps = {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: UserType;
  onLogout: () => void;
  isDemoMode?: boolean;
};

export default function Navbar({ currentPage, setCurrentPage, user, onLogout, isDemoMode = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'employee':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-gray-500';
    switch (user.role) {
      case 'admin':
        return 'bg-purple-600';
      case 'employee':
        return 'bg-orange-600';
      default:
        return 'bg-blue-600';
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

  const navItems = [
    { label: 'Accueil', page: 'home' as Page },
    { label: 'Nos Menus', page: 'menu' as Page },
    { label: 'Nous Visiter', page: 'outstanding' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ChefHat className="h-8 w-8" />
              <span className="text-xl font-bold">Vite & Gourmand</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`text-gray-700 hover:text-orange-600 transition-colors font-medium ${
                  currentPage === item.page ? 'text-orange-600 border-b-2 border-orange-600' : ''
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Demo Mode Badge */}
                {isDemoMode && (
                  <Badge className={`${getRoleBadgeColor()} text-white flex items-center gap-1`}>
                    {getRoleIcon()}
                    <span className="hidden lg:inline">{getRoleLabel()}</span>
                  </Badge>
                )}
                
                {(user.role === 'admin' || user.role === 'employee') && (
                  <Button
                    onClick={() => handleNavClick('admin')}
                    variant="outline"
                    size="sm"
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
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.firstName}</span>
                </Button>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleNavClick({ type: 'login' })}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Connexion
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page)}
                  className={`text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-md ${
                    currentPage === item.page ? 'bg-orange-50 text-orange-600' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {user ? (
                <>
                  <button
                    onClick={() => handleNavClick('user-profile')}
                    className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-md"
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Mon Espace
                  </button>
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-md"
                    >
                      Administration
                    </button>
                  )}
                  <div className="px-4 py-2 text-gray-700 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-4">
                  <Button
                    onClick={() => handleNavClick({ type: 'login' })}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Connexion
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
