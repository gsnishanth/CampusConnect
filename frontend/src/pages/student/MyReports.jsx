import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Package } from 'lucide-react';
import { getMyReports, deleteItem } from '../../services/itemService';
import ItemCard from '../../components/items/ItemCard';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const TABS = ['All', 'Lost', 'Found', 'Active', 'Matched', 'Returned', 'Closed'];

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await getMyReports();
      setReports(data.data || data.items || []);
    } catch (err) {
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Lost') return item.type === 'lost';
    if (activeTab === 'Found') return item.type === 'found';
    return item.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const confirmDelete = (id) => {
    setSelectedItemId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItemId) return;
    setDeleting(true);
    try {
      await deleteItem(selectedItemId);
      toast.success('Report deleted');
      setReports(reports.filter(r => r._id !== selectedItemId));
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
      setSelectedItemId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your submitted lost and found item reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/report-lost" className="btn-primary text-xs py-2 px-3">
            <PlusCircle size={14} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn-secondary text-xs py-2 px-3">
            <PlusCircle size={14} /> Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {TABS.map(tab => {
          const count = reports.filter(item => {
            if (tab === 'All') return true;
            if (tab === 'Lost') return item.type === 'lost';
            if (tab === 'Found') return item.type === 'found';
            return item.status?.toLowerCase() === tab.toLowerCase();
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(item => (
            <ItemCard
              key={item._id}
              item={item}
              isOwner={true}
              onDelete={() => confirmDelete(item._id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <EmptyState
            icon={Package}
            title={`No ${activeTab.toLowerCase()} reports`}
            description="You don't have any reports matching this filter."
            action={{
              label: "Create a Report",
              onClick: () => navigate('/report-lost')
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Report"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this report? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="btn-danger text-xs"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
