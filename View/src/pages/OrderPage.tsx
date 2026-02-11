/**
 * OrderPage — Multi-step order flow (No payment)
 * 
 * Steps:
 * 1. Menu selection (pre-filled if coming from menu detail) — OR custom request
 * 2. Delivery info (address, date, time)
 * 3. Person count + special instructions / custom message
 * 4. Recap → If not logged in, prompt to create account to retain order.
 *    Otherwise, send request message directly.
 * 
 * No payment required — the user sends a request message with the
 * desired menu (or a custom one). The restaurant contacts them back.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChefHat, Users, Euro,
  MapPin, Calendar, Clock, AlertTriangle,
  Loader2, Utensils, Truck, FileText, CheckCircle2,
  MessageSquare, UserPlus, LogIn, Send, Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useToast } from '../contexts/ToastContext';
import { isAuthenticated } from '../services/api';
import { getProfile, type AuthUserMapped } from '../services/auth';
import { getMenus, type Menu } from '../services/menus';
import { createOrder, type CreateOrderData } from '../services/orders';
import LazyImage from '../components/ui/LazyImage';
import AiMenuComposer from '../components/AiMenuComposer';
import type { Page } from './Home';

/* ── Constants ── */
const STEPS = [
  { label: 'Menu', icon: Utensils },
  { label: 'Livraison', icon: Truck },
  { label: 'Détails', icon: Users },
  { label: 'Récapitulatif', icon: Check },
] as const;

/* ── Props ── */
interface OrderPageProps {
  setCurrentPage: (page: Page) => void;
  /** Pre-selected menu numeric ID from Menus page */
  preSelectedMenuId?: number | null;
}

/* ── Helpers ── */
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2); // minimum 48h notice
  return formatDate(d);
}

function getMaxDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3); // 3 months max ahead
  return formatDate(d);
}

/* ══════════════════════════════════════════════════════════
   Step Indicator
   ══════════════════════════════════════════════════════════ */
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 sm:gap-1">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-sm font-bold
                  ${isCompleted
                    ? 'bg-[#556B2F] text-white'
                    : isActive
                    ? 'bg-[#722F37] text-white shadow-lg shadow-[#722F37]/30'
                    : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/30'
                  }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium transition-colors
                  ${isActive ? 'text-[#722F37]' : isCompleted ? 'text-[#556B2F]' : 'text-[#1A1A1A]/30'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 mb-5 transition-colors ${
                  i < currentStep ? 'bg-[#556B2F]' : 'bg-[#1A1A1A]/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Mini Menu Card (for selection in step 1)
   ══════════════════════════════════════════════════════════ */
function MiniMenuCard({
  menu, selected, onSelect,
}: {
  menu: Menu; selected: boolean; onSelect: (m: Menu) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(menu)}
      className={`text-left w-full rounded-xl border-2 overflow-hidden transition-all duration-200
        ${selected
          ? 'border-[#722F37] ring-2 ring-[#722F37]/20 shadow-lg'
          : 'border-[#1A1A1A]/10 hover:border-[#722F37]/40 hover:shadow-md'
        }`}
    >
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#1A1A1A]/5">
          <LazyImage src={menu.image} alt={menu.name} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[#1A1A1A] text-sm line-clamp-1">{menu.name}</h4>
          <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
            {menu.theme} · Min. {menu.minPersons} pers.
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-[#722F37]">{menu.pricePerPerson.toFixed(0)} €<span className="text-xs font-normal text-[#1A1A1A]/50">/pers.</span></span>
            {selected && (
              <Badge className="bg-[#722F37] text-white border-0 text-[10px]">
                <Check className="h-3 w-3 mr-0.5" /> Sélectionné
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Main OrderPage Component
   ══════════════════════════════════════════════════════════ */
export default function OrderPage({ setCurrentPage, preSelectedMenuId }: OrderPageProps) {
  const { addToast } = useToast();

  /* ── Auth & profile (optional — user can browse without being logged in) ── */
  const [profile, setProfile] = useState<AuthUserMapped | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  /* ── Step state ── */
  const [step, setStep] = useState(0);

  /* ── Step 1: Menu selection ── */
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isCustomRequest, setIsCustomRequest] = useState(false);
  const [customMenuDescription, setCustomMenuDescription] = useState('');

  /* ── Step 2: Delivery ── */
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Bordeaux');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryHour, setDeliveryHour] = useState('12:00');

  /* ── Step 3: Details ── */
  const [personCount, setPersonCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  /* ── Auth prompt state (step 4) ── */
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  /* ── Submission ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  /* ── Check auth & load profile silently (no redirect) ── */
  useEffect(() => {
    if (isAuthenticated()) {
      setLoggedIn(true);
      getProfile()
        .then(setProfile)
        .catch(() => {});
    }
  }, []);

  /* ── Load menus ── */
  useEffect(() => {
    getMenus({ limit: 100, status: 'published' })
      .then(({ menus }) => {
        setAllMenus(menus);
        if (preSelectedMenuId) {
          const found = menus.find(m => m.numericId === preSelectedMenuId);
          if (found) {
            setSelectedMenu(found);
            setPersonCount(found.minPersons);
          }
        }
      })
      .catch(() => addToast('Impossible de charger les menus.', 'error'))
      .finally(() => setMenusLoading(false));
  }, [preSelectedMenuId, addToast]);

  /* ── When menu changes, reset person count ── */
  const handleMenuSelect = useCallback((menu: Menu) => {
    setSelectedMenu(menu);
    setIsCustomRequest(false);
    setPersonCount(menu.minPersons);
  }, []);

  /* ── Price info (informational only — no payment) ── */
  const priceInfo = useMemo(() => {
    if (!selectedMenu) return { perPerson: 0, total: 0 };
    return {
      perPerson: selectedMenu.pricePerPerson,
      total: selectedMenu.pricePerPerson * personCount,
    };
  }, [selectedMenu, personCount]);

  /* ── Validation per step ── */
  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!selectedMenu || (isCustomRequest && customMenuDescription.trim().length >= 10);
      case 1: return deliveryAddress.trim().length >= 5 && deliveryDate !== '' && /^([01]\d|2[0-3]):[0-5]\d$/.test(deliveryHour);
      case 2: return isCustomRequest ? personCount >= 1 : (selectedMenu ? personCount >= selectedMenu.minPersons : false);
      case 3: return true;
      default: return false;
    }
  }, [step, selectedMenu, isCustomRequest, customMenuDescription, deliveryAddress, deliveryDate, deliveryHour, personCount]);

  /* ── Handle "Send Request" — requires account ── */
  const handleSendRequest = async () => {
    // If not logged in, show auth prompt instead of submitting
    if (!loggedIn) {
      setShowAuthPrompt(true);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isCustomRequest) {
        // For custom requests, create an order with special instructions
        const data: CreateOrderData = {
          deliveryDate,
          deliveryHour,
          deliveryAddress: `${deliveryAddress}, ${deliveryCity}`,
          personNumber: personCount,
          menuPrice: 0,
          totalPrice: 0,
          specialInstructions: `[DEMANDE PERSONNALISÉE]\n${customMenuDescription}\n\n${specialInstructions.trim() ? `Instructions: ${specialInstructions}` : ''}`.trim(),
        };
        const order = await createOrder(data);
        setOrderSuccess(order.order_number);
      } else if (selectedMenu) {
        const data: CreateOrderData = {
          menuId: selectedMenu.numericId,
          deliveryDate,
          deliveryHour,
          deliveryAddress: `${deliveryAddress}, ${deliveryCity}`,
          personNumber: personCount,
          menuPrice: selectedMenu.pricePerPerson,
          totalPrice: Math.round(priceInfo.total * 100) / 100,
          specialInstructions: specialInstructions.trim() || undefined,
        };
        const order = await createOrder(data);
        setOrderSuccess(order.order_number);
      }
      addToast('Demande envoyée avec succès ! Nous vous contacterons bientôt. 🎉', 'success', 8000);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la demande.',
        'error',
        6000,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Order success state ── */
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border border-[#D4AF37]/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#556B2F]/10 to-[#556B2F]/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[#556B2F]" />
          </div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">Demande envoyée !</h2>
          <p className="text-[#1A1A1A]/60 mb-2">
            Référence : <span className="font-mono font-bold text-[#722F37] bg-[#722F37]/5 px-2 py-0.5 rounded">{orderSuccess}</span>
          </p>
          <div className="bg-[#FFF8F0] rounded-2xl p-5 mb-6 text-left border border-[#D4AF37]/10">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#722F37] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Et maintenant ?</p>
                <ul className="text-xs text-[#1A1A1A]/60 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#722F37]/10 text-[#722F37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    Notre équipe reçoit votre demande et l'examine.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#722F37]/10 text-[#722F37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    Nous vous contactons pour confirmer les détails.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#722F37]/10 text-[#722F37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    Aucun paiement en ligne — tout se règle à la livraison.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setCurrentPage('menu')} variant="outline" className="flex-1 h-11">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux menus
            </Button>
            <Button onClick={() => setCurrentPage('home')} className="flex-1 h-11">
              Accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="relative bg-[#1A1A1A] pt-6 pb-10 sm:pt-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#722F37]/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl translate-y-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux menus
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#722F37] to-[#8B3A42] rounded-full p-2.5 shadow-lg shadow-[#722F37]/20">
              <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Votre demande</h1>
              <p className="text-white/30 text-xs sm:text-sm mt-0.5">
                {profile ? `${profile.name} · ${profile.email}` : 'Pas de paiement en ligne — nous vous recontactons'}
              </p>
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-[#1A1A1A]/5 overflow-hidden">
          <div className="p-5 sm:p-8 min-h-[400px]">

            {/* ═══ Step 0: Menu Selection — with custom request option ═══ */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-[#722F37]" /> Choisissez votre menu
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Sélectionnez un menu existant ou décrivez votre demande personnalisée.
                </p>

                {/* Toggle: Existing menu / Custom request */}
                <div className="flex gap-2 mb-5 p-1 bg-[#1A1A1A]/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setIsCustomRequest(false); setSelectedMenu(null); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                      ${!isCustomRequest
                        ? 'bg-white text-[#722F37] shadow-sm'
                        : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60'
                      }`}
                  >
                    <Utensils className="h-4 w-4 inline mr-1.5" />
                    Menu existant
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsCustomRequest(true); setSelectedMenu(null); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                      ${isCustomRequest
                        ? 'bg-white text-[#722F37] shadow-sm'
                        : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60'
                      }`}
                  >
                    <Sparkles className="h-4 w-4 inline mr-1.5" />
                    Menu personnalisé
                  </button>
                </div>

                {!isCustomRequest ? (
                  <>
                    {menusLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-[#722F37] animate-spin" />
                      </div>
                    ) : allMenus.length === 0 ? (
                      <div className="text-center py-12">
                        <ChefHat className="h-10 w-10 text-[#1A1A1A]/20 mx-auto mb-3" />
                        <p className="text-[#1A1A1A]/50">Aucun menu disponible pour le moment.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {allMenus
                          .filter(m => m.stockQuantity > 0)
                          .map(menu => (
                            <MiniMenuCard
                              key={menu.id}
                              menu={menu}
                              selected={selectedMenu?.id === menu.id}
                              onSelect={handleMenuSelect}
                            />
                          ))}
                      </div>
                    )}

                    {selectedMenu && (
                      <div className="mt-5 bg-[#FFF8F0] rounded-xl p-4 border border-[#D4AF37]/20">
                        <h3 className="font-bold text-[#1A1A1A] text-sm mb-1">{selectedMenu.name}</h3>
                        <p className="text-xs text-[#1A1A1A]/50 line-clamp-2">{selectedMenu.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#1A1A1A]/60">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-[#722F37]" /> Min. {selectedMenu.minPersons} pers.</span>
                          <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5 text-[#556B2F]" /> {selectedMenu.pricePerPerson.toFixed(2)} €/pers.</span>
                          {selectedMenu.allergens.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> {selectedMenu.allergens.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* AI-powered custom menu composer */
                  <AiMenuComposer
                    onBriefReady={(brief) => {
                      setCustomMenuDescription(brief);
                    }}
                  />
                )}
              </div>
            )}

            {/* ═══ Step 1: Delivery Info ═══ */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#722F37]" /> Informations de livraison
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Indiquez où et quand vous souhaitez être livré.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                      Adresse de livraison *
                    </Label>
                    <Input
                      id="address"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="123 rue de la Paix"
                      className="h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                      Ville *
                    </Label>
                    <Input
                      id="city"
                      value={deliveryCity}
                      onChange={e => setDeliveryCity(e.target.value)}
                      placeholder="Bordeaux"
                      className="h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                        <Calendar className="h-3.5 w-3.5 inline mr-1" /> Date de livraison *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        className="h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                      />
                      <p className="text-[10px] text-[#1A1A1A]/40 mt-1">Minimum 48h à l'avance</p>
                    </div>
                    <div>
                      <Label htmlFor="hour" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                        <Clock className="h-3.5 w-3.5 inline mr-1" /> Heure de livraison *
                      </Label>
                      <Input
                        id="hour"
                        type="time"
                        min="08:00"
                        max="22:00"
                        value={deliveryHour}
                        onChange={e => setDeliveryHour(e.target.value)}
                        className="h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                      />
                      <p className="text-[10px] text-[#1A1A1A]/40 mt-1">Entre 08h00 et 22h00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 2: Person Count & Instructions ═══ */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#722F37]" /> Nombre de convives
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  {selectedMenu
                    ? <>Le menu <strong>{selectedMenu.name}</strong> requiert un minimum de {selectedMenu.minPersons} personnes.</>
                    : 'Indiquez le nombre de personnes attendues.'
                  }
                </p>

                <div className="space-y-5">
                  {/* Person counter */}
                  <div className="bg-[#FFF8F0] rounded-xl p-5 border border-[#1A1A1A]/5">
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-3 block">
                      Nombre de personnes *
                    </Label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setPersonCount(c => Math.max(selectedMenu?.minPersons ?? 1, c - 1))}
                        disabled={personCount <= (selectedMenu?.minPersons ?? 1)}
                        className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-lg disabled:opacity-30 hover:bg-[#722F37] hover:text-white hover:border-[#722F37] transition-all"
                      >
                        −
                      </button>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-[#722F37]">{personCount}</span>
                        <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-wide">personne{personCount > 1 ? 's' : ''}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPersonCount(c => c + 1)}
                        className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-lg hover:bg-[#722F37] hover:text-white hover:border-[#722F37] transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price indication (informational) */}
                  {selectedMenu && (
                    <div className="bg-white rounded-xl border border-[#1A1A1A]/10 p-4">
                      <h3 className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Estimation indicative</h3>
                      <div className="flex justify-between text-sm text-[#1A1A1A]/60 mb-1">
                        <span>{selectedMenu.pricePerPerson.toFixed(2)} € × {personCount} pers.</span>
                        <span className="font-medium text-[#1A1A1A]">{priceInfo.total.toFixed(2)} €</span>
                      </div>
                      <p className="text-[10px] text-[#1A1A1A]/30 mt-2 italic">
                        * Prix indicatif. Le montant final sera confirmé par notre équipe. Aucun paiement en ligne.
                      </p>
                    </div>
                  )}

                  {/* Special instructions */}
                  <div>
                    <Label htmlFor="instructions" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                      <FileText className="h-3.5 w-3.5 inline mr-1" /> Message complémentaire (optionnel)
                    </Label>
                    <textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={e => setSpecialInstructions(e.target.value)}
                      rows={3}
                      placeholder="Allergies, préférences, accès au lieu de livraison, questions..."
                      className="w-full rounded-lg border border-[#1A1A1A]/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37] resize-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 3: Recap ═══ */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#556B2F]" /> Récapitulatif de votre demande
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Vérifiez les détails avant d'envoyer votre demande.
                </p>

                <div className="space-y-4">
                  {/* Menu recap */}
                  <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#1A1A1A]/5">
                    <h3 className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-wide mb-2">
                      {isCustomRequest ? 'Menu personnalisé' : 'Menu sélectionné'}
                    </h3>
                    {isCustomRequest ? (
                      <div className="bg-white rounded-lg p-3 border border-[#D4AF37]/10">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <p className="text-sm text-[#1A1A1A]">{customMenuDescription}</p>
                        </div>
                      </div>
                    ) : selectedMenu && (
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#1A1A1A]/5">
                          <LazyImage src={selectedMenu.image} alt={selectedMenu.name} className="w-full h-full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1A1A1A]">{selectedMenu.name}</h4>
                          <p className="text-xs text-[#1A1A1A]/50">{selectedMenu.theme} · {selectedMenu.dietary.join(', ')}</p>
                          <p className="text-sm font-bold text-[#722F37] mt-1">{selectedMenu.pricePerPerson.toFixed(2)} € / personne</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery recap */}
                  <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#1A1A1A]/5">
                    <h3 className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Livraison</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[#1A1A1A]/50 text-xs">Adresse</p>
                        <p className="font-medium text-[#1A1A1A]">{deliveryAddress}, {deliveryCity}</p>
                      </div>
                      <div>
                        <p className="text-[#1A1A1A]/50 text-xs">Date & heure</p>
                        <p className="font-medium text-[#1A1A1A]">
                          {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          {' '}à {deliveryHour}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details recap */}
                  <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#1A1A1A]/5">
                    <h3 className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Détails</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[#1A1A1A]/50 text-xs">Nombre de personnes</p>
                        <p className="font-medium text-[#1A1A1A]">{personCount}</p>
                      </div>
                      {selectedMenu && (
                        <div>
                          <p className="text-[#1A1A1A]/50 text-xs">Estimation</p>
                          <p className="font-medium text-[#722F37]">≈ {priceInfo.total.toFixed(2)} €</p>
                        </div>
                      )}
                      {specialInstructions && (
                        <div className="col-span-2">
                          <p className="text-[#1A1A1A]/50 text-xs">Message</p>
                          <p className="font-medium text-[#1A1A1A] text-xs">{specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info: no payment */}
                  <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#556B2F]/10 rounded-xl p-4 border border-[#556B2F]/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#556B2F]/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-[#556B2F]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#556B2F] mb-1">Aucun paiement requis</h3>
                        <p className="text-xs text-[#1A1A1A]/50 leading-relaxed">
                          En envoyant cette demande, vous ne payez rien. Notre équipe vous contactera pour confirmer
                          les détails, le prix final et les modalités de livraison. Le règlement se fait à la livraison.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conditions reminder */}
                  {selectedMenu?.deliveryNotes && (
                    <div className="bg-[#722F37] rounded-xl p-4 text-white ring-2 ring-[#D4AF37] ring-offset-2">
                      <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-[#D4AF37]" /> Conditions
                      </h3>
                      <p className="text-white/90 text-sm">{selectedMenu.deliveryNotes}</p>
                    </div>
                  )}

                  {/* ── Auth prompt overlay ── */}
                  {showAuthPrompt && !loggedIn && (
                    <div className="bg-white rounded-2xl border-2 border-[#722F37]/20 p-6 shadow-lg">
                      <div className="text-center mb-5">
                        <div className="w-14 h-14 mx-auto mb-3 bg-[#722F37]/10 rounded-full flex items-center justify-center">
                          <UserPlus className="h-7 w-7 text-[#722F37]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Créez un compte pour envoyer</h3>
                        <p className="text-sm text-[#1A1A1A]/50 max-w-sm mx-auto">
                          Pour conserver votre demande et que nous puissions vous recontacter,
                          connectez-vous ou créez un compte gratuit.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => {
                            // Store order data in sessionStorage before redirecting
                            sessionStorage.setItem('vg_pending_order', JSON.stringify({
                              selectedMenuId: selectedMenu?.numericId,
                              isCustomRequest,
                              customMenuDescription,
                              deliveryAddress,
                              deliveryCity,
                              deliveryDate,
                              deliveryHour,
                              personCount,
                              specialInstructions,
                            }));
                            window.location.href = '/portal';
                          }}
                          className="flex-1 h-11"
                        >
                          <LogIn className="h-4 w-4 mr-2" /> Se connecter
                        </Button>
                        <Button
                          onClick={() => {
                            sessionStorage.setItem('vg_pending_order', JSON.stringify({
                              selectedMenuId: selectedMenu?.numericId,
                              isCustomRequest,
                              customMenuDescription,
                              deliveryAddress,
                              deliveryCity,
                              deliveryDate,
                              deliveryHour,
                              personCount,
                              specialInstructions,
                            }));
                            window.location.href = '/portal';
                          }}
                          variant="outline"
                          className="flex-1 h-11 border-[#722F37]/20 text-[#722F37] hover:bg-[#722F37]/5"
                        >
                          <UserPlus className="h-4 w-4 mr-2" /> Créer un compte
                        </Button>
                      </div>
                      <button
                        onClick={() => setShowAuthPrompt(false)}
                        className="w-full mt-3 text-xs text-[#1A1A1A]/30 hover:text-[#1A1A1A]/50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer navigation */}
          <div className="bg-[#FFF8F0] border-t border-[#1A1A1A]/5 px-5 sm:px-8 py-4 flex items-center justify-between">
            <Button
              onClick={() => { setStep(s => Math.max(0, s - 1)); setShowAuthPrompt(false); }}
              variant="ghost"
              disabled={step === 0}
              className="text-[#1A1A1A]/60"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed}
                className="min-w-[140px]"
              >
                Suivant <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSendRequest}
                disabled={isSubmitting || !canProceed || showAuthPrompt}
                className="min-w-[180px] bg-[#556B2F] hover:bg-[#475a27] shadow-lg shadow-[#556B2F]/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi en cours...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Envoyer la demande</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-[#1A1A1A]/30 mt-6 mb-8">
          Aucun paiement en ligne. Notre équipe vous recontacte pour confirmer votre commande.
          Annulation possible jusqu'à 48h avant la livraison.
        </p>
      </div>
    </div>
  );
}
