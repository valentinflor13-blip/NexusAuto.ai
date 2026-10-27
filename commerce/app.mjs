import express from 'express';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { CommerceError, createCommerce, digest } from './service.mjs';

function buyerToken(req) {
  return (req.headers.cookie || '').match(/(?:^|;\s*)nexus_buyer=([a-f0-9]{64})(?:;|$)/)?.[1];
}

export function createApp({ config, store, stripe, development = false }) {
  const app = express();
  const service = createCommerce({ config, store, stripe });
  app.disable('x-powered-by');
  // Proxy trust stays disabled until the deployment's proxy topology is verified.
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
      'Content-Security-Policy': `default-src 'self'; script-src 'self'${development ? " 'unsafe-inline'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://checkout.stripe.com` });
    next();
  });
  const attempts = new Map();
  app.use('/api', (req, res, next) => {
    if (req.path === '/stripe/webhook') return next();
    const now = Date.now();
    const category = req.path.startsWith('/orders/') ? 'orders' : req.path;
    const key = `${req.ip}:${category}`;
    let window = attempts.get(key);
    if (!window || window.expires <= now) {
      if (attempts.size >= 10000) {
        for (const [id, value] of attempts) if (value.expires <= now) attempts.delete(id);
        if (attempts.size >= 10000) return res.status(429).json({ error: 'Réessayez dans une minute.' });
      }
      window = { count: 0, expires: now + 60000 };
      attempts.set(key, window);
    }
    if (++window.count > (category === '/checkout' ? 10 : 120)) {
      return res.set('Retry-After', '60').status(429).json({ error: 'Réessayez dans une minute.' });
    }
    next();
  });
  const route = handler => (req, res, next) => Promise.resolve().then(() => handler(req, res)).catch(next);
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', checkoutAvailable: config.available }));
  app.get('/api/offer', (_req, res) => res.json({
    name: config.product.name, amount: config.product.amount, currency: config.product.currency,
    available: config.available, mode: config.mode, supportEmail: config.supportEmail,
    sellerName: config.sellerName, termsUrl: config.termsUrl, privacyUrl: config.privacyUrl,
  }));
  // Signature verification needs the raw body, before express.json().
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '256kb' }), route(async (req, res) => {
    res.json(await service.webhook(req.body, req.headers['stripe-signature']));
  }));
  app.use(express.json({ limit: '8kb' }));
  app.post('/api/checkout', route(async (req, res) => {
    if (req.headers.origin !== config.origin) throw new CommerceError(403, 'Origine de la requête refusée.');
    const token = buyerToken(req) || randomBytes(32).toString('hex');
    res.cookie('nexus_buyer', token, { httpOnly: true, secure: config.origin.startsWith('https:'),
      sameSite: 'lax', maxAge: 7 * 86400000, path: '/' });
    res.json(await service.checkout({ buyerToken: token, requestKey: req.headers['idempotency-key'],
      acceptedTerms: req.body?.acceptedTerms, immediateAccess: req.body?.immediateAccess }));
  }));
  app.get('/api/orders/:id', route((req, res) => res.json(service.status(req.params.id, buyerToken(req)))));
  app.get('/api/orders/:id/download', route(async (req, res) => {
    const bytes = await service.download(req.params.id, buyerToken(req));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Secrets_et_Sauces_de_Chef.pdf"' });
    res.send(bytes);
  }));
  app.get('/api/admin/summary', route((req, res) => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (config.adminToken.length < 32 || !timingSafeEqual(Buffer.from(digest(token)), Buffer.from(digest(config.adminToken)))) {
      throw new CommerceError(401, 'Authentification requise.');
    }
    res.json({ mode: config.mode, currency: config.product.currency, ...store.summary(config.mode),
      note: 'Commandes avec accès actif ; montants bruts avant frais. Ce relevé ne constitue pas un résultat net.' });
  }));
  // Historical demo endpoints cannot consume quota or pretend to send email.
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Fonction indisponible.' }));
  app.use((error, req, res, _next) => {
    const requestId = randomUUID();
    const status = error.status >= 400 && error.status <= 599 ? error.status : 500;
    if (status >= 500) console.error(JSON.stringify({ event: 'commerce_error', requestId, path: req.path }));
    res.status(status).json({ error: error instanceof CommerceError ? error.message :
      status === 400 ? 'Requête invalide.' : status === 413 ? 'Requête trop volumineuse.' :
      'Service temporairement indisponible. Aucun paiement n’est déclaré confirmé.', requestId });
  });
  return app;
}
