import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../commerce/config.mjs';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

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

test('an approved sandbox offer opens only with the exact private PDF and complete settings', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'nexus-config-'));
  try {
    const file = path.join(directory, 'test-only.pdf');
    const bytes = Buffer.from('%PDF-1.7\nLOCAL TEST FIXTURE ONLY');
    writeFileSync(file, bytes);
    const env = { CHECKOUT_ENABLED: 'true', OFFER_APPROVED: 'true', APP_URL: 'http://localhost:3000',
      STRIPE_API_KEY: 'rk_test_local_fixture', STRIPE_WEBHOOK_SECRET: 'whsec_local_fixture',
      ADMIN_TOKEN: 'a'.repeat(64), SUPPORT_EMAIL: 'support@example.invalid', SELLER_NAME: 'Test seller',
      TERMS_URL: 'https://example.invalid/terms', PRIVACY_URL: 'https://example.invalid/privacy', TERMS_VERSION: 'test-v1',
      PRODUCT_PDF_PATH: file, PRODUCT_SHA256: createHash('sha256').update(bytes).digest('hex') };
    assert.equal(readConfig(env).available, true);
    assert.equal(readConfig({ ...env, OFFER_APPROVED: 'false' }).available, false);
    assert.equal(readConfig({ ...env, PRODUCT_SHA256: '0'.repeat(64) }).available, false);
    assert.equal(readConfig({ ...env, STRIPE_API_KEY: 'rk_live_local_fixture' }).available, false);
    assert.equal(readConfig({ ...env, APP_URL: 'https://example.invalid/path' }).available, false);
  } finally { rmSync(directory, { recursive: true }); }
});
