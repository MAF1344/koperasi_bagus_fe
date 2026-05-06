import {useState, useEffect} from 'react';
import {FiX, FiCalendar, FiDollarSign, FiAlertTriangle} from 'react-icons/fi';

const AngsuranModal = ({isOpen, onClose, onSubmit, angsuran}) => {
  const [formData, setFormData] = useState({
    jumlah_bayar: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    keterangan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [denda, setDenda] = useState(0);

  // Reset form when angsuran changes
  useEffect(() => {
    if (angsuran) {
      setFormData({
        jumlah_bayar: angsuran.jumlah_angsuran.toString(),
        tanggal_bayar: new Date().toISOString().split('T')[0],
        keterangan: '',
      });

      // Calculate denda if overdue
      const dueDate = new Date(angsuran.tanggal_jatuh_tempo);
      const today = new Date();
      const isLate = today > dueDate;

      if (isLate && angsuran.denda) {
        setDenda(angsuran.denda);
      } else {
        setDenda(0);
      }
    }
  }, [angsuran]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.jumlah_bayar || parseFloat(formData.jumlah_bayar) <= 0) {
      setError('Jumlah bayar harus lebih dari 0');
      return;
    }

    const jumlahBayar = parseFloat(formData.jumlah_bayar);
    const minimalBayar = angsuran.jumlah_angsuran + denda;

    if (jumlahBayar < minimalBayar) {
      setError(`Jumlah bayar minimal ${formatRupiah(minimalBayar)} (Angsuran: ${formatRupiah(angsuran.jumlah_angsuran)}${denda > 0 ? ` + Denda: ${formatRupiah(denda)}` : ''})`);
      return;
    }

    if (!formData.tanggal_bayar) {
      setError('Tanggal bayar harus diisi');
      return;
    }

    const paymentDate = new Date(formData.tanggal_bayar);
    const dueDate = new Date(angsuran.tanggal_jatuh_tempo);

    // Determine status based on payment date
    let status = 'sudah_bayar';
    if (paymentDate > dueDate) {
      status = 'terlambat';
    }

    setLoading(true);
    try {
      await onSubmit(angsuran.id, {
        jumlah_bayar: jumlahBayar,
        tanggal_bayar: formData.tanggal_bayar,
        keterangan: formData.keterangan || null,
        status: status,
        denda_terbayar: denda > 0 ? Math.min(denda, jumlahBayar - angsuran.jumlah_angsuran) : 0,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Gagal mencatat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !angsuran) return null;

  const dueDate = new Date(angsuran.tanggal_jatuh_tempo);
  const today = new Date();
  const isLate = today > dueDate;
  const minimalBayar = angsuran.jumlah_angsuran + denda;
  const jumlahBayar = parseFloat(formData.jumlah_bayar) || 0;
  const kelebihanBayar = jumlahBayar - minimalBayar;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Bayar Angsuran</h2>
            <p className="text-sm text-gray-500 mt-1">Lengkapi form pembayaran di bawah ini</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Angsuran Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kode Pinjaman:</span>
              <span className="font-semibold text-gray-800">{angsuran.kode_pinjaman}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Angsuran Ke:</span>
              <span className="font-semibold text-gray-800">
                {angsuran.angsuran_ke} dari {angsuran.total_angsuran || '?'}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumlah Angsuran:</span>
                <span className="font-bold text-blue-600">{formatRupiah(angsuran.jumlah_angsuran)}</span>
              </div>
              {denda > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-red-600">Denda Keterlambatan:</span>
                  <span className="font-bold text-red-600">{formatRupiah(denda)}</span>
                </div>
              )}
              {denda > 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Total yang Harus Dibayar:</span>
                  <span className="font-bold text-orange-600">{formatRupiah(minimalBayar)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jatuh Tempo:</span>
              <span className={`font-semibold ${isLate ? 'text-red-600' : 'text-gray-800'}`}>
                {dueDate.toLocaleDateString('id-ID')}
                {isLate && ' ⚠️ Terlambat'}
              </span>
            </div>
          </div>

          {/* Late Warning */}
          {isLate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Pembayaran Terlambat</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Anda akan dikenakan denda sebesar {formatRupiah(denda)}. Pembayaran akan ditandai sebagai <strong>TERLAMBAT</strong> dalam sistem.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Jumlah Bayar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-gray-500" />
                <span>
                  Jumlah Bayar <span className="text-red-500">*</span>
                </span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                name="jumlah_bayar"
                value={formData.jumlah_bayar}
                onChange={handleChange}
                placeholder="0"
                min={minimalBayar}
                step="1000"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Minimal: {formatRupiah(minimalBayar)}</p>
              {jumlahBayar > 0 && <p className="text-xs text-green-600">{kelebihanBayar > 0 ? `Kelebihan: ${formatRupiah(kelebihanBayar)}` : ''}</p>}
            </div>
            {kelebihanBayar > 0 && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-700">💡 Kelebihan pembayaran akan dicatat sebagai overpayment dan dapat digunakan untuk angsuran berikutnya.</p>
              </div>
            )}
          </div>

          {/* Tanggal Bayar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-gray-500" />
                <span>
                  Tanggal Bayar <span className="text-red-500">*</span>
                </span>
              </div>
            </label>
            <input
              type="date"
              name="tanggal_bayar"
              value={formData.tanggal_bayar}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Tanggal pembayaran aktual (tidak dapat lebih dari hari ini)</p>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Contoh: Pembayaran melalui transfer bank, tunai, dll..."
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" disabled={loading}>
              Batal
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                'Konfirmasi Pembayaran'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AngsuranModal;
