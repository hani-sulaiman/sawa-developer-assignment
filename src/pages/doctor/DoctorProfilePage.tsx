import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Textarea, Select, MultiSelect, NumberInput } from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconStar,
  IconBuildingHospital,
  IconCurrencyDollar,
  IconPhone,
  IconEdit,
  IconCheck,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { Card, EmptyState, Button } from '@/components/ui';
import { notifyError, notifySuccess } from '@/services/notify';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import {
  UpdateDoctorProfileSchema,
  type Doctor,
  type UpdateDoctorProfileInput,
  specialties,
  dayNames,
} from '@shared/schemas';

const formatSpecialty = (specialty?: string) =>
  specialty ? specialty.charAt(0).toUpperCase() + specialty.slice(1) : 'Not specified';

const formatValue = (value?: string | number | null, fallback = 'Not provided') =>
  value === undefined || value === null || value === '' ? fallback : String(value);

export function DoctorProfilePage() {
  const { user } = useAuth();
  const doctorId = user?.doctorId;
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: doctor, isLoading } = useQuery<Doctor>({
    queryKey: ['doctor-profile', doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}`);
      return response.data.data.doctor;
    },
    enabled: !!doctorId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateDoctorProfileInput>({
    resolver: zodResolver(UpdateDoctorProfileSchema),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateDoctorProfileInput) => {
      return api.put('/doctors/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile', doctorId] });
      notifySuccess('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      notifyError('Failed to update profile');
    },
  });

  const startEditing = () => {
    if (doctor) {
      reset({
        name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        location: doctor.location,
        phone: doctor.phone ?? undefined,
        experience: doctor.experience,
        fee: doctor.fee,
        currency: doctor.currency,
        availableDays: doctor.availableDays,
        bio: doctor.bio,
        image: doctor.image,
      });
    }
    setIsEditing(true);
  };

  const onSubmit = (data: UpdateDoctorProfileInput) => {
    updateMutation.mutate(data);
  };

  const specialtyOptions = specialties.map((option) => ({
    value: option.id,
    label: option.name,
  }));

  if (!doctorId) {
    return (
      <DashboardLayout title="Doctor Profile" subtitle="Manage your public profile">
        <EmptyState
          title="Doctor profile not linked"
          description="Your account is missing a doctor profile. Please contact support."
          action={
            <Button variant="secondary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Doctor Profile"
      subtitle="Review your public profile details"
      actions={
        !isEditing ? (
          <Button variant="primary" onClick={startEditing}>
            <IconEdit size={18} className="mr-2" />
            Edit Profile
          </Button>
        ) : null
      }
    >
      <PageLoader isLoading={isLoading} loadingText="Loading profile...">
        {!doctor ? (
          <EmptyState
            title="Profile unavailable"
            description="We couldn't load your profile details right now."
            action={
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <Card variant="elevated" padding="lg" className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <img
                        src={watch('image') || doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                        alt={doctor.name}
                        className="w-28 h-28 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800"
                      />
                      <div className="flex-1 grid md:grid-cols-2 gap-4">
                        <TextInput
                          label="Full Name"
                          placeholder="Enter full name"
                          {...register('name')}
                          error={errors.name?.message}
                        />
                        <Select
                          label="Specialty"
                          placeholder="Select specialty"
                          data={specialtyOptions}
                          value={watch('specialty') || ''}
                          onChange={(value) => setValue('specialty', value as UpdateDoctorProfileInput['specialty'])}
                          error={errors.specialty?.message}
                        />
                        <TextInput
                          label="Hospital"
                          placeholder="Hospital or clinic"
                          {...register('hospital')}
                          error={errors.hospital?.message}
                        />
                        <TextInput
                          label="Location"
                          placeholder="City, building"
                          {...register('location')}
                          error={errors.location?.message}
                        />
                        <TextInput
                          label="Phone"
                          placeholder="+1 555 0101"
                          {...register('phone')}
                          error={errors.phone?.message}
                        />
                        <NumberInput
                          label="Experience (years)"
                          value={watch('experience') ?? undefined}
                          min={0}
                          onChange={(value) =>
                            setValue('experience', typeof value === 'number' ? value : undefined)
                          }
                          error={errors.experience?.message}
                        />
                        <NumberInput
                          label="Consultation Fee"
                          value={watch('fee') ?? undefined}
                          min={0}
                          onChange={(value) => setValue('fee', typeof value === 'number' ? value : undefined)}
                          error={errors.fee?.message}
                        />
                        <TextInput
                          label="Currency"
                          placeholder="USD"
                          {...register('currency')}
                          error={errors.currency?.message}
                        />
                        <TextInput
                          label="Profile Image URL"
                          placeholder="https://"
                          {...register('image')}
                          error={errors.image?.message}
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card variant="elevated" padding="lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                      <Textarea
                        label="Bio"
                        placeholder="Share your background, focus areas, and experience"
                        minRows={6}
                        {...register('bio')}
                        error={errors.bio?.message}
                      />
                    </Card>
                    <Card variant="elevated" padding="lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Availability</h3>
                      <MultiSelect
                        label="Available Days"
                        placeholder="Select available days"
                        data={dayNames.map((day) => ({ value: day, label: day }))}
                        value={watch('availableDays') || []}
                        onChange={(value) => setValue('availableDays', value)}
                        searchable
                        error={errors.availableDays?.message}
                      />
                    </Card>
                  </div>
                </>
              ) : (
                <>
                  <Card variant="elevated" padding="lg" className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                      <img
                        src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                        alt={doctor.name}
                        className="w-28 h-28 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{doctor.name}</h2>
                          <p className="text-blue-600 dark:text-blue-400 font-semibold">
                            {formatSpecialty(doctor.specialty)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <IconStar size={16} className="text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {doctor.rating.toFixed(1)}
                            </span>
                            <span>({doctor.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IconClock size={16} />
                            <span>{doctor.experience} years experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IconMapPin size={16} />
                            <span>{doctor.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto">
                        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Consultation Fee</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {doctor.currency} {doctor.fee}
                          </p>
                          <p className="text-xs text-gray-400">per session</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid lg:grid-cols-3 gap-6">
                    <Card variant="elevated" padding="lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {doctor.bio}
                      </p>
                    </Card>

                    <Card variant="elevated" padding="lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Practice Details</h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-3">
                          <IconBuildingHospital size={18} className="text-blue-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Hospital</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{doctor.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <IconMapPin size={18} className="text-emerald-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Location</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{doctor.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <IconPhone size={18} className="text-purple-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatValue(doctor.phone, 'Not listed')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <IconCurrencyDollar size={18} className="text-amber-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Service Fee</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {doctor.currency} {doctor.fee}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card variant="elevated" padding="lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Availability</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <IconCalendar size={16} />
                          <span>{doctor.availableDays.length} days per week</span>
                        </div>
                        {doctor.availableDays.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No availability set.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {doctor.availableDays.map((day) => (
                              <span
                                key={day}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 mt-6">
                <Button type="submit" variant="primary" loading={updateMutation.isPending}>
                  <IconCheck size={18} className="mr-2" />
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
