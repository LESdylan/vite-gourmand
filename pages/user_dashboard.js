import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, 
  ShoppingBag, Loader2, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData({
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          city: currentUser.city || '',
          postal_code: currentUser.postal_code || '',
        });

        const userOrders = await base44.entities.Order.filter(
          { user_id: currentUser.id },
          '-created_date',
          5
        );
        setOrders(userOrders);
      } catch (e) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (e) {
      console.error('Erreur sauvegarde:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      en_attente: 'En attente',
      acceptee: 'Acceptée',
      en_preparation: 'En préparation',
      en_livraison: 'En livraison',
      livree: 'Livrée',
      attente_materiel: 'Attente retour matériel',
      terminee: 'Terminée',
      annulee: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      acceptee: 'bg-blue-100 text-blue-800',
      en_preparation: 'bg-purple-100 text-purple-800',
      en_livraison: 'bg-indigo-100 text-indigo-800',
      livree: 'bg-green-100 text-green-800',
      attente_materiel: 'bg-orange-100 text-orange-800',
      terminee: 'bg-green-100 text-green-800',
      annulee: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Mon espace</h1>
          <p className="text-[#2C2C2C]/60">Bienvenue, {user?.full_name || user?.email}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#722F37]" />
                  Mes informations
                </CardTitle>
                {!editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#722F37] hover:bg-[#8B4049]"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Enregistrer
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prénom</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code postal</Label>
                      <Input
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#2C2C2C]/70">
                      <Mail className="w-5 h-5 text-[#722F37]" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#2C2C2C]/70">
                      <User className="w-5 h-5 text-[#722F37]" />
                      <span>{user?.first_name} {user?.last_name}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-3 text-[#2C2C2C]/70">
                        <Phone className="w-5 h-5 text-[#722F37]" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user?.address && (
                      <div className="flex items-center gap-3 text-[#2C2C2C]/70">
                        <MapPin className="w-5 h-5 text-[#722F37]" />
                        <span>{user.address}, {user.postal_code} {user.city}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl('Menus')}>
                  <Button variant="outline" className="w-full justify-between">
                    Voir les menus
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl('UserOrders')}>
                  <Button variant="outline" className="w-full justify-between">
                    Mes commandes
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Contact')}>
                  <Button variant="outline" className="w-full justify-between">
                    Nous contacter
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#722F37]" />
                Dernières commandes
              </CardTitle>
              <Link to={createPageUrl('UserOrders')}>
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-[#2C2C2C]/60 py-8">
                  Aucune commande pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link 
                      key={order.id} 
                      to={createPageUrl(`OrderDetail?id=${order.id}`)}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 bg-[#FFF8F0] rounded-lg hover:bg-[#722F37]/5 transition-colors">
                        <div>
                          <p className="font-medium text-[#2C2C2C]">{order.menu_title}</p>
                          <p className="text-sm text-[#2C2C2C]/60">
                            {order.num_persons} pers. • {order.delivery_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <p className="text-sm font-semibold text-[#722F37] mt-1">
                            {order.total_price?.toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}