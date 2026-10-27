import React from 'react';
import {
  Zap,
  Play,
  Pause,
  Download,
  Settings,
  Bell,
  ShieldCheck,
  Sparkles,
  Gauge,
  CreditCard,
} from 'lucide-react';

interface HeaderProps {
  autoPilot: boolean;
  onToggleAutoPilot: () => void;
  speedMultiplier: number;
  onChangeSpeed: (speed: number) => void;
  onTriggerInstantSale: () => void;
  onExportPdf: () => void;
  onOpenSettings: () => void;
  onOpenAlerts: () => void;
  unreadAlertsCount: number;
  totalRevenue: number;
}

export const Header: React.FC<HeaderProps> = ({
  autoPilot,
  onToggleAutoPilot,
  speedMultiplier,
  onChangeSpeed,
  onTriggerInstantSale,
  onExportPdf,
  onOpenSettings,
  onOpenAlerts,
  unreadAlertsCount,
  totalRevenue,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
              {autoPilot && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  NexusAuto<span className="text-emerald-400">.ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Business OS 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${autoPilot ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {autoPilot ? 'Autonomie IA & Encaissement en continu' : 'Pilote Automatique en Pause'}
              </p>
            </div>
          </div>

          {/* Quick balance for mobile view */}
          <div className="md:hidden text-right">
            <div className="text-xs text-slate-400">Total Encaissé</div>
            <div className="text-sm font-bold text-emerald-400">
              {totalRevenue.toLocaleString('fr-FR')} €
            </div>
          </div>
        </div>

        {/* Central Controls: Speed Multiplier & Autopilot switch */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Autopilot toggle */}
          <button
            onClick={onToggleAutoPilot}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              autoPilot
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
            }`}
            title="Activer/Pause l'automatisation totale"
          >
            {autoPilot ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Autonomie ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reprendre le Pilote</span>
              </>
            )}
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1 text-[11px]">
              <Gauge className="w-3 h-3" /> Vitesse :
            </span>
            {[1, 5, 20].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  speedMultiplier === speed
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {speed === 20 ? '⚡ Turbo' : `${speed}x`}
              </button>
            ))}
          </div>

          {/* Manual Instant Cash In Trigger */}
          <button
            onClick={onTriggerInstantSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            title="Simuler un achat client immédiat et tester l'encaissement"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Encaissement Express</span>
          </button>
        </div>

        {/* Right Actions: PDF Export, Alerts, Settings */}
        <div className="flex items-center gap-2">
          {/* PDF Export */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            title="Télécharger le rapport financier complet en PDF certifié"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Rapport PDF</span>
          </button>

          {/* Email Alerts Button with badge */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Surveillance des alertes de performance et emails"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Admin Customizer Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Personnalisation de l'interface & paramètres administrateur"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
