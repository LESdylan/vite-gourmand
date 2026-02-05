import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Kanban, 
  Users,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  ChefHat
} from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import MenuManagement from './MenuManagement';
import OrderKanbanDnd from './OrderKanbanDnd';
import OrderKanbanNew from './OrderKanbanNew';
import ContentManagementSystemNew from './ContentManagementSystemNew';
import UserManagementComplete from './UserManagementComplete';
import DishesManagement from './DishesManagement';

interface AdminDashboardProps {
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'employee';
  };
  accessToken: string | null;
  onLogout: () => void;
}

type TabType = 'analytics' | 'menus' | 'dishes' | 'orders' | 'content' | 'users';

export default function AdminDashboard({ user, accessToken, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(user.role === 'admin' ? 'analytics' : 'orders');

  const tabs = [
    { 
      id: 'analytics' as TabType, 
      label: 'Analytics', 
      icon: BarChart3,
      adminOnly: true
    },
    { 
      id: 'orders' as TabType, 
      label: 'Commandes', 
      icon: Kanban,
      adminOnly: false
    },
    { 
      id: 'menus' as TabType, 
      label: 'Menus', 
      icon: UtensilsCrossed,
      adminOnly: false
    },
    { 
      id: 'dishes' as TabType, 
      label: 'Plats', 
      icon: ChefHat,
      adminOnly: false
    },
    { 
      id: 'content' as TabType, 
      label: 'Contenu Site', 
      icon: FileText,
      adminOnly: true
    },
    { 
      id: 'users' as TabType, 
      label: 'Utilisateurs', 
      icon: Users,
      adminOnly: true
    }
  ];

  const visibleTabs = tabs.filter(tab => 
    !tab.adminOnly || user.role === 'admin'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
        {/* Logo & User */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-4">Vite & Gourmand</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'Administrateur' : 'Employé'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="font-medium">Paramètres</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analytics' && user.role === 'admin' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'orders' && (
            <OrderKanbanNew 
              userRole={user.role}
              currentUserName={`${user.firstName} ${user.lastName}`}
              currentUserId={user.id}
            />
          )}

          {activeTab === 'menus' && (
            <MenuManagement userRole={user.role} />
          )}

          {activeTab === 'dishes' && (
            <DishesManagement userRole={user.role} />
          )}

          {activeTab === 'content' && user.role === 'admin' && (
            <ContentManagementSystemNew />
          )}

          {activeTab === 'users' && user.role === 'admin' && (
            <UserManagementComplete userRole={user.role} accessToken={accessToken} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
