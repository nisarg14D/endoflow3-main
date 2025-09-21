'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin, Thermometer } from "lucide-react"

interface ChiefComplaintData {
  primary_complaint: string
  onset_duration: string
  associated_symptoms: string[]
  severity_scale: number
  location_detail: string
  patient_description: string
  onset_type: string
  pain_scale: number
  frequency: string
  triggers: string[]
}

interface ChiefComplaintTabProps {
  data: ChiefComplaintData
  onChange: (data: ChiefComplaintData) => void
  isReadOnly?: boolean
}

export function ChiefComplaintTab({ data, onChange, isReadOnly = false }: ChiefComplaintTabProps) {
  const [localData, setLocalData] = useState<ChiefComplaintData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof ChiefComplaintData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const toggleSymptom = (symptom: string) => {
    const currentSymptoms = localData.associated_symptoms || []
    const updatedSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom]

    handleUpdate('associated_symptoms', updatedSymptoms)
  }

  const toggleTrigger = (trigger: string) => {
    const currentTriggers = localData.triggers || []
    const updatedTriggers = currentTriggers.includes(trigger)
      ? currentTriggers.filter(t => t !== trigger)
      : [...currentTriggers, trigger]

    handleUpdate('triggers', updatedTriggers)
  }

  const commonComplaints = [
    "Toothache", "Tooth sensitivity", "Gum pain", "Swelling", "Bleeding gums",
    "Bad taste", "Bad breath", "Broken tooth", "Lost filling", "Jaw pain",
    "Difficulty chewing", "Loose tooth", "White spots on teeth", "Mouth ulcers"
  ]

  const onsetOptions = [
    "Sudden onset", "Gradual onset", "After eating", "After procedure",
    "While sleeping", "In the morning", "During the day", "At night"
  ]

  const commonSymptoms = [
    "Sharp pain", "Throbbing pain", "Dull ache", "Burning sensation",
    "Sensitivity to hot", "Sensitivity to cold", "Sensitivity to sweet",
    "Pain while chewing", "Spontaneous pain", "Radiating pain",
    "Facial swelling", "Gum swelling", "Bleeding", "Discharge",
    "Metallic taste", "Dry mouth", "Difficulty opening mouth"
  ]

  const commonTriggers = [
    "Hot food/drinks", "Cold food/drinks", "Sweet foods", "Sour foods",
    "Chewing", "Biting", "Pressure", "Touch", "Air", "Lying down",
    "Stress", "Exercise", "Temperature changes"
  ]

  const durationOptions = [
    "Few minutes", "Few hours", "1 day", "2-3 days", "1 week",
    "2 weeks", "1 month", "Few months", "6 months", "1 year", "More than 1 year"
  ]

  const frequencyOptions = [
    "Constant", "Intermittent", "Only when triggered", "Daily", "Weekly",
    "Occasionally", "First time", "Recurring episodes"
  ]

  const getSeverityColor = (scale: number) => {
    if (scale === 0) return "text-gray-400"
    if (scale <= 3) return "text-green-600"
    if (scale <= 6) return "text-yellow-600"
    if (scale <= 8) return "text-orange-600"
    return "text-red-600"
  }

  const getSeverityLabel = (scale: number) => {
    if (scale === 0) return "No pain"
    if (scale <= 3) return "Mild"
    if (scale <= 6) return "Moderate"
    if (scale <= 8) return "Severe"
    return "Extreme"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Chief Complaint</h3>
        </div>
        <p className="text-sm text-blue-700">Record the patient's primary concern and presenting symptoms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Primary Complaint */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Primary Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Main concern</Label>
                <Select
                  value={localData.primary_complaint}
                  onValueChange={(value) => handleUpdate('primary_complaint', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary complaint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonComplaints.map(complaint => (
                      <SelectItem key={complaint} value={complaint}>{complaint}</SelectItem>
                    ))}
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Patient's description (in their own words)</Label>
                <Textarea
                  value={localData.patient_description}
                  onChange={(e) => handleUpdate('patient_description', e.target.value)}
                  placeholder="Record exactly what the patient says about their problem..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location and Onset */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location & Onset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Specific location</Label>
                <Input
                  value={localData.location_detail}
                  onChange={(e) => handleUpdate('location_detail', e.target.value)}
                  placeholder="e.g., Upper right back tooth, lower left gum..."
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>How it started</Label>
                  <Select
                    value={localData.onset_type}
                    onValueChange={(value) => handleUpdate('onset_type', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select onset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {onsetOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration</Label>
                  <Select
                    value={localData.onset_duration}
                    onValueChange={(value) => handleUpdate('onset_duration', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How long..." />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select
                  value={localData.frequency}
                  onValueChange={(value) => handleUpdate('frequency', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How often..." />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pain Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Pain Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Pain Scale (0-10)
                  <Badge variant="outline" className={getSeverityColor(localData.pain_scale)}>
                    {localData.pain_scale}/10 - {getSeverityLabel(localData.pain_scale)}
                  </Badge>
                </Label>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={localData.pain_scale}
                    onChange={(e) => handleUpdate('pain_scale', parseInt(e.target.value))}
                    className="w-full"
                    disabled={isReadOnly}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No pain</span>
                    <span>Moderate</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Symptoms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Associated Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {commonSymptoms.map(symptom => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={`symptom-${symptom}`}
                      checked={(localData.associated_symptoms || []).includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`symptom-${symptom}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Triggers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Pain Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {commonTriggers.map(trigger => (
                  <div key={trigger} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trigger-${trigger}`}
                      checked={(localData.triggers || []).includes(trigger)}
                      onCheckedChange={() => toggleTrigger(trigger)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`trigger-${trigger}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {trigger}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      {(localData.primary_complaint || localData.patient_description) && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-700">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              <strong>Chief Complaint:</strong> {localData.primary_complaint || "Not specified"}
              {localData.onset_duration && <span> for {localData.onset_duration}</span>}
              {localData.pain_scale > 0 && (
                <span className={getSeverityColor(localData.pain_scale)}>
                  {" "}(Pain: {localData.pain_scale}/10 - {getSeverityLabel(localData.pain_scale)})
                </span>
              )}
            </p>
            {localData.patient_description && (
              <p className="text-sm text-gray-600 mt-2 italic">
                "{localData.patient_description}"
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}