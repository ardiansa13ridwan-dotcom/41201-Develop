
import React, { useState } from 'react';
import { InventoryItem, UnitType } from '../types';
import { Plus, Search, Edit3, Trash2, X, QrCode, Download, Printer, Check } from 'lucide-react';

interface MasterInventoryProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: InventoryItem) => void;
}

const MasterInventory: React.FC<MasterInventoryProps> = ({ items, onAddItem, onDeleteItem, onUpdateItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showQRModal, setShowQRModal] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Laboratorium',
    sku: '',
    lotNumber: '',
    unit: UnitType.BOX,
    minStock: 10,
    expiryDate: ''
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem({ ...editingItem, ...newItem });
      setEditingItem(null);
    } else {
      const item: InventoryItem = {
        ...newItem,
        id: Math.random().toString(36).substr(2, 9),
        stock: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      onAddItem(item);
      setShowQRModal(item);
    }
    setIsModalOpen(false);
    setNewItem({ name: '', category: 'Laboratorium', sku: '', lotNumber: '', unit: UnitType.BOX, minStock: 10, expiryDate: '' });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      sku: item.sku,
      lotNumber: item.lotNumber,
      unit: item.unit,
      minStock: item.minStock,
      expiryDate: item.expiryDate
    });
    setIsModalOpen(true);
  };

  // Combined QR data: SKU|LOT for smart scanning
  const getQrData = (item: InventoryItem) => `${item.sku}|${item.lotNumber}`;
  const qrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !showQRModal) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${showQRModal.sku}</title>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 2mm;
              width: 50mm;
              height: 30mm;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              font-family: 'Inter', -apple-system, sans-serif;
              box-sizing: border-box;
              overflow: hidden;
            }
            .qr-container {
              width: 22mm;
              height: 22mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-container img {
              width: 100%;
              height: 100%;
            }
            .info-container {
              width: 24mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              text-align: left;
              overflow: hidden;
            }
            .brand {
              font-size: 5pt;
              font-weight: 800;
              color: #1e40af;
              margin-bottom: 1pt;
            }
            .item-name {
              font-size: 6pt;
              font-weight: 700;
              line-height: 1.1;
              max-height: 14pt;
              overflow: hidden;
              margin-bottom: 2pt;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .sku {
              font-size: 8pt;
              font-weight: 900;
              font-family: monospace;
              margin-bottom: 1pt;
            }
            .lot {
              font-size: 5pt;
              font-weight: 600;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrUrl(getQrData(showQRModal))}" />
          </div>
          <div class="info-container">
            <div class="brand">MAXIMA LAB</div>
            <div class="item-name">${showQRModal.name.toUpperCase()}</div>
            <div class="sku">${showQRModal.sku}</div>
            <div class="lot">LOT: ${showQRModal.lotNumber}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Barang</h2>
          <p className="text-slate-500">Katalog barang laboratorium & Reagent</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" /> Tambah Barang Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, SKU, atau No. LOT..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">SKU / LOT</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.category} • {item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <button onClick={() => setShowQRModal(item)} className="flex items-center gap-2 text-xs font-mono text-blue-600 hover:underline">
                        <QrCode className="w-3 h-3" /> {item.sku}
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">LOT: {item.lotNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${item.stock <= item.minStock ? 'text-rose-500' : 'text-slate-700'}`}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => onDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X /></button>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nama Barang</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">SKU</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: VAC-001" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">No. LOT / Batch</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: LOT2024" value={newItem.lotNumber} onChange={e => setNewItem({...newItem, lotNumber: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Satuan</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value as UnitType})}>
                    {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Min. Stok</label>
                  <input type="number" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={newItem.minStock} onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Kategori</label>
                <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                  <option>Laboratorium</option>
                  <option>Reagent</option>
                  <option>Radiologi</option>
                  <option>Non Lab</option>
                  <option>Percetakan</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 font-bold mt-4 flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> {editingItem ? 'Simpan Perubahan' : 'Simpan Barang & QR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-sm shadow-2xl p-8 text-center relative">
             <button onClick={() => setShowQRModal(null)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X /></button>
             <h4 className="font-bold text-slate-800 mb-2">Label Barcode</h4>
             <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest">{showQRModal.name}</p>
             <div className="p-6 bg-slate-50 rounded-2xl mb-6 inline-block border border-slate-100">
               <img src={qrUrl(getQrData(showQRModal))} alt="QR Code" className="w-48 h-48 mx-auto" />
               <p className="mt-3 text-xl font-mono font-bold text-slate-700 tracking-widest">{showQRModal.sku}</p>
               <p className="text-[10px] text-slate-400 uppercase font-bold">LOT: {showQRModal.lotNumber}</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => window.open(qrUrl(getQrData(showQRModal)), '_blank')} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">
                 <Download className="w-4 h-4" /> Unduh
               </button>
               <button onClick={handlePrintQR} className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                 <Printer className="w-4 h-4" /> Cetak QR
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterInventory;
