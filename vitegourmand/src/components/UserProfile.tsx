import { useState } from 'react';
import {
  User,
  Settings,
  Gift,
  Users,
  Star,
  LogOut,
  Award,
  TrendingUp,
  Package,
  Clock,
  Euro,
  Calendar,
  Eye,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import type { User as UserType, Page } from '../App';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
  setCurrentPage: (page: Page) => void;
}

// Système de points simulé
const calculateLoyaltyPoints = (user: UserType) => {
  // Simulation : 1 point par euro dépensé
  return Math.floor(Math.random() * 1500) + 300; // 300-1800 points
};

const getPointsLevel = (points: number) => {
  if (points >= 1500) return { level: 'Platinum', color: 'from-purple-600 to-purple-800', nextLevel: '', pointsToNext: 0 };
  if (points >= 1000) return { level: 'Gold', color: 'from-yellow-500 to-yellow-700', nextLevel: 'Platinum', pointsToNext: 1500 - points };
  if (points >= 500) return { level: 'Silver', color: 'from-gray-400 to-gray-600', nextLevel: 'Gold', pointsToNext: 1000 - points };
  return { level: 'Bronze', color: 'from-orange-600 to-orange-800', nextLevel: 'Silver', pointsToNext: 500 - points };
};

// Fausses commandes pour historique
const mockOrderHistory = [
  {
    id: 'ord-001',
    menuName: 'Excellence Gastronomique',
    date: '2026-01-20',
    persons: 12,
    total: 1078.80,
    status: 'completed' as const,
    pointsEarned: 108
  },
  {
    id: 'ord-002',
    menuName: 'Menu Végétarien Délice',
    date: '2025-12-15',
    persons: 8,
    total: 384.00,
    status: 'completed' as const,
    pointsEarned: 38
  },
  {
    id: 'ord-003',
    menuName: 'Brunch Bordelais',
    date: '2025-11-30',
    persons: 15,
    total: 570.00,
    status: 'completed' as const,
    pointsEarned: 57
  },
  {
    id: 'ord-004',
    menuName: 'Déjeuner d\'Affaires',
    date: '2025-10-22',
    persons: 20,
    total: 900.00,
    status: 'completed' as const,
    pointsEarned: 90
  }
];

export default function UserProfile({ user, onLogout, setCurrentPage }: UserProfileProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'settings' | 'affiliate' | 'refer' | 'reviews'>('overview');
  const loyaltyPoints = calculateLoyaltyPoints(user);
  const levelInfo = getPointsLevel(loyaltyPoints);
  const progressPercent = levelInfo.pointsToNext > 0 
    ? ((loyaltyPoints % 500) / 500) * 100 
    : 100;

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    section, 
    badge 
  }: { 
    icon: any; 
    label: string; 
    section: typeof activeSection; 
    badge?: string | number;
  }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        activeSection === section
          ? 'bg-blue-600 text-white shadow-lg'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activeSection === section ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header avec points de fidélité */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${levelInfo.color} text-white rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-10">
            <Award size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {user.metadata?.firstName || 'Utilisateur'} {user.metadata?.lastName || ''}
                    </h1>
                    <p className="text-white/80">{user.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>

            {/* Points et niveau */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award size={32} />
                  <div>
                    <p className="text-2xl font-bold">{loyaltyPoints} points</p>
                    <p className="text-white/80 text-sm">Niveau {levelInfo.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/80">Économies totales</p>
                  <p className="text-2xl font-bold">{(loyaltyPoints * 0.01).toFixed(2)}€</p>
                </div>
              </div>

              {levelInfo.pointsToNext > 0 && (
                <>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-white/80 text-center">
                    Plus que {levelInfo.pointsToNext} points pour atteindre le niveau {levelInfo.nextLevel} !
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">
              <MenuItem icon={TrendingUp} label="Vue d'ensemble" section="overview" />
              <MenuItem icon={Settings} label="Paramètres" section="settings" />
              <MenuItem icon={Gift} label="Programme Affiliation" section="affiliate" badge="Nouveau" />
              <MenuItem icon={Users} label="Parrainage" section="refer" />
              <MenuItem icon={Star} label="Mes Avis" section="reviews" badge={3} />
              <hr className="my-4" />
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-lg transition-all"
              >
                <Package size={20} />
                <span className="font-medium">Parcourir les menus</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              {/* Vue d'ensemble */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Vue d'ensemble
                  </h2>

                  {/* Stats rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <Package className="text-blue-600 mb-2" size={32} />
                      <p className="text-3xl font-bold text-blue-900 mb-1">
                        {mockOrderHistory.length}
                      </p>
                      <p className="text-sm text-blue-700">Commandes totales</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <Euro className="text-green-600 mb-2" size={32} />
                      <p className="text-3xl font-bold text-green-900 mb-1">
                        {mockOrderHistory.reduce((sum, o) => sum + o.total, 0).toFixed(2)}€
                      </p>
                      <p className="text-sm text-green-700">Montant total dépensé</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <Award className="text-purple-600 mb-2" size={32} />
                      <p className="text-3xl font-bold text-purple-900 mb-1">
                        {mockOrderHistory.reduce((sum, o) => sum + o.pointsEarned, 0)}
                      </p>
                      <p className="text-sm text-purple-700">Points gagnés</p>
                    </div>
                  </div>

                  {/* Historique des commandes */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock size={24} className="text-blue-600" />
                      Historique des commandes
                    </h3>

                    <div className="space-y-3">
                      {mockOrderHistory.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Package size={20} className="text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {order.menuName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {order.total.toFixed(2)}€
                              </p>
                              <p className="text-xs text-green-600">
                                +{order.pointsEarned} pts
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users size={16} />
                              {order.persons} personnes
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Terminée
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Paramètres */}
              {activeSection === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Paramètres du compte
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue={user.metadata?.firstName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue={user.metadata?.lastName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user.metadata?.phone || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="06 12 34 56 78"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse par défaut
                      </label>
                      <input
                        type="text"
                        defaultValue={user.metadata?.address || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12 rue Example, 33000 Bordeaux"
                      />
                    </div>

                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              )}

              {/* Programme Affiliation */}
              {activeSection === 'affiliate' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Programme Affiliation
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Devenez partenaire et gagnez des commissions sur chaque vente
                  </p>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mb-6">
                    <div className="text-center mb-6">
                      <Gift size={64} className="text-blue-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Gagnez jusqu'à 15% de commission !
                      </h3>
                      <p className="text-gray-600">
                        Recommandez Vite & Gourmand et recevez des récompenses
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 mb-1">5%</p>
                        <p className="text-sm text-gray-600">1-10 ventes</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 mb-1">10%</p>
                        <p className="text-sm text-gray-600">11-50 ventes</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 mb-1">15%</p>
                        <p className="text-sm text-gray-600">50+ ventes</p>
                      </div>
                    </div>

                    <button className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
                      Rejoindre le programme
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">Comment ça marche ?</h4>
                    <div className="space-y-3">
                      {[
                        'Inscrivez-vous gratuitement au programme',
                        'Recevez votre lien d\'affiliation unique',
                        'Partagez avec votre réseau',
                        'Gagnez des commissions sur chaque vente'
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Parrainage */}
              {activeSection === 'refer' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Parrainer un ami
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Gagnez 50 points pour chaque ami parrainé qui passe commande
                  </p>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Votre code de parrainage
                        </h3>
                        <p className="text-sm text-gray-600">Partagez ce code avec vos amis</p>
                      </div>
                      <Users size={48} className="text-green-600" />
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-center text-3xl font-bold text-green-600 tracking-wider">
                        {user.email.substring(0, 3).toUpperCase()}{Math.random().toString(36).substring(2, 7).toUpperCase()}
                      </p>
                    </div>

                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Copier le code
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">Vos parrainages</h4>
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Aucun parrainage pour le moment</p>
                      <p className="text-sm">Commencez à inviter vos amis !</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Avis */}
              {activeSection === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Mes Avis
                  </h2>

                  <div className="space-y-4">
                    {mockOrderHistory.slice(0, 3).map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{order.menuName}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Excellent menu ! La qualité des produits est exceptionnelle et le service impeccable. Je recommande vivement.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
