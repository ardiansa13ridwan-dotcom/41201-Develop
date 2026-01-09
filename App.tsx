
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MasterInventory from './components/MasterInventory';
import MasterSupplier from './components/MasterSupplier';
import Inbound from './components/Inbound';
import Outbound from './components/Outbound';
import Alerts from './components/Alerts';
import Reports from './components/Reports';
import MasterUser from './components/MasterUser';
import SystemMaintenance from './components/SystemMaintenance';
import { View, InventoryItem, Transaction, UserAccount, Room, Supplier } from './types';
import { MOCK_ITEMS, MOCK_USERS, MOCK_SUPPLIERS } from './constants';
import { Lock, User, ShieldCheck, Cloud, RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('maxima_auto_sync') === 'true');
  
  const STORAGE_KEYS = {
    ITEMS: 'maxima_v3_items',
    USERS: 'maxima_v3_users',
    SUPPLIERS: 'maxima_v3_suppliers',
    TRANSACTIONS: 'maxima_v3_transactions',
    SHEET_URL: 'maxima_v3_sheet_url',
    SPREADSHEET_LINK: 'maxima_v3_spreadsheet_link'
  };

  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem(STORAGE_KEYS.SHEET_URL) || '');
  const [spreadsheetLink, setSpreadsheetLink] = useState(() => localStorage.getItem(STORAGE_KEYS.SPREADSHEET_LINK) || '');
  
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return saved ? JSON.parse(saved) : MOCK_ITEMS;
  });
  
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // SINKRONISASI KE CLOUD
  const syncToCloud = useCallback(async (currentData?: any) => {
    const targetUrl = sheetUrl.trim();
    
    if (targetUrl.includes('docs.google.com/spreadsheets')) {
      alert("⚠️ ERROR: Link Salah! Gunakan link dari tombol Deploy yang berakhiran /exec.");
      return;
    }

    if (!targetUrl || !targetUrl.startsWith('https://script.google.com') || !targetUrl.endsWith('/exec')) {
      return;
    }
    
    setIsCloudSyncing(true);
    try {
      const payload = currentData || { 
        items, 
        users, 
        suppliers, 
        transactions: transactions.slice(0, 800)
      };
      
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        }
      });
      console.log("Data dikirim ke Cloud.");
    } catch (error) {
      console.error("Gagal Sync:", error);
    } finally {
      setTimeout(() => setIsCloudSyncing(false), 1500);
    }
  }, [sheetUrl, items, users, suppliers, transactions]);

  const persistData = useCallback((newItems?: InventoryItem[], newTrans?: Transaction[], newUsers?: UserAccount[], newSupps?: Supplier[]) => {
    setIsSaving(true);
    const finalItems = newItems || items;
    const finalTrans = newTrans || transactions;
    const finalUsers = newUsers || users;
    const finalSupps = newSupps || suppliers;

    if (newItems) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
    if (newTrans) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTrans));
    if (newUsers) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
    if (newSupps) localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(newSupps));
    
    if (autoSync) {
      syncToCloud({ items: finalItems, transactions: finalTrans, users: finalUsers, suppliers: finalSupps });
    }
    setTimeout(() => setIsSaving(false), 500);
  }, [autoSync, syncToCloud, items, transactions, users, suppliers]);

  const fetchCloudData = useCallback(async () => {
    const targetUrl = sheetUrl.trim();
    if (!targetUrl || !targetUrl.startsWith('https://script.google.com')) return;
    
    setIsCloudSyncing(true);
    try {
      // Menggunakan action=getData untuk memastikan mendapatkan JSON
      const response = await fetch(`${targetUrl}?action=getData`);
      const text = await response.text();
      
      // Jika response diawali teks (seperti 'READY' atau 'Sistem...'), jangan diparse sebagai JSON
      if (text.trim().startsWith('READY') || text.trim().startsWith('Sistem')) {
         console.log("Koneksi berhasil, skrip aktif.");
         return;
      }

      try {
        const cloudData = JSON.parse(text);
        if (cloudData && cloudData.items) {
          setItems(cloudData.items);
          localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(cloudData.items));
        }
      } catch (e) {
        console.warn("Menerima respon teks dari server:", text);
      }
    } catch (error) {
      console.warn("Server sedang sibuk atau URL salah.");
    } finally {
      setIsCloudSyncing(false);
    }
  }, [sheetUrl]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const foundUser = users.find(u => 
      u.username.toLowerCase() === loginData.username.toLowerCase() && 
      u.password === loginData.password
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      setCurrentView('DASHBOARD');
      if (sheetUrl) fetchCloudData();
    } else {
      setLoginError('ID User atau PIN salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('DASHBOARD');
  };

  const handleTransaction = (transaction: Transaction) => {
    const newTrans = [transaction, ...transactions];
    const newItems = items.map(item => {
      if (item.id === transaction.itemId) {
        const change = transaction.type === 'IN' ? transaction.quantity : -transaction.quantity;
        return { ...item, stock: Math.max(0, item.stock + change), lastUpdated: transaction.date };
      }
      return item;
    });
    setItems(newItems);
    setTransactions(newTrans);
    persistData(newItems, newTrans);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-100 font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-2xl shadow-blue-500/40 mb-2">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">MAXIMA LOGISTIK</h1>
            <p className="text-slate-400 text-sm italic">"Pastikan Link /exec Sudah Terpasang"</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username / ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-white" placeholder="ID User" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">PIN Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required type="password" className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-white" placeholder="••••" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                </div>
              </div>
              {loginError && <p className="text-rose-400 text-xs font-bold text-center animate-pulse">{loginError}</p>}
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Buka Sistem Gudang</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const isLinkValid = sheetUrl.startsWith('https://script.google.com') && sheetUrl.endsWith('/exec');

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden relative font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        onLogout={handleLogout} 
        currentUserFullName={currentUser?.fullName || 'User'}
        currentUserRole={currentUser?.role || 'STAFF'}
        currentUserRoom={currentUser?.room || Room.GUDANG}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        spreadsheetLink={spreadsheetLink}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <span className="font-bold text-slate-800 tracking-tight">MAXIMA LOGISTIK</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-lg text-slate-500"><RefreshCw className="w-5 h-5" /></button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderView()}
          </div>
        </main>

        {/* Sync Indicator */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50 pointer-events-none">
          {isCloudSyncing && (
            <div className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" /> Sedang Sync...
            </div>
          )}
          <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl border ${isLinkValid ? 'bg-white text-green-600 border-green-100' : 'bg-rose-600 text-white border-rose-400 animate-pulse'}`}>
            {isLinkValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <AlertCircle className="w-3 h-3" />}
            {isLinkValid ? `Database Online` : 'Koneksi Offline'}
          </div>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );

  function renderView() {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard items={items} transactions={transactions} spreadsheetLink={spreadsheetLink} />;
      case 'MASTER': return <MasterInventory items={items} onAddItem={(i) => {const up = [...items, i]; setItems(up); persistData(up);}} onDeleteItem={(id) => {const up = items.filter(i => i.id !== id); setItems(up); persistData(up);}} onUpdateItem={(item) => {const up = items.map(i => i.id === item.id ? item : i); setItems(up); persistData(up);}} />;
      case 'SUPPLIERS': return <MasterSupplier suppliers={suppliers} onAddSupplier={(s) => {const up = [...suppliers, s]; setSuppliers(up); persistData(undefined, undefined, undefined, up);}} onDeleteSupplier={(id) => {const up = suppliers.filter(s => s.id !== id); setSuppliers(up); persistData(undefined, undefined, undefined, up);}} onUpdateSupplier={(s) => {const up = suppliers.map(i => i.id === s.id ? s : i); setSuppliers(up); persistData(undefined, undefined, undefined, up);}} />;
      case 'INBOUND': return <Inbound items={items} suppliers={suppliers} onTransaction={handleTransaction} />;
      case 'OUTBOUND': return <Outbound items={items} onTransaction={handleTransaction} currentUserName={currentUser?.fullName || 'Unknown'} />;
      case 'ALERTS': return <Alerts items={items} />;
      case 'REPORTS': return <Reports items={items} transactions={transactions} />;
      case 'USERS': return <MasterUser users={users} onAddUser={(u) => {const up = [...users, u]; setUsers(up); persistData(undefined, undefined, up);}} onDeleteUser={(id) => {const up = users.filter(u => u.id !== id); setUsers(up); persistData(undefined, undefined, up);}} onUpdateUser={(u) => {const up = users.map(user => user.id === u.id ? u : user); setUsers(up); persistData(undefined, undefined, up);}} />;
      case 'SYSTEM': return (
        <SystemMaintenance 
          items={items} 
          transactions={transactions} 
          users={users} 
          suppliers={suppliers} 
          onRestore={(d) => { setItems(d.items || []); setTransactions(d.transactions || []); setSuppliers(d.suppliers || []); setUsers(d.users || MOCK_USERS); persistData(d.items, d.transactions, d.users, d.suppliers); }} 
          onReset={() => { localStorage.clear(); window.location.reload(); }} 
          sheetUrl={sheetUrl} 
          setSheetUrl={(url) => { 
            const cleanUrl = url.trim();
            setSheetUrl(cleanUrl); 
            localStorage.setItem(STORAGE_KEYS.SHEET_URL, cleanUrl); 
          }} 
          spreadsheetLink={spreadsheetLink}
          setSpreadsheetLink={(url) => { setSpreadsheetLink(url); localStorage.setItem(STORAGE_KEYS.SPREADSHEET_LINK, url); }}
          onFetchCloud={fetchCloudData} 
          autoSync={autoSync} 
          setAutoSync={(v) => { setAutoSync(v); localStorage.setItem('maxima_auto_sync', String(v)); }} 
          onSyncNow={() => syncToCloud()} 
        />
      );
      default: return <Dashboard items={items} transactions={transactions} spreadsheetLink={spreadsheetLink} />;
    }
  }
};

export default App;
