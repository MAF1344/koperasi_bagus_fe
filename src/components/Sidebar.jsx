import {NavLink} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {FiHome, FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiBarChart2, FiUser, FiClock, FiCreditCard, FiCheckCircle} from 'react-icons/fi';

const Sidebar = ({isOpen, setIsOpen}) => {
  const {user} = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: FiHome,
      path: '/dashboard',
      roles: ['superadmin', 'admin', 'pengunjung'],
    },
    {
      name: 'Kelola User',
      icon: FiUsers,
      path: '/users',
      roles: ['superadmin'],
    },
    {
      name: 'Produk',
      icon: FiPackage,
      path: '/products',
      roles: ['superadmin', 'admin'],
    },
    {
      name: 'Kasir',
      icon: FiShoppingCart,
      path: '/transactions',
      roles: ['superadmin', 'admin'],
    },
    {
      name: 'Riwayat Transaksi',
      icon: FiClock,
      path: '/transactions/history',
      roles: ['superadmin', 'admin'],
    },
    // Sprint 5 - Simpan Pinjam Section
    {
      name: 'Simpanan',
      icon: FiDollarSign,
      path: '/simpanan',
      roles: ['superadmin', 'admin'],
    },
    {
      name: 'Pinjaman',
      icon: FiCreditCard,
      path: '/pinjaman',
      roles: ['superadmin', 'admin'],
    },
    {
      name: 'Approval Pinjaman',
      icon: FiCheckCircle,
      path: '/pinjaman-approval',
      roles: ['superadmin'],
    },
    {
      name: 'Laporan',
      icon: FiBarChart2,
      path: '/reports',
      roles: ['superadmin', 'admin', 'pengunjung'],
    },
    {
      name: 'Profile',
      icon: FiUser,
      path: '/profile',
      roles: ['superadmin', 'admin', 'pengunjung'],
    },
  ];

  // Filter menu based on user role
  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">KB</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg">Koperasi BAGUS</h1>
              <p className="text-xs opacity-90">Berkah Guyub Sejahtera</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{maxHeight: 'calc(100vh - 180px)'}}>
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({isActive}) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setIsOpen(false)}
              end>
              <item.icon className="text-xl" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{user?.nama_lengkap?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.nama_lengkap}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
