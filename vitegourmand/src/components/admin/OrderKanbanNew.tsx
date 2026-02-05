import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Mail,
  Search,
  Filter,
  X
} from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../utils/orderManager';
import { toast } from 'sonner@2.0.3';
import CancelOrderDialog from './CancelOrderDialog';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

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
  status: 'pending' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
  notes?: string;
}

interface OrderKanbanNewProps {
  userRole: 'admin' | 'employee';
  currentUserName: string;
  currentUserId?: string;
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
  },
  'cancelled': {
    label: 'Annulée',
    color: 'bg-red-100 border-red-300 text-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-600'
  }
};

export default function OrderKanbanNew({ userRole, currentUserName, currentUserId }: OrderKanbanNewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cancelDialogOrder, setCancelDialogOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        toast.success('Statut mis à jour');
        loadOrders();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancelOrder = async (contactMethod: string, contactReason: string, cancelReason: string) => {
    if (!cancelDialogOrder) return;

    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders/${cancelDialogOrder.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          contactMethod,
          contactReason,
          cancelReason
        }),
      });

      if (response.ok) {
        toast.success('Commande annulée avec succès');
        setCancelDialogOrder(null);
        loadOrders();
      } else {
        toast.error('Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const groupOrdersByStatus = () => {
    const groups: { [key: string]: Order[] } = {
      pending: [],
      confirmed: [],
      'in-preparation': [],
      ready: [],
      delivered: []
    };

    filteredOrders.forEach(order => {
      if (order.status !== 'cancelled' && groups[order.status]) {
        groups[order.status].push(order);
      }
    });

    return groups;
  };

  const ordersByStatus = groupOrdersByStatus();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const config = statusConfig[order.status];
    const Icon = config.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow mb-3"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm mb-1">{order.menuName}</h3>
            <p className="text-xs text-gray-500">#{order.id}</p>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
            {config.label}
          </div>
        </div>

        {/* Customer */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={12} className="text-gray-400" />
            <p className="truncate">{order.customerEmail}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={12} className="text-gray-400" />
            <p>{order.customerPhone}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar size={12} />
              <span>{formatDate(order.deliveryDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock size={12} />
              <span>{formatTime(order.deliveryDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin size={12} />
            <span className="truncate">{order.deliveryAddress}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{order.persons} pers.</span>
            <div className="flex items-center gap-1 font-bold text-orange-600">
              <Euro size={14} />
              <span className="text-sm">{order.totalPrice.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-semibold"
          >
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="in-preparation">En préparation</option>
            <option value="ready">Prête</option>
            <option value="delivered">Livrée</option>
          </select>

          {userRole === 'employee' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={() => setCancelDialogOrder(order)}
              className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              Annuler (contact client)
            </button>
          )}

          {userRole === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={() => setCancelDialogOrder(order)}
              className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              Annuler la commande
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Filtres de recherche</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <Filter size={18} />
            {showFilters ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        <div className={`space-y-4 ${!showFilters && 'hidden lg:block'}`}>
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Rechercher un client ou une commande
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, email, numéro de commande..."
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-semibold"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="in-preparation">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivered">Livrée</option>
            </select>
          </div>

          {/* Results count */}
          <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200">
            <p className="text-sm font-semibold text-orange-900">
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} trouvée{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;

          return (
            <div key={status} className="bg-gray-50 rounded-2xl p-4">
              {/* Column Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon size={20} className={config.iconColor} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{config.label}</h3>
                  <p className="text-xs text-gray-500">{statusOrders.length} commande{statusOrders.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Orders */}
              <div className="space-y-3">
                {statusOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune commande</p>
                ) : (
                  statusOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Dialog */}
      {cancelDialogOrder && (
        <CancelOrderDialog
          orderId={cancelDialogOrder.id}
          orderData={{
            customerName: cancelDialogOrder.customerName,
            customerEmail: cancelDialogOrder.customerEmail,
            customerPhone: cancelDialogOrder.customerPhone
          }}
          onConfirm={handleCancelOrder}
          onClose={() => setCancelDialogOrder(null)}
        />
      )}
    </div>
  );
}
