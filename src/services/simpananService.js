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

// Create new simpanan
export const createSimpanan = async (simpananData) => {
  try {
    const response = await axios.post(`${API_URL}/simpanan`, simpananData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menambah simpanan'};
  }
};

// Get all simpanan with filters
export const getAllSimpanan = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.jenis_simpanan) params.append('jenis_simpanan', filters.jenis_simpanan);
    if (filters.user_id) params.append('user_id', filters.user_id);

    const response = await axios.get(`${API_URL}/simpanan?${params.toString()}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data simpanan'};
  }
};

// Get simpanan by user ID
export const getSimpananByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/simpanan/user/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil data simpanan user'};
  }
};

// Get simpanan statistics
export const getSimpananStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/simpanan/stats`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal mengambil statistik simpanan'};
  }
};

// Get total simpanan by user ID
export const getTotalByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/simpanan/total/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menghitung total simpanan'};
  }
};

// Delete simpanan (SuperAdmin only)
export const deleteSimpanan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/simpanan/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Gagal menghapus simpanan'};
  }
};

export default {
  createSimpanan,
  getAllSimpanan,
  getSimpananByUser,
  getSimpananStats,
  getTotalByUser,
  deleteSimpanan,
};
