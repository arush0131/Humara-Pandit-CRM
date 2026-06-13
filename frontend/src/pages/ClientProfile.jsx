import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CalendarDays, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Sparkles,
  FileText,
  Bookmark,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { ProfileCardSkeleton } from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  
  // AI insights state
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchClientProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/clients/${id}`);
      if (response.data.success) {
        setClient(response.data.data);
        
        // Grab pre-seeded AI Insights if available from the latest consultation
        const consults = response.data.data.consultationHistory || [];
        const latestWithInsights = consults.find(c => c.aiClientInsights);
        if (latestWithInsights) {
          setAiInsights(latestWithInsights.aiClientInsights);
        }
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      setToast({ type: 'error', message: 'Failed to retrieve client profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientProfile();
  }, [id]);

  // Add a Client Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      const response = await api.post(`/clients/${id}/notes`, { text: noteText });
      if (response.data.success) {
        setClient(prev => ({
          ...prev,
          notes: response.data.data
        }));
        setNoteText('');
        setToast({ type: 'success', message: 'Quick note saved to timeline.' });
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setToast({ type: 'error', message: 'Failed to save note.' });
    }
  };

  // Delete a Client Note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note permanently?')) {
      try {
        const response = await api.delete(`/clients/${id}/notes/${noteId}`);
        if (response.data.success) {
          setClient(prev => ({
            ...prev,
            notes: response.data.data
          }));
          setToast({ type: 'success', message: 'Quick note removed.' });
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        setToast({ type: 'error', message: 'Failed to delete note.' });
      }
    }
  };

  // Generate AI Client Insights
  const handleGenerateInsights = async () => {
    setAiLoading(true);
    try {
      const response = await api.post('/consultations/ai/insights', { clientId: id });
      if (response.data.success) {
        setAiInsights(response.data.data);
        setToast({ type: 'success', message: 'AI insights generated successfully!' });
      }
    } catch (error) {
      console.error('Error generating client insights:', error);
      setToast({ type: 'error', message: 'Failed to retrieve AI insights. Try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <ProfileCardSkeleton />;
  }

  if (!client) {
    return (
      <div className="py-12 text-center text-gray-500">
        Client record not found. 
        <button onClick={() => navigate('/clients')} className="text-indigo-400 ml-2 hover:underline">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl border border-white/5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-xl font-bold text-gray-100">{client.name} Profile</h3>
          <p className="text-xs text-gray-400 mt-0.5">Details, birth parameters, and consultation timeline</p>
        </div>
      </div>

      {/* Grid Layout: Left Column (Profile & AI Insights), Right Column (Notes & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Client Info Card */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex flex-col gap-6">
              {/* Header Details */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-200">{client.name}</h4>
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-300 uppercase mt-1 inline-block tracking-wider">
                    {client.zodiac} sign
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              {/* Birth Parameters */}
              <div className="flex flex-col gap-3.5">
                <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Astrological Birth Details</h5>
                
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <CalendarDays className="w-4 h-4 text-indigo-400" />
                  <span>DOB: {new Date(client.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Time: {client.timeOfBirth}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">Place: {client.placeOfBirth}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300 capitalize">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Gender: {client.gender}</span>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              {/* Contact Information */}
              <div className="flex flex-col gap-3.5">
                <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Contact Information</h5>
                
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>{client.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300 truncate">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{client.email || 'No email registered'}</span>
                </div>
                {client.address && (
                  <div className="flex items-start gap-3 text-xs text-gray-300 leading-relaxed">
                    <MapPin className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-5 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-lg pointer-events-none" />
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <h4 className="font-bold text-gray-200 text-sm tracking-wide">AI Client Insights</h4>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={aiLoading}
                  className="p-1.5 bg-slate-800/80 border border-white/5 hover:border-indigo-500/30 rounded-lg text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1 transition-all"
                  title="Generate Insights"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{aiLoading ? 'Analyzing...' : 'Generate'}</span>
                </button>
              </div>

              {aiLoading ? (
                <div className="flex flex-col gap-3 py-6 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                </div>
              ) : aiInsights ? (
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
                  {aiInsights}
                </p>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500">
                  No insights generated yet. Click "Generate" to analyze the client's chart factors.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          
          {/* Notes Manager */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6">
            <h4 className="font-bold text-gray-200 text-sm tracking-wide border-b border-white/5 pb-4 mb-4">Quick Notes Timeline</h4>
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-3 mb-6">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log a quick note, milestone, or feedback..."
                className="flex-1 form-input-cosmic text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
              {client.notes.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">No notes written for this client.</div>
              ) : (
                client.notes.map((note) => (
                  <div key={note._id} className="flex justify-between items-start gap-4 p-3 bg-slate-950/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium">{note.text}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        Written on {new Date(note.createdAt).toLocaleString()} by {note.addedBy?.name || 'Pandit'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-1.5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consultation History */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6">
            <h4 className="font-bold text-gray-200 text-sm tracking-wide border-b border-white/5 pb-4 mb-4">Consultation Logs</h4>
            
            <div className="flex flex-col gap-6">
              {client.consultationHistory.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  No consultation sessions have been logged for this client yet.
                </div>
              ) : (
                client.consultationHistory.map((consult, index) => (
                  <div key={consult._id} className="relative pl-6 border-l border-white/10 flex flex-col gap-4">
                    {/* Timeline Node Ring */}
                    <span className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-indigo-500" />
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-gray-200">Session #{client.consultationHistory.length - index}</span>
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            {consult.type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(consult.date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Notes Section */}
                      <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Consultation Notes</span>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-line">{consult.notes}</p>
                        </div>
                        
                        {consult.predictions && (
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Astrological Predictions</span>
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-line">{consult.predictions}</p>
                          </div>
                        )}

                        {consult.remediesSuggested && (
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Remedies Suggested</span>
                            <p className="text-xs text-indigo-200 mt-1 leading-relaxed whitespace-pre-line">{consult.remediesSuggested}</p>
                          </div>
                        )}

                        {consult.followUpDate && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Recommended Follow-up: {new Date(consult.followUpDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Optional AI Summary Section */}
                      {consult.aiSummary && (
                        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Consultation Summary</span>
                          </div>
                          <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed">{consult.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
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

export default ClientProfile;
