import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from '@mantine/core';
import { 
  IconLogout, 
  IconStethoscope, 
  IconMenu2, 
  IconX,
  IconSun,
  IconMoon,
  IconBell,
  IconMessage,
  IconSettings,
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLandingPage = location.pathname === '/' && !isAuthenticated;
  const isDashboard = isAuthenticated && (
    location.pathname.startsWith('/doctor') || 
    location.pathname.startsWith('/patient') ||
    location.pathname.startsWith('/doctors') ||
    location.pathname.startsWith('/chat')
  );

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled || !isLandingPage 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' 
          : 'bg-transparent'
        }
      `}
    >
      <div className={isDashboard ? 'px-4 lg:px-6' : 'container-main'}>
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
              ${scrolled || !isLandingPage || isDashboard
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-white/20 backdrop-blur-sm'
              }
            `}>
              <IconStethoscope className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className={`
              text-lg font-bold font-display transition-colors duration-300
              ${scrolled || !isLandingPage || isDashboard ? 'text-gray-900 dark:text-white' : 'text-white'}
            `}>
              MedBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                </button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Messages */}
                <Link 
                  to="/chat"
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <IconMessage size={20} />
                </Link>

                {/* User Menu */}
                <Menu shadow="lg" width={220} position="bottom-end">
                  <Menu.Target>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                          {user?.role}
                        </p>
                      </div>
                    </button>
                  </Menu.Target>

                  <Menu.Dropdown className="dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2 lg:hidden">
                      <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                    
                    <Menu.Item
                      leftSection={<IconSettings size={16} />}
                      onClick={() => navigate(user?.role === 'doctor' ? '/doctor/profile' : '/patient/profile')}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Menu.Item>
                    
                    <Menu.Divider className="dark:border-gray-700" />
                    
                    <Menu.Item
                      leftSection={<IconLogout size={16} />}
                      onClick={handleLogout}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`
                    p-2.5 rounded-xl transition-all
                    ${scrolled 
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                </button>

                <Link
                  to="/login"
                  className={`
                    px-5 py-2.5 rounded-lg font-medium transition-all duration-200
                    ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}
                  `}
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <IconX size={24} className={scrolled || !isLandingPage ? 'text-gray-600' : 'text-white'} />
            ) : (
              <IconMenu2 size={24} className={scrolled || !isLandingPage ? 'text-gray-600' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fade-in-down">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                  <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3"
                >
                  {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3"
                >
                  {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
