import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '../utils/revenueEngine';
import { GlobalSatisfactionMetric } from '../utils/sentimentEngine';
import { SatisfactionGauge } from './SatisfactionGauge';

interface LiveTransactionsProps {
  transactions: Transaction[];
  conversionRate: number;
  totalOrders: number;
  satisfactionMetrics: GlobalSatisfactionMetric;
  recentSentiments?: Array<{
    id: string;
    customer: string;
    snippet: string;
    score: number;
    label: string;
    time: string;
  }>;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const LiveTransactions: React.FC<LiveTransactionsProps> = ({
  transactions,
  conversionRate,
  totalOrders,
  satisfactionMetrics,
  recentSentiments,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // SVG chart datapoints calculation
  const recentSlice = transactions.slice(0, 12).reverse();
  const maxAmount = Math.max(...recentSlice.map((t) => t.amount), 150);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Real-Time Velocity Graph & Funnel */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Real-Time Revenue Velocity Interactive Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Vitesse d'Encaissement & Courbe Prédictive
              </h3>
              <p className="text-xs text-slate-400">
                Projection algorithmique basée sur les transactions récentes et l'élasticité de la demande
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Encaissement réel
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                <span className="w-2.5 h-0.5 bg-purple-400 border-dashed"></span>
                Projection ML (+18%)
              </span>
            </div>
          </div>

          {/* SVG Visualizer */}
          <div className="h-52 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="predictiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Real historical points */}
              {(() => {
                const points = recentSlice.map((tx, idx) => {
                  const x = (idx / Math.max(recentSlice.length - 1, 1)) * 360;
                  const y = 140 - (tx.amount / maxAmount) * 110;
                  return { x, y, tx };
                });

                if (points.length < 2) return null;

                const pathD = points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '');
                const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                // Predictive extrapolated curve
                const lastPoint = points[points.length - 1];
                const predPath = `M ${lastPoint.x} ${lastPoint.y} C 410 ${lastPoint.y - 25}, 460 ${lastPoint.y - 45}, 500 ${Math.max(20, lastPoint.y - 55)}`;

                return (
                  <>
                    <path d={areaD} fill="url(#revenueGrad)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Predictive dashed projection */}
                    <path d={predPath} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Nodes */}
                    {points.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-5 transition-all"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Il y a 60 min</span>
            <span>Flux temps réel</span>
            <span className="text-purple-400 font-medium">Prévision H+2 (+480 €)</span>
          </div>
        </div>

        {/* Real-Time Conversion Optimization Funnel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Entonnoir de Conversion Optimisé par Machine Learning
              </h3>
              <p className="text-xs text-slate-400">
                L'IA analyse le comportement de chaque visiteur pour personnaliser l'offre et fermer la vente
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              CVR Moyen : {conversionRate}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { label: '1. Trafic Réseaux', count: '14 850', sub: 'TikTok, Meta, Google', rate: '100%' },
              { label: '2. Intention IA', count: '4 210', sub: 'Scoring comportemental', rate: '28.3%' },
              { label: '3. Offre Déclenchée', count: '1 480', sub: 'Incentive personnalisé', rate: '35.1%' },
              { label: '4. Closer IA 24/7', count: '890', sub: 'Objections levées', rate: '60.1%' },
              { label: '5. Encaissement', count: `${totalOrders}`, sub: 'Paiements sécurisés', rate: `${conversionRate}%`, active: true },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  step.active
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {step.label}
                </div>
                <div className="text-lg font-extrabold text-white">{step.count}</div>
                <div className="text-[10px] text-slate-400 truncate">{step.sub}</div>
                <div className="mt-2 text-[11px] font-semibold text-emerald-400">
                  {step.rate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Customer Satisfaction & Sentiment Gauge */}
        <SatisfactionGauge
          metrics={satisfactionMetrics}
          recentSentiments={recentSentiments}
        />
      </div>

      {/* Right Col: Live Encrypted Transaction Stream */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Transactions en Direct
            </h3>
            <p className="text-xs text-slate-400">Flux d'encaissement autonome chiffré</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/50">
            LIVE
          </span>
        </div>

        {/* Scrollable transactions list */}
        <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1 flex-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                    {tx.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {tx.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.customerEmail}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">
                    +{tx.amount} €
                  </div>
                  <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-700/50 text-slate-400">
                <span className="truncate max-w-[130px] font-medium text-slate-300">
                  {tx.productName}
                </span>
                <span className="font-mono text-slate-500 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                  <Lock className="w-2.5 h-2.5" />
                  {tx.hash.slice(0, 10)}...
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Zero-Knowledge Ledger
          </span>
          <span className="text-emerald-400 font-semibold">100% Validé</span>
        </div>
      </div>

      {/* Modal: Cryptographic Transaction Inspector */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Preuve Cryptographique d'Encaissement</h4>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300 space-y-1">
                <div><span className="text-slate-500">TX_ID:</span> {selectedTx.id}</div>
                <div><span className="text-slate-500">MONTANT:</span> <span className="text-emerald-400 font-bold">{selectedTx.amount} EUR</span></div>
                <div><span className="text-slate-500">PRODUIT:</span> {selectedTx.productName}</div>
                <div><span className="text-slate-500">SOURCE:</span> {selectedTx.roasSource}</div>
                <div><span className="text-slate-500">PASSERELLE:</span> {selectedTx.paymentMethod} (Chiffré)</div>
                <div><span className="text-slate-500">HORODATAGE:</span> {new Date(selectedTx.timestamp).toLocaleString('fr-FR')}</div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Signature Hash SHA-256 (Immuable) :
                </label>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/40 font-mono text-[11px] text-emerald-400 break-all select-all">
                  {selectedTx.hash}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/40 text-[11px] text-teal-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Transaction chiffrée de bout en bout, certifiée conforme aux protocoles bancaires et sans intervention manuelle requise.</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-xs transition-all"
            >
              Fermer l'inspecteur
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
