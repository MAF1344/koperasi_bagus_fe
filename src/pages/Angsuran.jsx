import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiDollarSign, FiXCircle} from 'react-icons/fi';
import {getAngsuranByPinjaman, recordPayment} from '../services/angsuranService';
import AngsuranModal from '../components/AngsuranModal';

const Angsuran = () => {
  const {pinjamanId} = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAngsuran, setSelectedAngsuran] = useState(null);

  useEffect(() => {
    if (pinjamanId) {
      fetchAngsuran();
    }
  }, [pinjamanId]);

  const fetchAngsuran = async () => {
    try {
      setLoading(true);
      const response = await getAngsuranByPinjaman(pinjamanId);
      console.log('Angsuran data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching angsuran:', error);
      alert(error.message || 'Gagal memuat data angsuran');
      navigate('/pinjaman');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (angsuranId, paymentData) => {
    try {
      await recordPayment(angsuranId, paymentData);
      alert('Pembayaran berhasil dicatat!');
      fetchAngsuran();
    } catch (error) {
      throw error;
    }
  };

  const openPaymentModal = (angsuran) => {
    setSelectedAngsuran(angsuran);
    setModalOpen(true);
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
      belum_bayar: {color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'Belum Bayar'},
      lunas: {color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Lunas'},
      terlambat: {color: 'bg-red-100 text-red-800', icon: FiAlertTriangle, label: 'Terlambat'},
    };
    const badge = badges[status] || badges.belum_bayar;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Check if payment is overdue
  const isOverdue = (angsuran) => {
    if (angsuran.status !== 'belum_bayar') return false;
    const dueDate = new Date(angsuran.tanggal_jatuh_tempo);
    const today = new Date();
    return today > dueDate;
  };

  // Get status message and styling
  const getStatusInfo = () => {
    if (!data) return null;

    const status = data.pinjaman.status;

    switch (status) {
      case 'pending':
        return {
          title: 'Menunggu Persetujuan',
          message: 'Pinjaman ini masih menunggu persetujuan dari SuperAdmin. Jadwal angsuran akan muncul setelah pinjaman disetujui.',
          icon: FiClock,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          isDisabled: true,
        };
      case 'rejected':
        return {
          title: 'Pinjaman Ditolak',
          message: 'Maaf, pengajuan pinjaman ini ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
          icon: FiXCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          isDisabled: true,
        };
      case 'approved':
        return {
          title: 'Pinjaman Disetujui',
          message: 'Pinjaman telah disetujui! Silakan lakukan pembayaran sesuai jadwal angsuran di bawah ini.',
          icon: FiCheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          isDisabled: false,
        };
      case 'lunas':
        return {
          title: 'Pinjaman Lunas',
          message: 'Selamat! Pinjaman Anda telah lunas. Terima kasih telah melakukan pembayaran tepat waktu.',
          icon: FiCheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          isDisabled: false,
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const {pinjaman, summary, angsuran} = data;
  const progressPercentage = summary.total_terbayar && pinjaman.total_pinjaman ? (summary.total_terbayar / pinjaman.total_pinjaman) * 100 : 0;

  const statusInfo = getStatusInfo();
  const isDisabled = statusInfo?.isDisabled || false;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pinjaman')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Angsuran - {pinjaman.kode_pinjaman}</h1>
          <p className="text-gray-600">Peminjam: {pinjaman.peminjam}</p>
        </div>
      </div>

      {/* Status Info Card */}
      {statusInfo && (
        <div className={`rounded-lg p-4 border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-start gap-3">
            <statusInfo.icon className={`w-6 h-6 ${statusInfo.iconColor} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold ${statusInfo.iconColor}`}>{statusInfo.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{statusInfo.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards - with fade effect if disabled */}
      <div className={`transition-all duration-500 ${isDisabled ? 'opacity-50 blur-[1px]' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Pinjaman */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Pinjaman</h3>
              <FiDollarSign className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatRupiah(pinjaman.total_pinjaman)}</p>
            <div className="mt-2 text-sm text-gray-600">
              {pinjaman.tenor_bulan} bulan @ {formatRupiah(pinjaman.angsuran_per_bulan)}
            </div>
          </div>

          {/* Terbayar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Sudah Dibayar</h3>
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(summary.total_terbayar)}</p>
            <div className="mt-2 text-sm text-gray-600">
              {summary.jumlah_lunas} dari {pinjaman.tenor_bulan} angsuran
            </div>
          </div>

          {/* Sisa */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Sisa Angsuran</h3>
              <FiClock className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{formatRupiah(summary.sisa_pembayaran)}</p>
            <div className="mt-2 text-sm text-gray-600">{summary.sisa_angsuran} angsuran tersisa</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Progress Pembayaran</h3>
            <span className="text-sm font-semibold text-blue-600">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}} />
          </div>
          {pinjaman.status === 'lunas' && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">Pinjaman telah LUNAS! Terima kasih atas pembayaran tepat waktu.</span>
            </div>
          )}
        </div>
      </div>

      {/* Angsuran Table - with fade effect if disabled */}
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500 ${isDisabled ? 'opacity-50 blur-[1px]' : ''}`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Detail Angsuran</h2>
          {isDisabled && <p className="text-sm text-gray-500 mt-1">{pinjaman.status === 'pending' ? 'Jadwal angsuran akan muncul setelah pinjaman disetujui' : 'Tidak dapat mengakses jadwal angsuran'}</p>}
        </div>

        {!isDisabled && angsuran && angsuran.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ke-</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bayar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {angsuran.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isOverdue(item) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">{item.angsuran_ke}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">{formatRupiah(item.jumlah_angsuran)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${isOverdue(item) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</span>
                      </div>
                      {isOverdue(item) && <span className="text-xs text-red-600">Terlambat!</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.tanggal_angsuran ? new Date(item.tanggal_angsuran).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.status === 'belum_bayar' && (
                        <button onClick={() => openPaymentModal(item)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors" disabled={isDisabled}>
                          Bayar
                        </button>
                      )}
                      {item.status === 'lunas' && <span className="text-xs text-green-600">✓ Lunas</span>}
                      {item.status === 'terlambat' && <span className="text-xs text-red-600">! Terlambat</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {pinjaman.status === 'pending' ? 'Jadwal angsuran akan tersedia setelah pinjaman disetujui' : pinjaman.status === 'rejected' ? 'Pinjaman ditolak, tidak ada jadwal angsuran' : 'Belum ada jadwal angsuran'}
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AngsuranModal
        isOpen={modalOpen && !isDisabled}
        onClose={() => {
          setModalOpen(false);
          setSelectedAngsuran(null);
        }}
        onSubmit={handlePayment}
        angsuran={selectedAngsuran}
      />
    </div>
  );
};

export default Angsuran;
