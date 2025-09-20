# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENDOFLOW is an AI-powered SaaS application for dental clinics that automates clinical workflows. Built on a Next.js 14+ (App Router) foundation with three distinct role-based dashboards.

### 🔥 CRITICAL AUTHENTICATION ISSUE IDENTIFIED
**Problem**: The middleware is looking for a `profiles` table with role/status columns, but the database schema uses separate role-specific tables (`api.assistants`, `api.dentists`, `api.patients`). This causes authenticated users to bypass the login page and go directly to role dashboards without proper role verification.

**Root Cause**: Schema mismatch between middleware expectations and actual database structure.

### Role-Based Dashboard Architecture

#### 1. **Patient Dashboard** (Mobile-First Design)
- **Navigation**: Bottom tab bar with 4 main sections (Home, Appointments, Messages, Library)
- **Key Features**:
  - Home tab with upcoming appointments and quick actions
  - Appointment booking with time selection and pain level assessment
  - Messages tab with AI chatbot and urgent assistance feature
  - My Files tab with intake forms and document management
  - Library tab with educational content and resources
- **UI Design**: Clean mobile interface with teal accent color (#009688)
- **Special Features**: Emergency urgent assistance, appointment rescheduling, notification center

#### 2. **Assistant Dashboard** (Task-Oriented Workflow)
- **Navigation**: Top horizontal navigation with key workflow sections
- **Core Sections**:
  - **Daily Task Hub**: Patient check-ins, task board with priorities, new self-registrations queue
  - **Register Patient**: Patient registration and verification workflow
  - **File Uploader**: Document management and file processing
  - **New Appointment**: Appointment scheduling interface
  - **Treatments**: Treatment management and tracking
- **Key Features**:
  - Real-time task management with priority levels (High/Medium/Low)
  - Patient verification system for new registrations (Review/Verify buttons)
  - Appointment confirmation workflow
  - Treatment specialties management

#### 3. **Dentist Dashboard** (Command Center)
- **Navigation**: Top tab bar with comprehensive clinical tools
- **Core Features**:
  - **Patient Queue**: Real-time patient management with status tracking
  - **Clinical Cockpit**: Comprehensive patient overview with medical history, dental charts
  - **Interactive FDI Dental Chart**: 3D dental visualization with tooth-specific diagnosis
  - **History Taking**: Full-screen patient history forms
  - **AI Co-pilot (EndoAI)**: AI assistant for clinical decision support
  - **Master Calendar**: Advanced appointment management
  - **Templates Manager**: Clinical template creation and management
  - **Research Studio**: Clinical analysis and research tools
- **Advanced Components**:
  - Resizable panels for multi-tasking workflows
  - Full-screen modes for focused clinical work
  - Interactive dental chart with individual tooth selection
  - AI-powered clinical decision support

## Architecture

- **Frontend**: Next.js 14+ with App Router architecture
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase for authentication and data storage
- **Automation**: n8n workflows for complex asynchronous tasks
- **Authentication**: Role-based access control (patient, assistant, dentist)

## Key Development Commands

```bash
# Development
pnpm dev                 # Start development server with Turbopack
pnpm build              # Build production bundle
pnpm start              # Start production server

# Database Operations
pnpm db:setup           # Initialize database configuration
pnpm db:migrate         # Run database migrations
pnpm db:seed            # Seed database with initial data
pnpm db:generate        # Generate new migration files
pnpm db:studio          # Open Drizzle Studio for database management
```

## File Structure & Key Locations

### Core Application Structure
- `/app/(login)/` - Authentication pages (sign-in, sign-up)
- `/app/(dashboard)/` - Protected dashboard routes
- `/lib/db/` - Database schema, migrations, and utilities
- `/components/ui/` - shadcn/ui component library
- `/schema ss/temp/` - v0.dev prototype components and reference screenshots organized by dashboard type
  - `/login-page/` - Login and registration components with welcome screens
  - `/patient-dashboard/` - Mobile-first patient interface components and UI screenshots
  - `/assistant-dashboard/` - Task-oriented assistant workflow components and screenshots
  - `/dentist-dashboard/` - Advanced clinical cockpit components and feature screenshots

### Database Schema Structure (CORRECTED)

**🚨 CRITICAL SCHEMA ARCHITECTURE:**
Based on the schema diagram in `schema ss/` folder, the ENDOFLOW database follows this structure:

#### Core Authentication Tables
- **`auth.users`**: Supabase built-in authentication table (id, email, created_at)
- **`public.profiles`**: **MAIN USER PROFILE TABLE** - connects to auth.users.id
  - `id` (uuid, references auth.users.id)
  - `role` (text: 'patient' | 'assistant' | 'dentist')
  - `status` (text: 'active' | 'pending' | 'inactive')
  - `full_name` (text)
  - `created_at` (timestamp)

#### Role-Specific Data Tables (All reference profiles.id)
- **`api.patients`**: Extended patient data (id, first_name, last_name, date_of_birth, medical_history_summary, created_at)
- **`api.assistants`**: Extended assistant data (id, full_name, created_at)
- **`api.dentists`**: Extended dentist data (id, full_name, specialty, created_at)

#### Application Tables
- **`api.pending_registrations`**: New user registrations awaiting approval
- **`api.appointments`**: Patient appointments
- **`api.treatments`**: Treatment records
- **`api.diagnoses`**: Diagnosis records
- **`api.messages`**: In-app messaging
- **`api.tasks`**: Assistant task management
- And many more clinical workflow tables

### Database Flow
1. **User signs up** → Entry created in `auth.users`
2. **Profile created** → Entry in `public.profiles` with role and status
3. **Role-specific data** → Additional data in `api.patients/assistants/dentists`
4. **Authentication checks** → Always query `profiles` table for role and status

### Previous Authentication Error
❌ **MISTAKE**: The authentication logic was incorrectly trying to query separate role tables directly instead of the central `profiles` table
✅ **CORRECT**: All authentication should use `profiles` table as the single source of truth for user roles and status

### Authentication Flow
- Login page serves as landing page
- Sign-up triggers comprehensive Digital Intake Form
- Account verification required before login access
- Role-based dashboard routing post-authentication

## Development Guidelines

### Component Integration
- Start with prototypes in `/temp/` directories
- Each dashboard type has complete v0.dev components and UI screenshots
- Replace starter template components systematically
- Maintain role-based access patterns throughout

### Backend Integration Phases
1. **Authentication Setup**: Implement Supabase auth with role routing
2. **Dashboard Assembly**: Replace mock data with live Supabase connections
3. **Feature Integration**: Connect n8n workflows for automation
4. **Real-time Features**: Implement live updates across dashboards

### Database Workflow
- Use Drizzle ORM for all database operations
- Run migrations before making schema changes
- Seed database for development testing
- Use Drizzle Studio for visual database management

### Role-Based Architecture
- Patient routes: Mobile-optimized with bottom navigation
- Assistant routes: Task-focused with sidebar navigation
- Dentist routes: Full-featured with top tab navigation
- Implement proper route guards for role-specific access

## Tech Stack Integration

### Core Technologies
- **Next.js 14+**: App Router with TypeScript
- **Drizzle**: Type-safe database operations
- **Supabase**: Authentication and real-time features
- **shadcn/ui**: Consistent component library
- **Tailwind CSS**: Utility-first styling

### Key Dependencies
- `@tailwindcss/postcss` - PostCSS integration
- `drizzle-orm` & `drizzle-kit` - Database ORM and migrations
- `jose` - JWT token handling
- `bcryptjs` - Password hashing
- `zod` - Runtime type validation
- `swr` - Data fetching and caching

## 🚀 LIVE SYSTEM STATUS (Current Implementation)

### ✅ **FULLY IMPLEMENTED & WORKING FEATURES**

#### **Authentication & User Management**
- **Multi-Role Registration System** → `lib/actions/multi-role-auth.ts`
  - Supports Patient, Assistant, Dentist registration
  - Database Flow: `auth.users` → `public.profiles` → role-specific tables
  - Approval workflow for all user types
- **Login/Logout System** → `lib/actions/auth.ts`
  - Role-based routing after authentication
  - Session management with Supabase Auth
- **Real Dentist Profiles**: Dr. Nisarg (General Dentistry) & Dr. Pranav (Endodontics)
  - Login: `dr.nisarg@endoflow.com` / `dr.pranav@endoflow.com`
  - Password: `endoflow123`

#### **Assistant Dashboard** (`/assistant`)
- **Navigation**: Dashboard, Verify Patients, New Appointment, File Upload
- **Patient Verification Workflow** → `components/assistant-dashboard-realtime.tsx`
  - Inline approve/reject buttons
  - Real-time updates via Supabase subscriptions
  - Database: `api.pending_registrations` → `public.profiles` → `api.patients`
- **Appointment Booking Interface** → `components/assistant/appointment-booking-interface.tsx`
  - Integrated at `/assistant/appointments`
  - Dentist selection from `api.dentists` table
  - Patient selection from `api.patients` table
  - Time slot management and scheduling
- **Real-Time Features**: Live patient registration notifications

#### **Patient Dashboard** (`/patient`)
- **Mobile-First Design** with teal accent colors (#009688)
- **Enhanced Appointment Booking** → `components/patient/enhanced-appointment-booking.tsx`
  - Time selection with dentist availability
  - Pain level assessment integration
  - Real-time appointment request submission
- **Cross-Dashboard Integration**: Requests appear instantly in assistant dashboard

#### **Database Architecture (LIVE)**
```
auth.users (Supabase Auth)
    ↓ (FK: id)
public.profiles (Central user table)
    ├── role: 'patient' | 'assistant' | 'dentist'
    ├── status: 'active' | 'pending' | 'inactive'
    └── full_name, created_at
    ↓ (FK: id)
api.patients / api.assistants / api.dentists (Role-specific data)

Cross-referenced by:
- api.pending_registrations (new user approvals)
- api.appointments (appointment scheduling)
- public.pending_patient_verifications (unified view)
```

#### **Real-Time Integration Points**
- **Patient Registration** → Assistant Dashboard (instant notifications)
- **Appointment Requests** → All three dashboards (live updates)
- **Patient Approval** → Patient can login immediately
- **Database Subscriptions**: Supabase real-time for live updates

### 🔧 **INTEGRATION STATUS BY DASHBOARD**

#### **Assistant Features (Live)**
| Feature | Status | Database Tables | API Actions |
|---------|--------|----------------|-------------|
| Patient Verification | ✅ Live | `public.profiles`, `auth.users` | `approvePatientAction` |
| Appointment Booking | ✅ Live | `api.appointments`, `api.dentists` | `createAppointmentRequest` |
| Real-time Notifications | ✅ Live | Supabase subscriptions | Real-time subscriptions |
| Cross-dashboard Updates | ✅ Live | Multiple tables | `RealtimeAssistantDashboard` |

#### **Patient Features (Live)**
| Feature | Status | Database Tables | API Actions |
|---------|--------|----------------|-------------|
| Self Registration | ✅ Live | `api.pending_registrations` | `multiRoleSignup` |
| Appointment Booking | ✅ Live | `api.appointments` | `createAppointmentRequest` |
| Real-time Status Updates | ✅ Live | Supabase subscriptions | Live appointment updates |

#### **Dentist Features (Partial)**
| Feature | Status | Database Tables | API Actions |
|---------|--------|----------------|-------------|
| Profile Management | ✅ Live | `api.dentists`, `public.profiles` | Login system |
| Appointment Visibility | ✅ Live | `api.appointments` | `getDentistAppointments` |
| Patient Queue | 🔄 Partial | `api.appointments`, `api.patients` | Dashboard integration needed |

### 📋 **TECHNICAL IMPLEMENTATION DETAILS**

#### **Server Actions (lib/actions/)**
- `auth.ts` - User authentication, patient/staff approval
- `multi-role-auth.ts` - Complete registration system for all roles
- `appointments.ts` - Appointment booking and management
- `patient.ts` - Patient-specific operations
- `dentist.ts` - Dentist-specific operations

#### **Database Queries (lib/db/queries.ts)**
- `getAvailableDentists()` - Real dentist data (no more mock data)
- `getPendingPatients()` - Patient approval workflow
- `getPendingAppointmentRequests()` - Cross-dashboard appointment requests
- `getActivePatients()` - Patient selection for appointments

#### **Real-Time Components**
- `components/assistant-dashboard-realtime.tsx` - Live patient verification
- `components/realtime-appointment-requests.tsx` - Cross-dashboard appointment updates
- `components/patient/enhanced-appointment-booking.tsx` - Real-time appointment booking

### 🎯 **NEXT DEVELOPMENT PHASE: V0 Design Implementation**
Current functional system needs visual transformation to match v0 designs while preserving all existing functionality.

## Endoflow: Backend Development Plan

### Phase 1: Foundation & Core Infrastructure ✅ (Mostly Complete)

**Sub-phase 1.1: System Architecture & Setup**
- ✅ Task 1.1.3: Database instance setup (PostgreSQL with Supabase)
- ✅ Task 1.1.4: Project repository with Next.js framework initialized
- ❌ Task 1.1.1-1.1.2: Cloud hosting and architecture decisions pending
- ❌ Task 1.1.5: Logging and monitoring services pending

**Sub-phase 1.2: Database Schema Design** ✅ **COMPLETED**
- ✅ Task 1.2.1: Users schema with role-based structure implemented
- ✅ Task 1.2.2: Patients schema with UHID and registration status
- ✅ Task 1.2.3: Appointments schema with comprehensive status workflow
- ✅ Task 1.2.4: Clinic schema with staff management
- ✅ Task 1.2.5: ClinicalRecords schema with dental chart data
- ✅ Task 1.2.6: Tasks schema with priority and assignment
- ✅ Task 1.2.7: Messages schema for communication
- ✅ Task 1.2.8: Notifications schema with real-time support

**Sub-phase 1.3: Authentication & Authorization Service** ✅ **COMPLETED**
- ✅ Task 1.3.1: Secure user registration endpoint implemented
- ✅ Task 1.3.2: JWT-based login system with Supabase
- ✅ Task 1.3.3: Password reset flow implemented
- ✅ Task 1.3.4: Middleware with JWT validation and RBAC

**Sub-phase 1.4: Real-Time Event Bus Setup** ❌ **PENDING**
- ❌ Task 1.4.1: WebSocket server implementation needed
- ❌ Task 1.4.2: Channel/event structure definition required
- ❌ Task 1.4.3: Core EventService for publishing messages

### Phase 2: Patient Portal Backend ✅ (Mostly Complete)

**Sub-phase 2.1: Patient Registration & Onboarding** ✅ **COMPLETED**
- ✅ Task 2.1.1: Patient self-registration API with pending status
- ✅ Task 2.1.2: New registration events published to clinic

**Sub-phase 2.2: Patient Dashboard & Data** ✅ **COMPLETED**
- ✅ Task 2.2.1: Dashboard data aggregation endpoint
- ✅ Task 2.2.2: Patient digital file access endpoint
- ✅ Task 2.2.3: Notifications management endpoints

**Sub-phase 2.3: Appointment Management** ✅ **COMPLETED**
- ✅ Task 2.3.1: Appointment request submission endpoint
- ✅ Task 2.3.2: Patient appointments listing endpoint
- ✅ Task 2.3.3: Appointment reschedule request system
- ✅ Task 2.3.4: Event publishing for appointment requests

**Sub-phase 2.4: Communication** ❌ **PENDING**
- ❌ Task 2.4.1: Chat history endpoint needed
- ❌ Task 2.4.2: Message sending with real-time events
- ❌ Task 2.4.3: Urgent assistance request logic

**Sub-phase 2.5: Educational Library** ❌ **PENDING**
- ❌ Task 2.5.1: LibraryContent schema design needed
- ❌ Task 2.5.2: Content search and fetch endpoints

### Phase 3: Clinic Admin Portal Backend ✅ (Mostly Complete)

**Sub-phase 3.1: Admin Dashboard & Analytics** ✅ **COMPLETED**
- ✅ Task 3.1.1: Dashboard analytics endpoint with patient metrics
- ✅ Task 3.1.2: Daily Task Hub data aggregation

**Sub-phase 3.2: Patient Management** ✅ **COMPLETED**
- ✅ Task 3.2.1: Patient registration verification system
- ✅ Task 3.2.2: Manual patient registration by staff
- ✅ Task 3.2.3: Patient record CRUD operations

**Sub-phase 3.3: Scheduling & Appointment Management** ✅ **COMPLETED**
- ✅ Task 3.3.1: Weekly schedule view with availability
- ✅ Task 3.3.2: Pending appointments queue
- ✅ Task 3.3.3: Core appointment booking with validation
- ✅ Task 3.3.4: Appointment status management

**Sub-phase 3.4: File & Treatment Management** ❌ **PENDING**
- ❌ Task 3.4.1: Secure file upload service needed
- ❌ Task 3.4.2: Treatment specialties CRUD endpoints

### Phase 4: Dentist/Clinician Portal Backend 🔄 (In Progress)

**Sub-phase 4.1: Dentist Dashboard & Patient Queue** ✅ **COMPLETED**
- ✅ Task 4.1.1: Today's View dashboard with stats
- ✅ Task 4.1.2: Alerts and reminders system
- ✅ Task 4.1.3: Patient queue filtering and management

**Sub-phase 4.2: Clinical Consultation & Charting** 🔄 **IN PROGRESS**
- 🔄 Task 4.2.1: New consultation endpoint with patient history
- 🔄 Task 4.2.2: Comprehensive consultation saving
- 🔄 Task 4.2.3: Interactive dental chart data storage
- ❌ Task 4.2.4: Voice dictation service integration
- 🔄 Task 4.2.5: Clinical Cockpit tabs implementation

**Sub-phase 4.3: Appointment & Task Management** ❌ **PENDING**
- ❌ Task 4.3.1: Dentist calendar view endpoint
- ❌ Task 4.3.2: Assistant Tasks Kanban board CRUD
- ❌ Task 4.3.3: Real-time task updates

**Sub-phase 4.4: Templates Management** ❌ **PENDING**
- ❌ Task 4.4.1: Clinical documentation templates CRUD

### Phase 5: Advanced Features & System Integration ❌ **NOT STARTED**

**Sub-phase 5.1: AI Co-Pilot (Treatment Planning)**
- ❌ Task 5.1.1: AI service API design for diagnosis data
- ❌ Task 5.1.2: LLM integration service development
- ❌ Task 5.1.3: Treatment suggestion endpoint with confidence scores

**Sub-phase 5.2: Clinical Research Assistant (AI Chatbot)**
- ❌ Task 5.2.1: Anonymized clinical data query service
- ❌ Task 5.2.2: Natural language research endpoint
- ❌ Task 5.2.3: LLM integration with streaming responses

**Sub-phase 5.3: Research Projects Module**
- ❌ Task 5.3.1: ResearchProjects and Cohorts schemas
- ❌ Task 5.3.2: Research project creation endpoint
- ❌ Task 5.3.3: Patient database filtering query engine
- ❌ Task 5.3.4: Cohort analysis dashboard

### Phase 6: Testing, Deployment & Security ❌ **NOT STARTED**

**Sub-phase 6.1: API & Load Testing**
- ❌ Task 6.1.1: Unit and integration tests for all endpoints
- ❌ Task 6.1.2: Load testing for high traffic scenarios
- ❌ Task 6.1.3: End-to-end real-time data flow testing

**Sub-phase 6.2: Security & Compliance**
- ❌ Task 6.2.1: Security audit and penetration testing
- ❌ Task 6.2.2: HIPAA compliance implementation
- ❌ Task 6.2.3: Rate limiting and abuse prevention

**Sub-phase 6.3: Deployment & CI/CD**
- ❌ Task 6.3.1: Production build configurations
- ❌ Task 6.3.2: CI/CD pipeline setup
- ❌ Task 6.3.3: Production deployment
- ❌ Task 6.3.4: API documentation preparation

## Current Priority Tasks

### Immediate (Phase 4 Completion)
1. Complete Clinical Cockpit integration with patient selection
2. Implement real-time WebSocket system (Phase 1.4)
3. Add file upload/management system (Phase 3.4)
4. Build messaging system (Phase 2.4)

### Next Sprint (Phase 5 Foundation)
1. AI co-pilot basic integration
2. Template management system
3. Enhanced task management with real-time updates
4. Research tools foundation

## 🔧 **LOGIN VERIFICATION DEBUG GUIDE**

### Issue: Assistant-Created Patients Getting Pending Status Instead of Active

**Problem**: Patients created by assistants through `/assistant/register` were incorrectly getting `pending` status instead of `active` status, preventing immediate login.

**Root Cause Analysis**:
1. **Two Registration Flows Exist** (by design):
   - **Public Self-Registration** (`/signup`) → `patientSignup()` → `pending` status (needs approval) ✅
   - **Assistant Manual Registration** (`/assistant/register`) → `manualPatientRegistration()` → `active` status (immediate login) ✅

2. **Bug Location**: `lib/actions/patient-registration.ts:94-96`
   - Profile creation errors were being ignored (except duplicates)
   - If profile creation failed, database created profile with default `pending` status
   - Schema default: `status: text('status').notNull().default('pending')`

**Debugging Process**:
```bash
# 1. Check patient database state
node check-patient-status.js

# 2. Verify registration flow used
- No pending_registrations record = Assistant registration ✅
- Has pending_registrations record = Self registration ✅

# 3. Check profile status
- ACTIVE = Can login immediately ✅
- PENDING = Needs approval ❌ (bug if assistant-created)
```

**Solution Applied**:
```typescript
// BEFORE (lib/actions/patient-registration.ts:94-96)
if (profileError && profileError.code !== '23505') {
  console.error('Failed to create profile:', profileError.message)
  // Don't fail the whole operation for this ❌ WRONG
}

// AFTER (Fixed)
if (profileError) {
  if (profileError.code === '23505') {
    // Update existing profile to active
    await supabase.from('profiles').update({ status: 'active' })
  } else {
    // BLOCK operation if profile creation fails ✅ FIXED
    return { error: 'Failed to create active patient profile' }
  }
}
```

**Enhanced Logging Added**:
- `🏥 [MANUAL REGISTRATION] ⚡ ASSISTANT-CREATED PATIENT ⚡` → ACTIVE status
- `👤 [PATIENT SIGNUP] 🔒 SELF-REGISTERED PATIENT 🔒` → PENDING status

**Testing Commands**:
```bash
# Test both flows work correctly
NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." node verify-registration-flows.js
```

**Key Takeaway**: Always ensure error handling doesn't silently break critical business logic. Assistant-created patients MUST get active status for immediate login access.

## 📁 **FILE MANAGEMENT SYSTEM** ✅ **FULLY IMPLEMENTED**

### **Overview**
Complete medical file upload and management system allowing assistants and dentists to upload patient medical images (X-rays, oral photos, CBCT scans) with metadata and descriptions. Files are stored securely in Supabase Storage and displayed across all three dashboards.

### **Architecture Components**

#### **1. Database Schema** (`lib/db/schema.ts`)
```typescript
export const patientFiles = apiSchema.table('patient_files', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  uploadedBy: uuid('uploaded_by').notNull(), // Assistant/dentist who uploaded
  fileName: text('file_name').notNull(),
  originalFileName: text('original_file_name').notNull(),
  filePath: text('file_path').notNull(), // Supabase storage path
  fileSize: integer('file_size').notNull(), // in bytes
  mimeType: text('mime_type').notNull(),
  fileType: text('file_type').notNull(), // X-Ray, Oral Photo, etc.
  description: text('description').notNull(), // Legend/description
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### **2. Storage Architecture**
- **Bucket**: `medical-files` (Private)
- **Path Structure**: `patient-files/{patientId}/{uniqueFileName}`
- **File Types**: Images only (JPG, PNG, JPEG) up to 10MB
- **Security**: Signed URLs for secure access, service role permissions

#### **3. Server Actions** (`lib/actions/patient-files.ts`)
- **`uploadPatientFileAction(formData)`**: Complete upload workflow
  - User permission validation (assistant/dentist only)
  - File validation (type, size limits)
  - Supabase Storage upload
  - Database metadata storage
  - Cross-dashboard revalidation
- **`getPatientFilesAction(patientId)`**: Retrieve patient's files
- **`getFileUrlAction(filePath)`**: Generate secure signed URLs
- **`deletePatientFileAction(fileId)`**: Archive files (soft delete)

### **User Interface Components**

#### **Assistant File Uploader** (`/assistant/files`)
**Location**: `components/assistant/file-uploader-interface.tsx`

**Features**:
- **Patient Selection**: Search and select any patient
- **Drag & Drop Interface**: Modern file upload with preview
- **File Type Classification**: X-Ray, Oral Photo, CBCT Scan, Treatment Plan, etc.
- **Metadata Input**: Description/legend for each file
- **Batch Upload**: Multiple files with individual metadata
- **Real-time Feedback**: Upload progress and error handling

**Technical Details**:
```typescript
interface FileUpload {
  file: File
  preview: string  // Base64 preview
  type: string     // Medical file type
  legend: string   // Description
  id: string       // Unique identifier
}
```

#### **Cross-Dashboard Integration**
- **Real-time Updates**: Files appear instantly across all dashboards after upload
- **Revalidation**: Automatic cache invalidation for `/assistant/files`, `/patient`, `/dentist`
- **Security**: Role-based access with Row Level Security policies

### **Setup Requirements**

#### **Database Setup**
1. **Table Creation**: Run `CREATE_PATIENT_FILES_TABLE_SAFE.sql` in Supabase SQL Editor
2. **Permissions**: Execute `SIMPLE_TABLE_FIX.sql` for proper access rights

#### **Storage Setup**
1. **Manual Bucket Creation** (Required):
   - Go to Supabase Dashboard → Storage
   - Create bucket named `medical-files`
   - Set to Private
   - Supabase handles basic authenticated access automatically

#### **Verification Scripts**
```bash
# Test storage and table setup
node test-storage-setup.js

# Test bucket creation only
node test-bucket-only.js

# Verify complete setup
node verify-storage-complete.js
```

### **Error Handling & Troubleshooting**

#### **Common Issues**
1. **"Failed to save file metadata"**: Database table missing or permission issues
   - **Solution**: Run `SIMPLE_TABLE_FIX.sql`

2. **"Storage bucket not configured"**: Bucket doesn't exist
   - **Solution**: Create `medical-files` bucket manually in Supabase Dashboard

3. **"Storage access denied"**: Policy configuration issues
   - **Solution**: Service role has elevated permissions, should work with private bucket

#### **Enhanced Error Messages**
The upload action provides specific error guidance:
- Missing bucket → "Please create medical-files bucket in Supabase Dashboard"
- Policy issues → "Run STORAGE_SETUP_NO_PERMS.sql in Supabase SQL Editor"
- File validation → Clear messages about file type/size limits

### **Security Model**

#### **Row Level Security Policies**
```sql
-- Staff can upload files
CREATE POLICY "Staff can upload patient files" ON api.patient_files
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('assistant', 'dentist')
        AND status = 'active'
    )
    AND uploaded_by = auth.uid()
);

-- Users can view files (patients see own, staff see all)
CREATE POLICY "Users can view patient files" ON api.patient_files
FOR SELECT TO authenticated
USING (
    patient_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('assistant', 'dentist')
        AND status = 'active'
    )
);
```

#### **File Access Security**
- **Signed URLs**: 1-hour expiry for secure file access
- **Service Role**: Backend operations use elevated permissions
- **Client Access**: Frontend uses signed URLs, never direct storage access

### **Integration Status**

#### **✅ Completed**
- Assistant file upload interface with full functionality
- Database schema and server actions
- Storage configuration and security
- Error handling and validation
- Setup scripts and documentation

#### **🔄 Next Phase: Display Integration**
- Patient dashboard file viewer
- Dentist clinical cockpit file display
- Advanced features: annotations, comparisons, AI analysis