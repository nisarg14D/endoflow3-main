export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPendingPatients, getActivePatients, getPendingRegistrations, getPendingAppointmentRequests } from "@/lib/db/queries"
import { Users, Calendar, Clock, TrendingUp, UserCheck, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { RealtimeAssistantDashboard } from "@/components/assistant-dashboard-realtime"
import { RealtimeAppointmentRequests } from "@/components/realtime-appointment-requests"
import { format } from "date-fns"

interface AssistantDashboardProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AssistantDashboard({ searchParams }: AssistantDashboardProps) {
  const params = await searchParams
  const [pendingPatients, activePatients, pendingRegistrations, appointmentRequests] = await Promise.all([
    getPendingPatients(),
    getActivePatients(),
    getPendingRegistrations(),
    getPendingAppointmentRequests()
  ])

  // Transform pending registrations to match expected format
  const transformedPendingRegistrations = pendingRegistrations.map(reg => {
    let formData
    try {
      formData = reg.formData ? JSON.parse(reg.formData) : {}
    } catch (error) {
      console.error('Failed to parse formData for registration:', reg.id, error)
      formData = {}
    }
    return {
      id: reg.userId, // Use userId for approval actions, not registration id
      fullName: `${formData.firstName || 'Unknown'} ${formData.lastName || 'User'}`,
      createdAt: reg.submittedAt
    }
  })

  // Combine both pending sources
  const allPendingPatients = [...pendingPatients, ...transformedPendingRegistrations]

  return (
    <div className="min-h-screen">
      {/* Hero Section with V0 Design */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Daily Task Hub
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto">
              Manage patient registrations, schedule appointments, and coordinate with the dental team
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with V0 Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success/Error Messages */}
      {params.verified === 'success' && (
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Patient verified successfully! They can now log in to their account.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {params.rejected === 'success' && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <XCircle className="h-5 w-5" />
                <p className="font-medium">Patient registration has been rejected and removed from the system.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {params.confirmed === 'success' && (
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Appointment confirmed successfully! Patient and dentist have been notified.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats - V0 Design */}
      <div className="mb-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">Pending Patients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{allPendingPatients.length}</p>
                </div>
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-500 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Appointments Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{appointmentRequests.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-gray-600">Next at 10:30 AM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">18</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">85%</span>
                <span className="text-gray-500 ml-1">efficiency rate</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Column 1: Real-time Appointment Requests */}
        <RealtimeAppointmentRequests
          initialRequests={appointmentRequests}
          viewType="assistant"
        />

        {/* Column 2: Today's Task Board - V0 Design */}
        <Card className="h-fit bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5" />
                Today's Task Board
              </div>
              <Select defaultValue="today">
                <SelectTrigger className="w-28 bg-blue-700/50 border-blue-400 text-white backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            <div className="space-y-0">
              {/* In Progress Section */}
              <div className="border-b">
                <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">In Progress (2)</span>
                  <ChevronUp className="h-4 w-4 ml-auto" />
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Insurance verification</div>
                      <div className="text-xs text-gray-500">Robert Wilson</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600">High</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Complete</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Schedule follow-up</div>
                      <div className="text-xs text-gray-500">Lisa Anderson</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-yellow-600">Medium</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Complete</Button>
                  </div>
                </div>
              </div>

              {/* To Do Section */}
              <div className="border-b">
                <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">To Do (3)</span>
                  <ChevronUp className="h-4 w-4 ml-auto" />
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Review patient X-rays</div>
                      <div className="text-xs text-gray-500">Sarah Johnson</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600">High</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Prepare treatment plan</div>
                      <div className="text-xs text-gray-500">Michael Chen</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-yellow-600">Medium</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Follow up on lab results</div>
                      <div className="text-xs text-gray-500">Emily Davis</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Section */}
              <div>
                <div className="p-3 bg-gray-50 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Completed (2)</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: New Self-Registrations - Real-time */}
        <RealtimeAssistantDashboard
          initialPendingPatients={pendingPatients}
          initialPendingRegistrations={pendingRegistrations}
        />
      </div>
      </div>
    </div>
  )
}