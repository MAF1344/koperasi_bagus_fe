import {FiTrash2, FiMinus, FiPlus} from 'react-icons/fi';

const CartItem = ({item, onUpdateQuantity, onRemove}) => {
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDecrement = () => {
    if (item.jumlah > 1) {
      const newQuantity = item.jumlah - 1;
      onUpdateQuantity(item.product_id, newQuantity);
    }
  };

  const handleIncrement = () => {
    if (item.jumlah < item.stok) {
      const newQuantity = item.jumlah + 1;
      onUpdateQuantity(item.product_id, newQuantity);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm">{item.nama_produk}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatRupiah(item.harga_satuan)} × {item.jumlah}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-300">
          <button onClick={handleDecrement} className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors" disabled={item.jumlah <= 1}>
            <FiMinus className="text-sm" />
          </button>
          <span className="px-2 text-sm font-medium min-w-[30px] text-center">{item.jumlah}</span>
          <button onClick={handleIncrement} className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors" disabled={item.jumlah >= item.stok}>
            <FiPlus className="text-sm" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="min-w-[100px] text-right">
          <span className="font-semibold text-gray-900 text-sm">{formatRupiah(item.subtotal)}</span>
        </div>

        {/* Remove Button */}
        <button onClick={() => onRemove(item.product_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
          <FiTrash2 className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
