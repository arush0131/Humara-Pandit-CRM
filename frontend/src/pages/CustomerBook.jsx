import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  IndianRupee, 
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotificationToast from '../components/NotificationToast';

const CustomerBook = () => {
  const { profile } = useAuth();
  const [astrologerDetails, setAstrologerDetails] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState('video');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchSelectedAstrologerProfile = async () => {
    if (!profile?.addedBy) {
      setPageLoading(false);
      return;
    }

    const targetId = typeof profile.addedBy === 'object' ? profile.addedBy._id : profile.addedBy;

    try {
      const response = await api.get('/auth/customer/astrologers');
      if (response.data.success) {
        const match = response.data.data.find(a => a._id === targetId);
        if (match) {
          setAstrologerDetails(match);
        }
      }
    } catch (error) {
      console.error('Failed to load astrologer details for booking:', error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedAstrologerProfile();
  }, [profile]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setToast({ type: 'error', message: 'Please fill in the date and time slot.' });
      return;
    }

    setLoading(true);
    try {
      const hourlyRate = astrologerDetails?.profile?.hourlyRate || 0;
      const calculatedPrice = Math.round((Number(duration) / 60) * hourlyRate);

      const response = await api.post('/appointments', {
        date,
        time,
        duration: Number(duration),
        type,
        price: calculatedPrice,
        notes,
      });

      if (response.data.success) {
        setToast({ type: 'success', message: 'Your consultation has been booked successfully!' });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to request appointment slot.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const hourlyRate = astrologerDetails?.profile?.hourlyRate || 0;
  const calculatedPrice = Math.round((Number(duration) / 60) * hourlyRate);

  if (pageLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile?.addedBy) {
    return (
      <div className="glass-panel border border-white/5 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 flex flex-col items-center gap-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 animate-pulse" />
        <div>
          <h3 className="text-xl font-bold text-gray-200">No Astrologer Selected</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Before you can request or schedule an alignment consultation, you must select your preferred Pandit from our available practitioners directory.
          </p>
        </div>
        <button
          onClick={() => navigate('/find-astrologer')}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center gap-2"
        >
          <span>Select an Astrologer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-gray-100">Schedule Consultation</h3>
        <p className="text-xs text-gray-400 mt-0.5">Book a custom video/audio reading slot with your selected guide</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Astrologer Quick Info Card */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 md:col-span-1 h-fit flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Booked With
          </h4>
          
          <div className="flex flex-col gap-3 mt-2">
            <div>
              <h5 className="font-bold text-sm text-gray-200">{astrologerDetails?.name || 'Your Pandit'}</h5>
              <span className="text-[10px] text-indigo-400 font-semibold">{astrologerDetails?.profile?.specializations?.join(', ') || 'Vedic'}</span>
            </div>
            
            <div className="h-px bg-white/5 w-full" />
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Hourly Rate</span>
              <span className="text-gray-200 font-bold">₹{hourlyRate}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Selected Duration</span>
              <span className="text-gray-200 font-bold">{duration} Mins</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2 mt-1">
              <span className="text-indigo-400 font-bold">Consult Fee</span>
              <span className="text-indigo-300 font-extrabold text-sm flex items-center">
                <IndianRupee className="w-3.5 h-3.5" /> {calculatedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Form Card */}
        <form onSubmit={handleBookingSubmit} className="glass-panel border border-white/5 rounded-3xl p-6 md:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full form-input-cosmic pl-12 text-xs"
                  required
                />
              </div>
            </div>

            {/* Time slot Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Select Time (HH:MM)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full form-input-cosmic pl-12 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Session Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full form-input-cosmic text-xs"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes (1 Hour)</option>
              </select>
            </div>

            {/* Type Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Consultation Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full form-input-cosmic text-xs"
              >
                <option value="video">Video Call (Webinar link)</option>
                <option value="audio">Voice Consultation</option>
                <option value="chat">Chat / Text Reading</option>
              </select>
            </div>
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Topics or Concerns for Discussion</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Career growth, marital compatibility matching, gemstone recommendations..."
              className="w-full form-input-cosmic text-xs min-h-[100px] py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Scheduling Session...' : 'Confirm and Book Consultation'}
          </button>
        </form>
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

export default CustomerBook;
