import { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Euro,
  Phone,
  Mail
} from 'lucide-react';

interface Order {
  id: string;
  menuName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  persons: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered';
  assignedTo?: string;
  createdAt: string;
  notes?: string;
}

interface OrderKanbanProps {
  userRole: 'admin' | 'employee';
  currentUserName: string;
}

const statusConfig = {
  'pending': {
    label: 'En attente',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    icon: Clock,
    iconColor: 'text-yellow-600'
  },
  'confirmed': {
    label: 'Confirmée',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: CheckCircle,
    iconColor: 'text-blue-600'
  },
  'in-preparation': {
    label: 'En préparation',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    icon: Package,
    iconColor: 'text-purple-600'
  },
  'ready': {
    label: 'Prête',
    color: 'bg-green-100 border-green-300 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  'delivered': {
    label: 'Livrée',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    icon: Truck,
    iconColor: 'text-gray-600'
  }
};

// Simulation de données (à remplacer par les vraies données depuis Supabase)
const mockOrders: Order[] = [
  {
    id: '001',
    menuName: 'Excellence Gastronomique',
    customerName: 'Marie Dubois',
    customerEmail: 'marie@email.com',
    customerPhone: '06 12 34 56 78',
    persons: 25,
    totalPrice: 2247.50,
    deliveryAddress: '45 Rue Victor Hugo, 33000 Bordeaux',
    deliveryDate: '2026-02-10',
    status: 'pending',
    createdAt: '2026-02-03T10:30:00',
    notes: 'Allergie aux fruits de mer pour 2 personnes'
  },
  {
    id: '002',
    menuName: 'Mariage de Rêve',
    customerName: 'Jean Martin',
    customerEmail: 'jean@email.com',
    customerPhone: '06 98 76 54 32',
    persons: 120,
    totalPrice: 11400.00,
    deliveryAddress: 'Château de Mirambeau, 33420',
    deliveryDate: '2026-03-15',
    status: 'confirmed',
    assignedTo: 'Sophie Laurent',
    createdAt: '2026-01-28T14:20:00',
    notes: 'Mariage - Setup à 17h00'
  },
  {
    id: '003',
    menuName: 'Business Premium',
    customerName: 'Tech Corp SA',
    customerEmail: 'events@techcorp.com',
    customerPhone: '05 56 00 11 22',
    persons: 45,
    totalPrice: 2610.00,
    deliveryAddress: '12 Quai des Chartrons, 33000 Bordeaux',
    deliveryDate: '2026-02-05',
    status: 'in-preparation',
    assignedTo: 'Marc Petit',
    createdAt: '2026-02-01T09:15:00'
  },
  {
    id: '004',
    menuName: 'Végétarien Délice',
    customerName: 'Claire Moreau',
    customerEmail: 'claire@email.com',
    customerPhone: '06 55 44 33 22',
    persons: 15,
    totalPrice: 720.00,
    deliveryAddress: '8 Place de la Bourse, 33000 Bordeaux',
    deliveryDate: '2026-02-04',
    status: 'ready',
    assignedTo: 'Sophie Laurent',
    createdAt: '2026-01-30T16:45:00'
  }
];

export default function OrderKanban({ userRole, currentUserName }: OrderKanbanProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
    
    // En production: mettre à jour dans Supabase
    // await updateOrderStatus(orderId, newStatus);
  };

  const handleAssignToMe = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, assignedTo: currentUserName, status: 'confirmed' }
        : order
    ));
  };

  const columns: Array<{ status: Order['status']; label: string }> = [
    { status: 'pending', label: 'En attente' },
    { status: 'confirmed', label: 'Confirmée' },
    { status: 'in-preparation', label: 'En préparation' },
    { status: 'ready', label: 'Prête' },
    { status: 'delivered', label: 'Livrée' }
  ];

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Commandes</h1>
        <p className="text-gray-600 mt-2">
          {orders.length} commande{orders.length > 1 ? 's' : ''} • 
          {orders.filter(o => o.assignedTo === currentUserName).length} assignée{orders.filter(o => o.assignedTo === currentUserName).length > 1 ? 's' : ''} à vous
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
        {columns.map(({ status, label }) => {
          const columnOrders = getOrdersByStatus(status);
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div key={status} className="flex flex-col min-w-[300px]">
              {/* Column Header */}
              <div className={`${config.color} rounded-t-xl p-4 border-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={20} className={config.iconColor} />
                    <h3 className="font-bold">{label}</h3>
                  </div>
                  <span className="px-2 py-1 bg-white/50 rounded-full text-sm font-semibold">
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-white border-2 border-t-0 border-gray-200 rounded-b-xl p-3 space-y-3 min-h-[600px]">
                {columnOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Order ID Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold">
                        #{order.id}
                      </span>
                      {order.assignedTo && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {order.assignedTo}
                        </span>
                      )}
                    </div>

                    {/* Menu Name */}
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">
                      {order.menuName}
                    </h4>

                    {/* Customer Info */}
                    <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span className="line-clamp-1">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        <span>{order.persons} pers.</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-orange-600">
                        {order.totalPrice.toFixed(2)}€
                      </span>
                      
                      {/* Action Buttons */}
                      {status === 'pending' && !order.assignedTo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignToMe(order.id);
                          }}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-full font-semibold transition-colors"
                        >
                          Prendre en charge
                        </button>
                      )}

                      {status === 'confirmed' && order.assignedTo === currentUserName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, 'in-preparation');
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full font-semibold transition-colors"
                        >
                          Commencer
                        </button>
                      )}

                      {status === 'in-preparation' && order.assignedTo === currentUserName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, 'ready');
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-full font-semibold transition-colors"
                        >
                          Marquer prête
                        </button>
                      )}

                      {status === 'ready' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, 'delivered');
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-full font-semibold transition-colors"
                        >
                          Livrer
                        </button>
                      )}
                    </div>

                    {/* Notes Alert */}
                    {order.notes && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.notes}</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {columnOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package size={48} className="mb-2" />
                    <p className="text-sm">Aucune commande</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig[selectedOrder.status].color} border-2`}>
                  {(() => {
                    const Icon = statusConfig[selectedOrder.status].icon;
                    return <Icon size={20} />;
                  })()}
                  <span className="font-semibold">
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu commandé
                </label>
                <p className="text-lg font-semibold text-gray-900">{selectedOrder.menuName}</p>
                <p className="text-gray-600">{selectedOrder.persons} personnes</p>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Informations client
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-900">
                    <User size={18} className="text-gray-500" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Mail size={18} className="text-gray-500" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="text-blue-600 hover:underline">
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Phone size={18} className="text-gray-500" />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Livraison
                </label>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-gray-900">
                    <MapPin size={18} className="text-gray-500 mt-0.5" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Calendar size={18} className="text-gray-500" />
                    <span>
                      {new Date(selectedOrder.deliveryDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant total
                </label>
                <p className="text-3xl font-bold text-orange-600">
                  {selectedOrder.totalPrice.toFixed(2)}€
                </p>
              </div>

              {/* Assigned */}
              {selectedOrder.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <p className="text-lg text-gray-900">{selectedOrder.assignedTo}</p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes spéciales
                  </label>
                  <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{selectedOrder.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
