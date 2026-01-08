import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, ArrowRight, Loader2, User, MapPin, Calendar,
  Clock, Users, Euro, Check, AlertTriangle, Truck, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Order() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedMenuId = urlParams.get('menuId');

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_date: '',
    delivery_time: '',
    menu_id: preselectedMenuId || '',
    num_persons: 0,
    distance_km: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          user_name: currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
          user_email: currentUser.email || '',
          user_phone: currentUser.phone || '',
          delivery_address: currentUser.address || '',
          delivery_city: currentUser.city || '',
        }));
      } catch (e) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const menuData = await base44.entities.Menu.filter({ is_active: true });
      setMenus(menuData);

      if (preselectedMenuId) {
        const preMenu = menuData.find(m => m.id === preselectedMenuId);
        if (preMenu) {
          setSelectedMenu(preMenu);
          setFormData(prev => ({ 
            ...prev, 
            menu_id: preselectedMenuId,
            num_persons: preMenu.min_persons 
          }));
        }
      }

      setLoading(false);
    };
    loadData();
  }, [preselectedMenuId]);

  const handleMenuChange = (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    setSelectedMenu(menu);
    setFormData(prev => ({ 
      ...prev, 
      menu_id: menuId,
      num_persons: menu?.min_persons || 0
    }));
  };

  const isBordeaux = formData.delivery_city.toLowerCase().includes('bordeaux');
  const deliveryPrice = isBordeaux ? 0 : (5 + (formData.distance_km * 0.59));
  
  const extraPersons = selectedMenu ? Math.max(0, formData.num_persons - selectedMenu.min_persons) : 0;
  const menuBasePrice = selectedMenu?.base_price || 0;
  const pricePerExtraPerson = selectedMenu?.price_per_person || (menuBasePrice / (selectedMenu?.min_persons || 1));
  const menuPrice = menuBasePrice + (extraPersons * pricePerExtraPerson);
  
  // Réduction de 10% si 5 personnes de plus que le minimum
  const qualifiesForDiscount = selectedMenu && formData.num_persons >= (selectedMenu.min_persons + 5);
  const discountAmount = qualifiesForDiscount ? menuPrice * 0.10 : 0;
  
  const totalPrice = menuPrice - discountAmount + deliveryPrice;

  const minDate = selectedMenu?.advance_days 
    ? format(addDays(new Date(), selectedMenu.advance_days), 'yyyy-MM-dd')
    : format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const validateStep1 = () => {
    return formData.user_name && formData.user_email && formData.user_phone &&
           formData.delivery_address && formData.delivery_city &&
           formData.delivery_date && formData.delivery_time;
  };

  const validateStep2 = () => {
    return formData.menu_id && formData.num_persons >= (selectedMenu?.min_persons || 1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);
    try {
      const orderData = {
        user_id: user.id,
        user_email: formData.user_email,
        user_name: formData.user_name,
        user_phone: formData.user_phone,
        menu_id: formData.menu_id,
        menu_title: selectedMenu.title,
        num_persons: formData.num_persons,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_date: formData.delivery_date,
        delivery_time: formData.delivery_time,
        distance_km: isBordeaux ? 0 : formData.distance_km,
        menu_price: menuPrice,
        delivery_price: deliveryPrice,
        discount_applied: discountAmount,
        total_price: totalPrice,
        status: 'en_attente',
        status_history: [{
          status: 'en_attente',
          date: new Date().toISOString(),
          comment: 'Commande créée'
        }]
      };

      await base44.entities.Order.create(orderData);

      // Envoyer email de confirmation
      await base44.integrations.Core.SendEmail({
        to: formData.user_email,
        subject: `Confirmation de votre commande - Vite & Gourmand`,
        body: `
Bonjour ${formData.user_name},

Nous avons bien reçu votre commande !

Détails de votre commande :
- Menu : ${selectedMenu.title}
- Nombre de personnes : ${formData.num_persons}
- Date de livraison : ${format(new Date(formData.delivery_date), 'dd MMMM yyyy', { locale: fr })}
- Heure : ${formData.delivery_time}
- Adresse : ${formData.delivery_address}, ${formData.delivery_city}

Montant total : ${totalPrice.toFixed(2)}€

Notre équipe va traiter votre commande dans les plus brefs délais.

À très bientôt !
L'équipe Vite & Gourmand
        `
      });

      setOrderComplete(true);
    } catch (e) {
      console.error('Erreur commande:', e);
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Commande confirmée !</h2>
          <p className="text-[#2C2C2C]/70 mb-6">
            Votre commande a bien été enregistrée. Un email de confirmation vous a été envoyé.
          </p>
          <div className="space-y-3">
            <Link to={createPageUrl('UserOrders')}>
              <Button className="w-full bg-[#722F37] hover:bg-[#8B4049]">
                Voir mes commandes
              </Button>
            </Link>
            <Link to={createPageUrl('Menus')}>
              <Button variant="outline" className="w-full">
                Retour aux menus
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('Menus')}>
          <Button variant="ghost" className="mb-6 text-[#722F37]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux menus
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Commander un menu</h1>
          <p className="text-[#2C2C2C]/60">Complétez les informations pour passer votre commande</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-[#722F37]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-[#722F37] text-white' : 'bg-gray-200'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {s === 1 ? 'Livraison' : s === 2 ? 'Menu' : 'Confirmation'}
                </span>
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#722F37]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Delivery Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#722F37]" />
                    Informations de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user_name">Nom complet *</Label>
                      <Input
                        id="user_name"
                        value={formData.user_name}
                        onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user_email">Email *</Label>
                      <Input
                        id="user_email"
                        type="email"
                        value={formData.user_email}
                        onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="user_phone">Téléphone GSM *</Label>
                      <Input
                        id="user_phone"
                        value={formData.user_phone}
                        onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Address */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="delivery_address">Adresse de livraison *</Label>
                      <Input
                        id="delivery_address"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                        placeholder="Numéro et rue"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_city">Ville *</Label>
                        <Input
                          id="delivery_city"
                          value={formData.delivery_city}
                          onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                          placeholder="Bordeaux"
                        />
                      </div>
                      {!isBordeaux && (
                        <div className="space-y-2">
                          <Label htmlFor="distance_km">Distance depuis Bordeaux (km) *</Label>
                          <Input
                            id="distance_km"
                            type="number"
                            min="0"
                            value={formData.distance_km}
                            onChange={(e) => setFormData({ ...formData, distance_km: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                    {!isBordeaux && formData.delivery_city && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Livraison hors Bordeaux : 5€ + 0,59€/km (soit {deliveryPrice.toFixed(2)}€)
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Date & Time */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delivery_date">Date de livraison *</Label>
                      <Input
                        id="delivery_date"
                        type="date"
                        min={minDate}
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      />
                      {selectedMenu?.advance_days && (
                        <p className="text-xs text-gray-500">
                          Ce menu nécessite une commande {selectedMenu.advance_days} jours à l'avance
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_time">Heure souhaitée *</Label>
                      <Select 
                        value={formData.delivery_time}
                        onValueChange={(v) => setFormData({ ...formData, delivery_time: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {['10:00', '11:00', '12:00', '13:00', '14:00', '18:00', '19:00', '20:00'].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#722F37] hover:bg-[#8B4049]"
                    onClick={() => setStep(2)}
                    disabled={!validateStep1()}
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Menu Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#722F37]" />
                    Choix du menu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Menu Selection */}
                  <div className="space-y-2">
                    <Label>Menu *</Label>
                    <Select 
                      value={formData.menu_id}
                      onValueChange={handleMenuChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {menus.map((menu) => (
                          <SelectItem key={menu.id} value={menu.id} disabled={menu.stock === 0}>
                            {menu.title} - {menu.base_price}€ (min. {menu.min_persons} pers.)
                            {menu.stock === 0 && ' - Épuisé'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMenu && (
                    <>
                      {/* Menu conditions */}
                      {selectedMenu.conditions && (
                        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-orange-800 mb-1">
                                Conditions importantes à lire
                              </h4>
                              <p className="text-orange-700 text-sm">{selectedMenu.conditions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Number of persons */}
                      <div className="space-y-2">
                        <Label htmlFor="num_persons">
                          Nombre de personnes * (minimum {selectedMenu.min_persons})
                        </Label>
                        <Input
                          id="num_persons"
                          type="number"
                          min={selectedMenu.min_persons}
                          value={formData.num_persons}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            num_persons: Math.max(selectedMenu.min_persons, parseInt(e.target.value) || 0)
                          })}
                        />
                        {qualifiesForDiscount && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Réduction de 10% appliquée (5+ personnes supplémentaires)
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button 
                      className="flex-1 bg-[#722F37] hover:bg-[#8B4049]"
                      onClick={() => setStep(3)}
                      disabled={!validateStep2()}
                    >
                      Voir le récapitulatif
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#722F37]" />
                    Récapitulatif de votre commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Client
                      </h3>
                      <div className="text-sm space-y-1 text-[#2C2C2C]/70">
                        <p>{formData.user_name}</p>
                        <p>{formData.user_email}</p>
                        <p>{formData.user_phone}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Livraison
                      </h3>
                      <div className="text-sm space-y-1 text-[#2C2C2C]/70">
                        <p>{formData.delivery_address}</p>
                        <p>{formData.delivery_city}</p>
                        <p>Le {format(new Date(formData.delivery_date), 'dd MMMM yyyy', { locale: fr })} à {formData.delivery_time}</p>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Menu Summary */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Menu commandé
                    </h3>
                    <div className="bg-[#FFF8F0] rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#2C2C2C]">{selectedMenu?.title}</p>
                          <p className="text-sm text-[#2C2C2C]/70">{formData.num_persons} personnes</p>
                        </div>
                        <p className="font-semibold text-[#722F37]">{menuPrice.toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>

                  {/* Conditions reminder */}
                  {selectedMenu?.conditions && (
                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-orange-800">Rappel des conditions</h4>
                          <p className="text-sm text-orange-700">{selectedMenu.conditions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <hr />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2C2C2C]/70">Prix du menu</span>
                      <span>{menuPrice.toFixed(2)}€</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction 10%</span>
                        <span>-{discountAmount.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2C2C2C]/70">
                        Frais de livraison {!isBordeaux && `(${formData.distance_km}km)`}
                      </span>
                      <span>{deliveryPrice === 0 ? 'Gratuit' : `${deliveryPrice.toFixed(2)}€`}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#2C2C2C]">Total</span>
                      <span className="text-[#722F37]">{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button 
                      className="flex-1 bg-[#722F37] hover:bg-[#8B4049]"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validation...
                        </>
                      ) : (
                        <>
                          Confirmer la commande
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}