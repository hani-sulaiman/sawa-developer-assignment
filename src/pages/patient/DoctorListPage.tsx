import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, TextInput, MultiSelect, NumberInput } from '@mantine/core';
import { IconSearch, IconStethoscope, IconStar, IconMapPin, IconFilter, IconBuildingHospital, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { DashboardLayout, PageLoader, GridSkeleton } from '@/components/layout';
import { Card, EmptyState, Button } from '@/components/ui';
import api from '@/services/api';
import { dayNames } from '@shared/schemas';
import type { Doctor, Specialty, SpecialtyOption, FavoriteWithDoctor } from '@shared/schemas';

interface DoctorsResponse {
  doctors: Doctor[];
  specialties: SpecialtyOption[];
}

const specialtyColors: Record<Specialty, { bg: string; text: string }> = {
  general: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
  cardiology: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
  dermatology: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400' },
  pediatrics: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
  orthopedics: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
};

export function DoctorListPage() {
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [search, setSearch] = useState('');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<DoctorsResponse>({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const params = specialty ? { specialty } : {};
      const response = await api.get('/doctors', { params });
      return response.data.data;
    },
  });

  const { data: favorites = [] } = useQuery<FavoriteWithDoctor[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/favorites');
      const payload = response.data?.data?.favorites;
      return Array.isArray(payload) ? payload : [];
    },
  });

  const favoriteDoctorIds = new Set(favorites.map((f) => f.doctorId));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      return api.post(`/favorites/${doctorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const doctors = data?.doctors ?? [];
  const specialties = data?.specialties ?? [];
  const specialtyOptions = specialties.map((s) => ({ value: s.id, label: s.name }));
  const specialtyName = (id: Specialty) => specialties.find((s) => s.id === id)?.name ?? id;
  const dayOptions = dayNames.map((day) => ({ value: day, label: day }));
  const ratingOptions = [
    { value: '4.5', label: '4.5+ stars' },
    { value: '4', label: '4.0+ stars' },
    { value: '3.5', label: '3.5+ stars' },
    { value: '3', label: '3.0+ stars' },
  ];

  const resetFilters = () => {
    setSearch('');
    setSpecialty(null);
    setHospital('');
    setLocation('');
    setMinRating(null);
    setMaxFee(null);
    setMinExperience(null);
    setAvailableDays([]);
  };

  const filteredDoctors = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const hospitalLower = hospital.trim().toLowerCase();
    const locationLower = location.trim().toLowerCase();

    return doctors.filter((doctor) => {
      if (searchLower) {
        const matchesSearch =
          doctor.name.toLowerCase().includes(searchLower) ||
          specialtyName(doctor.specialty).toLowerCase().includes(searchLower) ||
          doctor.hospital.toLowerCase().includes(searchLower) ||
          doctor.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (hospitalLower && !doctor.hospital.toLowerCase().includes(hospitalLower)) return false;
      if (locationLower && !doctor.location.toLowerCase().includes(locationLower)) return false;
      if (minRating !== null && doctor.rating < minRating) return false;
      if (maxFee !== null && doctor.fee > maxFee) return false;
      if (minExperience !== null && doctor.experience < minExperience) return false;
      if (availableDays.length > 0 && !availableDays.some((day) => doctor.availableDays?.includes(day))) {
        return false;
      }

      return true;
    });
  }, [doctors, search, specialties, hospital, location, minRating, maxFee, minExperience, availableDays]);

  return (
    <DashboardLayout
      title="Find Your Doctor"
      subtitle="Book appointments with verified healthcare professionals"
    >
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <TextInput
            placeholder="Search doctors..."
            size="md"
            leftSection={<IconSearch size={18} className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
        </div>
          <Select
            placeholder="All Specialties"
            size="md"
            data={[{ value: '', label: 'All Specialties' }, ...specialtyOptions]}
            value={specialty}
            onChange={(val) => setSpecialty((val || null) as Specialty | null)}
            leftSection={<IconFilter size={18} className="text-gray-400" />}
            clearable
            className="w-full sm:w-auto sm:min-w-[180px]"
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <TextInput
            placeholder="Hospital"
            size="md"
            leftSection={<IconBuildingHospital size={18} className="text-gray-400" />}
            value={hospital}
            onChange={(e) => setHospital(e.currentTarget.value)}
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <TextInput
            placeholder="Location"
            size="md"
            leftSection={<IconMapPin size={18} className="text-gray-400" />}
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <Select
            placeholder="Min rating"
            size="md"
            data={ratingOptions}
            value={minRating !== null ? String(minRating) : null}
            onChange={(value) => setMinRating(value ? Number(value) : null)}
            leftSection={<IconStar size={18} className="text-gray-400" />}
            clearable
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <NumberInput
            placeholder="Max fee"
            size="md"
            min={0}
            value={maxFee ?? undefined}
            onChange={(value) => setMaxFee(typeof value === 'number' ? value : null)}
            hideControls
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <NumberInput
            placeholder="Min experience (years)"
            size="md"
            min={0}
            value={minExperience ?? undefined}
            onChange={(value) => setMinExperience(typeof value === 'number' ? value : null)}
            hideControls
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <MultiSelect
            placeholder="Available days"
            size="md"
            data={dayOptions}
            value={availableDays}
            onChange={setAvailableDays}
            searchable
            clearable
            classNames={{
              input: 'h-11 sm:h-12'
            }}
          />
          <div className="flex items-center">
            <Button variant="secondary" size="sm" onClick={resetFilters} className="w-full sm:w-auto">
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Showing <span className="font-semibold text-gray-800 dark:text-white">{filteredDoctors.length}</span> doctors
        </p>
      )}

      <PageLoader isLoading={isLoading} loadingText="Finding doctors...">
        {/* Error State */}
        {error && (
          <Card variant="bordered" className="text-center py-12">
            <p className="text-red-500">Failed to load doctors. Please try again.</p>
          </Card>
        )}

        {/* Empty State */}
        {!error && filteredDoctors && filteredDoctors.length === 0 && (
          <EmptyState
            icon={<IconStethoscope size={48} className="text-gray-300" />}
            title="No doctors found"
            description="Try adjusting your filters or search terms"
          />
        )}

        {/* Doctors Grid */}
        {filteredDoctors && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredDoctors.map((doctor, index) => {
              const colors = specialtyColors[doctor.specialty] || { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
              const isFavorite = favoriteDoctorIds.has(doctor.id);
              
              return (
                <Card
                  key={doctor.id}
                  variant="elevated"
                  padding="none"
                  hover
                  className="overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <img
                        src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                        alt={doctor.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">{doctor.name}</h3>
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold mt-1 ${colors.bg} ${colors.text}`}>
                          {specialtyName(doctor.specialty)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavoriteMutation.mutate(doctor.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 tap-target"
                      >
                        {isFavorite ? (
                          <IconHeartFilled size={20} className="text-red-500" />
                        ) : (
                          <IconHeart size={20} className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
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
                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <IconBuildingHospital size={14} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <IconMapPin size={14} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{doctor.location}</span>
                      </div>
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
