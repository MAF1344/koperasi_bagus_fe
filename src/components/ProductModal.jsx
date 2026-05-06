import {useState, useEffect} from 'react';
import {FiX, FiPackage, FiDollarSign, FiHash} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductModal = ({isOpen, onClose, onSubmit, product, loading}) => {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: 'buku',
    deskripsi: '',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    satuan: 'pcs',
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nama_produk: product.nama_produk || '',
        kategori: product.kategori || 'buku',
        deskripsi: product.deskripsi || '',
        harga_beli: product.harga_beli || '',
        harga_jual: product.harga_jual || '',
        stok: product.stok || '',
        satuan: product.satuan || 'pcs',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
    } else {
      setFormData({
        nama_produk: '',
        kategori: 'buku',
        deskripsi: '',
        harga_beli: '',
        harga_jual: '',
        stok: '',
        satuan: 'pcs',
        is_active: true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nama_produk || !formData.kategori || !formData.harga_beli || !formData.harga_jual) {
      toast.error('Nama produk, kategori, harga beli, dan harga jual harus diisi');
      return;
    }

    const hargaBeli = parseFloat(formData.harga_beli);
    const hargaJual = parseFloat(formData.harga_jual);

    if (isNaN(hargaBeli) || isNaN(hargaJual)) {
      toast.error('Harga harus berupa angka');
      return;
    }

    if (hargaBeli < 0 || hargaJual < 0) {
      toast.error('Harga tidak boleh negatif');
      return;
    }

    if (hargaJual < hargaBeli) {
      toast.error('Harga jual tidak boleh lebih kecil dari harga beli');
      return;
    }

    if (formData.stok && parseInt(formData.stok) < 0) {
      toast.error('Stok tidak boleh negatif');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Produk */}
            <div>
              <label htmlFor="nama_produk" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nama_produk"
                  name="nama_produk"
                  value={formData.nama_produk}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Contoh: Buku Tulis 38 Lembar"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kategori */}
              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select id="kategori" name="kategori" value={formData.kategori} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                  <option value="buku">Buku</option>
                  <option value="seragam">Seragam</option>
                  <option value="atk">ATK</option>
                </select>
              </div>

              {/* Satuan */}
              <div>
                <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <select id="satuan" name="satuan" value={formData.satuan} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="pcs">Pcs</option>
                  <option value="lusin">Lusin</option>
                  <option value="pak">Pak</option>
                  <option value="set">Set</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows="2"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Deskripsi singkat produk (opsional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Harga Beli */}
              <div>
                <label htmlFor="harga_beli" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Beli <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="harga_beli"
                    name="harga_beli"
                    value={formData.harga_beli}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              {/* Harga Jual */}
              <div>
                <label htmlFor="harga_jual" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Jual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="harga_jual"
                    name="harga_jual"
                    value={formData.harga_jual}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              {/* Stok */}
              <div>
                <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="stok"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Margin Info */}
            {formData.harga_beli && formData.harga_jual && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Margin:</strong> Rp {(parseFloat(formData.harga_jual) - parseFloat(formData.harga_beli)).toLocaleString('id-ID')} (
                  {(((parseFloat(formData.harga_jual) - parseFloat(formData.harga_beli)) / parseFloat(formData.harga_beli)) * 100).toFixed(1)}%)
                </p>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center">
              <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Produk Aktif
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" disabled={loading}>
                Batal
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isEdit ? 'Menyimpan...' : 'Menambahkan...'}
                  </span>
                ) : isEdit ? (
                  'Simpan'
                ) : (
                  'Tambah Produk'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
