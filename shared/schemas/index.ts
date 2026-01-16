// User schemas
export {
  UserSchema,
  UserRoleSchema,
  UserResponseSchema,
  type User,
  type UserRole,
  type UserResponse,
} from './user.schema';

// Auth schemas
export {
  RegisterSchema,
  registerSchema,
  LoginSchema,
  loginSchema,
  AuthResponseSchema,
  type RegisterInput,
  type LoginInput,
  type AuthResponse,
} from './auth.schema';

// Doctor schemas
export {
  DoctorSchema,
  SpecialtySchema,
  DoctorFilterSchema,
  SpecialtyOptionSchema,
  specialties,
  UpdateDoctorProfileSchema,
  type Doctor,
  type Specialty,
  type DoctorFilter,
  type SpecialtyOption,
  type UpdateDoctorProfileInput,
} from './doctor.schema';

// Appointment schemas
export {
  AppointmentSchema,
  AppointmentStatusSchema,
  CreateAppointmentSchema,
  UpdateAppointmentStatusSchema,
  type Appointment,
  type AppointmentStatus,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
} from './appointment.schema';

// Review schemas
export {
  ReviewSchema,
  CreateReviewSchema,
  type Review,
  type CreateReviewInput,
} from './review.schema';

// Favorite schemas
export {
  FavoriteSchema,
  FavoriteWithDoctorSchema,
  ToggleFavoriteSchema,
  type Favorite,
  type FavoriteWithDoctor,
  type ToggleFavoriteInput,
} from './favorite.schema';

// Patient Profile schemas
export {
  PatientProfileSchema,
  UpdatePatientProfileSchema,
  BloodTypeSchema,
  GenderSchema,
  type PatientProfile,
  type UpdatePatientProfileInput,
  type BloodType,
  type Gender,
} from './patient-profile.schema';

// Prescription schemas
export {
  PrescriptionSchema,
  CreatePrescriptionSchema,
  MedicationSchema,
  type Prescription,
  type CreatePrescriptionInput,
  type Medication,
} from './prescription.schema';

// Schedule schemas
export {
  ScheduleSlotSchema,
  CreateScheduleSlotSchema,
  BlockedSlotSchema,
  CreateBlockedSlotSchema,
  DayOfWeekSchema,
  dayNames,
  type ScheduleSlot,
  type CreateScheduleSlotInput,
  type BlockedSlot,
  type CreateBlockedSlotInput,
  type DayOfWeek,
} from './schedule.schema';

// Patient Note schemas
export {
  PatientNoteSchema,
  CreatePatientNoteSchema,
  UpdatePatientNoteSchema,
  type PatientNote,
  type CreatePatientNoteInput,
  type UpdatePatientNoteInput,
} from './patient-note.schema';

// Notification schemas
export {
  NotificationSchema,
  CreateNotificationSchema,
  NotificationTypeSchema,
  type Notification,
  type CreateNotificationInput,
  type NotificationType,
} from './notification.schema';

// Chat schemas
export {
  ConversationSchema,
  ChatMessageSchema,
  SendMessageSchema,
  StartConversationSchema,
  type Conversation,
  type ChatMessage,
  type SendMessageInput,
  type StartConversationInput,
} from './chat.schema';

// Medical Record schemas
export {
  MedicalRecordSchema,
  CreateMedicalRecordSchema,
  FileTypeSchema,
  type MedicalRecord,
  type CreateMedicalRecordInput,
  type FileType,
} from './medical-record.schema';

// API schemas
export {
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
  PaginationSchema,
  createSuccessResponse,
  createErrorResponse,
  type ApiErrorResponse,
  type Pagination,
} from './api.schema';
