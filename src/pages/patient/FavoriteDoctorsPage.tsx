import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconHeart,
  IconHeartFilled,
  IconStar,
  IconMapPin,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, GridSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
import api from '@/services/api';
import type { Doctor } from '@shared/schemas';

interface FavoriteWithDoctor {
  id: string;
  doctorId: string;
  doctor: Doctor;
  createdAt: string;
}

const specialtyLabels: Record<string, string> = {
  general: 'General Practice',
  cardiology: 'Cardiology',
  dermatology: 'Dermatology',
  pediatrics: 'Pediatrics',
  orthopedics: 'Orthopedics',
};

const specialtyColors: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
  cardiology: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
  dermatology: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400' },
  pediatrics: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
  orthopedics: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
};

export function FavoriteDoctorsPage() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithDoctor[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/favorites');
      const payload = response.data?.data?.favorites;
      return Array.isArray(payload) ? payload : [];
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      return api.delete(`/favorites/${doctorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      notifySuccess('Removed from favorites');
    },
    onError: () => {
      notifyError('Failed to remove from favorites');
    },
  });

  return (
    <DashboardLayout
      title="Favorite Doctors"
      subtitle="Your saved healthcare professionals for quick access"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading favorites...">
        {!Array.isArray(favorites) || favorites.length === 0 ? (
          <EmptyState
            icon={<IconHeart size={48} className="text-gray-300" />}
            title="No favorites yet"
            description="Save doctors to your favorites for quick access"
            action={
              <Link to="/doctors">
                <Button variant="primary">Browse Doctors</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {favorites.map(({ id, doctor }, index) => {
              const colors = specialtyColors[doctor.specialty] || specialtyColors.general;

              return (
                <Card
                  key={id}
                  variant="elevated"
                  padding="none"
                  hover
                  className="overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <img
                          src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                          alt={doctor.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{doctor.name}</h3>
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold mt-1 ${colors.bg} ${colors.text}`}>
                            {specialtyLabels[doctor.specialty] || doctor.specialty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavoriteMutation.mutate(doctor.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 tap-target"
                        disabled={removeFavoriteMutation.isPending}
                      >
                        <IconHeartFilled size={20} className="text-red-500" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                          <IconStar size={12} className="text-amber-400 fill-amber-400 sm:w-3.5 sm:h-3.5" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{doctor.rating}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{doctor.reviewCount} reviews</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-0.5 sm:mb-1">{doctor.experience}y</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Exp.</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base mb-0.5 sm:mb-1">${doctor.fee}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Fee</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      <IconMapPin size={14} className="flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{doctor.location}</span>
                    </div>

                    {/* Action */}
                    <Link to={`/doctors/${doctor.id}`}>
                      <Button variant="primary" fullWidth size="sm" className="sm:py-3">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
