import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Eye, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import AdminDashboard from './AdminDashboard';
import OrderKanban from './OrderKanban';
import type { Page, User } from '../App';
import type { Menu } from './MenusPage';
import type { Order, OrderStatus } from '../types/order';
import { getDemoOrders, updateDemoOrder } from '../utils/demoData';

type AdminPanelProps = {
  user: User;
  accessToken: string | null;
  setCurrentPage: (page: Page) => void;
  isDemoMode?: boolean;
};

type Order = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  menuTitle: string;
  numberOfPeople: number;
  eventDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  specialRequests?: string;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  validated: boolean;
  createdAt: string;
};

export default function AdminPanel({ user, accessToken, setCurrentPage, isDemoMode = false }: AdminPanelProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'dashboard' : 'menus');

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
    if (activeTab === 'menus') {
      await fetchMenus();
    } else if (activeTab === 'orders' || activeTab === 'kanban') {
      await fetchOrders();
    } else if (activeTab === 'reviews' && user?.role === 'admin') {
      await fetchReviews();
    }
    setLoading(false);
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
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
        // Mode démo : utiliser les données locales
        const demoOrdersList = getDemoOrders(user.id, user.role);
        setOrders(demoOrdersList);
      } else {
        // Mode réel : appeler le backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/orders/all`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
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
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/all`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse form data
    const menuData = {
      title: menuForm.title,
      description: menuForm.description,
      images: menuForm.images.split('\n').filter(Boolean),
      theme: menuForm.theme,
      regime: menuForm.regime,
      minPeople: parseInt(menuForm.minPeople),
      price: parseFloat(menuForm.price),
      conditions: menuForm.conditions,
      stock: menuForm.stock ? parseInt(menuForm.stock) : undefined,
      allergens: menuForm.allergens.split(',').map(a => a.trim()).filter(Boolean),
      dishes: menuForm.dishes.split('\n').filter(Boolean).map((dish, index) => {
        const parts = dish.split('|');
        return {
          id: `dish-${Date.now()}-${index}`,
          name: parts[0]?.trim() || '',
          type: (parts[1]?.trim() || 'plat') as 'entrée' | 'plat' | 'dessert',
          allergens: parts[2] ? parts[2].split(',').map(a => a.trim()).filter(Boolean) : []
        };
      })
    };

    try {
      const url = editingMenu
        ? `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus/${editingMenu.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus`;

      const response = await fetch(url, {
        method: editingMenu ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });

      if (response.ok) {
        toast.success(editingMenu ? 'Menu mis à jour' : 'Menu créé');
        setShowMenuForm(false);
        setEditingMenu(null);
        resetMenuForm();
        fetchMenus();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    try {
      if (isDemoMode) {
        // Mode démo : mettre à jour localement
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const statusHistory = [
          ...order.statusHistory,
          {
            status: getStatusLabel(newStatus),
            date: new Date().toISOString(),
            employeeName: user.name,
            notes
          }
        ];

        const updatedOrder = updateDemoOrder(orderId, {
          status: newStatus,
          statusHistory,
          assignedTo: user.id,
          assignedToName: `${user.firstName} ${user.lastName}`
        });

        if (updatedOrder) {
          setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
          toast.success(`Commande passée à : ${getStatusLabel(newStatus)}`);
        }
      } else {
        // Mode réel : appeler le backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/orders/${orderId}/status`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus, notes })
          }
        );

        if (response.ok) {
          await fetchOrders();
          toast.success('Statut mis à jour');
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      'pending': 'En attente de validation',
      'confirmed': 'Commande confirmée',
      'initiated': 'Initiation',
      'prep_ingredients': 'Préparation des ingrédients',
      'assembly': 'Assemblage',
      'cooking': 'Cuisson',
      'packaging': 'Emballage',
      'delivery': 'En cours de livraison',
      'delivered': 'Livré',
      'completed': 'Terminé',
      'cancelled': 'Annulée',
      'late_equipment': 'Équipement non retourné'
    };
    return labels[status];
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/menus/${menuId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (response.ok) {
        toast.success('Menu supprimé');
        fetchMenus();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuForm({
      title: menu.title,
      description: menu.description,
      images: menu.images?.join('\n') || '',
      theme: menu.theme,
      regime: menu.regime,
      minPeople: menu.minPeople.toString(),
      price: menu.price.toString(),
      conditions: menu.conditions || '',
      stock: menu.stock?.toString() || '',
      allergens: menu.allergens?.join(', ') || '',
      dishes: menu.dishes?.map(d => `${d.name}|${d.type}|${d.allergens?.join(', ') || ''}`).join('\n') || ''
    });
    setShowMenuForm(true);
  };

  const resetMenuForm = () => {
    setMenuForm({
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
  };

  const handleValidateReview = async (reviewId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}/validate`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (response.ok) {
        toast.success('Avis validé');
        fetchReviews();
      } else {
        toast.error('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Error validating review:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Panneau d'administration</h1>
            <p className="text-gray-600">Gérez vos menus, commandes et avis clients</p>
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
          <TabsList>
            {user.role === 'admin' && <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>}
            <TabsTrigger value="menus">🍽️ Menus</TabsTrigger>
            <TabsTrigger value="kanban">📋 Kanban</TabsTrigger>
            <TabsTrigger value="orders">📦 Commandes</TabsTrigger>
            {user.role === 'admin' && <TabsTrigger value="reviews">⭐ Avis</TabsTrigger>}
          </TabsList>

          {/* Dashboard Tab */}
          {user.role === 'admin' && (
            <TabsContent value="dashboard" className="mt-6">
              <AdminDashboard accessToken={accessToken} isDemoMode={isDemoMode} />
            </TabsContent>
          )}

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="mt-6">
            {/* Message d'Accueil */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">👋</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-blue-900 mb-2">
                      Bienvenue dans votre espace de production !
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Gérez vos commandes de manière visuelle avec ce tableau Kanban. Les commandes sont automatiquement triées par priorité et date de livraison.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white/50 p-2 rounded">
                        <div className="font-semibold text-red-700">🚨 URGENT</div>
                        <div className="text-gray-600">Livraison aujourd'hui</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="font-semibold text-orange-700">⚡ Prioritaire</div>
                        <div className="text-gray-600">Livraison demain</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="font-semibold text-blue-700">📌 Normal</div>
                        <div className="text-gray-600">2-4 jours</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="font-semibold text-gray-700">📋 Faible</div>
                        <div className="text-gray-600">+5 jours</div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-3 font-medium">
                      💡 Cliquez sur "Passer à l'étape suivante" pour faire avancer une commande. Le client sera notifié en temps réel !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Vue Kanban - Gestion des Commandes
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Faites glisser les commandes ou utilisez les boutons pour faire avancer le processus de production.
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">Chargement...</div>
                ) : (
                  <OrderKanban 
                    orders={orders}
                    onUpdateStatus={handleUpdateOrderStatus}
                    currentUser={{ 
                      id: user.id, 
                      name: `${user.firstName} ${user.lastName}` 
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menus Tab */}
          <TabsContent value="menus" className="mt-6">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setEditingMenu(null);
                  resetMenuForm();
                  setShowMenuForm(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau menu
              </Button>
            </div>

            {showMenuForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editingMenu ? 'Modifier le menu' : 'Créer un nouveau menu'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMenuSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Titre *</Label>
                        <Input
                          value={menuForm.title}
                          onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Thème *</Label>
                        <Input
                          value={menuForm.theme}
                          onChange={(e) => setMenuForm({ ...menuForm, theme: e.target.value })}
                          placeholder="Noël, Pâques, Classique..."
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={menuForm.description}
                        onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label>Images (URLs, une par ligne)</Label>
                      <Textarea
                        value={menuForm.images}
                        onChange={(e) => setMenuForm({ ...menuForm, images: e.target.value })}
                        rows={3}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Régime *</Label>
                        <Input
                          value={menuForm.regime}
                          onChange={(e) => setMenuForm({ ...menuForm, regime: e.target.value })}
                          placeholder="Classique, Végétarien, Vegan..."
                          required
                        />
                      </div>
                      <div>
                        <Label>Minimum de personnes *</Label>
                        <Input
                          type="number"
                          value={menuForm.minPeople}
                          onChange={(e) => setMenuForm({ ...menuForm, minPeople: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Prix (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={menuForm.price}
                          onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Stock disponible (optionnel)</Label>
                      <Input
                        type="number"
                        value={menuForm.stock}
                        onChange={(e) => setMenuForm({ ...menuForm, stock: e.target.value })}
                        placeholder="Laisser vide pour illimité"
                      />
                    </div>

                    <div>
                      <Label>Allergènes (séparés par des virgules)</Label>
                      <Input
                        value={menuForm.allergens}
                        onChange={(e) => setMenuForm({ ...menuForm, allergens: e.target.value })}
                        placeholder="Gluten, Lactose, Fruits à coque..."
                      />
                    </div>

                    <div>
                      <Label>Plats (un par ligne, format: Nom|Type|Allergènes)</Label>
                      <Textarea
                        value={menuForm.dishes}
                        onChange={(e) => setMenuForm({ ...menuForm, dishes: e.target.value })}
                        rows={6}
                        placeholder="Exemple:\nSalade César|entrée|Gluten, Lactose\nPoulet rôti|plat|\nTarte au citron|dessert|Gluten"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type: entrée, plat, ou dessert
                      </p>
                    </div>

                    <div>
                      <Label>Conditions et informations</Label>
                      <Textarea
                        value={menuForm.conditions}
                        onChange={(e) => setMenuForm({ ...menuForm, conditions: e.target.value })}
                        rows={3}
                        placeholder="Délai de commande, précautions de stockage..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                        {editingMenu ? 'Mettre à jour' : 'Créer'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowMenuForm(false);
                          setEditingMenu(null);
                          resetMenuForm();
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {menus.map((menu) => (
                <Card key={menu.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{menu.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{menu.theme}</Badge>
                          <Badge variant="outline">{menu.regime}</Badge>
                          <Badge variant="outline">{menu.minPeople} pers. min</Badge>
                          <Badge variant="outline">{menu.price}€</Badge>
                          {menu.stock !== undefined && (
                            <Badge variant={menu.stock <= 5 ? 'destructive' : 'secondary'}>
                              Stock: {menu.stock}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{menu.description}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => setCurrentPage({ type: 'menu-detail', menuId: menu.id })}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditMenu(menu)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role === 'admin' && (
                          <Button
                            onClick={() => handleDeleteMenu(menu.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-600">
                    Aucune commande
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">{order.menuTitle}</h3>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p><strong>Client:</strong> {order.userName}</p>
                            <p><strong>Email:</strong> {order.userEmail}</p>
                            <p><strong>Téléphone:</strong> {order.userPhone}</p>
                            <p><strong>Nombre de personnes:</strong> {order.numberOfPeople}</p>
                            <p><strong>Date événement:</strong> {new Date(order.eventDate).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Prix total:</strong> {order.totalPrice}€</p>
                            {order.specialRequests && (
                              <p><strong>Demandes:</strong> {order.specialRequests}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div className="mb-4">
                            <Label>Statut</Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="confirmed">Confirmée</SelectItem>
                                <SelectItem value="preparing">En préparation</SelectItem>
                                <SelectItem value="completed">Terminée</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-xs text-gray-500">
                            Commandé le {new Date(order.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          {user.role === 'admin' && (
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center text-gray-600">
                      Aucun avis
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className={review.validated ? 'border-green-500' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-bold mr-3">{review.userName}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <Badge variant={review.validated ? 'default' : 'secondary'} className="ml-3">
                                {review.validated ? 'Validé' : 'En attente'}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-2">{review.text}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          {!review.validated && (
                            <Button
                              onClick={() => handleValidateReview(review.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 ml-4"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
