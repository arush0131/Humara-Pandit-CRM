import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Sparkles, 
  UserCircle,
  Video,
  Phone,
  Mail,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotificationToast from '../components/NotificationToast';

const getZodiacSign = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Aries';
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

const CustomerDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const syncProfileAndAppts = async () => {
    setLoading(true);
    try {
      // Refresh current user and profile data
      const meRes = await api.get('/auth/me');
      if (meRes.data.success) {
        updateProfile(meRes.data.user, meRes.data.profile);
      }

      // Fetch appointments
      const apptsRes = await api.get('/appointments?status=scheduled');
      if (apptsRes.data.success) {
        setAppointments(apptsRes.data.data);
      }
    } catch (error) {
      console.error('Error syncing customer dashboard:', error);
      setToast({ type: 'error', message: 'Failed to retrieve fresh portal data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncProfileAndAppts();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this consultation appointment?')) {
      try {
        const res = await api.put(`/appointments/${apptId}`, { status: 'cancelled' });
        if (res.data.success) {
          setToast({ type: 'success', message: 'Appointment cancelled successfully.' });
          syncProfileAndAppts();
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        setToast({ 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to cancel appointment.' 
        });
      }
    }
  };

  const zodiac = profile?.dateOfBirth ? getZodiacSign(profile.dateOfBirth) : 'Aries';

  return (
    <div className="flex flex-col gap-8">
      {/* Cosmic Welcome Banner */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-100 tracking-tight">Welcome to Your Celestial Dashboard</h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">View your alignment charts, book consultations, and read guidance from your chosen Pandit.</p>
          </div>
        </div>

        <button 
          onClick={syncProfileAndAppts}
          className="relative z-10 px-4 py-2.5 bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Details</span>
        </button>
      </div>

      {/* Profile Details & Astrologer Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Birth Details Card */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Birth Parameters</h4>
                <p className="text-[10px] text-gray-500">Your natal configuration</p>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold uppercase tracking-wider">Zodiac Sign</span>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  {zodiac}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> Date of Birth
                </span>
                <span className="text-gray-300 font-medium">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Time of Birth
                </span>
                <span className="text-gray-300 font-medium">{profile?.timeOfBirth || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Place of Birth
                </span>
                <span className="text-gray-300 font-medium truncate max-w-[150px]">{profile?.placeOfBirth || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Mobile Number
                </span>
                <span className="text-gray-300 font-medium">{profile?.mobileNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Astrologer Card */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Your Chosen Astrologer</h4>
                <p className="text-[10px] text-gray-500">Practitioner guiding your consultation</p>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {profile?.addedBy ? (
              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg">
                    🔮
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-gray-200">{profile.addedBy.name}</h5>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" /> {profile.addedBy.email}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed bg-slate-950/20 border border-white/5 p-3 rounded-xl">
                  This astrologer will write your predictions, compile remedies, and conduct sessions. You can message them during booked time slots.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4 text-center items-center justify-center">
                <HelpCircle className="w-10 h-10 text-indigo-500/60 animate-bounce" />
                <div>
                  <h5 className="font-bold text-sm text-gray-300">No Astrologer Selected</h5>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">Please select an astrologer from the directory to review your natal alignments and request remedies.</p>
                </div>
                <button
                  onClick={() => navigate('/find-astrologer')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                >
                  Browse Astrologer Directory
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Consultation Appointments */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div>
            <h4 className="font-bold text-gray-200 text-sm tracking-wide">Upcoming Consultations</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Your scheduled sessions with your preferred astrologer</p>
          </div>
          {profile?.addedBy && (
            <button 
              onClick={() => navigate('/book')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10 transition-colors"
            >
              Book New Session
            </button>
          )}
        </div>

        {loading ? (
          <div className="h-40 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse"></div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 flex flex-col gap-2 items-center">
            <span>No upcoming consultations scheduled.</span>
            {profile?.addedBy && (
              <button 
                onClick={() => navigate('/book')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer text-xs"
              >
                Schedule your first session now &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 pb-3">
                  <th className="font-semibold pb-3">Astrologer</th>
                  <th className="font-semibold pb-3">Date</th>
                  <th className="font-semibold pb-3">Time slot</th>
                  <th className="font-semibold pb-3">Type</th>
                  <th className="font-semibold pb-3">Duration</th>
                  <th className="font-semibold pb-3">Status</th>
                  <th className="font-semibold pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5">
                      <div className="font-semibold text-gray-200">{item.astrologer?.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.astrologer?.email}</div>
                    </td>
                    <td className="py-3.5 text-gray-400 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-gray-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{item.time}</span>
                      </div>
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
                    <td className="py-3.5 text-gray-300 font-medium">{item.duration} Mins</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleCancelAppointment(item._id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/10 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ml-auto text-[11px] font-bold"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
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

export default CustomerDashboard;
