import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, truncateText, getCategoryIcon } from '../../utils/helpers';

export default function ItemCard({ item, isOwner = false, onDelete }) {
  const navigate = useNavigate();
  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={item.image || '/placeholder.svg'}
          alt={item.title}
          onError={e => { e.target.src = '/placeholder.svg'; }}
          className="w-full h-40 object-cover bg-gray-100"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge type={item.type} />
          <Badge status={item.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2 mb-1">
          <CategoryIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-2 leading-tight">{item.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{truncateText(item.description || item.publicDescription, 80)}</p>
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{truncateText(item.location, 40)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate(`/items/${item._id}`)}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 flex-1 justify-center"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => navigate(`/items/${item._id}/edit`)}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete && onDelete(item._id)}
                className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
