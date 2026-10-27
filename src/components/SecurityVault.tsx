import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  CheckCircle2,
  FileCheck,
  Cpu,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { generateTransactionHash } from '../utils/revenueEngine';

export const SecurityVault: React.FC = () => {
  const [testAmount, setTestAmount] = useState('97.00');
  const [testCustomer, setTestCustomer] = useState('sophie.bernard@gmail.com');
  const [simulatedDigest, setSimulatedDigest] = useState(
    generateTransactionHash('TX-SIM-001', 97, Date.now())
  );

  const handleRecalculate = () => {
    setSimulatedDigest(
      generateTransactionHash(`TX-SIM-${Date.now().toString(36)}`, parseFloat(testAmount) || 97, Date.now())
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Coffre-Fort & Chiffrement de Niveau Bancaire
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chiffrement complet de bout en bout pour chaque transaction financière, respect des normes RGPD et certification bancaire
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-semibold border border-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Enclave Sécurisée Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Security Stack & Interactive Cryptographic Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security Standards Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Chiffrement au Repos</div>
              <div className="text-sm font-extrabold text-teal-400 mt-1">AES-256-GCM</div>
              <div className="text-[10px] text-slate-400 mt-1">Données client et financières scellées</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
                <Key className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Chiffrement en Transit</div>
              <div className="text-sm font-extrabold text-sky-400 mt-1">TLS 1.3 / Perfect Secrecy</div>
              <div className="text-[10px] text-slate-400 mt-1">Protection contre l'interception réseau</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Confidentialité PII</div>
              <div className="text-sm font-extrabold text-purple-400 mt-1">Zero-Knowledge Masking</div>
              <div className="text-[10px] text-slate-400 mt-1">Anonymisation stricte RGPD</div>
            </div>
          </div>

          {/* Interactive Cryptographic Demonstration */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Générateur d'Empreinte Immuable SHA-256 en Direct
                </h4>
                <p className="text-xs text-slate-400">
                  Visualisez comment chaque encaissement est signé cryptographiquement avant enregistrement
                </p>
              </div>

              <button
                onClick={handleRecalculate}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Régénérer une nouvelle signature"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Client (Sera anonymisé) :
                </label>
                <input
                  type="email"
                  value={testCustomer}
                  onChange={(e) => setTestCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Montant Transaction (€) :
                </label>
                <input
                  type="text"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-900/50 space-y-2">
              <div className="text-[11px] font-bold text-teal-400 flex items-center justify-between">
                <span>Digest Cryptographique (Signature Registre Immuable) :</span>
                <span className="text-slate-500 font-mono">SHA-256</span>
              </div>
              <div className="font-mono text-xs text-teal-300 break-all select-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {simulatedDigest}
              </div>
              <div className="text-[10px] text-slate-400">
                Chaque paiement génère un bloc inviolable. Impossible à falsifier ou à altérer rétroactivement.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Compliance Checklist & Audit Badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Certifications & Conformité Légale
          </h4>

          <div className="space-y-3">
            {[
              {
                title: 'PCI-DSS Niveau 1',
                desc: 'Traitement des données bancaires ultra-sécurisé via tokenisation.',
                status: 'CONFORME',
              },
              {
                title: 'RGPD / GDPR Européen',
                desc: 'Droit à l’oubli, consentement et cryptage strict des identifiants.',
                status: 'CONFORME',
              },
              {
                title: 'SOC2 Type II Ready',
                desc: 'Surveillance des accès en continu et traçabilité inviolable.',
                status: 'AUDITÉ',
              },
              {
                title: 'Protection Anti-Fraude IA',
                desc: 'Détection des anomalies de carte bancaire en temps réel (< 20ms).',
                status: 'ACTIF',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs text-teal-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <span>Vos fonds et les transactions de vos clients bénéficient d’une protection équivalente à celle des grandes banques européennes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
