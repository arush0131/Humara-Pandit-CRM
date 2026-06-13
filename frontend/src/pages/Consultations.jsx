import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Bookmark, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

const Consultations = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Prefilled from dashboard / appointments trigger
  const prefilledAppt = location.state?.prefilledAppt || null;

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);

  // Form Fields
  const [formData, setFormData] = useState({
    clientId: '',
    notes: '',
    predictions: '',
    remediesSuggested: '',
    followUpDate: '',
    paymentAmount: 0,
    paymentMethod: 'upi',
    aiSummary: '',
    aiFollowUpNotes: '',
    aiClientInsights: '',
  });

  // Loaders
  const [btnLoading, setBtnLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiFollowUpLoading, setAiFollowUpLoading] = useState(false);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  const [toast, setToast] = useState(null);

  // Load clients lists
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients?limit=100');
        if (response.data.success) {
          setClients(response.data.data);
          
          if (prefilledAppt && prefilledAppt.client) {
            setFormData(prev => ({
              ...prev,
              clientId: prefilledAppt.client._id,
              paymentAmount: prefilledAppt.price,
            }));
            fetchClientHistory(prefilledAppt.client._id);
          } else if (response.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              clientId: response.data.data[0]._id,
            }));
            fetchClientHistory(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Error loading client dropdown:', error);
      }
    };
    fetchClients();
  }, [prefilledAppt]);

  // Load history on client select change
  const handleClientChange = (e) => {
    const cid = e.target.value;
    setFormData(prev => ({
      ...prev,
      clientId: cid,
    }));
    fetchClientHistory(cid);
  };

  const fetchClientHistory = async (clientId) => {
    if (!clientId) return;
    try {
      const response = await api.get(`/clients/${clientId}`);
      if (response.data.success) {
        setSelectedClient(response.data.data);
        setClientHistory(response.data.data.consultationHistory || []);
      }
    } catch (error) {
      console.error('Error fetching client details/history:', error);
    }
  };

  // 1. AI Summary generator
  const triggerAISummary = async () => {
    if (!formData.notes) {
      setToast({ type: 'error', message: 'Please enter consultation notes first.' });
      return;
    }
    setAiSummaryLoading(true);
    try {
      const response = await api.post('/consultations/ai/summary', {
        clientId: formData.clientId,
        notes: formData.notes,
        predictions: formData.predictions,
      });
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          aiSummary: response.data.data,
        }));
        setToast({ type: 'success', message: 'AI summary generated!' });
      }
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Failed to generate summary.' });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // 2. AI Follow-up generator
  const triggerAIFollowUp = async () => {
    setAiFollowUpLoading(true);
    try {
      const response = await api.post('/consultations/ai/followup', {
        clientId: formData.clientId,
        remedies: formData.remediesSuggested,
        followUpDate: formData.followUpDate || null,
      });
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          aiFollowUpNotes: response.data.data,
        }));
        setToast({ type: 'success', message: 'AI follow-up notes generated!' });
      }
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Failed to generate reminders.' });
    } finally {
      setAiFollowUpLoading(false);
    }
  };

  // 3. AI Insights generator
  const triggerAIInsights = async () => {
    setAiInsightsLoading(true);
    try {
      const response = await api.post('/consultations/ai/insights', {
        clientId: formData.clientId,
      });
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          aiClientInsights: response.data.data,
        }));
        setToast({ type: 'success', message: 'AI client insights computed!' });
      }
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Failed to generate insights.' });
    } finally {
      setAiInsightsLoading(false);
    }
  };

  // Log consultation submit
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.notes) {
      setToast({ type: 'error', message: 'Please enter notes to log consultation.' });
      return;
    }
    setBtnLoading(true);

    try {
      const submitPayload = {
        ...formData,
        appointmentId: prefilledAppt?._id || null,
      };

      const response = await api.post('/consultations', submitPayload);
      if (response.data.success) {
        setToast({ type: 'success', message: 'Consultation session logged successfully!' });
        
        // Reset form
        setFormData({
          clientId: clients[0]?._id || '',
          notes: '',
          predictions: '',
          remediesSuggested: '',
          followUpDate: '',
          paymentAmount: 0,
          paymentMethod: 'upi',
          aiSummary: '',
          aiFollowUpNotes: '',
          aiClientInsights: '',
        });

        // Redirect to dashboard or refresh profile history
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Failed to log consultation record.' });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold text-gray-200">Consultation Workspace</h3>
        <p className="text-xs text-gray-400 mt-1">
          {prefilledAppt 
            ? `Logging active scheduled slot for ${prefilledAppt.client?.name}` 
            : 'Select client, write notes, and leverage Gemini AI planetary summaries'}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Worksheet Panel */}
        <form onSubmit={handleConsultSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-5">
            {/* Prefilled indicator banner */}
            {prefilledAppt && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-3 text-xs text-indigo-300">
                <Clock className="w-4 h-4 text-indigo-400 mt-0.5" />
                <div>
                  <span className="font-bold">Prefilled from Scheduled Slot:</span> {prefilledAppt.time} on {new Date(prefilledAppt.date).toLocaleDateString()} for ₹{prefilledAppt.price}. Saving this worksheet completes the scheduling slot.
                </div>
              </div>
            )}

            {/* Select Client */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select Client Profile *</label>
              <select
                disabled={!!prefilledAppt}
                value={formData.clientId}
                onChange={handleClientChange}
                className="form-input-cosmic text-xs appearance-none cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.mobileNumber})</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Session Reading Notes *</label>
                <button
                  type="button"
                  onClick={triggerAISummary}
                  disabled={aiSummaryLoading || !formData.notes}
                  className="px-2 py-1 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-[9px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  <span>{aiSummaryLoading ? 'Generating Summary...' : 'Summarize Notes'}</span>
                </button>
              </div>
              <textarea
                required
                rows={5}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Log birth chart aspects discussed, transit positions, planetary periods (dashas), and client concerns..."
                className="form-input-cosmic text-xs leading-relaxed"
              />
            </div>

            {/* Predictions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Planetary Predictions</label>
              <textarea
                rows={3}
                value={formData.predictions}
                onChange={(e) => setFormData({ ...formData, predictions: e.target.value })}
                placeholder="Specific future timelines (e.g., career growth starting September, compatibility notes)..."
                className="form-input-cosmic text-xs leading-relaxed"
              />
            </div>

            {/* Remedies */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Remedies Suggested</label>
                <button
                  type="button"
                  onClick={triggerAIFollowUp}
                  disabled={aiFollowUpLoading}
                  className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg text-[9px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  <span>{aiFollowUpLoading ? 'Creating Reminders...' : 'Create Reminders'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={formData.remediesSuggested}
                onChange={(e) => setFormData({ ...formData, remediesSuggested: e.target.value })}
                placeholder="Gemstones, planetary chants, charity suggestions, fast days..."
                className="form-input-cosmic text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Follow-up Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Consultation insights generator trigger */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chart insights</label>
                <button
                  type="button"
                  onClick={triggerAIInsights}
                  disabled={aiInsightsLoading}
                  className="w-full h-[42px] bg-purple-500/10 border border-purple-500/25 hover:border-purple-500/40 rounded-xl text-xs font-semibold text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>{aiInsightsLoading ? 'Analyzing Chart...' : 'Analyze Chart insights'}</span>
                </button>
              </div>
            </div>

            {/* Financials Logging Section */}
            <div className="h-px bg-white/5 w-full my-2" />
            <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Billing & Payment Settlement</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Session Charge (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: Number(e.target.value) })}
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="form-input-cosmic text-xs appearance-none cursor-pointer"
                >
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="cash">Cash Settlement</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Net Banking</option>
                  <option value="other">Other Method</option>
                </select>
              </div>
            </div>

            {/* AI previews if any have been generated */}
            {(formData.aiSummary || formData.aiFollowUpNotes || formData.aiClientInsights) && (
              <div className="flex flex-col gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-4 mt-2">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">AI Generation Preview:</span>
                
                {formData.aiSummary && (
                  <div>
                    <h6 className="text-[10px] text-gray-500 font-semibold uppercase">Summary Preview:</h6>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{formData.aiSummary}</p>
                  </div>
                )}
                
                {formData.aiFollowUpNotes && (
                  <div>
                    <h6 className="text-[10px] text-gray-500 font-semibold uppercase">Reminders Preview:</h6>
                    <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed whitespace-pre-line">{formData.aiFollowUpNotes}</p>
                  </div>
                )}

                {formData.aiClientInsights && (
                  <div>
                    <h6 className="text-[10px] text-gray-500 font-semibold uppercase">Insights Preview:</h6>
                    <p className="text-xs text-purple-200/80 mt-1 leading-relaxed whitespace-pre-line">{formData.aiClientInsights}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={btnLoading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 mt-4"
            >
              {btnLoading ? 'Logging Record...' : 'Log & Save Consultation'}
            </button>
          </div>
        </form>

        {/* Right side history display panel */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Client Details Preview Card */}
          {selectedClient && (
            <div className="glass-panel border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">{selectedClient.name}</h4>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">{selectedClient.zodiac} sign</span>
                </div>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="text-[11px] text-gray-400 flex flex-col gap-2">
                <div>• Born on: {new Date(selectedClient.dateOfBirth).toLocaleDateString()}</div>
                <div>• Time: {selectedClient.timeOfBirth}</div>
                <div>• Place: {selectedClient.placeOfBirth}</div>
                <div>• Mobile: {selectedClient.mobileNumber}</div>
              </div>
            </div>
          )}

          {/* Historical Consultation logs quick overview */}
          <div className="glass-panel border border-white/5 rounded-3xl p-5 flex-1 flex flex-col gap-4">
            <h4 className="font-bold text-sm text-gray-200 tracking-wide border-b border-white/5 pb-3">Session Timeline</h4>
            
            <div className="flex flex-col gap-5 overflow-y-auto max-h-[500px] pr-1">
              {clientHistory.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">No previous consult logs found.</div>
              ) : (
                clientHistory.map((item, index) => (
                  <div key={item._id} className="relative pl-5 border-l border-white/10 flex flex-col gap-1.5">
                    <span className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-500" />
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-indigo-400 uppercase tracking-widest">Session #{clientHistory.length - index}</span>
                      <span className="text-gray-500 font-semibold">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed truncate">{item.notes}</p>
                    {item.remediesSuggested && (
                      <span className="text-[9px] text-indigo-300 font-medium">Remedy: {item.remediesSuggested.substring(0, 45)}...</span>
                    )}
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

export default Consultations;
