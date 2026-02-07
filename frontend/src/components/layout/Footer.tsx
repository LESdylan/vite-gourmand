import { Clock, MapPin, Phone, Mail, ChefHat, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

// Page type for navigation
type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

type FooterProps = {
  setCurrentPage: (page: Page) => void;
};

/**
 * Footer - Site footer with contact info, hours, and links
 * 
 * Color scheme from graphical chart:
 * - Deep Bordeaux (#722F37) - Primary brand color
 * - Champagne (#D4AF37) - Accent/highlights
 * - Crème (#FFF8F0) - Light backgrounds
 * - Vert olive (#556B2F) - Success
 * - Noir charbon (#1A1A1A) - Base background
 */
export default function Footer({ setCurrentPage }: FooterProps) {
  const hours = [
    { day: 'Lundi - Vendredi', time: '9h00 - 18h00' },
    { day: 'Samedi', time: '10h00 - 16h00' },
    { day: 'Dimanche', time: 'Fermé' },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Top section with CTA */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            <div className="text-center lg:text-left max-w-xl">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Prêt à créer un moment <span className="text-[#D4AF37]">inoubliable</span> ?
              </h3>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed">
                Contactez-nous pour discuter de votre projet et recevoir un devis personnalisé.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <Button
                onClick={() => handleNavClick('menu')}
                size="lg"
                className="min-w-[180px] justify-center"
              >
                Voir nos menus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleNavClick('contact')}
                variant="outlineLight"
                size="lg"
                className="min-w-[180px] justify-center"
              >
                <Phone className="mr-2 h-4 w-4" />
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Company info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-8">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#722F37] to-[#5a252c] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#722F37]/40 transition-all duration-300 group-hover:scale-105">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Vite & Gourmand
                </span>
                <span className="block text-sm text-[#D4AF37]">Traiteur à Bordeaux</span>
              </div>
            </button>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Votre partenaire traiteur depuis 25 ans. Julie et José mettent leur expertise
              au service de vos événements pour des moments inoubliables.
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 bg-white/5 hover:bg-[#722F37] border border-white/10 hover:border-[#722F37] rounded-xl flex items-center justify-center transition-all duration-300 group hover:scale-110"
              >
                <Facebook className="h-5 w-5 text-white/60 group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/5 hover:bg-[#722F37] border border-white/10 hover:border-[#722F37] rounded-xl flex items-center justify-center transition-all duration-300 group hover:scale-110"
              >
                <Instagram className="h-5 w-5 text-white/60 group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/5 hover:bg-[#722F37] border border-white/10 hover:border-[#722F37] rounded-xl flex items-center justify-center transition-all duration-300 group hover:scale-110"
              >
                <Linkedin className="h-5 w-5 text-white/60 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" />
              Contact
            </h3>
            <div className="space-y-5">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 text-white/60 hover:text-[#D4AF37] transition-colors group">
                <div className="w-10 h-10 bg-[#722F37]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#722F37]/30 transition-colors">
                  <MapPin className="h-5 w-5 text-[#722F37]" />
                </div>
                <span className="text-base leading-relaxed pt-2">15 Rue Sainte-Catherine<br />33000 Bordeaux</span>
              </a>
              <a href="tel:+33556000000" className="flex items-center gap-4 text-white/60 hover:text-[#D4AF37] transition-colors group">
                <div className="w-10 h-10 bg-[#722F37]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#722F37]/30 transition-colors">
                  <Phone className="h-5 w-5 text-[#722F37]" />
                </div>
                <span className="text-base">+33 5 56 00 00 00</span>
              </a>
              <a href="mailto:contact@vite-gourmand.fr" className="flex items-center gap-4 text-white/60 hover:text-[#D4AF37] transition-colors group">
                <div className="w-10 h-10 bg-[#722F37]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#722F37]/30 transition-colors">
                  <Mail className="h-5 w-5 text-[#722F37]" />
                </div>
                <span className="text-base">contact@vite-gourmand.fr</span>
              </a>
            </div>
          </div>

          {/* Opening hours */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" />
              Horaires
            </h3>
            <div className="space-y-4">
              {hours.map((schedule) => (
                <div key={schedule.day} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/60 text-base">{schedule.day}</span>
                  <span className={`text-base font-medium ${schedule.time === 'Fermé' ? 'text-[#722F37]' : 'text-white'}`}>
                    {schedule.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[#556B2F] mt-4">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Disponible sur RDV pour vos événements</span>
            </div>
          </div>

          {/* Legal links & Newsletter */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" />
              Informations
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => handleNavClick('menu')}
                className="flex items-center gap-3 text-white/60 hover:text-[#D4AF37] transition-colors text-base group"
              >
                <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                Nos menus
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="flex items-center gap-3 text-white/60 hover:text-[#D4AF37] transition-colors text-base group"
              >
                <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                Contact
              </button>
              <button
                onClick={() => handleNavClick('legal-mentions')}
                className="flex items-center gap-3 text-white/60 hover:text-[#D4AF37] transition-colors text-base group"
              >
                <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                Mentions légales
              </button>
              <button
                onClick={() => handleNavClick('legal-cgv')}
                className="flex items-center gap-3 text-white/60 hover:text-[#D4AF37] transition-colors text-base group"
              >
                <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                CGV
              </button>
            </div>
            
            {/* Newsletter */}
            <div className="pt-6">
              <p className="text-white font-medium text-base mb-4">Newsletter</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-l-xl text-white text-base placeholder-white/40 focus:outline-none focus:border-[#722F37] transition-colors"
                />
                <button className="px-5 py-3 bg-[#722F37] hover:bg-[#5a252c] text-white rounded-r-xl text-base font-medium transition-colors hover:scale-105">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-base text-white/50">
              © {new Date().getFullYear()} Vite & Gourmand. Tous droits réservés.
            </p>
            <p className="text-sm text-white/40 flex items-center gap-2">
              Fait avec <span className="text-[#722F37] animate-pulse">❤️</span> à Bordeaux • Conformité RGPD
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
