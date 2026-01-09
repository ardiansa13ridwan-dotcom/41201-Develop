
import React, { useState, useEffect, useRef } from 'react';
import { Check, Package, Calendar, Search, Hash, Truck, Tag, PlusCircle, AlertCircle } from 'lucide-react';
import { UnitType, InventoryItem, Transaction, Supplier } from '../types';

interface InboundProps {
  items: InventoryItem[];
  suppliers: Supplier[];
  onTransaction: (transaction: Transaction) => void;
}

const Inbound: React.FC<InboundProps> = ({ items, suppliers, onTransaction }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lotInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    itemId: '',
    sku: '',
    itemName: '',
    category: '',
    lotNumber: '',
    quantity: '',
    unit: UnitType.BOX,
    supplier: '',
    expiryDate: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [itemFound, setItemFound] = useState(false);

  // Pencarian Otomatis Barang
  useEffect(() => {
    const term = formData.itemName.toLowerCase();
    if (!term) {
      setItemFound(false);
      return;
    }

    // Cari berdasarkan Nama atau SKU
    const found = items.find(i => 
      i.name.toLowerCase() === term || 
      i.sku.toLowerCase() === term
    );

    if (found) {
      setFormData(prev => ({ 
        ...prev, 
        itemId: found.id, 
        itemName: found.name, 
        sku: found.sku,
        category: found.category,
        unit: found.unit
      }));
      setItemFound(true);
      
      // Auto focus ke LOT setelah barang ditemukan
      const timer = setTimeout(() => lotInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    } else {
      setItemFound(false);
    }
  }, [formData.itemName, items]);

  const handleSave = () => {
    if (!formData.itemId || !formData.quantity || !formData.lotNumber) {
      alert("⚠️ Mohon lengkapi: Nama Barang, No. LOT, dan Jumlah!");
      return;
    }
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: formData.itemId,
      itemName: formData.itemName,
      lotNumber: formData.lotNumber,
      type: 'IN',
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      date: formData.date,
      supplier: formData.supplier
    };

    onTransaction(transaction);
    
    // Reset form untuk input berikutnya
    setFormData({ 
      itemId: '', 
      sku: '', 
      itemName: '', 
      category: '', 
      lotNumber: '', 
      quantity: '', 
      unit: UnitType.BOX, 
      supplier: '', 
      expiryDate: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setItemFound(false);
    alert("✅ Stok berhasil ditambahkan!");
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Input Barang Masuk</h2>
          <p className="text-sm text-slate-500 font-medium">Penerimaan stok medikal & laboratorium</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Sistem Gudang Aktif
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Progress Bar (Visual Only) */}
        <div className="h-1.5 w-full bg-slate-50 flex">
          <div className={`h-full transition-all duration-500 ${formData.itemName ? 'w-1/3' : 'w-0'} bg-blue-500`} />
          <div className={`h-full transition-all duration-500 ${formData.lotNumber ? 'w-1/3' : 'w-0'} bg-indigo-500`} />
          <div className={`h-full transition-all duration-500 ${formData.quantity ? 'w-1/3' : 'w-0'} bg-green-500`} />
        </div>

        <div className="p-8 sm:p-12 space-y-8">
          {/* BAGIAN 1: IDENTITAS BARANG */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Pilih Barang</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Nama / Scan SKU</label>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${itemFound ? 'text-green-500' : 'text-slate-400'}`} />
                  <input 
                    ref={searchInputRef}
                    list="items-list"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${itemFound ? 'border-green-200 bg-green-50/30 text-green-700' : 'border-transparent focus:bg-white focus:border-blue-500'}`}
                    placeholder="Contoh: Vacutainer 3ml..."
                    value={formData.itemName}
                    onChange={e => setFormData({...formData, itemName: e.target.value})}
                  />
                  <datalist id="items-list">
                    {items.map(i => <option key={i.id} value={i.name}>{i.sku}</option>)}
                  </datalist>
                </div>
                {itemFound && (
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> SKU: {formData.sku} | Kategori: {formData.category}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori & Satuan</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-4 bg-slate-100 rounded-2xl text-xs font-bold text-slate-500 border border-slate-200 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> {formData.category || "---"}
                  </div>
                  <div className="flex-1 px-4 py-4 bg-slate-100 rounded-2xl text-xs font-bold text-slate-500 border border-slate-200 flex items-center gap-2">
                    <Package className="w-4 h-4" /> {formData.unit || "---"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN 2: DETAIL STOK */}
          <section className="space-y-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">2</div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Detail Penerimaan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. LOT / Batch</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    ref={lotInputRef}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl text-sm font-black text-indigo-600 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    placeholder="Contoh: LOT2024"
                    value={formData.lotNumber}
                    onChange={e => setFormData({...formData, lotNumber: e.target.value})}
                    onKeyDown={e => handleKeyDown(e, qtyInputRef)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Masuk</label>
                <input 
                  ref={qtyInputRef}
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 border-transparent border-2 rounded-2xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  onKeyDown={e => handleKeyDown(e, expiryInputRef)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Kadaluarsa</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  <input 
                    ref={expiryInputRef}
                    type="date"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-rose-500 transition-all"
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN 3: ASAL BARANG */}
          <section className="space-y-6 pt-6 border-t border-slate-50">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">3</div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Asal & Supplier</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier / Distributor</label>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                  >
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Terima</label>
                <input 
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-500"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button 
              onClick={handleSave}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <PlusCircle className="w-6 h-6" /> KONFIRMASI STOK MASUK
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-[2rem] border border-amber-200">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
        <p className="text-[11px] text-amber-800 font-medium leading-relaxed uppercase italic">
          <b>Tips:</b> Gunakan scanner barcode pada kolom "Cari Nama / Scan SKU". Jika barang sudah pernah didaftarkan, data kategori dan satuan akan muncul otomatis untuk menghemat waktu Anda.
        </p>
      </div>
    </div>
  );
};

export default Inbound;
