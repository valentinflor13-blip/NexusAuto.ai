import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { createApp } from '../commerce/app.mjs';
import { fixture } from './fixtures.mjs';

async function httpFixture() {
  const f = fixture();
  const server = createApp(f).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (route, options) => fetch(base + route, options);
  return { ...f, request, async close() { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); f.cleanup(); } };
}

test('HTTP checkout rejects cross-origin requests and hides unpaid files and private data', async () => {
  const f = await httpFixture();
  try {
    const headers = { 'Content-Type': 'application/json', Origin: f.config.origin, 'Idempotency-Key': randomUUID() };
    const body = JSON.stringify({ acceptedTerms: true, immediateAccess: true, amount: 1 });
    const forbidden = await f.request('/api/checkout', { method: 'POST', headers: { ...headers, Origin: 'https://other.invalid' }, body });
    assert.equal(forbidden.status, 403);
    const response = await f.request('/api/checkout', { method: 'POST', headers, body });
    assert.equal(response.status, 200);
    const cookieHeader = response.headers.get('set-cookie');
    assert.match(cookieHeader, /HttpOnly/);
    assert.match(cookieHeader, /SameSite=Lax/);
    const cookie = cookieHeader.split(';')[0];
    const order = await response.json();
    assert.equal((await f.request(`/api/orders/${order.orderId}`)).status, 404);
    const statusResponse = await f.request(`/api/orders/${order.orderId}`, { headers: { Cookie: cookie } });
    const status = await statusResponse.json();
    assert.equal(status.status, 'pending');
    assert.equal(status.amount, 3700);
    assert.equal(status.buyer_hash, undefined);
    assert.equal(status.product_file, undefined);
    assert.equal((await f.request(`/api/orders/${order.orderId}/download`, { headers: { Cookie: cookie } })).status, 403);
    assert.equal((await f.request('/api/admin/summary')).status, 401);
    const summary = await f.request('/api/admin/summary', { headers: { Authorization: `Bearer ${f.config.adminToken}` } });
    assert.equal((await summary.json()).paidOrders, 0);
  } finally { await f.close(); }
});

test('HTTP raw-body signature checks gate the actual PDF response', async () => {
  const f = await httpFixture();
  try {
    const order = await f.service.checkout(f.input);
    const session = [...f.sessions.values()][0];
    session.payment_status = 'paid';
    const payload = JSON.stringify({ id: randomUUID(), type: 'checkout.session.completed', data: { object: session } });
    const client = new Stripe('rk_test_local_fixture');
    const signature = client.webhooks.generateTestHeaderString({ payload, secret: f.config.webhookSecret });
    const invalid = await f.request('/api/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 'invalid' }, body: payload });
    assert.equal(invalid.status, 400);
    const response = await f.request('/api/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature }, body: payload });
    assert.equal(response.status, 200);
    const pdf = await f.request(`/api/orders/${order.orderId}/download`, { headers: { Cookie: `nexus_buyer=${f.input.buyerToken}` } });
    assert.equal(pdf.status, 200);
    assert.match(pdf.headers.get('content-type'), /application\/pdf/);
    assert.equal(pdf.headers.get('cache-control'), 'no-store');
    assert.deepEqual(Buffer.from(await pdf.arrayBuffer()), f.bytes);
    const retry = await f.request('/api/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature }, body: payload });
    assert.equal(retry.status, 200);
    assert.equal(f.store.summary('test').paidOrders, 1);
  } finally { await f.close(); }
});

test('HTTP limits repeated checkout attempts and removes historical fake endpoints', async () => {
  const f = await httpFixture();
  try {
    for (let i = 0; i < 10; i++) {
      const response = await f.request('/api/checkout', { method: 'POST', headers: { Origin: f.config.origin, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(response.status, 400);
    }
    assert.equal((await f.request('/api/checkout', { method: 'POST' })).status, 429);
    assert.equal((await f.request('/api/alerts/simulate', { method: 'POST' })).status, 404);
    assert.equal((await f.request('/api/ai/content', { method: 'POST' })).status, 404);
  } finally { await f.close(); }
});
