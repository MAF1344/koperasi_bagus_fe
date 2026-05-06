import {useState, useEffect} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {FiUsers, FiPackage, FiShoppingCart, FiDollarSign} from 'react-icons/fi';
import {getAllUsers} from '../services/userService';
import {getAllProducts} from '../services/productService';
import {getTodayTransactions} from '../services/transactionService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const {user} = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    todayTransactions: 0,
    todayRevenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data based on user role
      const promises = [];

      if (user?.role === 'superadmin') {
        promises.push(getAllUsers());
      }

      if (user?.role === 'superadmin' || user?.role === 'admin') {
        promises.push(getAllProducts());
        promises.push(getTodayTransactions());
      }

      const results = await Promise.all(promises);

      let userCount = 0;
      let productCount = 0;
      let todayTrx = [];

      if (user?.role === 'superadmin') {
        const usersData = results[0];
        userCount = usersData.data.filter((u) => u.is_active).length;

        if (results.length > 1) {
          const productsData = results[1];
          productCount = productsData.data.filter((p) => p.is_active).length;
        }

        if (results.length > 2) {
          todayTrx = results[2].data || [];
        }
      } else if (user?.role === 'admin') {
        const productsData = results[0];
        productCount = productsData.data.filter((p) => p.is_active).length;

        if (results.length > 1) {
          todayTrx = results[1].data || [];
        }
      }

      // Calculate today's stats
      const todayTransactionCount = todayTrx.length;
      const todayRevenue = todayTrx.reduce((sum, trx) => sum + parseFloat(trx.total_harga || 0), 0);

      setStats({
        totalUsers: userCount,
        totalProducts: productCount,
        todayTransactions: todayTransactionCount,
        todayRevenue: todayRevenue,
      });

      // Get recent 5 transactions (sorted by latest)
      setRecentTransactions(todayTrx.slice(0, 5));
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'pengunjung') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  };

  const dashboardStats = [
    {
      title: 'Total User',
      value: loading ? '-' : stats.totalUsers.toString(),
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      roles: ['superadmin'],
    },
    {
      title: 'Total Produk',
      value: loading ? '-' : stats.totalProducts.toString(),
      icon: FiPackage,
      color: 'from-green-500 to-green-600',
      roles: ['superadmin', 'admin'],
    },
    {
      title: 'Transaksi Hari Ini',
      value: loading ? '-' : stats.todayTransactions.toString(),
      icon: FiShoppingCart,
      color: 'from-yellow-500 to-yellow-600',
      roles: ['superadmin', 'admin'],
    },
    {
      title: 'Pendapatan Hari Ini',
      value: loading ? '-' : formatCurrency(stats.todayRevenue),
      icon: FiDollarSign,
      color: 'from-purple-500 to-purple-600',
      roles: ['superadmin', 'admin'],
    },
  ];

  const filteredStats = dashboardStats.filter((stat) => stat.roles.includes(user?.role));

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.nama_lengkap}! 👋</h1>
        <p className="text-white/90">Ini adalah dashboard sistem manajemen Koperasi BAGUS (Berkah Guyub Sejahtera)</p>
      </div>

      {/* Stats Grid */}
      {user?.role !== 'pengunjung' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === 'superadmin' && (
            <a href="/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left block">
              <h3 className="font-semibold text-gray-800 mb-1">Kelola User</h3>
              <p className="text-sm text-gray-600">Tambah atau edit user</p>
            </a>
          )}

          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <>
              <a href="/products" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left block">
                <h3 className="font-semibold text-gray-800 mb-1">Kelola Produk</h3>
                <p className="text-sm text-gray-600">Tambah atau edit produk</p>
              </a>
              <a href="/transactions" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left block">
                <h3 className="font-semibold text-gray-800 mb-1">Buat Transaksi</h3>
                <p className="text-sm text-gray-600">POS / Kasir</p>
              </a>
            </>
          )}

          {user?.role === 'pengunjung' && (
            <a href="/reports" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left block">
              <h3 className="font-semibold text-gray-800 mb-1">Lihat Laporan</h3>
              <p className="text-sm text-gray-600">Analytics & Reports</p>
            </a>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {(user?.role === 'superadmin' || user?.role === 'admin') && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Transaksi Terbaru</h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada transaksi hari ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{trx.nama_kasir || 'Kasir'}</span> melakukan transaksi
                      <span className="font-semibold text-primary"> {trx.kode_transaksi}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Pembeli: {trx.nama_pelanggan || 'Umum'} • Total: {formatCurrency(trx.total_harga)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(trx.tanggal_transaksi)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <a href="/transactions/history" className="text-xs text-primary hover:text-secondary font-medium">
                      Lihat
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pengunjung View */}
      {user?.role === 'pengunjung' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Selamat Datang!</h2>
          <p className="text-gray-600 mb-4">Sebagai pengunjung, Anda dapat melihat laporan dan analytics koperasi.</p>
          <a href="/reports" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
            <FiDollarSign />
            <span>Lihat Laporan & Analytics</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
