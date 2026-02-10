import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { fetchWorkingHours, fetchSiteInfo, type WorkingHour, type SiteInfo } from '../services/public';

const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  useEffect(() => {
    fetchSiteInfo().then(setSiteInfo).catch(() => {});
    fetchWorkingHours()
      .then(data => {
        data.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
        setWorkingHours(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate send — in production this POSTs to /api/contact
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitSuccess(true);
    setFormData({ email: '', subject: '', message: '' });
    setIsSubmitting(false);
    setTimeout(() => setSubmitSuccess(false), 6000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="bg-[#1A1A1A] pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#722F37] rounded-full px-4 py-1.5 mb-4">
            <Mail className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-wide uppercase">Contact</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Contactez-nous</h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
            Une question, un devis, un projet d'événement ? Envoyez-nous un message.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Contact Form (3 cols) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 p-5 sm:p-7">
              
              {/* Success banner */}
              {submitSuccess && (
                <div className="mb-5 flex items-start gap-3 bg-[#556B2F]/10 border border-[#556B2F]/20 rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-[#556B2F] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">Message envoyé !</p>
                    <p className="text-[#1A1A1A]/60 text-xs">Nous vous répondrons sous 24 – 48 h ouvrées.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-[#1A1A1A] font-medium text-sm">
                    Votre email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.fr"
                    required
                    className="mt-1.5 h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                  />
                </div>

                {/* Subject (titre) */}
                <div>
                  <Label htmlFor="subject" className="text-[#1A1A1A] font-medium text-sm">
                    Titre / Sujet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ex : Demande de devis pour un mariage"
                    required
                    className="mt-1.5 h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                  />
                </div>

                {/* Message (description) */}
                <div>
                  <Label htmlFor="message" className="text-[#1A1A1A] font-medium text-sm">
                    Description / Message <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre projet, posez vos questions…"
                    required
                    rows={5}
                    className="mt-1.5 flex w-full rounded-lg border border-[#1A1A1A]/10 bg-white px-3 py-2.5 text-sm placeholder:text-[#1A1A1A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#722F37] focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* ── Sidebar info (2 cols) ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Quick contact */}
            <div className="bg-white rounded-2xl shadow-lg shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 p-5 space-y-4">
              <h2 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">Coordonnées</h2>

              <a href={`tel:${siteInfo?.phone || '+33556000000'}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#722F37]/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-[#722F37]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors">{siteInfo?.phone || '05 56 00 00 00'}</p>
                  <p className="text-[#1A1A1A]/50 text-xs">Lun – Ven, 9 h – 18 h</p>
                </div>
              </a>

              <a href={`mailto:${siteInfo?.email || 'contact@vite-gourmand.fr'}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors">{siteInfo?.email || 'contact@vite-gourmand.fr'}</p>
                  <p className="text-[#1A1A1A]/50 text-xs">Réponse sous 24 – 48 h</p>
                </div>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(siteInfo?.address || '15 Rue Sainte-Catherine 33000 Bordeaux')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#556B2F]/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-[#556B2F]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors">{siteInfo?.address || '15 Rue Sainte-Catherine, 33000 Bordeaux'}</p>
                </div>
              </a>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl shadow-lg shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 p-5">
              <h2 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D4AF37]" /> Horaires
              </h2>
              <div className="space-y-2 text-sm">
                {workingHours.length > 0 ? (
                  workingHours.map((row) => (
                    <div key={row.day} className="flex justify-between items-center py-1.5 border-b border-[#1A1A1A]/5 last:border-0">
                      <span className="text-[#1A1A1A]/70">{row.day}</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {row.opening} – {row.closing}
                      </span>
                    </div>
                  ))
                ) : (
                  [
                    { day: 'Lundi – Vendredi', time: '9 h – 18 h', open: true },
                    { day: 'Samedi', time: '10 h – 16 h', open: true },
                    { day: 'Dimanche', time: 'Fermé', open: false },
                  ].map((row) => (
                    <div key={row.day} className="flex justify-between items-center py-1.5 border-b border-[#1A1A1A]/5 last:border-0">
                      <span className="text-[#1A1A1A]/70">{row.day}</span>
                      <span className={`font-semibold ${row.open ? 'text-[#1A1A1A]' : 'text-red-600'}`}>
                        {row.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-[#722F37] rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-1 text-sm">Menu personnalisé ?</h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Décrivez votre projet dans le formulaire ci-contre et notre équipe vous proposera un devis sur mesure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
