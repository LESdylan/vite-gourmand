import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, UtensilsCrossed, Users, Star, Clock,
  ChevronRight, Loader2, TrendingUp, Euro, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#722F37', '#D4AF37', '#8B4049', '#2C2C2C', '#B8860B'];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    pendingReviews: 0,
  });
  const [ordersByMenu, setOrdersByMenu] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin' && currentUser.role !== 'employe') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(currentUser);

        const [orders, menus, reviews] = await Promise.all([
          base44.entities.Order.list(),
          base44.entities.Menu.list(),
          base44.entities.Review.filter({ status: 'en_attente' }),
        ]);

        // Calculate stats
        const pendingOrders = orders.filter(o => o.status === 'en_attente').length;
        const totalRevenue = orders
          .filter(o => o.status !== 'annulee')
          .reduce((sum, o) => sum + (o.total_price || 0), 0);

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
          totalMenus: menus.length,
          pendingReviews: reviews.length,
        });

        // Orders by menu for chart
        const menuOrderCounts = {};
        orders.forEach(order => {
          if (order.status !== 'annulee') {
            const title = order.menu_title || 'Inconnu';
            menuOrderCounts[title] = (menuOrderCounts[title] || 0) + 1;
          }
        });
        setOrdersByMenu(
          Object.entries(menuOrderCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );

        // Recent orders
        setRecentOrders(orders.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        ).slice(0, 5));

      } catch (e) {
        console.error('Erreur:', e);
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2C2C2C]">
            Tableau de bord {isAdmin ? 'Administrateur' : 'Employé'}
          </h1>
          <p className="text-[#2C2C2C]/60">Bienvenue, {user?.full_name}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#722F37] to-[#8B4049] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Commandes totales</p>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2C2C2C]/60 text-sm">En attente</p>
                    <p className="text-3xl font-bold text-[#722F37]">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2C2C2C]/60 text-sm">Chiffre d'affaires</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalRevenue.toFixed(0)}€</p>
                  </div>
                  <Euro className="w-10 h-10 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2C2C2C]/60 text-sm">Avis en attente</p>
                    <p className="text-3xl font-bold text-[#D4AF37]">{stats.pendingReviews}</p>
                  </div>
                  <Star className="w-10 h-10 text-[#D4AF37]/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to={createPageUrl('AdminOrders')}>
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <ShoppingBag className="w-6 h-6 text-[#722F37]" />
              <span>Gérer les commandes</span>
            </Button>
          </Link>
          <Link to={createPageUrl('AdminMenus')}>
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <UtensilsCrossed className="w-6 h-6 text-[#722F37]" />
              <span>Gérer les menus</span>
            </Button>
          </Link>
          <Link to={createPageUrl('AdminReviews')}>
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Star className="w-6 h-6 text-[#722F37]" />
              <span>Gérer les avis</span>
            </Button>
          </Link>
          {isAdmin && (
            <Link to={createPageUrl('AdminUsers')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="w-6 h-6 text-[#722F37]" />
                <span>Gérer les employés</span>
              </Button>
            </Link>
          )}
          <Link to={createPageUrl('AdminHours')}>
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Clock className="w-6 h-6 text-[#722F37]" />
              <span>Horaires</span>
            </Button>
          </Link>
          {isAdmin && (
            <Link to={createPageUrl('AdminStats')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="w-6 h-6 text-[#722F37]" />
                <span>Statistiques</span>
              </Button>
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders by Menu Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#722F37]" />
                  Commandes par menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersByMenu.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersByMenu}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#722F37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#722F37]" />
                  Dernières commandes
                </CardTitle>
                <Link to={createPageUrl('AdminOrders')}>
                  <Button variant="ghost" size="sm">
                    Voir tout
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{order.menu_title}</p>
                        <p className="text-xs text-gray-500">{order.user_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#722F37]">{order.total_price?.toFixed(2)}€</p>
                        <p className="text-xs text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}