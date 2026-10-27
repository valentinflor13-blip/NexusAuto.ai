import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const digest = value => createHash('sha256').update(value).digest('hex');
export class CommerceError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function createCommerce({ config, store, stripe }) {
  function ownedOrder(id, buyerToken) {
    const order = store.byId(id);
    if (!buyerToken || !order || order.buyer_hash !== digest(buyerToken)) {
      throw new CommerceError(404, 'Commande introuvable dans ce navigateur.');
    }
    return order;
  }
  function validateSession(session, order) {
    if (session.id !== order.checkout_id || session.client_reference_id !== order.id ||
        session.metadata?.product_id !== order.product_id || session.metadata?.product_sha256 !== order.product_sha256 ||
        session.amount_total !== order.amount || session.currency !== order.currency ||
        session.livemode !== (order.mode === 'live') || session.mode !== 'payment') {
      throw new CommerceError(409, 'Le paiement ne correspond pas à la commande.');
    }
  }
  return {
    async checkout({ buyerToken, requestKey, acceptedTerms, immediateAccess }) {
      if (!config.available || !stripe) throw new CommerceError(503, 'Les ventes ne sont pas encore ouvertes.');
      if (acceptedTerms !== true || immediateAccess !== true) {
        throw new CommerceError(400, 'Les conditions et la demande d’accès immédiat doivent être acceptées.');
      }
      if (!/^[a-f0-9-]{36}$/i.test(requestKey || '') || !buyerToken) {
        throw new CommerceError(400, 'Requête de commande invalide.');
      }
      const order = store.reserve(digest(buyerToken), requestKey, config);
      if (order.status !== 'pending') throw new CommerceError(409, 'Cette commande a déjà été traitée.');
      if (order.checkout_url) return { orderId: order.id, url: order.checkout_url };
      const label = [...digest(order.id).slice(0, 8)].map(hex => String.fromCharCode(97 + parseInt(hex, 16))).join('');
      const session = await stripe.checkout.sessions.create({
        mode: 'payment', locale: 'fr', client_reference_id: order.id,
        integration_identifier: `nexusauto_${label}`,
        line_items: [{ quantity: 1, price_data: {
          currency: order.currency, unit_amount: order.amount,
          product_data: { name: config.product.name },
        } }],
        metadata: { product_id: order.product_id, product_sha256: order.product_sha256 },
        payment_intent_data: { metadata: { nexus_order_id: order.id } },
        success_url: `${config.origin}/commande?order=${order.id}`,
        cancel_url: `${config.origin}/?cancelled=1`,
      }, { idempotencyKey: `nexus-${order.id}` });
      if (!session.id || !session.url || new URL(session.url).origin !== 'https://checkout.stripe.com') {
        throw new CommerceError(502, 'Le paiement sécurisé est temporairement indisponible.');
      }
      store.attachCheckout(order.id, session);
      return { orderId: order.id, url: session.url };
    },
    async webhook(body, signature) {
      if (!stripe || !config.webhookSecret) throw new CommerceError(503, 'Webhook non configuré.');
      let event;
      try { event = stripe.webhooks.constructEvent(body, signature, config.webhookSecret); }
      catch { throw new CommerceError(400, 'Signature de paiement invalide.'); }
      const supported = ['checkout.session.completed', 'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed', 'checkout.session.expired', 'charge.refunded', 'charge.dispute.created'];
      if (!supported.includes(event.type)) return { received: true };
      const object = event.data.object;
      if (event.type.startsWith('charge.')) {
        const intentId = typeof object.payment_intent === 'string' ? object.payment_intent : object.payment_intent?.id;
        if (!intentId) return { received: true };
        const intent = await stripe.paymentIntents.retrieve(intentId);
        const order = store.byId(intent.metadata?.nexus_order_id || '');
        if (order) {
          const session = await stripe.checkout.sessions.retrieve(order.checkout_id);
          validateSession(session, order);
          store.applyEvent(event, order.id, 'revoked');
        }
        return { received: true };
      }
      const order = store.byCheckout(object.id);
      if (!order) {
        // A webhook can beat the response to session creation. Retry our own orders.
        if (store.byId(object.client_reference_id || '')) throw new CommerceError(503, 'Commande en cours de création.');
        return { received: true };
      }
      // Fetch authoritative state rather than trusting a potentially old event snapshot.
      const session = await stripe.checkout.sessions.retrieve(object.id);
      validateSession(session, order);
      const status = session.payment_status === 'paid' ? 'paid' :
        (event.type.endsWith('failed') || event.type.endsWith('expired') ? 'failed' : null);
      store.applyEvent(event, order.id, status);
      return { received: true };
    },
    status(id, buyerToken) {
      const order = ownedOrder(id, buyerToken);
      return { id: order.id, status: order.status, mode: order.mode,
        amount: order.amount, currency: order.currency, downloadable: order.status === 'paid' };
    },
    async download(id, buyerToken) {
      const order = ownedOrder(id, buyerToken);
      if (order.status !== 'paid') throw new CommerceError(403, 'Le paiement n’est pas confirmé ou l’accès a été retiré.');
      let bytes;
      try { bytes = await readFile(order.product_file); }
      catch { throw new CommerceError(503, 'Le document est temporairement indisponible. Contactez le support.'); }
      if (digest(bytes) !== order.product_sha256) throw new CommerceError(503, 'Le document doit être vérifié avant livraison.');
      return bytes;
    },
  };
}
