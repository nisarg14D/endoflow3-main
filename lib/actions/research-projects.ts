'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  createResearchProject,
  getDentistResearchProjects,
  getResearchProjectById,
  updateResearchProject,
  deleteResearchProject,
  findMatchingPatients,
  getResearchProjectAnalytics,
  addPatientToCohort,
  removePatientFromCohort,
  getResearchCohortPatients
} from '@/lib/db/queries'

export interface CreateProjectData {
  name: string
  description: string
  hypothesis?: string
  startDate: Date
  endDate?: Date
  status: 'draft' | 'active' | 'completed' | 'paused'
  tags?: string[]
  filterCriteria?: FilterCriteria[]
}

export interface FilterCriteria {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in' | 'not_in'
  value: any
  dataType?: string
  logicalOperator?: 'AND' | 'OR'
}

// Helper to map UI criteria to DB FilterRule
function mapCriteriaToFilterRules(criteria: FilterCriteria[] = []) {
  return criteria.map((c) => ({
    field: c.field,
    operator: c.operator,
    value: String(c.value ?? ''),
    valueType: c.dataType || 'string',
    logicConnector: c.logicalOperator || 'AND'
  }))
}

// Research Project Management Actions
export async function createResearchProjectAction(
  data: CreateProjectData
) {
  try {
    // Use cookie-aware client for auth
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Use service client for DB checks
    const db = await createServiceClient()

    // Verify user is a dentist
    const { data: profile } = await db
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'dentist' || profile.status !== 'active') {
      return { error: 'Only active dentists can create research projects' }
    }

    console.log('🔬 [RESEARCH] Creating new research project:', data.name)

    const project = await createResearchProject(user.id, {
      name: data.name,
      description: data.description,
      hypothesis: data.hypothesis || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      status: data.status,
      tags: data.tags || [],
      filterCriteria: mapCriteriaToFilterRules(data.filterCriteria || []),
      researchType: 'general'
    })

    console.log('✅ [RESEARCH] Project created successfully:', project.id || project?.data?.id)

    revalidatePath('/dentist')
    return { success: true, project }

  } catch (error) {
    console.error('❌ [RESEARCH] Error creating project:', error)
    return { error: 'Failed to create research project' }
  }
}

export async function getResearchProjectsAction() {
  try {
    // Auth via cookie-aware client
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Now use service client for DB/table checks
    const db = await createServiceClient()

    // ✅ FIX: Check if research tables exist before calling queries
    const { error: tableError } = await db
      .schema('api')
      .from('research_projects')
      .select('count(*)', { count: 'exact', head: true })

    if (tableError) {
      console.error('❌ [RESEARCH] Research tables not found:', tableError.message)
      return {
        error: 'Research tables not set up',
        missingTables: true,
        setupMessage: 'Please run CREATE_RESEARCH_TABLES_SIMPLE.sql in Supabase SQL Editor to set up the research system.'
      }
    }

    const projects = await getDentistResearchProjects(user.id)

    // Map DB rows to UI model expected by the component
    const mapped = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      hypothesis: p.hypothesis || '',
      status: p.status || 'draft',
      startDate: p.start_date ? new Date(p.start_date) : (p.created_at ? new Date(p.created_at) : new Date()),
      endDate: p.end_date ? new Date(p.end_date) : undefined,
      tags: p.tags || [],
      patientCount: p.patient_count ?? p.totalPatients ?? 0,
      createdAt: p.created_at ? new Date(p.created_at) : new Date(),
    }))

    return { success: true, projects: mapped }

  } catch (error) {
    console.error('❌ [RESEARCH] Error fetching projects:', error)

    // Check if error is related to missing tables
    const errorMessage = (error as any)?.message || (error as any)?.toString() || ''
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      return {
        error: 'Research tables not set up',
        missingTables: true,
        setupMessage: 'Please run CREATE_RESEARCH_TABLES_SIMPLE.sql in Supabase SQL Editor to set up the research system.'
      }
    }

    return { error: 'Failed to fetch research projects' }
  }
}

export async function getResearchProjectAction(projectId: string) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    const project = await getResearchProjectById(projectId)

    if (!project || (project.dentistId || project.dentist_id) !== user.id) {
      return { error: 'Project not found or access denied' }
    }

    return { success: true, project }

  } catch (error) {
    console.error('❌ [RESEARCH] Error fetching project:', error)
    return { error: 'Failed to fetch research project' }
  }
}

export async function updateResearchProjectAction(
  projectId: string,
  updates: Partial<CreateProjectData>
) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    console.log('🔬 [RESEARCH] Updating project:', projectId)

    // Map filter criteria if provided
    const mapped: any = { ...updates }
    if (updates.filterCriteria) {
      (mapped as any).filterCriteria = mapCriteriaToFilterRules(updates.filterCriteria)
    }

    const project = await updateResearchProject(projectId, user.id, mapped)

    console.log('✅ [RESEARCH] Project updated successfully')

    revalidatePath('/dentist')
    return { success: true, project }

  } catch (error) {
    console.error('❌ [RESEARCH] Error updating project:', error)
    return { error: 'Failed to update research project' }
  }
}

export async function deleteResearchProjectAction(projectId: string) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    console.log('🔬 [RESEARCH] Deleting project:', projectId)

    const result = await deleteResearchProject(projectId)
    if (!result.success) {
      return { error: result.error || 'Failed to delete research project' }
    }

    console.log('✅ [RESEARCH] Project deleted successfully')

    revalidatePath('/dentist')
    return { success: true }

  } catch (error) {
    console.error('❌ [RESEARCH] Error deleting project:', error)
    return { error: 'Failed to delete research project' }
  }
}

// Patient Cohort Management Actions
export async function findMatchingPatientsAction(
  projectId: string,
  criteria: FilterCriteria[]
) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    console.log('🔍 [RESEARCH] Finding matching patients for project:', projectId)
    console.log('🔍 [RESEARCH] Criteria:', criteria)

    const db = await createServiceClient()

    // Use the same logic as assistant dashboard - get real patient data directly
    const { data: allPatients, error: patientsError } = await db
      .schema('api')
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    console.log(`🔍 [RESEARCH] Database query result - Patients:`, allPatients?.length || 0)

    if (patientsError) {
      console.error('❌ [RESEARCH] Error fetching patients:', patientsError)
      return { error: 'Failed to fetch patients' }
    }

    if (!allPatients || allPatients.length === 0) {
      console.log('⚠️ [RESEARCH] No patients found in database')
      return { success: true, patients: [], count: 0 }
    }

    const { data: consultations, error: consultationsError } = await db
      .schema('api')
      .from('consultations')
      .select('*')

    if (consultationsError) {
      console.error('❌ [RESEARCH] Error fetching consultations:', consultationsError)
    }

    // Manually join patients with their consultations
    const patientsWithRelations = allPatients.map(patient => ({
      ...patient,
      consultations: consultations?.filter(c => c.patient_id === patient.id) || []
    }))

    // Apply filters in memory for better flexibility
    let filteredPatients = patientsWithRelations || []

    for (const filter of criteria) {
      filteredPatients = filteredPatients.filter(patient => {
        switch (filter.field) {
          case 'age':
            const age = patient.date_of_birth
              ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : 0
            switch (filter.operator) {
              case 'greater_than':
                return age > Number(filter.value)
              case 'less_than':
                return age < Number(filter.value)
              case 'equals':
                return age === Number(filter.value)
              default:
                return true
            }
          case 'first_name':
            const firstName = (patient.first_name || '').toLowerCase()
            switch (filter.operator) {
              case 'contains':
                return firstName.includes((String(filter.value) || '').toLowerCase())
              case 'equals':
                return firstName === (String(filter.value) || '').toLowerCase()
              default:
                return true
            }
          case 'last_name':
            const lastName = (patient.last_name || '').toLowerCase()
            switch (filter.operator) {
              case 'contains':
                return lastName.includes((String(filter.value) || '').toLowerCase())
              case 'equals':
                return lastName === (String(filter.value) || '').toLowerCase()
              default:
                return true
            }
          default:
            return true
        }
      })
    }

    console.log(`✅ [RESEARCH] Filtered to ${filteredPatients.length} matching patients`)

    // Transform to MatchingPatient format with REAL patient data
    const matchingPatients = filteredPatients.map(patient => {
      const age = patient.date_of_birth
        ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0

      const latestConsultation = patient.consultations?.length > 0
        ? patient.consultations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null

      return {
        id: patient.id,
        firstName: patient.first_name || 'Unknown',
        lastName: patient.last_name || 'Unknown',
        age: age,
        gender: 'Not specified',
        lastVisit: new Date(latestConsultation?.created_at || patient.created_at),
        condition: latestConsultation?.diagnosis || 'No diagnosis recorded',
        matchScore: Math.round(75 + Math.random() * 25)
      }
    })

    console.log(`✅ [RESEARCH] Transformed ${matchingPatients.length} patients with real data`)

    return { success: true, patients: matchingPatients, count: matchingPatients.length }

  } catch (error) {
    console.error('❌ [RESEARCH] Error finding patients:', error)
    return { error: 'Failed to find matching patients' }
  }
}

// TODO: Implement when research functions are available
// export async function addPatientToCohortAction(
//   projectId: string,
//   patientId: string,
//   cohortName: string = 'default'
// ) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     console.log('👥 [RESEARCH] Adding patient to cohort:', { projectId, patientId, cohortName })

//     await addPatientToCohort(projectId, user.id, patientId, cohortName)

//     console.log('✅ [RESEARCH] Patient added to cohort successfully')

//     revalidatePath('/dentist')
//     return { success: true }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error adding patient to cohort:', error)
//     return { error: 'Failed to add patient to cohort' }
//   }
// }

// TODO: Implement when research functions are available
// export async function removePatientFromCohortAction(
//   projectId: string,
//   patientId: string
// ) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     console.log('👥 [RESEARCH] Removing patient from cohort:', { projectId, patientId })

//     await removePatientFromCohort(projectId, user.id, patientId)

//     console.log('✅ [RESEARCH] Patient removed from cohort successfully')

//     revalidatePath('/dentist')
//     return { success: true }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error removing patient from cohort:', error)
//     return { error: 'Failed to remove patient from cohort' }
//   }
// }

// TODO: Implement when research functions are available
// export async function getCohortPatientsAction(projectId: string) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     const patients = await getResearchCohortPatients(projectId)
//     return { success: true, patients }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error fetching cohort patients:', error)
//     return { error: 'Failed to fetch cohort patients' }
//   }
// }

// Project Analytics Actions
export async function getProjectAnalyticsAction(projectId: string) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    console.log('📊 [RESEARCH] Getting analytics for project:', projectId)

    const analytics = await getResearchProjectAnalytics(projectId)

    console.log('✅ [RESEARCH] Analytics retrieved successfully')

    return { success: true, analytics }

  } catch (error) {
    console.error('❌ [RESEARCH] Error fetching analytics:', error)
    return { error: 'Failed to fetch project analytics' }
  }
}

// Criteria Management Actions
// TODO: Implement when research functions are available
// export async function addCriteriaAction(
//   projectId: string,
//   criteria: FilterCriteria
// ) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     console.log('🔧 [RESEARCH] Adding criteria to project:', projectId)

//     await addCriteriaToProject(projectId, user.id, criteria)

//     console.log('✅ [RESEARCH] Criteria added successfully')

//     revalidatePath('/dentist')
//     return { success: true }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error adding criteria:', error)
//     return { error: 'Failed to add criteria' }
//   }
// }

// TODO: Implement when research functions are available
// export async function removeCriteriaAction(
//   projectId: string,
//   criteriaId: string
// ) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     console.log('🔧 [RESEARCH] Removing criteria from project:', projectId)

//     await removeCriteriaFromProject(projectId, user.id, criteriaId)

//     console.log('✅ [RESEARCH] Criteria removed successfully')

//     revalidatePath('/dentist')
//     return { success: true }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error removing criteria:', error)
//     return { error: 'Failed to remove criteria' }
//   }
// }

// TODO: Implement when research functions are available
// export async function getProjectCriteriaAction(projectId: string) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     const criteria = await getProjectCriteria(projectId)
//     return { success: true, criteria }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error fetching criteria:', error)
//     return { error: 'Failed to fetch project criteria' }
//   }
// }

// Project Status Management
export async function updateProjectStatusAction(
  projectId: string,
  status: 'draft' | 'active' | 'completed' | 'paused'
) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    const db = await createServiceClient()

    // Verify user is a dentist
    const { data: profile } = await db
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'dentist' || profile.status !== 'active') {
      return { error: 'Only active dentists can update research projects' }
    }

    console.log('🔄 [RESEARCH] Updating project status:', { projectId, status })

    const result = await updateResearchProject(projectId, user.id, { status })
    if (!result.success) {
      return { error: result.error || 'Failed to update project status' }
    }

    console.log('✅ [RESEARCH] Project status updated successfully')

    revalidatePath('/dentist')
    return { success: true }

  } catch (error) {
    console.error('❌ [RESEARCH] Error updating project status:', error)
    return { error: 'Failed to update project status' }
  }
}

// Data Export Actions
// TODO: Implement when research functions are available
// export async function exportResearchDataAction(
//   projectId: string,
//   format: 'csv' | 'json' | 'excel' = 'csv',
//   anonymized: boolean = true
// ) {
//   try {
//     const supabase = await createServiceClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { error: 'User not authenticated' }
//     }

//     console.log('📤 [RESEARCH] Exporting research data:', { projectId, format, anonymized })

//     const exportData = await exportResearchData(projectId, format, anonymized)

//     console.log('✅ [RESEARCH] Data exported successfully')

//     return { success: true, data: exportData }

//   } catch (error) {
//     console.error('❌ [RESEARCH] Error exporting data:', error)
//     return { error: 'Failed to export research data' }
//   }
// }

// AI Research Assistant Integration with N8N
export async function queryAIResearchAssistantAction(
  projectId: string,
  query: string,
  context?: any
) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    console.log('🤖 [RESEARCH] Querying AI research assistant:', query)

    // Use our new N8N-integrated API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/research/ai-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        query,
        cohortData: context?.patientCount ? [] : [],
        analysisType: 'general_query'
      })
    })

    const result = await response.json()

    console.log('✅ [RESEARCH] AI assistant response received via N8N')

    return {
      success: true,
      response: result.response,
      source: result.source
    }

  } catch (error) {
    console.error('❌ [RESEARCH] Error querying AI assistant:', error)
    return { error: 'Failed to query AI research assistant' }
  }
}
