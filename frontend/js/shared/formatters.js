export function formatCurrency(n){ return '$' + Number(n).toFixed(2) }
export function formatDate(d){ return new Date(d).toLocaleDateString(); }
