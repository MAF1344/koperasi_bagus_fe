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

// Create new pinjaman (loan application)
export const createPinjaman = async (data) => {
  try {
    console.log('Creating pinjaman with data:', data); // Debug

    const response = await axios.post(
      `${API_URL}/pinjaman`,
      {
        jumlah_pinjaman: data.jumlah_pinjaman,
        tenor_bulan: data.tenor_bulan,
        keterangan: data.keterangan, // Pastikan field name = 'keterangan'
      },
      getAuthHeader(),
    );

    console.log('Create pinjaman response:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Error creating pinjaman:', error.response?.data || error); // Debug
    throw error.response?.data || {message: 'Gagal mengajukan pinjaman'};
  }
};

// Get all pinjaman with filters
export const getAllPinjaman = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.user_id) params.append('user_id', filters.user_id);

    const response = await axios.get(`${API_URL}/pinjaman?${params.toString()}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data pinjaman'};
  }
};

// Get pinjaman by user ID
export const getPinjamanByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/pinjaman/user/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data pinjaman user'};
  }
};

// Get pinjaman detail by ID
export const getPinjamanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/pinjaman/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil detail pinjaman'};
  }
};

// Get pinjaman statistics
export const getPinjamanStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/pinjaman/stats`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil statistik pinjaman'};
  }
};

// Get pending pinjaman (for approval page)
export const getPendingPinjaman = async () => {
  try {
    const response = await axios.get(`${API_URL}/pinjaman/pending`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data pinjaman pending'};
  }
};

// Approve pinjaman (SuperAdmin only)
export const approvePinjaman = async (id, keterangan_approval) => {
  try {
    const response = await axios.put(`${API_URL}/pinjaman/${id}/approve`, {keterangan_approval}, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menyetujui pinjaman'};
  }
};

// Reject pinjaman (SuperAdmin only)
export const rejectPinjaman = async (id, keterangan_approval) => {
  try {
    const response = await axios.put(`${API_URL}/pinjaman/${id}/reject`, {keterangan_approval}, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menolak pinjaman'};
  }
};

// Delete pinjaman (SuperAdmin only)
export const deletePinjaman = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/pinjaman/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menghapus pinjaman'};
  }
};

export default {
  createPinjaman,
  getAllPinjaman,
  getPinjamanByUser,
  getPinjamanById,
  getPinjamanStats,
  getPendingPinjaman,
  approvePinjaman,
  rejectPinjaman,
  deletePinjaman,
};
