import React from 'react';

export const MonthlyRevenueChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-500">
        No revenue data to display
      </div>
    );
  }

  // Find max value for scaling
  const maxVal = Math.max(...data.map((d) => d.revenue), 100);
  
  return (
    <div className="flex flex-col h-64 justify-between pt-4">
      {/* SVG Bar Chart */}
      <div className="flex-1 flex items-end gap-6 px-4 pb-2 relative">
        {/* Y-Axis Guidelines */}
        <div className="absolute inset-x-0 bottom-2 top-4 flex flex-col justify-between pointer-events-none">
          <div className="border-t border-white/5 w-full text-[10px] text-gray-600 pt-1">
            ₹{Math.round(maxVal)}
          </div>
          <div className="border-t border-white/5 w-full text-[10px] text-gray-600 pt-1">
            ₹{Math.round(maxVal / 2)}
          </div>
          <div className="border-t border-white/5 w-full"></div>
        </div>

        {/* Dynamic Bars */}
        {data.map((d, index) => {
          const percentHeight = (d.revenue / maxVal) * 85; // cap height at 85% for styling
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
              {/* Tooltip */}
              <span className="absolute -top-8 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                ₹{d.revenue}
              </span>
              
              <div 
                className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/10 cursor-pointer"
                style={{ height: `${Math.max(percentHeight, 4)}%` }} // Ensure minor height visible
              />
            </div>
          );
        })}
      </div>

      {/* X-Axis labels */}
      <div className="flex gap-6 border-t border-white/5 pt-3 px-4">
        {data.map((d, index) => (
          <span key={index} className="flex-1 text-center text-[10px] font-semibold text-gray-500 tracking-wider">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};

export const PaymentMethodPie = ({ data = [] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-500">
        No transaction logs registered
      </div>
    );
  }

  // Ring slices generator variables
  let accumulatedPercent = 0;
  const colors = [
    'stroke-indigo-500', 
    'stroke-purple-500', 
    'stroke-emerald-500', 
    'stroke-amber-500', 
    'stroke-rose-500'
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 h-64">
      {/* SVG Donut Circle */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="3.2" />
          {data.map((d, i) => {
            const percent = (d.value / total) * 100;
            if (percent === 0) return null;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                className={`${colors[i % colors.length]} transition-all duration-500`}
                strokeWidth="3.2"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total Revenue</span>
          <span className="text-xl font-extrabold text-gray-100 mt-1">₹{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {data.map((d, i) => {
          const colorDot = [
            'bg-indigo-500', 
            'bg-purple-500', 
            'bg-emerald-500', 
            'bg-amber-500', 
            'bg-rose-500'
          ];
          const percent = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
          if (d.value === 0) return null;

          return (
            <div key={i} className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colorDot[i % colorDot.length]}`} />
                <span className="text-gray-400 font-medium">{d.method}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-200 font-bold">₹{d.value}</span>
                <span className="text-gray-500 text-[10px] font-semibold ml-2">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
