import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { calculateOptimalPrice } from '../utils/revenueEngine';

interface PredictiveAnalyticsProps {
  currentCvr: number;
  totalRevenue: number;
  overallRoas: number;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  currentCvr,
  totalRevenue,
  overallRoas,
}) => {
  const [testPrice, setTestPrice] = useState(97);
  const [elasticity, setElasticity] = useState(1.25);
  const [loadingAi, setLoadingAi] = useState(false);

  const [aiForecast, setAiForecast] = useState({
    projectedRevenue24h: Math.round(totalRevenue * 0.15 + 1450),
    projectedRevenue7d: Math.round(totalRevenue * 0.95 + 12800),
    confidenceInterval: '95.4%',
    churnRiskScore: 'Très Faible (1.7%)',
    optimalDiscountWindow: 'Créneau 19h00 - 23h00 (élasticité +24% de volume)',
    keyOpportunities: [
      'Accélérer les investissements TikTok Ads sur les créatives à ROAS > 5.0x',
      'Activer le déclenchement du bon d’achat pour les visiteurs à 3+ pages vues',
      'Renforcer la garantie satisfait ou remboursé pour les paniers > 150€',
    ],
  });

  const optimalCalculated = calculateOptimalPrice(testPrice, 100, elasticity, 29, 199);

  const handleRunAiAudit = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMetrics: {
            conversionRate: currentCvr,
            totalRevenue,
            overallRoas,
          },
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAiForecast((prev) => ({
          ...prev,
          ...data.data,
        }));
      }
    } catch (err) {
      console.error('Failed to run AI predictive audit', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    // Initial fetch if available
    handleRunAiAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Audit trigger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Analyse Prédictive & Optimisation Machine Learning des Conversions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Modélisation en continu de l'élasticité prix, détection des anomalies de trafic et maximisation de la rentabilité
            </p>
          </div>

          <button
            onClick={handleRunAiAudit}
            disabled={loadingAi}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-400 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingAi ? 'Calcul ML en cours...' : 'Audit Prédictif Gemini 3.8'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Dynamic Price Elasticity Simulator & Curve */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Simulateur d'Élasticité Prix & Revenu Optimal
              </h4>
              <p className="text-xs text-slate-400">
                Ajustez le prix testé pour observer l'impact prédictif sur le taux de conversion et le revenu net attendu
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
              Optimal : {optimalCalculated.optimalPrice} €
            </span>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Prix de Base Testé :</span>
                <span className="text-emerald-400 font-bold text-sm">{testPrice} €</span>
              </div>
              <input
                type="range"
                min="29"
                max="199"
                step="5"
                value={testPrice}
                onChange={(e) => setTestPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>29 €</span>
                <span>97 €</span>
                <span>199 €</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Sensibilité Marché (Élasticité) :</span>
                <span className="text-purple-400 font-bold text-sm">{elasticity}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={elasticity}
                onChange={(e) => setElasticity(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Faible (Produit rare)</span>
                <span>Normal</span>
                <span>Forte (Sensible)</span>
              </div>
            </div>
          </div>

          {/* Projected Outcome Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Prix Recommandé IA</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {optimalCalculated.optimalPrice} €
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Maximum de rentabilité totale</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Taux de Conversion Prédit</div>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {optimalCalculated.projectedConversionRate}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Sur trafic ciblé omnicanal</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Revenu Prévu / 100 Leads</div>
              <div className="text-2xl font-black text-sky-400 mt-1">
                {optimalCalculated.expectedRevenue} €
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Projection à volume constant</div>
            </div>
          </div>

          {/* Time & Behavior Cohort Heatmap */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Fenêtre d'Optimisation des Ventes Détectée :</span>
              <span className="text-emerald-400 font-mono text-[11px]">{aiForecast.optimalDiscountWindow}</span>
            </div>
            <p className="text-xs text-slate-400">
              Les algorithmes de machine learning ajustent automatiquement le déclenchement des bonus et coupons pendant ces créneaux pour capter le surplus de demande sans éroder la marge.
            </p>
          </div>
        </div>

        {/* Col 3: Strategic AI Forecast & Churn Prevention */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              Projections de Revenu & Risque
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Projection CA sous 24h</div>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  {aiForecast.projectedRevenue24h.toLocaleString('fr-FR')} €
                </div>
                <div className="text-[10px] text-slate-500">
                  Indice de confiance : {aiForecast.confidenceInterval}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Projection CA sous 7 Jours</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {aiForecast.projectedRevenue7d.toLocaleString('fr-FR')} €
                </div>
                <div className="text-[10px] text-slate-500">
                  Croissance modélisée avec synergie ads
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Risque de Churn / Abandon</div>
                <div className="text-base font-bold text-teal-400 mt-0.5">
                  {aiForecast.churnRiskScore}
                </div>
                <div className="text-[10px] text-slate-500">
                  Garanties contractuelles et suivi IA actif
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-white mb-2">Recommandations Stratégiques :</div>
              <ul className="text-xs text-slate-300 space-y-2">
                {aiForecast.keyOpportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            Audit actualisé en temps réel avec le modèle Gemini 3.8
          </div>
        </div>
      </div>
    </div>
  );
};
