import React, { useState } from 'react';
import {
  Share2,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  Pause,
  Play,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Campaign } from '../types';

interface SocialAdsSyncProps {
  campaigns: Campaign[];
  onToggleCampaign: (id: string) => void;
  onAutoReallocateBudget: () => void;
}

export const SocialAdsSync: React.FC<SocialAdsSyncProps> = ({
  campaigns,
  onToggleCampaign,
  onAutoReallocateBudget,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [autoReallocated, setAutoReallocated] = useState(false);

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const handleReallocate = () => {
    setAutoReallocated(true);
    onAutoReallocateBudget();
    setTimeout(() => setAutoReallocated(false), 3000);
  };

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spentToday, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);
  const avgRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" />
              Synchronisation & Automatisation des Régies Publicitaires
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Synchronisation des pixels de conversion (CAPI), audiences similaires et pilotage algorithmique du budget
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReallocate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all"
              title="Réallouer automatiquement les budgets vers les campagnes les plus rentables"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{autoReallocated ? 'Budgets Optimisés !' : 'Auto-Optimiser ROAS'}</span>
            </button>

            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{syncing ? 'Synchronisation...' : 'Forcer Sync Omnicanale'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Dépense Publicitaire Jour</div>
          <div className="text-xl font-extrabold text-white mt-1">{totalSpent.toLocaleString('fr-FR')} €</div>
          <div className="text-[10px] text-slate-500">Plafond dynamique sécurisé</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Revenu Publicitaire Direct</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {totalRevenue.toLocaleString('fr-FR')} €
          </div>
          <div className="text-[10px] text-slate-500">Attribution premier clic & post-view</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">ROAS Global Mesuré</div>
          <div className="text-xl font-extrabold text-purple-400 mt-1">{avgRoas}x</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+0.6x vs objectif 4.0x</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">API de Conversion (CAPI)</div>
          <div className="text-sm font-bold text-teal-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            100% Signal Actif
          </div>
          <div className="text-[10px] text-slate-500">Zéro perte de cookies (iOS 14+ résilient)</div>
        </div>
      </div>

      {/* Active Campaigns Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Campagnes Synchronisées en Temps Réel
          </h4>
          <span className="text-xs text-slate-400">
            {campaigns.filter((c) => c.status === 'ACTIVE').length} actives sur 4 régies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Régie</th>
                <th className="pb-3">Campagne & Hook</th>
                <th className="pb-3">Budget / Jour</th>
                <th className="pb-3">Dépense</th>
                <th className="pb-3">Revenu</th>
                <th className="pb-3">ROAS</th>
                <th className="pb-3">Statut Autonome</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        camp.platform === 'TikTok'
                          ? 'bg-rose-500'
                          : camp.platform === 'Meta'
                          ? 'bg-blue-500'
                          : camp.platform === 'Google'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    {camp.platform}
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-slate-200">{camp.name}</div>
                    <div className="text-[10px] text-slate-500 italic max-w-xs truncate">
                      "{camp.creativeHook}"
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-300">{camp.budgetPerDay} €</td>
                  <td className="py-3.5 font-medium text-slate-300">{camp.spentToday} €</td>
                  <td className="py-3.5 font-bold text-emerald-400">{camp.revenueGenerated} €</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      {camp.roas}x
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {camp.status === 'ACTIVE' ? 'DIFFUSION ACTIVE' : 'OPTIMISATION'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => onToggleCampaign(camp.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title={camp.status === 'ACTIVE' ? 'Mettre en pause' : 'Réactiver'}
                    >
                      {camp.status === 'ACTIVE' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
