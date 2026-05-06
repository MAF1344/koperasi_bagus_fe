import api from './api';

// Get all users
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get users by role
export const getUsersByRole = async (role) => {
  const response = await api.get(`/users/role/${role}`);
  return response.data;
};

// Get user statistics
export const getUserStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};

// Change password
export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await api.put('/auth/change-password', {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUserStats,
  changePassword,
};
