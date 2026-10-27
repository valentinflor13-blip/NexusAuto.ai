# NexusAuto — Parcours de vente du carnet culinaire

Version préparatoire 0.1.0. L’application publique propose une offre unique et un parcours de commande. Les ventes sont **fermées par défaut**. Aucune vente, publication sociale, publicité, certification ou satisfaction client n’est inventée.

## Réalisé et limites

- Page de présentation et page de commande en français, adaptées aux mobiles.
- Stripe Checkout hébergé ; prix fixé côté serveur à 37 € pour le projet « 50 Secrets & Sauces de Chef ».
- Commandes persistées dans SQLite ; réservations et événements de paiement dédoublonnés.
- Livraison du PDF uniquement après un événement Stripe signé et une session récupérée auprès de Stripe : statut payé, montant, devise, mode, produit et commande doivent correspondre.
- Paiements différés traités ; remboursement ou litige reçu par webhook retire l’accès. Aucun remboursement ni prélèvement n’est déclenché par l’application.
- Accès au téléchargement lié au navigateur de commande pendant sept jours, par cookie HttpOnly. Le fichier livré doit correspondre à son empreinte SHA-256. Il n’est jamais placé dans un dossier public.
- Résumé privé des commandes avec accès actif, en mode test ou réel, sous authentification. Il ne calcule ni résultat net ni comptabilité complète.
- Aucun email n’est envoyé. La livraison s’effectue sur la page de commande ; le client conserve son PDF. Après perte du cookie ou changement d’appareil, le support doit vérifier le paiement et traiter la demande. Un email automatique et un dispositif de récupération autonome restent à développer avant toute promesse de livraison par email.

Le vrai PDF culinaire n’a pas été identifié dans les sources consultées. Le prix et le nom sont repris du prototype ; ils ne constituent pas une validation du produit. Il faut valider le contenu, les conditions commerciales et l’identité du vendeur avant ouverture.

## Développement et vérification

```bash
npm ci
npm test
npm run lint
npm run build
npm run dev
```

Node.js 24 minimum. `npm` et `package-lock.json` font foi. Les tests utilisent un faux prestataire pour les appels réseau Stripe et le vrai SDK pour vérifier les signatures ; ils n’effectuent aucun paiement ni appel réseau Stripe. Le PDF de test est un simple marqueur, jamais un produit vendable.

La configuration vide doit afficher « Les ventes ne sont pas encore ouvertes ». `GET /api/health` doit renvoyer `checkoutAvailable:false`. Les fonctions de l’ancienne démonstration ne sont plus exposées dans l’application publique ni dans l’API. Ses composants historiques restent dans `src/components` pour une éventuelle réutilisation ; leurs données et libellés ne prouvent aucune intégration. La version initiale reste récupérable dans Git.

## Configuration avant essai Stripe sandbox

Renseigner les variables de `.env.example` via les secrets de l’environnement, sans les committer. Pour un test local uniquement, un `.env` ignoré par Git peut être utilisé.

- Utiliser un environnement Stripe sandbox et une clé restreinte avec les permissions nécessaires à Checkout, aux produits/prix créés pour les sessions et à la lecture des PaymentIntents.
- Placer le PDF approuvé dans un dossier privé. `PRODUCT_SHA256` doit être son empreinte complète, obtenue avec `sha256sum`.
- Renseigner les documents contractuels accessibles en HTTPS, leur version, l’identité du vendeur et le support. `OFFER_APPROVED=true` signifie que ces éléments et le produit ont été effectivement validés.
- Configurer un secret `ADMIN_TOKEN` aléatoire d’au moins 32 caractères.
- Déclarer le webhook `/api/stripe/webhook` avant tout essai complet. Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`. Format snapshot, API `2026-08-26.dahlia`, correspondant au SDK ; l’application récupère l’état courant de la session avant traitement. Cette intégration utilise le snapshot pour corréler les événements Checkout avec la commande locale.
- Renseigner `APP_URL` avec l’origine exacte du site, sans slash final ni chemin. `CHECKOUT_ENABLED=true` n’ouvre les ventes que si toutes les vérifications réussissent.

Vérifier dans le sandbox : paiement réussi, refusé, différé, événement rejoué, retour navigateur avant webhook, PDF absent ou modifié, remboursement et redémarrage. Une page de succès ne valide jamais à elle seule une vente. Ne pas confondre les tests locaux avec un paiement Stripe sandbox validé.

## Conditions d’exploitation

Le runtime reste Node/Express : aucun nouvel hébergeur n’est provisionné. Démarrage de production après compilation : `NODE_ENV=production npm start`. Configurer `HOST=0.0.0.0` seulement derrière le point d’entrée HTTPS de l’hébergeur.

**SQLite exige une seule instance et un volume durable** pour `DATABASE_PATH` et le PDF. Ne pas déployer ce stockage tel quel sur le disque éphémère d’un service Cloud Run ou sur plusieurs instances. Prévoir sauvegardes, restauration testée, permissions du volume et surveillance avant ouverture. Un changement d’infrastructure ou une base externe nécessite une décision de déploiement séparée.

Pour les paiements réels, il faut aussi `PAYMENT_MODE=live`, la clé correspondante, `ALLOW_LIVE_PAYMENTS=true`, une origine HTTPS et `PERSISTENT_STORAGE_CONFIRMED=true`. Ces drapeaux sont des garde-fous techniques, pas une certification ni un remplacement de la validation humaine. Aucun impôt, frais Stripe, budget publicitaire ou bénéfice net n’est calculé par l’application. Aucun réglage de fiscalité automatique n’est activé.

Le limiteur intégré protège une instance et n’accorde aucune confiance aux en-têtes proxy. Derrière un proxy, vérifier sa topologie et configurer une protection à l’entrée avant de modifier `trust proxy`. Les journaux applicatifs excluent clés, emails, cookies et corps des webhooks. Surveiller les erreurs, la santé du service et les échecs de livraison webhook dans Stripe.

## Interfaces

- `GET /api/offer` : offre publique et disponibilité réelle.
- `POST /api/checkout` : consentements explicites, origine vérifiée et `Idempotency-Key` UUID ; aucun prix accepté du navigateur.
- `POST /api/stripe/webhook` : corps brut et signature Stripe.
- `GET /api/orders/:id` et `GET /api/orders/:id/download` : cookie de l’acheteur requis.
- `GET /api/admin/summary` : `Authorization: Bearer …` requis ; jamais accessible avec une simple URL.

Références techniques : [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create), [événements et signatures](https://docs.stripe.com/events/set-up-events), [traitement des événements rejoués](https://docs.stripe.com/events/manage-webhook-endpoints).
