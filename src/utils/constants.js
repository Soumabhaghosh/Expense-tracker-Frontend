export const CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',    icon: '🍽',  color: '#e07c3a' },
  { id: 'transport',     label: 'Transport',         icon: '🚗',  color: '#5c90e0' },
  { id: 'shopping',      label: 'Shopping',          icon: '🛍',  color: '#9b7fe8' },
  { id: 'entertainment', label: 'Entertainment',     icon: '🎬',  color: '#e05c5c' },
  { id: 'health',        label: 'Health',            icon: '💊',  color: '#5cb87e' },
  { id: 'bills',         label: 'Bills & Utilities', icon: '📄',  color: '#3abfb8' },
  { id: 'education',     label: 'Education',         icon: '📚',  color: '#c9a84c' },
  { id: 'other',         label: 'Other',             icon: '📦',  color: '#a09e9a' },
];

export const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

export const RECUR_FREQUENCIES = [
  { id: 'daily',   label: 'Daily'   },
  { id: 'weekly',  label: 'Weekly'  },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly'  },
];

export function fmt(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n || 0);
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function thisMonth() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(m) {
  return new Date(m + '-01').toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });
}
