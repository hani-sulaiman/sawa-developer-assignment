import { Link, useLocation } from 'react-router-dom';
import { 
  IconLayoutDashboard,
  IconCalendar,
  IconCalendarEvent,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconStethoscope,
  IconHeart,
  IconHistory,
  IconFolder,
  IconMessage,
  IconUserCircle,
  IconHome,
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  icon: typeof IconLayoutDashboard;
  href: string;
}

const doctorNavItems: NavItem[] = [
  { label: 'Home', icon: IconHome, href: '/doctor/dashboard' },
  { label: 'Calendar', icon: IconCalendar, href: '/doctor/calendar' },
  { label: 'Schedule', icon: IconCalendarEvent, href: '/doctor/schedule' },
  { label: 'Chat', icon: IconMessage, href: '/chat' },
  { label: 'Profile', icon: IconSettings, href: '/doctor/profile' },
];

const patientNavItems: NavItem[] = [
  { label: 'Doctors', icon: IconStethoscope, href: '/doctors' },
  { label: 'Bookings', icon: IconCalendar, href: '/patient/appointments' },
  { label: 'Favorites', icon: IconHeart, href: '/patient/favorites' },
  { label: 'Chat', icon: IconMessage, href: '/chat' },
  { label: 'Profile', icon: IconUserCircle, href: '/patient/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'doctor' ? doctorNavItems : patientNavItems;

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white dark:bg-gray-900 
      border-t border-gray-100 dark:border-gray-800
      shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
      lg:hidden
      safe-area-bottom
    ">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          location.pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full py-1 px-1
                transition-all duration-200 ease-out
                relative group
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="
                  absolute top-0 left-1/2 -translate-x-1/2
                  w-12 h-1 rounded-full
                  bg-gradient-to-r from-blue-500 to-blue-600
                  animate-scale-in
                " />
              )}
              
              <div className={`
                p-1.5 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30' 
                  : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                }
              `}>
                <Icon 
                  size={22} 
                  className={`
                    transition-all duration-200
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'
                    }
                  `}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              
              <span className={`
                text-[10px] font-semibold mt-0.5
                transition-colors duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-500'
                }
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
