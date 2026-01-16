import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconLayoutDashboard,
  IconCalendar,
  IconCalendarEvent,
  IconUsers,
  IconFileText,
  IconPrescription,
  IconChartBar,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconStethoscope,
  IconHeart,
  IconHistory,
  IconFolder,
  IconMessage,
  IconUserCircle,
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  icon: typeof IconLayoutDashboard;
  href: string;
  badge?: number;
}

const doctorNavItems: NavItem[] = [
  { label: 'Dashboard', icon: IconLayoutDashboard, href: '/doctor/dashboard' },
  { label: 'Calendar', icon: IconCalendar, href: '/doctor/calendar' },
  { label: 'Schedule', icon: IconCalendarEvent, href: '/doctor/schedule' },
  { label: 'Patient Notes', icon: IconUsers, href: '/doctor/notes' },
  { label: 'Prescriptions', icon: IconPrescription, href: '/doctor/prescriptions' },
  { label: 'Analytics', icon: IconChartBar, href: '/doctor/analytics' },
  { label: 'Messages', icon: IconMessage, href: '/chat' },
  { label: 'Profile', icon: IconSettings, href: '/doctor/profile' },
];

const patientNavItems: NavItem[] = [
  { label: 'Find Doctors', icon: IconStethoscope, href: '/doctors' },
  { label: 'My Appointments', icon: IconCalendar, href: '/patient/appointments' },
  { label: 'History', icon: IconHistory, href: '/patient/history' },
  { label: 'Favorites', icon: IconHeart, href: '/patient/favorites' },
  { label: 'Prescriptions', icon: IconFileText, href: '/patient/prescriptions' },
  { label: 'Medical Records', icon: IconFolder, href: '/patient/records' },
  { label: 'Messages', icon: IconMessage, href: '/chat' },
  { label: 'My Profile', icon: IconUserCircle, href: '/patient/profile' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'doctor' ? doctorNavItems : patientNavItems;

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full z-40 pt-16
        bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute -right-3 top-20 z-50
          w-6 h-6 rounded-full
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          flex items-center justify-center
          text-gray-500 hover:text-blue-600
          shadow-sm hover:shadow-md
          transition-all duration-200
        `}
      >
        {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="h-full overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            location.pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon 
                    size={22} 
                    className={`
                      flex-shrink-0 transition-transform duration-200
                      ${isActive ? '' : 'group-hover:scale-110'}
                    `}
                  />
                  {!collapsed && (
                    <span className={`
                      font-medium text-sm whitespace-nowrap
                      transition-all duration-200
                      ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}
                    `}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span className={`
                      ml-auto px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 
                    bg-gray-900 text-white text-sm font-medium
                    rounded-lg opacity-0 invisible
                    group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 whitespace-nowrap
                    pointer-events-none z-50
                  ">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
