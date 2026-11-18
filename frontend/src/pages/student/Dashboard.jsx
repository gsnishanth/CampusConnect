import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, FileText, CheckCircle, Clock, PlusCircle, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getItems, getMyReports } from '../../services/itemService';
import { getIncomingClaims } from '../../services/claimService';
import { getNotifications } from '../../services/notificationService';
import ItemCard from '../../components/items/ItemCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    myActiveReports: 0,
    pendingClaims: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [allItemsRes, myReportsRes, myClaimsRes, notifsRes] = await Promise.allSettled([
          getItems({ limit: 6, sort: '-createdAt' }),
          getMyReports({ limit: 100 }),
          getIncomingClaims(),
          getNotifications(),
        ]);

        let lostCount = 0;
        let foundCount = 0;
        let recent = [];

        if (allItemsRes.status === 'fulfilled' && allItemsRes.value.data) {
          const responseData = allItemsRes.value.data.data || allItemsRes.value.data;
          const itemsData = Array.isArray(responseData.items) ? responseData.items : [];
          recent = itemsData.slice(0, 6);
          // Fetch counts if available
          if (responseData.pagination) {
            // approximate or fetch
          }
        }

        // Count my active reports
        let activeReports = 0;
        if (myReportsRes.status === 'fulfilled' && myReportsRes.value.data) {
          const responseData = myReportsRes.value.data.data || myReportsRes.value.data;
          const myData = Array.isArray(responseData.items) ? responseData.items : [];
          activeReports = myData.filter(i => i.status === 'active').length;
          lostCount = myData.filter(i => i.type === 'lost').length;
          foundCount = myData.filter(i => i.type === 'found').length;
        }

        // Count incoming claims that are waiting for the finder to review.
        let pending = 0;
        if (myClaimsRes.status === 'fulfilled' && myClaimsRes.value.data) {
          const responseData = myClaimsRes.value.data.data || myClaimsRes.value.data;
          const claims = Array.isArray(responseData.claims) ? responseData.claims : [];
          pending = claims.filter(c => c.status === 'pending').length;
        }

        // Notifications
        let notifs = [];
        if (notifsRes.status === 'fulfilled' && notifsRes.value.data) {
          const responseData = notifsRes.value.data.data || notifsRes.value.data;
          const raw = Array.isArray(responseData.notifications) ? responseData.notifications : [];
          notifs = raw.slice(0, 3);
        }

        setStats({
          totalLost: lostCount,
          totalFound: foundCount,
          myActiveReports: activeReports,
          pendingClaims: pending,
        });
        setRecentItems(recent);
        setRecentNotifications(notifs);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {getGreeting()}, {user?.name || 'Student'}!
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Welcome to the CampusConnect Lost &amp; Found Portal. Report items, claim your belongings, and track recoveries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/report-lost" className="bg-white text-blue-700 font-semibold text-xs md:text-sm px-4 py-2.5 rounded-lg shadow hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5">
            <PlusCircle size={16} /> Report Lost
          </Link>
          <Link to="/report-found" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
            <Package size={16} /> Report Found
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/my-reports?type=lost"
          className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">My Lost Reports</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLost}</p>
          </div>
        </Link>

        <Link
          to="/my-reports?type=found"
          className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">My Found Reports</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFound}</p>
          </div>
        </Link>

        <Link
          to="/my-reports?status=active"
          className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Active Reports</p>
            <p className="text-2xl font-bold text-gray-900">{stats.myActiveReports}</p>
          </div>
        </Link>

        <Link
          to="/my-claims?view=incoming&status=pending"
          className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Claims</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingClaims}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Reported Items (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recently Reported Items</h2>
            <Link to="/browse" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LoadingSkeleton count={4} />
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentItems.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="card p-8">
              <EmptyState
                icon={Package}
                title="No items found"
                description="There are currently no recently reported items."
                action={{
                  label: "Report an Item",
                  onClick: () => navigate('/report-lost')
                }}
              />
            </div>
          )}
        </div>

        {/* Recent Notifications / Quick Links (1 column on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              See all
            </Link>
          </div>

          <div className="card divide-y divide-gray-100 overflow-hidden">
            {recentNotifications.length > 0 ? (
              recentNotifications.map(n => (
                <div key={n._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No recent notifications
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <h3 className="font-semibold text-blue-900 text-sm mb-1">Lost something on campus?</h3>
            <p className="text-xs text-blue-700 mb-3">
              Submit a report with distinct details. Our automated matching system will notify you if a matching item is found!
            </p>
            <Link to="/report-lost" className="btn-primary text-xs py-1.5 px-3">
              Report Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
