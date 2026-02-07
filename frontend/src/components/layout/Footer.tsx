import { ChefHat } from 'lucide-react';

type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

type FooterProps = {
  setCurrentPage: (page: Page) => void;
};

export default function Footer({ setCurrentPage }: FooterProps) {
  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A]">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
        {/* All on one line for desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px]">
          
          {/* Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group"
          >
            <ChefHat className="h-4 w-4 text-[#D4AF37]" />
            <span style={{ color: '#ffffff' }} className="font-semibold group-hover:text-[#D4AF37] transition-colors">
              Vite&nbsp;&&nbsp;Gourmand
            </span>
          </button>

          {/* Contact + Nav inline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="tel:+33556000000" style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:!text-white transition-colors">
              05 56 00 00 00
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <a href="mailto:contact@vite-gourmand.fr" style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:!text-white transition-colors">
              contact@vite-gourmand.fr
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <button onClick={() => handleNavClick('menu')} style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:!text-white transition-colors">
              Menus
            </button>
            <button onClick={() => handleNavClick('contact')} style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:!text-white transition-colors">
              Contact
            </button>
            <button onClick={() => handleNavClick('legal-mentions')} style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:!text-white transition-colors">
              Mentions
            </button>
          </div>

          {/* Copyright */}
          <p style={{ color: 'rgba(255,255,255,0.35)' }} className="text-[10px]">
            © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
