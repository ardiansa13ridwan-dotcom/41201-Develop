
import React, { useState, useEffect } from 'react';
import { Room, InventoryItem, Transaction, UnitType } from '../types';
import { ShoppingCart, Send, User, MapPin, Plus, Trash2, PackageSearch, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OutboundProps {
  items: InventoryItem[];
  onTransaction: (transaction: Transaction) => void;
  currentUserName: string;
}

interface RequestItem {
  id: string;
  itemId: string;
  name: string;
  lotNumber: string;
  quantity: number;
  unit: UnitType;
}

const Outbound: React.FC<OutboundProps> = ({ items, onTransaction, currentUserName }) => {
  const [destination, setDestination] = useState(Room.PROSES);
  const [cart, setCart] = useState<RequestItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  
  // Deteksi barang terpilih berdasarkan teks input
  const selectedItem = items.find(i => i.name === searchText);

  const addToCart = () => {
    if (!selectedItem) {
      alert("Silakan pilih barang dari daftar (klik nama barang yang muncul saat mengetik)!");
      return;
    }

    const qty = parseInt(quantityInput);
    if (!qty || qty <= 0) {
      alert("Masukkan jumlah barang yang ingin dikeluarkan!");
      return;
    }

    if (selectedItem.stock < qty) {
      alert(`Stok tidak cukup! Sisa stok ${selectedItem.name} adalah ${selectedItem.stock} ${selectedItem.unit}`);
      return;
    }

    const newItem: RequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: selectedItem.id,
      name: selectedItem.name,
      lotNumber: selectedItem.lotNumber,
      quantity: qty,
      unit: selectedItem.unit
    };

    setCart(prev => [...prev, newItem]);
    
    // Reset input
    setSearchText('');
    setQuantityInput('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const generatePDF = () => {
    if (cart.length === 0) return alert("Belum ada barang di daftar permintaan!");

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Kop Surat
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('MAXIMA LABORATORIUM KLINIK', 105, 20, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Pengeluaran Perbekalan Medis', 105, 26, { align: 'center' });
    doc.line(20, 30, 190, 30);

    // Judul
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('FORM PERMINTAAN BARANG KELUAR', 105, 42, { align: 'center' });
    
    // Header Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal : ${dateStr}`, 20, 52);
    doc.text(`Tujuan  : ${destination}`, 20, 57);
    doc.text(`Pemohon : ${currentUserName}`, 20, 62);

    // Tabel
    const tableHeaders = [['No', 'Nama Barang', 'No. LOT', 'Jumlah', 'Satuan']];
    const tableData = cart.map((item, idx) => [
      idx + 1,
      item.name.toUpperCase(),
      item.lotNumber,
      item.quantity,
      item.unit
    ]);

    autoTable(doc, {
      startY: 70,
      head: tableHeaders,
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: 'center' },
      columnStyles: { 
        0: { cellWidth: 10, halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.text('Diserahkan Oleh,', 30, finalY + 25);
    doc.text('( Admin Gudang )', 30, finalY + 50);
    doc.text('Diterima Oleh,', 140, finalY + 25);
    doc.text(`( ${currentUserName} )`, 140, finalY + 50);

    doc.save(`Outbound_Maxima_${destination}_${new Date().getTime()}.pdf`);
  };

  const handleProcessTransaction = () => {
    if (cart.length === 0) return alert("Daftar masih kosong!");

    cart.forEach(req => {
      onTransaction({
        id: Math.random().toString(36).substr(2, 9),
        itemId: req.itemId,
        itemName: req.name,
        lotNumber: req.lotNumber,
        type: 'OUT',
        quantity: req.quantity,
        unit: req.unit,
        date: new Date().toISOString().split('T')[0],
        destination: destination,
        requester: currentUserName
      });
    });

    // Kirim WA
    const details = cart.map(i => `- ${i.name} (LOT: ${i.lotNumber}): ${i.quantity} ${i.unit}`).join('\n');
    const msg = `📦 *PERMINTAAN BARANG GUDANG*\n📍 *Tujuan:* ${destination}\n👤 *Pemohon:* ${currentUserName}\n------------------\n*Daftar:*\n${details}`;
    window.open(`https://wa.me/6282187577072?text=${encodeURIComponent(msg)}`, '_blank');

    setCart([]);
    alert("Transaksi berhasil dicatat dan dikirim!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Barang Keluar</h2>
          <p className="text-sm text-slate-500">Input pengeluaran barang ke unit laboratorium</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> {currentUserName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          {/* Unit Tujuan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-blue-600" /> Unit Tujuan</h3>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
              value={destination} 
              onChange={e => setDestination(e.target.value as Room)}
            >
              {Object.values(Room).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Form Tambah */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><PackageSearch className="w-4 h-4 text-blue-600" /> Tambah Barang</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ketik Nama Barang</label>
                <div className="relative mt-1">
                  <input 
                    list="item-list"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:border-blue-500 outline-none transition-all font-bold"
                    placeholder="Contoh: Vacutainer..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                  <datalist id="item-list">
                    {items.map(i => <option key={i.id} value={i.name}>Stok: {i.stock} {i.unit} (LOT: {i.lotNumber})</option>)}
                  </datalist>
                  {selectedItem && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                </div>
                {selectedItem && (
                  <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-blue-50 p-2 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> LOT Terdeteksi: {selectedItem.lotNumber} | Sisa Stok: {selectedItem.stock}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  value={quantityInput}
                  onChange={e => setQuantityInput(e.target.value)}
                />
              </div>

              <button 
                onClick={addToCart}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Masukkan ke Daftar
              </button>
            </div>
          </div>
        </div>

        {/* Keranjang/Daftar */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[500px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-600" /> Daftar Permintaan ({cart.length})</h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs font-bold text-rose-500 hover:underline">Bersihkan Daftar</button>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-bold">Daftar masih kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">{idx+1}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">LOT: {item.lotNumber} | Qty: {item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleProcessTransaction}
                disabled={cart.length === 0}
                className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${cart.length > 0 ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="w-5 h-5" /> Proses & Kirim WA
              </button>
              {cart.length > 0 && (
                <button 
                  onClick={generatePDF}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <FileText className="w-5 h-5" /> Cetak PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outbound;
