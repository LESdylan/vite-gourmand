// Types pour le système de commandes avancé

export type OrderStatus = 
  | 'pending'           // En attente de validation
  | 'confirmed'         // Commande confirmée
  | 'initiated'         // Initiation (assignée à un employé)
  | 'prep_ingredients'  // Préparation des ingrédients
  | 'assembly'          // Assemblage
  | 'cooking'           // Cuisson
  | 'packaging'         // Emballage
  | 'delivery'          // En cours de livraison
  | 'delivered'         // Livré (en attente retour équipement)
  | 'completed'         // Terminé (équipement retourné)
  | 'cancelled'         // Annulée
  | 'late_equipment';   // Équipement non retourné (facturé)

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EquipmentStatus = 
  | 'not_applicable'    // Pas d'équipement
  | 'pending'           // En attente de livraison
  | 'delivered'         // Livré avec commande
  | 'returned'          // Retourné dans les temps
  | 'late'              // Retard (< 2 jours)
  | 'charged';          // Facturé 600€

export interface StatusHistoryEntry {
  status: string;
  date: string;
  employeeName?: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // Menu info
  menuId: string;
  menuTitle: string;
  numberOfPeople: number;
  
  // Delivery info
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode?: string;
  deliveryDate: string;
  deliveryTime: string;
  
  // Pricing
  menuPrice: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  
  // Order details
  specialRequests?: string;
  dietaryRestrictions?: string;
  allergies?: string;
  
  // Status & workflow
  status: OrderStatus;
  priority: OrderPriority;
  assignedTo?: string; // Employee ID
  assignedToName?: string;
  
  // Equipment tracking
  equipmentStatus: EquipmentStatus;
  equipmentDeliveredAt?: string;
  equipmentDueDate?: string; // 2 jours après delivery
  equipmentReturnedAt?: string;
  equipmentPenalty?: number; // 600€ si non retourné
  
  // Metadata
  statusHistory: StatusHistoryEntry[];
  estimatedCompletionTime?: string;
  cookingRequired: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: OrderStatus;
  title: string;
  color: string;
  icon: string;
  orders: Order[];
}
