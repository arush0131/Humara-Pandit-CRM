import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  Sparkles, 
  LogOut,
  UserCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Find Astrologer', path: '/find-astrologer', icon: Search },
    { name: 'Book Consultation', path: '/book', icon: Calendar },
    { name: 'My Remedies & AI Predictions', path: '/remedies', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-955 bg-opacity-80 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 bg-slate-900 border-r border-white/5 md:bg-slate-900/60 backdrop-blur-xl h-screen fixed md:sticky top-0 flex flex-col justify-between p-6 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col gap-6">
          {/* Close button for mobile inside sidebar */}
          <div className="md:hidden flex justify-end">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Portal Brand/Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white animate-float" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
                Humara Pandit
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
                Customer Portal
              </span>
            </div>
          </div>

          {/* User Quick Info */}
          <div className="bg-slate-955 border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/50 flex items-center justify-center border border-indigo-500/20">
              <UserCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-200 truncate">{user?.name}</h4>
              <span className="text-xs text-indigo-300 font-medium capitalize bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-indigo-500/20">
                Customer
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm border ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 border-indigo-500/30 text-indigo-200 shadow-md shadow-indigo-500/5'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
