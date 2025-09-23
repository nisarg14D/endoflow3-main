"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Expand, Info, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'
import { getPatientToothDiagnoses, getPatientLatestToothDiagnoses, saveToothDiagnosis, type ToothDiagnosisData, type ToothChartData } from "@/lib/actions/tooth-diagnoses"
import { ToothDiagnosisDialog } from "./tooth-diagnosis-dialog"
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
  onMultipleToothSelect?: (toothNumbers: string[]) => void
  onToothStatusChange?: (toothNumber: string, status: string, data: any) => void
  readOnly?: boolean
  patientId?: string
  consultationId?: string
  selectedTooth?: string | null
  selectedTeeth?: string[]
  toothData?: Record<string, any>
  showLabels?: boolean
  multiSelectMode?: boolean
}

export function InteractiveDentalChart({
  onToothSelect,
  onMultipleToothSelect,
  onToothStatusChange,
  readOnly = false,
  patientId,
  consultationId,
  selectedTooth: externalSelectedTooth,
  selectedTeeth: externalSelectedTeeth,
  toothData: externalToothData,
  showLabels = false,
  multiSelectMode = false
}: InteractiveDentalChartProps) {
  const [internalSelectedTooth, setInternalSelectedTooth] = useState<string | null>(null)
  const [internalSelectedTeeth, setInternalSelectedTeeth] = useState<string[]>([])
  const selectedTooth = externalSelectedTooth ?? internalSelectedTooth
  const selectedTeeth = externalSelectedTeeth ?? internalSelectedTeeth
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false)
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false)
  const [realTimeToothData, setRealTimeToothData] = useState<ToothChartData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [followUpRequired, setFollowUpRequired] = useState<string>("no")
  const [internalToothData, setInternalToothData] = useState<Record<string, ToothData>>({
    "16": { number: "16", status: "caries", diagnosis: "Deep caries", treatment: "Filling required", date: "2024-01-15" },
    "24": { number: "24", status: "filled", diagnosis: "Composite restoration", treatment: "Completed", date: "2023-12-20" },
    "36": { number: "36", status: "crown", diagnosis: "Full crown", treatment: "Crown placed", date: "2023-11-10" },
    "18": { number: "18", status: "missing", diagnosis: "Extracted", date: "2023-08-15" },
    "46": { number: "46", status: "attention", diagnosis: "Requires evaluation", treatment: "Pending assessment" },
    "11": { number: "11", status: "root_canal", diagnosis: "Root canal therapy", treatment: "RCT completed", date: "2024-02-01" },
  })
  
  // Convert ToothDiagnosisData to ToothData format
  const convertToothDataFormat = (toothChartData: ToothChartData): Record<string, ToothData> => {
    const converted: Record<string, ToothData> = {}
    Object.values(toothChartData).forEach(tooth => {
      converted[tooth.toothNumber] = {
        number: tooth.toothNumber,
        status: tooth.status,
        diagnosis: tooth.primaryDiagnosis,
        treatment: tooth.recommendedTreatment,
        date: tooth.examinationDate,
        notes: tooth.notes
      }
    })
    return converted
  }
  
  // Use real-time data if available, otherwise fall back to mock data or external data
  const toothData = patientId && Object.keys(realTimeToothData).length > 0 
    ? convertToothDataFormat(realTimeToothData)
    : (externalToothData ?? internalToothData)
    
  // Debug logging
  useEffect(() => {
    console.log('🦷 [DENTAL-CHART] Data state:', {
      patientId,
      consultationId,
      realTimeToothDataCount: Object.keys(realTimeToothData).length,
      externalToothDataCount: externalToothData ? Object.keys(externalToothData).length : 0,
      finalToothDataCount: Object.keys(toothData).length,
      loading,
      error
    })
  }, [patientId, consultationId, realTimeToothData, externalToothData, loading, error, toothData])

  // Load tooth diagnosis data from the database
  const loadToothData = async () => {
    if (!patientId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // For new consultations (no consultationId), load the latest diagnoses across all consultations
      // For viewing historical consultations, load specific consultation data
      const diagnosesResult = await getPatientToothDiagnoses(
        patientId, 
        consultationId,
        !consultationId // useLatestForNewConsultation = true when no consultationId
      )
      
      if (diagnosesResult.success) {
        setRealTimeToothData(diagnosesResult.data || {})
      } else {
        setError(diagnosesResult.error || 'Failed to load tooth data')
      }
    } catch (error) {
      console.error('Error loading tooth data:', error)
      setError('Failed to load tooth data')
    } finally {
      setLoading(false)
    }
  }

  // Load data when patient or consultation changes
  useEffect(() => {
    if (patientId) {
      loadToothData()
    } else {
      setRealTimeToothData({})
    }
  }, [patientId, consultationId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!patientId) return
    
    const supabase = createClient()
    
    // Subscribe to tooth diagnoses changes for this patient
    const channel = supabase
      .channel(`tooth-diagnoses-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'tooth_diagnoses',
          filter: `patient_id=eq.${patientId}`
        },
        (payload) => {
          console.log('Real-time tooth diagnosis update:', payload)
          // Reload data when changes are detected
          loadToothData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])

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
      case "implant":
        return "bg-cyan-100 border-cyan-300 hover:bg-cyan-200 text-cyan-800"
      case "bridge":
        return "bg-indigo-100 border-indigo-300 hover:bg-indigo-200 text-indigo-800"
      case "veneer":
        return "bg-pink-100 border-pink-300 hover:bg-pink-200 text-pink-800"
      case "orthodontic":
        return "bg-teal-100 border-teal-300 hover:bg-teal-200 text-teal-800"
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

  const handleToothClick = (toothNumber: string, event?: React.MouseEvent) => {
    const tooth = toothData[toothNumber]
    if (tooth?.status === "missing" || readOnly) {
      return
    }

    // Handle multiple selection with Ctrl+click
    if (multiSelectMode && event?.ctrlKey) {
      const newSelectedTeeth = selectedTeeth.includes(toothNumber)
        ? selectedTeeth.filter(tooth => tooth !== toothNumber)
        : [...selectedTeeth, toothNumber]

      if (externalSelectedTeeth) {
        onMultipleToothSelect?.(newSelectedTeeth)
      } else {
        setInternalSelectedTeeth(newSelectedTeeth)
      }

      console.log(`🦷 Multi-select: ${newSelectedTeeth.length} teeth selected:`, newSelectedTeeth)
      return
    }

    // Single selection mode (default behavior)
    if (onToothSelect) {
      onToothSelect(toothNumber)
    } else {
      // Fallback to old dialog only if no onToothSelect callback is provided
      setInternalSelectedTooth(toothNumber)
      setIsDialogOpen(true)
    }
  }

  const handleToothRightClick = (toothNumber: string, event: React.MouseEvent) => {
    event.preventDefault()

    if (readOnly) return

    // Show quick context menu for tooth status
    const contextMenu = document.createElement('div')
    contextMenu.className = 'fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-48'
    contextMenu.style.left = event.clientX + 'px'
    contextMenu.style.top = event.clientY + 'px'

    // Add header
    const header = document.createElement('div')
    header.className = 'px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100'
    header.textContent = `Tooth ${toothNumber} - Quick Actions`
    contextMenu.appendChild(header)

    const quickOptions = [
      { status: 'healthy', label: 'Healthy', color: 'text-green-600', icon: '✓' },
      { status: 'caries', label: 'Caries', color: 'text-red-600', icon: '⚠' },
      { status: 'filled', label: 'Filled', color: 'text-blue-600', icon: '●' },
      { status: 'crown', label: 'Crown', color: 'text-yellow-600', icon: '♕' },
      { status: 'missing', label: 'Missing', color: 'text-gray-600', icon: '×' },
      { status: 'attention', label: 'Needs Attention', color: 'text-orange-600', icon: '!' },
      { status: 'root_canal', label: 'Root Canal', color: 'text-purple-600', icon: '⚡' },
      { status: 'extraction_needed', label: 'Extraction Needed', color: 'text-red-800', icon: '🗑' },
      { status: 'implant', label: 'Implant', color: 'text-cyan-600', icon: '🔧' },
      { status: 'bridge', label: 'Bridge', color: 'text-indigo-600', icon: '🌉' },
      { status: 'veneer', label: 'Veneer', color: 'text-pink-600', icon: '✨' },
      { status: 'orthodontic', label: 'Orthodontic', color: 'text-teal-600', icon: '⬜' }
    ]

    quickOptions.forEach(option => {
      const button = document.createElement('button')
      button.className = `block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${option.color}`
      button.innerHTML = `<span class="text-base">${option.icon}</span><span>${option.label}</span>`
      button.onclick = () => {
        handleQuickStatusChange(toothNumber, option.status as ToothData['status'])
        try {
          if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu)
          }
        } catch (error) {
          console.warn('Context menu already removed:', error)
        }
      }
      contextMenu.appendChild(button)
    })

    // Add divider and full diagnosis option
    const divider = document.createElement('div')
    divider.className = 'border-t border-gray-200 my-2'
    contextMenu.appendChild(divider)

    const fullDiagnosisButton = document.createElement('button')
    fullDiagnosisButton.className = 'block w-full px-4 py-3 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium transition-colors duration-150 flex items-center gap-2'
    fullDiagnosisButton.innerHTML = '<span class="text-base">📋</span><span>Full Diagnosis & Treatment</span>'
    fullDiagnosisButton.onclick = () => {
      handleToothClick(toothNumber)
      try {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu)
        }
      } catch (error) {
        console.warn('Context menu already removed:', error)
      }
    }
    contextMenu.appendChild(fullDiagnosisButton)

    document.body.appendChild(contextMenu)

    // Remove context menu when clicking elsewhere
    const removeMenu = (e: Event) => {
      if (!contextMenu.contains(e.target as Node)) {
        try {
          if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu)
          }
        } catch (error) {
          console.warn('Context menu already removed:', error)
        }
        document.removeEventListener('click', removeMenu)
      }
    }
    setTimeout(() => document.addEventListener('click', removeMenu), 100)
  }

  const handleQuickStatusChange = async (toothNumber: string, status: ToothData['status']) => {
    const colorMap = {
      'healthy': '#22c55e',
      'caries': '#ef4444',
      'filled': '#3b82f6',
      'crown': '#eab308',
      'missing': '#6b7280',
      'attention': '#f97316',
      'root_canal': '#8b5cf6',
      'extraction_needed': '#dc2626',
      'implant': '#10b981'
    }

    // Create tooth data for the status change
    const updatedToothData = {
      currentStatus: status,
      selectedDiagnoses: [getDefaultDiagnosis(status)],
      selectedTreatments: [getDefaultTreatment(status)],
      diagnosisDetails: `Quick status change to ${status}`,
      examinationDate: new Date().toISOString().split('T')[0],
      symptoms: [],
      diagnosticNotes: `Status updated via right-click menu`,
      priority: status === 'extraction_needed' ? 'urgent' :
                status === 'attention' || status === 'caries' ? 'high' : 'medium',
      treatmentDetails: getDefaultTreatment(status),
      duration: '30',
      estimatedCost: '',
      scheduledDate: '',
      treatmentNotes: `Quick action: ${status}`,
      followUpRequired: ['attention', 'caries', 'extraction_needed'].includes(status)
    }

    // If we have a status change callback (enhanced consultation mode), use it
    if (onToothStatusChange) {
      console.log(`🦷 Quick status change (callback mode) - Tooth ${toothNumber}: ${status}`)
      onToothStatusChange(toothNumber, status, updatedToothData)
      return
    }

    // Otherwise, use the original database save logic for standalone mode
    if (!patientId) {
      console.warn('No patient ID provided for saving tooth data')
      return
    }

    // Prepare tooth diagnosis data for database save
    const toothDiagnosisData: ToothDiagnosisData = {
      patientId,
      consultationId,
      toothNumber,
      status: status as any, // Convert to our ToothDiagnosisData status type
      primaryDiagnosis: getDefaultDiagnosis(status),
      recommendedTreatment: getDefaultTreatment(status),
      treatmentPriority: status === 'extraction_needed' ? 'urgent' :
                        status === 'attention' || status === 'caries' ? 'high' : 'medium',
      colorCode: colorMap[status] || '#22c55e',
      followUpRequired: ['attention', 'caries', 'extraction_needed'].includes(status),
      examinationDate: new Date().toISOString().split('T')[0],
      notes: `Quick status change to ${status} via dental chart`
    }

    // Save to database
    try {
      const result = await saveToothDiagnosis(toothDiagnosisData)
      if (result.success) {
        console.log(`🦷 Quick status change saved - Tooth ${toothNumber}: ${status}`)
        // Data will be automatically updated via real-time subscription
      } else {
        console.error('Failed to save tooth diagnosis:', result.error)
        setError(result.error || 'Failed to save tooth diagnosis')
      }
    } catch (error) {
      console.error('Error saving tooth diagnosis:', error)
      setError('Failed to save tooth diagnosis')
    }

    // Only update internal tooth data if we're not using patient data
    if (!patientId && !externalToothData) {
      setInternalToothData(prev => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          number: toothNumber,
          status,
          date: new Date().toISOString().split('T')[0],
          diagnosis: getDefaultDiagnosis(status),
          treatment: getDefaultTreatment(status)
        }
      }))
    }
  }

  const getDefaultDiagnosis = (status: ToothData['status']): string => {
    const diagnoses = {
      'healthy': 'Healthy tooth',
      'caries': 'Dental caries detected',
      'filled': 'Restored with filling',
      'crown': 'Crown restoration',
      'missing': 'Tooth missing',
      'attention': 'Requires clinical evaluation',
      'root_canal': 'Root canal therapy',
      'extraction_needed': 'Extraction indicated',
      'implant': 'Dental implant'
    }
    return diagnoses[status] || ''
  }

  const getDefaultTreatment = (status: ToothData['status']): string => {
    const treatments = {
      'healthy': 'Routine maintenance',
      'caries': 'Filling required',
      'filled': 'Monitor restoration',
      'crown': 'Monitor crown',
      'missing': 'Consider replacement',
      'attention': 'Further examination needed',
      'root_canal': 'RCT completed',
      'extraction_needed': 'Schedule extraction',
      'implant': 'Implant placed'
    }
    return treatments[status] || ''
  }

  const handleSaveToothData = (toothNumber: string, data: Partial<ToothData>) => {
    // This function is for the legacy dialog - not used with patient data
    if (!patientId && !externalToothData) {
      setInternalToothData(prev => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          number: toothNumber,
          status: "healthy",
          ...data,
          date: new Date().toISOString().split('T')[0]
        }
      }))
    }
    setIsDialogOpen(false)
    setInternalSelectedTooth(null)
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
          ${selectedTeeth.includes(toothNumber) ? "ring-2 ring-purple-500 ring-offset-1 bg-purple-50" : ""}
        `}
        onClick={(e) => handleToothClick(toothNumber, e)}
        onContextMenu={(e) => handleToothRightClick(toothNumber, e)}
        title={`Tooth ${toothNumber}${tooth.diagnosis ? ` - ${tooth.diagnosis}` : ""}\nLeft click: Full diagnosis | Right click: Quick options${multiSelectMode ? ' | Ctrl+Click: Multi-select' : ''}`}
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
                    <Select defaultValue={tooth.status || "healthy"} onValueChange={(value) => {
                      // Handle status change - for patient data, this should save to database
                      if (patientId) {
                        handleQuickStatusChange(selectedTooth, value as ToothData['status'])
                      } else {
                        // Update internal data for non-patient mode
                        const newData = { ...tooth, status: value as ToothData['status'] }
                        setInternalToothData(prev => ({ ...prev, [selectedTooth]: newData }))
                      }
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
                    <Select defaultValue={tooth.diagnosis || ""}>
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
                          <input type="checkbox" className="rounded" defaultChecked={false} />
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
                    <Select defaultValue={tooth.treatment || ""}>
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
                        <input 
                          type="radio" 
                          name="followup" 
                          value="yes" 
                          checked={followUpRequired === "yes"}
                          onChange={(e) => setFollowUpRequired(e.target.value)}
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="followup" 
                          value="no" 
                          checked={followUpRequired === "no"}
                          onChange={(e) => setFollowUpRequired(e.target.value)}
                        />
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
                  setInternalSelectedTooth(null)
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

  // Calculate real-time statistics
  const allTeeth = [...upperTeeth, ...lowerTeeth]
  const stats = allTeeth.reduce((acc, toothNumber) => {
    const tooth = toothData[toothNumber]
    const status = tooth?.status || 'healthy'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const healthyCount = stats.healthy || 0
  const cariesCount = stats.caries || 0
  const filledCount = stats.filled || 0
  const crownCount = stats.crown || 0
  const rootCanalCount = stats.root_canal || 0
  const needsAttentionCount = stats.attention || 0
  const missingCount = stats.missing || 0
  const extractionNeededCount = stats.extraction_needed || 0

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

      {/* Multi-select Control Panel */}
      {multiSelectMode && selectedTeeth.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {selectedTeeth.length} teeth selected
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Teeth: {selectedTeeth.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (externalSelectedTeeth) {
                      onMultipleToothSelect?.([])
                    } else {
                      setInternalSelectedTeeth([])
                    }
                  }}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (onToothSelect) {
                      // Create a combined tooth number for multi-select (e.g., "11,12,13")
                      const combinedToothNumbers = selectedTeeth.sort((a, b) => parseInt(a) - parseInt(b)).join(',')
                      onToothSelect(combinedToothNumbers)
                      console.log(`🦷 Multi-select diagnosis: Opening interface for teeth ${combinedToothNumbers}`)
                    }
                  }}
                >
                  Diagnose Selected
                </Button>
                <Select onValueChange={(status) => {
                  selectedTeeth.forEach(toothNumber => {
                    handleQuickStatusChange(toothNumber, status as ToothData['status'])
                  })
                  console.log(`🦷 Bulk status change: ${selectedTeeth.length} teeth set to ${status}`)
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Bulk Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Set All Healthy</SelectItem>
                    <SelectItem value="caries">Set All Caries</SelectItem>
                    <SelectItem value="filled">Set All Filled</SelectItem>
                    <SelectItem value="crown">Set All Crown</SelectItem>
                    <SelectItem value="missing">Set All Missing</SelectItem>
                    <SelectItem value="attention">Set All Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions for Multi-select */}
      {multiSelectMode && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-1">Multi-select Mode Active</p>
          <p>Hold <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl</kbd> and click teeth to select multiple. Selected teeth will have a purple border.</p>
        </div>
      )}

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

      {/* Real-time Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-green-600">{healthyCount}</div>
            <div className="text-xs text-gray-600">Healthy</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-red-600">{cariesCount}</div>
            <div className="text-xs text-gray-600">Caries</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{filledCount}</div>
            <div className="text-xs text-gray-600">Filled</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-yellow-600">{crownCount}</div>
            <div className="text-xs text-gray-600">Crown</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-purple-600">{rootCanalCount}</div>
            <div className="text-xs text-gray-600">RCT</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-orange-600">{needsAttentionCount}</div>
            <div className="text-xs text-gray-600">Attention</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-gray-600">{missingCount}</div>
            <div className="text-xs text-gray-600">Missing</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-red-800">{extractionNeededCount}</div>
            <div className="text-xs text-gray-600">Extraction</div>
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

      {/* Tooth Diagnosis Dialog */}
      <ToothDiagnosisDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setInternalSelectedTooth(null)
        }}
        toothNumber={selectedTooth || ''}
        patientId={patientId}
        consultationId={consultationId}
        existingData={selectedTooth ? realTimeToothData[selectedTooth] : undefined}
        onDataSaved={() => {
          // Reload data after successful save
          loadToothData()
          setIsDialogOpen(false)
          setInternalSelectedTooth(null)
        }}
      />
    </div>
  )
}
