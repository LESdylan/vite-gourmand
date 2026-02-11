/**
 * AiMenuComposer — Split-panel AI assistant for custom menu creation
 *
 * Left panel:  AI chat conversation
 * Right panel: Live-editable "brief" document built from the conversation
 * Drag handle: Resizable panels
 *
 * Once the brief is complete, the user can submit it as a ticket
 * via POST /api/contact — the team receives the full brief.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  FileText,
  GripVertical,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  Users,
  Euro,
  Calendar,
  UtensilsCrossed,
  Leaf,
  ChefHat,
} from 'lucide-react';
import { apiRequest } from '../services/api';

/* ── Types ── */
interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BriefData {
  eventType: string;
  guestCount: string;
  budget: string;
  date: string;
  dietaryNeeds: string;
  allergies: string;
  preferences: string;
  aiProposal: string;
  additionalNotes: string;
}

const EMPTY_BRIEF: BriefData = {
  eventType: '',
  guestCount: '',
  budget: '',
  date: '',
  dietaryNeeds: '',
  allergies: '',
  preferences: '',
  aiProposal: '',
  additionalNotes: '',
};

const BRIEF_FIELDS: {
  key: keyof BriefData;
  label: string;
  icon: typeof Users;
  placeholder: string;
  required: boolean;
}[] = [
  {
    key: 'eventType',
    label: "Type d'événement",
    icon: Sparkles,
    placeholder: 'Mariage, anniversaire, séminaire…',
    required: true,
  },
  {
    key: 'guestCount',
    label: 'Nombre de convives',
    icon: Users,
    placeholder: 'Ex : 80 personnes',
    required: true,
  },
  {
    key: 'budget',
    label: 'Budget par personne',
    icon: Euro,
    placeholder: 'Ex : 45€/personne',
    required: true,
  },
  {
    key: 'date',
    label: 'Date souhaitée',
    icon: Calendar,
    placeholder: 'Ex : 15 juin 2026',
    required: true,
  },
  {
    key: 'dietaryNeeds',
    label: 'Régimes alimentaires',
    icon: Leaf,
    placeholder: 'Végétarien, halal, sans gluten…',
    required: false,
  },
  {
    key: 'allergies',
    label: 'Allergies',
    icon: AlertTriangle,
    placeholder: 'Fruits à coque, crustacés…',
    required: false,
  },
  {
    key: 'preferences',
    label: 'Préférences & thème',
    icon: UtensilsCrossed,
    placeholder: 'Thème élégant, cuisine du sud-ouest…',
    required: false,
  },
];

/* ── Quick starters ── */
const QUICK_STARTERS = [
  { icon: '💍', text: 'Mariage 80 personnes' },
  { icon: '🎂', text: 'Anniversaire 30 personnes' },
  { icon: '🏢', text: "Séminaire d'entreprise" },
  { icon: '🥗', text: 'Menu végétarien' },
];

/* ══════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════ */
export default function AiMenuComposer({
  onBriefReady,
}: {
  /** Callback when a brief is submitted — parent can use it to advance the order flow */
  onBriefReady?: (brief: string) => void;
}) {
  /* ── Chat state ── */
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  /* ── Brief state ── */
  const [brief, setBrief] = useState<BriefData>({ ...EMPTY_BRIEF });
  const [briefExpanded, setBriefExpanded] = useState(false);

  /* ── Resizable panels ── */
  const [splitRatio, setSplitRatio] = useState(0.55); // chat takes 55%
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  /* ── Submission state ── */
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── Contact info for ticket ── */
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, loading]);

  /* ── Drag resize ── */
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0.3, Math.min(0.7, x / rect.width));
      setSplitRatio(ratio);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('mouseup', handleMouseUp);
    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  /* ── Send AI message ── */
  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg || loading) return;

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: msg }]);
      setLoading(true);

      try {
        const body: Record<string, unknown> = { message: msg };
        if (convId) body.conversationId = convId;

        const raw = await apiRequest<
          | { data: { conversationId: string; message: string } }
          | { conversationId: string; message: string }
        >('/api/ai-agent/chat', { method: 'POST', body });

        const res = 'data' in raw ? raw.data : raw;
        setConvId(res.conversationId);
        setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);

        // Try to auto-fill brief from AI response
        autoExtractBrief(msg, res.message);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '⚠️ Erreur de communication. Veuillez réessayer.' },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, convId, autoExtractBrief],
  );

  /* ── Auto-extract brief fields from conversation ── */
  const autoExtractBrief = useCallback((userMsg: string, aiMsg: string) => {
    const combined = (userMsg + ' ' + aiMsg).toLowerCase();

    setBrief((prev) => {
      const next = { ...prev };

      if (!next.eventType) {
        const re =
          /(mariage|anniversaire|s[eé]minaire|bapt[eê]me|communion|f[eê]te|gala|soir[eé]e|cocktail|enterrement de vie|team.?building|repas d'affaire)/i;
        const evtMatch = re.exec(combined);
        if (evtMatch) next.eventType = evtMatch[1].charAt(0).toUpperCase() + evtMatch[1].slice(1);
      }

      if (!next.guestCount) {
        const guestMatch = /(\d+)\s*(personnes|convives|invit[eé]s|pers\b|couverts)/i.exec(
          combined,
        );
        if (guestMatch) next.guestCount = guestMatch[1] + ' personnes';
      }

      if (!next.budget) {
        const budgetMatch = /(\d+)\s*[€e](?:uros?)?\s*(?:\/|par)\s*(?:pers|personne|convive)/i.exec(
          combined,
        );
        if (budgetMatch) {
          next.budget = budgetMatch[1] + '€/personne';
        } else {
          const budgetMatch2 = /budget\s*(?:de\s*)?(\d+)\s*[€e]/i.exec(combined);
          if (budgetMatch2) next.budget = budgetMatch2[1] + '€/personne';
        }
      }

      if (!next.date) {
        const dateMatch =
          /(\d{1,2}\s+(?:janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s*\d{0,4})/i.exec(
            combined,
          );
        if (dateMatch) next.date = dateMatch[1];
      }

      if (!next.dietaryNeeds) {
        const dietMatch = /(v[eé]g[eé]tarien|v[eé]gan|sans gluten|halal|casher|pescetarien)/i.exec(
          combined,
        );
        if (dietMatch) next.dietaryNeeds = dietMatch[1];
      }

      if (!next.allergies) {
        const allergyMatch = /allerg\w+\s+(?:aux?\s+)?([^,.]+)/i.exec(combined);
        if (allergyMatch) next.allergies = allergyMatch[1].trim();
      }

      // AI proposal — capture structured menu proposals
      if (
        aiMsg.includes('MENU') &&
        (aiMsg.includes('ENTRÉE') || aiMsg.includes('PLAT') || aiMsg.includes('convives'))
      ) {
        next.aiProposal = aiMsg;
      }

      return next;
    });
  }, []);

  /* ── Copy AI message to brief ── */
  const copyToProposal = useCallback((content: string) => {
    setBrief((prev) => ({ ...prev, aiProposal: content }));
  }, []);

  /* ── Brief completeness ── */
  const requiredFields = BRIEF_FIELDS.filter((f) => f.required);
  const filledRequired = requiredFields.filter((f) => brief[f.key].trim().length > 0).length;
  const briefProgress = Math.round((filledRequired / requiredFields.length) * 100);
  const isBriefReady = filledRequired === requiredFields.length;

  /* ── Build full brief text ── */
  const buildBriefText = useCallback(() => {
    const lines = [
      '═══ DEMANDE DE MENU PERSONNALISÉ ═══',
      '',
      `🎉 Événement : ${brief.eventType || 'Non précisé'}`,
      `👥 Convives : ${brief.guestCount || 'Non précisé'}`,
      `💰 Budget : ${brief.budget || 'Non précisé'}`,
      `📅 Date : ${brief.date || 'Non précisée'}`,
      `🥗 Régimes : ${brief.dietaryNeeds || 'Aucun'}`,
      `⚠️ Allergies : ${brief.allergies || 'Aucune'}`,
      `🎨 Préférences : ${brief.preferences || 'Aucune'}`,
    ];

    if (brief.aiProposal) {
      lines.push('', '─── PROPOSITION IA ───', '', brief.aiProposal);
    }

    if (brief.additionalNotes) {
      lines.push('', '─── NOTES ADDITIONNELLES ───', '', brief.additionalNotes);
    }

    return lines.join('\n');
  }, [brief]);

  /* ── Submit ticket ── */
  const handleSubmitTicket = useCallback(async () => {
    if (!contactName.trim() || !contactEmail.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const briefText = buildBriefText();
      const raw = await apiRequest<{ data: { ticket_number: string } } | { ticket_number: string }>(
        '/api/contact',
        {
          method: 'POST',
          body: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone || undefined,
            title: `Menu personnalisé — ${brief.eventType || 'Événement'} (${brief.guestCount || '?'} convives)`,
            description: briefText,
          },
        },
      );
      const res = 'data' in raw ? raw.data : raw;
      setTicketNumber(res.ticket_number);
      setSubmitted(true);
      onBriefReady?.(briefText);
    } catch {
      setSubmitError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }, [contactName, contactEmail, contactPhone, brief, buildBriefText, onBriefReady]);

  /* ══════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════ */

  // Success screen after ticket submission
  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-[#FFF8F0] to-white rounded-2xl border border-[#556B2F]/20 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#556B2F]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[#556B2F]" />
        </div>
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Demande envoyée !</h3>
        <p className="text-sm text-[#1A1A1A]/60 mb-4">
          Notre équipe a reçu votre brief et vous répondra sous 24h avec une proposition
          personnalisée.
        </p>
        {ticketNumber && (
          <div className="inline-flex items-center gap-2 bg-white border border-[#D4AF37]/30 rounded-xl px-5 py-3 mb-4">
            <span className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider font-semibold">
              Ticket
            </span>
            <span className="font-black text-lg text-[#1A1A1A] tracking-wide">{ticketNumber}</span>
          </div>
        )}
        <p className="text-xs text-[#1A1A1A]/40">
          Un email de confirmation a été envoyé à {contactEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* ── Split Panel Container ── */}
      <div
        ref={containerRef}
        className={`flex rounded-2xl border border-[#D4AF37]/20 overflow-hidden bg-white shadow-lg ${
          briefExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : ''
        }`}
        style={{ height: briefExpanded ? 'auto' : 480 }}
      >
        {/* ══ LEFT — AI Chat ══ */}
        <div
          className="flex flex-col min-w-0 border-r border-[#1A1A1A]/5"
          style={{ width: `${splitRatio * 100}%` }}
        >
          {/* Chat header */}
          <div className="bg-gradient-to-r from-[#722F37] to-[#8B3A42] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm truncate">Assistant Menu</h3>
              <p className="text-white/40 text-[10px]">Décrivez vos besoins, l'IA vous guide</p>
            </div>
            {briefProgress > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                    style={{ width: `${briefProgress}%` }}
                  />
                </div>
                <span className="text-[9px] text-white/40 font-semibold">{briefProgress}%</span>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f6]">
            {/* Welcome / empty state */}
            {messages.length === 0 && !loading && (
              <div className="text-center py-4">
                <ChefHat className="h-10 w-10 text-[#D4AF37]/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#1A1A1A]/70 mb-1">
                  Composons votre menu ensemble
                </p>
                <p className="text-xs text-[#1A1A1A]/40 leading-relaxed max-w-[260px] mx-auto mb-4">
                  Décrivez votre événement et je vous proposerai un menu sur mesure parmi nos
                  créations.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {QUICK_STARTERS.map((q) => (
                    <button
                      key={q.text}
                      type="button"
                      onClick={() => sendMessage(q.text)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-[#D4AF37]/20 text-[#722F37] hover:bg-[#722F37]/5 transition-colors font-medium"
                    >
                      {q.icon} {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}-${msg.content.slice(0, 16)}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%] group">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#722F37] to-[#8B3A42] text-white rounded-br-sm'
                        : 'bg-white border border-[#1A1A1A]/5 text-[#333] rounded-bl-sm shadow-sm'
                    }`}
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </div>
                  {/* Action: copy AI response into brief proposal */}
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => copyToProposal(msg.content)}
                      className="mt-1 text-[10px] text-[#722F37]/40 hover:text-[#722F37] flex items-center gap-1 ml-1 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FileText className="h-2.5 w-2.5" />
                      Copier dans le brief
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#1A1A1A]/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-[#1A1A1A]/5 p-3 flex gap-2 bg-white shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Décrivez vos besoins…"
              className="flex-1 text-sm border border-[#1A1A1A]/8 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#722F37] bg-[#FFF8F0]/50"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: input.trim() && !loading ? '#722F37' : '#eee' }}
            >
              <Send
                className="h-4 w-4"
                style={{ color: input.trim() && !loading ? 'white' : '#999' }}
              />
            </button>
          </div>
        </div>

        {/* ══ DRAG HANDLE ══ */}
        <div
          role="separator"
          tabIndex={0}
          aria-label="Redimensionner les panneaux"
          onMouseDown={handleMouseDown}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplitRatio((r) => Math.max(0.3, r - 0.02));
            if (e.key === 'ArrowRight') setSplitRatio((r) => Math.min(0.7, r + 0.02));
          }}
          className="w-3 flex items-center justify-center cursor-col-resize bg-[#1A1A1A]/[0.02] hover:bg-[#D4AF37]/10 transition-colors shrink-0 group"
          title="Glisser pour redimensionner"
        >
          <GripVertical className="h-5 w-5 text-[#1A1A1A]/15 group-hover:text-[#D4AF37] transition-colors" />
        </div>

        {/* ══ RIGHT — Live Brief / Document ══ */}
        <div
          className="flex flex-col min-w-0 bg-[#FFF8F0]/50"
          style={{ width: `${(1 - splitRatio) * 100}%` }}
        >
          {/* Brief header */}
          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent px-4 py-3 flex items-center justify-between shrink-0 border-b border-[#D4AF37]/10">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-[#1A1A1A] text-sm truncate">Votre brief</h3>
                <p className="text-[10px] text-[#1A1A1A]/40 truncate">
                  {isBriefReady
                    ? '✅ Prêt à envoyer'
                    : `${filledRequired}/${requiredFields.length} champs requis`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBriefExpanded((e) => !e)}
              className="w-7 h-7 rounded-lg hover:bg-[#1A1A1A]/5 flex items-center justify-center transition-colors shrink-0"
            >
              {briefExpanded ? (
                <Minimize2 className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
              )}
            </button>
          </div>

          {/* Brief fields */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {BRIEF_FIELDS.map((field) => {
              const Icon = field.icon;
              const filled = brief[field.key].trim().length > 0;
              return (
                <div key={field.key} className="group">
                  <label className="flex items-center gap-1.5 mb-1">
                    <Icon
                      className={`h-3 w-3 ${filled ? 'text-[#556B2F]' : field.required ? 'text-[#722F37]/50' : 'text-[#1A1A1A]/25'}`}
                    />
                    <span
                      className={`text-[11px] font-semibold ${filled ? 'text-[#1A1A1A]/70' : 'text-[#1A1A1A]/40'}`}
                    >
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </span>
                    {filled && <CheckCircle className="h-2.5 w-2.5 text-[#556B2F] ml-auto" />}
                  </label>
                  <input
                    type="text"
                    value={brief[field.key]}
                    onChange={(e) => setBrief((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={`w-full text-[12px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37] transition-colors ${
                      filled
                        ? 'border-[#556B2F]/20 bg-[#556B2F]/[0.03]'
                        : 'border-[#1A1A1A]/8 bg-white hover:border-[#D4AF37]/30'
                    }`}
                  />
                </div>
              );
            })}

            {/* AI Proposal area */}
            {brief.aiProposal && (
              <div className="mt-2">
                <label className="flex items-center gap-1.5 mb-1">
                  <ChefHat className="h-3 w-3 text-[#D4AF37]" />
                  <span className="text-[11px] font-semibold text-[#1A1A1A]/70">
                    Proposition de l'IA
                  </span>
                </label>
                <div className="text-[11px] bg-white border border-[#D4AF37]/20 rounded-lg p-3 max-h-32 overflow-y-auto leading-relaxed text-[#333] whitespace-pre-wrap">
                  {brief.aiProposal}
                </div>
              </div>
            )}

            {/* Additional notes */}
            <div>
              <label className="flex items-center gap-1.5 mb-1">
                <FileText className="h-3 w-3 text-[#1A1A1A]/25" />
                <span className="text-[11px] font-semibold text-[#1A1A1A]/40">
                  Notes additionnelles
                </span>
              </label>
              <textarea
                value={brief.additionalNotes}
                onChange={(e) => setBrief((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                rows={2}
                placeholder="Contraintes de lieu, horaires, souhaits particuliers…"
                className="w-full text-[12px] border border-[#1A1A1A]/8 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37] bg-white resize-none"
              />
            </div>
          </div>

          {/* Submit area */}
          <div className="border-t border-[#D4AF37]/10 p-3 bg-white shrink-0">
            {!showContactForm ? (
              <button
                type="button"
                onClick={() => setShowContactForm(true)}
                disabled={!isBriefReady}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isBriefReady
                    ? 'bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white shadow-lg shadow-[#722F37]/20 hover:shadow-xl hover:shadow-[#722F37]/30'
                    : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/25 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                {isBriefReady
                  ? 'Envoyer la demande'
                  : `Complétez le brief (${filledRequired}/${requiredFields.length})`}
              </button>
            ) : (
              /* Contact info form */
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#1A1A1A]/60">Vos coordonnées</span>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Votre nom *"
                  className="w-full text-[12px] border border-[#1A1A1A]/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Votre email *"
                  className="w-full text-[12px] border border-[#1A1A1A]/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Téléphone (optionnel)"
                  className="w-full text-[12px] border border-[#1A1A1A]/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
                {submitError && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {submitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmitTicket}
                  disabled={!contactName.trim() || !contactEmail.trim() || submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#556B2F] to-[#6B8E3D] text-white shadow-lg shadow-[#556B2F]/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Envoyer à l'équipe
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen overlay backdrop */}
      {briefExpanded && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fermer le plein écran"
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setBriefExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') setBriefExpanded(false);
          }}
        />
      )}
    </div>
  );
}
