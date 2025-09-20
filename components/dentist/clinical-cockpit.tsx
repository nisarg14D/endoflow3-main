"use client"

import { useState } from "react"
import {
  Stethoscope,
  AlertTriangle,
  User,
  FileText,
  Bluetooth as Tooth,
  Camera,
  FlaskConical,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InteractiveDentalChart } from "./interactive-dental-chart"
import { PatientFilesViewer } from "@/components/patient-files-viewer"
import { format } from "date-fns"

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  lastVisit: string
  nextAppointment?: string
  status: "active" | "inactive" | "new"
  insuranceProvider?: string
  emergencyContact: string
  medicalConditions: string[]
  allergies: string[]
  uhid: string
  address?: string
  bloodGroup?: string
  emergencyContactPhone?: string
}

interface ClinicalCockpitProps {
  selectedPatient?: Patient | null
  onNewAppointment?: () => void
  onEditPatient?: () => void
}

export function ClinicalCockpit({
  selectedPatient,
  onNewAppointment,
  onEditPatient
}: ClinicalCockpitProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!selectedPatient) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Cockpit</h3>
            <p className="text-gray-600 text-sm">Select a patient from the queue to view their clinical details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const criticalAlerts =
    selectedPatient.allergies.length > 0 ||
    selectedPatient.medicalConditions.some(
      (condition) =>
        condition.toLowerCase().includes("diabetes") ||
        condition.toLowerCase().includes("heart") ||
        condition.toLowerCase().includes("blood pressure") ||
        condition.toLowerCase().includes("hypertension")
    )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "new":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Patient Header Card */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <Badge className={getStatusColor(selectedPatient.status)}>
                  {selectedPatient.status}
                </Badge>
                {criticalAlerts && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Medical Alert
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">UHID: {selectedPatient.uhid}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Last Visit: {format(new Date(selectedPatient.lastVisit), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEditPatient}>
                Edit Patient
              </Button>
              <Button size="sm" onClick={onNewAppointment} className="bg-blue-600 hover:bg-blue-700">
                New Appointment
              </Button>
            </div>
          </div>

          {/* Critical Medical Information Alert */}
          {(selectedPatient.allergies.length > 0 || selectedPatient.medicalConditions.length > 0) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Critical Medical Information</span>
              </div>
              <div className="space-y-2">
                {selectedPatient.allergies.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-red-700">Allergies: </span>
                      <span className="text-sm text-red-600">{selectedPatient.allergies.join(", ")}</span>
                    </div>
                  </div>
                )}
                {selectedPatient.medicalConditions.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-red-700">Medical Conditions: </span>
                      <span className="text-sm text-red-600">{selectedPatient.medicalConditions.join(", ")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Clinical Tabs */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-0 h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 rounded-none border-b bg-gray-50">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2 data-[state=active]:bg-white">
                <FileText className="h-4 w-4" />
                Clinical Notes
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Tooth className="h-4 w-4" />
                Dental Chart
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Camera className="h-4 w-4" />
                Image Gallery
              </TabsTrigger>
              <TabsTrigger value="lab" className="flex items-center gap-2 data-[state=active]:bg-white">
                <FlaskConical className="h-4 w-4" />
                Lab Results
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-white">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="p-6 m-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                          <p className="text-sm font-medium">{format(new Date(selectedPatient.dateOfBirth), 'MMMM d, yyyy')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Blood Group</label>
                          <p className="text-sm font-medium">{selectedPatient.bloodGroup || "Not specified"}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-sm font-medium">{selectedPatient.email}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Address</label>
                          <p className="text-sm font-medium">{selectedPatient.address || "Not provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Contact Person</label>
                        <p className="text-sm font-medium">{selectedPatient.emergencyContact}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone Number</label>
                        <p className="text-sm font-medium">{selectedPatient.emergencyContactPhone || "Not provided"}</p>
                      </div>
                      {selectedPatient.insuranceProvider && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Insurance Provider</label>
                          <p className="text-sm font-medium">{selectedPatient.insuranceProvider}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Appointment History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Routine Cleaning</p>
                          <p className="text-sm text-gray-600">{selectedPatient.lastVisit}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      {selectedPatient.nextAppointment && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Follow-up Examination</p>
                            <p className="text-sm text-gray-600">{selectedPatient.nextAppointment}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="p-6 m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Clinical Notes</h3>
                    <Button size="sm">Add New Note</Button>
                  </div>
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-blue-600">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Routine Examination</span>
                          <span className="text-xs text-gray-500">{selectedPatient.lastVisit}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Patient presented for routine cleaning and examination. No immediate concerns noted.
                          Recommended continued regular oral hygiene and scheduled follow-up in 6 months.
                        </p>
                      </CardContent>
                    </Card>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Additional clinical notes will appear here</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chart" className="p-6 m-0">
                <InteractiveDentalChart />
              </TabsContent>

              <TabsContent value="gallery" className="p-0 m-0">
                {selectedPatient ? (
                  <PatientFilesViewer
                    patientId={selectedPatient.id}
                    viewMode="dentist"
                    showUploader={true}
                    showPatientInfo={true}
                    maxHeight="600px"
                  />
                ) : (
                  <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Select a patient to view their medical files</p>
                      <p className="text-xs text-gray-400 mt-1">X-rays, photos, and other medical images will appear here</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lab" className="p-6 m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Laboratory Results</h3>
                    <Button size="sm">Add Lab Order</Button>
                  </div>
                  <div className="text-center py-12 text-gray-500">
                    <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No lab results available</p>
                    <p className="text-xs text-gray-400 mt-1">Laboratory orders and results will appear here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="p-6 m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Billing Information</h3>
                    <Button size="sm">Create Invoice</Button>
                  </div>
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No billing records found</p>
                    <p className="text-xs text-gray-400 mt-1">Patient invoices and payment history will appear here</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}