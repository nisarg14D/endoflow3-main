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
import { Clock, TrendingUp, TrendingDown, Zap, Shield } from "lucide-react"

interface PainCharacteristics {
  quality: string
  severity: number
  timing: string
  onset: string
  duration: string
  frequency: string
}

interface HOPIData {
  pain_characteristics: PainCharacteristics
  aggravating_factors: string[]
  relieving_factors: string[]
  associated_symptoms: string[]
  previous_episodes: string
  previous_treatments: string[]
  response_to_treatment: string
  chronology: string
  pattern_changes: string
  impact_on_daily_life: string[]
}

interface HOPITabProps {
  data: HOPIData
  onChange: (data: HOPIData) => void
  isReadOnly?: boolean
}

export function HOPITab({ data, onChange, isReadOnly = false }: HOPITabProps) {
  const [localData, setLocalData] = useState<HOPIData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof HOPIData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const handlePainCharacteristicUpdate = (field: keyof PainCharacteristics, value: any) => {
    const updatedPainChar = { ...localData.pain_characteristics, [field]: value }
    handleUpdate('pain_characteristics', updatedPainChar)
  }

  const toggleArrayItem = (field: keyof HOPIData, item: string) => {
    const currentArray = (localData[field] as string[]) || []
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]

    handleUpdate(field, updatedArray)
  }

  const painQualityOptions = [
    "Sharp", "Stabbing", "Throbbing", "Pulsating", "Dull", "Aching",
    "Burning", "Shooting", "Cramping", "Pressure-like", "Tight", "Heavy"
  ]

  const timingOptions = [
    "Constant", "Intermittent", "Episodic", "Progressive", "Sudden onset",
    "Gradual onset", "Morning worse", "Evening worse", "Night pain"
  ]

  const onsetOptions = [
    "Spontaneous", "After trauma", "After dental procedure", "While eating",
    "After cold exposure", "After heat exposure", "During stress", "Unknown"
  ]

  const frequencyOptions = [
    "Constant", "Several times daily", "Daily", "Few times per week",
    "Weekly", "Monthly", "Intermittent", "First episode"
  ]

  const aggravatingFactors = [
    "Hot food/drinks", "Cold food/drinks", "Sweet foods", "Sour foods",
    "Chewing", "Biting down", "Pressure", "Touch", "Brushing teeth",
    "Air exposure", "Lying down", "Physical activity", "Stress", "Fatigue"
  ]

  const relievingFactors = [
    "Cold application", "Heat application", "Pain medications", "Antibiotics",
    "Avoiding chewing", "Soft diet", "Salt water rinse", "Rest", "Elevation",
    "Specific position", "Distraction", "Nothing helps"
  ]

  const associatedSymptoms = [
    "Facial swelling", "Gum swelling", "Difficulty swallowing", "Difficulty opening mouth",
    "Fever", "Malaise", "Headache", "Earache", "Neck pain", "Bad taste",
    "Bad breath", "Bleeding gums", "Discharge", "Numbness", "Tingling"
  ]

  const previousTreatments = [
    "Over-the-counter pain relief", "Prescription pain medication", "Antibiotics",
    "Home remedies", "Dental cleaning", "Filling", "Root canal", "Extraction",
    "Crown", "Previous dental visit", "Emergency room visit", "No treatment"
  ]

  const dailyLifeImpact = [
    "Sleep disturbance", "Eating difficulties", "Speaking problems", "Work absence",
    "Social activities affected", "Mood changes", "Anxiety", "Depression",
    "Concentration problems", "Exercise limitations"
  ]

  const getSeverityColor = (severity: number) => {
    if (severity === 0) return "text-gray-400"
    if (severity <= 3) return "text-green-600"
    if (severity <= 6) return "text-yellow-600"
    if (severity <= 8) return "text-orange-600"
    return "text-red-600"
  }

  const getSeverityDescription = (severity: number) => {
    if (severity === 0) return "No pain"
    if (severity <= 3) return "Mild pain"
    if (severity <= 6) return "Moderate pain"
    if (severity <= 8) return "Severe pain"
    return "Extreme pain"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">History of Present Illness (HOPI)</h3>
        </div>
        <p className="text-sm text-purple-700">Detailed chronological account of the current problem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pain Characteristics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Pain Characteristics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pain quality/type</Label>
                <Select
                  value={localData.pain_characteristics.quality}
                  onValueChange={(value) => handlePainCharacteristicUpdate('quality', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Describe the pain quality..." />
                  </SelectTrigger>
                  <SelectContent>
                    {painQualityOptions.map(quality => (
                      <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Current Pain Severity (0-10)
                  <Badge variant="outline" className={getSeverityColor(localData.pain_characteristics.severity)}>
                    {localData.pain_characteristics.severity}/10
                  </Badge>
                </Label>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={localData.pain_characteristics.severity}
                    onChange={(e) => handlePainCharacteristicUpdate('severity', parseInt(e.target.value))}
                    className="w-full"
                    disabled={isReadOnly}
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {getSeverityDescription(localData.pain_characteristics.severity)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timing pattern</Label>
                  <Select
                    value={localData.pain_characteristics.timing}
                    onValueChange={(value) => handlePainCharacteristicUpdate('timing', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="When does it occur..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timingOptions.map(timing => (
                        <SelectItem key={timing} value={timing}>{timing}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>How it started</Label>
                  <Select
                    value={localData.pain_characteristics.onset}
                    onValueChange={(value) => handlePainCharacteristicUpdate('onset', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Onset type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {onsetOptions.map(onset => (
                        <SelectItem key={onset} value={onset}>{onset}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration of each episode</Label>
                  <Input
                    value={localData.pain_characteristics.duration}
                    onChange={(e) => handlePainCharacteristicUpdate('duration', e.target.value)}
                    placeholder="e.g., 5 minutes, 2 hours..."
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={localData.pain_characteristics.frequency}
                    onValueChange={(value) => handlePainCharacteristicUpdate('frequency', value)}
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
              </div>
            </CardContent>
          </Card>

          {/* Chronology */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Chronological History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Timeline of events (chronological order)</Label>
                <Textarea
                  value={localData.chronology}
                  onChange={(e) => handleUpdate('chronology', e.target.value)}
                  placeholder="Describe when the problem started, how it progressed, any changes over time..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Previous similar episodes</Label>
                <Textarea
                  value={localData.previous_episodes}
                  onChange={(e) => handleUpdate('previous_episodes', e.target.value)}
                  placeholder="Has this happened before? When? How similar was it?"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Pattern changes over time</Label>
                <Textarea
                  value={localData.pattern_changes}
                  onChange={(e) => handleUpdate('pattern_changes', e.target.value)}
                  placeholder="Is it getting better, worse, or staying the same? Any changes in pattern?"
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Aggravating Factors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                What Makes It Worse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {aggravatingFactors.map(factor => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={`aggravating-${factor}`}
                      checked={(localData.aggravating_factors || []).includes(factor)}
                      onCheckedChange={() => toggleArrayItem('aggravating_factors', factor)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`aggravating-${factor}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {factor}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relieving Factors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                What Makes It Better
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {relievingFactors.map(factor => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={`relieving-${factor}`}
                      checked={(localData.relieving_factors || []).includes(factor)}
                      onCheckedChange={() => toggleArrayItem('relieving_factors', factor)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`relieving-${factor}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {factor}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Associated Symptoms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Associated Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {associatedSymptoms.map(symptom => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={`associated-${symptom}`}
                      checked={(localData.associated_symptoms || []).includes(symptom)}
                      onCheckedChange={() => toggleArrayItem('associated_symptoms', symptom)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`associated-${symptom}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Treatments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Previous Treatments & Response
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Previous treatments tried</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {previousTreatments.map(treatment => (
                <div key={treatment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`treatment-${treatment}`}
                    checked={(localData.previous_treatments || []).includes(treatment)}
                    onCheckedChange={() => toggleArrayItem('previous_treatments', treatment)}
                    disabled={isReadOnly}
                  />
                  <Label
                    htmlFor={`treatment-${treatment}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {treatment}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label>Response to previous treatments</Label>
              <Textarea
                value={localData.response_to_treatment}
                onChange={(e) => handleUpdate('response_to_treatment', e.target.value)}
                placeholder="How effective were the treatments? Did any provide relief?"
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label>Impact on daily life</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {dailyLifeImpact.map(impact => (
                  <div key={impact} className="flex items-center space-x-2">
                    <Checkbox
                      id={`impact-${impact}`}
                      checked={(localData.impact_on_daily_life || []).includes(impact)}
                      onCheckedChange={() => toggleArrayItem('impact_on_daily_life', impact)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`impact-${impact}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {impact}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {localData.pain_characteristics.quality && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-700">HOPI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              <strong>Pain Character:</strong> {localData.pain_characteristics.quality} pain,
              {localData.pain_characteristics.severity}/10 severity, {localData.pain_characteristics.timing} pattern
              {localData.pain_characteristics.frequency && <span>, {localData.pain_characteristics.frequency}</span>}
            </p>
            {(localData.aggravating_factors?.length > 0 || localData.relieving_factors?.length > 0) && (
              <div className="mt-2 text-sm text-purple-700">
                {localData.aggravating_factors?.length > 0 && (
                  <div><strong>Aggravated by:</strong> {localData.aggravating_factors.join(', ')}</div>
                )}
                {localData.relieving_factors?.length > 0 && (
                  <div><strong>Relieved by:</strong> {localData.relieving_factors.join(', ')}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}