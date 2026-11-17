import { useState, useEffect } from 'react';
import { ClipboardList, Inbox } from 'lucide-react';
import { getMyClaims, getIncomingClaims, makeDecision, disputeClaim } from '../../services/claimService';
import ClaimCard from '../../components/claims/ClaimCard';
import IncomingClaimCard from '../../components/claims/IncomingClaimCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyClaims() {
  const [view, setView] = useState('outgoing'); // 'outgoing' (claims I made) or 'incoming' (claims on my found items)
  const [myClaims, setMyClaims] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [myRes, incRes] = await Promise.allSettled([
        getMyClaims(),
        getIncomingClaims(),
      ]);

      if (myRes.status === 'fulfilled' && myRes.value.data) {
        setMyClaims(myRes.value.data.data || myRes.value.data.claims || []);
      }
      if (incRes.status === 'fulfilled' && incRes.value.data) {
        setIncomingClaims(incRes.value.data.data || incRes.value.data.claims || []);
      }
    } catch (err) {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (id, data) => {
    try {
      await makeDecision(id, data);
      toast.success(`Claim marked as ${data.status}`);
      // Refresh incoming claims
      const res = await getIncomingClaims();
      setIncomingClaims(res.data.data || res.data.claims || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit decision');
    }
  };

  const handleDispute = async (id) => {
    try {
      await disputeClaim(id);
      toast.success('Claim flagged for dispute review by administrators');
      // Refresh my claims
      const res = await getMyClaims();
      setMyClaims(res.data.data || res.data.claims || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file dispute');
    }
  };

  const filteredMyClaims = myClaims.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track items you have claimed and review incoming claims for items you found.
        </p>
      </div>

      {/* Main toggle */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setView('outgoing')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            view === 'outgoing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={18} />
          <span>My Claims ({myClaims.length})</span>
        </button>
        <button
          onClick={() => setView('incoming')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            view === 'incoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox size={18} />
          <span>Incoming Claims ({incomingClaims.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : view === 'outgoing' ? (
        <div className="space-y-4">
          {/* Sub-status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Pending', 'Approved', 'Rejected', 'Disputed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {filteredMyClaims.length > 0 ? (
            <div className="space-y-3">
              {filteredMyClaims.map(claim => (
                <ClaimCard
                  key={claim._id}
                  claim={claim}
                  onDispute={handleDispute}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12">
              <EmptyState
                icon={ClipboardList}
                title="No claims found"
                description="You haven't submitted any claims with this status."
              />
            </div>
          )}
        </div>
      ) : (
        /* Incoming claims */
        <div className="space-y-4">
          {incomingClaims.length > 0 ? (
            <div className="space-y-4">
              {incomingClaims.map(claim => (
                <IncomingClaimCard
                  key={claim._id}
                  claim={claim}
                  onDecision={handleDecision}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12">
              <EmptyState
                icon={Inbox}
                title="No incoming claims"
                description="You have no pending verification requests from others."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
