import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Select, TextInput, Textarea } from '@mantine/core';
import {
  IconFolder,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconDownload,
  IconEye,
  IconUpload,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, GridSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
import api from '@/services/api';
import type { MedicalRecord, FileType } from '@shared/schemas';

const fileTypeIcons: Record<FileType, typeof IconFile> = {
  pdf: IconFileTypePdf,
  image: IconPhoto,
  document: IconFile,
  lab_result: IconFile,
  scan: IconPhoto,
  other: IconFile,
};

const fileTypeLabels: Record<FileType, string> = {
  pdf: 'PDF Document',
  image: 'Image',
  document: 'Document',
  lab_result: 'Lab Result',
  scan: 'Scan/X-Ray',
  other: 'Other',
};

const fileTypeOptions = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'scan', label: 'Scan/X-Ray' },
  { value: 'other', label: 'Other' },
];

export function MedicalRecordsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState<FileType>('document');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery<MedicalRecord[]>({
    queryKey: ['medical-records'],
    queryFn: async () => {
      const response = await api.get('/medical-records');
      return response.data.data.records;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      notifySuccess('File uploaded successfully');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to upload file');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/medical-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      notifySuccess('Record deleted successfully');
    },
    onError: () => {
      notifyError('Failed to delete record');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !title) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('fileType', fileType);
    if (notes) formData.append('notes', notes);

    uploadMutation.mutate(formData);
  };

  const closeModal = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setTitle('');
    setFileType('document');
    setNotes('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileUrl = (fileUrl: string) => {
    // Files are served by the backend at /uploads
    const base = 'http://localhost:3001';
    return fileUrl.startsWith('http') ? fileUrl : `${base}${fileUrl}`;
  };

  const handleView = (fileUrl: string) => {
    window.open(getFileUrl(fileUrl), '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = getFileUrl(fileUrl);
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      title="Medical Records"
      subtitle="Store and manage your medical documents"
      actions={
        <Button variant="primary" onClick={() => setUploadModalOpen(true)}>
          <IconPlus size={18} className="mr-2" />
          Upload Record
        </Button>
      }
    >
      <PageLoader isLoading={isLoading} loadingText="Loading records...">
        {!records || records.length === 0 ? (
          <EmptyState
            icon={<IconFolder size={48} className="text-gray-300" />}
            title="No medical records"
            description="Upload your medical documents, lab results, and scans for easy access"
            action={
              <Button variant="primary" onClick={() => setUploadModalOpen(true)}>
                <IconUpload size={18} className="mr-2" />
                Upload First Record
              </Button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => {
              const FileIcon = fileTypeIcons[record.fileType] || IconFile;
              
              return (
                <Card
                  key={record.id}
                  variant="elevated"
                  padding="lg"
                  className="animate-fade-in-up"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileIcon size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{record.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fileTypeLabels[record.fileType]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(record.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Size</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatFileSize(record.fileSize)}</span>
                    </div>
                  </div>

                  {record.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
                      {record.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(record.fileUrl)}
                    >
                      <IconEye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(record.fileUrl, record.fileName)}
                    >
                      <IconDownload size={16} className="mr-1" />
                      Download
                    </Button>
                    <button
                      onClick={() => deleteMutation.mutate(record.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageLoader>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpen}
        onClose={closeModal}
        title="Upload Medical Record"
        size="md"
        centered
      >
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-center"
            >
              {selectedFile ? (
                <div>
                  <IconFile size={32} className="mx-auto mb-2 text-blue-500" />
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <IconUpload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">Click to select a file</p>
                  <p className="text-sm text-gray-500">PDF, Images, Documents (max 10MB)</p>
                </div>
              )}
            </button>
          </div>

          <TextInput
            label="Title"
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
          />

          <Select
            label="File Type"
            data={fileTypeOptions}
            value={fileType}
            onChange={(value) => setFileType(value as FileType)}
          />

          <Textarea
            label="Notes (optional)"
            placeholder="Add any notes about this document"
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            minRows={2}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || !title}
              loading={uploadMutation.isPending}
              fullWidth
            >
              Upload Record
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
