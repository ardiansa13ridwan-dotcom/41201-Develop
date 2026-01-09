
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { InventoryItem, Transaction } from '../types';
import { Package, AlertTriangle, ArrowUpCircle, Clock, Share2, CheckCircle2, Smartphone, AlertCircle, FileSpreadsheet, QrCode, X, Copy, ChevronRight, Apple, Globe } from 'lucide-react';

interface DashboardProps {
  items: InventoryItem[];
  transactions: Transaction[];
  spreadsheetLink?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions, spreadsheetLink }) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const lowStockItems = items.filter(item => item.stock <= item.minStock);
  const expiringItems = items.filter(item => {
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  const getAppUrl = () => {
    // Utamakan link yang disimpan manual oleh user
    const savedManual = localStorage.getItem('maxima_manual_app_url');
    if (savedManual && savedManual.length > 5) return savedManual;

    // Jika tidak ada, ambil origin browser tapi bersihkan dari parameter aneh
    const currentUrl = window.location.href;
    // Deteksi jika link adalah preview privat (biasanya mengandung 'usercontent.goog')
    if (currentUrl.includes('usercontent.goog')) {
      return "LINK_BELUM_DIATUR";
    }
    
    return currentUrl.split('?')[0].split('#')[0];
  };

  const handleCopyLink = () => {
    const url = getAppUrl();
    if (url === "LINK_BELUM_DIATUR") {
      alert("⚠️ Bapak belum mengatur Link Aplikasi di menu Sistem & Backup!");
      return;
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWA = () => {
    const url = getAppUrl();
    if (url === "LINK_BELUM_DIATUR") {
      alert("⚠️ Bapak belum mengatur Link Aplikasi di menu Sistem & Backup!");
      return;
    }
    const msg = `📦 *SISTEM GUDANG MAXIMA*\nSilakan gunakan link ini untuk akses stok & input barang:\n\n${url}\n\n_Gunakan browser Chrome (Android) atau Safari (iPhone) lalu pilih 'Add to Home Screen' agar muncul di layar utama._`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const chartData = items.slice(0, 8).map(item => ({
    name: item.name.length > 10 ? item.name.substring(0, 8) + '..' : item.name,
    stock: item.stock,
    min: item.minStock
  }));

  const pieData = [
    { name: 'Aman', value: Math.max(0, items.length - lowStockItems.length), color: '#10B981' },
    { name: 'Stok Tipis', value: lowStockItems.length, color: '#F59E0B' },
  ];

  const appUrl = getAppUrl();
  const isUrlSet = appUrl !== "LINK_BELUM_DIATUR";
  const appQrUrl = isUrlSet 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}`
    : '';

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">DASHBOARD GUDANG</h2>
          <p className="text-sm text-slate-500 font-medium">Logistik Laboratorium Klinik Maxima</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {spreadsheetLink && (
            <button 
              onClick={() => window.open(spreadsheetLink, '_blank')}
              className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-2xl text-xs font-black hover:bg-green-200 transition-all border border-green-200 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" /> BUKA SPREADSHEET
            </button>
          )}
          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Share2 className="w-4 h-4" /> UNDANG TEMAN
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Katalog Barang" value={items.length} icon={<Package className="text-blue-600" />} trend="Aktif" color="blue" />
        <StatCard label="Peringatan Stok" value={lowStockItems.length} icon={<AlertTriangle className="text-amber-500" />} trend="Segera Order" color="amber" isAlert={lowStockItems.length > 0} />
        <StatCard label="Barang Expired" value={expiringItems.length} icon={<Clock className="text-rose-500" />} trend="30 Hari Kedepan" color="rose" isAlert={expiringItems.length > 0} />
        <StatCard label="Transaksi Hari Ini" value={transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length} icon={<ArrowUpCircle className="text-indigo-600" />} trend="Record" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider">Monitor Stok Utama</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#64748B', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]} barSize={35}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stock <= entry.min ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-black text-slate-800 mb-6 w-full uppercase tracking-wider">Kesehatan Gudang</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-bold text-slate-600 text-xs uppercase">{entry.name}</span>
                </div>
                <span className="font-black text-slate-800 text-xs">{entry.value} Item</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute right-6 top-6 p-2 bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* QR Code Side */}
              <div className="bg-slate-50 p-10 flex flex-col items-center justify-center rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none">
                {isUrlSet ? (
                  <>
                    <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 mb-4">
                      <img src={appQrUrl} alt="App QR" className="w-48 h-48" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan Untuk Masuk</p>
                    <h4 className="font-black text-blue-600 mt-1 uppercase italic tracking-tighter">Maxima Lab Logistics</h4>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">
                      Link belum diatur!<br/>Atur di menu <b>Sistem & Backup</b> agar teman tidak kena Error 404.
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions Side */}
              <div className="p-10 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase leading-none">Undang Teman</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Akses tim logistik</p>
                </div>

                {isUrlSet ? (
                  <div className="space-y-2">
                    <button 
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-between p-4 bg-slate-100 rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Copy className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-[11px] font-mono text-slate-400 truncate">{appUrl}</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-600 uppercase ml-2">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={shareViaWA}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Share2 className="w-4 h-4" /> Kirim Ke WhatsApp
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                     <p className="text-[10px] text-rose-600 font-black uppercase leading-relaxed">
                        ⚠️ ERROR DETECTED:<br/>
                        Link yang Bapak buka saat ini bersifat PRIVAT (hanya untuk Bapak).<br/><br/>
                        SOLUSI:<br/>
                        1. Copy link di atas browser Bapak.<br/>
                        2. Masuk ke menu "Sistem & Backup".<br/>
                        3. Paste di kolom "Link Aplikasi".
                     </p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Panduan Instalasi:</p>
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center">
                      <Smartphone className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-[10px] font-black text-blue-800 uppercase leading-tight">Android</span>
                      <p className="text-[9px] text-blue-600 mt-1">Titik 3 > Add to Home</p>
                    </div>
                    <div className="flex-1 p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 flex flex-col items-center text-center">
                      <Apple className="w-6 h-6 text-rose-600 mb-2" />
                      <span className="text-[10px] font-black text-rose-800 uppercase leading-tight">iPhone</span>
                      <p className="text-[9px] text-rose-600 mt-1">Share > Add to Home</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number | string, icon: React.ReactNode, trend: string, color: string, isAlert?: boolean }> = ({ label, value, icon, trend, color, isAlert }) => (
  <div className={`p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md ${isAlert ? 'ring-2 ring-rose-500/20 bg-rose-50/10' : ''}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>{icon}</div>
      <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-slate-100 text-slate-500`}>{trend}</span>
    </div>
    <div className="text-4xl font-black text-slate-900">{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{label}</div>
  </div>
);

export default Dashboard;
