import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fixture } from './fixtures.mjs';

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
