/**
 * ClientPanel - Right side client view with live updates
 */

import { useState } from 'react';
import type { MinitalkOrder, User } from '../types';
import { ORDER_STATUSES } from '../types';
import './ClientPanel.css';

interface ClientPanelProps {
  user: User | null;
  users: User[];
  orders: MinitalkOrder[];
  selectedOrder: MinitalkOrder | null;
  onSelectUser: (user: User | null) => void;
  onSelectOrder: (order: MinitalkOrder) => void;
  onSendMessage: (orderId: string, content: string) => void;
  onRequestReturn: (orderId: string) => void;
}

export function ClientPanel({
  user,
  users,
  orders,
  selectedOrder,
  onSelectUser,
  onSelectOrder,
  onSendMessage,
  onRequestReturn,
}: ClientPanelProps) {
  const [messageInput, setMessageInput] = useState('');
  
  const clientUsers = users.filter(u => u.role === 'client');

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedOrder) return;
    onSendMessage(selectedOrder.id, messageInput.trim());
    setMessageInput('');
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="client-panel">
      {/* User selector */}
      <header className="client-panel-header">
        <h2>👤 Vue Client</h2>
        <select
          value={user?.id || ''}
          onChange={(e) => {
            const selected = clientUsers.find(u => u.id === e.target.value);
            onSelectUser(selected || null);
          }}
          className="user-select"
        >
          <option value="">Sélectionner un client</option>
          {clientUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </header>

      {!user ? (
        <div className="no-user">
          <span className="no-user-icon">👆</span>
          <p>Sélectionnez un client pour voir ses commandes</p>
        </div>
      ) : (
        <div className="client-content">
          {/* Client info */}
          <div className="client-info">
            <div className="client-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="client-details">
              <span className="client-name">{user.name}</span>
              <span className="client-email">{user.email}</span>
            </div>
          </div>

          {/* Orders list */}
          <div className="client-orders">
            <h3 className="section-title">📦 Mes Commandes ({orders.length})</h3>
            
            {orders.length === 0 ? (
              <div className="no-orders">Aucune commande</div>
            ) : (
              <div className="orders-list">
                {orders.map(order => {
                  const statusInfo = ORDER_STATUSES.find(s => s.status === order.status);
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`client-order-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectOrder(order)}
                    >
                      <div className="order-header">
                        <span className="order-number">{order.orderNumber}</span>
                        <span
                          className="order-status"
                          style={{ backgroundColor: statusInfo?.color }}
                        >
                          {statusInfo?.icon}
                        </span>
                      </div>
                      <div className="order-status-text" style={{ color: statusInfo?.color }}>
                        {statusInfo?.label}
                      </div>
                      <div className="order-summary">
                        {order.items.length} article(s) • {order.total.toFixed(2)} €
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected order detail & chat */}
          {selectedOrder && (
            <div className="order-detail">
              <div className="detail-header">
                <h3>{selectedOrder.orderNumber}</h3>
                <button
                  className="return-btn"
                  onClick={() => onRequestReturn(selectedOrder.id)}
                  disabled={selectedOrder.hasReturnRequest}
                >
                  {selectedOrder.hasReturnRequest ? '↩️ Retour demandé' : '↩️ Demander retour'}
                </button>
              </div>

              {/* Status timeline */}
              <div className="status-timeline">
                {ORDER_STATUSES.slice(0, -1).map((statusInfo, index) => {
                  const currentIndex = ORDER_STATUSES.findIndex(
                    s => s.status === selectedOrder.status
                  );
                  const isActive = index <= currentIndex;
                  const isCurrent = statusInfo.status === selectedOrder.status;

                  return (
                    <div
                      key={statusInfo.status}
                      className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div
                        className="step-icon"
                        style={{
                          backgroundColor: isActive ? statusInfo.color : undefined,
                        }}
                      >
                        {statusInfo.icon}
                      </div>
                      <span className="step-label">{statusInfo.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Messages */}
              <div className="messages-section">
                <h4>💬 Messages</h4>
                <div className="messages-list">
                  {selectedOrder.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderRole} ${msg.type}`}
                    >
                      {msg.type === 'status_update' ? (
                        <div className="status-update-msg">
                          {msg.content}
                        </div>
                      ) : (
                        <>
                          <div className="msg-header">
                            <span className="msg-sender">{msg.senderName}</span>
                            <span className="msg-time">{formatTime(msg.timestamp)}</span>
                          </div>
                          <p className="msg-content">{msg.content}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <div className="message-input-container">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Écrire un message..."
                    className="message-input"
                  />
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
