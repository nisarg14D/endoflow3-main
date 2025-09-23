"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Settings,
  Bell,
  Search,
  Plus,
  CalendarDays,
  Users,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { EnhancedAppointmentOrganizer } from "@/components/dentist/enhanced-appointment-organizer"
import { DentistTodaysView } from "@/components/dentist/todays-view"
import { DentistPatientQueue } from "@/components/dentist/patient-queue"
import { LivePatientManagement } from "@/components/dentist/live-patient-management"
import { DentistBookingInterface } from "@/components/dentist/booking-interface"
import { ClinicalCockpit } from "@/components/dentist/clinical-cockpit"
import { RealtimeAppointments } from "@/components/dentist/realtime-appointments"
import { NewConsultation } from "@/components/dentist/new-consultation"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ClinicAnalysis } from "@/components/dentist/clinic-analysis"
import { ResearchProjects } from "@/components/dentist/research-projects"
import SimpleMessagingInterface from "@/components/dentist/simple-messaging-interface"
import { getCurrentDentist, getTodaysAppointments, getWeekAppointments, getDentistAppointmentsAction } from "@/lib/actions/dentist"
import { logout } from "@/lib/actions/auth"
import { format } from "date-fns"
import Image from "next/image"
import { EndoflowLogo } from "@/components/ui/endoflow-logo"

interface DentistData {
  id: string
  name: string
  email: string
  specialty: string
  status: string
}

interface AppointmentStats {
  today: number
  week: number
  pending: number
  completed: number
}

const navigationTabs = [
  { id: "today", label: "Today's View", icon: Activity },
  { id: "patients", label: "Patients", icon: Users },
  { id: "consultation", label: "New Consultation", icon: FileText },
  { id: "organizer", label: "Appointment Organizer", icon: CalendarDays },
  { id: "analysis", label: "Clinic Analysis", icon: TrendingUp },
  { id: "research", label: "Research Projects", icon: Search },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "tasks", label: "Assistant Tasks", icon: CheckCircle },
]

export default function DentistDashboard() {
  const [activeTab, setActiveTab] = useState("today")
  const [dentistData, setDentistData] = useState<DentistData | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    today: 0,
    week: 0,
    pending: 0,
    completed: 0
  })
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    loadDentistData()
    loadAppointmentStats()
  }, [])

  useEffect(() => {
    if (dentistData?.id) {
      loadAllAppointments()
    }
  }, [dentistData?.id])

  const loadDentistData = async () => {
    try {
      const dentist = await getCurrentDentist()
      if (dentist) {
        setDentistData(dentist)
      }
    } catch (error) {
      console.error('Error loading dentist data:', error)
    }
  }

  const loadAppointmentStats = async () => {
    try {
      const [todayResult, weekResult] = await Promise.all([
        getTodaysAppointments(),
        getWeekAppointments()
      ])

      const todayCount = todayResult.success ? todayResult.data?.length || 0 : 0
      const weekCount = weekResult.success ? weekResult.data?.length || 0 : 0

      // Calculate completed and pending from week data
      const weekAppointments = weekResult.success ? weekResult.data || [] : []
      const completed = weekAppointments.filter(apt => apt.status === 'completed').length
      const pending = weekAppointments.filter(apt => apt.status === 'scheduled').length

      setAppointmentStats({
        today: todayCount,
        week: weekCount,
        pending,
        completed
      })
    } catch (error) {
      console.error('Error loading appointment stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllAppointments = async () => {
    try {
      if (!dentistData?.id) return

      // Load appointments for the next 30 days
      const today = new Date()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const todayStr = format(today, 'yyyy-MM-dd')
      const endDateStr = format(endDate, 'yyyy-MM-dd')

      const result = await getDentistAppointmentsAction(todayStr, endDateStr)
      if (result.success && result.data) {
        setAllAppointments(result.data)
      }
    } catch (error) {
      console.error('Error loading all appointments:', error)
    }
  }

  const handleAppointmentUpdate = (updatedAppointments: any[]) => {
    setAllAppointments(updatedAppointments)
    // Recalculate stats when appointments update
    loadAppointmentStats()
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="w-32 h-6 bg-gray-200 rounded" />
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="p-6">
            <div className="w-48 h-8 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dentistData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">Please log in with a dentist account to access this dashboard.</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EndoflowLogo size="lg" showText={false} />
              <h1 className="text-2xl font-bold text-teal-600">ENDOFLOW</h1>
              <span className="text-gray-500">Dental Clinic Management</span>
            </div>

            <div className="flex items-center gap-4">
              {dentistData && (
                <NotificationCenter userId={dentistData.id} role="dentist" />
              )}

              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{dentistData.name}</div>
                    <div className="text-xs text-gray-500">{dentistData.specialty}</div>
                  </div>
                </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setShowProfileMenu(false)
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setShowProfileMenu(false)
                          handleSignOut()
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "today" && (
            <div>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Today's Overview</h1>
                  <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Contact
                  </Button>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Appointment
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                        <p className="text-3xl font-bold text-gray-900">{appointmentStats.today}</p>
                        <p className="text-sm text-gray-500">3 completed, 5 remaining</p>
                      </div>
                      <div className="w-8 h-8 text-gray-400">
                        <Calendar className="w-full h-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-3xl font-bold text-gray-900">38%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-teal-600 h-2 rounded-full" style={{width: '38%'}}></div>
                        </div>
                      </div>
                      <div className="w-8 h-8 text-gray-400">
                        <Activity className="w-full h-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">₹2,450</p>
                        <p className="text-sm text-green-600">+12% from yesterday</p>
                      </div>
                      <div className="w-8 h-8 text-gray-400">
                        <TrendingUp className="w-full h-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Patients</p>
                        <p className="text-3xl font-bold text-gray-900">2</p>
                        <p className="text-sm text-gray-500">Welcome consultations</p>
                      </div>
                      <div className="w-8 h-8 text-gray-400">
                        <Users className="w-full h-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DentistTodaysView
                    dentistId={dentistData.id}
                    onRefreshStats={loadAppointmentStats}
                  />
                </div>
                <div>
                  <RealtimeAppointments
                    dentistId={dentistData.id}
                    initialAppointments={allAppointments}
                    onAppointmentUpdate={handleAppointmentUpdate}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="p-6">
              <LivePatientManagement
                onSelectPatient={(patient) => {
                  setSelectedPatient(patient)
                }}
                selectedPatientId={selectedPatient?.id}
              />
            </div>
          )}

          {activeTab === "consultation" && (
            <NewConsultation />
          )}

          {activeTab === "organizer" && (
            <EnhancedAppointmentOrganizer
              dentistId={dentistData.id}
              dentistName={dentistData.name}
              onRefreshStats={loadAppointmentStats}
            />
          )}

          {activeTab === "analysis" && (
            <ClinicAnalysis />
          )}

          {activeTab === "research" && (
            <ResearchProjects />
          )}

          {activeTab === "templates" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Templates Manager</h1>
                  <p className="text-gray-500">Clinical documentation templates</p>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Library</h3>
                  <p className="text-gray-600">Clinical template management coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <p className="text-gray-500">Patient communication center</p>
                </div>
              </div>

              <SimpleMessagingInterface />
            </div>
          )}

          {activeTab === "tasks" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Assistant Tasks</h1>
                  <p className="text-gray-500">Task delegation and workflow management</p>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Management</h3>
                  <p className="text-gray-600">Task delegation and management system coming soon...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}