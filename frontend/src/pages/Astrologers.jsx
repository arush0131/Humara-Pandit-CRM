import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  UserPlus, 
  Sparkles, 
  Mail, 
  Phone, 
  BookOpen, 
  Coins, 
  Clock,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';

const Astrologers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specializations: 'Vedic',
    experienceYears: '',
    hourlyRate: '',
    bio: '',
  });

  const [toast, setToast] = useState(null);

  // Fetch astrologers list
  const loadAstrologers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/astrologers');
      if (response.data.success) {
        setAstrologers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading astrologers:', error);
      setToast({ type: 'error', message: 'Failed to retrieve astrologer directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAstrologers();
    }
  }, [user]);

  // Open modal
  const openModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specializations: 'Vedic',
      experienceYears: '',
      hourlyRate: '',
      bio: '',
    });
    setIsModalOpen(true);
  };

  // Form validations
  const validateForm = () => {
    const { name, email, password, experienceYears, hourlyRate } = formData;
    if (!name || !email || !password || !experienceYears || !hourlyRate) {
      setToast({ type: 'error', message: 'Please complete all required fields (*).' });
      return false;
    }
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      setToast({ type: 'error', message: 'Please provide a valid email format.' });
      return false;
    }
    if (password.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters.' });
      return false;
    }
    if (Number(experienceYears) < 0 || Number(hourlyRate) < 0) {
      setToast({ type: 'error', message: 'Rates and Experience cannot be negative numbers.' });
      return false;
    }
    return true;
  };

  // Save new astrologer
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBtnLoading(true);

    try {
      // Split specializations text into array
      const specsArray = formData.specializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const submitPayload = {
        ...formData,
        role: 'astrologer',
        specializations: specsArray,
        experienceYears: Number(formData.experienceYears),
        hourlyRate: Number(formData.hourlyRate),
      };

      const response = await api.post('/auth/astrologers', submitPayload);
      if (response.data.success) {
        setToast({ type: 'success', message: 'New astrologer registered successfully!' });
        setIsModalOpen(false);
        loadAstrologers();
      }
    } catch (error) {
      console.error('Error creating astrologer:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Error occurred while saving profile.'
      });
    } finally {
      setBtnLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-16 text-center text-rose-400 flex flex-col items-center gap-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 animate-float" />
        <h4 className="font-bold">Access Forbidden</h4>
        <p className="text-xs text-gray-500">Only system administrators can access this view.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Astrologers Management</h3>
          <p className="text-xs text-gray-400 mt-1">Manage practitioner logins, billing configurations, and specialized bios</p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Astrologer</span>
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : astrologers.length === 0 ? (
        <div className="glass-panel border border-white/5 rounded-3xl p-16 text-center text-gray-500">
          No registered astrologers found in the directory.
        </div>
      ) : (
        <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-slate-900/20">
                  <th className="font-semibold px-6 py-4">Astrologer</th>
                  <th className="font-semibold px-6 py-4">Specializations</th>
                  <th className="font-semibold px-6 py-4">Experience</th>
                  <th className="font-semibold px-6 py-4">Billing Rate</th>
                  <th className="font-semibold px-6 py-4">Bio / Qualifications</th>
                  <th className="font-semibold px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {astrologers.map((astro) => (
                  <tr key={astro.user?._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-200">
                      <div className="text-sm font-semibold">{astro.user?.name}</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">{astro.user?.email}</div>
                      <div className="text-[10px] text-indigo-400 font-medium mt-0.5">{astro.profile?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(astro.profile?.specializations || []).map((spec, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 tracking-wider">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{astro.profile?.experienceYears || 0} Years Exp</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-indigo-400" />
                        <span>₹{astro.profile?.hourlyRate || 0} / Hr</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={astro.profile?.bio}>
                      {astro.profile?.bio || 'No bio written.'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        astro.user?.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {astro.user?.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Register Astrologer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-200 mb-6">Register New Astrologer</h3>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acharya Ramesh Shastri"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. shastri@astrocrm.com"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password * (Min 6 characters)</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +919876543210"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Specializations */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Specializations (Comma separated)</label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="e.g. Vedic, Vastu, Numerology"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Experience Years */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Experience (Years) *</label>
                <input
                  type="number"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  placeholder="e.g. 10"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Hourly Rate */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Billing Rate (₹/Hr) *</label>
                <input
                  type="number"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="e.g. 100"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Professional Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell clients and staff about their expertise..."
                  className="form-input-cosmic text-xs h-20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 md:col-span-2 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {btnLoading ? 'Saving...' : 'Register Profile'}
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

export default Astrologers;
