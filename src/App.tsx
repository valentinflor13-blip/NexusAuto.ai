import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, ChefHat, Download, LockKeyhole, RefreshCw } from 'lucide-react';
import './storefront.css';

type Offer = {
  name: string; amount: number; currency: string; available: boolean; mode: 'test' | 'live';
  supportEmail: string; sellerName: string; termsUrl: string; privacyUrl: string;
};
type Order = { id: string; status: 'pending' | 'paid' | 'failed' | 'revoked'; mode: string; downloadable: boolean };

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, credentials: 'same-origin' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Le service est temporairement indisponible.');
  return data;
}

function OrderPage({ offer }: { offer: Offer }) {
  const id = new URLSearchParams(window.location.search).get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!id) { setError('La référence de commande est manquante.'); return; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const until = Date.now() + 120000;
    async function check() {
      try {
        const result = await requestJson<Order>(`/api/orders/${encodeURIComponent(id!)}`, { signal: controller.signal });
        setOrder(result); setError('');
        if (result.status === 'pending' && Date.now() < until) timer = setTimeout(check, 5000);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Vérification impossible.');
      }
    }
    check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [id, refresh]);
  const title = order?.status === 'paid' ? 'Votre guide est prêt.' : order?.status === 'revoked' ?
    'Cet accès a été retiré.' : order?.status === 'failed' ? 'Le paiement n’a pas abouti.' : 'Vérification de votre paiement';
  return <main className="order-shell">
    <a className="back-link" href="/">← Retour à l’offre</a>
    <div className="order-card">
      <BookOpen size={36} strokeWidth={1.4} />
      <p className="eyebrow">VOTRE COMMANDE</p>
      <h1>{title}</h1>
      {order?.mode === 'test' && <p className="notice">Environnement de test — aucun encaissement réel.</p>}
      {error ? <p role="alert" className="notice error">{error}</p> : order?.status === 'pending' ?
        <p>La confirmation du prestataire de paiement n’est pas encore reçue. Vous pouvez actualiser cette page dans quelques instants. Ne payez pas une deuxième fois.</p> : null}
      {order?.downloadable ? <>
        <p>Votre paiement a été confirmé. Téléchargez et conservez votre exemplaire.</p>
        <a className="primary-button" href={`/api/orders/${encodeURIComponent(order.id)}/download`}><Download size={18} /> Télécharger le guide PDF</a>
        <p className="fine-print">Ce navigateur conserve votre accès pendant sept jours. En cas de perte d’accès, contactez le support avec la référence ci-dessous.</p>
      </> : <button className="secondary-button" onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} /> Actualiser la vérification</button>}
      {id && <p className="order-reference">Référence : {id}</p>}
      {offer.supportEmail && <a href={`mailto:${offer.supportEmail}`}>Contacter le support</a>}
    </div>
  </main>;
}

export default function App() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [immediateAccess, setImmediateAccess] = useState(false);
  const [pending, setPending] = useState(false);
  const requestKey = useRef(crypto.randomUUID());
  const checkoutBusy = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    requestJson<Offer>('/api/offer', { signal: controller.signal }).then(setOffer).catch(err => {
      if (!controller.signal.aborted) setError(err.message);
    });
    return () => controller.abort();
  }, []);
  async function checkout() {
    if (checkoutBusy.current) return;
    checkoutBusy.current = true; setPending(true); setError('');
    try {
      const result = await requestJson<{ url: string }>('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey.current },
        body: JSON.stringify({ acceptedTerms, immediateAccess }),
      });
      const url = new URL(result.url);
      if (url.origin !== 'https://checkout.stripe.com') throw new Error('Adresse de paiement inattendue.');
      window.location.assign(url.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’ouvrir le paiement.');
      checkoutBusy.current = false; setPending(false);
    }
  }
  if (!offer) return <main className="loading-screen"><ChefHat size={34} /><p role={error ? 'alert' : 'status'}>{error || 'Chargement de l’offre…'}</p>{error && <button onClick={() => window.location.reload()}>Réessayer</button>}</main>;
  const price = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: offer.currency, maximumFractionDigits: 0 }).format(offer.amount / 100);
  return <div className="storefront">
    <header className="site-header"><a className="brand" href="/"><ChefHat size={25} strokeWidth={1.5} /> Les carnets du chef<span>PAR NEXUSAUTO</span></a><a className="header-link" href={offer.supportEmail ? `mailto:${offer.supportEmail}` : '#offre'}>{offer.supportEmail ? 'Une question ?' : 'Découvrir le projet'} <ArrowRight size={15} /></a></header>
    {window.location.pathname === '/commande' ? <OrderPage offer={offer} /> : <main>
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span /> LE SAVOIR-FAIRE, À PORTÉE DE MAIN</p>
          <h1>Un peu de technique.<br />Beaucoup de <em>goût.</em></h1>
          <p className="intro">Les sauces et les gestes qui font la différence, réunis dans un carnet de cuisine à garder près de soi.</p>
          <a href="#offre" className="primary-button">Découvrir le carnet <ArrowRight size={18} /></a>
          <div className="hero-notes"><span><BookOpen size={15} /> Format numérique PDF</span><span>Paiement unique</span></div>
        </div>
        <div className="book-scene" aria-label="Aperçu graphique du carnet, couverture provisoire">
          <span className="scene-index">ÉDITION 01 — CUISINE MAISON</span>
          <div className="book"><div className="book-top">LES CARNETS<br />DU CHEF <ChefHat size={27} strokeWidth={1.2} /></div><div className="book-title">50 secrets<br />& sauces<br /><em>de chef.</em></div><div className="plate"><div className="sauce-shape" /><span className="herb h1" /><span className="herb h2" /><span className="herb h3" /></div><div className="book-bottom">LES BONS GESTES.<br />LES BONS ASSAISONNEMENTS.<span>01</span></div></div>
          <p className="cover-caption">COUVERTURE PROVISOIRE · APERÇU DU PROJET</p>
        </div>
      </section>
      <div className="principles"><span>Un carnet à consulter</span><span>Des gestes à comprendre</span><span>Un exemplaire à conserver</span></div>
      <section className="offer-section" id="offre">
        <div className="offer-description"><p className="eyebrow">LE CARNET NUMÉRIQUE</p><h2>{offer.name}</h2><p>{offer.available ? 'Un guide numérique consacré aux sauces et aux techniques de cuisine, à télécharger après confirmation du paiement.' : 'Un projet de guide culinaire consacré aux sauces et aux techniques de cuisine. Le contenu final sera validé avant l’ouverture des ventes.'}</p><div className="format-note"><BookOpen size={23} /><div><strong>Un fichier, à votre rythme.</strong><p>À consulter sur téléphone, tablette ou ordinateur. Aucun abonnement.</p></div></div></div>
        <div className="purchase-card"><p className="eyebrow">{offer.available ? 'VOTRE EXEMPLAIRE' : 'OFFRE EN PRÉPARATION'}</p><div className="price">{price}<span>{offer.available ? 'paiement unique' : 'prix prévu'}</span></div>
          {offer.available ? <>
            {offer.mode === 'test' && <p className="notice">Mode test : cette commande n’entraîne aucun encaissement réel.</p>}
            <p>Accès au PDF après confirmation du paiement.</p>
            <label className="consent"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} /><span>J’accepte les <a href={offer.termsUrl} target="_blank" rel="noreferrer">conditions de vente</a>.</span></label>
            <label className="consent"><input type="checkbox" checked={immediateAccess} onChange={e => setImmediateAccess(e.target.checked)} /><span>Je demande l’accès immédiat au contenu numérique et reconnais perdre mon droit de rétractation dès le début de sa fourniture.</span></label>
            <button className="primary-button" disabled={!acceptedTerms || !immediateAccess || pending} onClick={checkout}>{pending ? 'Ouverture du paiement…' : `Commander — ${price}`}<ArrowRight size={17} /></button>
            <p className="payment-note"><LockKeyhole size={13} /> Paiement sur la page sécurisée de Stripe</p>
          </> : <><p>Le carnet est en cours de préparation. Aucun paiement n’est proposé pour le moment.</p><button className="primary-button" disabled>Les ventes ne sont pas encore ouvertes</button></>}
          {error && <p role="alert" className="notice error">{error}</p>}
          {new URLSearchParams(window.location.search).has('cancelled') && <p className="notice">Vous avez quitté la page de paiement. Aucun achat n’est confirmé sur cette page.</p>}
        </div>
      </section>
    </main>}
    <footer className="site-footer"><span>{offer.sellerName || 'Les carnets du chef — projet en préparation'}</span><nav aria-label="Informations">{offer.supportEmail && <a href={`mailto:${offer.supportEmail}`}>Contact</a>}{offer.termsUrl && <a href={offer.termsUrl}>Conditions de vente</a>}{offer.privacyUrl && <a href={offer.privacyUrl}>Confidentialité</a>}</nav><span>© {new Date().getFullYear()}</span></footer>
  </div>;
}
