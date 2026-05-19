import {useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {FiLock, FiArrowLeft, FiEye, FiEyeOff} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    token: location.state?.token || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.token || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', {
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(response.data.message || 'Password berhasil direset!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <FiArrowLeft />
          <span>Kembali ke Login</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">KB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm text-gray-600 mt-2">Masukkan password baru Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reset Token</label>
              <input
                type="text"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Paste token dari email"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Salin token yang Anda terima</p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : <FiEye className="text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password baru"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirmPassword ? <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : <FiEye className="text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !formData.token} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Info:</span> Setelah reset berhasil, Anda akan diarahkan ke halaman login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
