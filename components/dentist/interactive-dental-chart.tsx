"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Expand, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PrescriptionManagement } from "./prescription-management"
import { FollowUpManagement } from "./follow-up-management"

interface ToothData {
  number: string
  status: "healthy" | "caries" | "filled" | "crown" | "missing" | "attention" | "root_canal" | "extraction_needed"
  diagnosis?: string
  treatment?: string
  date?: string
  notes?: string
}

interface InteractiveDentalChartProps {
  onToothSelect?: (toothNumber: string) => void
  readOnly?: boolean
  patientId?: string
}

export function InteractiveDentalChart({ onToothSelect, readOnly = false, patientId }: InteractiveDentalChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false)
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false)
  const [toothData, setToothData] = useState<Record<string, ToothData>>({
    "16": { number: "16", status: "caries", diagnosis: "Deep caries", treatment: "Filling required", date: "2024-01-15" },
    "24": { number: "24", status: "filled", diagnosis: "Composite restoration", treatment: "Completed", date: "2023-12-20" },
    "36": { number: "36", status: "crown", diagnosis: "Full crown", treatment: "Crown placed", date: "2023-11-10" },
    "18": { number: "18", status: "missing", diagnosis: "Extracted", date: "2023-08-15" },
    "46": { number: "46", status: "attention", diagnosis: "Requires evaluation", treatment: "Pending assessment" },
    "11": { number: "11", status: "root_canal", diagnosis: "Root canal therapy", treatment: "RCT completed", date: "2024-02-01" },
  })

  // FDI tooth numbering system - Adult teeth
  const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"]
  const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"]

  const getToothColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 border-green-300 hover:bg-green-200 text-green-800"
      case "caries":
        return "bg-red-100 border-red-300 hover:bg-red-200 text-red-800"
      case "filled":
        return "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800"
      case "crown":
        return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800"
      case "missing":
        return "bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed opacity-50"
      case "attention":
        return "bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800"
      case "root_canal":
        return "bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800"
      case "extraction_needed":
        return "bg-red-200 border-red-400 hover:bg-red-300 text-red-900"
      default:
        return "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "caries":
        return "bg-red-500"
      case "filled":
        return "bg-blue-500"
      case "crown":
        return "bg-yellow-500"
      case "missing":
        return "bg-gray-500"
      case "attention":
        return "bg-orange-500"
      case "root_canal":
        return "bg-purple-500"
      case "extraction_needed":
        return "bg-red-700"
      default:
        return "bg-gray-400"
    }
  }

  const handleToothClick = (toothNumber: string) => {
    const tooth = toothData[toothNumber]
    if (tooth?.status === "missing" || readOnly) {
      if (tooth?.status !== "missing") {
        setSelectedTooth(toothNumber)
        setIsDialogOpen(true)
      }
      return
    }

    setSelectedTooth(toothNumber)
    setIsDialogOpen(true)

    if (onToothSelect) {
      onToothSelect(toothNumber)
    }
  }

  const handleSaveToothData = (toothNumber: string, data: Partial<ToothData>) => {
    setToothData(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        number: toothNumber,
        status: "healthy",
        ...data,
        date: new Date().toISOString().split('T')[0]
      }
    }))
    setIsDialogOpen(false)
    setSelectedTooth(null)
  }

  const renderTooth = (toothNumber: string, isUpper = true) => {
    const tooth = toothData[toothNumber] || { number: toothNumber, status: "healthy" }
    const colorClass = getToothColor(tooth.status)

    return (
      <div
        key={toothNumber}
        className={`
          relative w-10 h-14 ${colorClass} border-2 rounded-lg cursor-pointer
          transition-all duration-200 flex items-center justify-center
          ${tooth.status === "missing" ? "opacity-50" : "hover:scale-105 hover:shadow-md"}
          ${selectedTooth === toothNumber ? "ring-2 ring-blue-500 ring-offset-1" : ""}
        `}
        onClick={() => handleToothClick(toothNumber)}
        title={`Tooth ${toothNumber}${tooth.diagnosis ? ` - ${tooth.diagnosis}` : ""}`}
      >
        <span className="text-xs font-bold">{toothNumber}</span>
        {tooth.status !== "healthy" && tooth.status !== "missing" && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusBadgeColor(tooth.status)}`}></div>
        )}
      </div>
    )
  }

  const renderFullScreenChart = () => (
    <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Interactive Dental Chart - Full View
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          {renderChartContent()}
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderToothDialog = () => {
    if (!selectedTooth) return null

    const tooth = toothData[selectedTooth] || { number: selectedTooth, status: "healthy" }

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${getToothColor(tooth.status)} border-2 flex items-center justify-center`}>
                <span className="text-sm font-bold">{selectedTooth}</span>
              </div>
              Tooth {selectedTooth} - Diagnosis & Treatment Planning
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
            {/* Diagnosis Section */}
            <div className="space-y-4 overflow-auto">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Diagnosis</h3>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current-status">Current Status</Label>
                    <Select defaultValue={tooth.status} onValueChange={(value) => {
                      const newData = { ...tooth, status: value as ToothData['status'] }
                      setToothData(prev => ({ ...prev, [selectedTooth]: newData }))
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="caries">Caries</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="crown">Crown</SelectItem>
                        <SelectItem value="root_canal">Root Canal</SelectItem>
                        <SelectItem value="extraction_needed">Extraction Needed</SelectItem>
                        <SelectItem value="missing">Missing</SelectItem>
                        <SelectItem value="attention">Needs Attention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="primary-diagnosis">Primary Diagnosis</Label>
                    <Select defaultValue={tooth.diagnosis}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diagnosis..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dental-caries">Dental Caries</SelectItem>
                        <SelectItem value="deep-caries">Deep Caries</SelectItem>
                        <SelectItem value="pulpitis">Pulpitis</SelectItem>
                        <SelectItem value="periapical-abscess">Periapical Abscess</SelectItem>
                        <SelectItem value="fractured-tooth">Fractured Tooth</SelectItem>
                        <SelectItem value="cracked-tooth">Cracked Tooth</SelectItem>
                        <SelectItem value="worn-restoration">Worn Restoration</SelectItem>
                        <SelectItem value="gingival-recession">Gingival Recession</SelectItem>
                        <SelectItem value="periodontal-disease">Periodontal Disease</SelectItem>
                        <SelectItem value="impacted-tooth">Impacted Tooth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="diagnosis-details">Diagnosis Details</Label>
                    <Textarea
                      placeholder="Detailed diagnosis description..."
                      defaultValue={tooth.diagnosis || ""}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="examination-date">Examination Date</Label>
                    <Input
                      type="date"
                      defaultValue={tooth.date || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Pain', 'Sensitivity', 'Swelling', 'Bleeding', 'Mobility', 'Fracture'].map((symptom) => (
                        <label key={symptom} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          {symptom}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diagnostic-notes">Diagnostic Notes</Label>
                    <Textarea
                      placeholder="Additional diagnostic observations..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Plan Section */}
            <div className="space-y-4 overflow-auto">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Treatment Plan</h3>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="treatment-type">Recommended Treatment</Label>
                    <Select defaultValue={tooth.treatment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="composite-filling">Composite Filling</SelectItem>
                        <SelectItem value="amalgam-filling">Amalgam Filling</SelectItem>
                        <SelectItem value="root-canal-therapy">Root Canal Therapy</SelectItem>
                        <SelectItem value="crown-placement">Crown Placement</SelectItem>
                        <SelectItem value="extraction">Extraction</SelectItem>
                        <SelectItem value="deep-cleaning">Deep Cleaning</SelectItem>
                        <SelectItem value="scaling-polishing">Scaling & Polishing</SelectItem>
                        <SelectItem value="fluoride-treatment">Fluoride Treatment</SelectItem>
                        <SelectItem value="dental-implant">Dental Implant</SelectItem>
                        <SelectItem value="bridge-placement">Bridge Placement</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="treatment-priority">Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent (Emergency)</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="treatment-plan">Treatment Plan Details</Label>
                    <Textarea
                      placeholder="Detailed treatment plan description..."
                      defaultValue={tooth.treatment || ""}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="estimated-duration">Duration</Label>
                      <Select defaultValue="60">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimated-cost">Estimated Cost (₹)</Label>
                      <Input placeholder="Enter cost..." />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scheduled-date">Scheduled Date</Label>
                    <Input type="date" />
                  </div>

                  <div>
                    <Label htmlFor="treatment-notes">Treatment Notes</Label>
                    <Textarea
                      placeholder="Additional treatment considerations..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="follow-up">Follow-up Required</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="followup" value="yes" />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="followup" value="no" />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t pt-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrescriptionOpen(true)}
              >
                Add to Prescription
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFollowUpOpen(true)}
              >
                Schedule Follow-up
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedTooth(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveToothData(selectedTooth, tooth)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Diagnosis & Treatment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderChartContent = () => (
    <div className="space-y-8">
      {/* Upper Teeth */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 mb-3">Upper Jaw (Maxilla)</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {upperTeeth.map((tooth) => renderTooth(tooth, true))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="border-t-2 border-dashed border-gray-300"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
          <span className="text-xs text-gray-500 font-medium">BITE LINE</span>
        </div>
      </div>

      {/* Lower Teeth */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 mb-3">Lower Jaw (Mandible)</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {lowerTeeth.map((tooth) => renderTooth(tooth, false))}
        </div>
      </div>
    </div>
  )

  // Calculate statistics
  const allTeeth = [...upperTeeth, ...lowerTeeth]
  const healthyCount = allTeeth.filter(t => !toothData[t] || toothData[t].status === "healthy").length
  const cariesCount = allTeeth.filter(t => toothData[t]?.status === "caries").length
  const filledCount = allTeeth.filter(t => toothData[t]?.status === "filled").length
  const needsAttentionCount = allTeeth.filter(t => toothData[t]?.status === "attention").length
  const missingCount = allTeeth.filter(t => toothData[t]?.status === "missing").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Interactive Dental Chart (FDI System)</h3>
          <p className="text-sm text-gray-600">Click on any tooth to add or view diagnosis</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2"
          >
            <Expand className="h-4 w-4" />
            Full Screen
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            3D View
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Dental Chart Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {[
            { status: "healthy", label: "Healthy", color: "bg-green-100 border-green-300" },
            { status: "caries", label: "Caries", color: "bg-red-100 border-red-300" },
            { status: "filled", label: "Filled", color: "bg-blue-100 border-blue-300" },
            { status: "crown", label: "Crown", color: "bg-yellow-100 border-yellow-300" },
            { status: "root_canal", label: "Root Canal", color: "bg-purple-100 border-purple-300" },
            { status: "missing", label: "Missing", color: "bg-gray-200 border-gray-400" },
            { status: "attention", label: "Needs Attention", color: "bg-orange-100 border-orange-300" },
          ].map(({ status, label, color }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} border rounded`}></div>
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dental Chart */}
      <Card>
        <CardContent className="p-6">
          {renderChartContent()}
        </CardContent>
      </Card>

      {/* Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
            <div className="text-xs text-gray-600">Healthy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{cariesCount}</div>
            <div className="text-xs text-gray-600">Caries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filledCount}</div>
            <div className="text-xs text-gray-600">Restorations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{needsAttentionCount}</div>
            <div className="text-xs text-gray-600">Attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{missingCount}</div>
            <div className="text-xs text-gray-600">Missing</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Treatments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Dental Procedures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.values(toothData)
              .filter(tooth => tooth.date && tooth.treatment)
              .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
              .slice(0, 3)
              .map((tooth, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Tooth {tooth.number}</Badge>
                    <span className="text-sm">{tooth.treatment}</span>
                  </div>
                  <span className="text-xs text-gray-500">{tooth.date}</span>
                </div>
              ))}
            {Object.values(toothData).filter(t => t.date).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent procedures recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {renderFullScreenChart()}
      {renderToothDialog()}

      {/* Prescription Management Dialog */}
      <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Prescription Management</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <PrescriptionManagement
              patientId={patientId}
              onPrescriptionSave={(prescription) => {
                console.log('Prescription saved:', prescription)
                setIsPrescriptionOpen(false)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up Management Dialog */}
      <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Follow-up Management</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <FollowUpManagement
              patientId={patientId}
              toothNumber={selectedTooth || undefined}
              onFollowUpSave={(followUp) => {
                console.log('Follow-up saved:', followUp)
                setIsFollowUpOpen(false)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}