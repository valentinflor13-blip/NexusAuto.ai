/**
 * Logic and math algorithms for autonomous revenue velocity, 
 * dynamic pricing elasticity, and conversion predictive modeling.
 */

export interface Transaction {
  id: string;
  timestamp: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'processing' | 'refunded';
  paymentMethod: 'Stripe' | 'Apple Pay' | 'Crypto USDT' | 'SEPA Instant' | 'Google Pay';
  hash: string;
  roasSource: string;
  personalizedDiscountApplied: number; // percentage
}

export interface MetricSnapshot {
  totalRevenue: number;
  hourlyVelocity: number;
  conversionRate: number; // percentage e.g. 4.65
  totalOrders: number;
  activeVisitors: number;
  aiSupportHandledRate: number; // percentage e.g. 99.2
  averageOrderValue: number;
  overallRoas: number;
}

/**
 * Calculates current hourly revenue velocity based on recent transactions.
 */
export function calculateRevenueVelocity(
  recentTransactions: Array<{ amount: number; timestamp: number }>,
  windowMinutes: number = 60
): number {
  if (!recentTransactions.length) return 0;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const cutoff = now - windowMs;

  const validTx = recentTransactions.filter((tx) => tx.timestamp >= cutoff);
  const totalInWindow = validTx.reduce((sum, tx) => sum + tx.amount, 0);

  if (windowMinutes <= 0) return 0;
  // Extrapolate to 1 hour
  const hourlyRate = (totalInWindow / windowMinutes) * 60;
  return Math.round(hourlyRate * 100) / 100;
}

/**
 * Predicts the optimal price point based on elasticity curve to maximize total expected revenue.
 * Formula: Expected Revenue(P) = BaseDemand * (1 - elasticity * ((P - BasePrice) / BasePrice)) * P
 */
export function calculateOptimalPrice(
  basePrice: number,
  baseDemand: number,
  elasticity: number = 1.25,
  minPrice: number = 29,
  maxPrice: number = 199
): { optimalPrice: number; expectedRevenue: number; projectedConversionRate: number } {
  let bestPrice = basePrice;
  let maxRevenue = 0;
  let bestCvr = 0;

  for (let p = Math.max(minPrice, 10); p <= maxPrice; p += 5) {
    const priceDeltaRatio = (p - basePrice) / basePrice;
    const demandMultiplier = Math.max(0.1, 1 - elasticity * priceDeltaRatio);
    const projectedDemand = baseDemand * demandMultiplier;
    const revenue = projectedDemand * p;
    const projectedCvr = Math.min(15, Math.max(0.5, (projectedDemand / (baseDemand * 20)) * 100));

    if (revenue > maxRevenue) {
      maxRevenue = revenue;
      bestPrice = p;
      bestCvr = Math.round(projectedCvr * 10) / 10;
    }
  }

  return {
    optimalPrice: bestPrice,
    expectedRevenue: Math.round(maxRevenue),
    projectedConversionRate: bestCvr,
  };
}

/**
 * Simulates SHA-256 cryptographic transaction signature for audit logs.
 */
export function generateTransactionHash(txId: string, amount: number, timestamp: number): string {
  const seed = `${txId}-${amount}-${timestamp}-nexus-vault-enc256`;
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  const hex = h.toString(16).padStart(8, '0');
  let hexSeed = '';
  for (let i = 0; i < seed.length && hexSeed.length < 32; i++) {
    hexSeed += seed.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return `0x${hex}${hexSeed}`;
}

/**
 * Analyzes performance drop or surge compared to set thresholds.
 */
export function evaluatePerformanceAlert(
  currentCvr: number,
  currentRoas: number,
  thresholds: { minCvr: number; minRoas: number; surgeCvr: number }
): { triggered: boolean; alertType: 'DROP_CVR' | 'DROP_ROAS' | 'SURGE_VIRAL' | null; message: string } {
  if (currentCvr < thresholds.minCvr) {
    return {
      triggered: true,
      alertType: 'DROP_CVR',
      message: `Alerte Critique : Taux de conversion à ${currentCvr}% (inférieur au seuil min de ${thresholds.minCvr}%)`,
    };
  }
  if (currentRoas < thresholds.minRoas) {
    return {
      triggered: true,
      alertType: 'DROP_ROAS',
      message: `Alerte Rentabilité : ROAS Publicitaire à ${currentRoas}x (inférieur au seuil min de ${thresholds.minRoas}x)`,
    };
  }
  if (currentCvr >= thresholds.surgeCvr) {
    return {
      triggered: true,
      alertType: 'SURGE_VIRAL',
      message: `Pic de Performance Détecté : Conversion record à ${currentCvr}% ! Allocation budget boostée.`,
    };
  }

  return {
    triggered: false,
    alertType: null,
    message: 'Tous les indicateurs de performance sont optimaux.',
  };
}
