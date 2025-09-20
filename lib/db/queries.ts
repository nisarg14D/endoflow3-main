// Database queries for ENDOFLOW
import { eq } from 'drizzle-orm';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { profiles, patients, assistants, dentists, pendingRegistrations, appointmentRequests, appointments, notifications, type Profile, type Patient, type Assistant, type Dentist, type PendingRegistration, type AppointmentRequest, type Appointment, type Notification, type NewAppointmentRequest, type NewAppointment, type NewNotification } from './schema';

export async function getUserByRole(id: string, role: 'patient' | 'assistant' | 'dentist'): Promise<any | null> {
  const supabase = await createClient();

  try {
    const tableName = role === 'patient' ? 'patients' : role === 'assistant' ? 'assistants' : 'dentists';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user by role:', error);
    return null;
  }
}

export async function getPendingPatients(): Promise<any[]> {
  // FIXED: Only get patients who self-registered and are truly pending approval
  // Manually registered patients (created by staff) should NEVER appear here
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching self-registered pending patients only...');

    // STEP 1: Get patients who self-registered and are pending
    // These are patients who have profiles with status='pending' but also have
    // corresponding entries in pending_registrations table (self-registration)
    const { data: pendingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'patient')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (profilesError) {
      console.error('❌ [DB] Error fetching pending profiles:', profilesError?.message || 'Unknown error');
      return [];
    }

    if (!pendingProfiles || pendingProfiles.length === 0) {
      console.log('✅ [DB] No pending patient profiles found');
      return [];
    }

    console.log('🔍 [DB] Found', pendingProfiles.length, 'pending profiles, filtering for self-registrations...');

    // STEP 2: Filter to only include patients who have corresponding pending_registrations
    // This excludes manually registered patients (who have pending profiles but no pending_registrations)
    const pendingProfileIds = pendingProfiles.map(p => p.id);

    const { data: pendingRegistrations, error: registrationsError } = await supabase
      .schema('api')
      .from('pending_registrations')
      .select('user_id, id, submitted_at')
      .in('user_id', pendingProfileIds)
      .eq('status', 'pending');

    if (registrationsError) {
      console.error('❌ [DB] Error fetching pending registrations:', registrationsError?.message || 'Unknown error');
      return [];
    }

    // STEP 3: Only return profiles that have corresponding pending registrations (self-registered)
    const selfRegisteredPendingIds = new Set(pendingRegistrations?.map(reg => reg.user_id) || []);

    const selfRegisteredPendingPatients = pendingProfiles.filter(profile =>
      selfRegisteredPendingIds.has(profile.id)
    );

    console.log('✅ [DB] Filtered to', selfRegisteredPendingPatients.length, 'self-registered pending patients');
    console.log('🔍 [DB] Excluded', pendingProfiles.length - selfRegisteredPendingPatients.length, 'manually registered patients');

    return selfRegisteredPendingPatients || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching pending patients:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

export async function getPendingRegistrations(): Promise<PendingRegistration[]> {
  // Use service role to bypass RLS
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching pending registrations...');

    const { data: registrations, error } = await supabase
      .schema('api')
      .from('pending_registrations')
      .select('*')
      .eq('status', 'pending')
      .not('form_data', 'is', null) // Filter out null formData
      .neq('form_data', '') // Filter out empty formData
      .neq('form_data', 'undefined') // Filter out literal 'undefined' strings
      .neq('form_data', 'null') // Filter out literal 'null' strings
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching pending registrations:', error);
      return [];
    }

    if (!registrations || registrations.length === 0) {
      console.log('✅ [DB] No pending registrations found');
      return [];
    }

    console.log('✅ [DB] Successfully fetched pending registrations:', registrations.length);
    return registrations;
  } catch (error) {
    console.error('❌ [DB] Exception fetching pending registrations:', error);
    return [];
  }
}

export async function getActivePatients(): Promise<Patient[]> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    const { data, error } = await supabase
      .schema('api')
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active patients:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active patients:', error);
    return [];
  }
}

export async function getPendingRegistrationById(id: string): Promise<PendingRegistration | null> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Attempting to fetch pending registration by ID:', id);

    const { data, error } = await supabase
      .schema('api')
      .from('pending_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [DB] Supabase error fetching pending registration by ID:', {
        id,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    if (!data) {
      console.log('⚠️ [DB] No pending registration found for ID:', id);
      return null;
    }

    console.log('✅ [DB] Successfully fetched pending registration by ID:', id);
    return data;
  } catch (error) {
    console.error('❌ [DB] Exception fetching pending registration by ID:', {
      id,
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

// Legacy function for backward compatibility - redirects to pending registrations
export async function getUserProfile(id: string): Promise<any | null> {
  return getPendingRegistrationById(id);
}

// Helper function to get user role
export async function getUserRole(userId: string): Promise<string | null> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DEBUG] Starting role lookup for user ID:', userId);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('🚨 [DEBUG] Error querying profiles table:', error);
      }
      return null;
    }

    if (!profile) {
      console.log('❌ [DEBUG] No profile found for user ID:', userId);
      return null;
    }

    if (profile.status !== 'active' && profile.status !== 'pending') {
      console.log('❌ [DEBUG] User profile is not active:', profile.status);
      return null;
    }

    console.log('✅ [DEBUG] Found user role:', profile.role);
    return profile.role;
  } catch (error) {
    console.error('❌ [DEBUG] Exception getting user role:', error);
    return null;
  }
}

export async function approvePatient(patientId: string): Promise<{ success: boolean; error?: string }> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Attempting to approve patient:', patientId);

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', patientId)
      .eq('role', 'patient')
      .eq('status', 'pending');

    if (error) {
      console.error('❌ [DB] Error approving patient:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [DB] Patient approved successfully:', patientId);
    return { success: true };
  } catch (error) {
    console.error('❌ [DB] Exception approving patient:', error);
    return { success: false, error: 'Failed to approve patient' };
  }
}

export async function rejectPatient(patientId: string): Promise<{ success: boolean; error?: string }> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient()

  try {
    console.log('🔍 [DB] Attempting to reject patient:', patientId)

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', patientId)
      .eq('role', 'patient')
      .eq('status', 'pending')

    if (error) {
      console.error('❌ [DB] Error rejecting patient:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [DB] Patient rejected successfully:', patientId)
    return { success: true }
  } catch (error) {
    console.error('❌ [DB] Exception rejecting patient:', error)
    return { success: false, error: 'Failed to reject patient' }
  }
}

export async function getPendingAssistants(): Promise<Profile[]> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient()

  try {
    console.log('🔍 [DB] Attempting to fetch pending assistants...')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'assistant')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ [DB] Supabase error fetching pending assistants:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full_error: error
      })
      return []
    }

    console.log('✅ [DB] Successfully fetched pending assistants:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ [DB] Exception fetching pending assistants:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}

export async function approveAssistant(assistantId: string): Promise<{ success: boolean; error?: string }> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient()

  try {
    console.log('🔍 [DB] Attempting to approve assistant:', assistantId)

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', assistantId)
      .eq('role', 'assistant')
      .eq('status', 'pending')

    if (error) {
      console.error('❌ [DB] Error approving assistant:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [DB] Assistant approved successfully:', assistantId)
    return { success: true }
  } catch (error) {
    console.error('❌ [DB] Exception approving assistant:', error)
    return { success: false, error: 'Failed to approve assistant' }
  }
}

export async function rejectAssistant(assistantId: string): Promise<{ success: boolean; error?: string }> {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient()

  try {
    console.log('🔍 [DB] Attempting to reject assistant:', assistantId)

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', assistantId)
      .eq('role', 'assistant')
      .eq('status', 'pending')

    if (error) {
      console.error('❌ [DB] Error rejecting assistant:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [DB] Assistant rejected successfully:', assistantId)
    return { success: true }
  } catch (error) {
    console.error('❌ [DB] Exception rejecting assistant:', error)
    return { success: false, error: 'Failed to reject assistant' }
  }
}

// Patient-specific queries
export async function getPatientAppointments(patientId: string) {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching appointments for patient:', patientId);

    const { data, error } = await supabase
      .schema('api')
      .from('appointments')
      .select(`
        *,
        dentists:dentist_id (
          full_name,
          specialty
        )
      `)
      .eq('patient_id', patientId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching patient appointments:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched appointments:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching patient appointments:', error);
    return [];
  }
}

export async function getPatientTreatmentHistory(patientId: string) {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching treatment history for patient:', patientId);

    const { data, error } = await supabase
      .schema('api')
      .from('treatments')
      .select(`
        *,
        dentists:dentist_id (
          full_name,
          specialty
        ),
        appointments:appointment_id (
          scheduled_date,
          appointment_type
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [DB] Error fetching patient treatment history:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched treatment history:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching patient treatment history:', error);
    return [];
  }
}

export async function getPatientMessages(patientId: string) {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching messages for patient:', patientId);

    const { data, error } = await supabase
      .schema('api')
      .from('messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching patient messages:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched messages:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching patient messages:', error);
    return [];
  }
}

export async function createAppointmentBooking(patientId: string, bookingData: {
  chiefComplaint: string;
  painLevel: string;
  urgency: string;
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
}) {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Creating appointment booking for patient:', patientId);

    // First, create a pending appointment request
    const { data, error } = await supabase
      .schema('api')
      .from('appointment_requests')
      .insert({
        patient_id: patientId,
        appointment_type: bookingData.chiefComplaint, // Map chiefComplaint to appointment_type
        reason_for_visit: bookingData.chiefComplaint,
        pain_level: parseInt(bookingData.painLevel) || null,
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime,
        additional_notes: bookingData.additionalNotes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [DB] Error creating appointment booking:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [DB] Successfully created appointment booking:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DB] Exception creating appointment booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendPatientMessage(patientId: string, message: string) {
  // TEMPORARY: Use service role to bypass RLS until database fix is applied
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Sending message from patient:', patientId);

    const { data, error } = await supabase
      .schema('api')
      .from('messages')
      .insert({
        patient_id: patientId,
        sender_id: patientId,
        sender_type: 'patient',
        message: message,
        is_from_patient: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [DB] Error sending patient message:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [DB] Successfully sent patient message:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DB] Exception sending patient message:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ======================================
// APPOINTMENT BOOKING WORKFLOW FUNCTIONS
// ======================================

export async function getPendingAppointmentRequests(): Promise<AppointmentRequest[]> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching pending appointment requests...');

    const { data: requests, error } = await supabase
      .schema('api')
      .from('appointment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching pending appointment requests:', error);
      return [];
    }

    if (!requests || requests.length === 0) {
      console.log('✅ [DB] No pending appointment requests found');
      return [];
    }

    // Manually fetch profile data for each request
    console.log('🔍 [DB] Fetching profile data for', requests.length, 'requests');
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', request.patient_id)
          .single();

        if (profileError) {
          console.error('❌ [DB] Error fetching profile for patient:', request.patient_id, profileError);
          // Return request without profile data if profile fetch fails
          return request;
        }

        return {
          ...request,
          profiles: profile
        };
      })
    );

    console.log('✅ [DB] Successfully fetched pending appointment requests:', requestsWithProfiles.length);
    return requestsWithProfiles;
  } catch (error) {
    console.error('❌ [DB] Exception fetching pending appointment requests:', error);
    return [];
  }
}

export async function getAppointmentRequestDetails(requestId: string): Promise<AppointmentRequest | null> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching appointment request details:', requestId);

    const { data: request, error } = await supabase
      .schema('api')
      .from('appointment_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      console.error('❌ [DB] Error fetching appointment request details:', error);
      return null;
    }

    // Manually fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', request.patient_id)
      .single();

    const requestWithProfile = {
      ...request,
      profiles: profile || null
    };

    if (profileError) {
      console.error('❌ [DB] Error fetching profile for request:', profileError);
    }

    console.log('✅ [DB] Successfully fetched appointment request details');
    return requestWithProfile;
  } catch (error) {
    console.error('❌ [DB] Exception fetching appointment request details:', error);
    return null;
  }
}

export async function confirmAppointment(
  requestId: string,
  scheduleData: {
    dentistId: string;
    assistantId?: string;
    scheduledDate: string;
    scheduledTime: string;
    durationMinutes?: number;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string; appointmentId?: string }> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Confirming appointment for request:', requestId);

    // First, get the appointment request details
    const { data: request, error: requestError } = await supabase
      .schema('api')
      .from('appointment_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      console.error('❌ [DB] Error fetching appointment request:', requestError);
      return { success: false, error: 'Appointment request not found' };
    }

    // Create the confirmed appointment
    const { data: appointment, error: appointmentError } = await supabase
      .schema('api')
      .from('appointments')
      .insert({
        patient_id: request.patient_id,
        dentist_id: scheduleData.dentistId,
        assistant_id: scheduleData.assistantId,
        appointment_request_id: requestId,
        scheduled_date: scheduleData.scheduledDate,
        scheduled_time: scheduleData.scheduledTime,
        duration_minutes: scheduleData.durationMinutes || 60,
        appointment_type: request.appointment_type,
        status: 'scheduled',
        notes: scheduleData.notes,
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ [DB] Error creating appointment:', appointmentError);
      return { success: false, error: appointmentError.message };
    }

    // Update the appointment request status
    const { error: updateError } = await supabase
      .schema('api')
      .from('appointment_requests')
      .update({
        status: 'confirmed',
        assigned_to: scheduleData.assistantId
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('❌ [DB] Error updating appointment request:', updateError);
      return { success: false, error: updateError.message };
    }

    // Create notifications for patient and dentist
    await createNotification(request.patient_id, 'appointment_confirmed', {
      title: 'Appointment Confirmed',
      message: `Your appointment has been scheduled for ${scheduleData.scheduledDate} at ${scheduleData.scheduledTime}`,
      relatedId: appointment.id
    });

    await createNotification(scheduleData.dentistId, 'appointment_scheduled', {
      title: 'New Appointment Scheduled',
      message: `New appointment scheduled for ${scheduleData.scheduledDate} at ${scheduleData.scheduledTime}`,
      relatedId: appointment.id
    });

    console.log('✅ [DB] Successfully confirmed appointment:', appointment.id);
    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error('❌ [DB] Exception confirming appointment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createNotification(
  userId: string,
  type: string,
  notificationData: {
    title: string;
    message: string;
    relatedId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Creating notification for user:', userId);

    const { data, error } = await supabase
      .schema('api')
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title: notificationData.title,
        message: notificationData.message,
        related_id: notificationData.relatedId,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [DB] Error creating notification:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [DB] Successfully created notification');
    return { success: true };
  } catch (error) {
    console.error('❌ [DB] Exception creating notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching notifications for user:', userId);

    const { data, error } = await supabase
      .schema('api')
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [DB] Error fetching notifications:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched notifications:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching notifications:', error);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Marking notification as read:', notificationId);

    const { error } = await supabase
      .schema('api')
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('❌ [DB] Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [DB] Successfully marked notification as read');
    return { success: true };
  } catch (error) {
    console.error('❌ [DB] Exception marking notification as read:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching appointments for date:', date);

    const { data, error } = await supabase
      .schema('api')
      .from('appointments')
      .select(`
        *,
        patients:patient_id (
          first_name,
          last_name
        ),
        dentists:dentist_id (
          full_name,
          specialty
        ),
        assistants:assistant_id (
          full_name
        )
      `)
      .eq('scheduled_date', date)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching appointments by date:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched appointments for date:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching appointments by date:', error);
    return [];
  }
}

export async function getDentistAppointments(dentistId: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching appointments for dentist:', dentistId);

    let query = supabase
      .schema('api')
      .from('appointments')
      .select('*')
      .eq('dentist_id', dentistId);

    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching dentist appointments:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched dentist appointments:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching dentist appointments:', error);
    return [];
  }
}

export async function getAvailableDentists(): Promise<Dentist[]> {
  const supabase = await createServiceClient();

  try {
    console.log('🔍 [DB] Fetching available dentists...');

    const { data, error } = await supabase
      .schema('api')
      .from('dentists')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('❌ [DB] Error fetching available dentists:', error);
      return [];
    }

    console.log('✅ [DB] Successfully fetched available dentists:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [DB] Exception fetching available dentists:', error);
    return [];
  }
}
