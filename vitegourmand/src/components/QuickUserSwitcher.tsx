import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Crown, Briefcase, User as UserIcon, Check, ChevronUp } from 'lucide-react';
import { getUserById } from '../utils/mockUsers';

interface QuickUserSwitcherProps {
  currentUser: any;
  onSwitchUser: (user: any) => void;
}

export default function QuickUserSwitcher({ currentUser, onSwitchUser }: QuickUserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleDisplay = (role: string) => {
    const roles = {
      admin: { label: 'Admin', icon: '👑' },
      employee: { label: 'Employé', icon: '👔' },
      customer: { label: 'Client', icon: '🛒' }
    };
    return roles[role as keyof typeof roles] || { label: 'Utilisateur', icon: '👤' };
  };

  // Quick access users: 1 admin, 2 employees, 5 customers
  const quickUsers = [
    // 1 Admin
    { id: 'u001', label: 'Julie (Admin)', icon: Crown, color: 'red' },
    
    // 2 Employees
    { id: 'u003', label: 'Sophie (Employé)', icon: Briefcase, color: 'blue' },
    { id: 'u004', label: 'Marc (Employé)', icon: Briefcase, color: 'blue' },
    
    // 5 Customers
    { id: 'u005', label: 'Marie (Client)', icon: UserIcon, color: 'green' },
    { id: 'u006', label: 'Jean (Client)', icon: UserIcon, color: 'green' },
    { id: 'u007', label: 'Claire (Client)', icon: UserIcon, color: 'green' },
    { id: 'u008', label: 'Thomas (Client)', icon: UserIcon, color: 'green' },
    { id: 'u009', label: 'Isabelle (Client)', icon: UserIcon, color: 'green' },
  ];

  const handleSelectUser = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      onSwitchUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address
        }
      });
      setIsOpen(false);
    }
  };

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      red: {
        bg: isActive ? 'bg-red-100' : 'hover:bg-red-50',
        text: 'text-red-600',
        border: isActive ? 'border-red-500' : 'border-red-200',
        icon: 'text-red-500'
      },
      blue: {
        bg: isActive ? 'bg-blue-100' : 'hover:bg-blue-50',
        text: 'text-blue-600',
        border: isActive ? 'border-blue-500' : 'border-blue-200',
        icon: 'text-blue-500'
      },
      green: {
        bg: isActive ? 'bg-green-100' : 'hover:bg-green-50',
        text: 'text-green-600',
        border: isActive ? 'border-green-500' : 'border-green-200',
        icon: 'text-green-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden w-72"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-4 py-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users size={16} />
                Changement Rapide
              </h3>
              <p className="text-xs text-purple-100 mt-0.5">Sélectionnez un utilisateur</p>
            </div>

            {/* Users List */}
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Admin Section */}
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1 flex items-center gap-1.5">
                  <Crown size={12} />
                  Admin
                </div>
                {quickUsers.slice(0, 1).map((quickUser) => {
                  const isCurrentUser = currentUser?.id === quickUser.id;
                  const Icon = quickUser.icon;
                  const colorClasses = getColorClasses(quickUser.color, isCurrentUser);
                  
                  return (
                    <button
                      key={quickUser.id}
                      onClick={() => handleSelectUser(quickUser.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${colorClasses.bg} ${colorClasses.border} group`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold`}>
                        {quickUser.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                          {quickUser.label}
                          {isCurrentUser && <Check size={14} className={colorClasses.icon} />}
                        </div>
                      </div>
                      <Icon size={16} className={colorClasses.icon} />
                    </button>
                  );
                })}
              </div>

              {/* Employees Section */}
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1 flex items-center gap-1.5">
                  <Briefcase size={12} />
                  Employés
                </div>
                {quickUsers.slice(1, 3).map((quickUser) => {
                  const isCurrentUser = currentUser?.id === quickUser.id;
                  const Icon = quickUser.icon;
                  const colorClasses = getColorClasses(quickUser.color, isCurrentUser);
                  
                  return (
                    <button
                      key={quickUser.id}
                      onClick={() => handleSelectUser(quickUser.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${colorClasses.bg} ${colorClasses.border} group mb-1.5 last:mb-0`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs font-bold`}>
                        {quickUser.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                          {quickUser.label}
                          {isCurrentUser && <Check size={14} className={colorClasses.icon} />}
                        </div>
                      </div>
                      <Icon size={16} className={colorClasses.icon} />
                    </button>
                  );
                })}
              </div>

              {/* Customers Section */}
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1 flex items-center gap-1.5">
                  <UserIcon size={12} />
                  Clients
                </div>
                {quickUsers.slice(3).map((quickUser) => {
                  const isCurrentUser = currentUser?.id === quickUser.id;
                  const Icon = quickUser.icon;
                  const colorClasses = getColorClasses(quickUser.color, isCurrentUser);
                  
                  return (
                    <button
                      key={quickUser.id}
                      onClick={() => handleSelectUser(quickUser.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${colorClasses.bg} ${colorClasses.border} group mb-1.5 last:mb-0`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold`}>
                        {quickUser.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                          {quickUser.label}
                          {isCurrentUser && <Check size={14} className={colorClasses.icon} />}
                        </div>
                      </div>
                      <Icon size={16} className={colorClasses.icon} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                8 utilisateurs • Clic pour basculer
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white rounded-full shadow-2xl transition-all font-semibold overflow-hidden group"
      >
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <Users size={20} className="relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-xs opacity-90 flex items-center gap-1">
            {getRoleDisplay(currentUser?.role).icon}
            {getRoleDisplay(currentUser?.role).label}
          </div>
          <div className="text-sm leading-tight font-bold">{currentUser?.firstName} {currentUser?.lastName}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <ChevronUp size={18} />
        </motion.div>
      </motion.button>
    </div>
  );
}
