import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Select, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPill, IconSearch, IconPlus, IconTrash, IconUser, IconCalendar, IconEdit, IconDownload } from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { Button, EmptyState, ConfirmDialog } from '@/components/ui';
import { PrescriptionCard } from '@/components/prescriptions';
import { notifySuccess, notifyError } from '@/services/notify';
import api from '@/services/api';
import { openPrescriptionPdf } from '@/services/prescriptionPdf';
import type { Prescription, CreatePrescriptionInput, Medication } from '@shared/schemas';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export function DoctorPrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePrescriptionInput>({
    patientId: '',
    appointmentId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    diagnosis: '',
    instructions: '',
    validUntil: '',
  });
  const queryClient = useQueryClient();

  const { data: prescriptions, isLoading } = useQuery<Prescription[]>({
    queryKey: ['doctor-prescriptions'],
    queryFn: async () => {
      const response = await api.get('/prescriptions/doctor');
      return response.data.data.prescriptions;
    },
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['doctor-patients'],
    queryFn: async () => {
      const response = await api.get('/doctors/patients');
      return response.data.data.patients;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePrescriptionInput) => {
      return api.post('/prescriptions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      notifySuccess('Prescription created');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to create prescription');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreatePrescriptionInput }) => {
      return api.put(`/prescriptions/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      notifySuccess('Prescription updated');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to update prescription');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/prescriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      notifySuccess('Prescription deleted');
    },
    onError: () => {
      notifyError('Failed to delete prescription');
    },
  });

  const filteredPrescriptions = prescriptions?.filter((prescription) => {
    const query = searchQuery.toLowerCase();
    return (
      prescription.patientName.toLowerCase().includes(query) ||
      (prescription.diagnosis ?? '').toLowerCase().includes(query)
    );
  }) || [];

  const openCreateModal = () => {
    setEditingPrescription(null);
    setFormData({
      patientId: '',
      appointmentId: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
      diagnosis: '',
      instructions: '',
      validUntil: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patientId: prescription.patientId,
      appointmentId: prescription.appointmentId || '',
      medications: prescription.medications.map((medication) => ({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        duration: medication.duration || '',
        notes: medication.notes || '',
      })),
      diagnosis: prescription.diagnosis || '',
      instructions: prescription.instructions || '',
      validUntil: prescription.validUntil || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPrescription(null);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setFormData((prev) => {
      const medications = prev.medications.map((medication, medIndex) =>
        medIndex === index ? { ...medication, [field]: value } : medication
      );
      return { ...prev, medications };
    });
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, medIndex) => medIndex !== index),
    }));
  };

  const isFormValid =
    formData.patientId &&
    formData.medications.length > 0 &&
    formData.medications.every((med) => med.name.trim() && med.dosage.trim() && med.frequency.trim());

  const handleSubmit = () => {
    if (!isFormValid) return;

    const payload: CreatePrescriptionInput = {
      ...formData,
      appointmentId: formData.appointmentId?.trim() || undefined,
      diagnosis: formData.diagnosis?.trim() || undefined,
      instructions: formData.instructions?.trim() || undefined,
      validUntil: formData.validUntil || undefined,
      medications: formData.medications.map((medication) => ({
        ...medication,
        duration: medication.duration?.trim() || undefined,
        notes: medication.notes?.trim() || undefined,
      })),
    };

    if (editingPrescription) {
      updateMutation.mutate({ id: editingPrescription.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSettled: () => {
        setConfirmOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  const handleCancelDelete = () => {
    if (deleteMutation.isPending) return;
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleDownload = (prescription: Prescription) => {
    const opened = openPrescriptionPdf(prescription);
    if (!opened) {
      notifyError('Please allow pop-ups to download the prescription PDF.');
    }
  };

  const patientOptions = Array.from(
    new Map((patients || []).map((patient) => [patient.id, patient])).values()
  ).map((patient) => ({
    value: patient.id,
    label: patient.name,
  }));

  return (
    <DashboardLayout
      title="Prescriptions"
      subtitle="Manage and view patient prescriptions"
      actions={
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <IconPlus size={16} className="mr-1.5" />
          New Prescription
        </Button>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <PageLoader isLoading={isLoading} loadingText="Loading prescriptions...">
        {filteredPrescriptions.length === 0 ? (
          <EmptyState
            icon={<IconPill size={48} className="text-gray-300" />}
            title={searchQuery ? "No prescriptions found" : "No prescriptions yet"}
            description={searchQuery ? "Try adjusting your search" : "Prescriptions you create will appear here"}
            action={
              !searchQuery && (
                <Button variant="primary" onClick={openCreateModal}>
                  <IconPlus size={16} className="mr-1.5" />
                  Create First Prescription
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                {...prescription}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownload(prescription)}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      aria-label="Download prescription PDF"
                    >
                      <IconDownload size={16} className="text-blue-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(prescription)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Edit prescription"
                    >
                      <IconEdit size={16} className="text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(prescription.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete prescription"
                    >
                      <IconTrash size={16} className="text-red-500" />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </PageLoader>

      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={editingPrescription ? 'Edit Prescription' : 'Create Prescription'}
        size="xl"
        centered
      >
        <div className="space-y-5">
          <Select
            label="Patient"
            placeholder="Select a patient"
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
            data={patientOptions}
            searchable
            required
            nothingFoundMessage="No patients found"
            leftSection={<IconUser size={18} className="text-gray-400" />}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <TextInput
              label="Diagnosis"
              placeholder="Optional diagnosis"
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.currentTarget.value })}
            />
            <DateInput
              label="Valid Until"
              placeholder="Optional expiration date"
              leftSection={<IconCalendar size={18} className="text-gray-400" />}
              value={formData.validUntil ? new Date(formData.validUntil) : null}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  validUntil: value ? value.toISOString().split('T')[0] : '',
                })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconPill size={18} className="text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Medications</h4>
              </div>
              <Button variant="secondary" size="sm" onClick={addMedication}>
                <IconPlus size={16} className="mr-1.5" />
                Add Medication
              </Button>
            </div>

            {formData.medications.map((medication, index) => (
              <div
                key={`${medication.name}-${index}`}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Medication {index + 1}
                  </p>
                  {formData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                    >
                      <IconTrash size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Medication Name"
                    placeholder="e.g. Amoxicillin"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Dosage"
                    placeholder="e.g. 500mg"
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Frequency"
                    placeholder="e.g. Twice daily"
                    value={medication.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Duration"
                    placeholder="Optional duration"
                    value={medication.duration || ''}
                    onChange={(e) => updateMedication(index, 'duration', e.currentTarget.value)}
                  />
                </div>

                <Textarea
                  label="Notes"
                  placeholder="Optional notes"
                  value={medication.notes || ''}
                  onChange={(e) => updateMedication(index, 'notes', e.currentTarget.value)}
                  minRows={2}
                />
              </div>
            ))}
          </div>

          <Textarea
            label="Instructions"
            placeholder="Optional instructions for the patient"
            value={formData.instructions || ''}
            onChange={(e) => setFormData({ ...formData, instructions: e.currentTarget.value })}
            minRows={3}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!isFormValid}
              fullWidth
            >
              {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
            </Button>
            <Button variant="secondary" onClick={closeModal} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        opened={confirmOpen}
        title="Delete prescription"
        description="This prescription will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </DashboardLayout>
  );
}
