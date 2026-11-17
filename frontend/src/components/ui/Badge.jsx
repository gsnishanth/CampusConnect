export default function Badge({ status, type }) {
  const val = status || type || '';
  const classMap = {
    lost: 'badge-lost',
    found: 'badge-found',
    active: 'badge-active',
    matched: 'badge-matched',
    returned: 'badge-returned',
    closed: 'badge-closed',
    pending: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700',
    approved: 'badge-found',
    rejected: 'badge-lost',
    disputed: 'badge-matched',
  };
  const cls = (val && classMap[val.toLowerCase()]) || 'badge-closed';
  return <span className={cls}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : ''}</span>;
}
