import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../commerce/config.mjs';

test('sales stay closed with no validated product or payment configuration', () => {
  const config = readConfig({});
  assert.equal(config.available, false);
  assert.equal(config.product.amount, 3700);
  assert.ok(config.issues.length >= 6);
});

test('live mode requires explicit authorization, HTTPS and persistent storage', () => {
  const config = readConfig({ PAYMENT_MODE: 'live', CHECKOUT_ENABLED: 'true' });
  assert.equal(config.available, false);
  assert.ok(config.issues.some(issue => issue.includes('HTTPS')));
  assert.ok(config.issues.some(issue => issue.includes('persistant')));
});
