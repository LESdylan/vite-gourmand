/**
 * OrderPage — Multi-step order flow
 * 
 * Steps:
 * 1. Menu selection (pre-filled if coming from menu detail)
 * 2. Delivery info (address, date, time) — Bordeaux pricing: 5€ base + 0.59€/km outside
 * 3. Person count (10% discount if ≥ min_person + 5) + special instructions
 * 4. Recap / price breakdown → Confirm
 * 
 * All data from real backend API, zero mocks.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChefHat, Users, Euro,
  MapPin, Calendar, Clock, ShoppingCart, AlertTriangle,
  Loader2, Utensils, Truck, Percent, FileText, CheckCircle2,
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
import type { Page } from './Home';

/* ── Constants ── */
const DELIVERY_BASE = 5; // 5€ base delivery price
const DELIVERY_PER_KM = 0.59; // 0.59€ per km outside Bordeaux
const DISCOUNT_THRESHOLD_OVER_MIN = 5; // +5 above min for 10% discount
const DISCOUNT_PERCENT = 10; // 10% discount

const STEPS = [
  { label: 'Menu', icon: Utensils },
  { label: 'Livraison', icon: Truck },
  { label: 'Détails', icon: Users },
  { label: 'Confirmation', icon: Check },
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

  /* ── Auth & profile ── */
  const [profile, setProfile] = useState<AuthUserMapped | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  /* ── Step state ── */
  const [step, setStep] = useState(0);

  /* ── Step 1: Menu selection ── */
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  /* ── Step 2: Delivery ── */
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Bordeaux');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryHour, setDeliveryHour] = useState('12:00');
  const [distanceKm, setDistanceKm] = useState(0);

  /* ── Step 3: Details ── */
  const [personCount, setPersonCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  /* ── Submission ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  /* ── Auth check ── */
  useEffect(() => {
    if (!isAuthenticated()) {
      addToast('Veuillez vous connecter pour passer commande.', 'warning', 6000);
      window.location.href = '/portal';
      return;
    }
    getProfile()
      .then(setProfile)
      .catch(() => {
        addToast('Impossible de récupérer votre profil.', 'error');
      })
      .finally(() => setProfileLoading(false));
  }, [addToast]);

  /* ── Load menus ── */
  useEffect(() => {
    getMenus({ limit: 100, status: 'published' })
      .then(({ menus }) => {
        setAllMenus(menus);
        // Pre-select if coming from Menus page
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

  /* ── When menu changes, reset person count to min ── */
  const handleMenuSelect = useCallback((menu: Menu) => {
    setSelectedMenu(menu);
    setPersonCount(menu.minPersons);
  }, []);

  /* ── Price calculations ── */
  const pricing = useMemo(() => {
    if (!selectedMenu) return { menuTotal: 0, delivery: DELIVERY_BASE, discount: 0, total: 0, hasDiscount: false };

    const menuTotal = selectedMenu.pricePerPerson * personCount;
    const delivery = DELIVERY_BASE + (distanceKm > 0 ? distanceKm * DELIVERY_PER_KM : 0);
    const overMin = personCount - selectedMenu.minPersons;
    const hasDiscount = overMin >= DISCOUNT_THRESHOLD_OVER_MIN;
    const discountPercent = hasDiscount ? DISCOUNT_PERCENT : 0;
    const discount = menuTotal * (discountPercent / 100);
    const total = menuTotal + delivery - discount;

    return { menuTotal, delivery, discount, total, hasDiscount, discountPercent };
  }, [selectedMenu, personCount, distanceKm]);

  /* ── Validation per step ── */
  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!selectedMenu;
      case 1: return deliveryAddress.trim().length >= 5 && deliveryDate !== '' && /^([01]\d|2[0-3]):[0-5]\d$/.test(deliveryHour);
      case 2: return selectedMenu ? personCount >= selectedMenu.minPersons : false;
      case 3: return true;
      default: return false;
    }
  }, [step, selectedMenu, deliveryAddress, deliveryDate, deliveryHour, personCount]);

  /* ── Submit order ── */
  const handleSubmit = async () => {
    if (!selectedMenu || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data: CreateOrderData = {
        menuId: selectedMenu.numericId,
        deliveryDate,
        deliveryHour,
        deliveryAddress: `${deliveryAddress}, ${deliveryCity}`,
        personNumber: personCount,
        menuPrice: selectedMenu.pricePerPerson,
        totalPrice: Math.round(pricing.total * 100) / 100,
        specialInstructions: specialInstructions.trim() || undefined,
      };
      const order = await createOrder(data);
      setOrderSuccess(order.order_number);
      addToast('Commande passée avec succès ! 🎉', 'success', 8000);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Erreur lors de la création de la commande.',
        'error',
        6000,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading / redirect states ── */
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-[#722F37] animate-spin mx-auto mb-3" />
          <p className="text-[#1A1A1A]/60">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  /* ── Order success state ── */
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-[#556B2F]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#556B2F]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Commande confirmée !</h2>
          <p className="text-[#1A1A1A]/60 mb-4">
            Votre commande <span className="font-mono font-bold text-[#722F37]">{orderSuccess}</span> a été enregistrée.
          </p>
          <p className="text-sm text-[#1A1A1A]/50 mb-6">
            Vous recevrez un email de confirmation. Vous pouvez suivre l'état de votre commande depuis votre espace client.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setCurrentPage('menu')} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux menus
            </Button>
            <Button onClick={() => setCurrentPage('home')} className="flex-1">
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
      <header className="bg-[#1A1A1A] pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux menus
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#722F37] rounded-full p-2">
              <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Passer commande</h1>
              {profile && (
                <p className="text-white/40 text-sm mt-0.5">
                  Bonjour {profile.name} · {profile.email}
                </p>
              )}
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-[#1A1A1A]/5 overflow-hidden">
          <div className="p-5 sm:p-8 min-h-[400px]">

            {/* ═══ Step 0: Menu Selection ═══ */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-[#722F37]" /> Choisissez votre menu
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Sélectionnez le menu de votre choix pour votre événement.
                </p>

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
                    {selectedMenu.deliveryNotes && (
                      <div className="mt-3 bg-[#722F37] text-white text-xs rounded-lg p-3 ring-1 ring-[#D4AF37]">
                        <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-[#D4AF37]" />
                        {selectedMenu.deliveryNotes}
                      </div>
                    )}
                  </div>
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
                  Indiquez l'adresse et la date de livraison souhaitée.
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div>
                      <Label htmlFor="distance" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                        Distance (km)
                      </Label>
                      <Input
                        id="distance"
                        type="number"
                        min="0"
                        step="0.1"
                        value={distanceKm || ''}
                        onChange={e => setDistanceKm(parseFloat(e.target.value) || 0)}
                        placeholder="0 (Bordeaux)"
                        className="h-11 border-[#1A1A1A]/10 focus-visible:ring-[#722F37]"
                      />
                      <p className="text-[10px] text-[#1A1A1A]/40 mt-1">0 km = centre Bordeaux</p>
                    </div>
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

                  {/* Delivery pricing info */}
                  <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#D4AF37]/20">
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#722F37]" /> Tarification livraison
                    </h3>
                    <div className="space-y-1 text-xs text-[#1A1A1A]/60">
                      <div className="flex justify-between">
                        <span>Base (Bordeaux)</span>
                        <span className="font-medium text-[#1A1A1A]">{DELIVERY_BASE.toFixed(2)} €</span>
                      </div>
                      {distanceKm > 0 && (
                        <div className="flex justify-between">
                          <span>Supplément ({distanceKm} km × {DELIVERY_PER_KM.toFixed(2)} €)</span>
                          <span className="font-medium text-[#1A1A1A]">+ {(distanceKm * DELIVERY_PER_KM).toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-[#1A1A1A]/10 font-bold text-[#1A1A1A]">
                        <span>Total livraison</span>
                        <span>{pricing.delivery.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 2: Person Count & Instructions ═══ */}
            {step === 2 && selectedMenu && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#722F37]" /> Nombre de convives
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Le menu <strong>{selectedMenu.name}</strong> requiert un minimum de {selectedMenu.minPersons} personnes.
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
                        onClick={() => setPersonCount(c => Math.max(selectedMenu.minPersons, c - 1))}
                        disabled={personCount <= selectedMenu.minPersons}
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

                    {/* Discount info */}
                    {pricing.hasDiscount ? (
                      <div className="mt-3 bg-[#556B2F]/10 rounded-lg p-3 text-sm text-[#556B2F] flex items-center gap-2">
                        <Percent className="h-4 w-4 shrink-0" />
                        <span>
                          Réduction de <strong>{DISCOUNT_PERCENT}%</strong> appliquée ! 
                          ({personCount - selectedMenu.minPersons} personnes au-dessus du minimum)
                        </span>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-[#1A1A1A]/40">
                        💡 Ajoutez {selectedMenu.minPersons + DISCOUNT_THRESHOLD_OVER_MIN - personCount} personne{selectedMenu.minPersons + DISCOUNT_THRESHOLD_OVER_MIN - personCount > 1 ? 's' : ''} de plus pour bénéficier d'une réduction de {DISCOUNT_PERCENT}%.
                      </p>
                    )}
                  </div>

                  {/* Live price preview */}
                  <div className="bg-white rounded-xl border border-[#1A1A1A]/10 p-4">
                    <div className="flex justify-between text-sm text-[#1A1A1A]/60 mb-1">
                      <span>{selectedMenu.pricePerPerson.toFixed(2)} € × {personCount} pers.</span>
                      <span className="font-medium text-[#1A1A1A]">{pricing.menuTotal.toFixed(2)} €</span>
                    </div>
                    {pricing.hasDiscount && (
                      <div className="flex justify-between text-sm text-[#556B2F] mb-1">
                        <span>Réduction {DISCOUNT_PERCENT}%</span>
                        <span>- {pricing.discount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-[#1A1A1A]/60 mb-1">
                      <span>Livraison</span>
                      <span className="font-medium text-[#1A1A1A]">{pricing.delivery.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#722F37] pt-2 mt-2 border-t border-[#1A1A1A]/10">
                      <span>Total estimé</span>
                      <span>{pricing.total.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Special instructions */}
                  <div>
                    <Label htmlFor="instructions" className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">
                      <FileText className="h-3.5 w-3.5 inline mr-1" /> Instructions spéciales (optionnel)
                    </Label>
                    <textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={e => setSpecialInstructions(e.target.value)}
                      rows={3}
                      placeholder="Allergies, préférences, accès au lieu de livraison..."
                      className="w-full rounded-lg border border-[#1A1A1A]/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37] resize-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 3: Recap & Confirmation ═══ */}
            {step === 3 && selectedMenu && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#556B2F]" /> Récapitulatif de commande
                </h2>
                <p className="text-sm text-[#1A1A1A]/50 mb-5">
                  Vérifiez les détails avant de confirmer votre commande.
                </p>

                <div className="space-y-4">
                  {/* Menu recap */}
                  <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#1A1A1A]/5">
                    <h3 className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Menu sélectionné</h3>
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
                      {specialInstructions && (
                        <div className="col-span-2">
                          <p className="text-[#1A1A1A]/50 text-xs">Instructions</p>
                          <p className="font-medium text-[#1A1A1A] text-xs">{specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-white rounded-xl border-2 border-[#722F37]/20 p-5">
                    <h3 className="text-xs font-bold text-[#722F37] uppercase tracking-wide mb-3">Détail du prix</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#1A1A1A]/60">
                        <span>Menu ({selectedMenu.pricePerPerson.toFixed(2)} € × {personCount} pers.)</span>
                        <span className="font-medium text-[#1A1A1A]">{pricing.menuTotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-[#1A1A1A]/60">
                        <span>Livraison {distanceKm > 0 ? `(${distanceKm} km)` : '(Bordeaux)'}</span>
                        <span className="font-medium text-[#1A1A1A]">{pricing.delivery.toFixed(2)} €</span>
                      </div>
                      {pricing.hasDiscount && (
                        <div className="flex justify-between text-[#556B2F]">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5" /> Réduction {DISCOUNT_PERCENT}%
                          </span>
                          <span className="font-medium">- {pricing.discount.toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-[#722F37] pt-3 mt-3 border-t-2 border-[#722F37]/10">
                        <span>Total</span>
                        <span>{pricing.total.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions reminder */}
                  {selectedMenu.deliveryNotes && (
                    <div className="bg-[#722F37] rounded-xl p-4 text-white ring-2 ring-[#D4AF37] ring-offset-2">
                      <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-[#D4AF37]" /> Conditions
                      </h3>
                      <p className="text-white/90 text-sm">{selectedMenu.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer navigation */}
          <div className="bg-[#FFF8F0] border-t border-[#1A1A1A]/5 px-5 sm:px-8 py-4 flex items-center justify-between">
            <Button
              onClick={() => setStep(s => Math.max(0, s - 1))}
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
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed}
                className="min-w-[180px] bg-[#556B2F] hover:bg-[#475a27] shadow-lg shadow-[#556B2F]/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi en cours...</>
                ) : (
                  <><ShoppingCart className="h-4 w-4 mr-2" /> Confirmer la commande</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-[#1A1A1A]/30 mt-6 mb-8">
          En confirmant, vous acceptez nos conditions générales de vente.
          Paiement à la livraison ou par virement. Annulation possible jusqu'à 48h avant la livraison.
        </p>
      </div>
    </div>
  );
}
