/** Format a decimal-string price (as returned by the API) into DZD. */
export function formatPrice(price: string | number): string {
  const value = typeof price === 'string' ? Number.parseFloat(price) : price
  if (Number.isNaN(value)) return `${price} DZD`
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DZD`
}
