import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Get payment schedule by pinjaman ID
export const getAngsuranByPinjaman = async (pinjamanId) => {
  try {
    const response = await axios.get(`${API_URL}/angsuran/pinjaman/${pinjamanId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil jadwal angsuran'};
  }
};

// Record payment for an angsuran
export const recordPayment = async (id, paymentData) => {
  try {
    console.log('Sending payment request for ID:', id); // Debug
    console.log('Payment data:', paymentData); // Debug

    const response = await axios.put(`${API_URL}/angsuran/${id}/pay`, paymentData, getAuthHeader());

    console.log('Payment response:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error.response?.data || {message: 'Gagal mencatat pembayaran'};
  }
};

// Get overdue angsuran
export const getOverdueAngsuran = async () => {
  try {
    const response = await axios.get(`${API_URL}/angsuran/overdue`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data angsuran terlambat'};
  }
};

// Get angsuran statistics
export const getAngsuranStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/angsuran/stats`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil statistik angsuran'};
  }
};

// Get upcoming payments (next 7 days)
export const getUpcomingPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/angsuran/upcoming`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data pembayaran mendatang'};
  }
};

// Update keterangan (SuperAdmin only)
export const updateKeterangan = async (id, keterangan) => {
  try {
    const response = await axios.put(`${API_URL}/angsuran/${id}/keterangan`, {keterangan}, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal memperbarui keterangan'};
  }
};

export default {
  getAngsuranByPinjaman,
  recordPayment,
  getOverdueAngsuran,
  getAngsuranStats,
  getUpcomingPayments,
  updateKeterangan,
};
