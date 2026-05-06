import api from './api';

// Get dashboard data
export const getDashboardData = async (period = '7days') => {
  const response = await api.get(`/reports/dashboard?period=${period}`);
  return response.data;
};

// Get sales statistics
export const getSalesStats = async (startDate, endDate) => {
  const response = await api.get(`/reports/sales-stats?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Get daily sales trend
export const getDailySalesTrend = async (days = 7) => {
  const response = await api.get(`/reports/daily-trend?days=${days}`);
  return response.data;
};

// Get monthly sales trend
export const getMonthlySalesTrend = async () => {
  const response = await api.get('/reports/monthly-trend');
  return response.data;
};

// Get top selling products
export const getTopProducts = async (limit = 5, startDate = null, endDate = null) => {
  let url = `/reports/top-products?limit=${limit}`;
  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Get sales by category
export const getSalesByCategory = async (startDate = null, endDate = null) => {
  let url = '/reports/sales-by-category';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Get low stock products
export const getLowStockProducts = async (threshold = 10) => {
  const response = await api.get(`/reports/low-stock?threshold=${threshold}`);
  return response.data;
};

// Get overall statistics
export const getOverallStats = async () => {
  const response = await api.get('/reports/overall-stats');
  return response.data;
};

// Get product performance
export const getProductPerformance = async (startDate = null, endDate = null) => {
  let url = '/reports/product-performance';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

export default {
  getDashboardData,
  getSalesStats,
  getDailySalesTrend,
  getMonthlySalesTrend,
  getTopProducts,
  getSalesByCategory,
  getLowStockProducts,
  getOverallStats,
  getProductPerformance,
};
