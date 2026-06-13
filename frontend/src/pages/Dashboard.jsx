import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { MonthlyRevenueChart, PaymentMethodPie } from '../components/DashboardCharts';
import NotificationToast from '../components/NotificationToast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalConsultations: 0,
    monthlyRevenue: 0,
    upcomingAppts: 0,
  });
  const [chartData, setChartData] = useState({
    monthly: [],
    methods: []
  });
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Clients
      const clientsRes = await api.get('/clients?limit=1');
      const totalClients = clientsRes.data.total;

      // Fetch Consultations
      const consultationsRes = await api.get('/consultations');
      const totalConsultations = consultationsRes.data.count;

      // Fetch Appointments
      const apptsRes = await api.get('/appointments?status=scheduled');
      const upcomingList = apptsRes.data.data;
      const upcomingAppts = upcomingList.length;

      // Fetch Revenue metrics
      const revenueRes = await api.get('/payments/dashboard/metrics');
      const { totalRevenue, monthlyRevenue, methodDistribution } = revenueRes.data.data;

      // Calculate monthly total from last entry in monthlyRevenue chart list
      const latestMonthRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1].revenue : 0;

      setStats({
        totalClients,
        totalConsultations,
        monthlyRevenue: latestMonthRevenue,
        upcomingAppts,
      });

      setChartData({
        monthly: monthlyRevenue,
        methods: methodDistribution,
      });

      setUpcomingList(upcomingList.slice(0, 5)); // show latest 5
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      setToast({ type: 'error', message: 'Failed to synchronize dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 tracking-tight">Vedic Workspace Command Centre</h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Generate planetary alignments, log charts, and tracking earnings seamlessly.</p>
          </div>
        </div>

        <button 
          onClick={loadDashboardData}
          className="relative z-10 px-4 py-2.5 bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Terminal</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients Registered"
          value={stats.totalClients}
          icon={Users}
          trend="+12% growth"
          trendType="up"
          loading={loading}
        />
        <StatCard
          title="Consultations Logged"
          value={stats.totalConsultations}
          icon={FileText}
          trend="+8% volume"
          trendType="up"
          loading={loading}
        />
        <StatCard
          title="Current Month Revenue"
          value={`₹${stats.monthlyRevenue}`}
          icon={IndianRupee}
          trend="+15% change"
          trendType="up"
          loading={loading}
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppts}
          icon={Calendar}
          trend={`${stats.upcomingAppts} active`}
          trendType="neutral"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h4 className="font-bold text-gray-200 text-sm tracking-wide">Monthly Revenue Report</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Summary of transaction history (INR)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          {loading ? (
            <div className="h-64 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse mt-4"></div>
          ) : (
            <MonthlyRevenueChart data={chartData.monthly} />
          )}
        </div>

        {/* Payment Methods */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h4 className="font-bold text-gray-200 text-sm tracking-wide">Billing Channels</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Distribution of collected payments</p>
            </div>
          </div>
          {loading ? (
            <div className="h-64 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse mt-4"></div>
          ) : (
            <PaymentMethodPie data={chartData.methods} />
          )}
        </div>
      </div>

      {/* Bottom Row - Schedules */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div>
            <h4 className="font-bold text-gray-200 text-sm tracking-wide">Upcoming Appointments Schedule</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Next client consultations scheduled</p>
          </div>
          <button 
            onClick={() => navigate('/appointments')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Planner Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="h-40 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse"></div>
        ) : upcomingList.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            No consultations scheduled for today or coming days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 pb-3">
                  <th className="font-semibold pb-3">Client Name</th>
                  <th className="font-semibold pb-3">Date</th>
                  <th className="font-semibold pb-3">Time slot</th>
                  <th className="font-semibold pb-3">Channel Type</th>
                  <th className="font-semibold pb-3">Consultation Fee</th>
                  <th className="font-semibold pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {upcomingList.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5">
                      <div className="font-semibold text-gray-200">{item.client?.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.client?.mobileNumber}</div>
                    </td>
                    <td className="py-3.5 text-gray-400 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-gray-400 font-semibold flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.time} ({item.duration} Min)</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border tracking-wider ${
                        item.type === 'video' 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                          : item.type === 'audio' 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-gray-200">
                      ₹{item.price}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => navigate('/consultations', { state: { prefilledAppt: item } })}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-md shadow-indigo-600/10 transition-all opacity-90 group-hover:opacity-100"
                      >
                        Start Consultation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
