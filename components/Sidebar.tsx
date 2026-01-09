
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { View, Room } from '../types';
import { LogOut, Code, MapPin, X, FileSpreadsheet, ExternalLink, Share2 } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  currentUserFullName: string;
  currentUserRole: 'ADMIN' | 'STAFF';
  currentUserRoom: Room;
  isOpen: boolean;
  onClose: () => void;
  spreadsheetLink?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onLogout, 
  currentUserFullName, 
  currentUserRole, 
  currentUserRoom,
  isOpen,
  onClose,
  spreadsheetLink
}) => {
  const allowedItems = NAVIGATION_ITEMS.filter(item => {
    if (currentUserRole === 'ADMIN') {
      return item.id === 'OUTBOUND' || item.id === 'DASHBOARD';
    }
    return true;
  });

  return (
    <div className={`
      fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col text-white shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Header */}
      <div className="p-6 shrink-0 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none uppercase tracking-tighter">MAXIMA</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Logistik System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 py-6">
        <nav className="space-y-1.5">
          {allowedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.icon}
              </span>
              <span className="font-semibold text-[11px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Akses Cepat */}
        <div className="mt-8 px-2 space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Akses & Berbagi</p>
          
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl hover:bg-blue-600/20 transition-all font-bold"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Undang Team</span>
          </button>

          {spreadsheetLink && (
            <button 
              onClick={() => window.open(spreadsheetLink, '_blank')}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-green-600/10 text-green-400 border border-green-600/20 rounded-xl hover:bg-green-600/20 transition-all font-bold"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-wider">Database Sheet</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 shrink-0 space-y-4">
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">
             {currentUserRole === 'STAFF' ? 'Staff Gudang:' : 'Admin Ruangan:'}
           </p>
           <p className="text-xs font-bold text-blue-400 truncate mb-1 uppercase tracking-tight">{currentUserFullName}</p>
           <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase italic">
             <MapPin className="w-2.5 h-2.5" /> {currentUserRoom}
           </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
