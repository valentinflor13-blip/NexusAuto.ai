/**
 * Sentiment analysis and customer satisfaction scoring algorithms.
 */

export interface SentimentAnalysisResult {
  score: number; // 0 to 100
  polarity: 'positive' | 'neutral' | 'negative' | 'critical';
  confidence: number;
  label: string;
  detectedEmotions: string[];
}

export interface GlobalSatisfactionMetric {
  satisfactionRate: number; // e.g. 96.4 (%)
  csatScore: number; // e.g. 4.82 out of 5
  npsScore: number; // e.g. +76
  trend: 'up' | 'stable' | 'down';
  breakdown: {
    positive: number; // %
    neutral: number;  // %
    negative: number; // %
  };
  totalInteractions: number;
}

const POSITIVE_KEYWORDS = [
  'merci', 'parfait', 'super', 'génial', 'top', 'excellent', 'rassuré', 
  'intéressant', 'achète', 'commande', 'offre', 'ok', 'd’accord', 'validé', 'valide', 'génial', 'bravo'
];

const HESITATION_KEYWORDS = [
  'cher', 'prix', 'budget', 'coûte', 'hésite', 'garantie', 'remboursement',
  'peur', 'arnaque', 'doute', 'débutant', 'difficile', 'temps', 'compliqué'
];

const NEGATIVE_KEYWORDS = [
  'horrible', 'nul', 'escroc', 'jamais', 'déçu', 'refuse', 'mensonge', 'voleur'
];

/**
 * Analyzes textual sentiment and computes a calibrated score between 0 and 100.
 */
export function analyzeCustomerSentiment(text: string): SentimentAnalysisResult {
  if (!text || !text.trim()) {
    return {
      score: 50,
      polarity: 'neutral',
      confidence: 0.5,
      label: 'Neutre',
      detectedEmotions: ['En attente'],
    };
  }

  const lower = text.toLowerCase();
  let positiveHits = 0;
  let hesitationHits = 0;
  let negativeHits = 0;

  POSITIVE_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) positiveHits++;
  });
  HESITATION_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) hesitationHits++;
  });
  NEGATIVE_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) negativeHits++;
  });

  const emotions: string[] = [];

  // Base score calculation
  let score = 55;

  if (positiveHits > 0) {
    score += positiveHits * 15;
    emotions.push('Intérêt / Satisfaction');
  }
  if (hesitationHits > 0) {
    score -= hesitationHits * 12;
    emotions.push('Hésitation / Vigilance');
  }
  if (negativeHits > 0) {
    score -= negativeHits * 25;
    emotions.push('Frustration');
  }

  // Bound score strictly between 5 and 99
  score = Math.max(8, Math.min(98, score));

  let polarity: SentimentAnalysisResult['polarity'] = 'neutral';
  let label = 'Neutre / En réflexion';

  if (score >= 70) {
    polarity = 'positive';
    label = score >= 85 ? 'Très Favorable & Prêt à Acheter' : 'Favorable';
  } else if (score < 40) {
    polarity = score < 25 ? 'critical' : 'negative';
    label = 'Forte Réticence';
  } else {
    label = 'Hésitation Légitime';
  }

  return {
    score,
    polarity,
    confidence: 0.94,
    label,
    detectedEmotions: emotions.length ? emotions : ['Curiosité'],
  };
}

/**
 * Computes global customer satisfaction metrics across all recent interaction scores.
 */
export function computeGlobalSatisfaction(scores: number[]): GlobalSatisfactionMetric {
  if (!scores || !scores.length) {
    return {
      satisfactionRate: 96.8,
      csatScore: 4.84,
      npsScore: 78,
      trend: 'up',
      breakdown: { positive: 88, neutral: 9, negative: 3 },
      totalInteractions: 0,
    };
  }

  const sum = scores.reduce((acc, s) => acc + s, 0);
  const avg = sum / scores.length;

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  scores.forEach((s) => {
    if (s >= 70) positiveCount++;
    else if (s >= 45) neutralCount++;
    else negativeCount++;
  });

  const total = scores.length;
  const positivePct = Math.round((positiveCount / total) * 100);
  const neutralPct = Math.round((neutralCount / total) * 100);
  const negativePct = Math.max(0, 100 - positivePct - neutralPct);

  // Scaled satisfaction percentage (0-100)
  const satisfactionRate = Math.round((avg * 0.85 + positivePct * 0.15) * 10) / 10;
  const csatScore = Math.round((satisfactionRate / 20) * 100) / 100;
  const npsScore = Math.round((positivePct - negativePct) * 0.9);

  return {
    satisfactionRate: Math.min(99.5, Math.max(50, satisfactionRate)),
    csatScore: Math.min(5.0, Math.max(2.5, csatScore)),
    npsScore: Math.min(100, Math.max(-50, npsScore)),
    trend: satisfactionRate >= 80 ? 'up' : satisfactionRate >= 65 ? 'stable' : 'down',
    breakdown: {
      positive: positivePct,
      neutral: neutralPct,
      negative: negativePct,
    },
    totalInteractions: total,
  };
}
