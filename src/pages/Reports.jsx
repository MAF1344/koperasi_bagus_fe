import {useState, useEffect} from 'react';
import {FiTrendingUp, FiDollarSign, FiShoppingCart, FiActivity, FiDownload, FiAlertCircle} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {getDashboardData} from '../services/reportService';
import SalesChart from '../components/SalesChart';
import CategoryChart from '../components/CategoryChart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [period, setPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData(period);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('LAPORAN PENJUALAN', 105, 15, {align: 'center'});
      doc.text('KOPERASI BAGUS', 105, 23, {align: 'center'});

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Berkah Guyub Sejahtera', 105, 30, {align: 'center'});

      // Period info
      doc.setFontSize(10);
      const periodText =
        {
          today: 'Hari Ini',
          '7days': '7 Hari Terakhir',
          month: 'Bulan Ini',
          year: 'Tahun Ini',
        }[period] || '7 Hari Terakhir';

      doc.text(`Periode: ${periodText}`, 14, 40);
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 46);

      // Sales Statistics
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Statistik Penjualan', 14, 56);

      const stats = dashboardData?.sales_stats || {};
      const statsData = [
        ['Total Transaksi', stats.total_transactions || 0],
        ['Total Penjualan', formatCurrency(stats.total_revenue || 0)],
        ['Total Biaya', formatCurrency(stats.total_cost || 0)],
        ['Total Profit', formatCurrency(stats.total_profit || 0)],
        ['Profit Margin', `${stats.profit_margin || 0}%`],
        ['Rata-rata Penjualan', formatCurrency(stats.average_sale || 0)],
      ];

      autoTable(doc, {
        startY: 60,
        head: [['Metrik', 'Nilai']],
        body: statsData,
        theme: 'striped',
        headStyles: {fillColor: [255, 188, 84]},
        margin: {left: 14, right: 14},
      });

      // Top Products
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Top 5 Produk Terlaris', 14, doc.lastAutoTable.finalY + 10);

      const topProducts = dashboardData?.top_products || [];
      const productsData = topProducts.map((p) => [p.nama_produk, p.kategori, p.total_sold || 0, formatCurrency(p.total_revenue || 0)]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Produk', 'Kategori', 'Terjual', 'Revenue']],
        body: productsData,
        theme: 'striped',
        headStyles: {fillColor: [255, 188, 84]},
        margin: {left: 14, right: 14},
      });

      // Category Distribution
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Distribusi Per Kategori', 14, doc.lastAutoTable.finalY + 10);

      const categories = dashboardData?.category_distribution || [];
      const categoryData = categories.map((c) => [c.kategori, c.total_quantity || 0, formatCurrency(c.total_revenue || 0), formatCurrency(c.total_profit || 0)]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Kategori', 'Qty Terjual', 'Revenue', 'Profit']],
        body: categoryData,
        theme: 'striped',
        headStyles: {fillColor: [255, 188, 84]},
        margin: {left: 14, right: 14},
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {align: 'center'});
      }

      // Save
      doc.save(`Laporan-Penjualan-${periodText}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Laporan berhasil diexport!');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('Gagal export laporan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading laporan...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.sales_stats || {};
  const topProducts = dashboardData?.top_products || [];
  const categories = dashboardData?.category_distribution || [];
  const dailyTrend = dashboardData?.daily_trend || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Monitoring performa bisnis koperasi</p>
        </div>

        <div className="flex gap-3">
          {/* Period Filter */}
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>

          {/* Export Button */}
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
            <FiDownload />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Total Penjualan</p>
            <FiTrendingUp className="text-2xl opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue || 0)}</p>
          <p className="text-xs opacity-75 mt-1">{stats.total_transactions || 0} transaksi</p>
        </div>

        {/* Total Profit */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Total Profit</p>
            <FiDollarSign className="text-2xl opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_profit || 0)}</p>
          <p className="text-xs opacity-75 mt-1">Margin: {stats.profit_margin || 0}%</p>
        </div>

        {/* Total Cost */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Total Biaya</p>
            <FiShoppingCart className="text-2xl opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_cost || 0)}</p>
          <p className="text-xs opacity-75 mt-1">HPP (Harga Pokok Penjualan)</p>
        </div>

        {/* Average Sale */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Rata-rata Transaksi</p>
            <FiActivity className="text-2xl opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.average_sale || 0)}</p>
          <p className="text-xs opacity-75 mt-1">Per transaksi</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <SalesChart data={dailyTrend} title={`Trend Penjualan (${period === 'today' ? 'Hari Ini' : period === '7days' ? '7 Hari' : period === 'month' ? 'Bulan Ini' : 'Tahun Ini'})`} />

        {/* Category Distribution Chart */}
        <CategoryChart data={categories} title="Distribusi Penjualan per Kategori" />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Produk Terlaris</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Produk</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3">Terjual</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.nama_produk}</p>
                          <p className="text-xs text-gray-500 capitalize">{product.kategori}</p>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">{product.total_sold || 0}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold text-primary">{formatCurrency(product.total_revenue || 0)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Summary Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan per Kategori</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Kategori</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3">
                        <span className="text-sm font-medium text-gray-900 capitalize">{cat.kategori}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">{cat.total_quantity || 0}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(cat.total_profit || 0)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FiAlertCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">Informasi</p>
          <p className="text-xs text-blue-700 mt-1">Data laporan diperbarui secara real-time berdasarkan transaksi yang terjadi. Gunakan tombol "Export PDF" untuk menyimpan laporan.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
