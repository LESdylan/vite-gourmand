/**
 * EmployeeOrders - Order handling for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeOrders() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>📋 Commandes en cours</h2>
          <p className="widget-subtitle">Commandes à préparer et livrer</p>
        </div>
      </header>

      <div className="order-tabs">
        <button className="order-tab active">À préparer <span className="order-tab-badge">3</span></button>
        <button className="order-tab">Prêtes <span className="order-tab-badge">2</span></button>
        <button className="order-tab">Mes livraisons</button>
      </div>

      <div className="employee-orders-grid">
        <EmployeeOrderCard
          id="#1234"
          table="Table 5"
          status="preparation"
          items={[
            { name: 'Pizza Margherita', quantity: 1, notes: 'Sans oignons' },
            { name: 'Salade César', quantity: 2, notes: '' },
            { name: 'Tiramisu', quantity: 1, notes: '' },
          ]}
          time="12:34"
        />
        <EmployeeOrderCard
          id="#1235"
          table="Table 2"
          status="preparation"
          items={[
            { name: 'Burger Gourmet', quantity: 2, notes: 'Cuisson à point' },
            { name: 'Frites maison', quantity: 2, notes: '' },
          ]}
          time="12:38"
        />
        <EmployeeOrderCard
          id="#1236"
          table="Livraison"
          status="ready"
          items={[
            { name: 'Pâtes Carbonara', quantity: 3, notes: '' },
          ]}
          time="12:25"
        />
      </div>
    </div>
  );
}

interface OrderItem {
  name: string;
  quantity: number;
  notes: string;
}

interface EmployeeOrderCardProps {
  id: string;
  table: string;
  status: 'preparation' | 'ready';
  items: OrderItem[];
  time: string;
}

function EmployeeOrderCard({ id, table, status, items, time }: EmployeeOrderCardProps) {
  const isReady = status === 'ready';
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  return (
    <div className={`employee-order-card ${isReady ? 'employee-order-card--ready' : ''}`}>
      <div className="employee-order-status-icon">
        {isReady ? '✅' : '👨‍🍳'}
      </div>
      <div className="employee-order-info">
        <div className="employee-order-header">
          <span className="employee-order-id">{id}</span>
          <span className="employee-order-table">{table}</span>
        </div>
        <span className="employee-order-items">{itemCount} articles • {time}</span>
      </div>
      <div className="employee-order-actions">
        {isReady ? (
          <button className="btn btn-success btn-sm">🚀 Livrer</button>
        ) : (
          <>
            <button className="btn btn-primary btn-sm">✅ Prêt</button>
            <button className="btn btn-secondary btn-sm">Détails</button>
          </>
        )}
      </div>
    </div>
  );
}
