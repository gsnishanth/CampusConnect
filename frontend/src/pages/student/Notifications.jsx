import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from '../../components/notifications/NotificationItem';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Notifications() {
  const { notifications, loading, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (id, item) => {
    await markRead(id);
    if (item?.relatedItemId) {
      navigate(`/items/${item.relatedItemId._id || item.relatedItemId}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with status changes, claim responses, and match alerts.
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(n => (
            <NotificationItem
              key={n._id}
              notification={n}
              onClick={(id) => handleNotificationClick(id, n)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        </div>
      )}
    </div>
  );
}
