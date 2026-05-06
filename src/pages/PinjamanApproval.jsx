import {useState, useEffect} from 'react';
import {FiCheckCircle, FiXCircle, FiFileText, FiCalendar, FiUser} from 'react-icons/fi';
import {getPendingPinjaman, approvePinjaman, rejectPinjaman} from '../services/pinjamanService';

const PinjamanApproval = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Redirect if not SuperAdmin
  useEffect(() => {
    if (currentUser.role !== 'superadmin') {
      alert('Hanya SuperAdmin yang dapat mengakses halaman ini');
      window.location.href = '/dashboard';
      return;
    }
    fetchPendingLoans();
  }, []);

  const fetchPendingLoans = async () => {
    try {
      setLoading(true);
      const response = await getPendingPinjaman();
      setPendingLoans(response.data);
    } catch (error) {
      console.error('Error fetching pending loans:', error);
      alert(error.message || 'Gagal memuat data pinjaman pending');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, kode) => {
    const keterangan = prompt(`Keterangan persetujuan untuk ${kode} (opsional):`);
    if (keterangan === null) return; // User cancelled

    try {
      setActionLoading(true);
      await approvePinjaman(id, keterangan || 'Disetujui');
      alert(`Pinjaman ${kode} berhasil disetujui!\nJadwal pembayaran telah dibuat.`);
      fetchPendingLoans();
      setSelectedLoan(null);
    } catch (error) {
      alert(error.message || 'Gagal menyetujui pinjaman');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, kode) => {
    const keterangan = prompt(`Alasan penolakan untuk ${kode}:`);
    if (!keterangan || keterangan.trim() === '') {
      alert('Alasan penolakan harus diisi');
      return;
    }

    try {
      setActionLoading(true);
      await rejectPinjaman(id, keterangan);
      alert(`Pinjaman ${kode} berhasil ditolak`);
      fetchPendingLoans();
      setSelectedLoan(null);
    } catch (error) {
      alert(error.message || 'Gagal menolak pinjaman');
    } finally {
      setActionLoading(false);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Persetujuan Pinjaman</h1>
        <p className="text-gray-600">Review dan setujui pengajuan pinjaman yang masuk</p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm opacity-90 mb-1">Menunggu Persetujuan</h3>
            <p className="text-3xl font-bold">{pendingLoans.length}</p>
            <p className="text-xs opacity-80 mt-1">Pengajuan pinjaman</p>
          </div>
          <FiFileText className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Pending Loans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-500">Loading...</div>
        ) : pendingLoans.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-12 text-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Pengajuan Pending</h3>
            <p className="text-gray-600">Semua pengajuan pinjaman sudah diproses</p>
          </div>
        ) : (
          pendingLoans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{loan.kode_pinjaman}</h3>
                    <p className="text-sm opacity-90">Diajukan: {new Date(loan.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <span className="text-sm font-semibold">PENDING</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Peminjam */}
                <div className="flex items-start gap-3">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Peminjam</p>
                    <p className="font-semibold text-gray-800">{loan.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">{loan.username}</p>
                  </div>
                </div>

                {/* Jumlah Pinjaman */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jumlah Pinjaman:</span>
                    <span className="font-bold text-gray-800">{formatRupiah(loan.jumlah_pinjaman)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bunga:</span>
                    <span className="font-semibold text-green-600">0% (Tanpa Bunga)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Bayar:</span>
                    <span className="font-bold text-gray-800">{formatRupiah(loan.total_pinjaman)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Angsuran/Bulan:</span>
                      <span className="font-bold text-blue-600">{formatRupiah(loan.angsuran_perbulan)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">Tenor:</span>
                      <span className="font-semibold text-gray-800">{loan.tenor_bulan} bulan</span>
                    </div>
                  </div>
                </div>

                {/* Tujuan */}
                <div className="flex items-start gap-3">
                  <FiFileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Tujuan Pinjaman</p>
                    <p className="text-sm text-gray-800">{loan.tujuan_pinjaman}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleReject(loan.id, loan.kode_pinjaman)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiXCircle className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(loan.id, loan.kode_pinjaman)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiCheckCircle className="w-4 h-4" />
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PinjamanApproval;
