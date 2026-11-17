import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmUser, setConfirmUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data.data?.users || res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleToggle = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/users/${confirmUser._id}/status`, { isActive: !confirmUser.isActive });
      toast.success(`User ${confirmUser.isActive ? 'suspended' : 'activated'}`);
      setUsers(users.map(u => u._id === confirmUser._id ? {...u, isActive: !u.isActive} : u));
      setConfirmUser(null);
    } catch { toast.error('Failed to update user status'); }
    finally { setUpdating(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
      </div>
      <div className="page-body">
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.isActive?'Active':'Suspended'}</span></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => setConfirmUser(u)}
                          className={u.isActive ? 'btn-danger btn-sm' : 'btn-secondary btn-sm'}>
                          {u.isActive ? <><UserX size={12} />Suspend</> : <><UserCheck size={12} />Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found.</p>}
          </div>
        )}
      </div>
      <Modal isOpen={!!confirmUser} onClose={() => setConfirmUser(null)} title={confirmUser?.isActive ? 'Suspend User' : 'Activate User'}>
        <p className="text-sm text-gray-600 mb-4">
          {confirmUser?.isActive ? `Suspend ${confirmUser?.name}? They won't be able to log in.` : `Activate ${confirmUser?.name}?`}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmUser(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleToggle} disabled={updating} className={confirmUser?.isActive ? 'btn-danger flex-1 justify-center' : 'btn-primary flex-1 justify-center'}>
            {updating ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
