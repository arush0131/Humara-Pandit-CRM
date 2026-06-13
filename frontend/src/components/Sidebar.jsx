import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  FileText, 
  IndianRupee, 
  BarChart3, 
  UserCircle,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'astrologer'] },
    { name: 'Clients', path: '/clients', icon: Users, roles: ['admin', 'astrologer'] },
    { name: 'Appointments', path: '/appointments', icon: CalendarDays, roles: ['admin', 'astrologer'] },
    { name: 'Consultations', path: '/consultations', icon: FileText, roles: ['admin', 'astrologer'] },
    { name: 'Revenue Tracking', path: '/payments', icon: IndianRupee, roles: ['admin', 'astrologer'] },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3, roles: ['admin', 'astrologer'] },
    { name: 'Astrologers', path: '/astrologers', icon: UserCircle, roles: ['admin'] },
  ];

  // Filter links by user role
  const allowedLinks = links.filter(link => link.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-white/5 backdrop-blur-xl h-screen sticky top-0 flex flex-col justify-between p-6 z-20">
      <div className="flex flex-col gap-8">
        {/* CRM Brand/Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-float" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              Humara Pandit
            </h1>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
              Astrologer CRM
            </span>
          </div>
        </div>

        {/* User Quick Info */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/50 flex items-center justify-center border border-indigo-500/20">
            <UserCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-gray-200 truncate">{user?.name}</h4>
            <span className="text-xs text-indigo-300 font-medium capitalize bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {allowedLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
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
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
