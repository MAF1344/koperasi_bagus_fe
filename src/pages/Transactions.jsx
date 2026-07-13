import {useState, useEffect} from 'react';
import {FiSearch, FiShoppingCart, FiRefreshCw} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {useAuth} from '../contexts/AuthContext';
import {getAllProducts} from '../services/productService';
import {createTransaction} from '../services/transactionService';
import CartItem from '../components/CartItem';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Transactions = () => {
  const {user} = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch active products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await getAllProducts();
      // Filter only active products with stock > 0
      const activeProducts = response.data.filter((p) => p.is_active && p.stok > 0);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) => product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  // Add product to cart
  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.jumlah >= product.stok) {
        toast.error(`Stok ${product.nama_produk} tidak mencukupi`);
        return;
      }
      // Update quantity
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                jumlah: item.jumlah + 1,
                subtotal: parseFloat(item.harga_satuan) * (item.jumlah + 1),
              }
            : item,
        ),
      );
    } else {
      // Add new item
      setCart([
        ...cart,
        {
          product_id: product.id,
          nama_produk: product.nama_produk,
          harga_satuan: parseFloat(product.harga_jual),
          jumlah: 1,
          subtotal: parseFloat(product.harga_jual),
          stok: product.stok,
        },
      ]);
    }
    toast.success(`${product.nama_produk} ditambahkan`);
  };

  // Update cart item quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              jumlah: newQuantity,
              subtotal: parseFloat(item.harga_satuan) * newQuantity,
            }
          : item,
      ),
    );
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  // Calculate totals
  const totalAmount = cart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const changeAmount = paymentAmount ? parseFloat(paymentAmount) - totalAmount : 0;

  // Generate PDF receipt
  const generateReceipt = (transaction) => {
    try {
      const doc = new jsPDF({
        format: [80, 297], // Thermal printer paper (80mm width)
        unit: 'mm',
      });

      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('KOPERASI BAGUS', 40, 10, {align: 'center'});

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Berkah Guyub Sejahtera', 40, 16, {align: 'center'});

      // Transaction Info
      doc.setFontSize(9);
      doc.text(`No: ${transaction.kode_transaksi}`, 5, 25);
      doc.text(`Tanggal: ${new Date().toLocaleString('id-ID')}`, 5, 30);
      doc.text(`Kasir: ${user.nama_lengkap}`, 5, 35);
      doc.text(`Pembeli: ${transaction.nama_pelanggan || 'Umum'}`, 5, 40);

      // Line separator
      doc.line(5, 43, 75, 43);

      // Items table
      const tableData = transaction.items.map((item) => [item.nama_produk, `${item.jumlah}x`, formatRupiah(item.subtotal)]);

      // Use autoTable - imported at top
      autoTable(doc, {
        startY: 45,
        head: [['Produk', 'Qty', 'Subtotal']],
        body: tableData,
        theme: 'plain',
        styles: {fontSize: 8, cellPadding: 1},
        columnStyles: {
          0: {cellWidth: 45},
          1: {cellWidth: 10, halign: 'center'},
          2: {cellWidth: 20, halign: 'right'},
        },
        margin: {left: 5, right: 5},
      });

      const finalY = doc.lastAutoTable.finalY + 3;

      // Line separator
      doc.line(5, finalY, 75, finalY);

      // Totals
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL:', 5, finalY + 6);
      doc.text(formatRupiah(transaction.total_harga), 75, finalY + 6, {align: 'right'});

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text('Bayar:', 5, finalY + 11);
      doc.text(formatRupiah(transaction.total_bayar), 75, finalY + 11, {align: 'right'});

      doc.text('Kembalian:', 5, finalY + 16);
      doc.text(formatRupiah(transaction.kembalian), 75, finalY + 16, {align: 'right'});

      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text('Terima Kasih!', 40, finalY + 25, {align: 'center'});
      doc.text(transaction.nama_pelanggan || 'Pelanggan Setia', 40, finalY + 30, {align: 'center'});

      // Save PDF
      doc.save(`Struk-${transaction.kode_transaksi}.pdf`);

      console.log('✅ PDF generated successfully');
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw error; // Re-throw to be caught by handlePayment
    }
  };

  // Handle payment
  const handlePayment = async () => {
    console.log('\n=== FRONTEND: HANDLE PAYMENT ===');

    // Validation
    if (cart.length === 0) {
      console.log('❌ Cart empty');
      toast.error('Keranjang masih kosong');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) < totalAmount) {
      console.log('❌ Payment insufficient');
      toast.error('Uang bayar kurang');
      return;
    }

    console.log('Cart items:', cart);
    console.log('Total amount:', totalAmount);
    console.log('Payment amount:', paymentAmount);
    console.log('Change:', changeAmount);

    try {
      setLoading(true);

      const transactionData = {
        nama_pelanggan: customerName || 'Umum',
        items: cart,
        total_harga: totalAmount,
        total_bayar: parseFloat(paymentAmount),
        kembalian: changeAmount,
      };

      console.log('Transaction data to send:', JSON.stringify(transactionData, null, 2));
      console.log('Sending request to backend...');

      const response = await createTransaction(transactionData);

      console.log('✅ Response received:', response);
      console.log('Transaction:', response.data);

      toast.success('Transaksi berhasil!');

      // Generate receipt
      console.log('Generating PDF receipt...');
      generateReceipt(response.data);
      console.log('✅ PDF generated');

      // Reset form
      setCart([]);
      setCustomerName('');
      setPaymentAmount('');

      // Refresh products (update stock)
      fetchProducts();

      console.log('=== END HANDLE PAYMENT ===\n');
    } catch (error) {
      console.error('\n❌ FRONTEND ERROR:');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.response?.data?.message || error.message);
      console.error('=== END ERROR ===\n');

      toast.error(error.response?.data?.message || 'Transaksi gagal');
    } finally {
      setLoading(false);
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
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kasir</h1>
            <p className="text-sm text-gray-600 mt-1">Point of Sale (POS)</p>
          </div>
          <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiRefreshCw className={loadingProducts ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-hidden">
          {/* Products Section */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading produk...</p>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Tidak ada produk</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} onClick={() => handleAddToCart(product)} className="border border-gray-200 rounded-lg p-3 hover:border-primary hover:shadow-md transition-all cursor-pointer">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{product.nama_produk}</h3>
                      <p className="text-lg font-bold text-primary mb-1">{formatRupiah(product.harga_jual)}</p>
                      <p className="text-xs text-gray-500">
                        Stok: {product.stok} {product.satuan}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart & Payment Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
              <div className="flex items-center gap-2 text-white">
                <FiShoppingCart className="text-xl" />
                <h2 className="text-lg font-bold">Keranjang ({cart.length})</h2>
              </div>
            </div>

            {/* Customer Name */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli</label>
              <input
                type="text"
                placeholder="Umum"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    Keranjang kosong
                    <br />
                    <span className="text-xs">Klik produk untuk menambahkan</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <CartItem key={item.product_id} item={item} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveFromCart} />
                  ))}
                </div>
              )}
            </div>

            {/* Total & Payment */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>TOTAL:</span>
                <span className="text-primary">{formatRupiah(totalAmount)}</span>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uang Bayar</label>
                <input
                  type="number"
                  placeholder="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
                />
              </div>

              {/* Change */}
              {paymentAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Kembalian:</span>
                  <span className={`text-lg font-bold ${changeAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatRupiah(Math.max(0, changeAmount))}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setCart([]);
                    setCustomerName('');
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  disabled={loading || cart.length === 0}>
                  Batal
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading || cart.length === 0 || !paymentAmount || changeAmount < 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Memproses...' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
