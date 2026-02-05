/**
 * AdminMenu - Menu management for admin role
 */

import './AdminWidgets.css';

export function AdminMenu() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <h2>🍽️ Gestion du Menu</h2>
        <p className="widget-subtitle">Plats, catégories et disponibilités</p>
        <button className="btn-primary">+ Ajouter un plat</button>
      </header>

      <div className="widget-filters">
        <button className="filter-btn active">Tous</button>
        <button className="filter-btn">Entrées</button>
        <button className="filter-btn">Plats</button>
        <button className="filter-btn">Desserts</button>
        <button className="filter-btn">Boissons</button>
      </div>

      <div className="menu-grid">
        <MenuItem 
          name="Pizza Margherita" 
          category="Plats" 
          price="12.50€" 
          available={true}
        />
        <MenuItem 
          name="Salade César" 
          category="Entrées" 
          price="8.90€" 
          available={true}
        />
        <MenuItem 
          name="Tiramisu" 
          category="Desserts" 
          price="6.50€" 
          available={false}
        />
        <MenuItem 
          name="Burger Gourmet" 
          category="Plats" 
          price="15.90€" 
          available={true}
        />
      </div>
    </div>
  );
}

interface MenuItemProps {
  name: string;
  category: string;
  price: string;
  available: boolean;
}

function MenuItem({ name, category, price, available }: MenuItemProps) {
  return (
    <div className={`menu-item ${!available ? 'menu-item--unavailable' : ''}`}>
      <div className="menu-item-image">🍽️</div>
      <div className="menu-item-content">
        <h4 className="menu-item-name">{name}</h4>
        <span className="menu-item-category">{category}</span>
        <span className="menu-item-price">{price}</span>
      </div>
      <div className="menu-item-actions">
        <label className="toggle">
          <input type="checkbox" checked={available} readOnly />
          <span className="toggle-slider"></span>
        </label>
        <button className="btn-icon" title="Modifier">✏️</button>
        <button className="btn-icon" title="Supprimer">🗑️</button>
      </div>
    </div>
  );
}
