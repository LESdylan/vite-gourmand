import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Star, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { getDemoStatistics } from '../utils/demoData';

type AdminDashboardProps = {
  accessToken: string | null;
  isDemoMode?: boolean;
};

type Statistics = {
  ordersByMenu: Array<{ menu: string; count: number }>;
  revenueByMenu: Array<{ menu: string; revenue: number }>;
  totalOrders: number;
  totalRevenue: number;
};

export default function AdminDashboard({ accessToken, isDemoMode = false }: AdminDashboardProps) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      if (isDemoMode) {
        // Mode démo : utiliser les données locales
        const demoStats = getDemoStatistics();
        setStats(demoStats);
        setLoading(false);
      } else {
        // Mode réel : appeler le backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/admin/statistics`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          toast.error('Erreur lors du chargement des statistiques');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const COLORS = ['#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#c2410c', '#9a3412', '#7c2d12'];

  // KPI Cards Data
  const kpis = [
    {
      title: 'Chiffre d\'affaires total',
      value: `${stats?.totalRevenue.toFixed(2) || 0}€`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Commandes totales',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: '+8.2%',
      trendUp: true
    },
    {
      title: 'Revenu moyen / commande',
      value: `${stats ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}€`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: '+4.3%',
      trendUp: true
    },
    {
      title: 'Menus actifs',
      value: stats?.ordersByMenu.length || 0,
      icon: Package,
      color: 'bg-purple-500',
      trend: '→',
      trendUp: null
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h2>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    {kpi.trend && (
                      <p className={`text-sm mt-1 ${
                        kpi.trendUp === true ? 'text-green-600' : 
                        kpi.trendUp === false ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {kpi.trend}
                      </p>
                    )}
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
              Commandes par Menu
            </CardTitle>
            <CardDescription>Nombre de commandes pour chaque menu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.ordersByMenu || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="menu" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ea580c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Chiffre d'affaires par Menu
            </CardTitle>
            <CardDescription>Revenu généré par chaque menu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.revenueByMenu || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="menu" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => `${value}€`} />
                <Bar dataKey="revenue" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
              Répartition du CA
            </CardTitle>
            <CardDescription>Distribution du chiffre d'affaires par menu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.revenueByMenu || []}
                  dataKey="revenue"
                  nameKey="menu"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.menu}: ${entry.revenue}€`}
                >
                  {(stats?.revenueByMenu || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}€`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Menus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Menus les Plus Populaires
            </CardTitle>
            <CardDescription>Classement par nombre de commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.ordersByMenu || [])
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((menu, index) => {
                  const revenue = stats?.revenueByMenu.find(r => r.menu === menu.menu)?.revenue || 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-gray-300'
                        } text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{menu.menu}</p>
                          <p className="text-sm text-gray-600">{menu.count} commandes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{revenue.toFixed(2)}€</p>
                        <p className="text-xs text-gray-500">CA généré</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Activité Récente
          </CardTitle>
          <CardDescription>Dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 p-2 rounded-full">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Nouvelle commande reçue</p>
                <p className="text-sm text-gray-600">Menu Mariage Royal - 50 personnes</p>
                <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-600 p-2 rounded-full">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Nouvel avis 5 étoiles</p>
                <p className="text-sm text-gray-600">"Service exceptionnel et plats délicieux!"</p>
                <p className="text-xs text-gray-500 mt-1">Il y a 4 heures</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="bg-orange-600 p-2 rounded-full">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Menu mis à jour</p>
                <p className="text-sm text-gray-600">Menu Gourmand - Prix modifié</p>
                <p className="text-xs text-gray-500 mt-1">Il y a 1 jour</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-600 p-2 rounded-full">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                <p className="text-sm text-gray-600">user@example.com</p>
                <p className="text-xs text-gray-500 mt-1">Il y a 1 jour</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Taux de satisfaction</p>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-orange-100 text-sm mt-2">Basé sur les avis clients</p>
              </div>
              <Star className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Taux de conversion</p>
                <p className="text-3xl font-bold">24%</p>
                <p className="text-green-100 text-sm mt-2">Visiteurs → Commandes</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Clients fidèles</p>
                <p className="text-3xl font-bold">156</p>
                <p className="text-blue-100 text-sm mt-2">2+ commandes</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
