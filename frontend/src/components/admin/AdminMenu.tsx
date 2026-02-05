/**
 * AdminMenu - Menu management for admin role
 */

import './AdminWidgets.css';

export function AdminMenu() {
  return (
    <div className="admin-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>🍽️ Gestion du Menu</h2>
          <p className="widget-subtitle">Plats, catégories et disponibilités</p>
        </div>
        <button className="btn btn-primary">+ Ajouter un plat</button>
      </header>

      <div className="filter-tabs">
        <button className="filter-tab active">Tous</button>
        <button className="filter-tab">Entrées</button>
        <button className="filter-tab">Plats</button>
        <button className="filter-tab">Desserts</button>
        <button className="filter-tab">Boissons</button>
      </div>

      <div className="menu-grid">
        <MenuItem 
          name="Pizza Margherita" 
          category="Plats" 
          price="12.50€" 
          available={true}
          emoji="🍕"
        />
        <MenuItem 
          name="Salade César" 
          category="Entrées" 
          price="8.90€" 
          available={true}
          emoji="🥗"
        />
        <MenuItem 
          name="Tiramisu" 
          category="Desserts" 
          price="6.50€" 
          available={false}
          emoji="🍰"
        />
        <MenuItem 
          name="Burger Gourmet" 
          category="Plats" 
          price="15.90€" 
          available={true}
          emoji="🍔"
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
  emoji: string;
}

function MenuItem({ name, category, price, available, emoji }: MenuItemProps) {
  return (
    <div className={`menu-card ${!available ? 'menu-card--unavailable' : ''}`}>
      <div className="menu-card-image">{emoji}</div>
      <div className="menu-card-content">
        <h4 className="menu-card-name">{name}</h4>
        <span className="menu-card-category">{category}</span>
        <span className="menu-card-price">{price}</span>
      </div>
      <div className="menu-card-actions">
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
