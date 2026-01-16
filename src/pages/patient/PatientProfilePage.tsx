import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Select, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconUser,
  IconCalendar,
  IconDroplet,
  IconPhone,
  IconMail,
  IconHome,
  IconAlertCircle,
  IconShield,
  IconEdit,
  IconCheck,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, CardSkeleton } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { UpdatePatientProfileSchema, type UpdatePatientProfileInput, type PatientProfile } from '@shared/schemas';

const bloodTypes = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function PatientProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<PatientProfile>({
    queryKey: ['patient-profile'],
    queryFn: async () => {
      const response = await api.get('/patient/profile');
      return response.data.data.profile;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePatientProfileInput>({
    resolver: zodResolver(UpdatePatientProfileSchema),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePatientProfileInput) => {
      return api.put('/patient/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      notifySuccess('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      notifyError('Failed to update profile');
    },
  });

  const onSubmit = (data: UpdatePatientProfileInput) => {
    updateMutation.mutate(data);
  };

  const startEditing = () => {
    if (profile) {
      reset({
        dateOfBirth: profile.dateOfBirth || undefined,
        gender: profile.gender || undefined,
        bloodType: profile.bloodType || undefined,
        allergies: profile.allergies || undefined,
        medicalHistory: profile.medicalHistory || undefined,
        emergencyContact: profile.emergencyContact || undefined,
        emergencyPhone: profile.emergencyPhone || undefined,
        insuranceProvider: profile.insuranceProvider || undefined,
        insuranceNumber: profile.insuranceNumber || undefined,
        address: profile.address || undefined,
        phone: profile.phone || undefined,
      });
    }
    setIsEditing(true);
  };

  const toneStyles = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
    },
    violet: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
    },
  };

  type ToneKey = keyof typeof toneStyles;
  type InfoItem = {
    label: string;
    value: string;
    icon: typeof IconUser;
    tone: ToneKey;
  };

  const formatValue = (value?: string | null, fallback = 'Not provided') =>
    value && value.trim() ? value : fallback;

  const formatGender = (value?: string | null) =>
    value ? value.replace('_', ' ') : 'Not provided';

  const displayProfile = {
    phone: isEditing ? watch('phone') : profile?.phone,
    gender: isEditing ? watch('gender') : profile?.gender,
    bloodType: isEditing ? watch('bloodType') : profile?.bloodType,
    dateOfBirth: isEditing ? watch('dateOfBirth') : profile?.dateOfBirth,
    address: isEditing ? watch('address') : profile?.address,
    allergies: isEditing ? watch('allergies') : profile?.allergies,
    medicalHistory: isEditing ? watch('medicalHistory') : profile?.medicalHistory,
    emergencyContact: isEditing ? watch('emergencyContact') : profile?.emergencyContact,
    emergencyPhone: isEditing ? watch('emergencyPhone') : profile?.emergencyPhone,
    insuranceProvider: isEditing ? watch('insuranceProvider') : profile?.insuranceProvider,
    insuranceNumber: isEditing ? watch('insuranceNumber') : profile?.insuranceNumber,
  };

  const summaryItems: InfoItem[] = [
    {
      label: 'Blood Type',
      value: formatValue(displayProfile.bloodType, 'Not set'),
      icon: IconDroplet,
      tone: 'red',
    },
    {
      label: 'Gender',
      value: formatGender(displayProfile.gender),
      icon: IconUser,
      tone: 'blue',
    },
    {
      label: 'Date of Birth',
      value: formatValue(displayProfile.dateOfBirth, 'Not set'),
      icon: IconCalendar,
      tone: 'violet',
    },
    {
      label: 'Last Update',
      value: profile?.updatedAt
        ? new Date(profile.updatedAt).toLocaleDateString()
        : 'Not available',
      icon: IconShield,
      tone: 'green',
    },
  ];

  const personalInfoItems: InfoItem[] = [
    { label: 'Full Name', value: formatValue(user?.name), icon: IconUser, tone: 'blue' },
    { label: 'Email', value: formatValue(user?.email), icon: IconMail, tone: 'blue' },
    { label: 'Phone', value: formatValue(displayProfile.phone), icon: IconPhone, tone: 'violet' },
    { label: 'Gender', value: formatGender(displayProfile.gender), icon: IconUser, tone: 'amber' },
    { label: 'Date of Birth', value: formatValue(displayProfile.dateOfBirth), icon: IconCalendar, tone: 'violet' },
    { label: 'Address', value: formatValue(displayProfile.address), icon: IconHome, tone: 'green' },
  ];

  const medicalInfoItems: InfoItem[] = [
    { label: 'Blood Type', value: formatValue(displayProfile.bloodType), icon: IconDroplet, tone: 'red' },
    { label: 'Allergies', value: formatValue(displayProfile.allergies, 'None reported'), icon: IconAlertCircle, tone: 'amber' },
    { label: 'Medical History', value: formatValue(displayProfile.medicalHistory), icon: IconShield, tone: 'blue' },
  ];

  const emergencyInfoItems: InfoItem[] = [
    { label: 'Contact Name', value: formatValue(displayProfile.emergencyContact), icon: IconAlertCircle, tone: 'amber' },
    { label: 'Contact Phone', value: formatValue(displayProfile.emergencyPhone), icon: IconPhone, tone: 'blue' },
  ];

  const insuranceInfoItems: InfoItem[] = [
    { label: 'Provider', value: formatValue(displayProfile.insuranceProvider), icon: IconShield, tone: 'green' },
    { label: 'Policy Number', value: formatValue(displayProfile.insuranceNumber), icon: IconCheck, tone: 'green' },
  ];

  const renderInfoItems = (items: InfoItem[]) => (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        const tone = toneStyles[item.tone];
        return (
          <div key={item.label} className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 p-3">
            <div className={`w-10 h-10 rounded-xl ${tone.bg} flex items-center justify-center`}>
              <Icon size={18} className={tone.text} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your personal and medical information"
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Card variant="elevated" padding="lg" className="overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <IconUser size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Profile Snapshot</p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{formatValue(user?.name)}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <IconMail size={16} />
                      {formatValue(user?.email)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
                    <IconShield size={16} /> Verified profile
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    <IconCheck size={16} /> Secure health vault
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryItems.map((item) => {
                  const Icon = item.icon;
                  const tone = toneStyles[item.tone];
                  return (
                    <div key={item.label} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                      <div className={`w-9 h-9 rounded-lg ${tone.bg} flex items-center justify-center`}>
                        <Icon size={16} className={tone.text} />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <IconUser size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <TextInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      leftSection={<IconPhone size={18} />}
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <Select
                      label="Gender"
                      placeholder="Select gender"
                      data={genders}
                      value={watch('gender') || ''}
                      onChange={(value) => setValue('gender', value as any)}
                    />

                    <DateInput
                      label="Date of Birth"
                      placeholder="Select date"
                      leftSection={<IconCalendar size={18} />}
                      value={watch('dateOfBirth') ? new Date(watch('dateOfBirth')!) : undefined}
                      onChange={(value) => setValue('dateOfBirth', value?.toISOString().split('T')[0])}
                    />

                    <Textarea
                      label="Address"
                      placeholder="Enter your address"
                      minRows={2}
                      {...register('address')}
                    />
                  </>
                ) : (
                  renderInfoItems(personalInfoItems)
                )}
              </div>
            </Card>

            {/* Medical Information */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <IconDroplet size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Medical Information</h2>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <Select
                      label="Blood Type"
                      placeholder="Select blood type"
                      data={bloodTypes}
                      value={watch('bloodType') || ''}
                      onChange={(value) => setValue('bloodType', value as any)}
                    />

                    <Textarea
                      label="Allergies"
                      placeholder="List any known allergies"
                      minRows={2}
                      {...register('allergies')}
                    />

                    <Textarea
                      label="Medical History"
                      placeholder="Any relevant medical history"
                      minRows={3}
                      {...register('medicalHistory')}
                    />
                  </>
                ) : (
                  renderInfoItems(medicalInfoItems)
                )}
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <IconAlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Emergency Contact</h2>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <TextInput
                      label="Contact Name"
                      placeholder="Emergency contact name"
                      {...register('emergencyContact')}
                    />

                    <TextInput
                      label="Contact Phone"
                      placeholder="Emergency contact phone"
                      leftSection={<IconPhone size={18} />}
                      {...register('emergencyPhone')}
                    />
                  </>
                ) : (
                  renderInfoItems(emergencyInfoItems)
                )}
              </div>
            </Card>

            {/* Insurance Information */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <IconShield size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Insurance Information</h2>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <TextInput
                      label="Insurance Provider"
                      placeholder="Enter insurance provider"
                      {...register('insuranceProvider')}
                    />

                    <TextInput
                      label="Policy Number"
                      placeholder="Enter policy number"
                      {...register('insuranceNumber')}
                    />
                  </>
                ) : (
                  renderInfoItems(insuranceInfoItems)
                )}
              </div>
            </Card>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-3 mt-6">
              <Button
                type="submit"
                variant="primary"
                loading={updateMutation.isPending}
              >
                <IconCheck size={18} className="mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </PageLoader>
    </DashboardLayout>
  );
}
