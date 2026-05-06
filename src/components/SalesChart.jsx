import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

const SalesChart = ({data, title = 'Sales Trend'}) => {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'});
  };

  // Transform data for chart
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    sales: parseFloat(item.total_sales) || 0,
    transactions: parseInt(item.transaction_count) || 0,
  }));

  // Custom tooltip
  const CustomTooltip = ({active, payload}) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-primary">Penjualan: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-gray-600">Transaksi: {payload[0].payload.transactions}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
          <YAxis
            tick={{fontSize: 12}}
            stroke="#9ca3af"
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: '14px', paddingTop: '10px'}} iconType="line" />
          <Line type="monotone" dataKey="sales" stroke="#FFBC54" strokeWidth={3} dot={{fill: '#FFBC54', r: 4}} activeDot={{r: 6}} name="Penjualan (Rp)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
