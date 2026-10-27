import React from 'react';
import {
  Heart,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';
import { GlobalSatisfactionMetric } from '../utils/sentimentEngine';

interface SatisfactionGaugeProps {
  metrics: GlobalSatisfactionMetric;
  recentSentiments?: Array<{
    id: string;
    customer: string;
    snippet: string;
    score: number;
    label: string;
    time: string;
  }>;
}

export const SatisfactionGauge: React.FC<SatisfactionGaugeProps> = ({
  metrics,
  recentSentiments = [],
}) => {
  const rate = metrics.satisfactionRate;
  
  // Calculate stroke dashoffset for semi-circle SVG (radius = 70, circumference = 2 * PI * 70 = 439.82, half = 220)
  const arcLength = 220;
  const strokeOffset = arcLength - (arcLength * Math.min(100, Math.max(0, rate))) / 100;

  // Determine sentiment state color
  const isOptimal = rate >= 85;
  const isModerate = rate >= 70 && rate < 85;
  const colorHex = isOptimal ? '#10b981' : isModerate ? '#f59e0b' : '#ef4444';
  const textClass = isOptimal ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
            Jauge de Satisfaction & Sentiment Client en Temps Réel
          </h3>
          <p className="text-xs text-slate-400">
            Évaluation continue des interactions avec l'agent IA Closer 24/7
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          LIVE SCORING
        </span>
      </div>

      {/* Main Gauge Graphic */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-3">
        {/* Semi-circular radial gauge */}
        <div className="relative w-44 h-28 flex items-center justify-center">
          <svg className="w-44 h-32 overflow-visible" viewBox="0 0 160 100">
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 20 85 A 60 60 0 0 1 140 85"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Active Progress Arc */}
            <path
              d="M 20 85 A 60 60 0 0 1 140 85"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="12"
              strokeDasharray="188.5"
              strokeDashoffset={188.5 - (188.5 * rate) / 100}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Value in the center */}
          <div className="absolute bottom-1 text-center">
            <div className={`text-2xl font-black ${textClass} tracking-tight`}>
              {rate}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Satisfaction Globale
            </div>
          </div>
        </div>

        {/* CSAT and NPS stats */}
        <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
            <div className="text-[10px] text-slate-400 font-medium">Score CSAT</div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {metrics.csatScore} <span className="text-xs text-slate-500">/ 5</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">Excellence</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
            <div className="text-[10px] text-slate-400 font-medium">NPS Prédictif</div>
            <div className="text-base font-extrabold text-teal-400 mt-0.5">
              +{metrics.npsScore}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Zone Ambassadeur</div>
          </div>
        </div>
      </div>

      {/* Breakdown Bar (Positive / Neutral / Negative) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Smile className="w-3.5 h-3.5" /> Favorable ({metrics.breakdown.positive}%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Meh className="w-3.5 h-3.5" /> Hésitations levées ({metrics.breakdown.neutral}%)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <Frown className="w-3.5 h-3.5" /> Réticence ({metrics.breakdown.negative}%)
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${metrics.breakdown.positive}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
          ></div>
          <div
            style={{ width: `${metrics.breakdown.neutral}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
          ></div>
          <div
            style={{ width: `${metrics.breakdown.negative}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
          ></div>
        </div>
      </div>

      {/* Recent Live Sentiment Ticker */}
      {recentSentiments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>Derniers Échanges Scorés en Direct :</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> IA Autonome
            </span>
          </div>

          <div className="space-y-1.5">
            {recentSentiments.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="truncate max-w-[220px]">
                  <span className="font-bold text-white mr-1.5">{item.customer} :</span>
                  <span className="text-slate-400 italic">"{item.snippet}"</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    item.score >= 70
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.score >= 45
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {item.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
