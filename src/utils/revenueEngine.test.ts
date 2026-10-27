import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRevenueVelocity,
  calculateOptimalPrice,
  generateTransactionHash,
  evaluatePerformanceAlert,
} from './revenueEngine';

test('calculateRevenueVelocity computes correct hourly extrapolation', () => {
  const now = Date.now();
  const txs = [
    { amount: 50, timestamp: now - 10 * 1000 },
    { amount: 150, timestamp: now - 30 * 1000 },
  ];
  // 200 in 60-min window extrapolates directly
  const velocity = calculateRevenueVelocity(txs, 60);
  assert.equal(velocity, 200);

  // If empty transactions, velocity is 0
  assert.equal(calculateRevenueVelocity([]), 0);
});

test('calculateOptimalPrice determines maximum projected revenue within bounds', () => {
  const result = calculateOptimalPrice(97, 100, 1.2, 49, 149);
  assert.ok(result.optimalPrice >= 49 && result.optimalPrice <= 149);
  assert.ok(result.expectedRevenue > 0);
  assert.ok(result.projectedConversionRate > 0);
});

test('generateTransactionHash generates hexadecimal encrypted signature', () => {
  const hash = generateTransactionHash('tx-1234', 99, 1700000000000);
  assert.ok(hash.startsWith('0x'));
  assert.ok(hash.length >= 20);
});

test('evaluatePerformanceAlert flags drops and surges properly', () => {
  const thresholds = { minCvr: 3.0, minRoas: 2.5, surgeCvr: 8.0 };

  const lowCvrAlert = evaluatePerformanceAlert(2.1, 4.0, thresholds);
  assert.equal(lowCvrAlert.triggered, true);
  assert.equal(lowCvrAlert.alertType, 'DROP_CVR');

  const lowRoasAlert = evaluatePerformanceAlert(4.5, 1.8, thresholds);
  assert.equal(lowRoasAlert.triggered, true);
  assert.equal(lowRoasAlert.alertType, 'DROP_ROAS');

  const surgeAlert = evaluatePerformanceAlert(9.2, 5.0, thresholds);
  assert.equal(surgeAlert.triggered, true);
  assert.equal(surgeAlert.alertType, 'SURGE_VIRAL');

  const normalState = evaluatePerformanceAlert(4.2, 3.8, thresholds);
  assert.equal(normalState.triggered, false);
});
