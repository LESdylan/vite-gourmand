/**
 * ClientSupport - Support tickets / SAV
 * Fetches from GET /api/support/my-tickets, POST /api/support (existing backend)
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import './ClientWidgets.css';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: number;
  content: string;
  sender_type: string;
  created_at: string;
}

interface NewTicketForm {
  subject: string;
  description: string;
  category: string;
  orderId?: string;
}

const CATEGORIES = [
  { value: 'order', label: '📦 Problème de commande' },
  { value: 'delivery', label: '🚗 Livraison' },
  { value: 'quality', label: '⭐ Qualité du repas' },
  { value: 'billing', label: '💳 Facturation' },
  { value: 'account', label: '👤 Mon compte' },
  { value: 'other', label: '💬 Autre' },
];

export function ClientSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState<NewTicketForm>({ subject: '', description: '', category: 'order' });
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: Ticket[] }>('/api/support/my-tickets');
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/support', {
        method: 'POST',
        body: {
          subject: form.subject,
          description: form.description,
          category: form.category,
          orderId: form.orderId ? Number(form.orderId) : undefined,
        },
      });
      setForm({ subject: '', description: '', category: 'order' });
      setShowForm(false);
      await fetchTickets();
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(ticketId: number) {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await apiRequest(`/api/support/${ticketId}/messages`, {
        method: 'POST',
        body: { content: replyText },
      });
      setReplyText('');
      // Refresh ticket detail
      const res = await apiRequest<{ data: Ticket }>(`/api/support/ticket/${selectedTicket?.ticket_number}`);
      setSelectedTicket(res.data);
    } catch { /* silent */ } finally {
      setSending(false);
    }
  }

  async function viewTicket(ticket: Ticket) {
    try {
      const res = await apiRequest<{ data: Ticket }>(`/api/support/ticket/${ticket.ticket_number}`);
      setSelectedTicket(res.data);
    } catch {
      setSelectedTicket(ticket);
    }
  }

  // Back to list view
  if (selectedTicket) {
    return (
      <div className="client-widget">
        <header className="widget-header">
          <div className="widget-header-content">
            <h2>💬 Ticket #{selectedTicket.ticket_number}</h2>
            <p className="widget-subtitle">{selectedTicket.subject}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
            ← Retour
          </button>
        </header>

        <div className="support-ticket-meta">
          <span className={`client-order-status client-order-status--${selectedTicket.status}`}>
            {getStatusLabel(selectedTicket.status)}
          </span>
          <span className="support-category">{getCategoryLabel(selectedTicket.category)}</span>
          <span className="client-order-date">
            {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>

        <div className="support-messages">
          {selectedTicket.messages?.map(msg => (
            <div key={msg.id} className={`support-message ${msg.sender_type === 'customer' ? 'support-message--mine' : 'support-message--agent'}`}>
              <div className="support-message-header">
                <span className="support-message-sender">
                  {msg.sender_type === 'customer' ? '👤 Vous' : '🎧 Support'}
                </span>
                <span className="support-message-date">
                  {new Date(msg.created_at).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="support-message-content">{msg.content}</p>
            </div>
          ))}
        </div>

        {selectedTicket.status !== 'closed' && (
          <div className="support-reply-box">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Écrire un message…"
              className="client-textarea"
              rows={3}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleReply(selectedTicket.id)}
              disabled={sending || !replyText.trim()}
            >
              {sending ? 'Envoi…' : 'Envoyer ✈️'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="client-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>🎧 Support & SAV</h2>
          <p className="widget-subtitle">Besoin d'aide ? Nous sommes là pour vous</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Nouveau ticket'}
        </button>
      </header>

      {/* New Ticket Form */}
      {showForm && (
        <form className="support-form" onSubmit={handleSubmit}>
          <div className="client-form-group">
            <label className="client-label" htmlFor="support-category">Catégorie</label>
            <select
              id="support-category"
              className="client-select"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="client-form-group">
            <label className="client-label" htmlFor="support-subject">Sujet</label>
            <input
              id="support-subject"
              className="client-input"
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="Décrivez brièvement votre problème"
              required
            />
          </div>

          <div className="client-form-group">
            <label className="client-label" htmlFor="support-order-id">N° de commande (optionnel)</label>
            <input
              id="support-order-id"
              className="client-input"
              type="text"
              value={form.orderId || ''}
              onChange={e => setForm({ ...form, orderId: e.target.value })}
              placeholder="ex: 1234"
            />
          </div>

          <div className="client-form-group">
            <label className="client-label" htmlFor="support-description">Description</label>
            <textarea
              id="support-description"
              className="client-textarea"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Détaillez votre demande…"
              rows={5}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Envoi…' : 'Envoyer le ticket ✉️'}
          </button>
        </form>
      )}

      {/* Tickets List */}
      {loading && (
        <div className="client-loading">
          <div className="client-loading-spinner" />
          <p>Chargement des tickets…</p>
        </div>
      )}
      {!loading && tickets.length === 0 && (
        <div className="client-empty">
          <span className="client-empty-icon">🎧</span>
          <h3>Aucun ticket</h3>
          <p>Vous n'avez pas encore ouvert de ticket de support.</p>
        </div>
      )}
      {!loading && tickets.length > 0 && (
        <div className="support-tickets-list">
          {tickets.map(ticket => (
            <button type="button" key={ticket.id} className="support-ticket-card" onClick={() => viewTicket(ticket)}>
              <div className="support-ticket-left">
                <span className="support-ticket-number">#{ticket.ticket_number}</span>
                <h4 className="support-ticket-subject">{ticket.subject}</h4>
                <span className="support-ticket-date">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="support-ticket-right">
                <span className={`client-order-status client-order-status--${ticket.status}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className="support-ticket-category">{getCategoryLabel(ticket.category)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    'in-progress': 'En cours',
    pending: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé',
  };
  return labels[status] || status;
}

function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find(c => c.value === category);
  return found?.label || category;
}
