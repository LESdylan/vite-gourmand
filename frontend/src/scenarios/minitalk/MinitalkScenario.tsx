/**
 * MinitalkScenario - Real-time Client-Professional Communication
 * Split-screen scenario for order status updates and messaging
 */

import { useMinitalk } from './useMinitalk';
import { ProfessionalPanel, ClientPanel } from './components';
import './MinitalkScenario.css';

export function MinitalkScenario() {
  const {
    orders,
    clientOrders,
    selectedOrder,
    selectedUser,
    users,
    setSelectedOrder,
    selectUser,
    updateOrderStatus,
    sendMessage,
  } = useMinitalk();

  const handleSendClientMessage = (orderId: string, content: string) => {
    if (selectedUser) {
      sendMessage(orderId, content, 'client', selectedUser.name, 'message');
    }
  };

  const handleRequestReturn = (orderId: string) => {
    if (selectedUser) {
      sendMessage(
        orderId,
        `${selectedUser.name} a demandé un retour pour cette commande`,
        'client',
        selectedUser.name,
        'return_request'
      );
    }
  };

  return (
    <div className="minitalk-scenario">
      {/* Header */}
      <header className="minitalk-header">
        <a href="/" className="back-link">← Retour au Dashboard</a>
        <div className="header-content">
          <h1>💬 Minitalk - Communication Client/Pro</h1>
          <p className="header-description">
            Suivi des commandes en temps réel et messagerie instantanée
          </p>
        </div>
        <div className="live-indicator">
          <span className="live-dot" />
          <span className="live-text">En direct</span>
        </div>
      </header>

      {/* Split View */}
      <div className="minitalk-split">
        {/* Professional Side (Left / Top) */}
        <div className="split-panel professional-side">
          <ProfessionalPanel
            orders={orders}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onUpdateStatus={updateOrderStatus}
          />
        </div>

        {/* Client Side (Right / Bottom) */}
        <div className="split-panel client-side">
          <ClientPanel
            user={selectedUser}
            users={users}
            orders={clientOrders}
            selectedOrder={clientOrders.find(o => o.id === selectedOrder?.id) || null}
            onSelectUser={selectUser}
            onSelectOrder={setSelectedOrder}
            onSendMessage={handleSendClientMessage}
            onRequestReturn={handleRequestReturn}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="minitalk-footer">
        <div className="footer-info">
          <span className="info-item">
            📊 {orders.length} commandes actives
          </span>
          <span className="info-item">
            💬 {orders.reduce((acc, o) => acc + o.messages.length, 0)} messages
          </span>
          <span className="info-item">
            ⚠️ {orders.filter(o => o.unreadCount > 0).length} non lus
          </span>
        </div>
        <div className="footer-legend">
          <span className="legend-item">
            <span className="badge-demo unread">3</span> Non lu (orange)
          </span>
          <span className="legend-item">
            <span className="badge-demo read">✓</span> Lu (bleu)
          </span>
          <span className="legend-item">
            <span className="badge-demo return">↩️</span> Retour demandé
          </span>
        </div>
      </footer>
    </div>
  );
}
