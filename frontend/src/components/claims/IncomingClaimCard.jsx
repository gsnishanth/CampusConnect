import { useState } from 'react';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/helpers';
import { User, Star, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function IncomingClaimCard({ claim, onDecision, onReturn }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleDecision = async (status) => {
    if (status === 'approved' || status === 'rejected') {
      setPendingAction(status);
      setShowNote(true);
      return;
    }
  };

  const confirmDecision = async () => {
    setLoading(true);
    try {
      await onDecision(claim._id, { status: pendingAction, decisionNote: note });
      setShowNote(false);
    } finally {
      setLoading(false);
    }
  };

  const claimant = claim.claimantId;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{claimant?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{claimant?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {claim.verificationScore !== undefined && (
            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
              <Star className="w-4 h-4" />
              {claim.verificationScore}%
            </div>
          )}
          <Badge status={claim.status} />
        </div>
      </div>

      {claim.answers?.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Verification Answers:</p>
          {claim.answers.map((a, i) => (
            <div key={i} className="mb-2">
              <p className="text-xs text-gray-600 font-medium">{a.question}</p>
              <p className="text-xs text-gray-800">{a.answer}</p>
            </div>
          ))}
        </div>
      )}

      {showNote && (
        <div className="mb-3">
          <label className="label">Decision Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="input h-20 resize-none"
            placeholder="Explain your decision..."
          />
        </div>
      )}

      {claim.status === 'pending' && (
        <div className="flex gap-2">
          {!showNote ? (
            <>
              <button onClick={() => handleDecision('approved')} className="btn-primary flex items-center gap-1 text-sm">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => handleDecision('rejected')} className="btn-danger flex items-center gap-1 text-sm">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          ) : (
            <>
              <button onClick={confirmDecision} disabled={loading} className="btn-primary text-sm">
                {loading ? 'Processing...' : `Confirm ${pendingAction}`}
              </button>
              <button onClick={() => { setShowNote(false); setPendingAction(null); }} className="btn-secondary text-sm">
                Cancel
              </button>
            </>
          )}
          {claim.status === 'approved' && onReturn && (
            <button
              onClick={() => onReturn(claim._id)}
              className="btn-primary flex items-center gap-1 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Mark Returned
            </button>
          )}
        </div>
      )}
    </div>
  );
}
