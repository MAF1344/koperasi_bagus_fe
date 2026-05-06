import {useState, useEffect} from 'react';
import {FiSearch, FiEye, FiDownload, FiPrinter} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {getAllTransactions, getTransactionById} from '../services/transactionService';
import {useAuth} from '../contexts/AuthContext';
import Badge from '../components/Badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionHistory = () => {
  const {user} = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions();
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      toast.error('Gagal mengambil data transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(
        (trx) => trx.kode_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) || trx.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) || trx.nama_kasir?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  // View detail
  const handleViewDetail = async (id) => {
    try {
      const response = await getTransactionById(id);
      setSelectedTransaction(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('Gagal mengambil detail transaksi');
    }
  };

  // Generate PDF receipt (reprint)
  const generateReceipt = (transaction) => {
    try {
      const doc = new jsPDF({
        format: [80, 297], // Thermal printer paper (80mm width)
        unit: 'mm',
      });

      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('KOPERASI BAGUS', 40, 10, {align: 'center'});

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Berkah Guyub Sejahtera', 40, 16, {align: 'center'});

      // Transaction Info
      doc.setFontSize(9);
      doc.text(`No: ${transaction.kode_transaksi}`, 5, 25);
      doc.text(`Tanggal: ${formatDate(transaction.tanggal_transaksi)}`, 5, 30);
      doc.text(`Kasir: ${transaction.nama_kasir}`, 5, 35);
      doc.text(`Pembeli: ${transaction.nama_pelanggan || 'Umum'}`, 5, 40);

      // Line separator
      doc.line(5, 43, 75, 43);

      // Items table
      const tableData = transaction.items.map((item) => [item.nama_produk, `${item.jumlah}x`, formatRupiah(item.subtotal)]);

      // Use autoTable
      autoTable(doc, {
        startY: 45,
        head: [['Produk', 'Qty', 'Subtotal']],
        body: tableData,
        theme: 'plain',
        styles: {fontSize: 8, cellPadding: 1},
        columnStyles: {
          0: {cellWidth: 45},
          1: {cellWidth: 10, halign: 'center'},
          2: {cellWidth: 20, halign: 'right'},
        },
        margin: {left: 5, right: 5},
      });

      const finalY = doc.lastAutoTable.finalY + 3;

      // Line separator
      doc.line(5, finalY, 75, finalY);

      // Totals
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL:', 5, finalY + 6);
      doc.text(formatRupiah(transaction.total_harga), 75, finalY + 6, {align: 'right'});

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text('Bayar:', 5, finalY + 11);
      doc.text(formatRupiah(transaction.total_bayar), 75, finalY + 11, {align: 'right'});

      doc.text('Kembalian:', 5, finalY + 16);
      doc.text(formatRupiah(transaction.kembalian), 75, finalY + 16, {align: 'right'});

      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text('Terima Kasih!', 40, finalY + 25, {align: 'center'});
      doc.text(transaction.nama_pelanggan || 'Pelanggan Setia', 40, finalY + 30, {align: 'center'});

      // Add reprint notice
      doc.setFontSize(7);
      doc.text('(Salinan Struk)', 40, finalY + 35, {align: 'center'});

      // Save PDF
      doc.save(`Struk-${transaction.kode_transaksi}-Reprint.pdf`);

      toast.success('Struk berhasil dicetak ulang!');
    } catch (error) {
      console.error('Print receipt error:', error);
      toast.error('Gagal mencetak struk');
    }
  };

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-600 mt-1">History semua transaksi penjualan</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari kode transaksi, pembeli, atau kasir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data transaksi
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{trx.kode_transaksi}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(trx.tanggal_transaksi)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{trx.nama_pelanggan || 'Umum'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{trx.nama_kasir}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatRupiah(trx.total_harga)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewDetail(trx.id)} className="text-primary hover:text-secondary p-2" title="Lihat Detail">
                          <FiEye className="text-lg" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await getTransactionById(trx.id);
                              generateReceipt(response.data);
                            } catch (error) {
                              toast.error('Gagal mencetak struk');
                            }
                          }}
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Cetak Struk">
                          <FiPrinter className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDetailModalOpen(false)} />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              {/* Header with Print Button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detail Transaksi</h3>
                {/* <button onClick={() => generateReceipt(selectedTransaction)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
                  <FiPrinter />
                  <span>Cetak Strukkkk</span>
                </button> */}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Kode Transaksi</p>
                    <p className="font-semibold">{selectedTransaction.kode_transaksi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-semibold">{formatDate(selectedTransaction.tanggal_transaksi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pembeli</p>
                    <p className="font-semibold">{selectedTransaction.nama_pelanggan || 'Umum'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kasir</p>
                    <p className="font-semibold">{selectedTransaction.nama_kasir}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <div className="border rounded-lg divide-y">
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.nama_produk}</p>
                          <p className="text-sm text-gray-600">
                            {formatRupiah(item.harga_satuan)} × {item.jumlah}
                          </p>
                        </div>
                        <p className="font-semibold">{formatRupiah(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span className="text-primary">{formatRupiah(selectedTransaction.total_harga)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span className="font-semibold">{formatRupiah(selectedTransaction.total_bayar)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembalian:</span>
                    <span className="font-semibold">{formatRupiah(selectedTransaction.kembalian)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsDetailModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Tutup
                </button>
                <button onClick={() => generateReceipt(selectedTransaction)} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                  <FiPrinter />
                  <span>Cetak Ulang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
