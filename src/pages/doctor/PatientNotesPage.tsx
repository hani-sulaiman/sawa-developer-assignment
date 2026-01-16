import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Select, Textarea } from '@mantine/core';
import {
  IconNotes,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUser,
  IconCalendar,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, ListSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { PatientNote, CreatePatientNoteInput } from '@shared/schemas';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export function PatientNotesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [formData, setFormData] = useState<CreatePatientNoteInput>({
    patientId: '',
    note: '',
  });
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery<PatientNote[]>({
    queryKey: ['doctor-patient-notes', user?.doctorId],
    queryFn: async () => {
      const response = await api.get('/patient-notes');
      return response.data.data.notes;
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
    mutationFn: async (data: CreatePatientNoteInput) => {
      return api.post('/patient-notes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patient-notes'] });
      notifySuccess('Note created');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to create note');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      return api.put(`/patient-notes/${id}`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patient-notes'] });
      notifySuccess('Note updated');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to update note');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/patient-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patient-notes'] });
      notifySuccess('Note deleted');
    },
    onError: () => {
      notifyError('Failed to delete note');
    },
  });

  const openCreateModal = () => {
    setEditingNote(null);
    setFormData({ patientId: '', note: '' });
    setModalOpen(true);
  };

  const openEditModal = (note: PatientNote) => {
    setEditingNote(note);
    setFormData({ patientId: note.patientId, note: note.note });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  const handleSubmit = () => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, note: formData.note });
    } else {
      createMutation.mutate(formData);
    }
  };

  const patientNameMap = new Map((patients || []).map((patient) => [patient.id, patient.name]));

  const resolvePatientName = (note: PatientNote) => {
    if (note.patientName && note.patientName !== 'Unknown') {
      return note.patientName;
    }

    return patientNameMap.get(note.patientId) || note.patientName || 'Unknown';
  };

  const normalizedNotes = notes?.map((note) => ({
    ...note,
    patientName: resolvePatientName(note),
  }));

  const filteredNotes = normalizedNotes?.filter((note) =>
    note.patientName.toLowerCase().includes(search.toLowerCase()) ||
    note.note.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group notes by patient
  const notesByPatient = filteredNotes?.reduce((acc, note) => {
    if (!acc[note.patientId]) {
      acc[note.patientId] = {
        patientName: note.patientName,
        notes: [],
      };
    }
    acc[note.patientId].notes.push(note);
    return acc;
  }, {} as Record<string, { patientName: string; notes: PatientNote[] }>);

  const patientOptions = Array.from(
    new Map((patients || []).map((patient) => [patient.id, patient])).values()
  ).map((patient) => ({
    value: patient.id,
    label: patient.name,
  }));

  return (
    <DashboardLayout
      title="Patient Notes"
      subtitle="Private clinical notes for your patients"
      actions={
        <Button variant="primary" onClick={openCreateModal}>
          <IconPlus size={18} className="mr-2" />
          Add Note
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Search by patient name or note content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <PageLoader isLoading={isLoading} loadingText="Loading notes...">
        {!filteredNotes || filteredNotes.length === 0 ? (
          <EmptyState
            icon={<IconNotes size={48} className="text-gray-300" />}
            title="No patient notes"
            description="Add notes about your patients to keep track of important information"
            action={
              <Button variant="primary" onClick={openCreateModal}>
                <IconPlus size={18} className="mr-2" />
                Add First Note
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(notesByPatient || {}).map(([patientId, { patientName, notes: patientNotes }]) => (
              <Card key={patientId} variant="elevated" padding="none" className="animate-fade-in-up overflow-hidden">
                {/* Patient Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold">{patientName.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{patientName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {patientNotes.length} note{patientNotes.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {patientNotes.map((note) => (
                    <div key={note.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.note}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
                            <IconCalendar size={14} />
                            {formatDate(note.updatedAt)}
                            {note.updatedAt !== note.createdAt && ' (edited)'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(note)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <IconEdit size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(note.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <IconTrash size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageLoader>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={editingNote ? 'Edit Note' : 'Add Patient Note'}
        size="lg"
        centered
      >
        <div className="space-y-4">
          {!editingNote && (
            <Select
              label="Patient"
              placeholder="Select a patient"
              value={formData.patientId}
              onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
              data={patientOptions}
              searchable
              required
              nothingFoundMessage="No patients found"
            />
          )}

          <Textarea
            label="Note"
            placeholder="Enter your clinical notes..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.currentTarget.value })}
            minRows={6}
            required
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!formData.note || (!editingNote && !formData.patientId)}
              fullWidth
            >
              {editingNote ? 'Update' : 'Create'} Note
            </Button>
            <Button variant="secondary" onClick={closeModal} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
