/**
 * OrderCard - Kanban-style order card for professional view
 */

import type { MinitalkOrder } from '../types';
import { ORDER_STATUSES } from '../types';
import './OrderCard.css';

interface OrderCardProps {
  order: MinitalkOrder;
  isSelected: boolean;
  onClick: () => void;
}

export function OrderCard({ order, isSelected, onClick }: OrderCardProps) {
  const statusInfo = ORDER_STATUSES.find(s => s.status === order.status);
  const totalUnread = order.messages.filter(m => m.senderRole === 'client' && !m.read).length;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`order-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: statusInfo?.color }}
    >
      {/* Notification badges */}
      {totalUnread > 0 && (
        <div className="order-badge unread">{totalUnread}</div>
      )}
      {order.hasReturnRequest && (
        <div className="order-badge return">↩️</div>
      )}

      {/* Header */}
      <div className="order-card-header">
        <span className="order-number">{order.orderNumber}</span>
        <span
          className="order-status"
          style={{ backgroundColor: `${statusInfo?.color}25`, color: statusInfo?.color }}
        >
          {statusInfo?.icon} {statusInfo?.label}
        </span>
      </div>

      {/* Client info */}
      <div className="order-client">
        <span className="client-name">{order.clientName}</span>
        <span className="order-time">{formatTime(order.createdAt)}</span>
      </div>

      {/* Items preview */}
      <div className="order-items">
        {order.items.slice(0, 2).map(item => (
          <span key={item.id} className="order-item">
            {item.quantity}× {item.name}
          </span>
        ))}
        {order.items.length > 2 && (
          <span className="order-item more">+{order.items.length - 2} autres</span>
        )}
      </div>

      {/* Total */}
      <div className="order-total">
        <span className="total-label">Total</span>
        <span className="total-value">{order.total.toFixed(2)} €</span>
      </div>
    </div>
  );
}
