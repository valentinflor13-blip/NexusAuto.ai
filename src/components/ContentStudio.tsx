import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Send,
  Calendar,
  Layers,
  Flame,
  TrendingUp,
  RefreshCw,
  Video,
} from 'lucide-react';
import { GeneratedContent } from '../types';

interface ContentStudioProps {
  onSyncAdsCampaign: (platform: string, content: GeneratedContent) => void;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({ onSyncAdsCampaign }) => {
  const [platform, setPlatform] = useState<'TikTok' | 'Meta' | 'X' | 'LinkedIn'>('TikTok');
  const [niche, setNiche] = useState('Secrets de Chef & Cuisine Rapide pour Actifs');
  const [tone, setTone] = useState('Urgent, viral et ultra-persuasif');
  const [offerName, setOfferName] = useState('Pack Digital : 50 Secrets & Sauces de Chef en 15 Min');
  const [price, setPrice] = useState('37');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [synced, setSynced] = useState(false);

  const [currentContent, setCurrentContent] = useState<GeneratedContent>({
    headline: "Secret de Restaurateur : Mange comme au resto pour 3,50€/repas",
    hook: "Pourquoi les restos ne veulent PAS que tu saches comment faire cette sauce en 3 minutes 🤫",
    body: `En tant que gérant de restaurant, je vois trop de gens dépenser 20€ en livraison pour des plats décevants.
Avec ce guide digital complet, découvre mes 50 sauces signatures prêtes en 15 minutes et mon plan de batch cooking pour préparer tous tes repas de la semaine en 2h.
Accès immédiat sur ton smartphone, liste de courses optimisée incluse, 100% garanti satisfait ou remboursé sous 30 jours.`,
    callToAction: "Clique sur le lien en bio pour télécharger ton accès instantané à 37€ (Places limitées) ⚡",
    hashtags: ['#RecetteFacile', '#MealPrep', '#SecretDeChef', '#CuisineMaison', '#BatchCooking'],
    estimatedViralityScore: 97,
    simulatedRoasPotential: '5.8x',
    audienceTargeting: '20-45 ans, Actifs en CDI, Passionnés de bonne bouffe, Étudiants & Familles',
  });

  const [scheduledQueue, setScheduledQueue] = useState([
    {
      id: 'q1',
      platform: 'TikTok',
      hook: "Pourquoi les restos ne veulent PAS que tu saches faire cette sauce en 3 min...",
      time: "Aujourd'hui à 18:30",
      status: 'PRÊT POUR DIFFUSION',
    },
    {
      id: 'q2',
      platform: 'Meta',
      hook: "Arrête de te demander quoi cuisiner le soir en rentrant fatigué du boulot.",
      time: "Aujourd'hui à 20:00",
      status: 'PLANIFIÉ',
    },
    {
      id: 'q3',
      platform: 'LinkedIn',
      hook: "Comment optimiser sa pause déjeuner et son énergie quand on travaille 50h/semaine",
      time: "Demain à 08:45",
      status: 'PLANIFIÉ',
    },
  ]);

  const handleGenerate = async () => {
    setLoading(true);
    setSynced(false);
    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          niche,
          tone,
          offerName,
          price,
          goal: 'Encaissement rapide & conversion immédiate',
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCurrentContent(data.data);
      }
    } catch (err) {
      console.error('Failed to generate AI content', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `${currentContent.hook}\n\n${currentContent.body}\n\n${currentContent.callToAction}\n\n${currentContent.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    setSynced(true);
    onSyncAdsCampaign(platform, currentContent);
    // Add to scheduled queue
    setScheduledQueue((prev) => [
      {
        id: `q-${Date.now()}`,
        platform,
        hook: currentContent.hook,
        time: 'Synchronisation immédiate',
        status: 'EN COURS DE DIFFUSION',
      },
      ...prev.slice(0, 4),
    ]);
    setTimeout(() => setSynced(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Studio de Génération & Synchronisation de Contenu IA
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Production automatisée de hooks viraux, copy publicitaires et diffusion synchronisée sur les régies publicitaires majeures
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Génération IA en cours...' : 'Générer Nouveau Contenu'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Configuration Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Paramètres de Campagne & Cible
          </h4>

          {/* Platform Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Plateforme Cible :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['TikTok', 'Meta', 'X', 'LinkedIn'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    platform === p
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p === 'Meta' ? 'Meta (Insta & FB)' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Offer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nom de l'Offre / Produit :
            </label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Prix de Vente (€) :
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tonalité & Angle Psychologique :
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Urgent, viral et ultra-persuasif">Urgent, viral et ultra-persuasif (Conversion rapide)</option>
              <option value="Preuve sociale, autorité et résultats concrets">Preuve sociale & Autorité (High Ticket)</option>
              <option value="Storytelling émotionnel & Déclic financier">Storytelling & Déclic financier</option>
              <option value="Contrariant & Rupture de pattern">Contrariant & Rupture de pattern (Stop scroll)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Régénérer avec Gemini 3.8
            </button>
          </div>
        </div>

        {/* Center Col: Generated Creative & Post Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h4 className="text-sm font-bold text-white">Contenu Généré pour {platform}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-all"
                title="Copier le contenu"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copié !' : 'Copier'}</span>
              </button>

              <button
                onClick={handleSync}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  synced
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
                title="Synchroniser directement avec les campagnes publicitaires"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{synced ? 'Synchronisé !' : 'Sync Ads'}</span>
              </button>
            </div>
          </div>

          {/* Hook card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Hook Accrocheur (0-2s)
              </span>
              <span className="text-slate-400 font-mono">Score : {currentContent.estimatedViralityScore}/100</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug">
              "{currentContent.hook}"
            </p>
          </div>

          {/* Body */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Script / Copy Principal :
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {currentContent.body}
            </p>
          </div>

          {/* Call to action & Tags */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Appel à l'action (CTA) :
            </div>
            <div className="text-xs font-semibold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              {currentContent.callToAction}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentContent.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-emerald-300 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Syndication Queue & Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                File de Publication Autonome
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                Auto-Pilote
              </span>
            </div>

            <div className="space-y-3">
              {scheduledQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {item.platform}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{item.hook}"
                  </p>
                  <div className="text-[10px] font-semibold text-emerald-400">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Potentiel ROAS calculé par l'IA :</div>
            <div className="text-lg font-black text-emerald-400">
              {currentContent.simulatedRoasPotential}
            </div>
            <div className="text-[10px] text-slate-500">
              Audience ciblée : {currentContent.audienceTargeting}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
