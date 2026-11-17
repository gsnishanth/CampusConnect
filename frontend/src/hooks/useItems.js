import { useState, useEffect, useCallback } from 'react';
import { getItems } from '../services/itemService';

export function useItems(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [params, setParams] = useState(initialParams);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getItems(params);
      setItems(data.data || data.items || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, pagination, setParams, refetch: fetchItems };
}
