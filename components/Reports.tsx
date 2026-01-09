
import React, { useState, useEffect } from 'react';
import { InventoryItem, Transaction } from '../types';
import { analyzeProcurementNeeds } from '../services/geminiService';
import { 
  FileText, Sparkles, Download, MessageSquare, 
  RefreshCw, Users, ArrowDownCircle, ArrowUpCircle, 
  Database, FileDown, Printer 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  items: InventoryItem[];
  transactions: Transaction[];
}

type ReportTab = 'STOCK' | 'INBOUND' | 'OUTBOUND';

const Reports: React.FC<ReportsProps> = ({ items, transactions }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('STOCK');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAISuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await analyzeProcurementNeeds(items);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAISuggestions();
  }, []);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });

      // Kop Surat
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175); // Blue-800
      doc.text('MAXIMA LABORATORIUM KLINIK', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Jl. Kesehatan Raya No. 123, Indonesia | Telp: (021) 555-0123', 105, 27, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Judul Laporan
      const titles = {
        STOCK: 'LAPORAN STATUS PERSEDIAAN GUDANG (STOK OPNAME)',
        INBOUND: 'LAPORAN PENERIMAAN BARANG MASUK',
        OUTBOUND: 'LAPORAN PENGELUARAN BARANG KELUAR'
      };
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(titles[activeTab], 105, 45, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal Cetak: ${today}`, 20, 55);

      // Persiapan Data Tabel
      let tableData = [];
      let headers = [];

      if (activeTab === 'STOCK') {
        headers = [['No', 'Nama Barang', 'LOT/Batch', 'Satuan', 'Stok', 'Status']];
        tableData = items.map((item, idx) => [
          idx + 1,
          item.name,
          item.lotNumber,
          item.unit,
          item.stock,
          item.stock <= item.minStock ? 'REORDER' : 'AMAN'
        ]);
      } else if (activeTab === 'INBOUND') {
        headers = [['Tanggal', 'Nama Barang', 'No. LOT', 'Qty', 'Satuan', 'Supplier']];
        tableData = transactions
          .filter(t => t.type === 'IN')
          .map(t => [t.date, t.itemName, t.lotNumber, t.quantity, t.unit, t.supplier || '-']);
      } else {
        headers = [['Tanggal', 'Nama Barang', 'No. LOT', 'Qty', 'Unit Tujuan', 'Pemohon']];
        tableData = transactions
          .filter(t => t.type === 'OUT')
          .map(t => [t.date, t.itemName, t.lotNumber, t.quantity, t.destination, t.requester]);
      }

      // Memanggil fungsi autoTable secara langsung (Pendekatan Fungsional)
      autoTable(doc, {
        startY: 65,
        head: headers,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 
          0: { cellWidth: 10 },
          4: { fontStyle: 'bold' } 
        }
      });

      // Area Tanda Tangan
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      const signatureY = finalY + 30;

      // Cek jika tanda tangan akan keluar dari halaman
      if (signatureY > 260) {
        doc.addPage();
        doc.setFontSize(10);
        doc.text('Lembar Pengesahan Laporan', 105, 20, { align: 'center' });
        doc.line(20, 25, 190, 25);
        // Reset Y ke posisi atas halaman baru
        var newSignatureY = 40;
        doc.text('Dibuat Oleh,', 30, newSignatureY);
        doc.text('( Admin Gudang )', 30, newSignatureY + 30);
        doc.text('Disetujui Oleh,', 140, newSignatureY);
        doc.text('( Direktur / BM )', 140, newSignatureY + 30);
      } else {
        doc.text('Dibuat Oleh,', 30, signatureY);
        doc.text('( Admin Gudang )', 30, signatureY + 30);
        doc.text('Disetujui Oleh,', 140, signatureY);
        doc.text('( Direktur / BM )', 140, signatureY + 30);
      }

      doc.save(`Maxima_Laporan_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
      alert("Laporan PDF berhasil dibuat!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    }
  };

  const handleBroadcastWA = (target: string) => {
    let message = `📊 *LAPORAN PERSEDIAAN GUDANG MAXIMA*\n_Tanggal: ${new Date().toLocaleDateString('id-ID')}_\n\n`;
    
    if (activeTab === 'STOCK') {
      message += `*STATUS STOK SAAT INI:*\n`;
      items.forEach((item, idx) => {
        message += `${idx + 1}. ${item.name} | LOT: ${item.lotNumber}\n   - Stok: ${item.stock} ${item.unit}\n   - Status: ${item.stock <= item.minStock ? '🔴 PERLU ORDER' : '🟢 AMAN'}\n`;
      });
    } else {
      message += `*RIWAYAT ${activeTab}:*\n`;
      const filtered = transactions.filter(t => t.type === (activeTab === 'INBOUND' ? 'IN' : 'OUT'));
      filtered.forEach((t, idx) => {
        message += `${idx + 1}. ${t.itemName} (${t.quantity} ${t.unit})\n   - LOT: ${t.lotNumber}\n   - Ket: ${activeTab === 'INBOUND' ? 'Dari ' + t.supplier : 'Ke ' + t.destination}\n`;
      });
    }

    const contacts: Record<string, string> = {
      'admin': '6282187577072',
      'bm': '6281234567890', 
      'direktur': '628999888777' 
    };

    const num = contacts[target] || contacts['admin'];
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pusat Laporan Profesional</h2>
          <p className="text-slate-500">Hasil rekapitulasi data gudang siap kirim</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="bg-white p-1 rounded-xl border border-slate-200 flex gap-1 shadow-sm">
              <button onClick={() => handleBroadcastWA('admin')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg flex items-center gap-2 text-xs font-bold transition-all" title="Kirim ke Admin">
                <MessageSquare className="w-4 h-4" /> Admin
              </button>
              <button onClick={() => handleBroadcastWA('bm')} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 text-xs font-bold transition-all" title="Kirim ke BM">
                <Users className="w-4 h-4" /> BM
              </button>
              <button onClick={() => handleBroadcastWA('direktur')} className="p-2 hover:bg-slate-50 text-slate-800 rounded-lg flex items-center gap-2 text-xs font-bold transition-all" title="Kirim ke Direktur">
                Direktur
              </button>
           </div>
           <button 
            onClick={generatePDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FileDown className="w-4 h-4" /> Unduh PDF Resmi
          </button>
        </div>
      </div>

      {/* Tab Navigation Premium */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        {[
          { id: 'STOCK', label: 'Stok Terkini', icon: <Database className="w-4 h-4" /> },
          { id: 'INBOUND', label: 'Barang Masuk', icon: <ArrowDownCircle className="w-4 h-4" /> },
          { id: 'OUTBOUND', label: 'Barang Keluar', icon: <ArrowUpCircle className="w-4 h-4" /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {activeTab === 'STOCK' && (
          <>
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Inventory Status Report</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Sistem Pemantauan Persediaan Otomatis</p>
              </div>
              <button onClick={getAISuggestions} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analisis AI
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">No.</th>
                    <th className="px-6 py-5">Nama Barang</th>
                    <th className="px-6 py-5">No. LOT</th>
                    <th className="px-6 py-5">Satuan</th>
                    <th className="px-6 py-5">Stok</th>
                    <th className="px-8 py-5 text-right">Estimasi Order (AI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const aiSuggestion = suggestions.find(s => s.itemName === item.name);
                    const isLow = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className={`group text-sm hover:bg-slate-50 transition-colors ${isLow ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-8 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{item.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{item.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-500">#{item.lotNumber}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{item.unit}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          {isLoading ? (
                            <div className="w-16 h-4 bg-slate-100 animate-pulse rounded ml-auto" />
                          ) : (
                            <span className={`font-bold ${aiSuggestion ? 'text-blue-600' : 'text-slate-300 italic'}`}>
                              {aiSuggestion ? `+${aiSuggestion.recommendedQty}` : 'Cukup'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(activeTab === 'INBOUND' || activeTab === 'OUTBOUND') && (
          <>
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Transaction History Log</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Audit Trail Barang {activeTab === 'INBOUND' ? 'Masuk' : 'Keluar'}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Tanggal</th>
                    <th className="px-6 py-5">Barang</th>
                    <th className="px-6 py-5">No. LOT</th>
                    <th className="px-6 py-5 text-center">Qty</th>
                    <th className="px-6 py-5">{activeTab === 'INBOUND' ? 'Supplier' : 'Tujuan'}</th>
                    <th className="px-8 py-5 text-right">{activeTab === 'INBOUND' ? 'Verifikator' : 'Pemohon'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions
                    .filter(t => t.type === (activeTab === 'INBOUND' ? 'IN' : 'OUT'))
                    .map((t) => (
                    <tr key={t.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 text-slate-500 font-medium">{t.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{t.itemName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 font-bold">{t.lotNumber}</td>
                      <td className={`px-6 py-4 text-center font-bold ${activeTab === 'INBOUND' ? 'text-green-600' : 'text-rose-600'}`}>
                        {activeTab === 'INBOUND' ? '+' : '-'}{t.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-600">
                          {activeTab === 'INBOUND' ? t.supplier : t.destination}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right text-slate-500 font-medium">
                        {activeTab === 'INBOUND' ? 'Warehouse Admin' : t.requester}
                      </td>
                    </tr>
                  ))}
                  {transactions.filter(t => t.type === (activeTab === 'INBOUND' ? 'IN' : 'OUT')).length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center text-slate-300">
                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm font-medium">Belum ada data transaksi tercatat</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="p-8 bg-blue-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-900/40 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-1">Siap untuk Kirim Laporan?</h3>
          <p className="text-blue-100 text-sm">Unduh PDF untuk arsip resmi atau kirim ringkasan via WhatsApp ke Direktur.</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <button onClick={() => handleBroadcastWA('direktur')} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-md border border-white/10">
             <MessageSquare className="w-4 h-4" /> Broadcast Direktur
           </button>
           <button onClick={generatePDF} className="px-8 py-3 bg-white text-blue-900 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center gap-2 shadow-xl shadow-black/20">
             <FileDown className="w-4 h-4" /> Download PDF
           </button>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default Reports;
