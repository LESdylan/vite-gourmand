import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Menu, X, ChefHat, User, LogOut, Settings, ShoppingBag, 
  Home, UtensilsCrossed, Phone, Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hours, setHours] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
      
      const businessHours = await base44.entities.BusinessHours.list();
      setHours(businessHours);
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navLinks = [
    { name: 'Accueil', page: 'Home', icon: Home },
    { name: 'Nos Menus', page: 'Menus', icon: UtensilsCrossed },
    { name: 'Contact', page: 'Contact', icon: Phone },
  ];

  const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const sortedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <style>{`
        :root {
          --color-wine: #722F37;
          --color-gold: #D4AF37;
          --color-cream: #FFF8F0;
          --color-dark: #2C2C2C;
        }
      `}</style>
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#722F37] to-[#8B4049] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <ChefHat className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#722F37] tracking-tight">Vite & Gourmand</h1>
                <p className="text-xs text-[#722F37]/60 -mt-1">Traiteur depuis 1999</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === link.page 
                      ? 'text-[#722F37]' 
                      : 'text-[#2C2C2C]/70 hover:text-[#722F37]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-[#722F37] hover:bg-[#722F37]/10">
                      <div className="w-8 h-8 rounded-full bg-[#722F37] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.full_name || 'Mon compte'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#722F37] font-medium capitalize mt-1">{user.role}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('UserDashboard')} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Mon espace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('UserOrders')} className="flex items-center gap-2 cursor-pointer">
                        <ShoppingBag className="w-4 h-4" />
                        Mes commandes
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === 'admin' || user.role === 'employe') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-2 cursor-pointer">
                            <Settings className="w-4 h-4" />
                            Espace {user.role === 'admin' ? 'Admin' : 'Employé'}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-[#722F37] hover:bg-[#8B4049] text-white"
                >
                  Connexion
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-md">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                    currentPageName === link.page 
                      ? 'text-[#722F37] bg-[#722F37]/5' 
                      : 'text-[#2C2C2C]/70'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Vite & Gourmand</h3>
                  <p className="text-xs text-gray-400">Traiteur à Bordeaux</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Depuis 25 ans, Julie et José vous proposent une cuisine raffinée pour tous vos événements.
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                Nos Horaires
              </h3>
              <div className="space-y-1 text-sm">
                {sortedHours.length > 0 ? (
                  sortedHours.map((h) => (
                    <div key={h.day} className="flex justify-between text-gray-400">
                      <span className="capitalize">{h.day}</span>
                      <span>{h.is_open ? `${h.open_time} - ${h.close_time}` : 'Fermé'}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Lun - Ven</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Samedi</span>
                      <span>9h00 - 12h00</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Dimanche</span>
                      <span>Fermé</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Informations</h3>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl('LegalNotice')} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Mentions légales
                </Link>
                <Link to={createPageUrl('Terms')} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Conditions générales de vente
                </Link>
                <Link to={createPageUrl('Contact')} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Vite & Gourmand - Tous droits réservés</p>
            <p className="mt-1">33000 Bordeaux, France</p>
          </div>
        </div>
      </footer>
    </div>
  );
}