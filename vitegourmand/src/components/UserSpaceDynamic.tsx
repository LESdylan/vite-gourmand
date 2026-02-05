import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  ChefHat,
  Eye,
  X,
  RefreshCw,
  AlertCircle,
  Star,
  Award,
  TrendingUp,
  Gift,
  Users,
  Copy
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User, Page } from '../App';

type Order = {
  id: string;
  menuId?: string;
  menuName?: string;
  menuTitle?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  persons?: number;
  numberOfPeople?: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  notes?: string;
  userId?: string;
  dishes?: any[];
  deliveryFee?: number;
  completedAt?: string;
  reviewId?: string;
  pointsEarned?: number;
  statusHistory?: Array<{ status: string; date: string; timestamp?: string }>;
};

type UserProfile = {
  points: number;
  totalOrders: number;
  affiliateCode: string;
  isAffiliate: boolean;
  totalSavings: number;
  nextRewardAt: number;
};

type Review = {
  id: string;
  orderId: string;
  rating: number;
  text: string;
  validated: boolean;
  createdAt: string;
};

type UserSpaceProps = {
  user: User;
  accessToken: string | null;
  setCurrentPage: (page: Page) => void;
  onUserUpdate: (token: string) => void;
};

// UserSpaceDynamic - 100% dynamic with real-time tracking (v2.0)
export default function UserSpaceDynamic({ user, accessToken, setCurrentPage, onUserUpdate }: UserSpaceProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'active-orders' | 'history' | 'reviews' | 'affiliate' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    points: 0,
    totalOrders: 0,
    affiliateCode: '',
    isAffiliate: false,
    totalSavings: 0,
    nextRewardAt: 500
  });

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    loadAllData();
    
    const interval = setInterval(() => {
      console.log('[UserSpace] 🔄 Auto-refreshing orders...');
      fetchOrders();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchUserProfile(),
        fetchReviews()
      ]);
    } catch (error) {
      console.error('[UserSpace] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success('Données actualisées !');
  };

  const fetchOrders = async () => {
    try {
      console.log(`[UserSpace] 📦 Fetching orders for user: ${user.id}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/orders/user/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userOrders = data.orders || [];
        console.log(`[UserSpace] ✅ Orders loaded: ${userOrders.length}`);
        console.log('[UserSpace] 📋 Orders data:', userOrders);
        setOrders(userOrders);
      } else {
        console.error(`[UserSpace] ❌ Failed to fetch orders: ${response.status}`);
        setOrders([]);
      }
    } catch (error) {
      console.error('[UserSpace] ❌ Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/user/${user.id}/profile`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[UserSpace] ✅ Profile loaded:', data.profile);
        setUserProfile(data.profile);
      } else {
        console.log('[UserSpace] ℹ️ No profile found, using defaults');
        // Use defaults
        setUserProfile({
          points: 0,
          totalOrders: orders.length,
          affiliateCode: '',
          isAffiliate: false,
          totalSavings: 0,
          nextRewardAt: 500
        });
      }
    } catch (error) {
      console.error('[UserSpace] ❌ Error fetching profile:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/user/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[UserSpace] ✅ Reviews loaded:', data.reviews?.length || 0);
        setReviews(data.reviews || []);
      } else {
        console.log('[UserSpace] ℹ️ No reviews found');
        setReviews([]);
      }
    } catch (error) {
      console.error('[UserSpace] ❌ Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderForReview || !reviewComment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/orders/${selectedOrderForReview.id}/review`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            rating: reviewRating,
            text: reviewComment
          })
        }
      );

      if (response.ok) {
        toast.success('🎉 Avis envoyé ! +50 points gagnés');
        setShowReviewModal(false);
        setReviewRating(5);
        setReviewComment('');
        setSelectedOrderForReview(null);
        await loadAllData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('[UserSpace] Error submitting review:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleJoinAffiliate = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/user/${user.id}/join-affiliate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Bienvenue dans le programme d\'affiliation !');
        setUserProfile(prev => ({
          ...prev,
          isAffiliate: true,
          affiliateCode: data.affiliateCode
        }));
      } else {
        toast.error('Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('[UserSpace] Error joining affiliate:', error);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  const copyAffiliateCode = () => {
    if (userProfile.affiliateCode) {
      navigator.clipboard.writeText(userProfile.affiliateCode);
      toast.success('Code copié !');
    }
  };

  // Normalize order data
  const normalizeOrder = (order: Order) => ({
    ...order,
    menuTitle: order.menuTitle || order.menuName || 'Menu',
    numberOfPeople: order.numberOfPeople || order.persons || 0,
  });

  // Filtrer les commandes
  const normalizedOrders = orders.map(normalizeOrder);
  const activeOrders = normalizedOrders.filter(o => !['completed', 'cancelled', 'delivered'].includes(o.status));
  const completedOrders = normalizedOrders.filter(o => ['completed', 'delivered'].includes(o.status));
  const ordersToReview = completedOrders.filter(o => !o.reviewId);
  const progressToReward = Math.min(100, (userProfile.points / userProfile.nextRewardAt) * 100);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'prep_started': 'Préparation démarrée',
      'cooking': 'En cours de cuisson',
      'ready': 'Prête',
      'out_for_delivery': 'En livraison',
      'delivered': 'Livrée',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (['completed', 'delivered'].includes(status)) return 'bg-green-500';
    if (status.includes('delivery') || status === 'out_for_delivery') return 'bg-purple-500';
    if (['prep_started', 'cooking', 'ready'].includes(status)) return 'bg-orange-500';
    if (status === 'confirmed') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    if (['completed', 'delivered'].includes(status)) return <CheckCircle className="h-5 w-5" />;
    if (status.includes('delivery') || status === 'out_for_delivery') return <Truck className="h-5 w-5" />;
    if (['prep_started', 'cooking', 'ready'].includes(status)) return <ChefHat className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getProgressPercentage = (status: string): number => {
    const progressMap: Record<string, number> = {
      'pending': 10,
      'confirmed': 25,
      'prep_started': 40,
      'cooking': 60,
      'ready': 75,
      'out_for_delivery': 90,
      'delivered': 100,
      'completed': 100
    };
    return progressMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  // If no orders at all
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bonjour {user.firstName} ! 👋
            </h1>
            <p className="text-gray-600">Bienvenue dans votre espace client</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous n'avez pas encore de commandes
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Découvrez nos délicieux menus et passez votre première commande !
            </p>
            <button
              onClick={() => setCurrentPage({ type: 'menus' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center gap-2"
            >
              <ChefHat className="h-6 w-6" />
              Découvrir nos menus
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Refresh */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bonjour {user.firstName} ! 👋
            </h1>
            <p className="text-gray-600">Suivez vos commandes en temps réel</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('active-orders')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap relative ${
                  activeTab === 'active-orders'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 En cours
                {activeOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🕐 Historique ({completedOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap relative ${
                  activeTab === 'reviews'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⭐ Mes avis
                {ordersToReview.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {ordersToReview.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === 'affiliate'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Affiliation
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ Profil
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Points fidélité</p>
                      <p className="text-3xl font-bold mt-1">{userProfile.points}</p>
                    </div>
                    <Award className="h-12 w-12 opacity-70" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Commandes</p>
                      <p className="text-3xl font-bold mt-1">{orders.length}</p>
                    </div>
                    <Package className="h-12 w-12 opacity-70" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">En cours</p>
                      <p className="text-3xl font-bold mt-1">{activeOrders.length}</p>
                    </div>
                    <Clock className="h-12 w-12 opacity-70" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Économies</p>
                      <p className="text-3xl font-bold mt-1">{userProfile.totalSavings}€</p>
                    </div>
                    <Gift className="h-12 w-12 opacity-70" />
                  </div>
                </div>
              </div>

              {/* Recent Active Orders */}
              {activeOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Commandes en cours</h3>
                    <button
                      onClick={() => setActiveTab('active-orders')}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      Voir tout →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeOrders.slice(0, 2).map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className={`w-12 h-12 rounded-full ${getStatusColor(order.status)} flex items-center justify-center text-white`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{order.menuTitle}</h4>
                          <p className="text-sm text-gray-600">{getStatusLabel(order.status)}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {ordersToReview.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-orange-900 mb-1">
                        🎁 {ordersToReview.length} avis en attente
                      </h3>
                      <p className="text-orange-700">Gagnez 50 points par avis !</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Évaluer maintenant
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE ORDERS - REAL TIME */}
          {activeTab === 'active-orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Aucune commande en cours</p>
                  <p className="text-sm text-gray-500 mb-4">Toutes vos commandes ont été livrées !</p>
                  <button
                    onClick={() => setCurrentPage({ type: 'menus' })}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Commander à nouveau
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">
                        Suivi en temps réel activé
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Les statuts de vos commandes sont actualisés automatiquement toutes les 10 secondes
                      </p>
                    </div>
                  </div>

                  {activeOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Header */}
                      <div className={`${getStatusColor(order.status)} text-white p-4`}>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{getStatusLabel(order.status)}</h4>
                            <p className="text-sm opacity-90">
                              Livraison prévue le {new Date(order.deliveryDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-75">Commande</p>
                            <p className="font-mono text-sm">{order.id.split('-')[1]}</p>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{order.menuTitle}</h3>
                        <p className="text-gray-600 mb-4">
                          {order.numberOfPeople} personnes • {order.totalPrice}€
                        </p>
                        
                        {/* Real-time Progress bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Progression</span>
                            <span className="text-gray-600">{getProgressPercentage(order.status)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`${getStatusColor(order.status)} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${getProgressPercentage(order.status)}%` }}
                            />
                          </div>
                        </div>

                        {/* Status timeline */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div className="mb-4 bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Historique</h4>
                            <div className="space-y-2">
                              {order.statusHistory.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                  <div className="flex-1">
                                    <span className="font-medium">{getStatusLabel(item.status)}</span>
                                  </div>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(item.timestamp || item.date).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                          className="w-full border border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir les détails complets
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {completedOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune commande terminée</p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg">{order.menuTitle}</h4>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Terminée
                          </span>
                          {order.pointsEarned && order.pointsEarned > 0 && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              +{order.pointsEarned} pts
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.numberOfPeople} personnes • {order.totalPrice}€
                        </p>
                        <p className="text-xs text-gray-500">
                          Livrée le {new Date(order.completedAt || order.deliveryDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!order.reviewId && (
                          <button
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              setShowReviewModal(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 relative"
                          >
                            <Star className="h-4 w-4" />
                            Donner un avis
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                              !
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                          className="border border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* To review */}
              {ordersToReview.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-orange-900 mb-1">Commandes à évaluer</h3>
                  <p className="text-orange-700 mb-4">Gagnez 50 points par avis !</p>
                  <div className="space-y-3">
                    {ordersToReview.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{order.menuTitle}</h4>
                          <p className="text-sm text-gray-600">
                            Livrée le {new Date(order.completedAt || order.deliveryDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrderForReview(order);
                            setShowReviewModal(true);
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Évaluer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Published */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4">Mes avis publiés ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p>Vous n'avez pas encore publié d'avis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className={`rounded-lg p-4 ${review.validated ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${review.validated ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {review.validated ? 'Publié' : 'En attente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AFFILIATE */}
          {activeTab === 'affiliate' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-lg">Programme d'affiliation</h3>
                </div>
                
                {!userProfile.isAffiliate ? (
                  <div className="space-y-6">
                    <p className="text-gray-600">Parrainez vos amis et gagnez 10% sur leurs commandes</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">1️⃣</span>
                        </div>
                        <h4 className="font-semibold mb-2">Rejoignez</h4>
                        <p className="text-sm text-gray-600">Activez votre code unique</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">2️⃣</span>
                        </div>
                        <h4 className="font-semibold mb-2">Partagez</h4>
                        <p className="text-sm text-gray-600">Invitez vos amis</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">3️⃣</span>
                        </div>
                        <h4 className="font-semibold mb-2">Gagnez</h4>
                        <p className="text-sm text-gray-600">10% sur chaque commande</p>
                      </div>
                    </div>
                    <button
                      onClick={handleJoinAffiliate}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Gift className="h-5 w-5" />
                      Rejoindre le programme
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Votre code de parrainage</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userProfile.affiliateCode}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg font-bold"
                        />
                        <button
                          onClick={copyAffiliateCode}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copier
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-green-600">{userProfile.totalSavings}€</div>
                        <div className="text-sm text-gray-600 mt-1">Gains totaux</div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <Users className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600 mt-1">Filleuls actifs</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4">Paramètres du compte</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input type="text" value={user.firstName} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input type="text" value={user.lastName} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={user.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={user.phone || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <textarea value={user.address || ''} disabled rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <p className="text-sm text-gray-500 italic">Contactez le support pour modifier vos informations</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedOrderForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Évaluer votre commande</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">Partagez votre expérience et gagnez 50 points !</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= reviewRating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-900 font-medium">
                    🎁 Gagnez 50 points en publiant cet avis !
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                >
                  {submittingReview ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Détails de la commande</h3>
                <button onClick={() => setShowOrderDetail(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={`${getStatusColor(selectedOrder.status)} text-white p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="font-semibold text-lg">{getStatusLabel(selectedOrder.status)}</span>
                  </div>
                  <p className="text-sm opacity-90">Commande #{selectedOrder.id}</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">{selectedOrder.menuTitle}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Nombre de personnes:</span>
                      <span className="ml-2 font-medium">{selectedOrder.numberOfPeople}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Prix total:</span>
                      <span className="ml-2 font-medium">{selectedOrder.totalPrice}€</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Date de livraison:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedOrder.deliveryDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Date de commande:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedOrder.deliveryAddress}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                  </div>
                )}

                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Historique du suivi</label>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                          <div className="flex-1">
                            <span className="font-medium">{getStatusLabel(item.status)}</span>
                          </div>
                          <span className="text-gray-500">
                            {new Date(item.timestamp || item.date).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowOrderDetail(false)}
                className="w-full mt-6 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
