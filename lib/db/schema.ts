import { pgTable, text, timestamp, uuid, date, pgSchema, boolean, integer, time } from 'drizzle-orm/pg-core';

// Create api schema
export const apiSchema = pgSchema('api');

// Main profiles table (public schema) - Central authentication table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users.id
  role: text('role', { enum: ['patient', 'assistant', 'dentist'] }).notNull(),
  status: text('status', { enum: ['active', 'pending', 'inactive'] }).notNull().default('pending'),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assistants table - references auth.users.id
export const assistants = apiSchema.table('assistants', {
  id: uuid('id').primaryKey(), // This will be the same as auth.users.id
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dentists table - references auth.users.id
export const dentists = apiSchema.table('dentists', {
  id: uuid('id').primaryKey(), // This will be the same as auth.users.id
  fullName: text('full_name').notNull(),
  specialty: text('specialty'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patients table - references auth.users.id
export const patients = apiSchema.table('patients', {
  id: uuid('id').primaryKey(), // This will be the same as auth.users.id
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  email: text('email'),
  dateOfBirth: date('date_of_birth'),
  medicalHistorySummary: text('medical_history_summary'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pending registrations table - for users who signed up but aren't approved yet
export const pendingRegistrations = apiSchema.table('pending_registrations', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(), // References auth.users.id - NEW FK RELATIONSHIP
  formData: text('form_data').notNull(), // JSON string of the registration form
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
});

// Appointment requests table - Patient booking requests
export const appointmentRequests = apiSchema.table('appointment_requests', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  appointmentType: text('appointment_type').notNull(),
  preferredDate: date('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  reasonForVisit: text('reason_for_visit').notNull(),
  painLevel: integer('pain_level'),
  additionalNotes: text('additional_notes'),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).notNull().default('pending'),
  notificationSent: boolean('notification_sent').notNull().default(false),
  assignedTo: uuid('assigned_to'), // References api.assistants.id
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Appointments table - Confirmed appointments
export const appointments = apiSchema.table('appointments', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  dentistId: uuid('dentist_id').notNull(), // References api.dentists.id
  assistantId: uuid('assistant_id'), // References api.assistants.id
  appointmentRequestId: uuid('appointment_request_id'), // References api.appointment_requests.id
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  appointmentType: text('appointment_type').notNull(),
  status: text('status', { enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'] }).notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table - Real-time alerts
export const notifications = apiSchema.table('notifications', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  userId: uuid('user_id').notNull(), // References auth.users.id
  type: text('type').notNull(), // 'appointment_request', 'appointment_confirmed', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedId: uuid('related_id'), // Links to appointment_request or appointment
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define types for easier use
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Assistant = typeof assistants.$inferSelect;
export type NewAssistant = typeof assistants.$inferInsert;
export type Dentist = typeof dentists.$inferSelect;
export type NewDentist = typeof dentists.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type PendingRegistration = typeof pendingRegistrations.$inferSelect;
export type NewPendingRegistration = typeof pendingRegistrations.$inferInsert;
export type AppointmentRequest = typeof appointmentRequests.$inferSelect;
export type NewAppointmentRequest = typeof appointmentRequests.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Messages table for patient-staff communication
export const messages = apiSchema.table('messages', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  senderId: uuid('sender_id').notNull(), // References auth.users.id
  senderType: text('sender_type', { enum: ['patient', 'assistant', 'dentist'] }).notNull(),
  message: text('message').notNull(),
  isFromPatient: boolean('is_from_patient').notNull().default(false),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Treatments table for tracking patient treatment history
export const treatments = apiSchema.table('treatments', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  dentistId: uuid('dentist_id').notNull(), // References api.dentists.id
  appointmentId: uuid('appointment_id'), // References api.appointments.id
  treatmentType: text('treatment_type').notNull(),
  description: text('description'),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Patient Files table for storing medical images and documents
export const patientFiles = apiSchema.table('patient_files', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  patientId: uuid('patient_id').notNull(), // References auth.users.id
  uploadedBy: uuid('uploaded_by').notNull(), // References auth.users.id (assistant/dentist who uploaded)
  fileName: text('file_name').notNull(),
  originalFileName: text('original_file_name').notNull(),
  filePath: text('file_path').notNull(), // Supabase storage path
  fileSize: integer('file_size').notNull(), // in bytes
  mimeType: text('mime_type').notNull(),
  fileType: text('file_type').notNull(), // X-Ray, Oral Photo, etc.
  description: text('description').notNull(), // Legend/description of the file
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Treatment = typeof treatments.$inferSelect;
export type NewTreatment = typeof treatments.$inferInsert;
export type PatientFile = typeof patientFiles.$inferSelect;
export type NewPatientFile = typeof patientFiles.$inferInsert;
