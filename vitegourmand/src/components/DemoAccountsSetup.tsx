import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Check, Users, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

export default function DemoAccountsSetup() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const demoAccounts = [
    {
      email: 'admin@demo.app',
      password: 'Admin123!@#',
      firstName: 'José',
      lastName: 'Martinez',
      phone: '+33 6 12 34 56 78',
      address: '15 Rue Sainte-Catherine, 33000 Bordeaux',
      role: 'admin'
    },
    {
      email: 'user@demo.app',
      password: 'User123!@#',
      firstName: 'Julie',
      lastName: 'Dubois',
      phone: '+33 6 98 76 54 32',
      address: '42 Quai des Chartrons, 33000 Bordeaux',
      role: 'user'
    },
    {
      email: 'employee@demo.app',
      password: 'Employee123!@#',
      firstName: 'Pierre',
      lastName: 'Laurent',
      phone: '+33 6 55 44 33 22',
      address: '8 Place de la Bourse, 33000 Bordeaux',
      role: 'employee'
    }
  ];

  const setupDemoAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/init-demo-accounts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setSuccess(true);
        toast.success('Comptes de démonstration créés avec succès !');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la création des comptes');
      }
    } catch (error) {
      console.error('Error setting up demo accounts:', error);
      toast.error('Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Comptes de démonstration créés !</CardTitle>
            <CardDescription className="text-center">
              Utilisez ces identifiants pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {demoAccounts.map((account) => (
              <Card key={account.email} className="bg-gradient-to-r from-orange-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {account.role === 'admin' ? '👑 Administrateur' : 
                       account.role === 'employee' ? '👔 Employé' : '👤 Utilisateur'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-mono font-semibold text-orange-600">{account.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mot de passe</p>
                      <p className="font-mono font-semibold text-orange-600">{account.password}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-medium">{account.firstName} {account.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium capitalize">{account.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <strong>📝 Note importante :</strong> Ces comptes sont créés avec des données de démonstration.
                L'administrateur a un accès complet à toutes les fonctionnalités.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-gray-700 font-medium">
                📋 Les identifiants sont disponibles dans le fichier COMPTES_DEMO.md
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Accéder à l'application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Configuration des comptes de démonstration</CardTitle>
          <CardDescription className="text-center">
            Créez les comptes de test pour explorer l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>🔐 Comptes qui seront créés :</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>admin@demo.app</strong> - Administrateur (accès complet)</li>
                <li><strong>employee@demo.app</strong> - Employé (gestion menus/commandes)</li>
                <li><strong>user@demo.app</strong> - Utilisateur standard (commandes)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Mots de passe sécurisés
            </h3>
            <p className="text-sm text-gray-700">
              Tous les mots de passe respectent les exigences de sécurité :
              10 caractères minimum, majuscules, minuscules, chiffres et caractères spéciaux.
            </p>
          </div>

          <Button
            onClick={setupDemoAccounts}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg"
          >
            {loading ? 'Création en cours...' : 'Créer les comptes de démonstration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
