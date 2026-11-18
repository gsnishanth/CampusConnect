import {
  Laptop, Wallet, BookOpen, CreditCard, Shirt, Key, Briefcase, Package,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getImageUrl(image) {
  if (!image) return '/placeholder.svg';
  if (/^(https?:|data:|blob:)/i.test(image)) return image;

  try {
    const apiOrigin = new URL(API_URL, window.location.origin).origin;
    return new URL(image, `${apiOrigin}/`).toString();
  } catch {
    return image;
  }
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function getCategoryIcon(category) {
  const map = {
    'Electronics': Laptop,
    'Wallets & Accessories': Wallet,
    'Books & Stationery': BookOpen,
    'ID Cards': CreditCard,
    'Clothing': Shirt,
    'Keys': Key,
    'Bags': Briefcase,
    'Other': Package,
  };
  return map[category] || Package;
}

export function getStatusColor(status) {
  const map = {
    active: 'badge-active',
    matched: 'badge-matched',
    returned: 'badge-returned',
    closed: 'badge-closed',
    pending: 'badge-active',
    approved: 'badge-found',
    rejected: 'badge-lost',
    disputed: 'badge-matched',
  };
  return map[status] || 'badge-closed';
}

export function truncateText(text, length = 100) {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '…' : text;
}

export function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}
