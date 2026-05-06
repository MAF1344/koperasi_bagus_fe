import {useState, useEffect} from 'react';
import {FiX} from 'react-icons/fi';
import {getAllUsers} from '../services/userService';

const SimpananModal = ({isOpen, onClose, onSubmit, currentUser}) => {
  const [formData, setFormData] = useState({
    user_id: currentUser?.role === 'admin' ? currentUser.id : '',
    jenis_simpanan: 'wajib',
    jumlah: '',
    keterangan: '',
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch users if SuperAdmin
  useEffect(() => {
    if (isOpen && currentUser?.role === 'superadmin') {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const eligibleUsers = response.data.filter((user) => user.role === 'superadmin' || user.role === 'admin');
      setUsers(eligibleUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
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

    if (!formData.user_id) {
      setError('Anggota harus dipilih');
      return;
    }

    if (!formData.jumlah || formData.jumlah <= 0) {
      setError('Jumlah simpanan harus lebih dari 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        user_id: parseInt(formData.user_id),
        jenis_simpanan: formData.jenis_simpanan,
        jumlah: parseFloat(formData.jumlah),
        keterangan: formData.keterangan || null,
      });

      setFormData({
        user_id: currentUser?.role === 'admin' ? currentUser.id : '',
        jenis_simpanan: 'wajib',
        jumlah: '',
        keterangan: '',
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menambah simpanan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Tambah Simpanan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          {/* Anggota Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anggota <span className="text-red-500">*</span>
            </label>

            {currentUser?.role === 'superadmin' ? (
              <select name="user_id" value={formData.user_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="">Pilih Anggota</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nama_lengkap} ({user.username})
                  </option>
                ))}
              </select>
            ) : (
              <input type="text" value={currentUser?.nama_lengkap || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
            )}
          </div>

          {/* Jenis Simpanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Simpanan <span className="text-red-500">*</span>
            </label>
            <select name="jenis_simpanan" value={formData.jenis_simpanan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
              <option value="pokok">Pokok (Sekali)</option>
              <option value="wajib">Wajib (Bulanan)</option>
              <option value="sukarela">Sukarela</option>
            </select>

            <p className="text-xs text-gray-500 mt-1">
              {formData.jenis_simpanan === 'pokok' && 'Simpanan wajib saat pertama kali menjadi anggota (hanya sekali)'}
              {formData.jenis_simpanan === 'wajib' && 'Simpanan rutin setiap bulan'}
              {formData.jenis_simpanan === 'sukarela' && 'Simpanan sukarela kapan saja'}
            </p>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              placeholder="Contoh: 100000"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            {formData.jumlah && <p className="text-xs text-gray-500 mt-1">Rp {parseFloat(formData.jumlah).toLocaleString('id-ID')}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Catatan tambahan..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>
              Batal
            </button>

            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpananModal;
