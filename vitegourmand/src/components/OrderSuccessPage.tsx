import { useEffect, useState } from 'react';
import { CheckCircle, Calendar, MapPin, Users, Euro, Clock, Package, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface OrderSuccessPageProps {
  orderId: string;
  orderData: {
    menuName: string;
    customerName: string;
    persons: number;
    totalPrice: number;
    deliveryAddress: string;
    deliveryDate: string;
    status: string;
  };
  onClose: () => void;
  onViewOrders: () => void;
}

export default function OrderSuccessPage({ orderId, orderData, onClose, onViewOrders }: OrderSuccessPageProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Lancer les confettis
    if (!showConfetti) {
      setShowConfetti(true);
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2} />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full p-2"
              >
                <Package size={20} />
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Commande confirmée ! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Merci pour votre confiance, {orderData.customerName.split(' ')[0]} !
            </p>
            <p className="text-gray-500 mt-2">
              Nous avons bien reçu votre commande et nous la préparons avec soin.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-6"
          >
            {/* Order ID */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm font-semibold mb-1">Numéro de commande</p>
              <p className="text-2xl font-bold tracking-wider">{orderId}</p>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Menu */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Package className="text-orange-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Menu commandé</p>
                  <p className="font-bold text-gray-900">{orderData.menuName}</p>
                </div>
              </div>

              {/* Persons */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Nombre de personnes</p>
                  <p className="font-bold text-gray-900">{orderData.persons} personnes</p>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Date de livraison</p>
                  <p className="font-bold text-gray-900">{formatDate(orderData.deliveryDate)}</p>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Clock className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Heure de livraison</p>
                  <p className="font-bold text-gray-900">{formatTime(orderData.deliveryDate)}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-start gap-4 md:col-span-2">
                <div className="bg-red-100 p-3 rounded-xl">
                  <MapPin className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Adresse de livraison</p>
                  <p className="font-bold text-gray-900">{orderData.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-3 rounded-xl">
                    <Euro className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="text-3xl font-bold text-gray-900">{orderData.totalPrice.toFixed(2)}€</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    ✓ Paiement à la livraison
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Et maintenant ?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Confirmation par email</p>
                  <p className="text-sm text-gray-600">Vous allez recevoir un email de confirmation avec tous les détails de votre commande.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Préparation de votre commande</p>
                  <p className="text-sm text-gray-600">Notre équipe commence immédiatement la préparation avec des produits frais et de qualité.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Suivi en temps réel</p>
                  <p className="text-sm text-gray-600">Suivez l'avancement de votre commande depuis votre espace client.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Livraison à domicile</p>
                  <p className="text-sm text-gray-600">Nous livrons votre commande à l'heure prévue, prête à être savourée !</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={onViewOrders}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Package size={24} />
              Voir mes commandes
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
            >
              <Home size={24} />
              Retour à l'accueil
            </button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8 text-gray-600"
          >
            <p className="text-sm">
              Une question ? Contactez-nous au{' '}
              <a href="tel:+33556000000" className="text-orange-600 font-semibold hover:underline">
                05 56 00 00 00
              </a>
              {' '}ou par email à{' '}
              <a href="mailto:contact@vite-gourmand.fr" className="text-orange-600 font-semibold hover:underline">
                contact@vite-gourmand.fr
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
