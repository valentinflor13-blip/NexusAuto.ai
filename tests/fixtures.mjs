import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { openStore } from '../commerce/store.mjs';
import { createCommerce, digest } from '../commerce/service.mjs';

export function fixture() {
  const directory = mkdtempSync(path.join(tmpdir(), 'nexus-service-'));
  const file = path.join(directory, 'test-only.pdf');
  const bytes = Buffer.from('%PDF-1.7\nTEST FIXTURE — NOT A PRODUCT');
  writeFileSync(file, bytes);
  const config = { available: true, adminToken: 'admin-fixture-'.repeat(4), origin: 'http://localhost:3000', mode: 'test', webhookSecret: 'whsec_local_fixture',
    termsVersion: 'v1', product: { id: 'pack', name: 'Test pack', amount: 3700, currency: 'eur', file, sha256: digest(bytes) } };
  const store = openStore(':memory:');
  const sessions = new Map();
  const client = new Stripe('rk_test_local_fixture');
  let createCalls = 0;
  const stripe = {
    webhooks: client.webhooks,
    checkout: { sessions: {
      async create(params, options) {
        createCalls++;
        const id = `cs_test_${params.client_reference_id}`;
        const session = { id, url: `https://checkout.stripe.com/c/pay/${id}`, client_reference_id: params.client_reference_id,
          metadata: params.metadata, mode: params.mode, livemode: false, amount_total: params.line_items[0].price_data.unit_amount,
          currency: params.line_items[0].price_data.currency, payment_status: 'unpaid', params, options };
        sessions.set(id, session);
        return session;
      },
      async retrieve(id) { return sessions.get(id); },
    } },
    paymentIntents: { async retrieve() { return { metadata: { nexus_order_id: [...sessions.values()][0]?.client_reference_id } }; } },
  };
  const service = createCommerce({ config, store, stripe });
  const buyerToken = 'a'.repeat(64);
  const input = { buyerToken, requestKey: randomUUID(), acceptedTerms: true, immediateAccess: true };
  async function event(orderId, type, overrides = {}) {
    const order = store.byId(orderId);
    const object = type.startsWith('charge.') ? { payment_intent: 'pi_test' } : sessions.get(order.checkout_id);
    const payload = JSON.stringify({ id: randomUUID(), type, data: { object }, ...overrides });
    const signature = client.webhooks.generateTestHeaderString({ payload, secret: config.webhookSecret });
    return service.webhook(Buffer.from(payload), signature);
  }
  return { config, store, service, stripe, sessions, input, bytes, event, file,
    get createCalls() { return createCalls; },
    cleanup() { store.close(); rmSync(directory, { recursive: true }); } };
}
