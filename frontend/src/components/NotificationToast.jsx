import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bgColor: 'bg-slate-900/90 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      shadowColor: 'shadow-emerald-500/10'
    },
    error: {
      bgColor: 'bg-slate-900/90 border-rose-500/30 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      shadowColor: 'shadow-rose-500/10'
    },
    info: {
      bgColor: 'bg-slate-900/90 border-indigo-500/30 text-indigo-200',
      icon: Info,
      iconColor: 'text-indigo-400',
      shadowColor: 'shadow-indigo-500/10'
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 border rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${config.bgColor} ${config.shadowColor}`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <span className="text-xs font-semibold tracking-wide">{message}</span>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors ml-4 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
