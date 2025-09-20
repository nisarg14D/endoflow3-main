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
}

export function InteractiveDentalChart({ onToothSelect, readOnly = false }: InteractiveDentalChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tooth {selectedTooth} - Diagnosis & Treatment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
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
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  defaultValue={tooth.date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                placeholder="Enter diagnosis..."
                defaultValue={tooth.diagnosis || ""}
              />
            </div>

            <div>
              <Label htmlFor="treatment">Treatment Plan</Label>
              <Input
                placeholder="Enter treatment plan..."
                defaultValue={tooth.treatment || ""}
              />
            </div>

            <div>
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                defaultValue={tooth.notes || ""}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleSaveToothData(selectedTooth, tooth)}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedTooth(null)
                }}
              >
                Cancel
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
    </div>
  )
}