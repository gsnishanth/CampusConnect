import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState({ status: 'approved', decisionNote: '' });
  const [resolving, setResolving] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/claims${params}`);
      setClaims(res.data.data?.claims || res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(); }, [statusFilter]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.put(`/admin/claims/${resolveModal._id}/resolve`, resolution);
      toast.success('Dispute resolved');
      setClaims(claims.map(c => c._id === resolveModal._id ? {...c, status: resolution.status} : c));
      setResolveModal(null);
    } catch { toast.error('Failed'); }
    finally { setResolving(false); }
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">All Claims</h1></div>
      <div className="page-body">
        <div className="mb-4">
          <select className="input w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Claims</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Item','Claimant','Score','Status','Date','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.itemId?.title || 'Item'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.claimantId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{c.verificationScore ?? 0}%</td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {c.status === 'disputed' && (
                        <button onClick={() => { setResolveModal(c); setResolution({status:'approved',decisionNote:''}); }}
                          className="btn-primary btn-sm">Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {claims.length === 0 && <p className="text-center text-gray-400 py-8">No claims found.</p>}
          </div>
        )}
      </div>
      <Modal isOpen={!!resolveModal} onClose={() => setResolveModal(null)} title="Resolve Dispute">
        {resolveModal && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded p-3 text-sm">
              <p><strong>Item:</strong> {resolveModal.itemId?.title}</p>
              <p><strong>Claimant:</strong> {resolveModal.claimantId?.name}</p>
              <p><strong>Score:</strong> {resolveModal.verificationScore}%</p>
            </div>
            <div>
              <label className="label">Decision</label>
              <select className="input" value={resolution.status} onChange={e => setResolution(r => ({...r, status: e.target.value}))}>
                <option value="approved">Approve Claim</option>
                <option value="rejected">Reject Claim</option>
              </select>
            </div>
            <div>
              <label className="label">Admin Note</label>
              <textarea className="input" rows={2} value={resolution.decisionNote}
                onChange={e => setResolution(r => ({...r, decisionNote: e.target.value}))} placeholder="Reason for decision..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setResolveModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleResolve} disabled={resolving} className="btn-primary flex-1 justify-center">
                {resolving ? <Loader2 size={14} className="animate-spin" /> : 'Resolve Dispute'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
