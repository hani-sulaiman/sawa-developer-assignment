<div align="center">

# MedBook

### Developer Technical Assignment

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**Build an Appointment Booking platform for a medical clinic**

[Getting Started](#getting-started) | [Requirements](#requirements) | [Submission](#submission)

</div>

---

<div align="center">

## You Have Full Creative Freedom

</div>

<table>
<tr>
<td>

| Area | Your Choice |
|:-----|:------------|
| **Design & UI** | Create your own design or use any UI library/framework |
| **Database** | SQLite, PostgreSQL, MongoDB, Firebase, or even in-memory |
| **Utilities** | Add any libraries or tools you find useful |
| **Project Structure** | Organize the code in a way that makes sense to you |

</td>
</tr>
</table>

> **We want to see how YOU make technical decisions and solve problems.**

---

## How to Start

```
1. Click "Use this template" button (top right) to create your own repository
2. Clone your new repository to your local machine
3. Complete the assignment
4. Push your changes to your repository
5. Share your repository link with us
```

---

## Overview

> **MedBook** connects **Patients** who want to book appointments with **Doctors** who manage their schedules.

<table>
<tr>
<td width="50%">

### Patient Flow

```
1. Register/Login to the platform
2. Browse available doctors
3. Filter by specialty
4. View doctor details
5. Book an appointment
6. See appointment status
```

</td>
<td width="50%">

### Doctor Flow

```
1. Login to the platform
2. View appointment requests
3. Confirm or reject appointments
```

</td>
</tr>
</table>

---

## Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>React (TypeScript)</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Node.js with Express (TypeScript)</td>
</tr>
</table>

### Required Libraries

| Library | Purpose | Documentation |
|:--------|:--------|:--------------|
| **TanStack React Query** | Server state management & data fetching | [tanstack.com/query](https://tanstack.com/query/latest) |
| **React Hook Form** | Form state management | [react-hook-form.com](https://react-hook-form.com/) |

> [!NOTE]
> These are the same libraries used in our production codebase. We want to assess your ability to work with our tech stack.

---

## Requirements

### Part 1: Authentication

<details>
<summary><strong>1.1 User Registration</strong> <code>/register</code></summary>

- [ ] Create registration form with validation
- [ ] Fields: name, email, password, role (patient or doctor)
- [ ] Password requirements: min 8 characters, at least 1 number, 1 uppercase
- [ ] On success, redirect to login page

</details>

<details>
<summary><strong>1.2 User Login</strong> <code>/login</code></summary>

- [ ] Create login form with validation
- [ ] Fields: email, password
- [ ] On success, store token and redirect based on role:
  - Patient -> Doctor List Page (`/`)
  - Doctor -> Doctor Dashboard (`/doctor/:doctorId`)

</details>

<details>
<summary><strong>1.3 Protected Routes</strong></summary>

- [ ] Implement route protection using React Context or a custom hook
- [ ] Redirect unauthenticated users to login page
- [ ] Redirect users to appropriate pages based on their role
- [ ] Add logout functionality

</details>

<details>
<summary><strong>1.4 Auth State Management</strong></summary>

- [ ] Create an AuthContext to manage user state
- [ ] Persist auth state (localStorage or sessionStorage)
- [ ] Include user info (id, name, email, role) in context

</details>

---

### Part 2: Patient Frontend

> Protected - Patient Role Only

<details>
<summary><strong>2.1 Doctor List Page</strong> <code>/</code></summary>

- [ ] Use **React Query** to fetch and cache doctors from the backend API
- [ ] Display: name, specialty, hospital, rating, fee
- [ ] Add specialty filter (general, cardiology, dermatology, pediatrics, orthopedics)
- [ ] Handle loading and error states using React Query's built-in states

</details>

<details>
<summary><strong>2.2 Doctor Detail Page</strong> <code>/doctors/:id</code></summary>

- [ ] Use **React Query** to fetch doctor details
- [ ] Show: bio, experience, available days, location, fee
- [ ] Include appointment booking form or button

</details>

<details>
<summary><strong>2.3 Appointment Booking Form</strong></summary>

- [ ] Use **React Hook Form** for form state management
- [ ] Use validation schema (see Schema Requirements below)
- [ ] Display inline validation errors
- [ ] Use **React Query mutations** to submit the appointment

</details>

---

### Part 3: Doctor Frontend

> Protected - Doctor Role Only

<details>
<summary><strong>3.1 Doctor Dashboard</strong> <code>/doctor/:doctorId</code></summary>

- [ ] Verify the logged-in doctor can only access their own dashboard
- [ ] Use **React Query** to fetch appointments for this doctor
- [ ] Display list of appointments with: patient name, date, time, reason, status
- [ ] Use **React Query mutations** for Confirm/Reject actions
- [ ] Invalidate and refetch appointments after status changes

</details>

---

### Part 4: Backend API

#### Auth Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive token |
| `GET` | `/api/auth/me` | Get current user info (protected) |

#### Doctor Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/doctors` | List all doctors. Support `?specialty=` filter |
| `GET` | `/api/doctors/:id` | Get single doctor by ID |

#### Appointment Endpoints (Protected)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/appointments` | Create a new appointment (patient only) |
| `GET` | `/api/doctors/:doctorId/appointments` | Get appointments (doctor only, own appointments) |
| `PATCH` | `/api/appointments/:id/confirm` | Confirm appointment (doctor only) |
| `PATCH` | `/api/appointments/:id/reject` | Reject appointment (doctor only) |

<details>
<summary><strong>Backend Auth Implementation</strong></summary>

- [ ] Implement token-based authentication
- [ ] Create auth middleware to verify tokens
- [ ] Implement role-based access control (patient vs doctor)
- [ ] Hash passwords before storing

</details>

---

### Part 5: Schema Requirements

> [!IMPORTANT]
> Create **shared validation schemas** that can be used on both frontend and backend.

<details>
<summary><strong>Required Schemas</strong></summary>

```
src/schemas/ (or shared/schemas/)
├── auth.schema.ts       # Registration & Login schemas
├── user.schema.ts       # User schema
├── doctor.schema.ts     # Doctor schema
├── appointment.schema.ts # Appointment schema
└── index.ts             # Export all schemas
```

</details>

<details>
<summary><strong>Schema Definitions</strong></summary>

**1. User Schema**
```typescript
// Fields: id, name, email, password, role (patient | doctor)
// Include password validation rules
```

**2. Auth Schemas**
```typescript
// Registration schema (extends user, confirms password)
// Login schema (email + password)
```

**3. Appointment Schema**
```typescript
// Fields: patientName, patientEmail, patientPhone, date, time, reason
```

**4. API Response Schemas**
```typescript
// Define consistent API response schemas
// Success response: { success: true, data: T }
// Error response: { success: false, error: string, details?: Record<string, string[]> }
```

</details>

<details>
<summary><strong>Schema Usage</strong></summary>

- [ ] Use schemas on **frontend** for form validation
- [ ] Use schemas on **backend** for request validation
- [ ] Use schemas to **infer TypeScript types**
- [ ] Validate all incoming requests on backend before processing

</details>

---

## Getting Started

```bash
# 1. Install Dependencies
npm install

# 2. Install Required Libraries
# Install the required libraries listed in the Tech Stack section

# 3. Start Development Servers
npm run start
```

| Service | URL |
|:--------|:----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |

---

## Sample Data

<table>
<tr>
<td width="50%">

**Doctors:** 10 doctors across 5 specialties
- general
- cardiology
- dermatology
- pediatrics
- orthopedics

</td>
<td width="50%">

**Appointments:** 4 sample appointments
- 3 pending
- 1 confirmed

</td>
</tr>
</table>

**Test Users:** (add these to your implementation)

```typescript
// Patient
{ email: "patient@test.com", password: "Test1234", role: "patient" }

// Doctor (Dr. Sarah Ahmed - d1)
{ email: "doctor@test.com", password: "Test1234", role: "doctor", doctorId: "d1" }
```

> See `server/data.ts` for full data.

---

## What We Provide

| Item | Description |
|:-----|:------------|
| Frontend Setup | React + Vite + TypeScript |
| Backend Setup | Express server starter |
| Types | TypeScript types for Doctor, Appointment |
| Data | Sample data (10 doctors, 4 appointments) |

---

## What You Build

| Feature | Description |
|:--------|:------------|
| **Authentication** | Registration, Login, Protected Routes, Role-based Access |
| **Patient Frontend** | Doctor list, detail page, booking form |
| **Doctor Frontend** | Dashboard to confirm/reject appointments |
| **Backend** | Auth endpoints, protected routes, request validation |

---

## Submission

> [!CAUTION]
> Before submitting, make sure:
> 1. All your code is pushed to your repository
> 2. The application runs with `npm install` and `npm start`
> 3. Share your repository link with us

---

<div align="center">

## Questions?

If something is unclear, make a reasonable assumption and document it in `NOTES.md`

**Good luck!**

</div>
