import { ChefHat, Clock } from 'lucide-react';
import { usePublicData } from '../../contexts/PublicDataContext';

type Page = 'home' | 'menu' | 'contact' | 'legal-mentions' | 'legal-cgv' | 'user-profile';

type FooterProps = {
  setCurrentPage: (page: Page) => void;
};

const FALLBACK_HOURS = [
  { id: 1, day: 'Lundi', opening: '09:00', closing: '19:00' },
  { id: 2, day: 'Mardi', opening: '09:00', closing: '19:00' },
  { id: 3, day: 'Mercredi', opening: '09:00', closing: '19:00' },
  { id: 4, day: 'Jeudi', opening: '09:00', closing: '19:00' },
  { id: 5, day: 'Vendredi', opening: '09:00', closing: '20:00' },
  { id: 6, day: 'Samedi', opening: '10:00', closing: '20:00' },
  { id: 7, day: 'Dimanche', opening: '10:00', closing: '14:00' },
];

export default function Footer({ setCurrentPage }: FooterProps) {
  const { siteInfo, workingHours } = usePublicData();
  const hours = workingHours.length > 0 ? workingHours : FALLBACK_HOURS;
  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkStyle = { color: 'rgba(255,255,255,0.6)' };
  const mutedStyle = { color: 'rgba(255,255,255,0.35)' };

  return (
    <footer className="bg-[#1A1A1A]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-[12px]">

          {/* Col 1 — Brand + Contact */}
          <div className="space-y-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <ChefHat className="h-5 w-5 text-[#D4AF37]" />
              <span style={{ color: '#ffffff' }} className="font-bold text-sm group-hover:text-[#D4AF37] transition-colors">
                Vite&nbsp;&&nbsp;Gourmand
              </span>
            </button>
            <p style={mutedStyle} className="text-[11px] leading-relaxed">
              Traiteur d'exception pour tous vos événements.<br />
              Bordeaux &amp; alentours.
            </p>
            <div className="flex flex-col gap-1">
              <a href={`tel:${siteInfo?.phone || '+33556000000'}`} style={linkStyle} className="hover:!text-white transition-colors">
                📞 {siteInfo?.phone || '05 56 00 00 00'}
              </a>
              <a href={`mailto:${siteInfo?.email || 'contact@vite-gourmand.fr'}`} style={linkStyle} className="hover:!text-white transition-colors">
                ✉️ {siteInfo?.email || 'contact@vite-gourmand.fr'}
              </a>
            </div>
          </div>

          {/* Col 2 — Horaires */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span style={{ color: '#ffffff' }} className="font-semibold text-[13px]">Horaires</span>
            </div>
            <ul className="space-y-0.5">
              {hours.map(({ day, opening, closing }) => (
                <li key={day} className="flex justify-between gap-4">
                  <span style={linkStyle}>{day}</span>
                  <span style={mutedStyle}>{opening} – {closing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Navigation + Legal */}
          <div>
            <span style={{ color: '#ffffff' }} className="font-semibold text-[13px] block mb-3">Navigation</span>
            <ul className="space-y-1.5">
              {[
                { label: 'Accueil', page: 'home' as Page },
                { label: 'Nos Menus', page: 'menu' as Page },
                { label: 'Contact', page: 'contact' as Page },
              ].map(({ label, page }) => (
                <li key={page}>
                  <button onClick={() => handleNavClick(page)} style={linkStyle} className="hover:!text-white transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
              <button onClick={() => handleNavClick('legal-mentions')} style={linkStyle} className="hover:!text-white transition-colors block">
                Mentions légales
              </button>
              <button onClick={() => handleNavClick('legal-cgv')} style={linkStyle} className="hover:!text-white transition-colors block">
                Conditions générales de vente
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p style={mutedStyle} className="text-[11px]">
            © {new Date().getFullYear()} Vite &amp; Gourmand — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
