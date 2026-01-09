
import React, { useState } from 'react';
import { UserAccount, Room } from '../types';
import { Plus, Trash2, X, Check, User as UserIcon, MapPin } from 'lucide-react';

interface MasterUserProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (user: UserAccount) => void;
}

const MasterUser: React.FC<MasterUserProps> = ({ users, onAddUser, onDeleteUser, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
    room: Room.GUDANG
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData });
      setEditingUser(null);
    } else {
      onAddUser({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
    setIsModalOpen(false);
    setFormData({ username: '', password: '', fullName: '', role: 'STAFF', room: Room.GUDANG });
  };

  const handleEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      role: user.role,
      room: user.room
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master User</h2>
          <p className="text-slate-500">Manajemen akses akun karyawan Logistik Maxima</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" /> Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Nama & Ruangan</th>
                <th className="px-6 py-5">Username</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${user.role === 'STAFF' ? 'bg-blue-600' : 'bg-slate-500'}`}>
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{user.fullName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-2 h-2" /> {user.room}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-slate-500">{user.username}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role === 'STAFF' ? 'Staff Gudang' : 'Admin Ruangan'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-8 text-slate-300 hover:text-slate-600"><X /></button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              {editingUser ? 'Update User Akun' : 'Registrasi User Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Masukkan Nama Lengkap..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 text-indigo-600">Nama Ruangan</label>
                <select 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                  value={formData.room} 
                  onChange={e => setFormData({...formData, room: e.target.value as Room})}
                >
                  {Object.values(Room).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="User ID..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input required type="password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Level Akses</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, role: 'STAFF'})} className={`py-4 rounded-2xl text-[10px] font-bold transition-all border ${formData.role === 'STAFF' ? 'bg-white border-blue-500 text-blue-600 shadow-md ring-2 ring-blue-50' : 'bg-slate-50 border-transparent text-slate-400'}`}>STAFF GUDANG (Full)</button>
                  <button type="button" onClick={() => setFormData({...formData, role: 'ADMIN'})} className={`py-4 rounded-2xl text-[10px] font-bold transition-all border ${formData.role === 'ADMIN' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 border-transparent text-slate-400'}`}>ADMIN RUANGAN</button>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-black font-bold mt-6 flex items-center justify-center gap-2 transition-all active:scale-95">
                <Check className="w-5 h-5" /> {editingUser ? 'Simpan Perubahan' : 'Daftarkan User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterUser;
