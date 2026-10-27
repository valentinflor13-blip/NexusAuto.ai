import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openStore } from '../commerce/store.mjs';

const config = { product: { id: 'pack', amount: 3700, currency: 'eur', file: '/private/pack.pdf', sha256: 'hash' },
  mode: 'test', termsVersion: 'v1' };

test('checkout reservation and payment event retries cannot duplicate revenue', () => {
  const store = openStore(':memory:');
  try {
    const order = store.reserve('buyer', 'request', config);
    assert.equal(store.reserve('buyer', 'request', config).id, order.id);
    const event = { id: 'evt_paid', type: 'checkout.session.completed' };
    assert.equal(store.applyEvent(event, order.id, 'paid'), true);
    assert.equal(store.applyEvent(event, order.id, 'paid'), false);
    assert.deepEqual({ ...store.summary('test') }, { paidOrders: 1, grossAmountCents: 3700 });
    assert.equal(store.summary('live').paidOrders, 0);
    store.applyEvent({ id: 'evt_refund', type: 'charge.refunded' }, order.id, 'revoked');
    store.applyEvent({ id: 'evt_late', type: 'checkout.session.completed' }, order.id, 'paid');
    assert.equal(store.byId(order.id).status, 'revoked');
  } finally { store.close(); }
});

test('orders survive a database close and restart', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'nexus-store-'));
  const filename = path.join(directory, 'orders.sqlite');
  try {
    let store = openStore(filename);
    const order = store.reserve('buyer', 'request', config);
    store.close();
    store = openStore(filename);
    assert.equal(store.byId(order.id).amount, 3700);
    store.close();
  } finally { rmSync(directory, { recursive: true }); }
});
