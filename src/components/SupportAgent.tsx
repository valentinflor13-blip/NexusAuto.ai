import React, { useState } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Tag,
  Clock,
  HeartHandshake,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { SupportChatMessage } from '../types';
import { analyzeCustomerSentiment } from '../utils/sentimentEngine';

interface SupportAgentProps {
  onAutoCloseSale?: (amount: number, customerName: string) => void;
  onRecordSentiment?: (score: number, customerName: string, snippet: string, label: string) => void;
}

export const SupportAgent: React.FC<SupportAgentProps> = ({ onAutoCloseSale, onRecordSentiment }) => {
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'm1',
      sender: 'customer',
      text: 'Bonjour, le prix de 97€ est un peu élevé pour mon budget actuel. Y a-t-il une garantie si je ne suis pas satisfait ?',
      timestamp: 'Il y a 2 min',
      metadata: {
        sentimentScore: 42,
        sentimentPolarity: 'neutral',
        sentiment: 'Hésitation sur le prix & besoin de réassurance',
      },
    },
    {
      id: 'm2',
      sender: 'ai',
      text: `Bonjour Thomas ! Je comprends tout à fait votre vigilance. Sachez que le système est conçu pour être rentabilisé dès les premières transactions grâce à l'automatisation complète.\n\nPour vous permettre de tester en toute sérénité dès aujourd'hui, j'active pour vous un coupon privilège exclusif de -15% (code VIP-AUTOMA15) ramenant l'accès à 82€, ainsi que notre garantie contractuelle "100% Remboursé sous 30 jours" sans poser aucune question.\n\nSouhaitez-vous que je valide cet accès sécurisé immédiatement ?`,
      timestamp: 'Il y a 1 min',
      metadata: {
        sentiment: 'Hésitation sur le prix & besoin de réassurance',
        sentimentScore: 89,
        sentimentPolarity: 'positive',
        objectionIdentified: 'Prix / Sensibilité budgétaire',
        discountOffered: 15,
        actionTaken: 'COUPON_15_ET_GARANTIE_30J',
      },
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState('Thomas D.');

  const sampleQuestions = [
    "C'est un peu trop cher pour moi, quelle est la garantie ?",
    "Combien de temps faut-il pour rentabiliser le système ?",
    "Je n'y connais rien en code, est-ce adapté aux débutants ?",
    "Comment sont protégées et chiffrées mes transactions ?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const analyzed = analyzeCustomerSentiment(text);

    const userMsg: SupportChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text,
      timestamp: "À l'instant",
      metadata: {
        sentimentScore: analyzed.score,
        sentimentPolarity: analyzed.polarity,
        sentiment: analyzed.label,
      },
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          customerName,
          cartValue: 97,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const resolvedScore = result.data.sentimentScore || (result.data.discountOffered ? 92 : 84);
        const resolvedLabel = result.data.sentimentLabel || result.data.sentiment || 'Favorable';

        const aiMsg: SupportChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.data.reply,
          timestamp: "À l'instant",
          metadata: {
            sentiment: result.data.sentiment,
            sentimentScore: resolvedScore,
            sentimentPolarity: result.data.sentimentPolarity || 'positive',
            objectionIdentified: result.data.objectionIdentified,
            discountOffered: result.data.discountOffered,
            actionTaken: result.data.action,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Record sentiment in global dashboard gauge
        if (onRecordSentiment) {
          onRecordSentiment(resolvedScore, customerName, text.slice(0, 42), resolvedLabel);
        }

        // If discount offered or deal closed, trigger simulation callback
        if (result.data.discountOffered && onAutoCloseSale) {
          // Prospect converted
          onAutoCloseSale(82, customerName);
        }
      }
    } catch (err) {
      console.error('Error contacting AI support server endpoint:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Live Conversational Simulator */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[580px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Agent Closer IA & Support 24/7</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  ACTIF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactions personnalisées par Machine Learning • Zéro intervention humaine
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5" />
              Réponse &lt; 0.4s
            </span>
          </div>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {messages.map((m) => {
            const isUser = m.sender === 'customer';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/70 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* AI Metadata Box (Objection identified, sentiment, incentive) */}
                  {m.metadata && (
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-indigo-900/40 text-[10px] space-y-1 text-slate-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>Objection : {m.metadata.objectionIdentified || 'Intention d’achat'}</span>
                        </div>
                        {typeof m.metadata.sentimentScore === 'number' && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.metadata.sentimentScore >= 70
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : m.metadata.sentimentScore >= 45
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            Score Sentiment : {m.metadata.sentimentScore}/100
                          </span>
                        )}
                      </div>
                      <div>Sentiment détecté : <span className="text-slate-300">{m.metadata.sentiment}</span></div>
                      {m.metadata.discountOffered ? (
                        <div className="text-emerald-400 font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Remise VIP -{m.metadata.discountOffered}% déclenchée pour maximiser la conversion</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className={`text-[9px] text-slate-500 ${isUser ? 'text-right' : ''}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50 w-fit">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
              <span>L'agent IA analyse le profil psychologique et rédige...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-slate-800">
          <span className="text-slate-500 shrink-0 font-medium text-[10px]">Tester :</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Écrivez une objection ou question prospect..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Col: Machine Learning & Performance Stats */}
      <div className="space-y-6">
        {/* Support Autonomy Stats */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            Efficacité de Closing & Rétention
          </h4>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">Taux de Résolution Autonome</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">99.4%</div>
              <div className="text-[10px] text-slate-500">Aucun humain requis pour clore les ventes</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">Taux de Closing après Support IA</div>
              <div className="text-xl font-black text-purple-400 mt-0.5">42.8%</div>
              <div className="text-[10px] text-slate-500">+18% par rapport à un formulaire statique</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">Délai Moyen de Réponse</div>
              <div className="text-xl font-black text-sky-400 mt-0.5">0.38 seconde</div>
              <div className="text-[10px] text-slate-500">Disponibilité mondiale 24h/24, 7j/7</div>
            </div>
          </div>
        </div>

        {/* Machine Learning Personalization Rules */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Règles d'Adaptation Machine Learning
          </h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Détection d'hésitation :</strong> Déclenchement automatique de garantie rassurante sous 5 secondes d'inactivité.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Élasticité par utilisateur :</strong> Attribution d'un coupon temporaire -10% ou -15% uniquement si nécessaire pour conclure.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Sécurité & Conformité :</strong> Chiffrement des échanges et respect strict du secret des données.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
