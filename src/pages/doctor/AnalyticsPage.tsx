import { useQuery } from '@tanstack/react-query';
import {
  IconCalendar,
  IconUsers,
  IconCurrencyDollar,
  IconStar,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, StatsSkeleton } from '@/components/layout';
import { Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface AnalyticsData {
  totalAppointments: number;
  appointmentsTrend: number;
  totalPatients: number;
  patientsTrend: number;
  totalRevenue: number;
  revenueTrend: number;
  averageRating: number;
  ratingTrend: number;
  appointmentsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    rejected: number;
    cancelled: number;
  };
  appointmentsByMonth: { month: string; count: number }[];
  topSpecialties: { specialty: string; count: number }[];
}

export function AnalyticsPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['doctor-analytics', user?.doctorId],
    queryFn: async () => {
      const response = await api.get(`/analytics/doctor/${user?.doctorId}`);
      return response.data.data;
    },
    enabled: !!user?.doctorId,
  });

  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
          <IconTrendingUp size={16} className="mr-1" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
          <IconTrendingDown size={16} className="mr-1" />
          {value}%
        </span>
      );
    }
    return <span className="text-gray-500 text-sm">0%</span>;
  };

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Insights and statistics about your practice"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading analytics...">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <IconCalendar size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              {renderTrend(analytics?.appointmentsTrend || 0)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.totalAppointments || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Appointments</p>
          </Card>

          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <IconUsers size={24} className="text-green-600 dark:text-green-400" />
              </div>
              {renderTrend(analytics?.patientsTrend || 0)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.totalPatients || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unique Patients</p>
          </Card>

          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <IconCurrencyDollar size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              {renderTrend(analytics?.revenueTrend || 0)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${analytics?.totalRevenue?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          </Card>

          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <IconStar size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              {renderTrend(analytics?.ratingTrend || 0)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.averageRating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointments by Status */}
          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Appointments by Status</h3>
            <div className="space-y-4">
              {[
                { label: 'Completed', value: analytics?.appointmentsByStatus?.completed || 0, color: 'bg-green-500' },
                { label: 'Confirmed', value: analytics?.appointmentsByStatus?.confirmed || 0, color: 'bg-blue-500' },
                { label: 'Pending', value: analytics?.appointmentsByStatus?.pending || 0, color: 'bg-amber-500' },
                { label: 'Cancelled', value: analytics?.appointmentsByStatus?.cancelled || 0, color: 'bg-gray-500' },
                { label: 'Rejected', value: analytics?.appointmentsByStatus?.rejected || 0, color: 'bg-red-500' },
              ].map((item) => {
                const total = analytics?.totalAppointments || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Monthly Appointments</h3>
            <div className="space-y-3">
              {(analytics?.appointmentsByMonth || []).slice(0, 6).map((item, index) => {
                const maxCount = Math.max(...(analytics?.appointmentsByMonth?.map(m => m.count) || [1]));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.month} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">{item.month}</span>
                    <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 10)}%`, animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-white text-sm font-semibold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!analytics?.appointmentsByMonth || analytics.appointmentsByMonth.length === 0) && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
