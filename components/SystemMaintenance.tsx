
import React, { useState, useEffect } from 'react';
import { Database, Cloud, RefreshCw, Smartphone, Edit2, FileSpreadsheet, CheckCircle2, Share2, Info, Copy, Terminal, AlertTriangle, XCircle, ShieldAlert, Lock, Globe, ExternalLink, HelpCircle, MousePointer2, ArrowBigUpDash } from 'lucide-react';
import { InventoryItem, Transaction, UserAccount, Supplier } from '../types';

interface SystemMaintenanceProps {
  items: InventoryItem[];
  transactions: Transaction[];
  users: UserAccount[];
  suppliers: Supplier[];
  onRestore: (data: any) => void;
  onReset: () => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  spreadsheetLink: string;
  setSpreadsheetLink: (url: string) => void;
  onFetchCloud: () => void;
  autoSync: boolean;
  setAutoSync: (v: boolean) => void;
  onSyncNow: () => void;
}

const SystemMaintenance: React.FC<SystemMaintenanceProps> = ({ 
  items, transactions, users, suppliers, onRestore, onReset, sheetUrl, setSheetUrl, spreadsheetLink, setSpreadsheetLink, onFetchCloud, autoSync, setAutoSync, onSyncNow
}) => {
  const [tempUrl, setTempUrl] = useState(sheetUrl);
  const [tempAppUrl, setTempAppUrl] = useState(() => localStorage.getItem('maxima_manual_app_url') || '');
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const isSheetLink = tempUrl.includes('docs.google.com/spreadsheets');
  const isNotExec = tempUrl.length > 10 && !tempUrl.endsWith('/exec');

  // KODE GOOGLE APPS SCRIPT v3.7
  const googleAppsScriptCode = `/**
 * MAXIMA DATABASE CONNECTOR v3.7
 * SINKRONISASI LENGKAP: INVENTORY, SUPPLIER, USER, TRANSAKSI
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = getOrCreateSheet(ss, "SISTEM_LOG");
  
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    
    // 1. UPDATE INVENTORY
    var sheetInv = getOrCreateSheet(ss, "INVENTORY");
    sheetInv.clear();
    sheetInv.appendRow(["ID", "NAMA BARANG", "SKU", "LOT", "KATEGORI", "SATUAN", "STOK", "MIN STOK", "EXPIRY", "UPDATE TERAKHIR"]);
    if(data.items && data.items.length > 0) {
      data.items.forEach(function(item) {
        sheetInv.appendRow([item.id, item.name, item.sku, item.lotNumber, item.category, item.unit, item.stock, item.minStock, item.expiryDate, item.lastUpdated]);
      });
      sheetInv.getRange("A1:J1").setBackground("#1e40af").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 2. UPDATE SUPPLIER
    var sheetSupp = getOrCreateSheet(ss, "MASTER_SUPPLIER");
    sheetSupp.clear();
    sheetSupp.appendRow(["ID", "NAMA SUPPLIER", "KONTAK", "ALAMAT"]);
    if(data.suppliers && data.suppliers.length > 0) {
      data.suppliers.forEach(function(s) {
        sheetSupp.appendRow([s.id, s.name, s.contact, s.address]);
      });
      sheetSupp.getRange("A1:D1").setBackground("#4f46e5").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 3. UPDATE USER
    var sheetUser = getOrCreateSheet(ss, "MASTER_USER");
    sheetUser.clear();
    sheetUser.appendRow(["ID", "USERNAME", "NAMA LENGKAP", "ROLE", "RUANGAN"]);
    if(data.users && data.users.length > 0) {
      data.users.forEach(function(u) {
        sheetUser.appendRow([u.id, u.username, u.fullName, u.role, u.room]);
      });
      sheetUser.getRange("A1:E1").setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 4. UPDATE TRANSAKSI
    var sheetTrans = getOrCreateSheet(ss, "TRANSAKSI_RIWAYAT");
    sheetTrans.clear();
    sheetTrans.appendRow(["TANGGAL", "NAMA BARANG", "LOT", "TIPE", "QTY", "SATUAN", "TUJUAN/SUPPLIER", "PETUGAS"]);
    if(data.transactions && data.transactions.length > 0) {
      data.transactions.forEach(function(t) {
        sheetTrans.appendRow([t.date, t.itemName, t.lotNumber, t.type, t.quantity, t.unit, t.destination || t.supplier || "-", t.requester || "Admin"]);
      });
      sheetTrans.getRange("A1:H1").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
    }

    logSheet.appendRow([new Date(), "BERHASIL", "Sinkronisasi Seluruh Tabel Berhasil"]);
    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    logSheet.appendRow([new Date(), "ERROR", err.message]);
    return ContentService.createTextOutput("ERROR: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (action === "getData") {
    var items = sheetToObjects(ss.getSheetByName("INVENTORY"));
    var suppliers = sheetToObjects(ss.getSheetByName("MASTER_SUPPLIER"));
    var users = sheetToObjects(ss.getSheetByName("MASTER_USER"));
    return ContentService.createTextOutput(JSON.stringify({items: items, suppliers: suppliers, users: users}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("READY")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data.shift();
  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { 
      var key = h.toLowerCase().replace(/\\s/g, "");
      if(key === "namabarang") key = "name";
      if(key === "namasupplier") key = "name";
      if(key === "namalengkap") key = "fullName";
      obj[key] = row[i]; 
    });
    return obj;
  });
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const saveAppUrl = () => {
    // Validasi apakah link yang dimasukkan adalah link editor (salah)
    if (tempAppUrl.includes('aistudio.google.com/apps/drive')) {
      alert("⚠️ SALAH LINK, PAK!\n\nLink yang Bapak masukkan adalah link Editor (Dapur). Link ini TIDAK BISA dibuka orang lain.\n\nKlik ikon 'KOTAK PANAH' di pojok kanan atas area aplikasi untuk dapat link yang benar.");
      return;
    }
    
    if (tempAppUrl.length < 10) {
      alert("Mohon masukkan link yang valid.");
      return;
    }

    localStorage.setItem('maxima_manual_app_url', tempAppUrl);
    alert("✅ BERHASIL! Link aplikasi disimpan. Sekarang Bapak bisa membagikan link ke teman melalui menu Dashboard > Undang Teman.");
    setShowHelp(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sistem & Koneksi</h2>
          <p className="text-sm text-slate-500 font-medium italic">Konfigurasi jembatan data ke Google Sheets.</p>
        </div>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${showHelp ? 'bg-slate-800 text-white shadow-lg' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}
        >
          {showHelp ? <XCircle className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />} 
          {showHelp ? 'TUTUP PANDUAN' : 'BANTUAN CARI LINK'}
        </button>
      </header>

      {showHelp && (
        <div className="bg-blue-700 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-blue-500/30 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ArrowBigUpDash className="w-40 h-40" />
          </div>
          <div className="flex items-start gap-4 mb-8 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ExternalLink className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Abaikan Histori Download!</h3>
              <p className="text-blue-100 text-sm mt-2 font-bold italic">Itu hanya daftar file PDF. Untuk Link Teman, ikuti tombol ini:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center font-black">1</span>
                <span className="font-black text-xs uppercase tracking-widest">Klik Ikon Ini</span>
              </div>
              <p className="text-xs font-bold leading-relaxed mb-4">
                Cari ikon <b className="bg-blue-500 px-2 py-1 rounded">Kotak dengan Panah Ke Atas</b> di pojok kanan atas layar aplikasi (tepat di bawah nama akun Google Bapak).
              </p>
              <div className="p-4 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
                <ExternalLink className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center font-black">2</span>
                <span className="font-black text-xs uppercase tracking-widest">Salin Link Baru</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                Setelah diklik, aplikasi akan terbuka di Tab Baru. **Salin alamat yang ada di atas browser (URL bar)**. Linknya akan diawali dengan <code className="bg-white/20 px-1 rounded">https://preview...</code>
              </p>
              <div className="mt-4 p-4 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                 <p className="text-[10px] font-black uppercase text-emerald-300">✓ Inilah link yang bisa dibuka teman Bapak</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT AREA */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-50 rounded-2xl">
                <Globe className="w-8 h-8 text-emerald-600" />
               </div>
               <div>
                 <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Link Aplikasi (WAJIB ISI)</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Tempel hasil langkah ke-2 di sini</p>
               </div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Paste Link Preview Di Sini:</label>
              <input 
                className={`w-full px-5 py-5 bg-white border-2 rounded-2xl text-xs font-mono outline-none transition-all mb-4 ${tempAppUrl.includes('aistudio.google.com/apps/drive') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-emerald-500'}`} 
                placeholder="https://preview-project..."
                value={tempAppUrl}
                onChange={e => setTempAppUrl(e.target.value)}
              />
              
              {tempAppUrl.includes('aistudio.google.com/apps/drive') && (
                <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-4 animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-[10px] font-black text-rose-600 leading-tight uppercase italic">
                    ⚠️ SALAH, PAK! Jangan copy link dari browser Bapak sekarang. Ikuti panduan biru di atas (Klik ikon kotak panah).
                  </p>
                </div>
              )}

              <button 
                onClick={saveAppUrl} 
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Simpan Link Untuk Berbagi
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-50 rounded-2xl">
                <Cloud className="w-8 h-8 text-blue-600" />
               </div>
               <div>
                 <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Koneksi Database Sheet</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Link /exec dari Google Script</p>
               </div>
            </div>

            <div className={`p-6 rounded-[2rem] border-2 transition-all ${isSheetLink || isNotExec ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Google Script URL (/exec)</label>
              <input 
                className="w-full px-5 py-5 bg-white border border-slate-200 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 mb-4" 
                placeholder="https://script.google.com/macros/s/.../exec"
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setSheetUrl(tempUrl); alert("Koneksi Database Disimpan!"); }} 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  SIMPAN DATABASE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SCRIPT AREA */}
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
             <div className="flex items-center gap-3">
               <Terminal className="w-5 h-5 text-blue-400" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Script Database v3.7</span>
             </div>
             <button onClick={copyScript} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-90">
               {scriptCopied ? 'TERCOPY' : 'COPY KODE'}
             </button>
          </div>
          <pre className="p-6 text-[9px] text-blue-300 font-mono overflow-y-auto max-h-96 custom-scrollbar bg-black/40 leading-relaxed italic">
            {googleAppsScriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SystemMaintenance;
