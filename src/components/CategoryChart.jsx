import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts';

const CategoryChart = ({data, title = 'Category Distribution'}) => {
  // Colors for each category
  const COLORS = {
    buku: '#3B82F6', // Blue
    seragam: '#F59E0B', // Orange
    atk: '#10B981', // Green
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Transform data for chart
  const chartData = data
    .filter((item) => parseFloat(item.total_revenue) > 0)
    .map((item) => ({
      name: item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1),
      value: parseFloat(item.total_revenue) || 0,
      quantity: parseInt(item.total_quantity) || 0,
      kategori: item.kategori,
    }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label
  const renderLabel = (entry) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({active, payload}) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Penjualan: {formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">Quantity: {data.quantity} items</p>
          <p className="text-sm text-primary font-semibold">{percent}% dari total</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={100} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.kategori] || '#6B7280'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const item = chartData.find((d) => d.name === value);
              return `${value} (${formatCurrency(item?.value || 0)})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
