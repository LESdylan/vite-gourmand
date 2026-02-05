import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Crown, User, Briefcase, ChefHat } from 'lucide-react';
import type { User as UserType } from '../App';

type DemoRoleSelectorProps = {
  onSelectRole: (user: UserType) => void;
};

export default function DemoRoleSelector({ onSelectRole }: DemoRoleSelectorProps) {
  const demoUsers = {
    admin: {
      id: 'demo-admin-001',
      email: 'admin@demo.app',
      firstName: 'José',
      lastName: 'Martinez',
      phone: '+33 6 12 34 56 78',
      address: '15 Rue Sainte-Catherine, 33000 Bordeaux',
      role: 'admin' as const
    },
    employee: {
      id: 'demo-employee-001',
      email: 'employee@demo.app',
      firstName: 'Pierre',
      lastName: 'Laurent',
      phone: '+33 6 55 44 33 22',
      address: '8 Place de la Bourse, 33000 Bordeaux',
      role: 'employee' as const
    },
    user: {
      id: 'demo-user-001',
      email: 'user@demo.app',
      firstName: 'Julie',
      lastName: 'Dubois',
      phone: '+33 6 98 76 54 32',
      address: '42 Quai des Chartrons, 33000 Bordeaux',
      role: 'user' as const
    }
  };

  const roles = [
    {
      key: 'admin',
      title: 'Administrateur',
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Accès complet',
      features: [
        '📊 Dashboard avec statistiques',
        '📋 Gestion des menus',
        '🛒 Gestion des commandes',
        '⭐ Validation des avis',
        '👥 Gestion des employés',
        '🎨 Charte graphique',
        '📝 Logs système'
      ]
    },
    {
      key: 'employee',
      title: 'Employé',
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Gestion opérationnelle',
      features: [
        '📋 Gestion des menus',
        '🛒 Gestion des commandes',
        '⭐ Validation des avis',
        '📞 Contact clients',
        '🔍 Filtres avancés'
      ]
    },
    {
      key: 'user',
      title: 'Utilisateur',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Client standard',
      features: [
        '🍽️ Consulter les menus',
        '🛒 Passer commande',
        '📦 Suivre mes commandes',
        '❌ Annuler (si en attente)',
        '⭐ Laisser un avis',
        '✏️ Modifier mon profil'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-600 rounded-full mb-6">
            <ChefHat className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vite & Gourmand
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Mode Démonstration
          </p>
          <p className="text-sm text-gray-500">
            Choisissez un rôle pour explorer l'application
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const user = demoUsers[role.key as keyof typeof demoUsers];
            
            return (
              <Card 
                key={role.key}
                className={`${role.borderColor} border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105`}
                onClick={() => onSelectRole(user)}
              >
                <CardHeader className={role.bgColor}>
                  <div className="flex justify-center mb-4">
                    <div className={`bg-gradient-to-r ${role.color} p-4 rounded-full`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-center text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">Se connecter en tant que :</p>
                    <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Fonctionnalités :</p>
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600">
                        <span className="mr-2">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => onSelectRole(user)}
                    className={`w-full mt-6 bg-gradient-to-r ${role.color} hover:opacity-90 text-white py-6`}
                  >
                    Accéder en tant que {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🎯 Mode Démonstration</h3>
              <p className="text-orange-100">
                Cette application fonctionne avec des données de démonstration. 
                Explorez librement toutes les fonctionnalités selon le rôle sélectionné.
              </p>
              <p className="text-orange-100 mt-2 text-sm">
                💡 Vous pouvez changer de rôle à tout moment en vous déconnectant.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
