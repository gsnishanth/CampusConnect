import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { MapPin, Calendar } from 'lucide-react';

export default function ClaimCard({ claim, onDispute }) {
  const navigate = useNavigate();
  const item = claim.itemId;

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={getImageUrl(item?.image)}
          alt={item?.title}
          onError={e => { e.target.src = '/placeholder.svg'; }}
          className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 truncate">{item?.title || 'Unknown Item'}</h3>
            <Badge status={claim.status} />
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            {item?.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
            )}
            {item?.date && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.date)}</span>
            )}
          </div>
          {claim.decisionNote && (
            <p className="text-xs text-gray-500 mt-1 italic">"{claim.decisionNote}"</p>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={() => navigate(`/items/${item?._id}`)} className="btn-secondary text-xs px-3 py-1.5">
              View Item
            </button>
            {claim.status === 'rejected' && onDispute && (
              <button onClick={() => onDispute(claim._id)} className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                Dispute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
