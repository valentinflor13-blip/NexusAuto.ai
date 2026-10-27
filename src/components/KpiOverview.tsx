import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Bot,
  ShieldCheck,
  Target,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface KpiOverviewProps {
  totalRevenue: number;
  hourlyVelocity: number;
  conversionRate: number;
  overallRoas: number;
  supportResolutionRate: number;
  totalOrders: number;
  isTurboActive: boolean;
  satisfactionRate?: number;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({
  totalRevenue,
  hourlyVelocity,
  conversionRate,
  overallRoas,
  supportResolutionRate,
  totalOrders,
  isTurboActive,
  satisfactionRate = 96.4,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Revenu Encaissé</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
          <span>{totalRevenue.toLocaleString('fr-FR')}</span>
          <span className="text-sm font-semibold text-emerald-400">€</span>
        </div>
        <div className="mt-1.5 flex items-center text-[11px] text-emerald-400 gap-1 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+34.8% vs hier</span>
          {isTurboActive && <span className="text-[10px] text-amber-400 font-bold ml-auto">⚡ TURBO</span>}
        </div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
      </div>

      {/* 2. Velocity */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-sky-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Vitesse d'Encaissement</span>
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
          <span>{hourlyVelocity.toLocaleString('fr-FR')}</span>
          <span className="text-xs font-semibold text-sky-400">€/h</span>
        </div>
        <div className="mt-1.5 flex items-center text-[11px] text-sky-400 gap-1 font-medium">
          <span>Flux continu 24/7</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{totalOrders} ventes</span>
        </div>
      </div>

      {/* 3. Predictive Conversion Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-purple-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">CVR Prédictif IA</span>
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
          <span>{conversionRate}%</span>
        </div>
        <div className="mt-1.5 flex items-center text-[11px] text-purple-400 gap-1 font-medium">
          <Sparkles className="w-3 h-3" />
          <span>+2.4% lift ML</span>
        </div>
      </div>

      {/* 4. ROAS Across Social Channels */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">ROAS Omnicanal</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
          <span>{overallRoas}</span>
          <span className="text-xs font-semibold text-amber-400">x</span>
        </div>
        <div className="mt-1.5 flex items-center text-[11px] text-amber-400 gap-1 font-medium">
          <span>TikTok & Meta optimisés</span>
        </div>
      </div>

      {/* 5. Support Client Autonome */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-indigo-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Support IA 24/7</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
          <span>{supportResolutionRate}%</span>
        </div>
        <div className="mt-1.5 flex items-center text-[11px] text-indigo-400 gap-1 font-medium">
          <span>Résolution 100% IA</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-semibold">{satisfactionRate}% CSAT</span>
        </div>
      </div>

      {/* 6. High Security & Encryption */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-teal-500/40 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Sécurité & Vault</span>
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-sm font-black text-white tracking-tight mt-1">
          AES-256 GCM
        </div>
        <div className="mt-1 flex items-center text-[11px] text-teal-400 gap-1 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span>SHA-256 Ledger • Actif</span>
        </div>
      </div>
    </div>
  );
};
