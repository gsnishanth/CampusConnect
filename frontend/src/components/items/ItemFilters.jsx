import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All', 'Electronics', 'Wallets & Accessories', 'Books & Stationery',
  'ID Cards', 'Clothing', 'Keys', 'Bags', 'Other',
];

export default function ItemFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={filters.type || ''}
          onChange={e => handleChange('type', e.target.value)}
          className="input sm:w-36"
        >
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select
          value={filters.category || ''}
          onChange={e => handleChange('category', e.target.value)}
          className="input sm:w-48"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c === 'All' ? '' : c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Location..."
          value={filters.location || ''}
          onChange={e => handleChange('location', e.target.value)}
          className="input sm:w-40"
        />
        <select
          value={filters.sort || '-createdAt'}
          onChange={e => handleChange('sort', e.target.value)}
          className="input sm:w-40"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-date">Date (Recent)</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
    </div>
  );
}
