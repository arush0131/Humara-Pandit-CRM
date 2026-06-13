import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendType = 'up', loading }) => {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-slate-800 rounded w-24"></div>
          <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-8 bg-slate-800 rounded w-16 mt-4"></div>
        <div className="h-3 bg-slate-800 rounded w-32 mt-3"></div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 glass-panel-hover flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle hover background highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-extrabold text-gray-100 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:border-indigo-500/20 transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 relative z-10">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendType === 'up' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : trendType === 'neutral' 
              ? 'bg-slate-500/10 text-slate-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend}
          </span>
          <span className="text-xs text-gray-500 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
