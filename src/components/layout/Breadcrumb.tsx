import { Link, useLocation } from 'react-router-dom';
import { IconChevronRight, IconHome } from '@tabler/icons-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to breadcrumb mapping
const routeLabels: Record<string, string> = {
  'doctors': 'Find Doctors',
  'doctor': 'Doctor',
  'patient': 'Patient',
  'dashboard': 'Dashboard',
  'calendar': 'Calendar',
  'schedule': 'Schedule Management',
  'notes': 'Patient Notes',
  'prescriptions': 'Prescriptions',
  'analytics': 'Analytics',
  'profile': 'Profile',
  'appointments': 'My Appointments',
  'history': 'History',
  'favorites': 'Favorites',
  'records': 'Medical Records',
  'chat': 'Messages',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = pathnames.map((segment, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return {
      label,
      href: index < pathnames.length - 1 ? href : undefined,
    };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link 
        to="/"
        className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <IconHome size={16} />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <IconChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
          {item.href ? (
            <Link 
              to={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
