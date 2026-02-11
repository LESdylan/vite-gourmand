/**
 * AiAssistantWidget — Floating AI chatbot for public pages & profile
 *
 * A friendly robot assistant that appears in the bottom-right corner.
 * Users can ask about:
 * - The concept and offerings of Vite & Gourmand
 * - Current promotions and menus
 * - Help drafting a message for the contact form
 *
 * Uses the existing /api/ai-agent/chat endpoint (read-only DB access).
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import './AiAssistantWidget.css';

/* ── Types ── */
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  conversationId: string;
  message: string;
}

/* ── Quick suggestions for the widget ── */
const QUICK_SUGGESTIONS = [
  { icon: '🍽️', label: 'Découvrir le concept', prompt: "Pouvez-vous m'expliquer le concept de Vite & Gourmand ?" },
  { icon: '📋', label: 'Voir les menus', prompt: 'Quels menus proposez-vous actuellement ?' },
  { icon: '🎉', label: 'Promotions', prompt: 'Y a-t-il des promotions ou offres spéciales en ce moment ?' },
  { icon: '✉️', label: 'Aide rédaction', prompt: "J'aimerais contacter l'équipe, pouvez-vous m'aider à rédiger mon message ?" },
];

interface AiAssistantWidgetProps {
  /** Page context for smarter responses */
  pageContext?: 'home' | 'menu' | 'contact' | 'profile' | 'order';
  /** Callback when user wants to go to contact page */
  onNavigateToContact?: () => void;
}

export function AiAssistantWidget({ pageContext = 'home', onNavigateToContact }: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Stop pulse animation after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isLoading) return;

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: msg }]);
      setIsLoading(true);

      try {
        const body: Record<string, unknown> = {
          message: msg,
          // Add context about the page the user is on
          context: {
            page: pageContext,
            mode: 'public_assistant', // Tell the AI to act as a public assistant
          },
        };
        if (conversationId) body.conversationId = conversationId;

        const raw = await apiRequest<{ data: ChatResponse } | ChatResponse>('/api/ai-agent/chat', {
          method: 'POST',
          body,
        });
        const res = 'data' in raw ? raw.data : raw;

        setConversationId(res.conversationId);
        setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '⚠️ Oups, une erreur est survenue. Veuillez réessayer.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId, pageContext],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickSuggestion = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleContactRedirect = () => {
    if (onNavigateToContact) {
      onNavigateToContact();
      setIsOpen(false);
    }
  };

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={togglePanel}
        className={`ai-widget-fab ${isOpen ? 'ai-widget-fab--open' : ''} ${showPulse ? 'ai-widget-fab--pulse' : ''}`}
        aria-label={isOpen ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant IA'}
        title="Assistant Vite & Gourmand"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Bot size={28} />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="ai-widget-panel">
          {/* Header */}
          <div className="ai-widget-header">
            <div className="ai-widget-header__left">
              <div className="ai-widget-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="ai-widget-title">Assistant Vite & Gourmand</h3>
                <span className="ai-widget-status">
                  <Sparkles size={10} /> En ligne
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="ai-widget-close" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="ai-widget-messages">
            {!hasMessages ? (
              <div className="ai-widget-welcome">
                <div className="ai-widget-welcome__icon">
                  <Bot size={40} />
                </div>
                <h4>Bonjour ! 👋</h4>
                <p>
                  Je suis votre assistant virtuel. Je peux vous renseigner sur nos menus,
                  nos promotions, ou vous aider à préparer votre demande de devis.
                </p>
                <div className="ai-widget-suggestions">
                  {QUICK_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickSuggestion(sug.prompt)}
                      className="ai-widget-suggestion"
                    >
                      <span className="ai-widget-suggestion__icon">{sug.icon}</span>
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`ai-widget-message ${msg.role === 'user' ? 'ai-widget-message--user' : 'ai-widget-message--bot'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="ai-widget-message__avatar">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className="ai-widget-message__content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-widget-message ai-widget-message--bot">
                    <div className="ai-widget-message__avatar">
                      <Bot size={14} />
                    </div>
                    <div className="ai-widget-message__content ai-widget-typing">
                      <Loader2 size={14} className="animate-spin" />
                      <span>En train d'écrire...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contact CTA (shown after a few messages) */}
          {hasMessages && onNavigateToContact && messages.length >= 4 && (
            <div className="ai-widget-cta">
              <button onClick={handleContactRedirect} className="ai-widget-cta__button">
                <MessageCircle size={14} />
                Aller au formulaire de contact
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="ai-widget-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="ai-widget-input__field"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="ai-widget-input__send"
              aria-label="Envoyer"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Footer */}
          <div className="ai-widget-footer">
            <span>Propulsé par IA • Données en lecture seule</span>
          </div>
        </div>
      )}
    </>
  );
}

export default AiAssistantWidget;
