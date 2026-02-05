import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  MapPin,
  Calendar,
  Euro,
  Phone,
  ChevronRight
} from 'lucide-react';

interface Order {
  id: string;
  menuName: string;
  persons: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered';
  createdAt: string;
  assignedTo?: string;
}

// Mock orders pour l'utilisateur
const mockUserOrders: Order[] = [
  {
    id: '005',
    menuName: 'Excellence Gastronomique',
    persons: 25,
    totalPrice: 2247.50,
    deliveryAddress: '45 Rue Victor Hugo, 33000 Bordeaux',
    deliveryDate: '2026-02-10',
    status: 'in-preparation',
    createdAt: '2026-02-03T10:30:00',
    assignedTo: 'Sophie Laurent'
  },
  {
    id: '004',
    menuName: 'Végétarien Délice',
    persons: 15,
    totalPrice: 720.00,
    deliveryAddress: '8 Place de la Bourse, 33000 Bordeaux',
    deliveryDate: '2026-02-04',
    status: 'delivered',
    createdAt: '2026-01-30T16:45:00',
    assignedTo: 'Sophie Laurent'
  },
  {
    id: '003',
    menuName: 'Business Premium',
    persons: 45,
    totalPrice: 2610.00,
    deliveryAddress: '12 Quai des Chartrons, 33000 Bordeaux',
    deliveryDate: '2026-02-05',
    status: 'confirmed',
    createdAt: '2026-02-01T09:15:00',
    assignedTo: 'Marc Petit'
  }
];

const statusSteps = [
  { 
    key: 'pending', 
    label: 'Commande reçue', 
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  { 
    key: 'confirmed', 
    label: 'Confirmée', 
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    key: 'in-preparation', 
    label: 'En préparation', 
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    key: 'ready', 
    label: 'Prête à livrer', 
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    key: 'delivered', 
    label: 'Livrée', 
    icon: Truck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }
];

export default function UserOrderTracking() {
  const [orders] = useState<Order[]>(mockUserOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusIndex = (status: Order['status']) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const currentOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
        <p className="text-gray-600">
          Suivez l'état de vos commandes en temps réel
        </p>
      </div>

      {/* Current Orders */}
      {currentOrders.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Commandes en cours</h2>
          
          <div className="space-y-6">
            {currentOrders.map((order) => {
              const currentStepIndex = getStatusIndex(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-mono font-semibold">
                            Commande #{order.id}
                          </span>
                          {order.assignedTo && (
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              Préparé par {order.assignedTo}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold">{order.menuName}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{order.totalPrice.toFixed(2)}€</p>
                        <p className="text-sm text-orange-100">{order.persons} personnes</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                          <div key={step.key} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center flex-1">
                              {/* Icon */}
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? isCurrent ? step.bgColor + ' ' + step.color + ' ring-4 ring-offset-2 ring-' + step.color.replace('text-', '')
                                      : 'bg-green-100 text-green-600' 
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                              >
                                <Icon size={24} />
                              </motion.div>

                              {/* Label */}
                              <p className={`text-xs mt-2 text-center font-medium ${
                                isCompleted ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </p>
                            </div>

                            {/* Connector */}
                            {index < statusSteps.length - 1 && (
                              <div className="flex-1 h-1 mx-2 relative top-[-20px]">
                                <div className={`h-full rounded-full transition-all duration-500 ${
                                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Date de livraison</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.deliveryDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Adresse de livraison</p>
                          <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full mt-4 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      Voir les détails complets
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Commandes passées</h2>
          
          <div className="space-y-4">
            {pastOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.menuName}</h3>
                      <p className="text-sm text-gray-600">
                        Livré le {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">{order.totalPrice.toFixed(2)}€</p>
                    <p className="text-sm text-gray-600">{order.persons} pers.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {currentOrders.length === 0 && pastOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore passé de commande
          </p>
          <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors">
            Découvrir nos menus
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Commande #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedOrder.menuName}</h3>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>{selectedOrder.persons} personnes</span>
                  <span>•</span>
                  <span className="font-bold text-orange-600">{selectedOrder.totalPrice.toFixed(2)}€</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Date de livraison</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(selectedOrder.deliveryDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Adresse de livraison</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>

              {selectedOrder.assignedTo && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Préparé par</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedOrder.assignedTo}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <a
                  href="tel:+33556000000"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Phone size={20} />
                  Nous contacter
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
