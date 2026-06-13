import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  User, 
  Trash2, 
  XCircle, 
  CheckCircle,
  Calendar,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal booking state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'video',
    price: 150,
    notes: '',
  });

  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Load Appointments
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments', {
        params: {
          status: statusFilter || undefined,
          date: dateFilter || undefined,
        },
      });
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments list:', error);
      setToast({ type: 'error', message: 'Failed to fetch appointment schedules.' });
    } finally {
      setLoading(false);
    }
  };

  // Load Clients for dropdown selection
  const loadClientsDropdown = async () => {
    try {
      const response = await api.get('/clients?limit=100');
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error('Error loading clients list for selection:', error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    loadClientsDropdown();
  }, []);

  // Open booking modal
  const openBookingModal = () => {
    setFormData({
      clientId: clients[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 30,
      type: 'video',
      price: 150,
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Handle Book Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.date || !formData.time) {
      setToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    try {
      const response = await api.post('/appointments', formData);
      if (response.data.success) {
        setToast({ type: 'success', message: 'Appointment slot booked successfully!' });
        setIsModalOpen(false);
        loadAppointments();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error booking appointment.' 
      });
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    const dateFormatted = appt.date ? new Date(appt.date).toISOString().split('T')[0] : '';
    setRescheduleData({
      date: dateFormatted,
      time: appt.time,
    });
    setIsRescheduleOpen(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/appointments/${selectedAppt._id}`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        status: 'rescheduled',
      });
      if (response.data.success) {
        setToast({ type: 'success', message: 'Appointment rescheduled.' });
        setIsRescheduleOpen(false);
        loadAppointments();
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setToast({ type: 'error', message: 'Failed to reschedule slot.' });
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await api.put(`/appointments/${id}`, { status: 'cancelled' });
        if (response.data.success) {
          setToast({ type: 'success', message: 'Appointment cancelled.' });
          loadAppointments();
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        setToast({ type: 'error', message: 'Failed to cancel appointment.' });
      }
    }
  };

  // Purge/Delete Appointment record
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Delete this appointment record permanently?')) {
      try {
        await api.delete(`/appointments/${id}`);
        setToast({ type: 'success', message: 'Record deleted.' });
        loadAppointments();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Consultation Planner</h3>
          <p className="text-xs text-gray-400 mt-1">Schedule video/audio readings and track consultation workflows</p>
        </div>
        <button
          onClick={openBookingModal}
          disabled={clients.length === 0}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full form-input-cosmic pl-12 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full form-input-cosmic pl-12 appearance-none cursor-pointer text-xs"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Reset Filters */}
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : appointments.length === 0 ? (
        <div className="glass-panel border border-white/5 rounded-3xl p-16 text-center text-gray-500">
          No scheduled appointments found matching query conditions.
        </div>
      ) : (
        <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-slate-900/20">
                  <th className="font-semibold px-6 py-4">Client Detail</th>
                  <th className="font-semibold px-6 py-4">Scheduled Date</th>
                  <th className="font-semibold px-6 py-4">Time Slot</th>
                  <th className="font-semibold px-6 py-4">Fee Charged</th>
                  <th className="font-semibold px-6 py-4">Status</th>
                  <th className="font-semibold px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-200">{appt.client?.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{appt.client?.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {new Date(appt.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{appt.time} ({appt.duration} Min)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border tracking-wider bg-indigo-500/10 text-indigo-300 border-indigo-500/20 inline-block mt-1">
                        {appt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-200">
                      ₹{appt.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        appt.status === 'scheduled' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : appt.status === 'rescheduled'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : appt.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {appt.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => navigate('/consultations', { state: { prefilledAppt: appt } })}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow transition-all"
                            >
                              Consult
                            </button>
                            <button
                              onClick={() => openRescheduleModal(appt)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg border border-white/5 font-semibold text-[10px] cursor-pointer transition-colors"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appt._id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/15 text-rose-400 rounded-lg border border-white/5 cursor-pointer transition-colors"
                              title="Cancel slot"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {appt.status !== 'scheduled' && (
                          <button
                            onClick={() => handleDeleteAppointment(appt._id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/15 text-rose-400 rounded-lg border border-white/5 cursor-pointer transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Book Consultation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-200 mb-6">Schedule Consultation</h3>

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
              {/* Select Client */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select Client *</label>
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

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input-cosmic text-xs"
                  />
                </div>

                {/* Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time slot *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:30"
                    className="form-input-cosmic text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Duration (Min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="form-input-cosmic text-xs"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="form-input-cosmic text-xs"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Session Channel Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-input-cosmic text-xs appearance-none cursor-pointer"
                >
                  <option value="video">Video Consultation</option>
                  <option value="audio">Audio Reading</option>
                  <option value="chat">Chat Support</option>
                  <option value="in-person">In-Person Meeting</option>
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Provide schedule details..."
                  className="form-input-cosmic text-xs h-16 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow shadow-indigo-600/10 cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Reschedule */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-200 mb-4">Reschedule Appointment</h3>

            <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="form-input-cosmic text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Time</label>
                <input
                  type="text"
                  required
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  className="form-input-cosmic text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Reschedule
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

export default Appointments;
