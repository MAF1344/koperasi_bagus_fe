const Badge = ({type, children, variant = 'primary'}) => {
  const variants = {
    // Role badges
    superadmin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    pengunjung: 'bg-green-100 text-green-800',

    // Status badges
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',

    // General variants
    primary: 'bg-primary/20 text-secondary',
    secondary: 'bg-secondary/20 text-secondary',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const badgeClass = variants[type] || variants[variant] || variants.primary;

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>{children}</span>;
};

export default Badge;
