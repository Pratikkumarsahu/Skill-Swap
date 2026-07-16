// Sidebar navigation component
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Calendar,
  User,
  LogOut,
  Sparkles,
  Star,
  Shield,
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  // Navigation tabs list
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore Matches', icon: Compass },
    { id: 'chat', label: 'Inbox Messages', icon: MessageSquare },
    { id: 'schedule', label: 'My Sessions', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  // Append admin dashboard menu item if user is platform admin
  if (user?.isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide m-0 leading-none">SkillSwap</h1>
          <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Peer-to-Peer</span>
        </div>
      </div>

      {/* User profile quick info */}
      {user && (
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="w-11 h-11 rounded-full border border-slate-700 object-cover"
            />
            {/* Green active dot indicator if online */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate leading-snug">{user.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-slate-300 font-medium">
                {user.averageRating > 0 ? user.averageRating : 'New'}
              </span>
              <span className="text-[10px] text-slate-500">
                ({user.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400'
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout button bottom panel */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
