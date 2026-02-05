import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Phone, Mail, User, Users, Euro, Truck, AlertCircle, Check } from 'lucide-react';
import { Menu, getMenuById } from '../data/menus';
import { getDishById } from '../data/dishes';
import { toast } from 'sonner@2.0.3';

interface OrderPageProps {
  menuId?: string;
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

export default function OrderPage({ menuId, userInfo, onClose, onSubmit }: OrderPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations client
    firstName: userInfo?.firstName || '',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    
    // Informations prestation
    address: '',
    city: '',
    postalCode: '',
    deliveryDate: '',
    deliveryTime: '',
    
    // Menu et personnes
    selectedMenuId: menuId || '',
    numberOfPersons: 0,
    
    // Notes spéciales
    specialNotes: ''
  });

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [deliveryCost, setDeliveryCost] = useState(5.00);
  const [distanceKm, setDistanceKm] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Charger le menu sélectionné
  useEffect(() => {
    if (formData.selectedMenuId) {
      const menu = getMenuById(formData.selectedMenuId);
      setSelectedMenu(menu || null);
      if (menu && formData.numberOfPersons === 0) {
        setFormData(prev => ({ ...prev, numberOfPersons: menu.minPersons }));
      }
    }
  }, [formData.selectedMenuId]);

  // Calculer le coût de livraison basé sur la ville
  useEffect(() => {
    if (formData.city) {
      const cityLower = formData.city.toLowerCase().trim();
      if (cityLower === 'bordeaux' || cityLower.includes('bordeaux')) {
        setDeliveryCost(5.00);
        setDistanceKm(0);
      } else {
        // Simulation: distance basée sur le code postal
        const distance = Math.floor(Math.random() * 50) + 10; // 10-60 km
        setDistanceKm(distance);
        setDeliveryCost(5.00 + (distance * 0.59));
      }
    }
  }, [formData.city]);

  // Calculer la réduction si applicable
  useEffect(() => {
    if (selectedMenu && formData.numberOfPersons >= selectedMenu.minPersons + 5) {
      setDiscount(0.10); // 10% de réduction
    } else {
      setDiscount(0);
    }
  }, [selectedMenu, formData.numberOfPersons]);

  const calculateTotalPrice = () => {
    if (!selectedMenu) return 0;
    const menuTotal = selectedMenu.pricePerPerson * formData.numberOfPersons;
    const discountAmount = menuTotal * discount;
    return menuTotal - discountAmount + deliveryCost;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!selectedMenu) {
      toast.error('Veuillez sélectionner un menu');
      return;
    }

    if (formData.numberOfPersons < selectedMenu.minPersons) {
      toast.error(`Le nombre minimum de personnes est ${selectedMenu.minPersons}`);
      return;
    }

    if (!formData.deliveryDate || !formData.deliveryTime) {
      toast.error('Veuillez renseigner la date et l\'heure de livraison');
      return;
    }

    const orderData = {
      ...formData,
      menu: selectedMenu,
      deliveryCost,
      discount,
      totalPrice: calculateTotalPrice(),
      orderDate: new Date().toISOString()
    };

    onSubmit(orderData);
    toast.success('Commande envoyée ! Vous allez recevoir un email de confirmation.');
    onClose();
  };

  const isStep1Valid = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone;
  };

  const isStep2Valid = () => {
    return formData.address && formData.city && formData.deliveryDate && formData.deliveryTime;
  };

  const isStep3Valid = () => {
    return selectedMenu && formData.numberOfPersons >= (selectedMenu?.minPersons || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold mb-2">Nouvelle Commande</h2>
          <p className="text-blue-100">Remplissez les informations pour votre prestation</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-400 text-white'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-12 mx-2 transition-all ${
                      step > s ? 'bg-white' : 'bg-blue-400'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-4 text-sm text-blue-100">
            {step === 1 && 'Informations personnelles'}
            {step === 2 && 'Lieu et date de livraison'}
            {step === 3 && 'Choix du menu et nombre de personnes'}
            {step === 4 && 'Récapitulatif et validation'}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Vos informations
              </h3>

              {/* Si les infos sont pré-remplies, afficher un récapitulatif */}
              {userInfo && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="text-green-600" size={20} />
                    <p className="font-semibold text-green-900">Informations sauvegardées</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Nom :</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Email :</strong> {formData.email}</p>
                    <p><strong>Téléphone :</strong> {formData.phone}</p>
                  </div>
                  <p className="text-xs text-green-700 mt-3">
                    Vous pouvez modifier ces informations ci-dessous si nécessaire.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Livraison */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-blue-600" />
                Lieu et date de livraison
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12 rue Example"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bordeaux"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="33000"
                  />
                </div>
              </div>

              {formData.city && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Truck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Frais de livraison</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {formData.city.toLowerCase().includes('bordeaux') ? (
                          <>Livraison à Bordeaux : <span className="font-bold">5,00€</span></>
                        ) : (
                          <>
                            Livraison hors Bordeaux (~{distanceKm} km) : 
                            <span className="font-bold ml-1">
                              5,00€ + {(distanceKm * 0.59).toFixed(2)}€ = {deliveryCost.toFixed(2)}€
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Date de livraison *
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Heure souhaitée *
                  </label>
                  <input
                    type="time"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Menu et personnes */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Choix du menu
              </h3>

              {selectedMenu && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{selectedMenu.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedMenu.description}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {selectedMenu.theme}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedMenu.pricePerPerson.toFixed(2)}€
                      </p>
                      <p className="text-sm text-gray-500">par personne</p>
                    </div>
                  </div>

                  {/* Composition du menu */}
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium text-gray-700">Composition :</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-blue-600 mb-1">Entrées</p>
                        {selectedMenu.composition.entreeDishes.map(dishId => {
                          const dish = getDishById(dishId);
                          return dish ? <p key={dishId} className="text-gray-600">• {dish.name}</p> : null;
                        })}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-600 mb-1">Plats</p>
                        {selectedMenu.composition.mainDishes.map(dishId => {
                          const dish = getDishById(dishId);
                          return dish ? <p key={dishId} className="text-gray-600">• {dish.name}</p> : null;
                        })}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-600 mb-1">Desserts</p>
                        {selectedMenu.composition.dessertDishes.map(dishId => {
                          const dish = getDishById(dishId);
                          return dish ? <p key={dishId} className="text-gray-600">• {dish.name}</p> : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de personnes * (minimum: {selectedMenu?.minPersons || 0})
                </label>
                <input
                  type="number"
                  name="numberOfPersons"
                  value={formData.numberOfPersons}
                  onChange={handleInputChange}
                  min={selectedMenu?.minPersons || 0}
                  max={selectedMenu?.maxPersons || 200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                />
              </div>

              {selectedMenu && formData.numberOfPersons >= selectedMenu.minPersons + 5 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check size={20} />
                    <span className="font-medium">
                      Réduction de 10% appliquée ! (5+ personnes au-dessus du minimum)
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes spéciales (allergies, préférences, etc.)
                </label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Indiquez vos besoins spécifiques..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Récapitulatif */}
          {step === 4 && selectedMenu && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check size={24} className="text-blue-600" />
                Récapitulatif de votre commande
              </h3>

              {/* Résumé client */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-3">Informations client</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-600">Nom:</span> <strong>{formData.firstName} {formData.lastName}</strong></p>
                  <p><span className="text-gray-600">Email:</span> <strong>{formData.email}</strong></p>
                  <p><span className="text-gray-600">Téléphone:</span> <strong>{formData.phone}</strong></p>
                </div>
              </div>

              {/* Résumé livraison */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-3">Livraison</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Adresse:</span> <strong>{formData.address}, {formData.postalCode} {formData.city}</strong></p>
                  <p><span className="text-gray-600">Date:</span> <strong>{new Date(formData.deliveryDate).toLocaleDateString('fr-FR')}</strong></p>
                  <p><span className="text-gray-600">Heure:</span> <strong>{formData.deliveryTime}</strong></p>
                </div>
              </div>

              {/* Résumé menu */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-3">Menu commandé</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Menu:</span> <strong>{selectedMenu.name}</strong></p>
                  <p><span className="text-gray-600">Nombre de personnes:</span> <strong>{formData.numberOfPersons}</strong></p>
                </div>
              </div>

              {/* Détail des prix */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">Détail du prix</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      Menu ({formData.numberOfPersons} × {selectedMenu.pricePerPerson.toFixed(2)}€)
                    </span>
                    <span className="font-semibold">
                      {(selectedMenu.pricePerPerson * formData.numberOfPersons).toFixed(2)}€
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Réduction 10%</span>
                      <span className="font-semibold">
                        -{(selectedMenu.pricePerPerson * formData.numberOfPersons * discount).toFixed(2)}€
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Frais de livraison</span>
                    <span className="font-semibold">{deliveryCost.toFixed(2)}€</span>
                  </div>

                  <div className="border-t border-blue-300 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {calculateTotalPrice().toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Informations importantes</p>
                    <p className="mt-1">
                      Vous recevrez un email de confirmation une fois la commande validée. 
                      L'équipe Vite & Gourmand vous contactera sous 24h pour confirmer les détails.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-8 py-6 rounded-b-2xl flex justify-between items-center border-t">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Retour
            </button>
          )}

          <div className="ml-auto flex gap-3">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !isStep1Valid()) ||
                  (step === 2 && !isStep2Valid()) ||
                  (step === 3 && !isStep3Valid())
                }
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check size={20} />
                Confirmer la commande
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
