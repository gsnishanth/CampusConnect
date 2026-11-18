import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowLeft, Trash2, Edit2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { getItemById, deleteItem, getItemMatches } from '../../services/itemService';
import { createClaim, getMyClaims } from '../../services/claimService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ItemCard from '../../components/items/ItemCard';
import { formatDate, getCategoryIcon, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [itemError, setItemError] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [existingClaim, setExistingClaim] = useState(null);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimAnswers, setClaimAnswers] = useState([]);
  const [generalProof, setGeneralProof] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadItem = async () => {
      setLoading(true);
      try {
        const { data } = await getItemById(id);
        const itemData = data.data?.item || data.item || data.data || data;
        if (!itemData || typeof itemData !== 'object' || !itemData._id) {
          throw new Error('The server returned an invalid item response.');
        }
        if (isMounted) {
          setItem(itemData);
          setItemError('');

          // If item has verification questions, init answers array
          if (itemData.verificationQuestions && Array.isArray(itemData.verificationQuestions)) {
            setClaimAnswers(itemData.verificationQuestions.map(q => ({ question: q, answer: '' })));
          }

          // Check if current user already submitted a claim for this item
          try {
            const claimsRes = await getMyClaims();
            const allMyClaims = claimsRes.data.data?.claims || claimsRes.data.claims || [];
            const found = Array.isArray(allMyClaims)
              ? allMyClaims.find(c => (c.itemId?._id || c.itemId) === id)
              : null;
            if (found && isMounted) setExistingClaim(found);
          } catch (claimsError) {
            console.error('Error fetching existing claims:', claimsError);
          }
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        if (isMounted) {
          setItem(null);
          setItemError(err.response?.data?.message || err.message || 'Unable to load this item.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadItem();
    return () => { isMounted = false; };
  }, [id]);

  // Load matches
  useEffect(() => {
    if (!item) return;
    let isMounted = true;
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const { data } = await getItemMatches(id);
        if (isMounted) {
          const matchList = data.data?.matches || data.matches;
          if (!Array.isArray(matchList)) {
            throw new Error('Unexpected matches response from the server');
          }
          setMatches(matchList);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        if (isMounted) setMatchesLoading(false);
      }
    };
    fetchMatches();
    return () => { isMounted = false; };
  }, [id, item]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">{itemError ? 'Unable to load item' : 'Item not found'}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          {itemError || 'The item you are looking for does not exist or may have been removed.'}
        </p>
        <Link to="/browse" className="btn-primary">Back to Browse</Link>
      </div>
    );
  }

  const isOwner = (item.userId?._id || item.userId) === user?._id;
  const CategoryIcon = getCategoryIcon(item.category);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItem(id);
      toast.success('Report deleted successfully');
      navigate('/my-reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmittingClaim(true);
    try {
      const answersPayload = claimAnswers.length > 0
        ? claimAnswers
        : [{ question: 'Proof of Ownership', answer: generalProof }];

      const { data } = await createClaim({
        itemId: id,
        answers: answersPayload,
      });

      toast.success('Claim submitted successfully! The finder will review it.');
      setExistingClaim(data.data || data.claim || { status: 'pending' });
      setClaimModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Top navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Item Card */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-gray-100 flex items-center justify-center p-4">
            <img
              src={getImageUrl(item.image)}
              alt={item.title}
              onError={e => { e.target.src = '/placeholder.svg'; }}
              className="max-h-96 w-full object-contain rounded-lg shadow-sm"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge type={item.type} />
                <Badge status={item.status} />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {item.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <CategoryIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">{item.category}</span>
              </div>

              <div className="space-y-2 py-3 border-y border-gray-100 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Location: <strong>{item.location}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Date: <strong>{formatDate(item.date)}</strong></span>
                </div>
                {item.approximateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Approx. Time: <strong>{item.approximateTime}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {item.description || item.publicDescription || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
              {isOwner ? (
                <>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="btn-danger text-sm"
                  >
                    <Trash2 size={16} /> Delete Report
                  </button>
                </>
              ) : item.type === 'found' ? (
                existingClaim ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2 w-full">
                    <ShieldAlert size={18} className="text-blue-600" />
                    <span>You have already submitted a claim. Status: <strong>{existingClaim.status.toUpperCase()}</strong></span>
                  </div>
                ) : (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="btn-primary text-sm w-full sm:w-auto"
                  >
                    Claim This Item
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Possible Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">Possible Matches</h2>
        </div>

        {matchesLoading ? (
          <div className="flex justify-center p-6"><LoadingSpinner /></div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {matches.map((m, idx) => {
              const matchedItem = m.matchedItem || m;
              return (
                <div key={matchedItem._id || idx} className="relative">
                  {m.score !== undefined && (
                    <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow">
                      {m.score}% Match
                    </div>
                  )}
                  <ItemCard item={matchedItem} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-6 text-center text-sm text-gray-500">
            No matching items found at this time.
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Claim This Item"
        size="md"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <p className="text-xs text-gray-500">
            To verify you are the rightful owner, please answer the questions or provide distinctive details only the owner would know (e.g., wallpapers, scratches, unique contents).
          </p>

          {claimAnswers.length > 0 ? (
            claimAnswers.map((qa, index) => (
              <div key={index}>
                <label className="label text-xs font-semibold">{qa.question}</label>
                <input
                  type="text"
                  required
                  value={qa.answer}
                  onChange={e => {
                    const updated = [...claimAnswers];
                    updated[index].answer = e.target.value;
                    setClaimAnswers(updated);
                  }}
                  className="input text-xs"
                  placeholder="Your answer..."
                />
              </div>
            ))
          ) : (
            <div>
              <label className="label text-xs font-semibold">Proof of Ownership</label>
              <textarea
                required
                rows={4}
                value={generalProof}
                onChange={e => setGeneralProof(e.target.value)}
                className="input text-xs resize-none"
                placeholder="Describe specific details, markings, or identifying features..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingClaim}
              className="btn-primary text-xs"
            >
              {submittingClaim ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>

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
