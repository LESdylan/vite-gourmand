import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingBag, Calendar, MapPin, Users, Euro, 
  ChevronRight, Loader2, Filter, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livree: 'Livrée',
  attente_materiel: 'Attente retour matériel',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  acceptee: 'bg-blue-100 text-blue-800 border-blue-200',
  en_preparation: 'bg-purple-100 text-purple-800 border-purple-200',
  en_livraison: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  livree: 'bg-green-100 text-green-800 border-green-200',
  attente_materiel: 'bg-orange-100 text-orange-800 border-orange-200',
  terminee: 'bg-green-100 text-green-800 border-green-200',
  annulee: 'bg-red-100 text-red-800 border-red-200',
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const user = await base44.auth.me();
        const userOrders = await base44.entities.Order.filter(
          { user_id: user.id },
          '-created_date'
        );
        setOrders(userOrders);
      } catch (e) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <section className="bg-[#722F37] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link to={createPageUrl('UserDashboard')}>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Mon espace
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes commandes</h1>
                <p className="text-white/70">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-[#2C2C2C]/60" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
                  Aucune commande
                </h3>
                <p className="text-[#2C2C2C]/60 mb-6">
                  {statusFilter === 'all' 
                    ? "Vous n'avez pas encore passé de commande"
                    : "Aucune commande avec ce statut"
                  }
                </p>
                <Link to={createPageUrl('Menus')}>
                  <Button className="bg-[#722F37] hover:bg-[#8B4049]">
                    Découvrir nos menus
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`OrderDetail?id=${order.id}`)}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-lg bg-[#722F37]/10 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-8 h-8 text-[#722F37]" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-[#2C2C2C] mb-1">
                                  {order.menu_title}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#2C2C2C]/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {order.delivery_date && format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: fr })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {order.num_persons} pers.
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {order.delivery_city}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                            <Badge className={`${statusColors[order.status]} border`}>
                              {statusLabels[order.status]}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-[#722F37]">
                                {order.total_price?.toFixed(2)}€
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}