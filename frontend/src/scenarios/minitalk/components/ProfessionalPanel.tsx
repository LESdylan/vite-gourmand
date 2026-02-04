/**
 * ProfessionalPanel - Left side Kanban-style order management
 */

import type { MinitalkOrder, OrderStatus } from '../types';
import { ORDER_STATUSES } from '../types';
import { OrderCard } from './OrderCard';
import './ProfessionalPanel.css';

interface ProfessionalPanelProps {
  orders: MinitalkOrder[];
  selectedOrder: MinitalkOrder | null;
  onSelectOrder: (order: MinitalkOrder) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export function ProfessionalPanel({
  orders,
  selectedOrder,
  onSelectOrder,
  onUpdateStatus,
}: ProfessionalPanelProps) {
  // Group orders by status
  const ordersByStatus = ORDER_STATUSES.reduce((acc, statusInfo) => {
    acc[statusInfo.status] = orders.filter(o => o.status === statusInfo.status);
    return acc;
  }, {} as Record<OrderStatus, MinitalkOrder[]>);

  const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivering'];

  return (
    <div className="professional-panel">
      <header className="pro-panel-header">
        <h2>👨‍🍳 Vue Professionnel</h2>
        <span className="order-count">{orders.length} commandes</span>
      </header>

      <div className="pro-kanban">
        {activeStatuses.map(status => {
          const statusInfo = ORDER_STATUSES.find(s => s.status === status)!;
          const statusOrders = ordersByStatus[status] || [];

          return (
            <div key={status} className="pro-column" style={{ borderTopColor: statusInfo.color }}>
              <div className="pro-column-header">
                <span className="column-icon">{statusInfo.icon}</span>
                <span className="column-label">{statusInfo.label}</span>
                <span className="column-count">{statusOrders.length}</span>
              </div>

              <div className="pro-column-orders">
                {statusOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onClick={() => onSelectOrder(order)}
                  />
                ))}

                {statusOrders.length === 0 && (
                  <div className="column-empty">Aucune commande</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected order actions */}
      {selectedOrder && (
        <div className="pro-actions">
          <h4 className="actions-title">Actions pour {selectedOrder.orderNumber}</h4>
          <div className="status-buttons">
            {ORDER_STATUSES.filter(s => 
              s.status !== 'cancelled' && s.status !== selectedOrder.status
            ).map(statusInfo => (
              <button
                key={statusInfo.status}
                className="status-btn"
                style={{
                  backgroundColor: `${statusInfo.color}20`,
                  borderColor: statusInfo.color,
                  color: statusInfo.color,
                }}
                onClick={() => onUpdateStatus(selectedOrder.id, statusInfo.status)}
              >
                {statusInfo.icon} {statusInfo.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
