/**
 * ClientReviews - Post-delivery review system
 * Fetches delivered orders, allows submitting reviews via POST /api/reviews
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import './ClientWidgets.css';

interface DeliveredOrder {
  id: number;
  order_number: string;
  total_price: number;
  delivery_date: string;
  created_at: string;
}

interface ReviewForm {
  orderId: number;
  note: number;
  description: string;
}

export function ClientReviews() {
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DeliveredOrder | null>(null);
  const [form, setForm] = useState<ReviewForm>({ orderId: 0, note: 5, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchDelivered() {
      try {
        const res = await apiRequest<{ data: { items: DeliveredOrder[] } }>(
          '/api/orders/my?status=delivered&limit=20&sort=created_at:desc',
        );
        setDeliveredOrders(res.data.items || []);
      } catch {
        setDeliveredOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDelivered();
  }, []);

  async function handleSubmitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedOrder || form.note < 1 || form.note > 5) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/reviews', {
        method: 'POST',
        body: {
          orderId: selectedOrder.id,
          note: form.note,
          description: form.description,
        },
      });
      setSubmitted((prev) => new Set(prev).add(selectedOrder.id));
      setSuccess(true);
      setSelectedOrder(null);
      setForm({ orderId: 0, note: 5, description: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  }

  const reviewableOrders = deliveredOrders.filter((o) => !submitted.has(o.id));

  return (
    <div className="client-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>⭐ Mes Avis</h2>
          <p className="widget-subtitle">Partagez votre expérience et aidez-nous à progresser</p>
        </div>
      </header>

      {success && (
        <div className="client-success-banner">
          ✅ Merci pour votre avis ! Vous avez gagné des points fidélité bonus.
        </div>
      )}

      {/* Review Form */}
      {selectedOrder ? (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-form-header">
            <h3>📝 Évaluer la commande #{selectedOrder.order_number}</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedOrder(null)}
            >
              ✕ Annuler
            </button>
          </div>

          <div className="review-order-info">
            <span>
              Commande du{' '}
              {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="client-order-price">{selectedOrder.total_price.toFixed(2)} €</span>
          </div>

          {/* Star Rating */}
          <div className="client-form-group">
            <label className="client-label" htmlFor="review-note">
              Note globale
            </label>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star ${star <= form.note ? 'review-star--active' : ''}`}
                  onClick={() => setForm({ ...form, note: star })}
                  aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                  {star <= form.note ? '★' : '☆'}
                </button>
              ))}
              <span className="review-stars-label">{getRatingLabel(form.note)}</span>
            </div>
          </div>

          <div className="client-form-group">
            <label className="client-label" htmlFor="review-description">
              Votre commentaire
            </label>
            <textarea
              id="review-description"
              className="client-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Qu'avez-vous pensé de votre commande ? Qualité, goût, présentation, livraison…"
              rows={4}
            />
          </div>

          <div className="review-tips">
            <h4>💡 Conseils pour un bon avis</h4>
            <ul>
              <li>Décrivez la qualité et la fraîcheur des plats</li>
              <li>Mentionnez la rapidité de la livraison</li>
              <li>Partagez ce que vous avez particulièrement aimé</li>
            </ul>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Publication…' : 'Publier mon avis ⭐'}
          </button>
        </form>
      ) : (
        <>
          {/* Orders to review */}
          {loading && (
            <div className="client-loading">
              <div className="client-loading-spinner" />
              <p>Chargement…</p>
            </div>
          )}
          {!loading && reviewableOrders.length === 0 && (
            <div className="client-empty">
              <span className="client-empty-icon">⭐</span>
              <h3>Aucune commande à évaluer</h3>
              <p>Vos commandes livrées apparaîtront ici pour que vous puissiez les noter.</p>
            </div>
          )}
          {!loading && reviewableOrders.length > 0 && (
            <>
              <p className="review-intro">
                🎁 <strong>Gagnez des points bonus</strong> en évaluant vos commandes ! Chaque avis
                vous rapporte <strong>+25 points fidélité</strong>.
              </p>

              <div className="review-orders-grid">
                {reviewableOrders.map((order) => (
                  <div key={order.id} className="review-order-card">
                    <div className="review-order-card-top">
                      <span className="client-order-number">#{order.order_number}</span>
                      <span className="client-order-price">{order.total_price.toFixed(2)} €</span>
                    </div>
                    <span className="client-order-date">
                      {new Date(order.delivery_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      className="btn btn-primary btn-sm review-cta"
                      onClick={() => {
                        setSelectedOrder(order);
                        setForm({ orderId: order.id, note: 5, description: '' });
                      }}
                    >
                      ⭐ Donner mon avis
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Already submitted */}
          {submitted.size > 0 && (
            <section className="widget-section" style={{ marginTop: 'var(--spacing-xl)' }}>
              <div className="widget-section-header">
                <h3>✅ Avis publiés ({submitted.size})</h3>
              </div>
              <p className="widget-subtitle">
                Merci pour vos retours ! Ils nous aident à nous améliorer.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function getRatingLabel(note: number): string {
  const labels: Record<number, string> = {
    1: 'Très insatisfait 😞',
    2: 'Insatisfait 😕',
    3: 'Correct 😐',
    4: 'Satisfait 😊',
    5: 'Excellent ! 🤩',
  };
  return labels[note] || '';
}
