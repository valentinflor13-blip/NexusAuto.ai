import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Sparkles,
  Bot,
  TrendingUp,
  Share2,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Zap,
} from 'lucide-react';

import { Header } from './components/Header';
import { KpiOverview } from './components/KpiOverview';
import { LiveTransactions } from './components/LiveTransactions';
import { ContentStudio } from './components/ContentStudio';
import { SupportAgent } from './components/SupportAgent';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { SocialAdsSync } from './components/SocialAdsSync';
import { SecurityVault } from './components/SecurityVault';
import { EmailAlertsModal } from './components/EmailAlertsModal';
import { AdminCustomizer } from './components/AdminCustomizer';

import {
  Transaction,
  calculateRevenueVelocity,
  generateTransactionHash,
  evaluatePerformanceAlert,
} from './utils/revenueEngine';
import { computeGlobalSatisfaction } from './utils/sentimentEngine';
import { generateExecutivePdfReport } from './utils/pdfGenerator';
import { Campaign, AdminSettings, GeneratedContent, AlertLog } from './types';

export default function App() {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'content' | 'support' | 'predictive' | 'campaigns' | 'security'
  >('dashboard');

  // Sentiment & Customer Satisfaction State
  const [interactionScores, setInteractionScores] = useState<number[]>([
    94, 88, 96, 76, 91, 95, 98, 85, 92, 97
  ]);
  const [recentSentimentEvents, setRecentSentimentEvents] = useState<
    Array<{ id: string; customer: string; snippet: string; score: number; label: string; time: string }>
  >([
    {
      id: 'sent-1',
      customer: 'Thomas D.',
      snippet: 'Prix élevé mais rassuré par la garantie 30j et coupon VIP',
      score: 89,
      label: 'Favorable au closing',
      time: 'Il y a 1 min',
    },
    {
      id: 'sent-2',
      customer: 'Claire M.',
      snippet: 'Question technique débutant, enthousiaste pour démarrer',
      score: 95,
      label: 'Très Enthousiaste',
      time: 'Il y a 4 min',
    },
  ]);

  const satisfactionMetrics = computeGlobalSatisfaction(interactionScores);

  const handleRecordSentiment = (
    score: number,
    customerName: string,
    snippet: string,
    label: string
  ) => {
    setInteractionScores((prev) => [score, ...prev.slice(0, 40)]);
    setRecentSentimentEvents((prev) => [
      {
        id: `sent-${Date.now()}`,
        customer: customerName,
        snippet,
        score,
        label,
        time: "À l'instant",
      },
      ...prev.slice(0, 6),
    ]);
  };

  // Simulation & Autopilot State
  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Admin Settings
  const [settings, setSettings] = useState<AdminSettings>({
    theme: 'obsidian',
    recipientEmail: 'valentin.flor13@gmail.com',
    minCvrAlertThreshold: 3.0,
    minRoasAlertThreshold: 2.5,
    surgeCvrAlertThreshold: 8.0,
    autoPilotMode: true,
    autoSyncSocialAds: true,
    dynamicPricingEnabled: true,
    encryptionStandard: 'AES-256-GCM',
  });

  // Financial & Operational Metrics
  const [totalRevenue, setTotalRevenue] = useState(14850);
  const [conversionRate, setConversionRate] = useState(4.35);
  const [supportResolutionRate, setSupportResolutionRate] = useState(99.4);
  const [totalOrders, setTotalOrders] = useState(153);

  // Alert Logs
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([
    {
      id: 'ALT-INITIAL-01',
      timestamp: 'Aujourd’hui à 10:14',
      type: 'SURGE_VIRAL',
      metric: 'Taux de Conversion (CVR)',
      currentValue: '5.1%',
      threshold: '4.0%',
      status: 'DELIVERED',
      emailSubject: '🚀 ALERTE RECORD : Pic de performance détecté (CVR à 5.1%)',
      emailHtml: `
        <div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #10b981;">Pic de Ventes Enregistré</h2>
          <p>Le taux de conversion a dépassé le seuil cible. Le budget TikTok Ads a été automatiquement augmenté de 25%.</p>
        </div>
      `,
    },
  ]);

  // Campaigns Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'c1',
      platform: 'TikTok',
      name: 'TikTok Viral - Secrets de Chef & Sauces Minutes',
      budgetPerDay: 50,
      spentToday: 35,
      revenueGenerated: 222,
      roas: 6.34,
      status: 'ACTIVE',
      targetAudience: '20-45 ans, Actifs en CDI, Amateurs de cuisine, Familles',
      creativeHook: 'Pourquoi les restos ne veulent PAS que tu saches faire cette sauce en 3 min...',
    },
    {
      id: 'c2',
      platform: 'Meta',
      name: 'Instagram Reels - Batch Cooking & Repas Express',
      budgetPerDay: 60,
      spentToday: 42,
      revenueGenerated: 259,
      roas: 6.16,
      status: 'ACTIVE',
      targetAudience: '25-50 ans, Actifs débordés, parents, amateurs de bons petits plats',
      creativeHook: 'Arrête de te demander quoi cuisiner le soir en rentrant fatigué du boulot.',
    },
    {
      id: 'c3',
      platform: 'Google',
      name: 'Google Ads - Guide Recettes et Astuces de Chef PDF',
      budgetPerDay: 40,
      spentToday: 28,
      revenueGenerated: 148,
      roas: 5.28,
      status: 'ACTIVE',
      targetAudience: 'Recherche : e-book recettes faciles chef restaurant',
      creativeHook: 'Guide Digital Officiel : Les Secrets de Chef à Domicile',
    },
    {
      id: 'c4',
      platform: 'X',
      name: 'X Ads - 50 Astuces d’un Restaurateur Pro',
      budgetPerDay: 25,
      spentToday: 15,
      revenueGenerated: 74,
      roas: 4.93,
      status: 'ACTIVE',
      targetAudience: 'Passionnés de gastronomie et foodies',
      creativeHook: '10 ans en restauration m’ont appris que 80% du goût est dans 3 sauces...',
    },
  ]);

  // Initial Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-8941',
      timestamp: Date.now() - 45 * 1000,
      customerName: 'Lucas Mercier',
      customerEmail: 'l***@gmail.com',
      productName: 'Pack Digital : 50 Secrets & Sauces de Chef',
      amount: 37,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'Apple Pay',
      hash: generateTransactionHash('tx-8941', 37, Date.now() - 45 * 1000),
      roasSource: 'TikTok Ads',
      personalizedDiscountApplied: 0,
    },
    {
      id: 'tx-8940',
      timestamp: Date.now() - 110 * 1000,
      customerName: 'Camille Roche',
      customerEmail: 'c***@outlook.fr',
      productName: 'Pack Digital : 50 Secrets de Chef (Code CHEF15)',
      amount: 31.45,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'Stripe',
      hash: generateTransactionHash('tx-8940', 31.45, Date.now() - 110 * 1000),
      roasSource: 'Support IA Closer (Remise -15%)',
      personalizedDiscountApplied: 15,
    },
    {
      id: 'tx-8939',
      timestamp: Date.now() - 190 * 1000,
      customerName: 'Marc Vasseur',
      customerEmail: 'm***@yahoo.fr',
      productName: 'Kit Meal-Prep & Batch Cooking Hebdo',
      amount: 37,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'SEPA Instant',
      hash: generateTransactionHash('tx-8939', 37, Date.now() - 190 * 1000),
      roasSource: 'Meta Ads (Instagram)',
      personalizedDiscountApplied: 0,
    },
    {
      id: 'tx-8938',
      timestamp: Date.now() - 320 * 1000,
      customerName: 'Sarah Louvet',
      customerEmail: 's***@proton.me',
      productName: 'Pass VIP : Menus Minceur & Équilibre du Chef',
      amount: 47,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'Apple Pay',
      hash: generateTransactionHash('tx-8938', 47, Date.now() - 320 * 1000),
      roasSource: 'Google Ads',
      personalizedDiscountApplied: 0,
    },
  ]);

  // Calculate velocity
  const hourlyVelocity = calculateRevenueVelocity(transactions, 60);

  // Overall ROAS
  const totalCampaignSpent = campaigns.reduce((s, c) => s + c.spentToday, 0);
  const totalCampaignRev = campaigns.reduce((s, c) => s + c.revenueGenerated, 0);
  const overallRoas =
    totalCampaignSpent > 0 ? Math.round((totalCampaignRev / totalCampaignSpent) * 100) / 100 : 4.82;

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Trigger Instant Sale (Simulated direct checkout with instant encaissement)
  const handleTriggerInstantSale = () => {
    const names = [
      'Alexandre D.',
      'Sophie B.',
      'Maxime G.',
      'Claire F.',
      'Julien T.',
      'Nathalie L.',
      'Romain P.',
    ];
    const methods: Array<Transaction['paymentMethod']> = [
      'Apple Pay',
      'Stripe',
      'Crypto USDT',
      'SEPA Instant',
      'Google Pay',
    ];
    const products = [
      { name: 'Pack Business Autonome 2026', price: 97 },
      { name: 'Système IA Closer 24/7', price: 82 },
      { name: 'Licence Pro NexusRevenue', price: 149 },
      { name: 'Blueprint Scaling TikTok Ads', price: 47 },
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    const txId = `tx-${Date.now().toString().slice(-5)}`;
    const now = Date.now();

    const newTx: Transaction = {
      id: txId,
      timestamp: now,
      customerName: randomName,
      customerEmail: `${randomName.toLowerCase().charAt(0)}***@gmail.com`,
      productName: randomProduct.name,
      amount: randomProduct.price,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: randomMethod,
      hash: generateTransactionHash(txId, randomProduct.price, now),
      roasSource: 'Encaissement Express (Direct)',
      personalizedDiscountApplied: randomProduct.price === 82 ? 15 : 0,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTotalRevenue((prev) => prev + randomProduct.price);
    setTotalOrders((prev) => prev + 1);

    // Launch confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if unavailable
    }

    triggerToast(`Encaissement réussi : +${randomProduct.price} € (${randomName} via ${randomMethod})`);
  };

  // Autonomous Transaction Loop
  useEffect(() => {
    if (!autoPilot) return;

    // Interval inversely proportional to speed: 1x = 10s, 5x = 2.5s, 20x = 800ms
    const intervalMs = Math.max(600, Math.floor(10000 / speedMultiplier));

    const interval = setInterval(() => {
      const names = [
        'Édouard M.',
        'Laetitia R.',
        'Antoine V.',
        'Audrey C.',
        'Benoît B.',
        'Clémence K.',
        'Fabien D.',
      ];
      const products = [
        { name: 'Pack Business Autonome 2026', price: 97 },
        { name: 'Système IA Closer 24/7', price: 82 },
        { name: 'Licence Pro NexusRevenue', price: 149 },
        { name: 'Blueprint Scaling TikTok Ads', price: 47 },
      ];
      const methods: Array<Transaction['paymentMethod']> = [
        'Stripe',
        'Apple Pay',
        'Google Pay',
        'SEPA Instant',
        'Crypto USDT',
      ];
      const sources = ['TikTok Ads', 'Meta Ads', 'Support IA Closer', 'Google Ads PMax'];

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const txId = `tx-${Date.now().toString().slice(-5)}`;
      const now = Date.now();

      const newTx: Transaction = {
        id: txId,
        timestamp: now,
        customerName: randomName,
        customerEmail: `${randomName.toLowerCase().charAt(0)}***@mail.com`,
        productName: randomProduct.name,
        amount: randomProduct.price,
        currency: 'EUR',
        status: 'completed',
        paymentMethod: randomMethod,
        hash: generateTransactionHash(txId, randomProduct.price, now),
        roasSource: randomSource,
        personalizedDiscountApplied: randomProduct.price === 82 ? 15 : 0,
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 30)]);
      setTotalRevenue((prev) => prev + randomProduct.price);
      setTotalOrders((prev) => prev + 1);

      // Micro variation in conversion rate
      setConversionRate((prev) => {
        const delta = (Math.random() * 0.1 - 0.04);
        return Math.round((prev + delta) * 100) / 100;
      });

      // Update campaigns revenue dynamically
      setCampaigns((prev) =>
        prev.map((c) => {
          if (randomSource.includes(c.platform)) {
            const addedRev = randomProduct.price;
            const newRev = c.revenueGenerated + addedRev;
            const newRoas = Math.round((newRev / c.spentToday) * 100) / 100;
            return {
              ...c,
              revenueGenerated: newRev,
              roas: newRoas,
            };
          }
          return c;
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoPilot, speedMultiplier]);

  // Performance Alert Checker
  useEffect(() => {
    const alertResult = evaluatePerformanceAlert(conversionRate, overallRoas, {
      minCvr: settings.minCvrAlertThreshold,
      minRoas: settings.minRoasAlertThreshold,
      surgeCvr: settings.surgeCvrAlertThreshold,
    });

    if (alertResult.triggered && alertResult.alertType) {
      // Trigger notification if not recently triggered
      triggerToast(alertResult.message);
    }
  }, [conversionRate, overallRoas, settings]);

  // Export Executive PDF Report
  const handleExportPdf = () => {
    try {
      generateExecutivePdfReport({
        totalRevenue,
        hourlyVelocity,
        conversionRate,
        totalOrders,
        averageOrderValue: Math.round(totalRevenue / totalOrders) || 97,
        overallRoas,
        supportResolutionRate,
        transactions,
        campaigns: campaigns.map((c) => ({
          platform: c.platform,
          spend: c.spentToday,
          revenue: c.revenueGenerated,
          roas: c.roas,
          status: c.status,
        })),
        predictiveForecast: {
          projected24h: Math.round(totalRevenue * 0.15 + 1450),
          projected7d: Math.round(totalRevenue * 0.95 + 12800),
          elasticityNote:
            'Élasticité prix optimale à 97€. Le taux de conversion est maximisé avec remise VIP de 15% pour les hésitants.',
        },
      });
      triggerToast('Rapport PDF officiel généré et téléchargé avec succès !');
    } catch (err) {
      console.error('Failed to export PDF', err);
      triggerToast('Erreur lors de la génération du PDF.');
    }
  };

  // Sync Content to Ads Campaign
  const handleSyncContentToAds = (platform: string, content: GeneratedContent) => {
    setCampaigns((prev) => [
      {
        id: `c-${Date.now()}`,
        platform: platform as any,
        name: `${platform} Ads - ${content.headline}`,
        budgetPerDay: 120,
        spentToday: 0,
        revenueGenerated: 0,
        roas: parseFloat(content.simulatedRoasPotential) || 4.5,
        status: 'ACTIVE',
        targetAudience: content.audienceTargeting,
        creativeHook: content.hook,
      },
      ...prev,
    ]);
    triggerToast(`Campagne ${platform} synchronisée et diffusée avec succès !`);
  };

  // Campaign pause/play toggle
  const handleToggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : c))
    );
  };

  // Auto reallocate budget to highest ROAS
  const handleAutoReallocate = () => {
    setCampaigns((prev) => {
      const highestRoas = Math.max(...prev.map((c) => c.roas));
      return prev.map((c) => {
        if (c.roas === highestRoas) {
          return { ...c, budgetPerDay: c.budgetPerDay + 50 };
        }
        if (c.roas < 3.0) {
          return { ...c, budgetPerDay: Math.max(20, c.budgetPerDay - 30) };
        }
        return c;
      });
    });
    triggerToast('Budget réalloué automatiquement vers les régies les plus rentables !');
  };

  // Trigger Simulated Alert
  const handleTriggerSimulatedAlert = async (
    alertType: string,
    metric: string,
    currentVal: string,
    thresholdVal: string
  ): Promise<AlertLog | undefined> => {
    try {
      const response = await fetch('/api/alerts/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType,
          metric,
          currentValue: currentVal,
          thresholdValue: thresholdVal,
          recipient: settings.recipientEmail,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const newLog: AlertLog = {
          id: data.trackingId,
          timestamp: new Date(data.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          type: alertType,
          metric,
          currentValue: currentVal,
          threshold: thresholdVal,
          status: data.status,
          emailSubject: data.emailSubject,
          emailHtml: data.emailHtml,
        };
        setAlertLogs((prev) => [newLog, ...prev]);
        triggerToast(`Email d'alerte expédié à ${settings.recipientEmail}`);
        return newLog;
      }
    } catch (err) {
      console.error('Failed to trigger alert simulation', err);
    }
  };

  // Theme wrapper styling
  const themeClasses: Record<string, string> = {
    obsidian: 'bg-slate-950 text-slate-100',
    emerald: 'bg-[#041a14] text-emerald-50',
    navy: 'bg-[#020b18] text-sky-50',
    light: 'bg-slate-50 text-slate-900',
  };

  return (
    <div className={`min-h-screen ${themeClasses[settings.theme] || themeClasses.obsidian} flex flex-col font-sans transition-colors duration-200`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        autoPilot={autoPilot}
        onToggleAutoPilot={() => setAutoPilot((prev) => !prev)}
        speedMultiplier={speedMultiplier}
        onChangeSpeed={(s) => setSpeedMultiplier(s)}
        onTriggerInstantSale={handleTriggerInstantSale}
        onExportPdf={handleExportPdf}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        unreadAlertsCount={alertLogs.length}
        totalRevenue={totalRevenue}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6 flex-1">
        {/* KPI Strip */}
        <KpiOverview
          totalRevenue={totalRevenue}
          hourlyVelocity={hourlyVelocity}
          conversionRate={conversionRate}
          overallRoas={overallRoas}
          supportResolutionRate={supportResolutionRate}
          totalOrders={totalOrders}
          isTurboActive={speedMultiplier === 20}
          satisfactionRate={satisfactionMetrics.satisfactionRate}
        />

        {/* Plain-Language Business Model Banner for CDI Extra Income */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💼</span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  Votre Business Digital Automatique — Revenu Complémentaire CDI
                </h2>
                <p className="text-xs text-slate-400">
                  Créé pour les salariés occupés : zéro stock physique, zéro colis à expédier, 100% automatisé par l'IA.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
              95% de Marge Nette
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                <span>1. Ce que vous vendez</span>
              </div>
              <div className="text-slate-200 font-semibold">Pack Digital & Recettes de Chef</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vendu <strong>37 €</strong>. Le client reçoit son guide en PDF immédiatement après paiement. Coût de fabrication : 0 €.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                <span>2. Ce que fait l'IA pendant votre service</span>
              </div>
              <div className="text-slate-200 font-semibold">Attraction & Vente 24/7</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Elle crée les posts viraux TikTok, répond aux questions des acheteurs jour et nuit et applique les garanties.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                <span>3. Vos gains complémentaires</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm">+2 220 € / mois</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sur la base de seulement <strong>2 ventes par jour</strong> à 37 €, sans quitter votre poste actuel.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: 'dashboard', label: 'Vue Globale & Encaissement', icon: LayoutDashboard },
            { id: 'content', label: 'Studio Contenu & IA', icon: Sparkles },
            { id: 'support', label: 'Support Client & Closer 24/7', icon: Bot },
            { id: 'predictive', label: 'Analyse Prédictive & ML', icon: TrendingUp },
            { id: 'campaigns', label: 'Synchronisation Ads', icon: Share2 },
            { id: 'security', label: 'Sécurité & Vault Bancaire', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'dashboard' && (
            <LiveTransactions
              transactions={transactions}
              conversionRate={conversionRate}
              totalOrders={totalOrders}
              satisfactionMetrics={satisfactionMetrics}
              recentSentiments={recentSentimentEvents}
            />
          )}

          {activeTab === 'content' && (
            <ContentStudio onSyncAdsCampaign={handleSyncContentToAds} />
          )}

          {activeTab === 'support' && (
            <SupportAgent
              onRecordSentiment={handleRecordSentiment}
              onAutoCloseSale={(amount, customerName) => {
                const txId = `tx-${Date.now().toString().slice(-5)}`;
                const now = Date.now();
                const newTx: Transaction = {
                  id: txId,
                  timestamp: now,
                  customerName,
                  customerEmail: `${customerName.toLowerCase().charAt(0)}***@client.com`,
                  productName: 'Système IA Closer 24/7',
                  amount,
                  currency: 'EUR',
                  status: 'completed',
                  paymentMethod: 'Apple Pay',
                  hash: generateTransactionHash(txId, amount, now),
                  roasSource: 'Support IA Closer 24/7',
                  personalizedDiscountApplied: 15,
                };
                setTransactions((prev) => [newTx, ...prev]);
                setTotalRevenue((prev) => prev + amount);
                setTotalOrders((prev) => prev + 1);
                triggerToast(`Vente conclue en direct par le Closer IA : +${amount} € !`);
              }}
            />
          )}

          {activeTab === 'predictive' && (
            <PredictiveAnalytics
              currentCvr={conversionRate}
              totalRevenue={totalRevenue}
              overallRoas={overallRoas}
            />
          )}

          {activeTab === 'campaigns' && (
            <SocialAdsSync
              campaigns={campaigns}
              onToggleCampaign={handleToggleCampaign}
              onAutoReallocateBudget={handleAutoReallocate}
            />
          )}

          {activeTab === 'security' && <SecurityVault />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NexusAuto AI Business OS</span>
            <span>•</span>
            <span>Encaissement Autonome & Intelligence Prédictive</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              99.98% Disponibilité
            </span>
            <span>Chiffrement Bancaire AES-256</span>
            <span>RGPD & PCI-DSS Conforme</span>
          </div>
        </div>
      </footer>

      {/* Email Alerts Modal */}
      <EmailAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        recipientEmail={settings.recipientEmail}
        minCvrThreshold={settings.minCvrAlertThreshold}
        minRoasThreshold={settings.minRoasAlertThreshold}
        surgeCvrThreshold={settings.surgeCvrAlertThreshold}
        onSaveThresholds={(cvr, roas, surge) => {
          setSettings((prev) => ({
            ...prev,
            minCvrAlertThreshold: cvr,
            minRoasAlertThreshold: roas,
            surgeCvrAlertThreshold: surge,
          }));
          triggerToast('Seuils de surveillance email mis à jour avec succès');
        }}
        alertLogs={alertLogs}
        onTriggerSimulatedAlert={handleTriggerSimulatedAlert}
      />

      {/* Admin Customizer Drawer/Modal */}
      <AdminCustomizer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => {
          setSettings((prev) => ({ ...prev, ...newVals }));
        }}
        onResetDefaults={() => {
          setSettings({
            theme: 'obsidian',
            recipientEmail: 'valentin.flor13@gmail.com',
            minCvrAlertThreshold: 3.0,
            minRoasAlertThreshold: 2.5,
            surgeCvrAlertThreshold: 8.0,
            autoPilotMode: true,
            autoSyncSocialAds: true,
            dynamicPricingEnabled: true,
            encryptionStandard: 'AES-256-GCM',
          });
          triggerToast('Paramètres administrateur réinitialisés');
        }}
      />
    </div>
  );
}
