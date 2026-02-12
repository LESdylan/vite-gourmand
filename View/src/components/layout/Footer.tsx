import { useState } from 'react';
import { ChefHat, Clock, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { usePublicData } from '../../contexts/PublicDataContext';
import { subscribeNewsletter } from '../../services/newsletter';

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

  // Newsletter state
  const [nlEmail, setNlEmail] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState('');
  const [nlError, setNlError] = useState('');

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlLoading(true);
    setNlError('');
    setNlSuccess('');
    try {
      const result = await subscribeNewsletter(nlEmail.trim());
      setNlSuccess(result.message || 'Inscription réussie !');
      setNlEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      setNlError(msg);
    } finally {
      setNlLoading(false);
    }
  };

  const linkStyle = { color: 'rgba(255,255,255,0.6)' };
  const mutedStyle = { color: 'rgba(255,255,255,0.35)' };

  return (
    <footer className="bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-[12px]">
          {/* Col 1 — Brand + Contact */}
          <div className="space-y-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <ChefHat className="h-5 w-5 text-[#D4AF37]" />
              <span
                style={{ color: '#ffffff' }}
                className="font-bold text-sm group-hover:text-[#D4AF37] transition-colors"
              >
                Vite&nbsp;&&nbsp;Gourmand
              </span>
            </button>
            <p style={mutedStyle} className="text-[11px] leading-relaxed">
              Traiteur d'exception pour tous vos événements.
              <br />
              Bordeaux &amp; alentours.
            </p>
            <div className="flex flex-col gap-1">
              <a
                href={`tel:${siteInfo?.phone || '+33556000000'}`}
                style={linkStyle}
                className="hover:!text-white transition-colors"
              >
                📞 {siteInfo?.phone || '05 56 00 00 00'}
              </a>
              <a
                href={`mailto:${siteInfo?.email || 'contact@vite-gourmand.fr'}`}
                style={linkStyle}
                className="hover:!text-white transition-colors"
              >
                ✉️ {siteInfo?.email || 'contact@vite-gourmand.fr'}
              </a>
            </div>
          </div>

          {/* Col 2 — Horaires */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span style={{ color: '#ffffff' }} className="font-semibold text-[13px]">
                Horaires
              </span>
            </div>
            <ul className="space-y-0.5">
              {hours.map(({ day, opening, closing }) => (
                <li key={day} className="flex justify-between gap-4">
                  <span style={linkStyle}>{day}</span>
                  <span style={mutedStyle}>
                    {opening} – {closing}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Navigation + Legal */}
          <div>
            <span style={{ color: '#ffffff' }} className="font-semibold text-[13px] block mb-3">
              Navigation
            </span>
            <ul className="space-y-0 sm:space-y-1.5">
              {[
                { label: 'Accueil', page: 'home' as Page },
                { label: 'Nos Menus', page: 'menu' as Page },
                { label: 'Contact', page: 'contact' as Page },
              ].map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => handleNavClick(page)}
                    style={linkStyle}
                    className="hover:!text-white transition-colors py-2 sm:py-0"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10 space-y-0 sm:space-y-1.5">
              <button
                onClick={() => handleNavClick('legal-mentions')}
                style={linkStyle}
                className="hover:!text-white transition-colors block py-2 sm:py-0"
              >
                Mentions légales
              </button>
              <button
                onClick={() => handleNavClick('legal-cgv')}
                style={linkStyle}
                className="hover:!text-white transition-colors block py-2 sm:py-0"
              >
                Conditions générales de vente
              </button>
            </div>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-[#D4AF37]" />
              <span style={{ color: '#ffffff' }} className="font-semibold text-[13px]">
                Newsletter
              </span>
            </div>
            <p style={mutedStyle} className="text-[11px] leading-relaxed mb-3">
              Recevez nos menus, promotions et actualités gourmandes directement dans votre boîte
              mail.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
              <input
                type="email"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder="votre@email.fr"
                required
                className="flex-1 min-w-0 bg-white/10 border border-white/10 rounded-md px-3 py-2 text-white text-[12px] placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={nlLoading}
                className="shrink-0 bg-[#D4AF37] hover:bg-[#C9A030] disabled:opacity-50 text-[#1A1A1A] rounded-md px-3 py-2 transition-colors"
                aria-label="S'inscrire à la newsletter"
              >
                <Send size={14} />
              </button>
            </form>

            {nlSuccess && (
              <div className="flex items-start gap-1.5 mt-2 text-[11px] text-emerald-400">
                <CheckCircle size={13} className="shrink-0 mt-0.5" />
                <span>{nlSuccess}</span>
              </div>
            )}
            {nlError && (
              <div className="flex items-start gap-1.5 mt-2 text-[11px] text-red-400">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>{nlError}</span>
              </div>
            )}

            <p style={mutedStyle} className="text-[10px] mt-2 leading-relaxed">
              En vous inscrivant, vous acceptez de recevoir nos communications. Désinscription
              possible à tout moment.
            </p>
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
