import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, Calendar, MapPin, Phone, Mail, Users, Euro,
  Truck, Clock, CheckCircle, XCircle, Edit, Star, Loader2,
  AlertTriangle
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
  en_attente: 'bg-yellow-100 text-yellow-800',
  acceptee: 'bg-blue-100 text-blue-800',
  en_preparation: 'bg-purple-100 text-purple-800',
  en_livraison: 'bg-indigo-100 text-indigo-800',
  livree: 'bg-green-100 text-green-800',
  attente_materiel: 'bg-orange-100 text-orange-800',
  terminee: 'bg-green-100 text-green-800',
  annulee: 'bg-red-100 text-red-800',
};

export default function OrderDetail() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const user = await base44.auth.me();
        const orders = await base44.entities.Order.filter({ id: orderId });
        if (orders.length > 0 && orders[0].user_id === user.id) {
          setOrder(orders[0]);
          
          // Check for existing review
          const reviews = await base44.entities.Review.filter({ order_id: orderId });
          if (reviews.length > 0) {
            setExistingReview(reviews[0]);
          }
        }
      } catch (e) {
        console.error('Erreur:', e);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const canCancel = order?.status === 'en_attente';
  const canModify = order?.status === 'en_attente';
  const canReview = order?.status === 'terminee' && !existingReview;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const newHistory = [...(order.status_history || []), {
        status: 'annulee',
        date: new Date().toISOString(),
        comment: 'Annulée par le client'
      }];
      
      await base44.entities.Order.update(order.id, {
        status: 'annulee',
        status_history: newHistory
      });
      
      setOrder({ ...order, status: 'annulee', status_history: newHistory });
    } catch (e) {
      console.error('Erreur annulation:', e);
      throw e;
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Review.create({
        user_id: user.id,
        user_name: user.full_name || `${user.first_name} ${user.last_name}`,
        order_id: order.id,
        rating: review.rating,
        comment: review.comment,
        status: 'en_attente'
      });
      setExistingReview({ ...review, status: 'en_attente' });
      setShowReview(false);
    } catch (e) {
      console.error('Erreur avis:', e);
      throw e;
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Commande non trouvée</h2>
          <Link to={createPageUrl('UserOrders')}>
            <Button className="bg-[#722F37] hover:bg-[#8B4049]">
              Retour à mes commandes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('UserOrders')}>
          <Button variant="ghost" className="mb-6 text-[#722F37]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux commandes
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2C]">{order.menu_title}</h1>
            <p className="text-[#2C2C2C]/60">Commande du {format(new Date(order.created_date), 'dd MMMM yyyy', { locale: fr })}</p>
          </div>
          <Badge className={`${statusColors[order.status]} text-sm px-4 py-2`}>
            {statusLabels[order.status]}
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5 text-[#722F37]" />
                  Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-[#2C2C2C]/60">Date</p>
                      <p className="font-medium">{format(new Date(order.delivery_date), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-[#2C2C2C]/60">Heure</p>
                      <p className="font-medium">{order.delivery_time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#2C2C2C]/60">Adresse</p>
                    <p className="font-medium">{order.delivery_address}</p>
                    <p className="font-medium">{order.delivery_city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-[#722F37]" />
                  Détails de la commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/60">Menu</span>
                    <span className="font-medium">{order.menu_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/60">Nombre de personnes</span>
                    <span className="font-medium">{order.num_persons}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/60">Prix du menu</span>
                    <span>{order.menu_price?.toFixed(2)}€</span>
                  </div>
                  {order.discount_applied > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{order.discount_applied?.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/60">Frais de livraison</span>
                    <span>{order.delivery_price === 0 ? 'Gratuit' : `${order.delivery_price?.toFixed(2)}€`}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#722F37]">{order.total_price?.toFixed(2)}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            {order.status !== 'en_attente' && order.status_history && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-[#722F37]" />
                    Suivi de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.status_history.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === order.status_history.length - 1 
                              ? 'bg-[#722F37]' 
                              : 'bg-gray-300'
                          }`} />
                          {index < order.status_history.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-[#2C2C2C]">
                            {statusLabels[entry.status]}
                          </p>
                          <p className="text-sm text-[#2C2C2C]/60">
                            {format(new Date(entry.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                          {entry.comment && (
                            <p className="text-sm text-[#2C2C2C]/70 mt-1">{entry.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span>{order.user_email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>{order.user_phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canModify && (
                  <Link to={createPageUrl(`Order?menuId=${order.menu_id}&orderId=${order.id}`)}>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
                
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-2" />
                        Annuler la commande
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Non, conserver</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={cancelling}
                        >
                          {cancelling ? 'Annulation...' : 'Oui, annuler'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {canReview && !showReview && (
                  <Button 
                    className="w-full bg-[#722F37] hover:bg-[#8B4049]"
                    onClick={() => setShowReview(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Donner mon avis
                  </Button>
                )}

                {existingReview && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Avis déposé
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= existingReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Form */}
            {showReview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#D4AF37]" />
                    Votre avis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Note</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setReview({ ...review, rating: s })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              s <= review.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Commentaire</Label>
                    <Textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowReview(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="flex-1 bg-[#722F37] hover:bg-[#8B4049]"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Envoyer'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Equipment Warning */}
            {order.status === 'attente_materiel' && (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Retour de matériel</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Merci de nous contacter pour organiser la restitution du matériel prêté.
                        Rappel : si le matériel n'est pas restitué sous 10 jours ouvrés, 
                        des frais de 600€ seront facturés.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}