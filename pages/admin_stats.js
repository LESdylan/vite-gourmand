import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, TrendingUp, Euro, ShoppingBag, Loader2, Calendar
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
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#722F37', '#D4AF37', '#8B4049', '#2C2C2C', '#B8860B', '#5B2333', '#A67B5B'];

export default function AdminStats() {
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuFilter, setMenuFilter] = useState('all');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        window.location.href = createPageUrl('AdminDashboard');
        return;
      }
      
      const [ordersData, menusData] = await Promise.all([
        base44.entities.Order.list(),
        base44.entities.Menu.list(),
      ]);
      
      setOrders(ordersData.filter(o => o.status !== 'annulee'));
      setMenus(menusData);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range and menu
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.created_date);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const dateMatch = isAfter(orderDate, start) && isBefore(orderDate, end);
    const menuMatch = menuFilter === 'all' || order.menu_id === menuFilter;
    
    return dateMatch && menuMatch;
  });

  // Orders by menu
  const ordersByMenu = menus.map(menu => ({
    name: menu.title,
    count: filteredOrders.filter(o => o.menu_id === menu.id).length,
    revenue: filteredOrders.filter(o => o.menu_id === menu.id).reduce((sum, o) => sum + (o.total_price || 0), 0),
  })).sort((a, b) => b.count - a.count);

  // Revenue by menu for pie chart
  const revenueByMenu = ordersByMenu.filter(m => m.revenue > 0).map(m => ({
    name: m.name,
    value: m.revenue,
  }));

  // Total revenue
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  // Revenue by day for line chart
  const revenueByDay = {};
  filteredOrders.forEach(order => {
    const day = format(parseISO(order.created_date), 'dd/MM');
    revenueByDay[day] = (revenueByDay[day] || 0) + (order.total_price || 0);
  });
  const revenueTimeline = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2C]">Statistiques</h1>
            <p className="text-[#2C2C2C]/60">Analyse des performances</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label>Menu</Label>
                <Select value={menuFilter} onValueChange={setMenuFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les menus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les menus</SelectItem>
                    {menus.map(menu => (
                      <SelectItem key={menu.id} value={menu.id}>{menu.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-[#722F37] to-[#8B4049] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Chiffre d'affaires</p>
                    <p className="text-3xl font-bold">{totalRevenue.toFixed(2)}€</p>
                  </div>
                  <Euro className="w-10 h-10 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2C2C2C]/60 text-sm">Commandes</p>
                    <p className="text-3xl font-bold text-[#722F37]">{filteredOrders.length}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-gray-200" />
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
                    <p className="text-[#2C2C2C]/60 text-sm">Panier moyen</p>
                    <p className="text-3xl font-bold text-[#D4AF37]">
                      {filteredOrders.length > 0 
                        ? (totalRevenue / filteredOrders.length).toFixed(2) 
                        : '0.00'}€
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-gray-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders by Menu Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#722F37]" />
                  Commandes par menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersByMenu.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersByMenu}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#722F37" radius={[4, 4, 0, 0]} name="Commandes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue by Menu Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[#722F37]" />
                  Répartition du CA par menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByMenu.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueByMenu}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {revenueByMenu.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#722F37]" />
                  Évolution du chiffre d'affaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#722F37" 
                        strokeWidth={2}
                        dot={{ fill: '#722F37' }}
                        name="CA"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}