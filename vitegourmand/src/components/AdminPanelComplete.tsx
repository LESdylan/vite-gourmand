import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Eye, Palette, Users as UsersIcon, Award, TrendingUp, DollarSign, Package, BarChart3, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';
import AdminDashboard from './admin/AdminDashboard';
import OrderKanban from './OrderKanban';
import type { Page, User } from '../App';
import type { Menu } from './MenusPage';
import type { Order, OrderStatus } from '../types/order';
import { getDemoOrders, updateDemoOrder } from '../utils/demoData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type AdminPanelProps = {
  user: User;
  accessToken: string | null;
  setCurrentPage: (page: Page) => void;
  isDemoMode?: boolean;
};

type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  points: number;
  totalOrders: number;
  affiliateCode: string;
  isAffiliate: boolean;
  totalSavings: number;
  createdAt: string;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  validated: boolean;
  createdAt: string;
};

const COLORS = ['#ff6b35', '#f7931e', '#fdc500', '#4ecdc4', '#44a3f7'];

export default function AdminPanelComplete({ user, accessToken, setCurrentPage, isDemoMode = false }: AdminPanelProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'dashboard' : 'menus');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    totalPoints: 0,
    activeAffiliates: 0,
  });

  // Menu form state
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuForm, setMenuForm] = useState({
    title: '',
    description: '',
    images: '',
    theme: '',
    regime: '',
    minPeople: '',
    price: '',
    conditions: '',
    stock: '',
    allergens: '',
    dishes: ''
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      setCurrentPage({ type: 'home' });
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    
    if (activeTab === 'dashboard' && user?.role === 'admin') {
      await Promise.all([fetchOrders(), fetchUsers(), fetchStats()]);
    } else if (activeTab === 'menus') {
      await fetchMenus();
    } else if (activeTab === 'orders' || activeTab === 'kanban') {
      await fetchOrders();
    } else if (activeTab === 'reviews' && user?.role === 'admin') {
      await fetchReviews();
    } else if (activeTab === 'users' && user?.role === 'admin') {
      await fetchUsers();
    }
    
    setLoading(false);
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      if (isDemoMode) {
        setOrders(getDemoOrders(user.id, user.role));
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/orders`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/users`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('[AdminPanel] Users loaded:', data.users);
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/admin/stats`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleValidateReview = async (reviewId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}/validate`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        toast.success('Avis validé');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error validating review:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        toast.success('Avis supprimé');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRevenueByMonth = () => {
    const months: Record<string, number> = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      months[monthKey] = (months[monthKey] || 0) + order.totalPrice;
    });
    
    return Object.entries(months).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue)
    }));
  };

  const getOrdersByStatus = () => {
    const statusCount: Record<string, number> = {};
    orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Panneau d'administration</h1>
            <p className="text-gray-600">Gérez l'intégralité de votre entreprise</p>
          </div>
          {user.role === 'admin' && (
            <Button
              onClick={() => setCurrentPage({ type: 'design-system' })}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Charte Graphique
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            {user.role === 'admin' && <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="users">👥 Utilisateurs</TabsTrigger>}
            <TabsTrigger value="menus">🍽️ Menus</TabsTrigger>
            <TabsTrigger value="kanban">📋 Kanban</TabsTrigger>
            <TabsTrigger value="orders">📦 Commandes</TabsTrigger>
            {user.role === 'admin' && <TabsTrigger value="reviews">⭐ Avis</TabsTrigger>}
          </TabsList>

          {/* Dashboard Tab */}
          {user.role === 'admin' && (
            <TabsContent value="dashboard" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Chiffre d'affaires</p>
                          <p className="text-3xl font-bold mt-1">{stats.totalRevenue}€</p>
                        </div>
                        <DollarSign className="h-12 w-12 opacity-70" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Commandes</p>
                          <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
                        </div>
                        <Package className="h-12 w-12 opacity-70" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Utilisateurs</p>
                          <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                        </div>
                        <UsersIcon className="h-12 w-12 opacity-70" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Panier moyen</p>
                          <p className="text-3xl font-bold mt-1">{stats.avgOrderValue}€</p>
                        </div>
                        <TrendingUp className="h-12 w-12 opacity-70" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                        Chiffre d'affaires par mois
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getRevenueByMonth()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#ff6b35" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Orders by Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-600" />
                        Commandes par statut
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getOrdersByStatus()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getOrdersByStatus().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.totalPoints}</p>
                          <p className="text-sm text-gray-600">Points distribués</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.activeAffiliates}</p>
                          <p className="text-sm text-gray-600">Affiliés actifs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Gift className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{reviews.filter(r => r.validated).length}</p>
                          <p className="text-sm text-gray-600">Avis validés</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* Users Tab */}
          {user.role === 'admin' && (
            <TabsContent value="users" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5 text-orange-600" />
                      Gestion des utilisateurs
                    </CardTitle>
                    <CardDescription>
                      {users.length} utilisateur(s) inscrit(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="py-12 text-center">
                        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun utilisateur trouvé</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {users.map((userProfile) => (
                          <Card key={userProfile.userId} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                                    {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">
                                        {userProfile.firstName} {userProfile.lastName}
                                      </h3>
                                      <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                                        {userProfile.role}
                                      </Badge>
                                      {userProfile.isAffiliate && (
                                        <Badge className="bg-purple-100 text-purple-800">
                                          <UsersIcon className="h-3 w-3 mr-1" />
                                          Affilié
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{userProfile.email}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6 text-center">
                                  <div>
                                    <div className="text-2xl font-bold text-orange-600">{userProfile.points || 0}</div>
                                    <div className="text-xs text-gray-600">Points</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-blue-600">{userProfile.totalOrders || 0}</div>
                                    <div className="text-xs text-gray-600">Commandes</div>
                                  </div>
                                  {userProfile.isAffiliate && (
                                    <div>
                                      <div className="text-2xl font-bold text-green-600">{userProfile.totalSavings || 0}€</div>
                                      <div className="text-xs text-gray-600">Gains</div>
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedUser(userProfile)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Détails
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* Reviews Tab */}
          {user.role === 'admin' && (
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des avis clients</CardTitle>
                  <CardDescription>
                    {reviews.filter(r => !r.validated).length} avis en attente de validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-600">Aucun avis pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className={review.validated ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{review.userName}</span>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                                    ))}
                                  </div>
                                  {review.validated ? (
                                    <Badge className="bg-green-500">Validé</Badge>
                                  ) : (
                                    <Badge variant="secondary">En attente</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{review.text}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {!review.validated && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidateReview(review.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Valider
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="mt-6">
            <OrderKanban 
              user={user} 
              accessToken={accessToken} 
              isDemoMode={isDemoMode}
            />
          </TabsContent>

          {/* Orders Tab - Liste simple */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune commande</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{order.menuTitle}</h4>
                            <p className="text-sm text-gray-600">
                              {order.customerName} • {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{order.totalPrice}€</div>
                            <Badge>{order.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menus Tab - Simplifié */}
          <TabsContent value="menus" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des menus</CardTitle>
                <CardDescription>Créez et gérez vos menus</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-600">
                  Utilisez la page "Menus & Plats" dans le dashboard pour gérer les menus
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Detail Modal */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de l'utilisateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{selectedUser.points || 0}</div>
                        <div className="text-sm text-gray-600">Points fidélité</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{selectedUser.totalOrders || 0}</div>
                        <div className="text-sm text-gray-600">Commandes</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedUser.isAffiliate && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-purple-600" />
                        Programme d'affiliation
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Code:</span>
                          <span className="font-mono font-bold">{selectedUser.affiliateCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gains totaux:</span>
                          <span className="font-bold text-green-600">{selectedUser.totalSavings || 0}€</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-sm text-gray-500">
                  Inscrit le {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
