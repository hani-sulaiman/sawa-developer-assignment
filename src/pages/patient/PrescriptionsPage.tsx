import { useQuery } from '@tanstack/react-query';
import {
  IconPrescription,
  IconCalendar,
  IconUser,
  IconPill,
  IconFileText,
  IconDownload,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, ListSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import api from '@/services/api';
import type { Prescription, Medication } from '@shared/schemas';

export function PrescriptionsPage() {
  const { data: prescriptions, isLoading } = useQuery<Prescription[]>({
    queryKey: ['patient-prescriptions'],
    queryFn: async () => {
      const response = await api.get('/prescriptions/my');
      return response.data.data.prescriptions;
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <DashboardLayout
      title="My Prescriptions"
      subtitle="View prescriptions from your healthcare providers"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading prescriptions...">
        {!prescriptions || prescriptions.length === 0 ? (
          <EmptyState
            icon={<IconPrescription size={48} className="text-gray-300" />}
            title="No prescriptions yet"
            description="Prescriptions from your doctors will appear here"
          />
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <Card
                key={prescription.id}
                variant="elevated"
                padding="none"
                className={`overflow-hidden animate-fade-in-up ${
                  prescription.validUntil && isExpired(prescription.validUntil)
                    ? 'opacity-60'
                    : ''
                }`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <IconPrescription size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {prescription.doctorName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <IconCalendar size={14} />
                            {formatDate(prescription.createdAt)}
                          </span>
                          {prescription.validUntil && (
                            <span className={`flex items-center gap-1 ${
                              isExpired(prescription.validUntil) 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {isExpired(prescription.validUntil) ? 'Expired' : 'Valid until'}: {formatDate(prescription.validUntil)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <IconDownload size={16} className="mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Diagnosis</p>
                    <p className="text-gray-900 dark:text-white font-medium">{prescription.diagnosis}</p>
                  </div>
                )}

                {/* Medications */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <IconPill size={18} />
                    Medications ({prescription.medications.length})
                  </h4>
                  <div className="space-y-4">
                    {prescription.medications.map((med: Medication, index: number) => (
                      <div 
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{med.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {med.dosage} • {med.frequency}
                              {med.duration && ` • ${med.duration}`}
                            </p>
                          </div>
                        </div>
                        {med.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            {med.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {prescription.instructions && (
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <IconFileText size={18} />
                        Special Instructions
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {prescription.instructions}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
