import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast'; // Wait, let's use the one we created: '../components/NotificationToast'

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Modal manual payment state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    paymentMethod: 'upi',
    status: 'completed',
    transactionId: '',
  });

  const [toast, setToast] = useState(null);

  // Fetch payments list
  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      const paymentsRes = await api.get('/payments');
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data);
      }

      const metricsRes = await api.get('/payments/dashboard/metrics');
      if (metricsRes.data.success) {
        setTotalRevenue(metricsRes.data.data.totalRevenue);
      }
    } catch (error) {
      console.error('Error loading financial logs:', error);
      setToast({ type: 'error', message: 'Failed to synchronize transaction ledger.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for dropdown list
  const loadClientsDropdown = async () => {
    try {
      const response = await api.get('/clients?limit=100');
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPaymentsData();
    loadClientsDropdown();
  }, []);

  // Handle Create Submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount) {
      setToast({ type: 'error', message: 'Please provide client and amount.' });
      return;
    }

    try {
      const response = await api.post('/payments', formData);
      if (response.data.success) {
        setToast({ type: 'success', message: 'Transaction entry created successfully!' });
        setIsModalOpen(false);
        loadPaymentsData();
      }
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to record payment.' });
    }
  };

  // Open modal
  const openPaymentModal = () => {
    setFormData({
      clientId: clients[0]?._id || '',
      amount: '',
      paymentMethod: 'upi',
      status: 'completed',
      transactionId: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Financial Ledger</h3>
          <p className="text-xs text-gray-400 mt-1">Review collected consultations fees, manual receipts, and invoice records</p>
        </div>
        <button
          onClick={openPaymentModal}
          disabled={clients.length === 0}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Record Receipt</span>
        </button>
      </div>

      {/* Revenue Stat card summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel border border-white/5 rounded-3xl p-6 flex items-center justify-between col-span-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Lifetime Receipts</span>
            <span className="text-3xl font-extrabold text-gray-100 tracking-tight mt-1.5">₹{totalRevenue}</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-2 self-start">
              Active Ledger
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <IndianRupee className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Transactions list */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : payments.length === 0 ? (
        <div className="glass-panel border border-white/5 rounded-3xl p-16 text-center text-gray-500">
          No transactions records found.
        </div>
      ) : (
        <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-slate-900/20">
                  <th className="font-semibold px-6 py-4">Transaction ID</th>
                  <th className="font-semibold px-6 py-4">Client</th>
                  <th className="font-semibold px-6 py-4">Receipt Date</th>
                  <th className="font-semibold px-6 py-4">Billing Method</th>
                  <th className="font-semibold px-6 py-4">Fee Settled</th>
                  <th className="font-semibold px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      {p.transactionId || 'MANUAL-REC'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-200">{p.client?.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{p.client?.email || 'No email registered'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {new Date(p.paymentDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border border-slate-700 bg-slate-800 text-gray-400 tracking-wider">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gray-200">
                      ₹{p.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        p.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : p.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Manual Payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-200 mb-6">Log Manual Payment</h3>

            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
              {/* Client select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="form-input-cosmic text-xs appearance-none cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.mobileNumber})</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="e.g. 250"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="form-input-cosmic text-xs appearance-none cursor-pointer"
                >
                  <option value="upi">UPI / Online</option>
                  <option value="cash">Cash Settlement</option>
                  <option value="card">Card Reader</option>
                  <option value="bank_transfer">Net Banking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Transaction ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="e.g. TXN482012"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Payments;
