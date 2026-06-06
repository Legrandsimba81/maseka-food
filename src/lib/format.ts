export function formatPrice(price: number | null | undefined): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "0,00";
  }
  const isInteger = Math.abs(price - Math.round(price)) < 0.01;
  let displayPrice = price;
  if (isInteger && price > 0) {
    displayPrice = price - 0.01;
  }
  return displayPrice.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}