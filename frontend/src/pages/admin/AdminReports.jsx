import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

export default function AdminReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      const res = await api.get(`/admin/reports?${params}`);
      setItems(res.data.data?.items || res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [filter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/items/${deleteId}`);
      toast.success('Report removed');
      setItems(items.filter(i => i._id !== deleteId));
      setDeleteId(null);
    } catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">All Reports</h1></div>
      <div className="page-body">
        <div className="flex gap-3 mb-4">
          <select className="input w-40" value={filter.type} onChange={e => setFilter(f => ({...f, type: e.target.value}))}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select className="input w-40" value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="returned">Returned</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Title','Type','Category','Location','Reporter','Date','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-3"><Badge type={item.type} /></td>
                    <td className="px-4 py-3 text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 text-gray-500">{item.location}</td>
                    <td className="px-4 py-3 text-gray-500">{item.userId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(item._id)} className="btn-danger btn-sm"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="text-center text-gray-400 py-8">No reports found.</p>}
          </div>
        )}
      </div>
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Report">
        <p className="text-sm text-gray-600 mb-4">Remove this report from the platform?</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
