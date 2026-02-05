import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Euro, 
  ShoppingBag,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data pour les statistiques
const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 120 },
  { month: 'Fév', revenue: 52000, orders: 145 },
  { month: 'Mar', revenue: 48000, orders: 135 },
  { month: 'Avr', revenue: 61000, orders: 168 },
  { month: 'Mai', revenue: 74000, orders: 195 },
  { month: 'Juin', revenue: 88000, orders: 225 },
  { month: 'Juil', revenue: 95000, orders: 248 },
  { month: 'Août', revenue: 78000, orders: 198 },
  { month: 'Sep', revenue: 69000, orders: 176 },
  { month: 'Oct', revenue: 82000, orders: 209 },
  { month: 'Nov', revenue: 91000, orders: 232 },
  { month: 'Déc', revenue: 105000, orders: 265 }
];

const menuPopularity = [
  { name: 'Excellence Gastronomique', value: 145, color: '#f97316' },
  { name: 'Mariage de Rêve', value: 128, color: '#3b82f6' },
  { name: 'Business Premium', value: 98, color: '#8b5cf6' },
  { name: 'Végétarien Délice', value: 76, color: '#10b981' },
  { name: 'Autres', value: 89, color: '#6b7280' }
];

const customerSatisfaction = [
  { rating: '5★', count: 342, color: '#10b981' },
  { rating: '4★', count: 128, color: '#3b82f6' },
  { rating: '3★', count: 45, color: '#f59e0b' },
  { rating: '2★', count: 12, color: '#ef4444' },
  { rating: '1★', count: 5, color: '#991b1b' }
];

const topCustomers = [
  { name: 'TechCorp SA', orders: 24, revenue: 28500 },
  { name: 'Mairie de Bordeaux', orders: 18, revenue: 22000 },
  { name: 'Château Margaux', orders: 15, revenue: 35000 },
  { name: 'Hôtel Burdigala', orders: 12, revenue: 18700 },
  { name: 'Société Générale', orders: 11, revenue: 16500 }
];

export default function AnalyticsDashboard() {
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });
  
  const stats = [
    {
      label: 'Chiffre d\'affaires',
      value: '888 000€',
      change: '+15.3%',
      trend: 'up',
      icon: Euro,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Commandes totales',
      value: '2 316',
      change: '+12.8%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Clients actifs',
      value: '1 547',
      change: '+8.4%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-600'
    },
    {
      label: 'Note moyenne',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Analytique</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble des performances de Vite & Gourmand
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              
              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon size={16} />
                    {stat.change}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Évolution du Chiffre d'Affaires</h2>
            <p className="text-sm text-gray-600">Revenus mensuels sur l'année 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              strokeWidth={3}
              name="Chiffre d'affaires (€)"
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Menu Popularity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Menus les Plus Populaires</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={menuPopularity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {menuPopularity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {menuPopularity.map((menu, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: menu.color }} />
                  <span className="text-gray-700">{menu.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{menu.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Satisfaction */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Satisfaction Client</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerSatisfaction}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rating" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" name="Nombre d'avis">
                {customerSatisfaction.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-between bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="text-green-600" size={24} fill="currentColor" />
              <span className="font-semibold text-gray-900">Note moyenne</span>
            </div>
            <span className="text-3xl font-bold text-green-600">4.8/5</span>
          </div>
        </motion.div>
      </div>

      {/* Top Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 Clients</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rang</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Commandes</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">{customer.name}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {customer.orders}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-green-600">
                      {customer.revenue.toLocaleString('fr-FR')}€
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <button className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <TrendingUp size={32} className="mb-3" />
          <h3 className="font-bold text-lg mb-2">Rapport Détaillé</h3>
          <p className="text-sm text-orange-100">Générer un rapport complet</p>
        </button>

        <button className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Users size={32} className="mb-3" />
          <h3 className="font-bold text-lg mb-2">Gestion Clients</h3>
          <p className="text-sm text-blue-100">Voir tous les clients</p>
        </button>

        <button className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Calendar size={32} className="mb-3" />
          <h3 className="font-bold text-lg mb-2">Prévisions</h3>
          <p className="text-sm text-purple-100">Analyse prédictive</p>
        </button>
      </motion.div>
    </div>
  );
}
