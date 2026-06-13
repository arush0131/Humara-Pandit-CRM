import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Award, 
  Briefcase, 
  IndianRupee, 
  CheckCircle,
  HelpCircle,
  Mail
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotificationToast from '../components/NotificationToast';

const CustomerAstrologers = () => {
  const { profile, updateProfile } = useAuth();
  const [astrologers, setAstrologers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAstrologersList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/customer/astrologers');
      if (response.data.success) {
        setAstrologers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load astrologers directory:', error);
      setToast({ type: 'error', message: 'Failed to retrieve astrologers list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologersList();
  }, []);

  const handleSelectAstrologer = async (astrologerId) => {
    try {
      const response = await api.put('/auth/customer/select-astrologer', { astrologerId });
      if (response.data.success) {
        setToast({ type: 'success', message: 'Your preferred astrologer has been set.' });
        // Refresh local User Context profile
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          updateProfile(meRes.data.user, meRes.data.profile);
        }
      }
    } catch (error) {
      console.error('Error selecting astrologer:', error);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to select astrologer.' 
      });
    }
  };

  const filteredAstrologers = astrologers.filter(astro => 
    astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    astro.profile?.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100">Astrologer Directory</h3>
          <p className="text-xs text-gray-400 mt-0.5">Browse available Pandits and select your preferred guide</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full form-input-cosmic pl-10 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-800/10 border border-white/5 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredAstrologers.length === 0 ? (
        <div className="py-20 text-center text-gray-500 flex flex-col gap-2 items-center">
          <HelpCircle className="w-12 h-12 text-gray-600" />
          <span className="text-sm">No astrologers match your search details.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAstrologers.map((astro) => {
            const isSelected = profile?.addedBy?._id === astro._id || profile?.addedBy === astro._id;
            const specialities = astro.profile?.specializations || ['Vedic'];

            return (
              <div 
                key={astro._id} 
                className={`glass-panel border rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isSelected 
                    ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 shadow-lg shadow-indigo-500/5' 
                    : 'border-white/5 hover:border-white/10 hover:translate-y-[-2px]'
                }`}
              >
                {/* Glow for active/selected card */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex flex-col gap-4">
                  {/* Astrologer Identity */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                      🔮
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-gray-200 text-sm truncate">{astro.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-indigo-400" /> {astro.email}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  {/* Specializations list */}
                  <div className="flex flex-wrap gap-1.5">
                    {specialities.map((spec, sidx) => (
                      <span 
                        key={sidx}
                        className="px-2 py-0.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300/80 rounded-lg text-[9px] font-semibold tracking-wide"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Experience & Fee */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/25 border border-white/5 rounded-2xl p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-400" /> Experience
                      </span>
                      <span className="text-gray-300 font-semibold">{astro.profile?.experienceYears || 0} Years Exp</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-indigo-400" /> Consultation Fee
                      </span>
                      <span className="text-gray-300 font-semibold">₹{astro.profile?.hourlyRate || 0} / Hr</span>
                    </div>
                  </div>

                  {/* Bio Description */}
                  {astro.profile?.bio ? (
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3 italic">
                      "{astro.profile.bio}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 leading-relaxed italic">
                      "Expert Vedic guide specializing in astrology readings, gemstones counseling, and destiny chart analysis."
                    </p>
                  )}
                </div>

                {/* Selection Action Button */}
                <div className="mt-6">
                  {isSelected ? (
                    <button
                      disabled
                      className="w-full h-10 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                      <span>Selected Astrologer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectAstrologer(astro._id)}
                      className="w-full h-10 bg-slate-800 hover:bg-slate-700 hover:text-white text-gray-300 border border-white/5 hover:border-indigo-500/30 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Select as My Astrologer</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

export default CustomerAstrologers;
