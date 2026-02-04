/**
 * RealTimeTestPage - Real-time Updates Test
 * Tests WebSocket connections, live updates, notifications
 */

import { useState, useEffect, useCallback } from 'react';
import './RealTimeTestPage.css';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export function RealTimeTestPage() {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveCounter, setLiveCounter] = useState(0);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  }, []);

  // Simulate connection
  const toggleConnection = () => {
    if (connected) {
      setConnected(false);
      addNotification('warning', 'Connexion fermée');
    } else {
      setConnected(true);
      addNotification('success', 'Connecté au serveur');
    }
  };

  // Auto-update simulation
  useEffect(() => {
    if (!autoUpdate || !connected) return;

    const interval = setInterval(() => {
      setLiveCounter(prev => prev + 1);
      addNotification('info', `Mise à jour #${liveCounter + 1} reçue`);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoUpdate, connected, liveCounter, addNotification]);

  const triggerEvents = {
    success: () => addNotification('success', 'Commande validée avec succès'),
    error: () => addNotification('error', 'Erreur de connexion au serveur'),
    warning: () => addNotification('warning', 'Stock faible pour "Canelés"'),
    info: () => addNotification('info', 'Nouveau commentaire reçu'),
  };

  return (
    <div className="realtime-test-page">
      <header className="realtime-test-header">
        <a href="/" className="back-link">← Retour au Dashboard</a>
        <h1>🔴 Test Manuel: Temps Réel</h1>
        <p className="realtime-test-description">
          Testez les mises à jour en direct, notifications et connexions WebSocket
        </p>
      </header>

      <div className="realtime-test-container">
        <aside className="test-checklist">
          <h2>✅ Points à vérifier</h2>
          <ul>
            <li>Indicateur de connexion</li>
            <li>Notifications en temps réel</li>
            <li>Compteur live</li>
            <li>Différents types d'alertes</li>
            <li>Animation des notifications</li>
            <li>Déconnexion/Reconnexion</li>
          </ul>
        </aside>

        <main className="realtime-test-main">
          {/* Connection Status */}
          <section className="status-section">
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span>{connected ? 'Connecté' : 'Déconnecté'}</span>
            </div>
            <button onClick={toggleConnection} className="btn-connection">
              {connected ? 'Déconnecter' : 'Connecter'}
            </button>
          </section>

          {/* Live Counter */}
          <section className="counter-section">
            <h3>Compteur Live</h3>
            <div className="live-counter">
              <span className="counter-value">{liveCounter}</span>
              <span className="counter-label">mises à jour</span>
            </div>
            <div className="counter-controls">
              <button 
                onClick={() => setAutoUpdate(!autoUpdate)} 
                className={`btn-auto ${autoUpdate ? 'active' : ''}`}
                disabled={!connected}
              >
                {autoUpdate ? '⏸ Pause' : '▶ Auto-update'}
              </button>
              <button onClick={() => setLiveCounter(0)} className="btn-reset">
                Reset
              </button>
            </div>
          </section>

          {/* Trigger Events */}
          <section className="events-section">
            <h3>Déclencher des événements</h3>
            <div className="event-buttons">
              <button onClick={triggerEvents.success} className="btn-event success">
                ✓ Succès
              </button>
              <button onClick={triggerEvents.error} className="btn-event error">
                ✕ Erreur
              </button>
              <button onClick={triggerEvents.warning} className="btn-event warning">
                ⚠ Warning
              </button>
              <button onClick={triggerEvents.info} className="btn-event info">
                ℹ Info
              </button>
            </div>
          </section>

          {/* Notifications Feed */}
          <section className="notifications-section">
            <h3>Fil de notifications</h3>
            <div className="notifications-feed">
              {notifications.length === 0 ? (
                <p className="no-notifications">Aucune notification</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`notification ${notif.type}`}>
                    <span className="notif-message">{notif.message}</span>
                    <span className="notif-time">
                      {notif.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
