'use server'

import { createServiceClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Consultation, NewConsultation, ToothDiagnosis, NewToothDiagnosis, VoiceSession, NewVoiceSession } from '@/lib/db/schema'

interface ConsultationFormData {
  patientId: string
  dentistId: string

  // Pain Assessment
  chiefComplaint?: string
  painAssessment?: any

  // Medical History
  medicalHistory?: any

  // Clinical Examination
  clinicalExamination?: any

  // Investigations
  investigations?: any

  // Diagnosis
  diagnosis?: any

  // Treatment Plan
  treatmentPlan?: any

  // Other fields
  prognosis?: string
  prescriptionData?: any
  followUpData?: any
  additionalNotes?: string
  status?: 'draft' | 'completed' | 'archived'
}

export async function createConsultationAction(formData: ConsultationFormData) {
  try {
    const supabase = await createServiceClient()

    // Get current user (dentist)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Authentication required' }
    }

    console.log(`🏥 [CONSULTATION] Creating new consultation for patient: ${formData.patientId}`)

    const consultationData: any = {
      patient_id: formData.patientId,
      dentist_id: formData.dentistId || user.id,
      consultation_date: new Date().toISOString(),
      status: formData.status || 'draft',
      chief_complaint: formData.chiefComplaint,
      pain_assessment: formData.painAssessment ? JSON.stringify(formData.painAssessment) : null,
      medical_history: formData.medicalHistory ? JSON.stringify(formData.medicalHistory) : null,
      clinical_examination: formData.clinicalExamination ? JSON.stringify(formData.clinicalExamination) : null,
      investigations: formData.investigations ? JSON.stringify(formData.investigations) : null,
      diagnosis: formData.diagnosis ? JSON.stringify(formData.diagnosis) : null,
      treatment_plan: formData.treatmentPlan ? JSON.stringify(formData.treatmentPlan) : null,
      prognosis: formData.prognosis,
      prescription_data: formData.prescriptionData ? JSON.stringify(formData.prescriptionData) : null,
      follow_up_data: formData.followUpData ? JSON.stringify(formData.followUpData) : null,
      additional_notes: formData.additionalNotes,
      voice_session_active: false
    }

    const { data, error } = await supabase
      .schema('api')
      .from('consultations')
      .insert(consultationData)
      .select()
      .single()

    if (error) {
      console.error('❌ [CONSULTATION] Database error:', error)
      return { error: `Failed to create consultation: ${error.message}` }
    }

    console.log(`✅ [CONSULTATION] Created successfully with ID: ${data.id}`)

    // Revalidate relevant pages
    revalidatePath('/dentist')
    revalidatePath('/patient')
    revalidatePath('/assistant')

    return { data, success: true }

  } catch (error) {
    console.error('❌ [CONSULTATION] Unexpected error:', error)
    return { error: 'Failed to create consultation' }
  }
}

export async function updateConsultationAction(consultationId: string, updateData: Partial<ConsultationFormData>) {
  try {
    const supabase = await createServiceClient()

    console.log(`🔄 [CONSULTATION] Updating consultation: ${consultationId}`)

    const consultationUpdate: any = {
      updated_at: new Date().toISOString()
    }

    // Map form data to database fields
    if (updateData.chiefComplaint !== undefined) consultationUpdate.chief_complaint = updateData.chiefComplaint
    if (updateData.painAssessment !== undefined) consultationUpdate.pain_assessment = JSON.stringify(updateData.painAssessment)
    if (updateData.medicalHistory !== undefined) consultationUpdate.medical_history = JSON.stringify(updateData.medicalHistory)
    if (updateData.clinicalExamination !== undefined) consultationUpdate.clinical_examination = JSON.stringify(updateData.clinicalExamination)
    if (updateData.investigations !== undefined) consultationUpdate.investigations = JSON.stringify(updateData.investigations)
    if (updateData.diagnosis !== undefined) consultationUpdate.diagnosis = JSON.stringify(updateData.diagnosis)
    if (updateData.treatmentPlan !== undefined) consultationUpdate.treatment_plan = JSON.stringify(updateData.treatmentPlan)
    if (updateData.prognosis !== undefined) consultationUpdate.prognosis = updateData.prognosis
    if (updateData.prescriptionData !== undefined) consultationUpdate.prescription_data = JSON.stringify(updateData.prescriptionData)
    if (updateData.followUpData !== undefined) consultationUpdate.follow_up_data = JSON.stringify(updateData.followUpData)
    if (updateData.additionalNotes !== undefined) consultationUpdate.additional_notes = updateData.additionalNotes
    if (updateData.status !== undefined) consultationUpdate.status = updateData.status

    const { data, error } = await supabase
      .schema('api')
      .from('consultations')
      .update(consultationUpdate)
      .eq('id', consultationId)
      .select()
      .single()

    if (error) {
      console.error('❌ [CONSULTATION] Update error:', error)
      return { error: `Failed to update consultation: ${error.message}` }
    }

    console.log(`✅ [CONSULTATION] Updated successfully`)

    // Revalidate relevant pages
    revalidatePath('/dentist')
    revalidatePath('/patient')
    revalidatePath('/assistant')

    return { data, success: true }

  } catch (error) {
    console.error('❌ [CONSULTATION] Update error:', error)
    return { error: 'Failed to update consultation' }
  }
}

export async function getConsultationsAction(patientId?: string, dentistId?: string) {
  try {
    // Use service client to bypass RLS policy issues
    const supabase = await createServiceClient()

    let query = supabase
      .schema('api')
      .from('consultations')
      .select('*')
      .order('consultation_date', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (dentistId) {
      query = query.eq('dentist_id', dentistId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [CONSULTATION] Get consultations error:', error)
      return { error: `Failed to fetch consultations: ${error.message}` }
    }

    return { data: data || [], success: true }

  } catch (error) {
    console.error('❌ [CONSULTATION] Get consultations error:', error)
    return { error: 'Failed to fetch consultations' }
  }
}

export async function getConsultationByIdAction(consultationId: string) {
  try {
    // Use service client to bypass RLS policy issues
    const supabase = await createServiceClient()

    // Get consultation data
    const { data: consultation, error: consultationError } = await supabase
      .schema('api')
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single()

    if (consultationError) {
      console.error('❌ [CONSULTATION] Get consultation error:', consultationError)
      return { error: `Failed to fetch consultation: ${consultationError.message}` }
    }

    // Get tooth diagnoses separately
    const { data: toothDiagnoses, error: toothError } = await supabase
      .schema('api')
      .from('tooth_diagnoses')
      .select('*')
      .eq('consultation_id', consultationId)

    if (toothError) {
      console.error('❌ [CONSULTATION] Get tooth diagnoses error:', toothError)
      // Don't fail the whole operation, just log the error
      consultation.tooth_diagnoses = []
    } else {
      consultation.tooth_diagnoses = toothDiagnoses || []
    }

    return { data: consultation, success: true }

  } catch (error) {
    console.error('❌ [CONSULTATION] Get consultation error:', error)
    return { error: 'Failed to fetch consultation' }
  }
}

// Voice Session Management
export async function startVoiceSessionAction(consultationId: string, sectionId: string) {
  try {
    const supabase = await createServiceClient()

    // Get current user (dentist)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Authentication required' }
    }

    console.log(`🎤 [VOICE] Starting voice session for consultation: ${consultationId}, section: ${sectionId}`)

    // End any existing active session for this consultation
    await supabase
      .schema('api')
      .from('voice_sessions')
      .update({
        status: 'completed',
        session_end: new Date().toISOString()
      })
      .eq('consultation_id', consultationId)
      .eq('status', 'active')

    // Create new voice session
    const sessionData = {
      consultation_id: consultationId,
      dentist_id: user.id,
      session_start: new Date().toISOString(),
      status: 'active',
      transcript: JSON.stringify([]),
      processed_data: JSON.stringify({
        section_id: sectionId,
        pain_assessment: {},
        clinical_examination: {},
        investigations: {},
        diagnosis: {},
        treatment_plan: {}
      })
    }

    const { data, error } = await supabase
      .schema('api')
      .from('voice_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('❌ [VOICE] Session creation error:', error)
      return { error: `Failed to start voice session: ${error.message}` }
    }

    // Update consultation to mark voice session as active
    await supabase
      .schema('api')
      .from('consultations')
      .update({ voice_session_active: true })
      .eq('id', consultationId)

    console.log(`✅ [VOICE] Session started with ID: ${data.id}`)

    return { data, success: true }

  } catch (error) {
    console.error('❌ [VOICE] Start session error:', error)
    return { error: 'Failed to start voice session' }
  }
}

export async function stopVoiceSessionAction(sessionId: string, transcript?: string) {
  try {
    const supabase = await createServiceClient()

    console.log(`🛑 [VOICE] Stopping voice session: ${sessionId}`)

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .schema('api')
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'active')
      .single()

    if (sessionError || !session) {
      return { error: 'Voice session not found or already stopped' }
    }

    const endTime = new Date()
    const startTime = new Date(session.session_start)
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    // Update session with transcript and end time
    const updateData: any = {
      session_end: endTime.toISOString(),
      duration_seconds: durationSeconds,
      status: 'processing'
    }

    if (transcript) {
      updateData.transcript = JSON.stringify([{ text: transcript, timestamp: endTime.toISOString() }])
    }

    const { data, error } = await supabase
      .schema('api')
      .from('voice_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('❌ [VOICE] Stop session error:', error)
      return { error: `Failed to stop voice session: ${error.message}` }
    }

    // Update consultation to mark voice session as inactive
    await supabase
      .schema('api')
      .from('consultations')
      .update({ voice_session_active: false })
      .eq('id', session.consultation_id)

    console.log(`✅ [VOICE] Session stopped successfully`)

    // TODO: Send to N8N for AI processing
    // This would trigger the N8N webhook with the transcript

    return { data, success: true }

  } catch (error) {
    console.error('❌ [VOICE] Stop session error:', error)
    return { error: 'Failed to stop voice session' }
  }
}

// Tooth Diagnosis Management
export async function saveToothDiagnosisAction(toothData: {
  consultationId: string
  patientId: string
  toothNumber: string
  status: string
  diagnosis?: string
  treatment?: string
  priority?: string
  colorCode?: string
  notes?: string
}) {
  try {
    const supabase = await createServiceClient()

    console.log(`🦷 [TOOTH] Saving diagnosis for tooth: ${toothData.toothNumber}`)

    const diagnosisData = {
      consultation_id: toothData.consultationId,
      patient_id: toothData.patientId,
      tooth_number: toothData.toothNumber,
      status: toothData.status,
      primary_diagnosis: toothData.diagnosis,
      recommended_treatment: toothData.treatment,
      treatment_priority: toothData.priority || 'medium',
      color_code: toothData.colorCode || '#22c55e',
      notes: toothData.notes,
      examination_date: new Date().toISOString().split('T')[0]
    }

    // Upsert tooth diagnosis (insert or update if exists)
    const { data, error } = await supabase
      .schema('api')
      .from('tooth_diagnoses')
      .upsert(diagnosisData, {
        onConflict: 'consultation_id,tooth_number'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [TOOTH] Save diagnosis error:', error)
      return { error: `Failed to save tooth diagnosis: ${error.message}` }
    }

    console.log(`✅ [TOOTH] Diagnosis saved successfully`)

    return { data, success: true }

  } catch (error) {
    console.error('❌ [TOOTH] Save diagnosis error:', error)
    return { error: 'Failed to save tooth diagnosis' }
  }
}

export async function getToothDiagnosesAction(consultationId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .schema('api')
      .from('tooth_diagnoses')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('tooth_number')

    if (error) {
      console.error('❌ [TOOTH] Get diagnoses error:', error)
      return { error: `Failed to fetch tooth diagnoses: ${error.message}` }
    }

    return { data: data || [], success: true }

  } catch (error) {
    console.error('❌ [TOOTH] Get diagnoses error:', error)
    return { error: 'Failed to fetch tooth diagnoses' }
  }
}

// Comprehensive consultation save action for enhanced new consultation
export async function saveCompleteConsultationAction(formData: {
  patientId: string
  dentistId?: string
  consultationData: any // All the consultation form data
  toothData: { [toothNumber: string]: any } // Tooth-specific data from the chart
  status?: 'draft' | 'completed' | 'archived'
}) {
  try {
    // Try regular client first to get user, fallback to service client if needed
    let dentistId = formData.dentistId
    
    if (!dentistId) {
      // Try to get current user from regular client
      const regularClient = await createClient()
      const { data: { user } } = await regularClient.auth.getUser()
      
      if (user) {
        dentistId = user.id
      } else {
        return { error: 'Authentication required - please log in' }
      }
    }

    const supabase = await createServiceClient()

    console.log(`🏥 [COMPLETE CONSULTATION] Saving consultation for patient: ${formData.patientId}`)
    console.log(`🦷 [COMPLETE CONSULTATION] Tooth data for ${Object.keys(formData.toothData).length} teeth`)

    // Step 1: Create or update consultation record
    const consultationRecord = {
      patient_id: formData.patientId,
      dentist_id: dentistId,
      consultation_date: new Date().toISOString(),
      status: formData.status || 'completed',
      chief_complaint: formData.consultationData.chiefComplaint,
      pain_assessment: JSON.stringify({
        intensity: formData.consultationData.painIntensity,
        location: formData.consultationData.painLocation,
        duration: formData.consultationData.painDuration,
        character: formData.consultationData.painCharacter,
        triggers: formData.consultationData.painTriggers,
        relief: formData.consultationData.painRelief
      }),
      medical_history: JSON.stringify({
        conditions: formData.consultationData.medicalHistory,
        medications: formData.consultationData.currentMedications,
        allergies: formData.consultationData.allergies,
        previous_treatments: formData.consultationData.previousDentalTreatments
      }),
      clinical_examination: JSON.stringify({
        extraoral: formData.consultationData.extraoralFindings,
        intraoral: formData.consultationData.intraoralFindings,
        periodontal: formData.consultationData.periodontalStatus,
        occlusion: formData.consultationData.occlusionNotes
      }),
      investigations: JSON.stringify({
        radiographic: formData.consultationData.radiographicFindings,
        vitality: formData.consultationData.vitalityTests,
        percussion: formData.consultationData.percussionTests,
        palpation: formData.consultationData.palpationFindings
      }),
      diagnosis: JSON.stringify({
        provisional: formData.consultationData.provisionalDiagnosis,
        differential: formData.consultationData.differentialDiagnosis,
        final: formData.consultationData.finalDiagnosis
      }),
      treatment_plan: JSON.stringify({
        plan: formData.consultationData.treatmentPlan,
        prognosis: formData.consultationData.prognosis
      }),
      prescription_data: JSON.stringify(formData.consultationData.prescriptions || []),
      follow_up_data: JSON.stringify(formData.consultationData.followUpPlans || []),
      additional_notes: formData.consultationData.additionalNotes,
      voice_session_active: false
    }

    const { data: consultationResult, error: consultationError } = await supabase
      .schema('api')
      .from('consultations')
      .insert(consultationRecord)
      .select()
      .single()

    if (consultationError) {
      console.error('❌ [COMPLETE CONSULTATION] Consultation creation error:', consultationError)
      return { error: `Failed to create consultation: ${consultationError.message}` }
    }

    console.log(`✅ [COMPLETE CONSULTATION] Consultation created with ID: ${consultationResult.id}`)

    // Step 2: Save tooth diagnoses
    const toothRecords = []
    for (const [toothNumber, toothInfo] of Object.entries(formData.toothData)) {
      if (toothInfo && (toothInfo.selectedDiagnoses?.length > 0 || toothInfo.selectedTreatments?.length > 0)) {
        const toothRecord = {
          consultation_id: consultationResult.id,
          patient_id: formData.patientId,
          tooth_number: toothNumber,
          status: toothInfo.currentStatus || 'healthy',
          primary_diagnosis: toothInfo.selectedDiagnoses?.join(', ') || null,
          diagnosis_details: toothInfo.diagnosisDetails || null,
          symptoms: null, // Skip symptoms for now due to database type mismatch
          recommended_treatment: toothInfo.selectedTreatments?.join(', ') || null,
          treatment_priority: toothInfo.priority || 'medium',
          treatment_details: toothInfo.treatmentDetails || null,
          estimated_duration: parseInt(toothInfo.duration) || null,
          estimated_cost: toothInfo.estimatedCost || null,
          scheduled_date: toothInfo.scheduledDate || null,
          follow_up_required: toothInfo.followUpRequired || false,
          examination_date: toothInfo.examinationDate || new Date().toISOString().split('T')[0],
          notes: toothInfo.treatmentNotes || toothInfo.diagnosticNotes || null,
          color_code: toothInfo.currentStatus === 'caries' ? '#ef4444' :
                     toothInfo.currentStatus === 'filled' ? '#3b82f6' :
                     toothInfo.currentStatus === 'missing' ? '#6b7280' :
                     '#22c55e' // healthy default
        }
        toothRecords.push(toothRecord)
      }
    }

    // Batch insert tooth diagnoses
    if (toothRecords.length > 0) {
      const { data: toothResult, error: toothError } = await supabase
        .schema('api')
        .from('tooth_diagnoses')
        .insert(toothRecords)
        .select()

      if (toothError) {
        console.error('❌ [COMPLETE CONSULTATION] Tooth diagnoses error:', toothError)
        // Don't fail the whole operation, just log the error
        console.log('⚠️ [COMPLETE CONSULTATION] Continuing despite tooth diagnoses error')
      } else {
        console.log(`✅ [COMPLETE CONSULTATION] Saved ${toothResult.length} tooth diagnoses`)
      }
    }

    // Revalidate relevant pages
    revalidatePath('/dentist')
    revalidatePath('/patient')
    revalidatePath('/assistant')

    return {
      data: {
        consultation: consultationResult,
        toothCount: toothRecords.length
      },
      success: true
    }

  } catch (error) {
    console.error('❌ [COMPLETE CONSULTATION] Unexpected error:', error)
    return { error: 'Failed to save consultation' }
  }
}

// Load consultation data for enhanced consultation component
export async function loadPatientConsultationAction(patientId: string, consultationId?: string) {
  try {
    const supabase = await createClient()

    console.log(`🔍 [LOAD CONSULTATION] Loading consultation data for patient: ${patientId}`)

    let consultationData

    if (consultationId) {
      // Load specific consultation
      const result = await getConsultationByIdAction(consultationId)
      if (result.error) return result
      consultationData = result.data
    } else {
      // Load latest consultation for patient
      const result = await getConsultationsAction(patientId)
      if (result.error) return result

      const consultations = result.data
      if (!consultations || consultations.length === 0) {
        return { data: null, success: true } // No previous consultations
      }

      consultationData = consultations[0] // Most recent
    }

    console.log(`✅ [LOAD CONSULTATION] Found consultation: ${consultationData.id}`)

    // Convert database format back to enhanced consultation format
    const formattedConsultationData = {
      patientId: consultationData.patient_id,
      chiefComplaint: consultationData.chief_complaint || '',
      painLocation: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).location || '' : '',
      painIntensity: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).intensity || 0 : 0,
      painDuration: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).duration || '' : '',
      painCharacter: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).character || '' : '',
      painTriggers: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).triggers || [] : [],
      painRelief: consultationData.pain_assessment ? JSON.parse(consultationData.pain_assessment).relief || [] : [],

      medicalHistory: consultationData.medical_history ? JSON.parse(consultationData.medical_history).conditions || [] : [],
      currentMedications: consultationData.medical_history ? JSON.parse(consultationData.medical_history).medications || [] : [],
      allergies: consultationData.medical_history ? JSON.parse(consultationData.medical_history).allergies || [] : [],
      previousDentalTreatments: consultationData.medical_history ? JSON.parse(consultationData.medical_history).previous_treatments || [] : [],

      extraoralFindings: consultationData.clinical_examination ? JSON.parse(consultationData.clinical_examination).extraoral || '' : '',
      intraoralFindings: consultationData.clinical_examination ? JSON.parse(consultationData.clinical_examination).intraoral || '' : '',
      periodontalStatus: consultationData.clinical_examination ? JSON.parse(consultationData.clinical_examination).periodontal || '' : '',
      occlusionNotes: consultationData.clinical_examination ? JSON.parse(consultationData.clinical_examination).occlusion || '' : '',

      radiographicFindings: consultationData.investigations ? JSON.parse(consultationData.investigations).radiographic || '' : '',
      vitalityTests: consultationData.investigations ? JSON.parse(consultationData.investigations).vitality || '' : '',
      percussionTests: consultationData.investigations ? JSON.parse(consultationData.investigations).percussion || '' : '',
      palpationFindings: consultationData.investigations ? JSON.parse(consultationData.investigations).palpation || '' : '',

      provisionalDiagnosis: consultationData.diagnosis ? JSON.parse(consultationData.diagnosis).provisional || [] : [],
      differentialDiagnosis: consultationData.diagnosis ? JSON.parse(consultationData.diagnosis).differential || [] : [],
      finalDiagnosis: consultationData.diagnosis ? JSON.parse(consultationData.diagnosis).final || [] : [],

      treatmentPlan: consultationData.treatment_plan ? JSON.parse(consultationData.treatment_plan).plan || [] : [],
      prognosis: consultationData.treatment_plan ? JSON.parse(consultationData.treatment_plan).prognosis || '' : '',

      prescriptions: consultationData.prescription_data ? JSON.parse(consultationData.prescription_data) || [] : [],
      followUpPlans: consultationData.follow_up_data ? JSON.parse(consultationData.follow_up_data) || [] : [],
      additionalNotes: consultationData.additional_notes || ''
    }

    // Convert tooth diagnoses to toothData format
    const toothData: { [key: string]: any } = {}

    if (consultationData.tooth_diagnoses && consultationData.tooth_diagnoses.length > 0) {
      for (const toothDiagnosis of consultationData.tooth_diagnoses) {
        const toothNumber = toothDiagnosis.tooth_number

        toothData[toothNumber] = {
          currentStatus: toothDiagnosis.status || 'healthy',
          selectedDiagnoses: toothDiagnosis.primary_diagnosis ? toothDiagnosis.primary_diagnosis.split(', ') : [],
          selectedTreatments: toothDiagnosis.recommended_treatment ? toothDiagnosis.recommended_treatment.split(', ') : [],
          diagnosisDetails: toothDiagnosis.diagnosis_details,
          symptoms: toothDiagnosis.symptoms ? toothDiagnosis.symptoms.split(', ').filter(s => s.trim()) : [],
          treatmentDetails: toothDiagnosis.treatment_details,
          priority: toothDiagnosis.treatment_priority || 'medium',
          duration: toothDiagnosis.estimated_duration?.toString() || '',
          estimatedCost: toothDiagnosis.estimated_cost,
          scheduledDate: toothDiagnosis.scheduled_date,
          followUpRequired: toothDiagnosis.follow_up_required || false,
          examinationDate: toothDiagnosis.examination_date,
          treatmentNotes: toothDiagnosis.notes,
          diagnosticNotes: toothDiagnosis.notes
        }
      }
    }

    console.log(`✅ [LOAD CONSULTATION] Loaded ${Object.keys(toothData).length} tooth records`)

    return {
      data: {
        consultation: consultationData,
        consultationData: formattedConsultationData,
        toothData: toothData
      },
      success: true
    }

  } catch (error) {
    console.error('❌ [LOAD CONSULTATION] Unexpected error:', error)
    return { error: 'Failed to load consultation data' }
  }
}

// Create appointment request from consultation
export async function createAppointmentRequestFromConsultationAction(formData: {
  consultationId: string
  patientId: string
  dentistId?: string
  appointmentType: string
  reasonForVisit: string
  urgencyLevel: 'routine' | 'urgent' | 'emergency'
  delegateToAssistant?: boolean
  requestedDate?: string
  requestedTime?: string
  additionalNotes?: string
}) {
  try {
    console.log('🔍 [DEBUG] Appointment request input data:', {
      consultationId: formData.consultationId,
      patientId: formData.patientId,
      appointmentType: formData.appointmentType,
      urgencyLevel: formData.urgencyLevel,
      delegateToAssistant: formData.delegateToAssistant
    })

    // Get current user (dentist) if not provided
    let dentistId = formData.dentistId
    if (!dentistId) {
      // Try to get current user from regular client first
      const regularClient = await createClient()
      const { data: { user }, error: userError } = await regularClient.auth.getUser()

      if (user) {
        dentistId = user.id
        console.log(`🔐 [AUTH] Using authenticated user: ${dentistId}`)
      } else {
        // Fallback: Use the first available dentist ID (server actions don't have auth context)
        console.log('🔍 [FALLBACK] No auth context, using fallback dentist lookup')
        const supabase = await createServiceClient()
        const { data: dentists, error: dentistError } = await supabase
          .schema('api')
          .from('dentists')
          .select('id')
          .limit(1)

        if (dentistError || !dentists || dentists.length === 0) {
          console.error('❌ [FALLBACK] No dentists found:', dentistError?.message)
          return { error: 'Unable to identify dentist. Please contact support.' }
        }

        dentistId = dentists[0].id
        console.log(`🔄 [FALLBACK] Using fallback dentist: ${dentistId}`)
      }
    }

    const supabase = await createServiceClient()

    console.log(`🏥 [CONSULTATION TO APPOINTMENT] Creating appointment request from consultation: ${formData.consultationId}`)

    // Create appointment request
    const appointmentRequestData = {
      patient_id: formData.patientId,
      appointment_type: formData.appointmentType,
      preferred_date: formData.requestedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
      preferred_time: formData.requestedTime || '09:00:00',
      reason_for_visit: formData.reasonForVisit,
      pain_level: formData.urgencyLevel === 'emergency' ? 8 : formData.urgencyLevel === 'urgent' ? 5 : 2,
      additional_notes: formData.additionalNotes || '',
      status: 'pending',
      notification_sent: false,
      assigned_to: null // Always null - assistants can pick up delegated tasks, dentists handle direct scheduling
    }

    const { data: appointmentRequest, error: requestError } = await supabase
      .schema('api')
      .from('appointment_requests')
      .insert([appointmentRequestData])
      .select()
      .single()

    if (requestError) {
      console.error('❌ [APPOINTMENT REQUEST] Database error:', requestError)
      console.error('❌ [APPOINTMENT REQUEST] Failed data:', appointmentRequestData)
      return {
        error: `Failed to create appointment request: ${requestError.message}`,
        details: requestError
      }
    }

    // Create notification for assigned person (dentist or any assistant if delegated)
    if (formData.delegateToAssistant) {
      // Create task for assistants
      const { data: assistants } = await supabase
        .schema('api')
        .from('assistants')
        .select('id')
        .limit(1)

      if (assistants && assistants.length > 0) {
        // Create task for first available assistant (could be enhanced to smart assignment)
        await supabase
          .schema('api')
          .from('tasks')
          .insert([{
            title: `Schedule Appointment: ${formData.appointmentType}`,
            description: `Patient needs follow-up appointment. Consultation ID: ${formData.consultationId}. Reason: ${formData.reasonForVisit}`,
            priority: formData.urgencyLevel === 'emergency' ? 'high' : formData.urgencyLevel === 'urgent' ? 'medium' : 'low',
            assigned_to: assistants[0].id,
            category: 'appointment_scheduling',
            related_patient_id: formData.patientId,
            related_appointment_request_id: appointmentRequest.id,
            status: 'pending',
            created_by: dentistId,
            created_at: new Date().toISOString()
          }])

        // Create notification for assistant
        await supabase
          .schema('api')
          .from('notifications')
          .insert([{
            user_id: assistants[0].id,
            type: 'task_assigned',
            title: 'New Appointment Scheduling Task',
            message: `Dr. has requested you to schedule a ${formData.appointmentType} appointment for a patient following consultation.`,
            related_id: appointmentRequest.id,
            read: false,
            created_at: new Date().toISOString()
          }])
      }
    } else {
      // Create notification for dentist to handle directly
      await supabase
        .schema('api')
        .from('notifications')
        .insert([{
          user_id: dentistId,
          type: 'appointment_request',
          title: 'Follow-up Appointment Request Created',
          message: `Appointment request created from consultation for ${formData.appointmentType}.`,
          related_id: appointmentRequest.id,
          read: false,
          created_at: new Date().toISOString()
        }])
    }

    // Update consultation with appointment request link
    await supabase
      .schema('api')
      .from('consultations')
      .update({
        follow_up_appointment_id: appointmentRequest.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.consultationId)

    // Revalidate relevant pages
    revalidatePath('/dentist')
    revalidatePath('/assistant')
    revalidatePath('/assistant/verify')

    console.log(`✅ [CONSULTATION TO APPOINTMENT] Successfully created appointment request: ${appointmentRequest.id}`)

    return {
      success: true,
      data: appointmentRequest,
      message: formData.delegateToAssistant ?
        'Appointment request created and assigned to assistant' :
        'Appointment request created for your review'
    }

  } catch (error) {
    console.error('❌ [CONSULTATION TO APPOINTMENT] Unexpected error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to create appointment request'
    }
  }
}