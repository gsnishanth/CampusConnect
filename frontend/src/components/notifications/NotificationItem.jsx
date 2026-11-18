import { Bell, CheckCircle, AlertCircle, Info, Package } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

const typeIcons = {
  match: Package,
  claim: Bell,
  decision: CheckCircle,
  return: CheckCircle,
  system: Info,
};

export default function NotificationItem({ notification, onClick }) {
  const Icon = typeIcons[notification.type] || Bell;

  return (
    <button
      onClick={() => onClick(notification._id, notification)}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        notification.isRead
          ? 'border-gray-100 bg-white hover:bg-gray-50'
          : 'border-blue-100 bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          notification.isRead ? 'bg-gray-100' : 'bg-blue-200'
        }`}>
          <Icon className={`w-4 h-4 ${notification.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}
