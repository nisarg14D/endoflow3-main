'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  CalendarDays,
  Users,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
  Timer,
  UserCheck
} from "lucide-react"
import {
  getDentistAppointmentsAction,
  updateDentistAppointmentStatus,
  dentistCancelAppointment,
  dentistRescheduleAppointment,
  getPatientsForBooking
} from "@/lib/actions/dentist"
import {
  getAppointmentRequestsAction,
  scheduleAppointmentDirectAction,
  getAppointmentsForWeekAction,
  updateAppointmentStatusAction
} from "@/lib/actions/appointments"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isToday, isFuture } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  patient_id: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  appointment_type: string
  status: string
  notes?: string
  patients?: {
    first_name: string
    last_name: string
    date_of_birth?: string
    phone?: string
  }
  dentists?: {
    full_name: string
    specialty?: string
  }
}

interface AppointmentStats {
  total: number
  today: number
  thisWeek: number
  scheduled: number
  completed: number
  inProgress: number
  cancelled: number
}

interface NewAppointmentData {
  patientId: string
  dentistId: string
  date: string
  time: string
  type: string
  duration: number
  notes?: string
}

interface AppointmentOrganizerProps {
  dentistId: string
  dentistName: string
  onRefreshStats: () => void
}

export function DentistAppointmentOrganizer({ dentistId, dentistName, onRefreshStats }: AppointmentOrganizerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    scheduled: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false)
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
    loadPendingRequests()
  }, [currentDate, viewMode])

  useEffect(() => {
    filterAppointments()
    calculateStats()
  }, [appointments, searchTerm, statusFilter])

  useEffect(() => {
    const channel = supabase
      .channel('appointment-organizer')
      .on('postgres_changes',
        { event: '*', schema: 'api', table: 'appointments' },
        () => {
          loadAppointments()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'api', table: 'appointment_requests' },
        () => {
          loadPendingRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAppointments = async () => {
    if (!isLoading) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      let startDate: string
      let endDate: string

      if (viewMode === 'day') {
        startDate = format(currentDate, 'yyyy-MM-dd')
        endDate = startDate
      } else if (viewMode === 'week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })
        startDate = format(start, 'yyyy-MM-dd')
        endDate = format(end, 'yyyy-MM-dd')
      } else {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        startDate = format(start, 'yyyy-MM-dd')
        endDate = format(end, 'yyyy-MM-dd')
      }

      const result = await getAppointmentsForWeekAction(startDate, endDate, dentistId)
      if (result.success && result.data) {
        // Fetch patient details for each appointment
        const appointmentsWithPatients = await Promise.all(
          result.data.map(async (apt: any) => {
            const { data: patient } = await supabase
              .schema('api')
              .from('patients')
              .select('first_name, last_name, date_of_birth, phone')
              .eq('id', apt.patient_id)
              .single()

            return {
              ...apt,
              patients: patient
            }
          })
        )
        setAppointments(appointmentsWithPatients)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const result = await getAppointmentRequestsAction()
      if (result.success && result.data) {
        setPendingRequests(result.data)
      }
    } catch (error) {
      console.error('Error loading pending requests:', error)
    }
  }

  const calculateStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const startOfThisWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const endOfThisWeek = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const todayAppointments = filteredAppointments.filter(apt => apt.scheduled_date === today)
    const thisWeekAppointments = filteredAppointments.filter(apt =>
      apt.scheduled_date >= startOfThisWeek && apt.scheduled_date <= endOfThisWeek
    )

    setAppointmentStats({
      total: filteredAppointments.length,
      today: todayAppointments.length,
      thisWeek: thisWeekAppointments.length,
      scheduled: filteredAppointments.filter(apt => apt.status === 'scheduled').length,
      completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
      inProgress: filteredAppointments.filter(apt => apt.status === 'in_progress').length,
      cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length
    })
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointment_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7))
    } else {
      const newDate = new Date(currentDate)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setCurrentDate(newDate)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-teal-100 text-teal-800 border-teal-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'in_progress': return <Activity className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'cancelled': return <AlertCircle className="w-3 h-3" />
      case 'no_show': return <User className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'no_show': return 'No Show'
      default: return status
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string, notes?: string) => {
    try {
      const result = await updateAppointmentStatusAction(appointmentId, newStatus, dentistId, notes)
      if (result.success) {
        await loadAppointments()
        onRefreshStats()
        setShowAppointmentDetails(false)
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  const handleRefresh = async () => {
    await Promise.all([
      loadAppointments(),
      loadPendingRequests()
    ])
  }

  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      const result = await dentistCancelAppointment(appointmentId, reason)
      if (result.success) {
        await loadAppointments()
        onRefreshStats()
        setShowAppointmentDetails(false)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const formatViewTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      const end = endOfWeek(currentDate)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  const getDayAppointments = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredAppointments.filter(apt => apt.scheduled_date === dateStr)
  }

  const renderDayView = () => {
    const dayAppointments = getDayAppointments(currentDate)
    const timeSlots = Array.from({ length: 22 }, (_, i) => {
      const hour = Math.floor(i / 2) + 8
      const minute = i % 2 === 0 ? 0 : 30
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })

    return (
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {timeSlots.map((timeSlot) => {
          const appointment = dayAppointments.find(apt =>
            apt.scheduled_time.startsWith(timeSlot)
          )

          return (
            <div key={timeSlot} className="flex items-start border-b border-gray-100 py-3">
              <div className="w-20 text-sm text-gray-500 pt-1">{timeSlot}</div>
              <div className="flex-1">
                {appointment ? (
                  <div
                    className={`ml-4 p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      appointment.status === 'in_progress' ? 'border-l-blue-500 bg-blue-50' :
                      appointment.status === 'completed' ? 'border-l-green-500 bg-green-50' :
                      appointment.status === 'cancelled' ? 'border-l-red-500 bg-red-50' :
                      'border-l-teal-500 bg-teal-50'
                    }`}
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowAppointmentDetails(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {appointment.patients?.first_name?.[0]}{appointment.patients?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {appointment.patients?.first_name} {appointment.patients?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{appointment.appointment_type}</div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                        {getStatusIcon(appointment.status)}
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {appointment.duration_minutes} min
                      </span>
                      {appointment.patients?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {appointment.patients.phone}
                        </span>
                      )}
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-white/70 p-2 rounded">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ml-4 p-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Available - Click to schedule
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    const days = eachDayOfInterval({ start, end })

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day.toISOString()} className="space-y-2">
            <div className="text-center p-2 border-b">
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="space-y-1 min-h-[400px]">
              {getDayAppointments(day).map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-2 border rounded text-xs cursor-pointer hover:shadow-sm"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setShowAppointmentDetails(true)
                  }}
                >
                  <div className="font-medium">
                    {appointment.scheduled_time.slice(0, 5)}
                  </div>
                  <div className="truncate">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                  </div>
                  <div className="truncate text-gray-600">{appointment.appointment_type}</div>
                  <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointment Organizer
            </CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
          <p className="text-sm text-gray-600">Manage and schedule patient appointments</p>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search appointments by patient or procedure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <h3 className="text-lg font-semibold">{formatViewTitle()}</h3>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Scheduling for: {dentistName}
              </span>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="border rounded-lg p-4 min-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading appointments...</p>
                </div>
              </div>
            ) : viewMode === 'day' ? (
              renderDayView()
            ) : viewMode === 'week' ? (
              renderWeekView()
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Month view coming soon...</p>
              </div>
            )}
          </div>

          {/* Today's Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Today's Appointments</p>
                    <p className="text-xl font-bold text-blue-900">
                      {getDayAppointments(new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Upcoming Appointments</p>
                    <p className="text-xl font-bold text-green-900">
                      {filteredAppointments.filter(apt => apt.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Available Slots</p>
                    <p className="text-xl font-bold text-gray-900">
                      {viewMode === 'day' ? Math.max(0, 20 - getDayAppointments(currentDate).length) : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">
                  {selectedAppointment.patients?.first_name} {selectedAppointment.patients?.last_name}
                </h4>
                <p className="text-gray-600">{selectedAppointment.appointment_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">
                    {format(parseISO(selectedAppointment.scheduled_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium">{selectedAppointment.scheduled_time.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{selectedAppointment.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {getStatusLabel(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'in_progress')}
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelAppointment(selectedAppointment.id, 'Cancelled by dentist')}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {selectedAppointment.status === 'in_progress' && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}