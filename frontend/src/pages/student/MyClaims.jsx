import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, Inbox } from 'lucide-react';
import { getMyClaims, getIncomingClaims, makeDecision, disputeClaim, markReturned } from '../../services/claimService';
import ClaimCard from '../../components/claims/ClaimCard';
import IncomingClaimCard from '../../components/claims/IncomingClaimCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const extractClaims = (response) => {
  const claims = response?.data?.data?.claims ?? response?.data?.claims;
  if (!Array.isArray(claims)) {
    throw new Error('Unexpected claims response from the server');
  }
  return claims;
};

const CLAIM_STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Disputed', 'Closed'];

const getRequestedView = (searchParams) =>
  searchParams.get('view') === 'incoming' ? 'incoming' : 'outgoing';

const getRequestedStatus = (searchParams) => {
  const requestedStatus = searchParams.get('status')?.toLowerCase();
  return CLAIM_STATUSES.find(status => status.toLowerCase() === requestedStatus) || 'All';
};

export default function MyClaims() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const requestedStatus = searchParams.get('status');
  const [view, setView] = useState(() => getRequestedView(searchParams));
  const [myClaims, setMyClaims] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState(() => getRequestedStatus(searchParams));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setView(getRequestedView(searchParams));
    setStatusFilter(getRequestedStatus(searchParams));
  }, [requestedView, requestedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [myRes, incRes] = await Promise.allSettled([
        getMyClaims(),
        getIncomingClaims(),
      ]);

      if (myRes.status === 'fulfilled') {
        setMyClaims(extractClaims(myRes.value));
      } else {
        toast.error(myRes.reason?.response?.data?.message || 'Failed to load your claims');
      }
      if (incRes.status === 'fulfilled') {
        setIncomingClaims(extractClaims(incRes.value));
      } else {
        toast.error(incRes.reason?.response?.data?.message || 'Failed to load incoming claims');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load claims');
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
      setIncomingClaims(extractClaims(res));
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
      setMyClaims(extractClaims(res));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file dispute');
    }
  };

  const handleReturn = async (id) => {
    try {
      await markReturned(id);
      toast.success('Item marked as returned');
      const res = await getIncomingClaims();
      setIncomingClaims(extractClaims(res));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark item as returned');
    }
  };

  const filteredMyClaims = myClaims.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status?.toLowerCase() === statusFilter.toLowerCase();
  });
  const filteredIncomingClaims = incomingClaims.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const selectView = (nextView) => {
    setView(nextView);
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === 'incoming') {
      nextParams.set('view', 'incoming');
    } else {
      nextParams.delete('view');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const selectStatus = (status) => {
    setStatusFilter(status);
    const nextParams = new URLSearchParams(searchParams);
    if (status === 'All') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', status.toLowerCase());
    }
    setSearchParams(nextParams, { replace: true });
  };

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
          onClick={() => selectView('outgoing')}
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
          onClick={() => selectView('incoming')}
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
            {CLAIM_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => selectStatus(status)}
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {CLAIM_STATUSES.map(status => {
              const count = status === 'All'
                ? incomingClaims.length
                : incomingClaims.filter(claim => claim.status?.toLowerCase() === status.toLowerCase()).length;
              return (
                <button
                  key={status}
                  onClick={() => selectStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          {filteredIncomingClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredIncomingClaims.map(claim => (
                <IncomingClaimCard
                  key={claim._id}
                  claim={claim}
                  onDecision={handleDecision}
                  onReturn={handleReturn}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12">
              <EmptyState
                icon={Inbox}
                title={statusFilter === 'All' ? 'No incoming claims' : `No ${statusFilter.toLowerCase()} incoming claims`}
                description="There are no incoming claims matching this status."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
