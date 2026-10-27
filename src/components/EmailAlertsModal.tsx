import React, { useState } from 'react';
import {
  Bell,
  Mail,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Send,
  Shield,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AlertLog } from '../types';

interface EmailAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  minCvrThreshold: number;
  minRoasThreshold: number;
  surgeCvrThreshold: number;
  onSaveThresholds: (cvr: number, roas: number, surge: number) => void;
  alertLogs: AlertLog[];
  onTriggerSimulatedAlert: (alertType: string, metric: string, currentVal: string, thresholdVal: string) => Promise<AlertLog | undefined>;
}

export const EmailAlertsModal: React.FC<EmailAlertsModalProps> = ({
  isOpen,
  onClose,
  recipientEmail,
  minCvrThreshold,
  minRoasThreshold,
  surgeCvrThreshold,
  onSaveThresholds,
  alertLogs,
  onTriggerSimulatedAlert,
}) => {
  const [cvrInput, setCvrInput] = useState(minCvrThreshold.toString());
  const [roasInput, setRoasInput] = useState(minRoasThreshold.toString());
  const [surgeInput, setSurgeInput] = useState(surgeCvrThreshold.toString());
  const [sending, setSending] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AlertLog | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(parseFloat(cvrInput) || 3.0, parseFloat(roasInput) || 2.5, parseFloat(surgeInput) || 8.0);
  };

  const handleTestAlert = async (type: string) => {
    setSending(true);
    let log: AlertLog | undefined;
    if (type === 'DROP_CVR') {
      log = await onTriggerSimulatedAlert('DROP_CVR', 'Taux de Conversion (CVR)', '2.1%', `${cvrInput}%`);
    } else if (type === 'DROP_ROAS') {
      log = await onTriggerSimulatedAlert('DROP_ROAS', 'ROAS Publicitaire Omnicanal', '2.1x', `${roasInput}x`);
    } else {
      log = await onTriggerSimulatedAlert('SURGE_VIRAL', 'Pic de Conversion Viral', '8.9%', `${surgeInput}%`);
    }
    setSending(false);
    if (log) {
      setSelectedLog(log);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Système de Notifications & Alertes Email Automatiques
              </h3>
              <p className="text-xs text-slate-400">
                Alerte immédiate en cas de variation brusque de performance ou d'anomalie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
          {/* Target Recipient Banner */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Email destinataire vérifié :</span>
              <strong className="text-white font-mono">{recipientEmail}</strong>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              SYNCHRONISÉ
            </span>
          </div>

          {/* Form: Thresholds */}
          <form onSubmit={handleSave} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white mb-2">
              Seuils de Déclenchement Automatique :
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Alerte si CVR &lt;
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={cvrInput}
                    onChange={(e) => setCvrInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-slate-500">%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Alerte si ROAS &lt;
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={roasInput}
                    onChange={(e) => setRoasInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-slate-500">x</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Pic Viral si CVR &ge;
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={surgeInput}
                    onChange={(e) => setSurgeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-slate-500">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
              >
                Mettre à jour les seuils
              </button>
            </div>
          </form>

          {/* Test Buttons */}
          <div>
            <div className="text-xs font-bold text-white mb-2">
              Simuler l'Envoi d'un Email d'Alerte :
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTestAlert('DROP_CVR')}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition-all"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Tester Alerte Baisse CVR</span>
              </button>

              <button
                onClick={() => handleTestAlert('DROP_ROAS')}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tester Alerte Chute ROAS</span>
              </button>

              <button
                onClick={() => handleTestAlert('SURGE_VIRAL')}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tester Alerte Pic de Ventes</span>
              </button>
            </div>
          </div>

          {/* Alert Logs */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white">Journal des Alertes Envoyées :</div>
            {alertLogs.length === 0 ? (
              <div className="text-slate-500 italic p-3 text-center bg-slate-950 rounded-xl">
                Aucune alerte critique récente. Les métriques sont stables.
              </div>
            ) : (
              <div className="space-y-2">
                {alertLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{log.emailSubject}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {log.timestamp} • Envoyé à {recipientEmail} • Réf: {log.id}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                      REÇU
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Aperçu du Mail Reçu</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 max-h-[360px] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: selectedLog.emailHtml }}
                className="rounded-xl overflow-hidden"
              />
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Fermer l'aperçu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
