import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  ArrowLeft, Search, Filter, ShoppingBag, Loader2,
  Eye, Edit, Phone, Mail, Calendar, MapPin, Users
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
  attente_materiel: 'Attente matériel',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  acceptee: 'bg-blue-100 text-blue-800',
  en_preparation: 'bg-purple-100 text-purple-800',
  en_livraison: 'bg-indigo-100 text-indigo-800',
  livree: 'bg-green-100 text-green-800',
  attente_materiel: 'bg-orange-100 text-orange-800',
  terminee: 'bg-green-100 text-green-800',
  annulee: 'bg-red-100 text-red-800',
};

const statusFlow = [
  'en_attente',
  'acceptee',
  'en_preparation',
  'en_livraison',
  'livree',
  'attente_materiel',
  'terminee'
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelMethod, setCancelMethod] = useState('telephone');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.role !== 'employe') {
        window.location.href = createPageUrl('Home');
        return;
      }
      const data = await base44.entities.Order.list('-created_date');
      setOrders(data);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.menu_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    
    try {
      const newHistory = [...(selectedOrder.status_history || []), {
        status: newStatus,
        date: new Date().toISOString(),
        comment: `Statut mis à jour vers "${statusLabels[newStatus]}"`
      }];

      await base44.entities.Order.update(selectedOrder.id, {
        status: newStatus,
        status_history: newHistory
      });

      // Send email for specific statuses
      if (newStatus === 'attente_materiel') {
        await base44.integrations.Core.SendEmail({
          to: selectedOrder.user_email,
          subject: 'Retour de matériel - Vite & Gourmand',
          body: `
Bonjour ${selectedOrder.user_name},

Votre commande "${selectedOrder.menu_title}" a été livrée avec succès.

Du matériel vous a été prêté et doit être restitué dans un délai de 10 jours ouvrés.

⚠️ Important : Passé ce délai, des frais de 600€ seront facturés conformément à nos conditions générales de vente.

Pour organiser la restitution, merci de nous contacter par téléphone ou email.

Cordialement,
L'équipe Vite & Gourmand
          `
        });
      }

      if (newStatus === 'terminee') {
        await base44.integrations.Core.SendEmail({
          to: selectedOrder.user_email,
          subject: 'Donnez votre avis - Vite & Gourmand',
          body: `
Bonjour ${selectedOrder.user_name},

Nous espérons que votre expérience avec notre menu "${selectedOrder.menu_title}" a été à la hauteur de vos attentes !

Nous serions ravis d'avoir votre avis. Connectez-vous à votre espace client pour partager votre expérience.

Merci de votre confiance !

L'équipe Vite & Gourmand
          `
        });
      }

      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, status: newStatus, status_history: newHistory }
          : o
      ));
      setShowStatusDialog(false);
      setSelectedOrder(null);
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason || !cancelMethod) return;
    setUpdating(true);

    try {
      const newHistory = [...(selectedOrder.status_history || []), {
        status: 'annulee',
        date: new Date().toISOString(),
        comment: `Annulée - Contact: ${cancelMethod} - Motif: ${cancelReason}`
      }];

      await base44.entities.Order.update(selectedOrder.id, {
        status: 'annulee',
        status_history: newHistory,
        cancellation_reason: cancelReason,
        cancellation_contact_method: cancelMethod
      });

      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, status: 'annulee', status_history: newHistory }
          : o
      ));
      setShowCancelDialog(false);
      setSelectedOrder(null);
      setCancelReason('');
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setUpdating(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2C]">Gestion des commandes</h1>
            <p className="text-[#2C2C2C]/60">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Date livraison</TableHead>
                    <TableHead>Personnes</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-xs text-gray-500">{order.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.menu_title}</TableCell>
                        <TableCell>
                          {order.delivery_date && format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: fr })}
                          <br />
                          <span className="text-xs text-gray-500">{order.delivery_time}</span>
                        </TableCell>
                        <TableCell>{order.num_persons}</TableCell>
                        <TableCell className="font-semibold">{order.total_price?.toFixed(2)}€</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                                setShowStatusDialog(true);
                              }}
                              disabled={order.status === 'annulee' || order.status === 'terminee'}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le statut</DialogTitle>
              <DialogDescription>
                Commande de {selectedOrder?.user_name} - {selectedOrder?.menu_title}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.user_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.user_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nouveau statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFlow.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                  <input
                    type="checkbox"
                    id="hasEquipment"
                    checked={selectedOrder.has_equipment_loan || false}
                  />
                  <label htmlFor="hasEquipment">Prêt de matériel</label>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedOrder(selectedOrder);
                  setShowStatusDialog(false);
                  setShowCancelDialog(true);
                }}
                className="text-red-600 border-red-200"
              >
                Annuler la commande
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="bg-[#722F37] hover:bg-[#8B4049]"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler la commande</DialogTitle>
              <DialogDescription>
                Vous devez avoir contacté le client avant d'annuler.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mode de contact utilisé *</Label>
                <Select value={cancelMethod} onValueChange={setCancelMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telephone">Téléphone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Motif d'annulation *</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Expliquez la raison de l'annulation..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Retour
              </Button>
              <Button
                onClick={handleCancel}
                disabled={updating || !cancelReason}
                className="bg-red-600 hover:bg-red-700"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer l\'annulation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}