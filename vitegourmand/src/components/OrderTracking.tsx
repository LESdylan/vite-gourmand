import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Truck,
  Home,
  ChefHat,
  Flame,
  Box,
  Utensils
} from 'lucide-react';
import type { Order, OrderStatus } from '../types/order';

type OrderTrackingProps = {
  order: Order;
};

export default function OrderTracking({ order }: OrderTrackingProps) {
  const [progress, setProgress] = useState(0);
  const [showEquipmentAlert, setShowEquipmentAlert] = useState(false);

  useEffect(() => {
    // Calculer le progrès
    const statusProgress: Record<OrderStatus, number> = {
      'pending': 5,
      'confirmed': 15,
      'initiated': 25,
      'prep_ingredients': 40,
      'assembly': 55,
      'cooking': 70,
      'packaging': 85,
      'delivery': 95,
      'delivered': 100,
      'completed': 100,
      'cancelled': 0,
      'late_equipment': 100
    };
    
    setProgress(statusProgress[order.status] || 0);

    // Vérifier si l'équipement est en retard
    if (order.equipmentStatus === 'delivered' && order.equipmentDueDate) {
      const dueDate = new Date(order.equipmentDueDate);
      const now = new Date();
      const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursRemaining < 12 && hoursRemaining > 0) {
        setShowEquipmentAlert(true);
      }
    }
  }, [order]);

  const getStatusInfo = (status: OrderStatus) => {
    const info: Record<OrderStatus, { label: string; color: string; description: string }> = {
      'pending': { 
        label: 'En attente', 
        color: 'text-gray-600',
        description: 'Votre commande est en attente de validation par notre équipe.'
      },
      'confirmed': { 
        label: 'Confirmée', 
        color: 'text-blue-600',
        description: 'Votre commande a été confirmée ! Notre équipe va commencer la préparation.'
      },
      'initiated': { 
        label: 'Initiée', 
        color: 'text-purple-600',
        description: 'Un chef a pris en charge votre commande et commence la mise en place.'
      },
      'prep_ingredients': { 
        label: 'Préparation des ingrédients', 
        color: 'text-yellow-600',
        description: 'Nos chefs préparent avec soin tous les ingrédients pour votre menu.'
      },
      'assembly': { 
        label: 'Assemblage', 
        color: 'text-orange-600',
        description: 'L\'assemblage des plats est en cours avec une attention particulière aux détails.'
      },
      'cooking': { 
        label: 'Cuisson', 
        color: 'text-red-600',
        description: 'Vos plats sont en train de cuire pour atteindre la perfection.'
      },
      'packaging': { 
        label: 'Emballage', 
        color: 'text-green-600',
        description: 'Nous emballons soigneusement votre commande pour la livraison.'
      },
      'delivery': { 
        label: 'En livraison', 
        color: 'text-indigo-600',
        description: 'Votre commande est en route ! Notre livreur va bientôt arriver.'
      },
      'delivered': { 
        label: 'Livrée', 
        color: 'text-green-700',
        description: 'Votre commande a été livrée. Bon appétit ! 🍽️'
      },
      'completed': { 
        label: 'Terminée', 
        color: 'text-green-800',
        description: 'Commande terminée. Merci de votre confiance !'
      },
      'cancelled': { 
        label: 'Annulée', 
        color: 'text-red-600',
        description: 'Cette commande a été annulée.'
      },
      'late_equipment': { 
        label: 'Équipement en retard', 
        color: 'text-red-700',
        description: 'L\'équipement n\'a pas été retourné dans les délais.'
      }
    };
    return info[status] || { label: status, color: 'text-gray-600', description: '' };
  };

  const statusInfo = getStatusInfo(order.status);

  // Animation SVG selon le statut
  const renderStatusAnimation = () => {
    switch (order.status) {
      case 'prep_ingredients':
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            <g className="animate-bounce">
              {/* Planche à découper */}
              <rect x="20" y="60" width="60" height="8" fill="#8B4513" rx="2"/>
              {/* Couteau */}
              <g className="animate-pulse">
                <rect x="35" y="30" width="4" height="25" fill="#C0C0C0"/>
                <polygon points="35,30 39,30 37,20" fill="#666"/>
                <rect x="33" y="55" width="8" height="3" fill="#4A4A4A"/>
              </g>
              {/* Légumes */}
              <circle cx="55" cy="50" r="5" fill="#FF6B6B" className="animate-pulse"/>
              <circle cx="65" cy="52" r="4" fill="#4ECDC4" className="animate-pulse"/>
            </g>
          </svg>
        );
      
      case 'cooking':
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            {/* Casserole */}
            <rect x="30" y="50" width="40" height="25" fill="#808080" rx="2"/>
            <rect x="28" y="48" width="44" height="4" fill="#606060"/>
            {/* Flammes animées */}
            <g className="animate-pulse">
              <path d="M 40 75 Q 38 80 40 85 Q 42 80 40 75" fill="#FF6B00" opacity="0.8"/>
              <path d="M 50 75 Q 48 82 50 88 Q 52 82 50 75" fill="#FF8800" opacity="0.9"/>
              <path d="M 60 75 Q 58 80 60 85 Q 62 80 60 75" fill="#FF6B00" opacity="0.8"/>
            </g>
            {/* Vapeur */}
            <g className="animate-bounce">
              <path d="M 45 45 Q 43 40 45 35" stroke="#B0B0B0" strokeWidth="2" fill="none" opacity="0.6"/>
              <path d="M 55 43 Q 53 38 55 33" stroke="#B0B0B0" strokeWidth="2" fill="none" opacity="0.6"/>
            </g>
          </svg>
        );
      
      case 'packaging':
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            {/* Boîte */}
            <g className="animate-pulse">
              <rect x="30" y="40" width="40" height="35" fill="#D4A574" stroke="#8B6914" strokeWidth="2"/>
              <line x1="30" y1="40" x2="70" y2="40" stroke="#8B6914" strokeWidth="3"/>
              {/* Ruban */}
              <rect x="48" y="35" width="4" height="45" fill="#E74C3C"/>
              <rect x="25" y="55" width="50" height="4" fill="#E74C3C"/>
              {/* Nœud */}
              <circle cx="50" cy="57" r="5" fill="#C0392B"/>
            </g>
          </svg>
        );
      
      case 'delivery':
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            {/* Camion animé */}
            <g className="animate-[bounce_1s_ease-in-out_infinite]">
              <rect x="40" y="45" width="35" height="20" fill="#3498DB" rx="3"/>
              <rect x="20" y="50" width="25" height="15" fill="#2980B9" rx="2"/>
              {/* Fenêtres */}
              <rect x="22" y="52" width="8" height="8" fill="#85C1E9"/>
              <rect x="33" y="52" width="8" height="8" fill="#85C1E9"/>
              {/* Roues */}
              <circle cx="30" cy="68" r="5" fill="#2C3E50"/>
              <circle cx="65" cy="68" r="5" fill="#2C3E50"/>
              <circle cx="30" cy="68" r="3" fill="#95A5A6"/>
              <circle cx="65" cy="68" r="3" fill="#95A5A6"/>
            </g>
            {/* Nuage de poussière */}
            <g className="animate-pulse" opacity="0.3">
              <circle cx="15" cy="70" r="3" fill="#95A5A6"/>
              <circle cx="10" cy="68" r="2" fill="#95A5A6"/>
            </g>
          </svg>
        );
      
      case 'delivered':
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            {/* Maison */}
            <polygon points="50,25 75,45 75,75 25,75 25,45" fill="#E8DCC4" stroke="#8B7355" strokeWidth="2"/>
            <rect x="40" y="55" width="20" height="20" fill="#A0826D"/>
            <rect x="45" y="60" width="3" height="6" fill="#FFD700"/>
            {/* Toit */}
            <polygon points="50,20 80,45 20,45" fill="#C0504D"/>
            {/* Checkmark animé */}
            <g className="animate-pulse">
              <circle cx="65" cy="35" r="12" fill="#27AE60"/>
              <path d="M 60 35 L 63 38 L 70 31" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
          </svg>
        );
      
      default:
        return (
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            {/* Chef hat */}
            <g className="animate-pulse">
              <ellipse cx="50" cy="65" rx="25" ry="8" fill="#FFF" stroke="#DDD" strokeWidth="2"/>
              <path d="M 30 55 Q 30 35 50 35 Q 70 35 70 55 Z" fill="#FFF" stroke="#DDD" strokeWidth="2"/>
              <circle cx="35" cy="45" r="6" fill="#FFF" stroke="#DDD" strokeWidth="1"/>
              <circle cx="50" cy="40" r="7" fill="#FFF" stroke="#DDD" strokeWidth="1"/>
              <circle cx="65" cy="45" r="6" fill="#FFF" stroke="#DDD" strokeWidth="1"/>
            </g>
          </svg>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEquipmentTimeRemaining = () => {
    if (!order.equipmentDueDate) return null;
    
    const dueDate = new Date(order.equipmentDueDate);
    const now = new Date();
    const hoursRemaining = Math.max(0, (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursRemaining < 1) {
      const minutesRemaining = Math.floor(hoursRemaining * 60);
      return `${minutesRemaining} minutes`;
    } else {
      return `${Math.floor(hoursRemaining)} heures`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerte équipement */}
      {showEquipmentAlert && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">
                  ⏰ Retour d'équipement bientôt dû
                </h4>
                <p className="text-sm text-orange-800">
                  L'équipement prêté doit être retourné avant le{' '}
                  <strong>{formatDateTime(order.equipmentDueDate!)}</strong>.
                </p>
                <p className="text-sm text-orange-800 mt-2">
                  Temps restant : <strong>{getEquipmentTimeRemaining()}</strong>
                </p>
                <p className="text-xs text-orange-700 mt-2 bg-orange-100 p-2 rounded">
                  ⚠️ Passé ce délai, des frais de <strong>600€</strong> seront automatiquement facturés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut principal avec animation */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">Suivi de votre commande</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Animation */}
          <div className="mb-6">
            {renderStatusAnimation()}
          </div>

          {/* Statut actuel */}
          <div className="text-center mb-4">
            <Badge className={`${statusInfo.color} text-lg px-4 py-2`} variant="outline">
              {statusInfo.label}
            </Badge>
          </div>

          <p className="text-center text-gray-600 mb-6">
            {statusInfo.description}
          </p>

          {/* Barre de progression */}
          <div className="mb-2">
            <Progress value={progress} className="h-3" />
          </div>
          <div className="text-center text-sm text-gray-500 mb-6">
            {progress}% complété
          </div>

          {/* Estimation */}
          {order.estimatedCompletionTime && (
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {order.estimatedCompletionTime}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.statusHistory.map((entry, index) => {
              const isLast = index === order.statusHistory.length - 1;
              return (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-300" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isLast ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {isLast ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="font-semibold text-sm">{entry.status}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(entry.date)}
                      </div>
                      {entry.employeeName && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <ChefHat className="h-3 w-3" />
                          {entry.employeeName}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informations équipement si applicable */}
      {order.equipmentStatus !== 'not_applicable' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Équipement prêté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge variant={
                  order.equipmentStatus === 'returned' ? 'default' :
                  order.equipmentStatus === 'delivered' ? 'secondary' :
                  'outline'
                }>
                  {order.equipmentStatus === 'pending' && '⏳ En attente'}
                  {order.equipmentStatus === 'delivered' && '📦 Livré'}
                  {order.equipmentStatus === 'returned' && '✅ Retourné'}
                  {order.equipmentStatus === 'late' && '⚠️ En retard'}
                  {order.equipmentStatus === 'charged' && '❌ Facturé'}
                </Badge>
              </div>

              {order.equipmentDueDate && order.equipmentStatus === 'delivered' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">À retourner avant</span>
                    <span className="text-sm font-semibold">
                      {formatDateTime(order.equipmentDueDate)}
                    </span>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                    <p className="text-yellow-800">
                      ⚠️ L'équipement (chafing dishes, plateaux, etc.) doit être retourné propre dans un délai de <strong>2 jours</strong> après la livraison.
                    </p>
                    <p className="text-yellow-900 font-semibold mt-2">
                      Pénalité en cas de non-retour : 600€
                    </p>
                  </div>
                </>
              )}

              {order.equipmentReturnedAt && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Équipement retourné le {formatDateTime(order.equipmentReturnedAt)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Merci d'avoir respecté les délais !
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
