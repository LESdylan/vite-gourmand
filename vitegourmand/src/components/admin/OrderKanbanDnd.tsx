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
  Phone,
  Mail,
  Check,
  ChefHat,
  Settings,
  GripVertical,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getAllOrders, updateOrderStatus, assignOrder, updateDishProgress } from '../../utils/orderManager';

interface DishItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
}

interface Order {
  id: string;
  menuId: string;
  menuName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  persons: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  notes?: string;
  dishes: DishItem[];
}

interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

interface OrderKanbanProps {
  userRole: 'admin' | 'employee';
  currentUserName: string;
}

function OrderCard({ order, onView, onAssign, onMoveNext, onMovePrev, currentUserName, columnStatus, isFirstColumn, isLastColumn }: any) {
  const completedDishes = order.dishes?.filter((d: DishItem) => d.completed).length || 0;
  const totalDishes = order.dishes?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white border-2 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold">
            #{order.id}
          </span>
        </div>
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

      {/* Dish Progress */}
      {totalDishes > 0 && (
        <div className="mb-3 bg-gray-50 rounded p-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Préparation</span>
            <span className="font-semibold text-gray-900">{completedDishes}/{totalDishes}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${totalDishes > 0 ? (completedDishes / totalDishes) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mb-3">
        <span className="text-lg font-bold text-orange-600">
          {order.totalPrice.toFixed(2)}€
        </span>
        
        {columnStatus === 'pending' && !order.assignedTo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign(order.id);
            }}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-full font-semibold transition-colors"
          >
            Prendre
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 mb-3">
        {!isFirstColumn && (
          <button
            onClick={() => onMovePrev(order.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={14} />
            Précédent
          </button>
        )}
        {!isLastColumn && (
          <button
            onClick={() => onMoveNext(order.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
          >
            Suivant
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* View Details Button */}
      <button
        onClick={() => onView(order)}
        className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-semibold transition-colors"
      >
        Voir détails
      </button>

      {/* Notes Alert */}
      {order.notes && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{order.notes}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function OrderKanban({ userRole, currentUserName }: OrderKanbanProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'pending', label: 'En attente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: 'Clock' },
    { id: 'confirmed', label: 'Confirmée', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'CheckCircle' },
    { id: 'in-preparation', label: 'En préparation', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: 'Package' },
    { id: 'ready', label: 'Prête', color: 'text-green-600', bgColor: 'bg-green-100', icon: 'CheckCircle' },
    { id: 'delivered', label: 'Livrée', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: 'Truck' }
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load orders from backend
  useEffect(() => {
    loadOrders();
    
    // Reload every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const allOrders = await getAllOrders();
    setOrders(allOrders);
  };

  const moveOrderToStatus = async (orderId: string, newStatus: string) => {
    // Update locally first for instant feedback
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    // Update in backend
    const success = await updateOrderStatus(orderId, newStatus);
    
    if (success) {
      const columnLabel = columns.find(c => c.id === newStatus)?.label;
      toast.success(`Commande déplacée vers "${columnLabel}"`);
    } else {
      // Rollback on error
      setOrders(orders);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMoveNext = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = columns.findIndex(c => c.id === order.status);
    if (currentIndex < columns.length - 1) {
      const nextStatus = columns[currentIndex + 1].id;
      moveOrderToStatus(orderId, nextStatus);
    }
  };

  const handleMovePrev = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = columns.findIndex(c => c.id === order.status);
    if (currentIndex > 0) {
      const prevStatus = columns[currentIndex - 1].id;
      moveOrderToStatus(orderId, prevStatus);
    }
  };

  const handleAssignToMe = async (orderId: string) => {
    const success = await assignOrder(orderId, currentUserName);
    
    if (success) {
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, assignedTo: currentUserName, status: 'confirmed' }
          : order
      );
      setOrders(updatedOrders);
      toast.success('Commande prise en charge');
    } else {
      toast.error('Erreur lors de l\'assignation');
    }
  };

  const toggleDishCompletion = async (orderId: string, dishId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedDishes = order.dishes.map(dish =>
      dish.id === dishId ? { ...dish, completed: !dish.completed } : dish
    );

    // Update locally
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, dishes: updatedDishes } : o
    );
    setOrders(updatedOrders);

    // Update in backend
    await updateDishProgress(orderId, updatedDishes);
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Commandes</h1>
          <p className="text-gray-600 mt-2">
            {orders.length} commande{orders.length > 1 ? 's' : ''} • 
            {orders.filter(o => o.assignedTo === currentUserName).length} assignée{orders.filter(o => o.assignedTo === currentUserName).length > 1 ? 's' : ''} à vous
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
        {columns.map((column, columnIndex) => {
          const columnOrders = getOrdersByStatus(column.id);
          const isFirstColumn = columnIndex === 0;
          const isLastColumn = columnIndex === columns.length - 1;

          return (
            <div key={column.id} className="flex flex-col min-w-[300px]">
              {/* Column Header */}
              <div className={`${column.bgColor} rounded-t-xl p-4 border-2 ${column.color.replace('text-', 'border-')}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`${column.color}`}>
                      {column.icon === 'Clock' && <Clock size={20} />}
                      {column.icon === 'CheckCircle' && <CheckCircle size={20} />}
                      {column.icon === 'Package' && <Package size={20} />}
                      {column.icon === 'Truck' && <Truck size={20} />}
                    </div>
                    <h3 className="font-bold">{column.label}</h3>
                  </div>
                  <span className="px-2 py-1 bg-white/50 rounded-full text-sm font-semibold">
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-white border-2 border-t-0 border-gray-200 rounded-b-xl p-3 min-h-[600px]">
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    columnStatus={column.id}
                    currentUserName={currentUserName}
                    isFirstColumn={isFirstColumn}
                    isLastColumn={isLastColumn}
                    onView={setSelectedOrder}
                    onAssign={handleAssignToMe}
                    onMoveNext={handleMoveNext}
                    onMovePrev={handleMovePrev}
                  />
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Commande #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Order Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedOrder.menuName}</h3>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{selectedOrder.persons} personnes</span>
                    <span>•</span>
                    <span className="font-bold text-orange-600">{selectedOrder.totalPrice.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-500" />
                    <span className="text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-500" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="text-blue-600 hover:underline">
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-500" />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-500 mt-0.5" />
                    <span className="text-gray-900">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-gray-900">
                      {new Date(selectedOrder.deliveryDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Notes spéciales</p>
                        <span>{selectedOrder.notes}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Dishes Checklist */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="text-orange-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Liste de Préparation</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.dishes?.map((dish) => (
                    <label
                      key={dish.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        dish.completed 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dish.completed}
                        onChange={() => toggleDishCompletion(selectedOrder.id, dish.id)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${dish.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                          {dish.name}
                        </p>
                        <p className={`text-sm ${dish.completed ? 'text-green-600' : 'text-gray-600'}`}>
                          Quantité: {dish.quantity}
                        </p>
                      </div>
                      {dish.completed && (
                        <Check className="text-green-600" size={24} />
                      )}
                    </label>
                  ))}
                </div>

                {/* Progress Summary */}
                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Progression</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {selectedOrder.dishes?.filter(d => d.completed).length || 0}/{selectedOrder.dishes?.length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div 
                      className="bg-orange-600 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${((selectedOrder.dishes?.filter(d => d.completed).length || 0) / (selectedOrder.dishes?.length || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
