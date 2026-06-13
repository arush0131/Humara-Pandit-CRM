import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCircle, Clock, Info, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine current section title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/clients')) return 'Client Directory';
    if (path.startsWith('/appointments')) return 'Appointment Scheduler';
    if (path.startsWith('/consultations')) return 'Consultation History';
    if (path.startsWith('/payments')) return 'Financial Ledger';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    return 'Astrologer CRM';
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 45 seconds
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-slate-900/30 border-b border-white/5 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl bg-slate-800/40 border border-white/5 text-gray-300 hover:text-white md:hidden cursor-pointer flex items-center justify-center"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-xl font-bold text-gray-100 tracking-tight">{getPageTitle()}</h2>
          <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-slate-800/80 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel shadow-2xl border border-white/10 overflow-hidden z-30">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-200">Alerts & Reminders</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-500 text-xs">
                    No active notifications or alerts
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => !item.read && markAsRead(item._id)}
                      className={`p-4 transition-all duration-200 cursor-pointer ${
                        item.read ? 'opacity-60 hover:bg-white/5' : 'bg-indigo-500/5 hover:bg-indigo-500/10'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {item.type === 'appointment' ? (
                            <Clock className="w-4 h-4 text-indigo-400" />
                          ) : item.type === 'follow_up' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Info className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-200">{item.title}</h4>
                            {!item.read && (
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.message}</p>
                          <span className="text-[10px] text-gray-500 block mt-1.5">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
