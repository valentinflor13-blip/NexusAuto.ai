import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync, chmodSync } from 'node:fs';
import path from 'node:path';

export function openStore(filename) {
  if (filename !== ':memory:') mkdirSync(path.dirname(path.resolve(filename)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  if (filename !== ':memory:') chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, buyer_hash TEXT NOT NULL, request_key TEXT NOT NULL,
      product_id TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL,
      product_file TEXT NOT NULL, product_sha256 TEXT NOT NULL,
      mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      checkout_id TEXT UNIQUE, checkout_url TEXT,
      terms_version TEXT NOT NULL, created_at INTEGER NOT NULL, paid_at INTEGER,
      UNIQUE(buyer_hash, request_key)
    );
    CREATE TABLE IF NOT EXISTS payment_events (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, type TEXT NOT NULL, processed_at INTEGER NOT NULL
    );`);
  const byId = id => db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return {
    close: () => db.close(),
    byId,
    byCheckout: id => db.prepare('SELECT * FROM orders WHERE checkout_id = ?').get(id),
    reserve(buyerHash, requestKey, config) {
      const product = config.product;
      db.prepare(`INSERT OR IGNORE INTO orders
        (id, buyer_hash, request_key, product_id, amount, currency, product_file, product_sha256, mode, terms_version, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        randomUUID(), buyerHash, requestKey, product.id, product.amount, product.currency,
        product.file, product.sha256, config.mode, config.termsVersion, Date.now());
      return db.prepare('SELECT * FROM orders WHERE buyer_hash = ? AND request_key = ?').get(buyerHash, requestKey);
    },
    attachCheckout(orderId, session) {
      db.prepare(`UPDATE orders SET checkout_id = ?, checkout_url = ? WHERE id = ? AND checkout_id IS NULL`)
        .run(session.id, session.url, orderId);
      return byId(orderId);
    },
    applyEvent(event, orderId, status) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const inserted = db.prepare('INSERT OR IGNORE INTO payment_events VALUES (?, ?, ?, ?)')
          .run(event.id, orderId, event.type, Date.now());
        if (inserted.changes && status) {
          // Refunds/disputes revoke access; old payment events cannot reactivate it.
          db.prepare(`UPDATE orders SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, ?) ELSE paid_at END
            WHERE id = ? AND (status NOT IN ('revoked') OR ? = 'revoked')`)
            .run(status, status, Date.now(), orderId, status);
        }
        db.exec('COMMIT');
        return Boolean(inserted.changes);
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    summary(mode) {
      return db.prepare(`SELECT COUNT(*) AS paidOrders, COALESCE(SUM(amount), 0) AS grossAmountCents
        FROM orders WHERE status = 'paid' AND mode = ?`).get(mode);
    },
  };
}
