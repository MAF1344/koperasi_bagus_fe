import {useState, useEffect, useCallback} from 'react';
import {FiCreditCard, FiTrendingUp, FiPlus, FiFilter, FiTrash2} from 'react-icons/fi';

import {getAllSimpanan, getSimpananStats, createSimpanan, deleteSimpanan} from '../services/simpananService';
import {getAllUsers} from '../services/userService';
import SimpananModal from '../components/SimpananModal';

const Simpanan = () => {
  const [simpanan, setSimpanan] = useState([]);
  const [stats, setStats] = useState({
    total_pokok: 0,
    total_wajib: 0,
    total_sukarela: 0,
    total_simpanan: 0,
  });

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    jenis_simpanan: '',
    user_id: '',
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [simpananRes, statsRes] = await Promise.all([getAllSimpanan(filters), getSimpananStats()]);

      setSimpanan(simpananRes.data);
      setStats(statsRes.data);
      console.log('Stats:', statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message || 'Gagal memuat data simpanan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const eligible = res.data.filter((user) => user.role === 'superadmin' || user.role === 'admin');
      setUsers(eligible);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentUser.role === 'superadmin') {
      fetchUsers();
    }
  }, [currentUser.role, fetchUsers]);

  const handleFilterChange = (e) => {
    const {name, value} = e.target;
    setFilters((prev) => ({...prev, [name]: value}));
  };

  const resetFilters = () => {
    setFilters({jenis_simpanan: '', user_id: ''});
  };

  const handleCreateSimpanan = async (data) => {
    try {
      await createSimpanan(data);
      alert('Simpanan berhasil ditambahkan');
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menambahkan simpanan');
    }
  };

  const handleDeleteSimpanan = async (id) => {
    if (!window.confirm('Yakin ingin menghapus simpanan ini?')) return;

    try {
      await deleteSimpanan(id);
      alert('Simpanan berhasil dihapus');
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menghapus simpanan');
    }
  };

  const formatRupiah = (amount) => {
    const num = Number(amount) || 0; // fallback ke 0 bila null/undefined/NaN
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getBadgeColor = (jenis) => {
    const colors = {
      pokok: 'bg-blue-100 text-blue-800',
      wajib: 'bg-green-100 text-green-800',
      sukarela: 'bg-purple-100 text-purple-800',
    };
    return colors[jenis] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Simpanan Anggota</h1>
          <p className="text-gray-600">Kelola simpanan pokok, wajib, dan sukarela</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus className="w-5 h-5" />
          Tambah Simpanan
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <FiCreditCard className="w-8 h-8 opacity-80 mb-2" />
          <h3 className="text-sm opacity-90 mb-1">Simpanan Pokok</h3>
          <p className="text-2xl font-bold">{formatRupiah(stats.total_pokok)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <FiTrendingUp className="w-8 h-8 opacity-80 mb-2" />
          <h3 className="text-sm opacity-90 mb-1">Simpanan Wajib</h3>
          <p className="text-2xl font-bold">{formatRupiah(stats.total_wajib)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <FiCreditCard className="w-8 h-8 opacity-80 mb-2" />
          <h3 className="text-sm opacity-90 mb-1">Simpanan Sukarela</h3>
          <p className="text-2xl font-bold">{formatRupiah(stats.total_sukarela)}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-lg p-6 shadow-lg">
          <FiCreditCard className="w-8 h-8 opacity-80 mb-2" />
          <h3 className="text-sm opacity-90 mb-1">Total Simpanan</h3>
          <p className="text-2xl font-bold">{formatRupiah(stats.total_simpanan)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Filter Data</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Jenis Simpanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Simpanan</label>
            <select name="jenis_simpanan" value={filters.jenis_simpanan} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Semua</option>
              <option value="pokok">Pokok</option>
              <option value="wajib">Wajib</option>
              <option value="sukarela">Sukarela</option>
            </select>
          </div>

          {/* User (superadmin only) */}
          {currentUser.role === 'superadmin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anggota</label>
              <select name="user_id" value={filters.user_id} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Semua Anggota</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset */}
          <div className="flex items-end">
            <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anggota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                {currentUser.role === 'superadmin' && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {/* Loading */}
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : simpanan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data simpanan
                  </td>
                </tr>
              ) : (
                simpanan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.tanggal_simpanan).toLocaleDateString('id-ID')}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{item.nama_lengkap}</div>
                      <div className="text-xs text-gray-500">{item.username}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.jenis_simpanan)}`}>{item.jenis_simpanan.charAt(0).toUpperCase() + item.jenis_simpanan.slice(1)}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatRupiah(item.jumlah)}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">{item.keterangan || '-'}</td>

                    {currentUser.role === 'superadmin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleDeleteSimpanan(item.id)} className="text-red-600 hover:text-red-800 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <SimpananModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateSimpanan} currentUser={currentUser} />
    </div>
  );
};

export default Simpanan;
