import {useState, useEffect} from 'react';
import {FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiBook, FiTag} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {getAllProducts, createProduct, updateProduct, deleteProduct, getProductStats} from '../services/productService';
import ProductModal from '../components/ProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Badge from '../components/Badge';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    total_buku: 0,
    total_seragam: 0,
    total_atk: 0,
    total_stok: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // NEW

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await getProductStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  // Filtering logic (kategori, search, status)
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.kategori === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => (statusFilter === 'active' ? p.is_active === true : p.is_active === false));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((product) => product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) || (product.deskripsi && product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Add product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  // Edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Delete product
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit product
  const handleSubmitProduct = async (formData) => {
    try {
      setModalLoading(true);

      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
        toast.success('Produk berhasil diperbarui');
      } else {
        await createProduct(formData);
        toast.success('Produk berhasil ditambahkan');
      }

      setIsProductModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setModalLoading(false);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      setModalLoading(true);
      await deleteProduct(selectedProduct.id);
      toast.success('Produk berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk');
    } finally {
      setModalLoading(false);
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

  // Get category badge
  const getCategoryBadge = (category) => {
    const badges = {
      buku: {type: 'info', label: 'Buku'},
      seragam: {type: 'warning', label: 'Seragam'},
      atk: {type: 'success', label: 'ATK'},
    };
    const badge = badges[category] || {type: 'primary', label: category};
    return <Badge type={badge.type}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-sm text-gray-600 mt-1">Manajemen produk koperasi</p>
        </div>
        <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
          <FiPlus />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{/* ... (tidak diubah) ... */}</div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama produk atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="all">Semua Kategori</option>
              <option value="buku">Buku</option>
              <option value="seragam">Seragam</option>
              <option value="atk">ATK</option>
            </select>
          </div>

          {/* Status Filter (NEW) */}
          <div className="w-full md:w-48">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>

                {/* NEW Status Column */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data produk
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 ${!product.is_active ? 'opacity-50' : ''}`} // NEW
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.nama_produk}</div>
                        {product.deskripsi && <div className="text-xs text-gray-500 mt-1">{product.deskripsi}</div>}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">{getCategoryBadge(product.kategori)}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">{formatRupiah(product.harga_jual)}</div>
                      <div className="text-xs text-gray-500">Beli: {formatRupiah(product.harga_beli)}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${product.stok < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stok} {product.satuan}
                      </span>
                    </td>

                    {/* NEW Status cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type={product.is_active ? 'active' : 'inactive'}>{product.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditProduct(product)} className="text-primary hover:text-secondary mr-3">
                        <FiEdit2 className="inline text-lg" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-900">
                        <FiTrash2 className="inline text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSubmit={handleSubmitProduct} product={selectedProduct} loading={modalLoading} />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={selectedProduct?.nama_produk}
        message="Apakah Anda yakin ingin menghapus produk"
        loading={modalLoading}
      />
    </div>
  );
};

export default Products;
