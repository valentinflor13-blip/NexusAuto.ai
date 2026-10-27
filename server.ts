import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createApp } from './commerce/app.mjs';
import { readConfig } from './commerce/config.mjs';
import { openStore } from './commerce/store.mjs';

dotenv.config({ quiet: true });
const directory = path.dirname(fileURLToPath(import.meta.url));
const config = readConfig();
const store = openStore(config.databasePath);
const stripe = /^[sr]k_(test|live)_/.test(config.stripeKey)
  ? new Stripe(config.stripeKey, { apiVersion: '2026-08-26.dahlia', maxNetworkRetries: 2, timeout: 15000 }) : null;
const app = createApp({ config, store, stripe });
const production = process.env.NODE_ENV === 'production';
if (production) {
  app.use(express.static(path.join(directory, 'dist'), { index: false }));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  app.use(vite.middlewares);
  app.get('*', async (_req, res, next) => {
    try {
      const { readFile } = await import('node:fs/promises');
      res.type('html').send(await vite.transformIndexHtml('/', await readFile(path.join(directory, 'index.html'), 'utf8')));
    } catch (error) { next(error); }
  });
}
if (production) app.get('*', (_req, res) => res.sendFile(path.join(directory, 'dist', 'index.html')));
const server = app.listen(Number(process.env.PORT) || 3000, process.env.HOST || '127.0.0.1', () => {
  console.log(JSON.stringify({ event: 'server_started', mode: config.mode, checkoutAvailable: config.available }));
  if (!config.available) console.log(JSON.stringify({ event: 'checkout_closed', issues: config.issues }));
});
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(() => { store.close(); process.exit(0); }));
