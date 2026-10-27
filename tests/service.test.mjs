import test from 'node:test';
import assert from 'node:assert/strict';
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
  const config = { available: true, origin: 'http://localhost:3000', mode: 'test', webhookSecret: 'whsec_local_fixture',
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

test('fixed server price, consent and idempotency are enforced', async () => {
  const f = fixture();
  try {
    await assert.rejects(f.service.checkout({ ...f.input, acceptedTerms: false }), { status: 400 });
    const order = await f.service.checkout({ ...f.input, amount: 1 });
    assert.deepEqual(await f.service.checkout(f.input), order);
    assert.equal(f.createCalls, 1);
    const session = [...f.sessions.values()][0];
    assert.equal(session.amount_total, 3700);
    assert.equal(session.params.payment_method_types, undefined);
    assert.match(session.params.integration_identifier, /_[a-z]{8}$/);
    assert.equal(f.service.status(order.orderId, f.input.buyerToken).downloadable, false);
    await assert.rejects(f.service.download(order.orderId, f.input.buyerToken), { status: 403 });
    assert.throws(() => f.service.status(order.orderId, 'another-browser'), { status: 404 });
  } finally { f.cleanup(); }
});

test('only a verified paid webhook grants access, including delayed payments', async () => {
  const f = fixture();
  try {
    const order = await f.service.checkout(f.input);
    await assert.rejects(f.service.webhook(Buffer.from('{}'), 'forged'), { status: 400 });
    await f.event(order.orderId, 'checkout.session.completed');
    assert.equal(f.service.status(order.orderId, f.input.buyerToken).status, 'pending');
    [...f.sessions.values()][0].payment_status = 'paid';
    await f.event(order.orderId, 'checkout.session.async_payment_succeeded');
    assert.deepEqual(await f.service.download(order.orderId, f.input.buyerToken), f.bytes);
    assert.equal(f.store.summary('test').paidOrders, 1);
    assert.equal(f.store.summary('live').paidOrders, 0);
  } finally { f.cleanup(); }
});

test('wrong amount or mode never grants download and a modified product is refused', async () => {
  const f = fixture();
  try {
    const order = await f.service.checkout(f.input);
    const session = [...f.sessions.values()][0];
    session.payment_status = 'paid';
    session.amount_total = 1;
    await assert.rejects(f.event(order.orderId, 'checkout.session.completed'), { status: 409 });
    session.amount_total = 3700;
    session.livemode = true;
    await assert.rejects(f.event(order.orderId, 'checkout.session.completed'), { status: 409 });
    session.livemode = false;
    await f.event(order.orderId, 'checkout.session.completed');
    writeFileSync(f.file, 'changed');
    await assert.rejects(f.service.download(order.orderId, f.input.buyerToken), { status: 503 });
  } finally { f.cleanup(); }
});

test('refunds revoke download and a late payment notification cannot restore it', async () => {
  const f = fixture();
  try {
    const order = await f.service.checkout(f.input);
    [...f.sessions.values()][0].payment_status = 'paid';
    await f.event(order.orderId, 'checkout.session.completed');
    await f.event(order.orderId, 'charge.refunded');
    await f.event(order.orderId, 'checkout.session.async_payment_succeeded');
    assert.equal(f.service.status(order.orderId, f.input.buyerToken).status, 'revoked');
    await assert.rejects(f.service.download(order.orderId, f.input.buyerToken), { status: 403 });
  } finally { f.cleanup(); }
});
