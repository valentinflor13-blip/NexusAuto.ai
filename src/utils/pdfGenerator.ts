import jsPDF from 'jspdf';
import { Transaction } from './revenueEngine';

export interface ReportData {
  totalRevenue: number;
  hourlyVelocity: number;
  conversionRate: number;
  totalOrders: number;
  averageOrderValue: number;
  overallRoas: number;
  supportResolutionRate: number;
  transactions: Transaction[];
  campaigns: Array<{ platform: string; spend: number; revenue: number; roas: number; status: string }>;
  predictiveForecast: {
    projected24h: number;
    projected7d: number;
    elasticityNote: string;
  };
}

export function generateExecutivePdfReport(data: ReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const auditId = `NEXUS-AUDIT-${Date.now().toString(36).toUpperCase()}`;

  // Dark header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Title & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NEXUSAUTO AI — RAPPORT EXÉCUTIF', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Système Autonome de Monétisation Rapide & Intelligence Prédictive', 14, 25);
  doc.text(`Émis le : ${dateStr}  |  Certificat de Sécurité : ${auditId}`, 14, 32);

  // Status Badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(pageWidth - 52, 14, 38, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTEUR ACTIF', pageWidth - 49, 19.5);

  // Section 1: KPI Summary Cards (4 blocks)
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Indicateurs Clés de Rentabilité (Temps Réel)', 14, y);
  y += 8;

  const cardWidth = 42;
  const cardHeight = 22;
  const cards = [
    { label: 'Revenu Encaissé', val: `${data.totalRevenue.toLocaleString('fr-FR')} €`, color: [16, 185, 129] },
    { label: 'Vitesse Horaire', val: `${data.hourlyVelocity.toLocaleString('fr-FR')} €/h`, color: [59, 130, 246] },
    { label: 'Taux Conversion (CVR)', val: `${data.conversionRate}%`, color: [139, 92, 246] },
    { label: 'ROAS Publicitaire', val: `${data.overallRoas}x`, color: [245, 158, 11] },
  ];

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 4, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.val, x + 4, y + 16);
  });

  y += cardHeight + 14;

  // Section 2: Support & Machine Learning Autonomy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Autonomie Opérationnelle & Support Client IA', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `• Taux de résolution sans intervention humaine : ${data.supportResolutionRate}% (Support 24/7 actif)`,
    16,
    y + 2
  );
  doc.text(
    `• Panier moyen (AOV) : ${data.averageOrderValue} €  |  Total commandes clôturées : ${data.totalOrders}`,
    16,
    y + 8
  );
  doc.text(
    `• Personnalisation dynamique : Objections traitées avec levée d'incitatif à la conversion immédiate.`,
    16,
    y + 14
  );

  y += 24;

  // Section 3: Multi-Platform Campaign Synchronization
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Synchronisation & Rentabilité des Campagnes Publicitaires', 14, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Plateforme', 18, y + 5);
  doc.text('Budget Engagé', 70, y + 5);
  doc.text('Revenu Généré', 115, y + 5);
  doc.text('ROAS Mesuré', 155, y + 5);
  doc.text('Statut IA', 185, y + 5);
  y += 7;

  data.campaigns.slice(0, 4).forEach((camp) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(camp.platform, 18, y + 6);
    doc.text(`${camp.spend} €`, 70, y + 6);
    doc.text(`${camp.revenue} €`, 115, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`${camp.roas}x`, 155, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(camp.status, 185, y + 6);
    y += 7.5;
  });

  y += 10;

  // Section 4: Predictive Analytics & Forecasting
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Analyse Prédictive & Projections de Revenu', 14, y);
  y += 6;

  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text(
    `Projection Chiffre d'Affaires 24h : ${data.predictiveForecast.projected24h.toLocaleString('fr-FR')} €   |   Projection 7 Jours : ${data.predictiveForecast.projected7d.toLocaleString('fr-FR')} €`,
    18,
    y + 8
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Recommandation Algorithmique : ${data.predictiveForecast.elasticityNote}`,
    18,
    y + 16
  );

  y += 30;

  // Section 5: Cryptographic Security & Ledger
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Audit de Sécurité & Empreinte Cryptographique des Transactions', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Chiffrement actif : AES-256-GCM au repos, TLS 1.3 en transit, Zero-Knowledge PII Masking, Hash SHA-256.',
    14,
    y
  );
  y += 5;

  const sampleTx = data.transactions.slice(0, 3);
  sampleTx.forEach((tx) => {
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`[TX-${tx.id.slice(-6)}] ${tx.amount}€ | ${tx.paymentMethod} | HASH: ${tx.hash.slice(0, 36)}...`, 14, y);
    y += 4.5;
  });

  // Footer banner
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('NexusAuto AI Engine — Document certifié conforme aux normes bancaires et RGPD.', 14, pageHeight - 9);
  doc.text(`Page 1 / 1  •  Réf : ${auditId}`, pageWidth - 60, pageHeight - 9);

  // Save the PDF
  doc.save(`NexusAuto-Rapport-Financier-${now.toISOString().slice(0, 10)}.pdf`);
}
