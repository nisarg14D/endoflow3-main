"use client"

import { useState, useEffect } from "react"
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
import { DentistAppointmentOrganizer } from "@/components/dentist/appointment-organizer"
import { DentistTodaysView } from "@/components/dentist/todays-view"
import { DentistPatientQueue } from "@/components/dentist/patient-queue"
import { DentistBookingInterface } from "@/components/dentist/booking-interface"
import { ClinicalCockpit } from "@/components/dentist/clinical-cockpit"
import { RealtimeAppointments } from "@/components/dentist/realtime-appointments"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { getCurrentDentist, getTodaysAppointments, getWeekAppointments, getDentistAppointmentsAction } from "@/lib/actions/dentist"
import { logout } from "@/lib/actions/auth"
import { format } from "date-fns"
import Image from "next/image"

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
  { id: "patients", label: "Patient Queue", icon: Users },
  { id: "cockpit", label: "Clinical Cockpit", icon: Stethoscope },
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
  const [selectedPatient, setSelectedPatient] = useState(null)
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="/endoflow-logo.png"
                alt="ENDOFLOW Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">ENDOFLOW</h1>
              <p className="text-sm text-gray-600">Dental Clinic Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Quick Search
            </Button>

            {dentistData && (
              <NotificationCenter userId={dentistData.id} role="dentist" />
            )}

            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
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
                        // Add profile settings logic
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
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Navigation Tabs */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Dashboard
            </h2>
            <nav className="space-y-1">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.today}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.week}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "today" && (
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
            )}

            {activeTab === "patients" && (
              <DentistPatientQueue
                dentistId={dentistData.id}
                onRefreshStats={loadAppointmentStats}
                onSelectPatient={setSelectedPatient}
              />
            )}

            {activeTab === "cockpit" && (
              <ClinicalCockpit
                selectedPatient={selectedPatient}
                onNewAppointment={() => setActiveTab("consultation")}
                onEditPatient={() => {
                  // TODO: Implement edit patient functionality
                  console.log("Edit patient:", selectedPatient)
                }}
              />
            )}

            {activeTab === "organizer" && (
              <DentistAppointmentOrganizer
                dentistId={dentistData.id}
                dentistName={dentistData.name}
                onRefreshStats={loadAppointmentStats}
              />
            )}

            {activeTab === "consultation" && (
              <DentistBookingInterface
                dentistId={dentistData.id}
                onRefreshStats={loadAppointmentStats}
              />
            )}

            {/* Placeholder content for other tabs */}
            {activeTab === "analysis" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Clinic Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Clinic analysis and reporting tools coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "research" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    Research Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Research studio and project management coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "templates" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Templates Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Clinical template management coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "messages" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Patient and staff messaging system coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "tasks" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Assistant Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Task delegation and management system coming soon...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}