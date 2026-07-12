import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiMail, FiArrowLeft, FiCopy, FiCheck} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email harus diisi');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', {email});

      if (response.data.success && response.data.data.resetToken) {
        // Token received (demo mode)
        setResetToken(response.data.data.resetToken);
        setShowToken(true);
        toast.success('Token reset password berhasil dibuat!');
      } else {
        // Production mode (email sent)
        toast.success(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim permintaan reset password');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    toast.success('Token berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const goToResetPage = () => {
    navigate('/reset-password', {state: {token: resetToken}});
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
            <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
            <p className="text-sm text-gray-600 mt-2">Masukkan email Anda untuk mereset password</p>
          </div>

          {!showToken ? (
            // Email Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Memproses...' : 'Kirim Token Reset'}
              </button>
            </form>
          ) : (
            // Token Display
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">✅ Token Reset Password Berhasil Dibuat</p>
                <p className="text-xs text-blue-700">Salin token di bawah ini dan gunakan untuk mereset password Anda. Token berlaku selama 1 jam.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reset Token</label>
                <div className="relative">
                  <input type="text" value={resetToken} readOnly className="block w-full pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" />
                  <button onClick={copyToken} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {copied ? <FiCheck className="text-green-600" /> : <FiCopy className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={copyToken} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Salin Token
                </button>
                <button onClick={goToResetPage} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                  Reset Password
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">Token akan kadaluarsa dalam 1 jam</p>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold">Mode Demo:</span> Token ditampilkan langsung. Di production, token akan dikirim via email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
