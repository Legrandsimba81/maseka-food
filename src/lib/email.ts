import nodemailer from 'nodemailer';

// Configuration du transporteur nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction générique avec vérification des variables d'environnement
export async function sendEmail(to: string, subject: string, html: string) {
  // Vérifications
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM non défini dans les variables d\'environnement');
  }
  if (!to) {
    throw new Error('Destinataire manquant');
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PASS) {
    throw new Error('Configuration email incomplète (EMAIL_HOST ou EMAIL_PASS manquant)');
  }

  try {
    const info = await transporter.sendMail({
      from: `"Maseka Food" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error: any) {
    console.error("Erreur sendEmail:", error);
    throw new Error(`Échec de l'envoi de l'email : ${error.message}`);
  }
}

// Envoi d'un email de réinitialisation de mot de passe
export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendEmail(
    to,
    'Réinitialisation de votre mot de passe',
    `
      <h1>Réinitialisation du mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `
  );
}

// Alerte stock
export async function sendStockAlertEmail(productName: string, sku: string, quantity: number, minStock: number) {
  await sendEmail(
    process.env.EMAIL_FROM!,
    `Alerte stock : ${productName}`,
    `
      <h2>⚠️ Alerte stock - ${productName}</h2>
      <p>Le produit <strong>${productName}</strong> (SKU: ${sku}) est en dessous du seuil de stock.</p>
      <p><strong>Quantité actuelle :</strong> ${quantity}</p>
      <p><strong>Seuil minimum :</strong> ${minStock}</p>
      <p>Veuillez réapprovisionner rapidement.</p>
    `
  );
}

// Mouvement de stock
export async function sendStockMovementEmail(
  productName: string,
  sku: string,
  unit: string,
  type: "entree" | "sortie",
  quantity: number,
  newQuantity: number,
  reason?: string,
  previousQuantity?: number
) {
  const action = type === "entree" ? "augmenté" : "diminué";
  const emoji = type === "entree" ? "📦" : "📤";
  const html = `
    <h2>${emoji} Mouvement de stock - ${productName}</h2>
    <p><strong>Produit :</strong> ${productName} (SKU: ${sku})</p>
    <p><strong>Type :</strong> ${type === "entree" ? "Entrée (approvisionnement)" : "Sortie (consommation/vente)"}</p>
    <p><strong>Quantité concernée :</strong> ${quantity} ${unit}</p>
    ${previousQuantity !== undefined ? `<p><strong>Quantité avant :</strong> ${previousQuantity} ${unit}</p>` : ''}
    <p><strong>Nouvelle quantité :</strong> ${newQuantity} ${unit}</p>
    ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
    <p>Le stock a été ${action} de ${quantity} ${unit}.</p>
    <hr />
    <p>Cet email a été envoyé automatiquement depuis Maseka Food.</p>
  `;
  await sendEmail(process.env.EMAIL_FROM!, `Mouvement stock - ${productName} (${action})`, html);
}

// Confirmation de commande
export async function sendOrderConfirmationEmail(order: any) {
  const customerName = order.user?.name || 'Client';
  const customerEmail = order.user?.email || 'Email non renseigné';
  const items = order.items.map((item: any) => ({
    name: item.product?.name || 'Produit inconnu',
    quantity: item.quantity,
    price: item.priceAtTime || 0,
    subtotal: (item.priceAtTime || 0) * item.quantity,
  }));
  const totalAmount = order.totalAmount || 0;
  const deliveryAddress = order.deliveryAddress || 'Non renseignée';
  const deliveryTime = order.deliveryTime || 'Non renseignée';
  const createdAt = order.createdAt || new Date();

  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)} $</td>
      <td>${item.subtotal.toFixed(2)} $</td>
    </tr>
  `).join('');

  const html = `
    <h2>📦 Nouvelle commande #${order.id}</h2>
    <p><strong>Client :</strong> ${customerName} (${customerEmail})</p>
    <p><strong>Adresse de livraison :</strong> ${deliveryAddress}</p>
    <p><strong>Heure de livraison :</strong> ${deliveryTime}</p>
    <p><strong>Date de la commande :</strong> ${new Date(createdAt).toLocaleString()}</p>
    <h3>Détails des produits :</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Prix unitaire</th>
          <th>Sous-total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right;"><strong>Total :</strong></td>
          <td><strong>${totalAmount.toFixed(2)} $</strong></td>
        </tr>
      </tfoot>
    </table>
    <p>Merci de préparer cette commande dans les plus brefs délais.</p>
    <hr />
    <p>Cet email a été envoyé automatiquement depuis Maseka Food.</p>
  `;

  await sendEmail(process.env.EMAIL_FROM!, `Nouvelle commande #${order.id}`, html);
}