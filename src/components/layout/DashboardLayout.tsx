import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Breadcrumb } from './Breadcrumb';
import { IconStethoscope, IconBrandTwitter, IconBrandLinkedin, IconBrandFacebook } from '@tabler/icons-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showBreadcrumb?: boolean;
  fullWidth?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle,
  actions,
  showBreadcrumb = true,
  fullWidth = false,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      
      {/* Sidebar - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="
        lg:pl-64 pt-16 flex-1 flex flex-col
        pb-20 lg:pb-0
        transition-all duration-300
      ">
        <div className={`${fullWidth ? 'px-4 lg:px-6' : 'px-4 lg:px-6'} py-4 lg:py-6`}>
          {/* Breadcrumb - Hidden on mobile */}
          {showBreadcrumb && (
            <div className="hidden md:block">
              <Breadcrumb />
            </div>
          )}

          {/* Page Header */}
          {(title || actions) && (
            <div className="flex flex-col gap-2 mb-4 lg:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  {title && (
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>

        {/* Footer - Hidden on mobile */}
        <footer className="hidden lg:block mt-auto border-t border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
          <div className="container-main py-6 lg:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <IconStethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">MedBook</span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} MedBook. All rights reserved.
              </p>

              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <IconBrandTwitter size={16} className="text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <IconBrandLinkedin size={16} className="text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <IconBrandFacebook size={16} className="text-gray-600 dark:text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation - Only on mobile/tablet */}
      <BottomNav />
    </div>
  );
}
