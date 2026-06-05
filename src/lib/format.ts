export function formatPrice(price: number): string {
  // Vérifie si le prix est un nombre entier (pas de centimes)
  const isInteger = Math.abs(price - Math.round(price)) < 0.01;
  let displayPrice = price;
  if (isInteger && price > 0) {
    displayPrice = price - 0.01; // ex: 30.00 → 29.99
  }
  return displayPrice.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}