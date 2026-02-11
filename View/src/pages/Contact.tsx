import { useState, useRef } from 'react';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle,
  MessageSquare, ArrowRight, Sparkles, User, FileText,
  ChevronRight, ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { usePublicData } from '../contexts/PublicDataContext';

/* ── Quick-reply suggestions ── */
const QUICK_SUBJECTS = [
  { label: '🎂 Anniversaire', value: 'Devis pour un anniversaire' },
  { label: '💒 Mariage', value: 'Devis pour un mariage' },
  { label: '🏢 Entreprise', value: 'Événement d\'entreprise' },
  { label: '🍽️ Menu sur mesure', value: 'Demande de menu personnalisé' },
  { label: '❓ Question', value: 'Question générale' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { siteInfo, workingHours } = usePublicData();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate send — in production this POSTs to /api/contact
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
    setTimeout(() => setSubmitSuccess(false), 8000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuickSubject = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
    // Scroll to form if on mobile
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filledFields = [formData.name, formData.email, formData.subject, formData.message].filter(Boolean).length;
  const progress = (filledFields / 4) * 100;

  return (
    <div className="min-h-screen bg-[#FFF8F0]">

      {/* ═══════════════════════════════════════════════════════════
          Premium Header with depth & decorative elements
          ═══════════════════════════════════════════════════════════ */}
      <header className="relative bg-[#1A1A1A] pt-10 pb-16 sm:pt-14 sm:pb-20 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#722F37]/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#D4AF37]/6 rounded-full blur-3xl translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.02] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/[0.03] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            {/* Decorative line + badge */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#722F37] to-[#8B3A42] rounded-full px-5 py-2 shadow-lg shadow-[#722F37]/20">
                <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">Contact</span>
              </div>
              <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
              Parlons de votre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547]">
                projet
              </span>
            </h1>

            <p className="text-white/40 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
              Un événement à organiser, une question sur nos menus ou simplement envie d'échanger ?
              <br className="hidden sm:block" />
              Notre équipe vous répond sous 24 h.
            </p>

            {/* Quick-select subject chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {QUICK_SUBJECTS.map(qs => (
                <button
                  key={qs.value}
                  type="button"
                  onClick={() => handleQuickSubject(qs.value)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
                    ${formData.subject === qs.value
                      ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-lg shadow-[#D4AF37]/20 scale-105'
                      : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white border border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                >
                  {qs.label}
                </button>
              ))}
            </div>

            {/* Decorative dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40" />
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40" />
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          Content — Form + Sidebar
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* ── Contact Form (3 cols) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/8 border border-[#1A1A1A]/5 overflow-hidden">
              
              {/* Form header with progress */}
              <div className="bg-gradient-to-r from-[#FFF8F0] to-white px-6 sm:px-8 py-5 border-b border-[#1A1A1A]/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#722F37]/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-[#722F37]" />
                    </div>
                    <div>
                      <h2 className="font-bold text-[#1A1A1A] text-base">Envoyez-nous un message</h2>
                      <p className="text-[#1A1A1A]/40 text-xs">Tous les champs marqués * sont obligatoires</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] text-[#1A1A1A]/30 font-medium uppercase tracking-wide">{filledFields}/4</span>
                    <div className="w-20 h-1.5 rounded-full bg-[#1A1A1A]/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#722F37] to-[#D4AF37] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Success banner */}
                {submitSuccess && (
                  <div className="mb-6 flex items-start gap-4 bg-gradient-to-r from-[#556B2F]/10 to-[#556B2F]/5 border border-[#556B2F]/20 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 rounded-full bg-[#556B2F]/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-[#556B2F]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A1A] text-sm">Message envoyé avec succès !</p>
                      <p className="text-[#1A1A1A]/50 text-xs mt-0.5">
                        Merci pour votre message. Nous vous répondrons sous 24 – 48 h ouvrées.
                      </p>
                    </div>
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Email side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                      <Label htmlFor="name" className="text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 mb-2">
                        <User className="h-3.5 w-3.5 text-[#722F37]" />
                        Votre nom <span className="text-red-400 text-xs">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Jean Dupont"
                        required
                        className="h-12 border-[#1A1A1A]/8 focus-visible:ring-[#722F37] bg-[#FFF8F0]/50 hover:border-[#722F37]/30 transition-colors rounded-xl"
                      />
                    </div>
                    <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                      <Label htmlFor="email" className="text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 mb-2">
                        <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Votre email <span className="text-red-400 text-xs">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="jean@exemple.fr"
                        required
                        className="h-12 border-[#1A1A1A]/8 focus-visible:ring-[#722F37] bg-[#FFF8F0]/50 hover:border-[#722F37]/30 transition-colors rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Phone (optional) */}
                  <div className={`relative transition-all duration-200 ${focusedField === 'phone' ? 'scale-[1.01]' : ''}`}>
                    <Label htmlFor="phone" className="text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <Phone className="h-3.5 w-3.5 text-[#556B2F]" />
                      Téléphone <span className="text-[#1A1A1A]/30 text-xs font-normal">(optionnel)</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="06 12 34 56 78"
                      className="h-12 border-[#1A1A1A]/8 focus-visible:ring-[#722F37] bg-[#FFF8F0]/50 hover:border-[#722F37]/30 transition-colors rounded-xl"
                    />
                  </div>

                  {/* Subject */}
                  <div className={`relative transition-all duration-200 ${focusedField === 'subject' ? 'scale-[1.01]' : ''}`}>
                    <Label htmlFor="subject" className="text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <FileText className="h-3.5 w-3.5 text-[#722F37]" />
                      Sujet <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Ex : Demande de devis pour un mariage"
                      required
                      className="h-12 border-[#1A1A1A]/8 focus-visible:ring-[#722F37] bg-[#FFF8F0]/50 hover:border-[#722F37]/30 transition-colors rounded-xl"
                    />
                    {formData.subject && (
                      <div className="absolute right-3 top-[38px] w-5 h-5 rounded-full bg-[#556B2F]/10 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-[#556B2F]" />
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className={`relative transition-all duration-200 ${focusedField === 'message' ? 'scale-[1.01]' : ''}`}>
                    <Label htmlFor="message" className="text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <MessageSquare className="h-3.5 w-3.5 text-[#D4AF37]" />
                      Votre message <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Décrivez votre projet, le nombre d'invités, vos préférences alimentaires, votre budget…"
                      required
                      rows={6}
                      className="flex w-full rounded-xl border border-[#1A1A1A]/8 bg-[#FFF8F0]/50 px-4 py-3 text-sm placeholder:text-[#1A1A1A]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#722F37] focus-visible:ring-offset-2 resize-none hover:border-[#722F37]/30 transition-colors"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-[#1A1A1A]/25">
                        💡 Soyez aussi précis que possible pour un devis plus rapide
                      </p>
                      <p className="text-[10px] text-[#1A1A1A]/25">
                        {formData.message.length} car.
                      </p>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-13 sm:h-12 text-base font-bold shadow-lg shadow-[#722F37]/15 hover:shadow-xl hover:shadow-[#722F37]/25 transition-all rounded-xl"
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
                          <ArrowRight className="h-4 w-4 ml-2 opacity-60" />
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-[#1A1A1A]/25 mt-3">
                      Vos données sont utilisées uniquement pour répondre à votre demande.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ── Sidebar info (2 cols) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Quick contact card — with glassmorphism */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/8 border border-[#1A1A1A]/5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#722F37] to-[#8B3A42] px-5 py-4">
                <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  Coordonnées
                </h2>
                <p className="text-white/50 text-xs mt-0.5">Contactez-nous directement</p>
              </div>

              <div className="p-5 space-y-1">
                <a
                  href={`tel:${siteInfo?.phone || '+33556000000'}`}
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-[#722F37]/5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#722F37]/10 to-[#722F37]/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all">
                    <Phone className="h-5 w-5 text-[#722F37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors">
                      {siteInfo?.phone || '05 56 00 00 00'}
                    </p>
                    <p className="text-[#1A1A1A]/40 text-xs">Lun – Ven, 9 h – 18 h</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A1A1A]/15 group-hover:text-[#722F37]/50 transition-colors shrink-0" />
                </a>

                <a
                  href={`mailto:${siteInfo?.email || 'contact@vite-gourmand.fr'}`}
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-[#D4AF37]/5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all">
                    <Mail className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors truncate">
                      {siteInfo?.email || 'contact@vite-gourmand.fr'}
                    </p>
                    <p className="text-[#1A1A1A]/40 text-xs">Réponse sous 24 – 48 h</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A1A1A]/15 group-hover:text-[#D4AF37]/50 transition-colors shrink-0" />
                </a>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(siteInfo?.address || '15 Rue Sainte-Catherine 33000 Bordeaux')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-[#556B2F]/5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#556B2F]/10 to-[#556B2F]/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all">
                    <MapPin className="h-5 w-5 text-[#556B2F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm group-hover:text-[#722F37] transition-colors">
                      {siteInfo?.address || '15 Rue Sainte-Catherine'}
                    </p>
                    <p className="text-[#1A1A1A]/40 text-xs flex items-center gap-1">
                      Voir sur Google Maps <ExternalLink className="h-2.5 w-2.5" />
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A1A1A]/15 group-hover:text-[#556B2F]/50 transition-colors shrink-0" />
                </a>
              </div>
            </div>

            {/* Hours — redesigned with visual indicators */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/8 border border-[#1A1A1A]/5 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A1A] text-sm">Horaires d'ouverture</h2>
                  <p className="text-[#1A1A1A]/35 text-xs">Service traiteur & accueil</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="bg-[#FFF8F0] rounded-xl p-4 space-y-0.5">
                  {workingHours.length > 0 ? (
                    workingHours.map((row) => {
                      const isClosed = row.opening === row.closing || row.opening === 'Fermé';
                      return (
                        <div
                          key={row.day}
                          className={`flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors ${isClosed ? 'opacity-40' : 'hover:bg-white/60'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isClosed ? 'bg-red-400' : 'bg-[#556B2F]'}`} />
                            <span className="text-[#1A1A1A]/70 text-sm">{row.day}</span>
                          </div>
                          <span className={`font-semibold text-sm ${isClosed ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                            {isClosed ? 'Fermé' : `${row.opening} – ${row.closing}`}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    [
                      { day: 'Lundi – Vendredi', time: '9 h – 18 h', open: true },
                      { day: 'Samedi', time: '10 h – 16 h', open: true },
                      { day: 'Dimanche', time: 'Fermé', open: false },
                    ].map((row) => (
                      <div
                        key={row.day}
                        className={`flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors ${!row.open ? 'opacity-40' : 'hover:bg-white/60'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${row.open ? 'bg-[#556B2F]' : 'bg-red-400'}`} />
                          <span className="text-[#1A1A1A]/70 text-sm">{row.day}</span>
                        </div>
                        <span className={`font-semibold text-sm ${row.open ? 'text-[#1A1A1A]' : 'text-red-500'}`}>
                          {row.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CTA card — Premium gradient */}
            <div className="relative bg-gradient-to-br from-[#722F37] via-[#8B3A42] to-[#722F37] rounded-3xl p-6 text-white overflow-hidden shadow-xl shadow-[#722F37]/20">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-base">Menu sur mesure</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Notre chef crée des menus personnalisés pour sublimer chacun de vos événements. Décrivez votre projet et recevez un devis gratuit.
                </p>
                <div className="flex items-center gap-3 text-[#D4AF37] text-xs font-semibold">
                  <span className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-1.5 rounded-full">
                    ✓ Devis gratuit
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-1.5 rounded-full">
                    ✓ Sans engagement
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-black text-[#722F37] mb-0.5">24h</p>
                <p className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-wider font-semibold">Réponse max.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-black text-[#D4AF37] mb-0.5">100%</p>
                <p className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-wider font-semibold">Gratuit</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-black text-[#556B2F] mb-0.5">5★</p>
                <p className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-wider font-semibold">Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom spacing ── */}
      <div className="h-16" />
    </div>
  );
}
