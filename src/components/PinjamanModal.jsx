import {useState} from 'react';
import {FiX, FiUser, FiDollarSign} from 'react-icons/fi';
import {FaCalculator} from 'react-icons/fa';

const PinjamanModal = ({isOpen, onClose, onSubmit}) => {
  const [formData, setFormData] = useState({
    jumlah_pinjaman: '',
    tenor_bulan: '',
    keterangan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate monthly installment
  const calculateMonthly = () => {
    if (formData.jumlah_pinjaman && formData.tenor_bulan) {
      const total = parseFloat(formData.jumlah_pinjaman);
      const tenor = parseInt(formData.tenor_bulan);
      return Math.ceil(total / tenor);
    }
    return 0;
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.jumlah_pinjaman || formData.jumlah_pinjaman <= 0) {
      setError('Jumlah pinjaman harus lebih dari 0');
      return;
    }

    if (!formData.tenor_bulan || formData.tenor_bulan <= 0) {
      setError('Tenor harus lebih dari 0');
      return;
    }

    if (!formData.keterangan.trim()) {
      // Pastikan ini menggunakan 'keterangan'
      setError('Tujuan pinjaman harus diisi');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        jumlah_pinjaman: parseFloat(formData.jumlah_pinjaman),
        tenor_bulan: parseInt(formData.tenor_bulan),
        keterangan: formData.keterangan.trim(), // Gunakan 'keterangan'
      };

      console.log('Sending pinjaman data:', dataToSend); // Debug

      await onSubmit(dataToSend);

      // Reset form
      setFormData({
        jumlah_pinjaman: '',
        tenor_bulan: '',
        keterangan: '', // Reset ke 'keterangan'
      });
      onClose();
    } catch (err) {
      console.error('Error submitting:', err); // Debug
      setError(err.message || 'Gagal mengajukan pinjaman');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const monthlyInstallment = calculateMonthly();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Ajukan Pinjaman</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Pinjaman tanpa bunga (0%). Jumlah yang dibayar sama dengan jumlah pinjaman.
            </p>
          </div>

          {/* Jumlah Pinjaman */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Pinjaman (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="jumlah_pinjaman"
              value={formData.jumlah_pinjaman}
              onChange={handleChange}
              placeholder="Contoh: 12000000"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {formData.jumlah_pinjaman && <p className="text-xs text-gray-500 mt-1">Rp {parseFloat(formData.jumlah_pinjaman).toLocaleString('id-ID')}</p>}
          </div>

          {/* Tenor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenor (Bulan) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tenor_bulan"
              value={formData.tenor_bulan}
              onChange={handleChange}
              placeholder="Contoh: 12"
              min="1"
              max="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maksimal 60 bulan (5 tahun)</p>
          </div>

          {/* Calculation Preview */}
          {monthlyInstallment > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCalculator className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Simulasi Angsuran</h3>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Pinjaman:</span>
                  <span className="font-semibold text-gray-800">Rp {parseFloat(formData.jumlah_pinjaman).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Bunga:</span>
                  <span className="font-semibold text-green-600">0% (Tanpa Bunga)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bayar:</span>
                  <span className="font-semibold text-gray-800">Rp {parseFloat(formData.jumlah_pinjaman).toLocaleString('id-ID')}</span>
                </div>

                <div className="border-t border-green-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angsuran/Bulan:</span>
                    <span className="font-bold text-green-700 text-lg">Rp {monthlyInstallment.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tujuan Pinjaman */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tujuan Pinjaman <span className="text-red-500">*</span>
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Contoh: Modal usaha, Renovasi rumah, Biaya pendidikan, dll"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>
              Batal
            </button>

            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Mengajukan...' : 'Ajukan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinjamanModal;
