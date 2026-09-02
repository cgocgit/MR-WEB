export function formatCurrency(n) {
  return '$' + Number(n).toFixed(2);
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

export function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}