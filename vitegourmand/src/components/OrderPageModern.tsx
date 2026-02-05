import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Euro, Check, Edit2, MapPin, ChevronRight } from 'lucide-react';
import { Menu, getMenuById } from '../data/menus';
import { getDishById } from '../data/dishes';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { createOrder } from '../utils/orderManager';

interface OrderPageModernProps {
  menuId?: string;
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
  };
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

export default function OrderPageModern({ menuId, userInfo, onClose, onSubmit }: OrderPageModernProps) {
  const [step, setStep] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  
  const [formData, setFormData] = useState({
    deliveryDate: '',
    deliveryTime: '12:00',
    numberOfPersons: 0,
    specialNotes: '',
    // Pre-filled from user
    address: userInfo.address || '',
    city: 'Bordeaux',
  });

  const [editingInfo, setEditingInfo] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(5.00);
  const [distanceKm, setDistanceKm] = useState(0);

  // Load menu
  useEffect(() => {
    if (menuId) {
      const menu = getMenuById(menuId);
      if (menu) {
        setSelectedMenu(menu);
        setFormData(prev => ({ ...prev, numberOfPersons: menu.minPersons }));
      }
    }
  }, [menuId]);

  // Calculate delivery cost
  useEffect(() => {
    if (formData.city.toLowerCase().includes('bordeaux')) {
      setDeliveryCost(5.00);
      setDistanceKm(0);
    } else {
      const distance = Math.floor(Math.random() * 50) + 10;
      setDistanceKm(distance);
      setDeliveryCost(5.00 + (distance * 0.59));
    }
  }, [formData.city]);

  if (!selectedMenu) return null;

  const subtotal = selectedMenu.pricePerPerson * formData.numberOfPersons;
  const total = subtotal + deliveryCost;

  const handleSubmit = async () => {
    if (!formData.deliveryDate || !formData.deliveryTime) {
      toast.error('Veuillez sélectionner une date et une heure de livraison');
      return;
    }

    if (formData.numberOfPersons < selectedMenu.minPersons) {
      toast.error(`Minimum ${selectedMenu.minPersons} personnes pour ce menu`);
      return;
    }

    // Prepare order data
    // Combine all dishes from the menu composition
    const allDishes = [
      ...(selectedMenu.composition?.entreeDishes || []),
      ...(selectedMenu.composition?.mainDishes || []),
      ...(selectedMenu.composition?.dessertDishes || [])
    ];

    const orderData = {
      userId: userInfo.id,
      menuId: selectedMenu.id,
      menuName: selectedMenu.name,
      customerName: `${userInfo.firstName} ${userInfo.lastName}`,
      customerEmail: userInfo.email,
      customerPhone: userInfo.phone,
      persons: formData.numberOfPersons,
      totalPrice: total,
      deliveryAddress: formData.address,
      deliveryDate: `${formData.deliveryDate}T${formData.deliveryTime}`,
      status: 'pending',
      notes: formData.specialNotes,
      dishes: allDishes.map(dishId => {
        const dish = getDishById(dishId);
        return {
          id: dishId,
          name: dish?.name || '',
          quantity: formData.numberOfPersons,
          completed: false
        };
      })
    };

    // Submit order
    const result = await createOrder(orderData);
    
    if (result.success) {
      toast.success('Commande créée avec succès !');
      // Pass the order ID and data to parent
      onSubmit({
        ...orderData,
        orderId: result.orderId
      });
      // Don't close immediately - parent will show success page
    } else {
      toast.error(result.error || 'Erreur lors de la création de la commande');
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{selectedMenu.name}</h2>
            <p className="text-orange-100">Finaliser ma commande</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Menu Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedMenu.image}
                      alt={selectedMenu.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMenu.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{selectedMenu.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-orange-600 font-bold text-lg">
                          {selectedMenu.pricePerPerson.toFixed(2)}€/pers
                        </span>
                        <span className="text-gray-500">• Min. {selectedMenu.minPersons} pers.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info (Pre-filled, editable) */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Vos informations</h3>
                    <button
                      onClick={() => setEditingInfo(!editingInfo)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit2 size={16} />
                      {editingInfo ? 'Fermer' : 'Modifier'}
                    </button>
                  </div>

                  {!editingInfo ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Nom :</span>
                        <span className="font-semibold text-gray-900">{userInfo.firstName} {userInfo.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Email :</span>
                        <span className="font-semibold text-gray-900">{userInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Téléphone :</span>
                        <span className="font-semibold text-gray-900">{userInfo.phone}</span>
                      </div>
                      {formData.address && (
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-600 mt-0.5" />
                          <span className="font-semibold text-gray-900">{formData.address}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adresse de livraison"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ville"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Date & Time Selection */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quand souhaitez-vous être livré ?</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="text-orange-600" size={18} />
                        Date de livraison
                      </label>
                      <input
                        type="date"
                        min={minDate}
                        max={maxDate}
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="text-orange-600" size={18} />
                        Heure de livraison
                      </label>
                      <select
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Number of Persons */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="text-orange-600" size={20} />
                    Nombre de personnes
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, numberOfPersons: Math.max(selectedMenu.minPersons, formData.numberOfPersons - 5) })}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xl transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-4xl font-bold text-orange-600">{formData.numberOfPersons}</div>
                      <div className="text-sm text-gray-500">personnes</div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, numberOfPersons: formData.numberOfPersons + 5 })}
                      className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {formData.numberOfPersons < selectedMenu.minPersons && (
                    <p className="mt-3 text-sm text-red-600 text-center">
                      Minimum {selectedMenu.minPersons} personnes requises
                    </p>
                  )}
                </div>

                {/* Special Notes */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Notes spéciales (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    placeholder="Allergies, préférences, instructions de livraison..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif de votre commande</h3>
                  <p className="text-gray-600">Vérifiez les détails avant de confirmer</p>
                </div>

                {/* Summary Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Info */}
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Calendar className="text-blue-600" size={20} />
                      Livraison
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Date :</span>{' '}
                        {new Date(formData.deliveryDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Heure :</span> {formData.deliveryTime}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Adresse :</span> {formData.address}, {formData.city}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-3">Contact</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Nom :</span> {userInfo.firstName} {userInfo.lastName}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Email :</span> {userInfo.email}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Tél :</span> {userInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-4">Détails de la commande</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-orange-200">
                      <span className="text-gray-700">{selectedMenu.name}</span>
                      <span className="font-semibold text-gray-900">{formData.numberOfPersons} pers.</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-orange-200">
                      <span className="text-gray-700">Prix par personne</span>
                      <span className="font-semibold text-gray-900">{selectedMenu.pricePerPerson.toFixed(2)}€</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-orange-200">
                      <span className="text-gray-700">Sous-total</span>
                      <span className="font-semibold text-gray-900">{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-orange-200">
                      <span className="text-gray-700">
                        Livraison {distanceKm > 0 && `(${distanceKm} km)`}
                      </span>
                      <span className="font-semibold text-gray-900">{deliveryCost.toFixed(2)}€</span>
                    </div>
                    <div className="flex items-center justify-between py-3 pt-4">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-orange-600">{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Special Notes Display */}
                {formData.specialNotes && (
                  <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-2">Notes spéciales</h4>
                    <p className="text-gray-700">{formData.specialNotes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-sm text-gray-600">Total à payer</p>
              <p className="text-2xl font-bold text-orange-600">{total.toFixed(2)}€</p>
            </div>

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Retour
                </button>
              )}
              
              {step === 1 ? (
                <button
                  onClick={() => {
                    if (!formData.deliveryDate || !formData.deliveryTime) {
                      toast.error('Veuillez sélectionner une date et une heure');
                      return;
                    }
                    if (formData.numberOfPersons < selectedMenu.minPersons) {
                      toast.error(`Minimum ${selectedMenu.minPersons} personnes`);
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Continuer
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Check size={20} />
                  Confirmer la commande
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
