import {useState, useEffect} from 'react';
import {FiCreditCard, FiClock, FiCheckCircle, FiXCircle, FiEye, FiPlus, FiFilter} from 'react-icons/fi';
import {useNavigate} from 'react-router-dom';
import {getAllPinjaman, getPinjamanStats, createPinjaman, approvePinjaman, rejectPinjaman} from '../services/pinjamanService';
import PinjamanModal from '../components/PinjamanModal';

const Pinjaman = () => {
  const navigate = useNavigate();
  const [pinjaman, setPinjaman] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({status: ''});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pinjamanRes, statsRes] = await Promise.all([getAllPinjaman(filters), getPinjamanStats()]);
      setPinjaman(pinjamanRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching pinjaman:', error);
      alert(error.message || 'Gagal memuat data pinjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePinjaman = async (data) => {
    try {
      await createPinjaman(data);
      alert('Pengajuan pinjaman berhasil dikirim. Menunggu persetujuan SuperAdmin.');
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleApprove = async (id) => {
    const keterangan = prompt('Keterangan persetujuan (opsional):');
    if (keterangan === null) return; // User cancelled

    try {
      setActionLoading(true);
      await approvePinjaman(id, keterangan);
      alert('Pinjaman berhasil disetujui dan jadwal pembayaran telah dibuat');
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menyetujui pinjaman');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const keterangan = prompt('Alasan penolakan:');
    if (!keterangan) {
      alert('Alasan penolakan harus diisi');
      return;
    }

    try {
      setActionLoading(true);
      await rejectPinjaman(id, keterangan);
      alert('Pinjaman berhasil ditolak');
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menolak pinjaman');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/angsuran/${id}`);
  };

  const handleFilterChange = (e) => {
    setFilters({status: e.target.value});
  };

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: {color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'Pending'},
      approved: {color: 'bg-blue-100 text-blue-800', icon: FiCheckCircle, label: 'Disetujui'},
      rejected: {color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'Ditolak'},
      lunas: {color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Lunas'},
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pinjaman</h1>
          <p className="text-gray-600">Kelola pengajuan dan status pinjaman</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus className="w-5 h-5" />
          Ajukan Pinjaman
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FiClock className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Pending</h3>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FiCheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Disetujui</h3>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FiCreditCard className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Lunas</h3>
          <p className="text-2xl font-bold">{stats.lunas}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FiXCircle className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Ditolak</h3>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Filter Status</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilters({status: ''})} className={`px-4 py-2 rounded-lg transition-colors ${filters.status === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Semua
          </button>
          <button onClick={() => setFilters({status: 'pending'})} className={`px-4 py-2 rounded-lg transition-colors ${filters.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Pending
          </button>
          <button onClick={() => setFilters({status: 'approved'})} className={`px-4 py-2 rounded-lg transition-colors ${filters.status === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Disetujui
          </button>
          <button onClick={() => setFilters({status: 'lunas'})} className={`px-4 py-2 rounded-lg transition-colors ${filters.status === 'lunas' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Lunas
          </button>
          <button onClick={() => setFilters({status: 'rejected'})} className={`px-4 py-2 rounded-lg transition-colors ${filters.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Ditolak
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angsuran/Bulan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : pinjaman.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data pinjaman
                  </td>
                </tr>
              ) : (
                pinjaman.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{item.kode_pinjaman}</div>
                      <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{item.nama_lengkap}</div>
                      <div className="text-xs text-gray-500">{item.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatRupiah(item.jumlah_pinjaman)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.tenor_bulan} bulan</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatRupiah(item.angsuran_perbulan)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Detail - untuk semua status */}
                        <button onClick={() => handleViewDetail(item.id)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Lihat Detail Pinjaman">
                          <FiEye className="w-5 h-5" />
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

      {/* Modal */}
      <PinjamanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreatePinjaman} />
    </div>
  );
};

export default Pinjaman;
