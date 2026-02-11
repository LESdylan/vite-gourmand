/**
 * ClientLoyalty - Loyalty points, tiers & rewards
 * Fetches from GET /api/loyalty/me, /api/loyalty/me/transactions (existing backend)
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import './ClientWidgets.css';

interface LoyaltyProfile {
  points: number;
  tier: string;
  nextTier: string | null;
  pointsToNextTier: number | null;
  totalPointsEarned: number;
  totalPointsSpent: number;
}

interface LoyaltyTransaction {
  id: number;
  type: string; // 'earn' | 'redeem' | 'bonus'
  points: number;
  description: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
}

const REWARDS_CATALOG: Reward[] = [
  { id: 'dessert', name: 'Dessert offert', description: 'Un dessert au choix pour votre prochaine commande', pointsCost: 150, icon: '🍰' },
  { id: 'delivery', name: 'Livraison gratuite', description: 'Frais de livraison offerts', pointsCost: 100, icon: '🚚' },
  { id: 'discount5', name: '-5€ sur commande', description: '5€ de réduction sur votre prochaine commande', pointsCost: 250, icon: '💰' },
  { id: 'discount10', name: '-10€ sur commande', description: '10€ de réduction sur votre prochaine commande', pointsCost: 450, icon: '🎁' },
  { id: 'vip', name: 'Menu VIP', description: 'Accès au menu exclusif du chef', pointsCost: 800, icon: '👑' },
];

export function ClientLoyalty() {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'rewards' | 'history'>('overview');

  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const [profileRes, txRes] = await Promise.all([
          apiRequest<{ data: LoyaltyProfile }>('/api/loyalty/me'),
          apiRequest<{ data: LoyaltyTransaction[] }>('/api/loyalty/me/transactions').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    fetchLoyalty();
  }, []);

  async function handleRedeem(rewardId: string, pointsCost: number) {
    if (!profile || profile.points < pointsCost) return;
    setRedeemLoading(rewardId);
    try {
      await apiRequest('/api/loyalty/me/redeem', {
        method: 'POST',
        body: { rewardId, points: pointsCost },
      });
      // Refresh data
      const res = await apiRequest<{ data: LoyaltyProfile }>('/api/loyalty/me');
      setProfile(res.data);
    } catch { /* silent */ } finally {
      setRedeemLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="client-widget">
        <div className="client-loading">
          <div className="client-loading-spinner" />
          <p>Chargement fidélité…</p>
        </div>
      </div>
    );
  }

  const points = profile?.points ?? 0;
  const tier = profile?.tier ?? 'bronze';
  const progress = profile?.pointsToNextTier
    ? (points / (points + profile.pointsToNextTier)) * 100
    : 100;

  return (
    <div className="client-widget">
      <header className="widget-header">
        <div className="widget-header-content">
          <h2>🏆 Programme Fidélité</h2>
          <p className="widget-subtitle">Cumulez des points, débloquez des récompenses</p>
        </div>
      </header>

      {/* Loyalty Hero Card */}
      <div className="loyalty-hero">
        <div className="loyalty-hero-top">
          <div className="loyalty-tier-badge">
            <span className="loyalty-tier-icon">{getTierIcon(tier)}</span>
            <span className="loyalty-tier-name">{getTierLabel(tier)}</span>
          </div>
          <div className="loyalty-points-display">
            <span className="loyalty-points-number">{points.toLocaleString('fr-FR')}</span>
            <span className="loyalty-points-label">points</span>
          </div>
        </div>

        {profile?.nextTier && (
          <div className="loyalty-tier-progress">
            <div className="loyalty-tier-progress-info">
              <span>Prochain niveau: {getTierLabel(profile.nextTier)}</span>
              <span>{profile.pointsToNextTier} pts restants</span>
            </div>
            <div className="client-progress-bar loyalty-progress-bar">
              <div className="client-progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </div>
        )}

        <div className="loyalty-hero-stats">
          <div className="loyalty-mini-stat">
            <span className="loyalty-mini-value">{profile?.totalPointsEarned?.toLocaleString('fr-FR') ?? 0}</span>
            <span className="loyalty-mini-label">Total gagnés</span>
          </div>
          <div className="loyalty-mini-stat">
            <span className="loyalty-mini-value">{profile?.totalPointsSpent?.toLocaleString('fr-FR') ?? 0}</span>
            <span className="loyalty-mini-label">Total dépensés</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="client-tabs">
        <button className={`client-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          🎯 Niveaux
        </button>
        <button className={`client-tab ${tab === 'rewards' ? 'active' : ''}`} onClick={() => setTab('rewards')}>
          🎁 Récompenses
        </button>
        <button className={`client-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          📊 Historique
        </button>
      </div>

      {tab === 'overview' && <TierOverview currentTier={tier} />}
      {tab === 'rewards' && <RewardsView points={points} onRedeem={handleRedeem} redeemLoading={redeemLoading} />}
      {tab === 'history' && <TransactionHistory transactions={transactions} />}
    </div>
  );
}

/* ─── Sub-components ─── */

function TierOverview({ currentTier }: { currentTier: string }) {
  const tiers = [
    { id: 'bronze', icon: '🥉', label: 'Bronze', minPoints: 0, perks: ['1 pt / € dépensé', 'Accès support prioritaire'] },
    { id: 'silver', icon: '🥈', label: 'Argent', minPoints: 500, perks: ['1.5 pt / € dépensé', 'Livraison offerte / mois', 'Offre anniversaire'] },
    { id: 'gold', icon: '🥇', label: 'Or', minPoints: 1500, perks: ['2 pts / € dépensé', 'Livraisons offertes', 'Menu VIP mensuel', '-5% permanent'] },
    { id: 'platinum', icon: '💎', label: 'Platine', minPoints: 5000, perks: ['3 pts / € dépensé', 'Tout Gold inclus', 'Invitations chef', '-10% permanent'] },
  ];

  return (
    <div className="loyalty-tiers">
      {tiers.map(t => (
        <div key={t.id} className={`loyalty-tier-card ${t.id === currentTier ? 'loyalty-tier-card--current' : ''} ${tiers.indexOf(t) < tiers.findIndex(x => x.id === currentTier) ? 'loyalty-tier-card--unlocked' : ''}`}>
          <div className="loyalty-tier-card-header">
            <span className="loyalty-tier-card-icon">{t.icon}</span>
            <div>
              <h4>{t.label}</h4>
              <span className="loyalty-tier-min">{t.minPoints > 0 ? `à partir de ${t.minPoints} pts` : 'Niveau de départ'}</span>
            </div>
            {t.id === currentTier && <span className="loyalty-current-badge">Votre niveau</span>}
          </div>
          <ul className="loyalty-tier-perks">
            {t.perks.map((perk) => (
              <li key={perk}>✓ {perk}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RewardsView({ points, onRedeem, redeemLoading }: {
  points: number;
  onRedeem: (id: string, cost: number) => void;
  redeemLoading: string | null;
}) {
  return (
    <div className="loyalty-rewards-grid">
      {REWARDS_CATALOG.map(reward => {
        const canAfford = points >= reward.pointsCost;
        return (
          <div key={reward.id} className={`loyalty-reward-card ${canAfford ? '' : 'loyalty-reward-card--locked'}`}>
            <span className="loyalty-reward-icon">{reward.icon}</span>
            <h4>{reward.name}</h4>
            <p className="loyalty-reward-desc">{reward.description}</p>
            <div className="loyalty-reward-footer">
              <span className="loyalty-reward-cost">{reward.pointsCost} pts</span>
              <button
                className="btn btn-primary btn-sm"
                disabled={!canAfford || redeemLoading === reward.id}
                onClick={() => onRedeem(reward.id, reward.pointsCost)}
              >
                {redeemLoading === reward.id ? '…' : (canAfford ? 'Échanger' : '🔒')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TransactionHistory({ transactions }: { transactions: LoyaltyTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="client-empty">
        <span className="client-empty-icon">📊</span>
        <h3>Pas encore d'historique</h3>
        <p>Vos transactions de points apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="loyalty-tx-list">
      {transactions.map(tx => (
        <div key={tx.id} className="loyalty-tx-item">
          <div className="loyalty-tx-left">
            <span className={`loyalty-tx-icon ${tx.type === 'earn' || tx.type === 'bonus' ? 'positive' : 'negative'}`}>
              {getTxIcon(tx.type)}
            </span>
            <div>
              <span className="loyalty-tx-desc">{tx.description}</span>
              <span className="loyalty-tx-date">
                {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <span className={`loyalty-tx-points ${tx.type === 'earn' || tx.type === 'bonus' ? 'positive' : 'negative'}`}>
            {tx.type === 'redeem' ? '−' : '+'}{Math.abs(tx.points)} pts
          </span>
        </div>
      ))}
    </div>
  );
}

function getTxIcon(type: string): string {
  if (type === 'earn') return '➕';
  if (type === 'bonus') return '🎁';
  return '➖';
}

function getTierIcon(tier: string): string {
  const icons: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠' };
  return icons[tier.toLowerCase()] || '🏅';
}

function getTierLabel(tier: string): string {
  const labels: Record<string, string> = { bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine', diamond: 'Diamant' };
  return labels[tier.toLowerCase()] || tier;
}
