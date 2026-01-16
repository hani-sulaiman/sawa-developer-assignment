import type { ReactNode } from 'react';
import { IconPill, IconCalendar, IconUser, IconFileText } from '@tabler/icons-react';
import { Card } from '@/components/ui';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string | null;
  notes?: string | null;
}

interface PrescriptionCardProps {
  id: string;
  patientName: string;
  diagnosis?: string | null;
  medications: Medication[];
  instructions?: string | null;
  validUntil?: string | null;
  createdAt: string;
  actions?: ReactNode;
}

export function PrescriptionCard({
  patientName,
  diagnosis,
  medications,
  instructions,
  validUntil,
  createdAt,
  actions,
}: PrescriptionCardProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden animate-fade-in-up">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <IconPill size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                {patientName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                {diagnosis || 'No diagnosis specified'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <IconCalendar size={16} />
              <span>{formatDate(createdAt)}</span>
            </div>
            {validUntil && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-xs">Valid until: {formatDate(validUntil)}</span>
              </div>
            )}
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Medications</h4>
          <div className="space-y-2">
            {medications && medications.length > 0 ? (
              medications.map((med, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">{med.name}</span>
                    <span className="text-gray-500 dark:text-gray-400"> - {med.dosage}, {med.frequency}</span>
                    {med.duration && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">({med.duration})</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No medications listed</p>
            )}
          </div>
        </div>

        {instructions && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-2">
              <IconFileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Instructions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{instructions}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
