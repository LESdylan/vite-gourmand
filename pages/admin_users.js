import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, Plus, Users, Loader2, Mail, UserX, UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        window.location.href = createPageUrl('AdminDashboard');
        return;
      }
      setCurrentUser(user);
      
      const allUsers = await base44.entities.User.list();
      // Filter to show only employees
      const employees = allUsers.filter(u => u.role === 'employe' || u.role === 'admin');
      setUsers(employees);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!formData.email || !formData.password) return;
    
    // Validate password: 10 chars min, 1 special, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setCreating(true);
    try {
      // Invite the user as employee
      await base44.users.inviteUser(formData.email, 'employe');
      
      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: 'Votre compte employé Vite & Gourmand',
        body: `
Bonjour,

Un compte employé a été créé pour vous sur la plateforme Vite & Gourmand.

Votre identifiant : ${formData.email}

Pour obtenir votre mot de passe, veuillez contacter votre administrateur.

Cordialement,
L'équipe Vite & Gourmand
        `
      });

      setShowDialog(false);
      setFormData({ email: '', password: '' });
      loadUsers();
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setCreating(false);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      await base44.entities.User.update(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2C2C2C]">Gestion des employés</h1>
              <p className="text-[#2C2C2C]/60">{users.length} compte{users.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-[#722F37] hover:bg-[#8B4049]">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel employé
          </Button>
        </div>

        {/* Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Seuls les administrateurs peuvent créer des comptes employés.
              Il n'est pas possible de créer un compte administrateur depuis l'application.
            </p>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Aucun employé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'Non renseigné'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                          {user.role === 'admin' ? 'Administrateur' : 'Employé'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.created_date && format(new Date(user.created_date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.is_active !== false ? 'Actif' : 'Désactivé'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.id !== currentUser?.id && user.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserActive(user)}
                            className={user.is_active !== false ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
                          >
                            {user.is_active !== false ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activer
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Employee Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un compte employé</DialogTitle>
              <DialogDescription>
                Un email sera envoyé à l'employé pour l'informer de la création de son compte.
                Vous devrez lui communiquer le mot de passe séparément.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 10 caractères"
                />
                <p className="text-xs text-gray-500">
                  10 caractères minimum avec : 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateEmployee}
                disabled={creating || !formData.email || !formData.password}
                className="bg-[#722F37] hover:bg-[#8B4049]"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le compte'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}