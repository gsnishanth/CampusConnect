import { useState, useEffect } from 'react';
import { Users, AlertCircle, Package, ClipboardList, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const claimPieData = stats?.claimsByStatus
    ? Object.entries(stats.claimsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const categoryData = stats?.itemsByCategory
    ? Object.entries(stats.itemsByCategory).map(([name, value]) => ({ name: name.split(' ')[0], value }))
    : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview and statistics.</p>
      </div>
      <div className="page-body space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Students" value={stats?.totalUsers} icon={Users} color="bg-blue-500" />
          <StatCard title="Lost Reports" value={stats?.lostItems} icon={AlertCircle} color="bg-red-500" />
          <StatCard title="Found Reports" value={stats?.foundItems} icon={Package} color="bg-green-500" />
          <StatCard title="Total Claims" value={stats?.totalClaims} icon={ClipboardList} color="bg-amber-500" />
          <StatCard title="Items Returned" value={stats?.returnedItems} icon={CheckCircle} color="bg-purple-500" />
          <StatCard title="Pending Disputes" value={stats?.disputedClaims} icon={AlertTriangle} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryData.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Items by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize:11}} />
                  <YAxis tick={{fontSize:11}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {claimPieData.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Claims by Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={claimPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {claimPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
