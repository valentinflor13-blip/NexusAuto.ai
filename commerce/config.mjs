import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

export function readConfig(env = process.env) {
  const config = {
    origin: env.APP_URL || 'http://localhost:3000',
    mode: env.PAYMENT_MODE === 'live' ? 'live' : 'test',
    enabled: env.CHECKOUT_ENABLED === 'true',
    approved: env.OFFER_APPROVED === 'true',
    allowLive: env.ALLOW_LIVE_PAYMENTS === 'true',
    persistentStorage: env.PERSISTENT_STORAGE_CONFIRMED === 'true',
    stripeKey: env.STRIPE_API_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    adminToken: env.ADMIN_TOKEN || '',
    databasePath: env.DATABASE_PATH || './var/orders.sqlite',
    product: {
      id: 'chef-pack-v1',
      name: '50 Secrets & Sauces de Chef',
      amount: 3700,
      currency: 'eur',
      file: env.PRODUCT_PDF_PATH || '',
      sha256: env.PRODUCT_SHA256 || '',
    },
    supportEmail: env.SUPPORT_EMAIL || '',
    sellerName: env.SELLER_NAME || '',
    termsUrl: env.TERMS_URL || '',
    privacyUrl: env.PRIVACY_URL || '',
    termsVersion: env.TERMS_VERSION || '',
    issues: [],
  };
  const require = (condition, issue) => { if (!condition) config.issues.push(issue); };
  let origin;
  try { origin = new URL(config.origin); } catch { /* reported below */ }
  require(origin && origin.origin === config.origin && !origin.username && !origin.password,
    'APP_URL doit être une origine sans chemin ni identifiants.');
  require(config.approved, 'Le pack et son offre doivent être validés.');
  require(new RegExp(`^[sr]k_${config.mode}_`).test(config.stripeKey), 'Clé Stripe absente ou mode incompatible.');
  require(config.webhookSecret.startsWith('whsec_'), 'Webhook Stripe non configuré.');
  require(config.adminToken.length >= 32, 'ADMIN_TOKEN doit contenir au moins 32 caractères.');
  require(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail), 'Adresse de support manquante.');
  require(config.sellerName.trim().length > 1, 'Identité du vendeur manquante.');
  require(config.termsVersion.trim().length > 0, 'Version des conditions manquante.');
  for (const url of [config.termsUrl, config.privacyUrl]) {
    try { require(new URL(url).protocol === 'https:', 'Les documents contractuels doivent être accessibles en HTTPS.'); }
    catch { require(false, 'Document contractuel manquant.'); }
  }
  try {
    const file = realpathSync(config.product.file);
    const bytes = readFileSync(file);
    require(bytes.subarray(0, 5).toString() === '%PDF-', 'Le produit doit être un PDF.');
    require(/^[a-f0-9]{64}$/.test(config.product.sha256) &&
      createHash('sha256').update(bytes).digest('hex') === config.product.sha256,
    'Le PDF doit correspondre à son empreinte SHA-256 validée.');
    for (const directory of ['dist', 'public', 'src']) {
      const relative = path.relative(path.resolve(directory), file);
      require(relative.startsWith('..' + path.sep) || path.isAbsolute(relative), 'Le PDF doit rester hors des dossiers publics.');
    }
    config.product.file = file;
  } catch { require(false, 'PDF validé absent.'); }
  if (config.mode === 'live') {
    require(config.allowLive, 'Les paiements réels ne sont pas autorisés dans la configuration.');
    require(origin?.protocol === 'https:', 'HTTPS obligatoire en mode réel.');
    require(config.persistentStorage && config.databasePath !== ':memory:', 'Stockage persistant à confirmer avant les paiements réels.');
  }
  config.available = config.enabled && config.issues.length === 0;
  return config;
}
