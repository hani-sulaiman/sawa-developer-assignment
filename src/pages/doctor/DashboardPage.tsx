import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconCalendar,
  IconUsers,
  IconCurrencyDollar,
  IconStar,
  IconCalendarCheck,
  IconCalendarTime,
  IconArrowRight,
  IconClock,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, StatsSkeleton, ListSkeleton } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  totalRevenue: number;
  averageRating: number;
}

interface RecentAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export function DoctorDashboardPage() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['doctor-stats', user?.doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${user?.doctorId}/stats`);
      return response.data.data;
    },
    enabled: !!user?.doctorId,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<RecentAppointment[]>({
    queryKey: ['doctor-recent-appointments', user?.doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${user?.doctorId}/appointments?limit=5`);
      return response.data.data.appointments;
    },
    enabled: !!user?.doctorId,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isLoading = statsLoading || appointmentsLoading;

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0]}`}
      subtitle="Here's what's happening with your practice today"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading dashboard...">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <Card variant="elevated" padding="md" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <IconCalendar size={20} className="text-blue-600 dark:text-blue-400 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.todayAppointments || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Today</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <IconCalendarTime size={20} className="text-amber-600 dark:text-amber-400 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.pendingAppointments || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <IconUsers size={20} className="text-green-600 dark:text-green-400 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalPatients || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Patients</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <IconStar size={20} className="text-purple-600 dark:text-purple-400 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rating</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Quick Actions - Shows first on mobile */}
          <Card variant="elevated" padding="md" className="animate-fade-in-up lg:order-2" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Link to="/doctor/calendar">
                <button className="w-full p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors text-left tap-target">
                  <IconCalendar size={20} className="text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2 sm:w-6 sm:h-6" />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Calendar</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Check schedule</p>
                </button>
              </Link>
              
              <Link to="/doctor/schedule">
                <button className="w-full p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors text-left tap-target">
                  <IconClock size={20} className="text-green-600 dark:text-green-400 mb-1.5 sm:mb-2 sm:w-6 sm:h-6" />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Schedule</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Set availability</p>
                </button>
              </Link>
              
              <Link to="/doctor/notes">
                <button className="w-full p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors text-left tap-target">
                  <IconUsers size={20} className="text-purple-600 dark:text-purple-400 mb-1.5 sm:mb-2 sm:w-6 sm:h-6" />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Notes</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Patient info</p>
                </button>
              </Link>
              
              <Link to="/doctor/analytics">
                <button className="w-full p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors text-left tap-target">
                  <IconCurrencyDollar size={20} className="text-amber-600 dark:text-amber-400 mb-1.5 sm:mb-2 sm:w-6 sm:h-6" />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Analytics</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">View insights</p>
                </button>
              </Link>
            </div>
          </Card>

          {/* Recent Appointments */}
          <Card variant="elevated" padding="none" className="animate-fade-in-up lg:order-1" style={{ animationDelay: '0.5s' }}>
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Appointments</h2>
              <Link to="/doctor/calendar">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  View All <IconArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {appointments?.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {appointment.patientName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{appointment.patientName}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)} • {appointment.time}
                      </p>
                    </div>
                    <span className={`
                      px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0
                      ${appointment.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }
                    `}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              {(!appointments || appointments.length === 0) && (
                <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent appointments
                </div>
              )}
            </div>
          </Card>
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
