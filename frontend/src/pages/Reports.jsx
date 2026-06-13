import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Users, 
  CalendarCheck, 
  Download,
  PieChart,
  BarChart,
  Grid
} from 'lucide-react';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

const Reports = () => {
  const [clientStats, setClientStats] = useState(null);
  const [apptStats, setApptStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const clientRes = await api.get('/reports/clients');
      if (clientRes.data.success) {
        setClientStats(clientRes.data.data);
      }

      const apptRes = await api.get('/reports/appointments');
      if (apptRes.data.success) {
        setApptStats(apptRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics reporting:', error);
      setToast({ type: 'error', message: 'Failed to compile analytical indicators.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Export CSV download helper
  const handleCSVExport = async (type) => {
    try {
      const response = await api.get(`/reports/export/${type}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create browser link to trigger immediate download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setToast({ type: 'success', message: `${type.toUpperCase()} report CSV downloaded successfully!` });
    } catch (error) {
      console.error(`Error exporting ${type} CSV:`, error);
      setToast({ type: 'error', message: `Failed to compile CSV report for ${type}.` });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold text-gray-200">Reports & Data Export</h3>
        <p className="text-xs text-gray-400 mt-1">Review directory demographics, scheduled queues, and export database ledger files</p>
      </div>

      {/* CSV Exporter Box */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-gray-200 text-sm tracking-wide">Structured CSV Data Downloads</h4>
          </div>
          <p className="text-xs text-gray-400">Compile directories and financial ledgers into standard spreadsheet formats for offline accounting.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {/* Clients List Export */}
            <button
              onClick={() => handleCSVExport('clients')}
              className="p-4 bg-slate-900/60 border border-white/5 hover:border-indigo-500/35 hover:bg-slate-950/30 rounded-2xl flex items-center justify-between group transition-all duration-200 cursor-pointer"
            >
              <div className="text-left">
                <span className="font-bold text-xs text-gray-200 block group-hover:text-indigo-300 transition-colors">Client Directory</span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Download registrations data</span>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </button>

            {/* Payments List Export */}
            <button
              onClick={() => handleCSVExport('payments')}
              className="p-4 bg-slate-900/60 border border-white/5 hover:border-indigo-500/35 hover:bg-slate-950/30 rounded-2xl flex items-center justify-between group transition-all duration-200 cursor-pointer"
            >
              <div className="text-left">
                <span className="font-bold text-xs text-gray-200 block group-hover:text-indigo-300 transition-colors">Financial Ledgers</span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Download revenue receipts</span>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </button>

            {/* Appointments List Export */}
            <button
              onClick={() => handleCSVExport('appointments')}
              className="p-4 bg-slate-900/60 border border-white/5 hover:border-indigo-500/35 hover:bg-slate-950/30 rounded-2xl flex items-center justify-between group transition-all duration-200 cursor-pointer"
            >
              <div className="text-left">
                <span className="font-bold text-xs text-gray-200 block group-hover:text-indigo-300 transition-colors">Consultations Planner</span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Download scheduling lists</span>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Demographics Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Client Demographics Box */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6">
          <h4 className="font-bold text-gray-200 text-sm tracking-wide border-b border-white/5 pb-4 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Profile Demographic Factors</span>
          </h4>

          {loading ? (
            <div className="h-44 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse"></div>
          ) : !clientStats ? (
            <div className="py-8 text-center text-xs text-gray-500">No profile aggregates.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Gender ratio custom visual bars */}
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Gender Distribution Ratio</span>
                <div className="flex gap-4 mt-3">
                  {clientStats.genderDistribution.map((item, i) => {
                    const total = clientStats.totalClients || 1;
                    const percent = ((item.count / total) * 100).toFixed(0);
                    return (
                      <div key={i} className="flex-1 bg-slate-950/40 border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">{item.name}</span>
                        <div className="text-lg font-bold text-gray-200 mt-1">{item.count}</div>
                        <span className="text-[9px] text-indigo-400 font-bold">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Zodiac Distribution List */}
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Clients Zodiac Density</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 max-h-40 overflow-y-auto pr-1">
                  {clientStats.zodiacDistribution.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950/20 border border-white/5 rounded-xl px-3 py-2 text-xs">
                      <span className="text-gray-400 font-medium">{item.sign}</span>
                      <span className="font-bold text-indigo-400">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Metrics Box */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6">
          <h4 className="font-bold text-gray-200 text-sm tracking-wide border-b border-white/5 pb-4 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            <span>Schedules Density Report</span>
          </h4>

          {loading ? (
            <div className="h-44 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse"></div>
          ) : !apptStats ? (
            <div className="py-8 text-center text-xs text-gray-500">No scheduling metrics.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Status Distributions List */}
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Schedules State Breakdown</span>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {apptStats.statusDistribution.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950/20 border border-white/5 rounded-xl px-3 py-2 text-xs">
                      <span className="text-gray-400 font-medium">{item.name}</span>
                      <span className="font-bold text-gray-200">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Type Distributions */}
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Consultation Channels Breakdown</span>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {apptStats.channelDistribution.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950/20 border border-white/5 rounded-xl px-3 py-2 text-xs">
                      <span className="text-gray-400 font-medium">{item.name}</span>
                      <span className="font-bold text-indigo-400">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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

export default Reports;
