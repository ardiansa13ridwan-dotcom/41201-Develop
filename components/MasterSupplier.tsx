
import React, { useState } from 'react';
import { Supplier } from '../types';
import { Plus, Search, Edit3, Trash2, X, Check, Truck, Phone, MapPin } from 'lucide-react';

interface MasterSupplierProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
}

const MasterSupplier: React.FC<MasterSupplierProps> = ({ suppliers, onAddSupplier, onDeleteSupplier, onUpdateSupplier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: ''
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      onUpdateSupplier({ ...editingSupplier, ...formData });
      setEditingSupplier(null);
    } else {
      onAddSupplier({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
    setIsModalOpen(false);
    setFormData({ name: '', contact: '', address: '' });
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Supplier</h2>
          <p className="text-slate-500">Daftar distributor alat kesehatan & perbekalan lab</p>
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" /> Tambah Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama supplier atau kontak..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Nama Supplier</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <Truck className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3 h-3" />
                      <span className="text-sm font-mono">{supplier.contact}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 max-w-xs truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="text-xs">{supplier.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(supplier)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => onDeleteSupplier(supplier.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X /></button>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingSupplier ? 'Edit Supplier' : 'Registrasi Supplier Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Perusahaan / Supplier</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: PT. Sumber Sehat" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon / Kontak</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="08xx..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Kantor</label>
                <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Alamat lengkap..." />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 font-bold mt-4 flex items-center justify-center gap-2 transition-all">
                <Check className="w-5 h-5" /> {editingSupplier ? 'Simpan Perubahan' : 'Daftarkan Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSupplier;
