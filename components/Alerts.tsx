
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { AlertTriangle, Clock, MessageSquare, Share2, Plus, X } from 'lucide-react';

interface AlertsProps {
  items: InventoryItem[];
}

const Alerts: React.FC<AlertsProps> = ({ items }) => {
  const [adminNumbers, setAdminNumbers] = useState<string[]>(['6282187577072']);
  const [newNum, setNewNum] = useState('');

  const lowStock = items.filter(item => item.stock <= item.minStock);
  const expired = items.filter(item => new Date(item.expiryDate) < new Date());
  const nearingExpiry = items.filter(item => {
    const diff = new Date(item.expiryDate).getTime() - new Date().getTime();
    const days = diff / (1000 * 3600 * 24);
    return days > 0 && days <= 30;
  });

  const sendBulkWhatsApp = () => {
    let message = "⚠️ *LAPORAN PERINGATAN GUDANG MAXIMA*\n\n";
    
    if (lowStock.length > 0) {
      message += "🚨 *STOK RENDAH (Segera Order):*\n";
      lowStock.forEach(i => message += `- ${i.name} (Sisa ${i.stock} ${i.unit})\n`);
      message += "\n";
    }

    if (expired.length > 0 || nearingExpiry.length > 0) {
      message += "⏰ *EXPIRED / HAMPIR EXPIRED:*\n";
      [...expired, ...nearingExpiry].forEach(i => message += `- ${i.name} (Tgl: ${i.expiryDate})\n`);
    }

    if (lowStock.length === 0 && expired.length === 0 && nearingExpiry.length === 0) {
      alert("Semua stok dalam kondisi aman!");
      return;
    }

    adminNumbers.forEach(num => {
       window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistem Peringatan</h2>
          <p className="text-slate-500">Notifikasi kendali mutu stok & expired</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={sendBulkWhatsApp}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all font-bold"
          >
            <MessageSquare className="w-5 h-5" /> Kirim Ke Semua Admin
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">Nomor WhatsApp Admin Gudang</h4>
         <div className="flex flex-wrap gap-2 mb-4">
            {adminNumbers.map((num, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                {num}
                {i > 0 && <button onClick={() => setAdminNumbers(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>}
              </div>
            ))}
         </div>
         <div className="flex gap-2 max-w-xs">
            <input 
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs" 
              placeholder="Tambahkan nomor (62...)" 
              value={newNum}
              onChange={e => setNewNum(e.target.value)}
            />
            <button onClick={() => { if(newNum) { setAdminNumbers([...adminNumbers, newNum]); setNewNum(''); } }} className="p-2 bg-slate-900 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold text-amber-600 px-2"><AlertTriangle className="w-5 h-5" /> Stok Hampir Habis ({lowStock.length})</h3>
          <div className="space-y-3">
            {lowStock.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:border-amber-200">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><AlertTriangle /></div>
                <div><h4 className="font-bold text-slate-800 text-sm">{item.name}</h4><p className="text-xs text-slate-500">Sisa: {item.stock} {item.unit} (Min: {item.minStock})</p></div>
              </div>
            ))}
            {lowStock.length === 0 && <EmptyState label="Stok aman terkendali" />}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold text-rose-600 px-2"><Clock className="w-5 h-5" /> Barang Expired / Hampir Expired ({expired.length + nearingExpiry.length})</h3>
          <div className="space-y-3">
            {[...expired, ...nearingExpiry].map(item => {
               const isExp = new Date(item.expiryDate) < new Date();
               return (
                <div key={item.id} className={`bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all ${isExp ? 'border-rose-200 ring-1 ring-rose-50' : 'hover:border-rose-200'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExp ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-rose-500'}`}><Clock /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className={`text-xs font-bold ${isExp ? 'text-rose-600' : 'text-slate-500'}`}>Tgl Kadaluarsa: {item.expiryDate}</p>
                  </div>
                </div>
              );
            })}
            {(expired.length + nearingExpiry.length) === 0 && <EmptyState label="Belum ada barang expired" />}
          </div>
        </section>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
    <Share2 className="w-12 h-12 text-slate-200 mb-2" />
    <span className="text-sm font-medium text-slate-400">{label}</span>
  </div>
);

export default Alerts;
