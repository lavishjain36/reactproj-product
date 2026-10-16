// Shared text formatting for cards and the details page.
// Step 5 — Format price and category text
// src/utils/format.js is used by both the card and the details page, so write it before those components.



// Example: 9.99 -> ₹9.99
export function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value) || 0);
}

// Example: "home-decoration" -> "Home Decoration"
export function label(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
