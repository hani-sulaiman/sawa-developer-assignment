# MedBook - Implementation Notes

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Mantine UI v7 + Tailwind CSS + Lucide React Icons
- **State Management**: TanStack React Query + React Context (AuthContext, NotificationContext, SocketContext)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Real-time Communication**: Socket.IO (WebSocket + Polling)
- **Database**: SQLite (via sql.js - pure JS implementation)
- **Authentication**: JWT (jsonwebtoken) + bcrypt password hashing
- **File Upload**: Multer (for medical records and prescriptions)
- **Date Handling**: date-fns + dayjs

### Design System

#### Premium UI Features
- **Typography**: Inter (body) + Poppins (headings) fonts
- **Color Palette**: Primary blue (#3b82f6) with accent colors (yellow, green, teal)
- **Components**: Elevated cards, glass effects, gradient backgrounds
- **Animations**: Fade-in, scale, slide animations with stagger delays
- **Responsive**: Fully responsive design for mobile, tablet, and desktop

#### Animation System
- `animate-fade-in` - Smooth fade in
- `animate-fade-in-up` - Fade in with upward motion
- `animate-fade-in-down` - Fade in with downward motion
- `animate-scale-in` - Scale in effect
- `stagger-1` through `stagger-6` - Animation delay classes

### Design Patterns

#### Backend: Service-Repository Pattern
The backend follows a clean architecture with separation of concerns:

```
server/
├── database/           # Database connection & seeding
├── repositories/       # Data access layer
│   ├── user.repository.ts
│   ├── doctor.repository.ts
│   ├── appointment.repository.ts
│   └── patient.repository.ts
├── services/           # Business logic layer
│   ├── auth.service.ts
│   ├── doctor.service.ts
│   └── appointment.service.ts
├── middleware/         # Express middleware
│   ├── auth.middleware.ts
│   └── index.ts
├── routes/            # API route handlers (organized by domain)
│   ├── auth/          # Authentication routes
│   ├── doctors/       # Doctor-related routes
│   ├── appointments/  # Appointment management
│   ├── patients/      # Patient-related routes
│   └── shared/        # Shared routes (notifications, chat)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── uploads/           # File upload storage
```

#### Frontend: Reusable Components
The frontend uses a component-based architecture with reusable UI components:

```
src/
├── components/
│   ├── ui/            # Reusable UI primitives
│   │   ├── Button.tsx       # Primary, secondary, outline, ghost, danger, yellow variants
│   │   ├── Card.tsx         # Elevated, glass, gradient variants
│   │   ├── Input.tsx        # Text, password, textarea, select inputs
│   │   ├── Badge.tsx        # Status and specialty badges
│   │   ├── Avatar.tsx       # User avatars with variants
│   │   ├── RatingStars.tsx  # Star rating display
│   │   ├── StatusBadge.tsx  # Appointment status badges
│   │   ├── StatCard.tsx     # Statistics display cards
│   │   └── EmptyState.tsx   # Empty state placeholders
│   ├── layout/        # Layout components
│   │   ├── Header.tsx       # Navigation header with notifications
│   │   ├── Layout.tsx       # Page layout wrapper
│   │   ├── ProtectedRoute.tsx # Route guards
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── DoctorSidebar.tsx # Doctor-specific sidebar
│   │   ├── PatientSidebar.tsx # Patient-specific sidebar
│   │   └── Footer.tsx       # Footer component
│   ├── landing/       # Landing page components
│   │   ├── Navbar.tsx       # Landing page navigation
│   │   ├── Hero.tsx         # Hero section with CTA
│   │   ├── ServicesGrid.tsx # Services showcase
│   │   ├── WhyChooseUs.tsx  # Features section
│   │   ├── MissionStatement.tsx # Mission & vision
│   │   └── Footer.tsx       # Landing footer
│   ├── notifications/ # Notification components
│   │   └── NotificationDropdown.tsx # Notification bell dropdown
│   ├── prescriptions/ # Prescription components
│   │   └── PrescriptionCard.tsx # Prescription display card
│   ├── appointments/  # Appointment components
│   ├── calendar/      # Calendar components
│   ├── cards/         # Specialized card components
│   └── forms/         # Form components
│       └── AppointmentBookingForm.tsx
├── contexts/          # React Context providers
│   ├── AuthContext.tsx          # Authentication state
│   ├── NotificationContext.tsx  # Notifications management
│   └── SocketContext.tsx        # Real-time WebSocket connection
├── hooks/             # Custom hooks (React Query)
│   └── useApi.ts
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── patient/       # Patient-specific pages
│   ├── doctor/        # Doctor-specific pages
│   ├── chat/          # Real-time chat
│   └── shared/        # Shared pages (notifications)
└── services/          # API service layer
```

### Shared Validation Schemas
Zod schemas are shared between frontend and backend:

```
shared/schemas/
├── user.schema.ts              # User validation
├── auth.schema.ts              # Registration & Login
├── doctor.schema.ts            # Doctor data
├── appointment.schema.ts       # Appointment data
├── patient-profile.schema.ts   # Patient profile data
├── prescription.schema.ts      # Prescription validation
├── medical-record.schema.ts    # Medical records
├── patient-note.schema.ts      # Doctor's patient notes
├── notification.schema.ts      # Notification data
├── chat.schema.ts              # Chat messages & conversations
├── review.schema.ts            # Doctor reviews & ratings
├── favorite.schema.ts          # Favorite doctors
├── schedule.schema.ts          # Doctor schedule management
└── api.schema.ts               # API response formats
```

## UI/UX Features

### Pages

#### Authentication Pages
1. **Landing Page** (`/`)
   - Modern hero section with call-to-action
   - Services grid showcasing platform features
   - "Why Choose Us" section with key benefits
   - Mission statement and vision
   - Responsive navigation with smooth scrolling
   - Professional footer with links

2. **Login Page** (`/login`)
   - Split-screen layout with feature showcase
   - Premium form design with proper icon positioning
   - Demo credentials card
   - Smooth animations

3. **Register Page** (`/register`)
   - Statistics showcase with testimonial
   - Role selection (Patient/Doctor)
   - Password validation feedback
   - Grid pattern background

#### Patient Pages
4. **Doctor List Page** (`/doctors`)
   - Hero section with search bar
   - Category filter tabs by specialty
   - Doctor cards with ratings, stats, and "Book Now" button
   - Responsive grid layout
   - Favorite doctors toggle

5. **Doctor Detail Page** (`/doctors/:id`)
   - Large profile card with stats grid
   - Weekly schedule display
   - Sticky booking sidebar
   - Contact information card
   - Reviews and ratings section
   - Favorite button

6. **My Appointments** (`/patient/appointments`)
   - Upcoming and past appointments
   - Appointment status tracking
   - Quick actions (reschedule, cancel)
   - Doctor contact information

7. **Appointment History** (`/patient/appointments/history`)
   - Complete appointment history
   - Filter by status and date
   - Detailed appointment information
   - Download appointment summary

8. **Favorite Doctors** (`/patient/favorites`)
   - List of favorited doctors
   - Quick booking from favorites
   - Remove from favorites option
   - Doctor availability status

9. **Prescriptions** (`/patient/prescriptions`)
   - Active and past prescriptions
   - Prescription details (medications, dosage, instructions)
   - Download prescription PDF
   - Filter by date and doctor

10. **Medical Records** (`/patient/medical-records`)
    - Upload and manage medical documents
    - File categorization (lab results, imaging, reports)
    - Preview and download files
    - Secure file storage
    - Share records with doctors

11. **Patient Profile** (`/patient/profile`)
    - Personal information management
    - Medical history (allergies, chronic conditions, medications)
    - Emergency contact information
    - Insurance details
    - Profile photo upload
    - Account settings

#### Doctor Pages
12. **Doctor Dashboard** (`/doctor/dashboard`)
    - Welcome message with stats overview
    - Today's appointments summary
    - Quick statistics (total patients, appointments, revenue)
    - Recent activity feed
    - Upcoming appointments list

13. **Appointments Management** (`/doctor/appointments`)
    - Categorized appointment lists (Pending, Confirmed, Completed, Rejected)
    - Appointment action buttons (Confirm/Reject/Complete)
    - Real-time status updates
    - Patient information quick view
    - Filter and search functionality

14. **Calendar View** (`/doctor/calendar`)
    - Monthly calendar with appointments
    - Day/Week/Month view options
    - Appointment details on click
    - Color-coded by status
    - Drag-and-drop rescheduling

15. **Schedule Management** (`/doctor/schedule`)
    - Set weekly availability
    - Define working hours per day
    - Block time slots
    - Set appointment duration
    - Manage holidays and breaks

16. **Patient Notes** (`/doctor/patient-notes`)
    - Create and manage patient notes
    - Search patients by name
    - Note history per patient
    - Private notes (not visible to patients)
    - Rich text editor

17. **Prescriptions Management** (`/doctor/prescriptions`)
    - Create new prescriptions
    - Prescription templates
    - Medication database
    - Patient prescription history
    - Digital signature
    - PDF generation

18. **Analytics** (`/doctor/analytics`)
    - Appointment statistics (daily, weekly, monthly)
    - Revenue tracking
    - Patient demographics
    - Popular appointment times
    - Performance metrics
    - Visual charts and graphs

19. **Doctor Profile** (`/doctor/profile`)
    - Professional information
    - Specialties and qualifications
    - Education and experience
    - Consultation fees
    - Profile photo and bio
    - Schedule settings
    - Bank account details

#### Shared Pages
20. **Chat Page** (`/chat`)
    - Real-time messaging with Socket.IO
    - Conversation list with unread indicators
    - Message history
    - Typing indicators
    - Online/offline status
    - File sharing support
    - Message timestamps
    - Auto-scroll to latest message

21. **Notifications Page** (`/notifications`)
    - All notifications list
    - Unread count badge
    - Mark as read/unread
    - Delete notifications
    - Filter by type
    - Real-time updates
    - Notification categories (appointments, messages, system)

## Test Credentials

```
Patient Account:
Email: patient@test.com
Password: Test1234

Doctor Account (linked to Dr. Sarah Ahmed):
Email: doctor@test.com
Password: Test1234
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)

### Doctors
- `GET /api/doctors` - List all doctors (supports `?specialty=` filter)
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:doctorId/appointments` - Get doctor's appointments (doctor only)
- `GET /api/doctors/:doctorId/stats` - Get doctor statistics (doctor only)
- `GET /api/doctors/:doctorId/reviews` - Get doctor reviews
- `POST /api/doctors/:doctorId/reviews` - Add review (patient only)
- `PATCH /api/doctors/:doctorId/profile` - Update doctor profile (doctor only)
- `GET /api/doctors/:doctorId/schedule` - Get doctor schedule
- `PUT /api/doctors/:doctorId/schedule` - Update doctor schedule (doctor only)

### Appointments
- `POST /api/appointments` - Create appointment (patient only)
- `GET /api/appointments` - Get user's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id/confirm` - Confirm appointment (doctor only)
- `PATCH /api/appointments/:id/reject` - Reject appointment (doctor only)
- `PATCH /api/appointments/:id/complete` - Complete appointment (doctor only)
- `PATCH /api/appointments/:id/cancel` - Cancel appointment (patient only)
- `PATCH /api/appointments/:id/reschedule` - Reschedule appointment

### Patients
- `GET /api/patients/profile` - Get patient profile (patient only)
- `PATCH /api/patients/profile` - Update patient profile (patient only)
- `GET /api/patients/favorites` - Get favorite doctors (patient only)
- `POST /api/patients/favorites/:doctorId` - Add doctor to favorites (patient only)
- `DELETE /api/patients/favorites/:doctorId` - Remove from favorites (patient only)
- `GET /api/patients/medical-records` - Get medical records (patient only)
- `POST /api/patients/medical-records` - Upload medical record (patient only)
- `DELETE /api/patients/medical-records/:id` - Delete medical record (patient only)

### Prescriptions
- `GET /api/prescriptions` - Get user's prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription (doctor only)
- `PATCH /api/prescriptions/:id` - Update prescription (doctor only)
- `DELETE /api/prescriptions/:id` - Delete prescription (doctor only)

### Patient Notes (Doctor Only)
- `GET /api/patient-notes` - Get all patient notes (doctor only)
- `GET /api/patient-notes/patient/:patientId` - Get notes for specific patient (doctor only)
- `POST /api/patient-notes` - Create patient note (doctor only)
- `PATCH /api/patient-notes/:id` - Update patient note (doctor only)
- `DELETE /api/patient-notes/:id` - Delete patient note (doctor only)

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Chat (Real-time with Socket.IO)
- `GET /api/chat/conversations` - Get user's conversations
- `GET /api/chat/conversations/:id` - Get conversation by ID
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/chat/conversations` - Create new conversation
- `POST /api/chat/messages` - Send message (also via Socket.IO)
- `PATCH /api/chat/messages/:id/read` - Mark message as read

#### Socket.IO Events
- `join-conversation` - Join a conversation room
- `leave-conversation` - Leave a conversation room
- `send-message` - Send a message
- `new-message` - Receive new message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `user-typing` - Receive typing indicator
- `user-stop-typing` - Receive stop typing indicator
- `conversation-updated` - Conversation metadata updated

## Running the Application

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
npm start

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## Project Structure

```
medbook/
├── src/                    # Frontend source
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── server/                 # Backend source
│   ├── database/           # SQLite setup
│   ├── repositories/       # Data access
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── index.ts            # Server entry
├── shared/                 # Shared schemas
│   └── schemas/            # Zod validation
├── tailwind.config.js      # Tailwind config
├── vite.config.ts          # Vite config
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Design Decisions

### Database Choice
- Used **sql.js** for cross-platform compatibility (no native builds required)
- Database persisted to `medbook.db` file
- Supports file uploads via Multer (stored in `server/uploads/`)

### Authentication
- JWT tokens expire after 7 days
- Tokens stored in localStorage
- Password: min 8 chars, 1 number, 1 uppercase
- Protected routes with authentication middleware
- Role-based access control (RBAC)

### Real-time Features
- **Socket.IO** for WebSocket communication
- Real-time chat with typing indicators
- Live notification updates
- Automatic reconnection handling
- Room-based messaging for conversations

### Role-Based Access
- **Patients**: 
  - Browse and search doctors
  - Book, reschedule, and cancel appointments
  - Manage medical records
  - View prescriptions
  - Chat with doctors
  - Add doctors to favorites
  - Leave reviews and ratings
  - Manage profile and medical history
  
- **Doctors**: 
  - View and manage appointments
  - Confirm/reject/complete appointments
  - Create and manage prescriptions
  - Write patient notes (private)
  - Manage schedule and availability
  - View analytics and statistics
  - Chat with patients
  - Update professional profile

### State Management
- **React Query** for server state caching and synchronization
- **React Context** for global state (auth, notifications, socket)
- Automatic background refetching for real-time data
- Optimistic updates for better UX

### File Management
- Medical records stored securely with unique IDs
- File type validation (PDF, images, documents)
- File size limits enforced
- Organized folder structure by user and type

## Key Features Implemented

### Real-time Communication
- **Socket.IO Integration**: WebSocket-based real-time messaging
- **Live Chat**: Doctor-patient communication with typing indicators
- **Notifications System**: Real-time notification delivery and updates
- **Online Status**: User presence tracking

### Advanced Patient Features
- **Medical Records Management**: Upload, organize, and share medical documents
- **Prescription Tracking**: View and download prescriptions
- **Favorite Doctors**: Save and quick-access favorite healthcare providers
- **Appointment History**: Complete history with filtering and search
- **Reviews & Ratings**: Rate doctors and leave feedback
- **Comprehensive Profile**: Medical history, allergies, emergency contacts, insurance

### Advanced Doctor Features
- **Schedule Management**: Set availability, working hours, and time blocks
- **Patient Notes**: Private notes for each patient with search
- **Prescription Management**: Create, edit, and manage prescriptions
- **Analytics Dashboard**: Statistics, revenue tracking, and performance metrics
- **Calendar View**: Visual appointment management with multiple views
- **Professional Profile**: Qualifications, experience, fees, and bio

### UI/UX Enhancements
- **Landing Page**: Professional marketing page with services showcase
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Framer Motion Animations**: Smooth transitions and micro-interactions
- **Notification Dropdown**: Bell icon with unread count and quick actions
- **Role-based Sidebars**: Customized navigation for patients and doctors
- **Empty States**: Helpful placeholders when no data exists
- **Loading States**: Skeleton loaders for better perceived performance

### Security & Performance
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions by user role
- **File Upload Security**: Type and size validation
- **Protected Routes**: Frontend and backend route protection
- **Query Caching**: React Query for optimized data fetching
- **Optimistic Updates**: Instant UI feedback before server confirmation

## Future Improvements
- **Email Notifications**: Send email alerts for appointments and messages
- **SMS Notifications**: Text message reminders for appointments
- **Video Consultations**: Integrate video calling for telemedicine
- **Payment Integration**: Online payment for consultations
- **Multi-language Support**: Arabic and English language options
- **Dark Mode**: Theme toggle for better accessibility
- **Mobile Apps**: Native iOS and Android applications
- **Advanced Search**: Filter doctors by location, price, availability
- **Appointment Reminders**: Automated reminders 24h before appointments
- **Doctor Verification**: Badge system for verified healthcare providers
- **Insurance Integration**: Check coverage and submit claims
- **Lab Results Integration**: Direct lab result uploads from laboratories
- **Prescription Auto-refill**: Automatic prescription renewal requests
- **Health Tracking**: Patient health metrics and vitals tracking
- **Telemedicine Rooms**: Dedicated virtual consultation rooms
