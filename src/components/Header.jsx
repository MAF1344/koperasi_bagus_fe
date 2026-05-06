import {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {FiMenu, FiUser, FiLogOut, FiChevronDown} from 'react-icons/fi';

const Header = ({setIsSidebarOpen}) => {
  const navigate = useNavigate();
  const {user, logout} = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'pengunjung':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Menu button for mobile */}
      <div className="flex items-center space-x-4">
        <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiMenu className="text-2xl text-gray-700" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-800">Selamat Datang, {user?.nama_lengkap}</h2>
          <p className="text-sm text-gray-500 hidden sm:block">Kelola sistem koperasi dengan mudah</p>
        </div>
      </div>

      {/* Right side - User menu */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{user?.nama_lengkap?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">{user?.nama_lengkap}</p>
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block capitalize ${getRoleBadgeColor(user?.role)}`}>{user?.role}</p>
          </div>
          <FiChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.nama_lengkap}</p>
              <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                navigate('/profile');
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <FiUser />
              <span>Profile Saya</span>
            </button>

            <hr className="my-2" />

            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
