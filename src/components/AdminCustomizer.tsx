import React from 'react';
import {
  Settings,
  Palette,
  Sliders,
  Shield,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AdminSettings } from '../types';

interface AdminCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings;
  onUpdateSettings: (newSettings: Partial<AdminSettings>) => void;
  onResetDefaults: () => void;
}

export const AdminCustomizer: React.FC<AdminCustomizerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const themes = [
    { id: 'obsidian', name: 'Cyber Obsidian (Défaut)', color: 'bg-slate-900 border-emerald-500' },
    { id: 'emerald', name: 'Emerald Wealth (Fintech)', color: 'bg-emerald-950 border-emerald-400' },
    { id: 'navy', name: 'Deep Navy (Exécutif)', color: 'bg-slate-950 border-sky-400' },
    { id: 'light', name: 'Titanium Clean (Clair)', color: 'bg-slate-100 border-slate-400 text-slate-900' },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Personnalisation Administrateur & Préférences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs pr-1">
          {/* Theme Palette */}
          <div>
            <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-2.5">
              <Palette className="w-4 h-4 text-emerald-400" />
              Thème Visuel du Dashboard :
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id as any })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    settings.theme === th.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{th.name}</span>
                  {settings.theme === th.id && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Autonomy switches */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-400" />
              Règles d'Automatisation Système :
            </label>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Synchronisation Publicitaire Continue</div>
                <div className="text-[10px] text-slate-400">Diffusion automatique des créatives générées</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSyncSocialAds}
                onChange={(e) => onUpdateSettings({ autoSyncSocialAds: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Ajustement Prédictif du Prix (Élasticité)</div>
                <div className="text-[10px] text-slate-400">Optimise les remises selon les heures d'affluence</div>
              </div>
              <input
                type="checkbox"
                checked={settings.dynamicPricingEnabled}
                onChange={(e) => onUpdateSettings({ dynamicPricingEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Security Standard */}
          <div className="pt-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4 text-teal-400" />
              Norme de Chiffrement des Transactions :
            </label>
            <select
              value={settings.encryptionStandard}
              onChange={(e) => onUpdateSettings({ encryptionStandard: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="AES-256-GCM">AES-256-GCM (Standard Bancaire International)</option>
              <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (Haute Vitesse Mobile)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Enregistrer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
