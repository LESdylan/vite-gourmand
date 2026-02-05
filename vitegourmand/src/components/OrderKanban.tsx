import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  ChefHat,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Flame,
  Utensils,
  Box,
  ArrowRight
} from 'lucide-react';
import type { Order, OrderStatus, KanbanColumn } from '../types/order';

type OrderKanbanProps = {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => void;
  currentUser: { id: string; name: string };
};

export default function OrderKanban({ orders, onUpdateStatus, currentUser }: OrderKanbanProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  const kanbanColumns: KanbanColumn[] = [
    {
      id: 'confirmed',
      title: 'Confirmées',
      color: 'bg-blue-50 border-blue-200',
      icon: '✅',
      orders: []
    },
    {
      id: 'initiated',
      title: 'Initiées',
      color: 'bg-purple-50 border-purple-200',
      icon: '🚀',
      orders: []
    },
    {
      id: 'prep_ingredients',
      title: 'Préparation',
      color: 'bg-yellow-50 border-yellow-200',
      icon: '🔪',
      orders: []
    },
    {
      id: 'assembly',
      title: 'Assemblage',
      color: 'bg-orange-50 border-orange-200',
      icon: '🍽️',
      orders: []
    },
    {
      id: 'cooking',
      title: 'Cuisson',
      color: 'bg-red-50 border-red-200',
      icon: '🔥',
      orders: []
    },
    {
      id: 'packaging',
      title: 'Emballage',
      color: 'bg-green-50 border-green-200',
      icon: '📦',
      orders: []
    },
    {
      id: 'delivery',
      title: 'Livraison',
      color: 'bg-indigo-50 border-indigo-200',
      icon: '🚚',
      orders: []
    }
  ];

  useEffect(() => {
    // Organiser les commandes par colonne
    const organized = kanbanColumns.map(col => ({
      ...col,
      orders: orders.filter(order => order.status === col.id)
    }));
    setColumns(organized);
  }, [orders]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨 URGENT';
      case 'high': return '⚡ Prioritaire';
      case 'medium': return '📌 Normal';
      case 'low': return '📋 Faible';
      default: return priority;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = [
      'confirmed',
      'initiated',
      'prep_ingredients',
      'assembly',
      'cooking',
      'packaging',
      'delivery',
      'delivered'
    ];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  const handleAdvanceOrder = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      // Sauter la cuisson si pas requis
      if (nextStatus === 'cooking' && !order.cookingRequired) {
        onUpdateStatus(order.id, 'packaging', `Cuisson non requise - Passage direct à l'emballage`);
      } else {
        onUpdateStatus(order.id, nextStatus);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const isUrgent = (order: Order) => {
    const deliveryDate = new Date(order.deliveryDate);
    const now = new Date();
    const hoursUntil = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil < 24;
  };

  return (
    <div className="w-full">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">À initier</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {orders.filter(o => ['initiated', 'prep_ingredients', 'assembly', 'cooking'].includes(o.status)).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">En production</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {orders.filter(o => o.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Urgentes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.assignedTo === currentUser.id).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Mes commandes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{column.icon}</span>
                    {column.title}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {column.orders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.orders.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Aucune commande
                  </div>
                ) : (
                  column.orders
                    .sort((a, b) => {
                      // Tri par priorité puis par date
                      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                      if (priorityDiff !== 0) return priorityDiff;
                      return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
                    })
                    .map(order => (
                      <Card 
                        key={order.id} 
                        className={`cursor-pointer hover:shadow-lg transition-shadow ${
                          isUrgent(order) ? 'ring-2 ring-red-500' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          {/* Priority Badge */}
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={`${getPriorityColor(order.priority)} text-xs`}>
                              {getPriorityLabel(order.priority)}
                            </Badge>
                            {order.equipmentStatus !== 'not_applicable' && (
                              <Badge variant="outline" className="text-xs">
                                🔧 Équipement
                              </Badge>
                            )}
                          </div>

                          {/* Order Info */}
                          <div className="space-y-2">
                            <div className="font-semibold text-sm">
                              {order.menuTitle}
                            </div>

                            <div className="flex items-center text-xs text-gray-600 gap-2">
                              <User className="h-3 w-3" />
                              <span>{order.userName}</span>
                            </div>

                            <div className="flex items-center text-xs text-gray-600 gap-2">
                              <Utensils className="h-3 w-3" />
                              <span>{order.numberOfPeople} personnes</span>
                            </div>

                            <div className="flex items-center text-xs text-gray-600 gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(order.deliveryDate)} à {order.deliveryTime}</span>
                            </div>

                            <div className="flex items-center text-xs text-gray-600 gap-2">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{order.deliveryCity}</span>
                            </div>

                            {order.assignedToName && (
                              <div className="flex items-center text-xs text-blue-600 gap-2">
                                <ChefHat className="h-3 w-3" />
                                <span>{order.assignedToName}</span>
                              </div>
                            )}

                            {order.specialRequests && (
                              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                ⚠️ {order.specialRequests}
                              </div>
                            )}

                            {!order.cookingRequired && column.id === 'assembly' && (
                              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                ✓ Pas de cuisson requise
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() => handleAdvanceOrder(order)}
                            className="w-full mt-3 text-xs h-8"
                            variant="default"
                          >
                            Passer à l'étape suivante
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>

                          {/* Time info */}
                          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {order.estimatedCompletionTime}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
