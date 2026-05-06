import api from './api';

// Get all transactions
export const getAllTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

// Create new transaction
export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

// Get transactions by date range
export const getTransactionsByDateRange = async (startDate, endDate) => {
  const response = await api.get(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Get today's transactions
export const getTodayTransactions = async () => {
  const response = await api.get('/transactions/today');
  return response.data;
};

// Get transaction statistics
export const getTransactionStats = async (startDate = null, endDate = null) => {
  let url = '/transactions/stats';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Get daily sales
export const getDailySales = async (days = 7) => {
  const response = await api.get(`/transactions/daily-sales?days=${days}`);
  return response.data;
};

// Search transactions
export const searchTransactions = async (query) => {
  const response = await api.get(`/transactions/search?q=${query}`);
  return response.data;
};

export default {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  getTransactionsByDateRange,
  getTodayTransactions,
  getTransactionStats,
  getDailySales,
  searchTransactions,
};
