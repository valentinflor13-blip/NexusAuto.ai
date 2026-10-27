import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeCustomerSentiment,
  computeGlobalSatisfaction,
} from './sentimentEngine';

test('analyzeCustomerSentiment identifies positive intent correctly', () => {
  const result = analyzeCustomerSentiment('Super, merci beaucoup ! Je valide mon accès tout de suite');
  assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
  assert.equal(result.polarity, 'positive');
});

test('analyzeCustomerSentiment detects price and hesitation objections', () => {
  const result = analyzeCustomerSentiment("C'est trop cher pour mon budget et j'ai peur de l'arnaque");
  assert.ok(result.score < 50, `Expected score < 50, got ${result.score}`);
  assert.ok(result.detectedEmotions.includes('Hésitation / Vigilance'));
});

test('computeGlobalSatisfaction aggregates scores and calculates CSAT accurately', () => {
  const scores = [85, 90, 95, 80, 45, 92];
  const metrics = computeGlobalSatisfaction(scores);
  assert.ok(metrics.satisfactionRate >= 80 && metrics.satisfactionRate <= 99.5);
  assert.ok(metrics.csatScore >= 4.0 && metrics.csatScore <= 5.0);
  assert.equal(metrics.totalInteractions, 6);
  assert.equal(metrics.trend, 'up');
});

test('computeGlobalSatisfaction handles empty array fallback gracefully', () => {
  const metrics = computeGlobalSatisfaction([]);
  assert.ok(metrics.satisfactionRate > 90);
  assert.equal(metrics.totalInteractions, 0);
});
