import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  IconStar, 
  IconMapPin, 
  IconClock, 
  IconCertificate, 
  IconArrowLeft,
  IconPhone,
  IconMessage,
  IconCheck,
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { AppointmentBookingForm } from '@/components/forms/AppointmentBookingForm';
import api from '@/services/api';
import type { Doctor, FavoriteWithDoctor } from '@shared/schemas';

const highlights = [
  'Video consultations available',
  'Same-day appointments',
  'Digital prescriptions',
  'Follow-up included',
];

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: doctor, isLoading, error } = useQuery<Doctor>({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data.data.doctor;
    },
    enabled: !!id,
  });

  const { data: favorites = [] } = useQuery<FavoriteWithDoctor[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/favorites');
      const payload = response.data?.data?.favorites;
      return Array.isArray(payload) ? payload : [];
    },
  });

  const isFavorite = favorites.some((f) => f.doctorId === id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleStartChat = () => {
    // Navigate to chat page with doctorId - the ChatPage will handle opening the conversation
    navigate(`/chat?doctorId=${id}`);
  };

  if (error || (!isLoading && !doctor)) {
    return (
      <DashboardLayout title="Doctor not found">
        <Card variant="bordered" className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load doctor profile</p>
          <Link to="/doctors">
            <Button variant="secondary">Back to Doctors</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showBreadcrumb={false}>
      <PageLoader isLoading={isLoading} loadingText="Loading doctor profile...">
        {doctor && (
          <>
            {/* Back Button */}
            <Link 
              to="/doctors" 
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-8 transition-colors"
            >
              <IconArrowLeft size={18} />
              <span className="font-medium">Back to doctors</span>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Doctor Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Card */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                      alt={doctor.name}
                      className="w-32 h-32 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 mx-auto md:mx-0"
                    />
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{doctor.name}</h1>
                          <p className="text-blue-600 dark:text-blue-400 font-semibold capitalize">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavoriteMutation.mutate()}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                          >
                            {isFavorite ? (
                              <IconHeartFilled size={24} className="text-red-500" />
                            ) : (
                              <IconHeart size={24} className="text-gray-400" />
                            )}
                          </button>
                          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">Accepting</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <IconStar size={16} className="text-amber-400 fill-amber-400" />
                            <span className="font-bold text-gray-900 dark:text-white">{doctor.rating}</span>
                          </div>
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
                  </div>
                </Card>

                {/* About Card */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{doctor.bio}</p>
                </Card>

                {/* Qualifications Card */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Qualifications</h2>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <IconCertificate size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Board-certified specialist</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verified credentials</p>
                    </div>
                  </div>
                </Card>

                {/* Highlights Card */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Service Highlights</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <IconCheck size={14} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Booking */}
              <div className="space-y-6">
                {/* Pricing Card */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Consultation Fee</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">${doctor.fee}</p>
                    <p className="text-gray-400 text-sm mt-1">per session</p>
                  </div>

                  {/* Quick Contact */}
                  <div className="space-y-3 mb-6">
                    {doctor.phone ? (
                      <a
                        href={`tel:${doctor.phone}`}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <IconPhone size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">Call Doctor</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.phone}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="w-full flex items-center gap-3 p-3 bg-gray-50/60 dark:bg-gray-800/60 rounded-xl text-gray-400 dark:text-gray-500">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                          <IconPhone size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm">Call Doctor</p>
                          <p className="text-xs">Phone number unavailable</p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleStartChat}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <IconMessage size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">Send Message</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Usually responds within 1 hour</p>
                      </div>
                    </button>
                  </div>
                </Card>

                {/* Booking Form */}
                <Card variant="elevated" padding="lg" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Book Appointment</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select a date and time that works for you</p>
                  <AppointmentBookingForm doctorId={doctor.id} />
                </Card>
              </div>
            </div>
          </>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
