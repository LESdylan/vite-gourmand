/**
 * EmployeeOrders - Order handling for employee role
 */

import './EmployeeWidgets.css';

export function EmployeeOrders() {
  return (
    <div className="employee-widget">
      <header className="widget-header">
        <h2>📋 Commandes en cours</h2>
        <p className="widget-subtitle">Commandes à préparer et livrer</p>
      </header>

      <div className="order-tabs">
        <button className="tab-btn active">À préparer <span className="badge">3</span></button>
        <button className="tab-btn">Prêtes <span className="badge">2</span></button>
        <button className="tab-btn">Mes livraisons</button>
      </div>

      <div className="employee-orders-list">
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
  
  return (
    <div className={`employee-order-card ${isReady ? 'employee-order-card--ready' : ''}`}>
      <div className="employee-order-header">
        <div className="employee-order-info">
          <span className="employee-order-id">{id}</span>
          <span className="employee-order-table">{table}</span>
        </div>
        <span className="employee-order-time">{time}</span>
      </div>
      
      <ul className="employee-order-items">
        {items.map((item, i) => (
          <li key={i} className="employee-order-item">
            <span className="item-qty">{item.quantity}x</span>
            <span className="item-name">{item.name}</span>
            {item.notes && <span className="item-notes">({item.notes})</span>}
          </li>
        ))}
      </ul>
      
      <div className="employee-order-actions">
        {isReady ? (
          <button className="btn-action btn-action--primary">🚀 Livrer</button>
        ) : (
          <>
            <button className="btn-action btn-action--primary">✅ Prêt</button>
            <button className="btn-action btn-action--secondary">📝 Modifier</button>
          </>
        )}
      </div>
    </div>
  );
}
