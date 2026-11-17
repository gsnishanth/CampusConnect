import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getItems } from '../../services/itemService';
import ItemFilters from '../../components/items/ItemFilters';
import ItemCard from '../../components/items/ItemCard';
import Pagination from '../../components/ui/Pagination';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function Browse() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    location: '',
    sort: '-createdAt',
    page: 1,
    limit: 9,
  });

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await getItems(filters);
        if (isMounted) {
          setItems(data.data || data.items || []);
          if (data.pagination) {
            setPagination(data.pagination);
          } else {
            setPagination({
              page: data.page || filters.page || 1,
              pages: data.pages || Math.ceil((data.total || (data.data || []).length) / filters.limit) || 1,
              total: data.total || (data.data || []).length,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
        <p className="text-gray-500 text-sm mt-1">
          Search all reported lost and found items across the campus.
        </p>
      </div>

      <ItemFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} />
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      ) : (
        <div className="card p-12">
          <EmptyState
            icon={Package}
            title="No items found"
            description="No items match your selected filters. Try adjusting your search query or filters."
            action={{
              label: "Reset Filters",
              onClick: () => setFilters({
                search: '',
                category: '',
                type: '',
                location: '',
                sort: '-createdAt',
                page: 1,
                limit: 9,
              })
            }}
          />
        </div>
      )}
    </div>
  );
}
