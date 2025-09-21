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
import { AlertTriangle, Heart, Pill, Shield, Plus, X } from "lucide-react"

interface MedicalCondition {
  condition: string
  status: 'current' | 'past' | 'family_history'
  details: string
  duration: string
  medication: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  indication: string
  duration: string
}

interface Allergy {
  allergen: string
  type: 'drug' | 'food' | 'environmental' | 'other'
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
}

interface MedicalHistoryData {
  medical_conditions: MedicalCondition[]
  current_medications: Medication[]
  allergies: Allergy[]
  previous_dental_treatments: string[]
  hospitalizations: string[]
  surgical_history: string[]
  family_medical_history: string[]
  immunizations: string[]
  social_history: string
  pregnancy_status: string
  menstrual_history: string
}

interface MedicalHistoryTabProps {
  data: MedicalHistoryData
  onChange: (data: MedicalHistoryData) => void
  isReadOnly?: boolean
}

export function MedicalHistoryTab({ data, onChange, isReadOnly = false }: MedicalHistoryTabProps) {
  const [localData, setLocalData] = useState<MedicalHistoryData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof MedicalHistoryData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const addMedicalCondition = () => {
    const newCondition: MedicalCondition = {
      condition: '',
      status: 'current',
      details: '',
      duration: '',
      medication: ''
    }
    handleUpdate('medical_conditions', [...(localData.medical_conditions || []), newCondition])
  }

  const updateMedicalCondition = (index: number, field: keyof MedicalCondition, value: string) => {
    const conditions = [...(localData.medical_conditions || [])]
    conditions[index] = { ...conditions[index], [field]: value }
    handleUpdate('medical_conditions', conditions)
  }

  const removeMedicalCondition = (index: number) => {
    const conditions = localData.medical_conditions?.filter((_, i) => i !== index) || []
    handleUpdate('medical_conditions', conditions)
  }

  const addMedication = () => {
    const newMedication: Medication = {
      name: '',
      dosage: '',
      frequency: '',
      indication: '',
      duration: ''
    }
    handleUpdate('current_medications', [...(localData.current_medications || []), newMedication])
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const medications = [...(localData.current_medications || [])]
    medications[index] = { ...medications[index], [field]: value }
    handleUpdate('current_medications', medications)
  }

  const removeMedication = (index: number) => {
    const medications = localData.current_medications?.filter((_, i) => i !== index) || []
    handleUpdate('current_medications', medications)
  }

  const addAllergy = () => {
    const newAllergy: Allergy = {
      allergen: '',
      type: 'drug',
      reaction: '',
      severity: 'mild'
    }
    handleUpdate('allergies', [...(localData.allergies || []), newAllergy])
  }

  const updateAllergy = (index: number, field: keyof Allergy, value: string) => {
    const allergies = [...(localData.allergies || [])]
    allergies[index] = { ...allergies[index], [field]: value }
    handleUpdate('allergies', allergies)
  }

  const removeAllergy = (index: number) => {
    const allergies = localData.allergies?.filter((_, i) => i !== index) || []
    handleUpdate('allergies', allergies)
  }

  const toggleArrayItem = (field: keyof MedicalHistoryData, item: string) => {
    const currentArray = (localData[field] as string[]) || []
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    handleUpdate(field, updatedArray)
  }

  const commonMedicalConditions = [
    "Diabetes Mellitus", "Hypertension", "Heart Disease", "Asthma", "COPD",
    "Thyroid Disorders", "Kidney Disease", "Liver Disease", "Arthritis",
    "Cancer", "HIV/AIDS", "Hepatitis", "Tuberculosis", "Epilepsy",
    "Depression", "Anxiety", "Bleeding Disorders", "Osteoporosis"
  ]

  const dentalTreatments = [
    "Routine cleaning", "Fillings", "Root canal therapy", "Crown placement",
    "Tooth extraction", "Dental implants", "Braces/Orthodontics", "Dentures",
    "Gum disease treatment", "Oral surgery", "Whitening", "Veneers"
  ]

  const commonSurgeries = [
    "Appendectomy", "Cholecystectomy", "Hernia repair", "Cardiac surgery",
    "Orthopedic surgery", "Eye surgery", "Gynecological surgery", "Neurosurgery",
    "Plastic surgery", "Oral surgery"
  ]

  const immunizations = [
    "COVID-19", "Influenza (annual)", "Hepatitis B", "Tetanus", "MMR",
    "Polio", "HPV", "Pneumococcal", "Meningococcal", "Varicella"
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Medical History</h3>
        </div>
        <p className="text-sm text-green-700">Complete medical background including conditions, medications, and allergies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Medical Conditions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Medical Conditions
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMedicalCondition}
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick checkboxes for common conditions */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Common Conditions</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {commonMedicalConditions.map(condition => {
                    const hasCondition = (localData.medical_conditions || []).some(c => c.condition === condition)
                    return (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={hasCondition}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const newCondition: MedicalCondition = {
                                condition,
                                status: 'current',
                                details: '',
                                duration: '',
                                medication: ''
                              }
                              handleUpdate('medical_conditions', [...(localData.medical_conditions || []), newCondition])
                            } else {
                              const conditions = localData.medical_conditions?.filter(c => c.condition !== condition) || []
                              handleUpdate('medical_conditions', conditions)
                            }
                          }}
                          disabled={isReadOnly}
                        />
                        <Label
                          htmlFor={`condition-${condition}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {condition}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detailed conditions */}
              {(localData.medical_conditions || []).map((condition, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={condition.condition}
                        onChange={(e) => updateMedicalCondition(index, 'condition', e.target.value)}
                        placeholder="Medical condition..."
                        disabled={isReadOnly}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicalCondition(index)}
                        disabled={isReadOnly}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={condition.status}
                        onValueChange={(value) => updateMedicalCondition(index, 'status', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="past">Past</SelectItem>
                          <SelectItem value="family_history">Family History</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={condition.duration}
                        onChange={(e) => updateMedicalCondition(index, 'duration', e.target.value)}
                        placeholder="Duration..."
                        disabled={isReadOnly}
                      />
                    </div>

                    <Textarea
                      value={condition.details}
                      onChange={(e) => updateMedicalCondition(index, 'details', e.target.value)}
                      placeholder="Details about condition..."
                      rows={2}
                      disabled={isReadOnly}
                    />

                    <Input
                      value={condition.medication}
                      onChange={(e) => updateMedicalCondition(index, 'medication', e.target.value)}
                      placeholder="Related medications..."
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Previous Dental Treatments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Previous Dental Treatments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {dentalTreatments.map(treatment => (
                  <div key={treatment} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dental-${treatment}`}
                      checked={(localData.previous_dental_treatments || []).includes(treatment)}
                      onCheckedChange={() => toggleArrayItem('previous_dental_treatments', treatment)}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`dental-${treatment}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {treatment}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Medications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-500" />
                  Current Medications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(localData.current_medications || []).map((medication, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Medication name..."
                        disabled={isReadOnly}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        disabled={isReadOnly}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="Dosage..."
                        disabled={isReadOnly}
                      />
                      <Input
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="Frequency..."
                        disabled={isReadOnly}
                      />
                    </div>

                    <Input
                      value={medication.indication}
                      onChange={(e) => updateMedication(index, 'indication', e.target.value)}
                      placeholder="What it's for..."
                      disabled={isReadOnly}
                    />

                    <Input
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="How long taking it..."
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>
              ))}

              {(localData.current_medications || []).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No current medications</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Allergies
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAllergy}
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(localData.allergies || []).map((allergy, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={allergy.allergen}
                        onChange={(e) => updateAllergy(index, 'allergen', e.target.value)}
                        placeholder="Allergen (e.g., Penicillin, Peanuts)..."
                        disabled={isReadOnly}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllergy(index)}
                        disabled={isReadOnly}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={allergy.type}
                        onValueChange={(value) => updateAllergy(index, 'type', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drug">Drug</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={allergy.severity}
                        onValueChange={(value) => updateAllergy(index, 'severity', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Textarea
                      value={allergy.reaction}
                      onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                      placeholder="Describe the reaction..."
                      rows={2}
                      disabled={isReadOnly}
                    />

                    <Badge variant="outline" className={getSeverityColor(allergy.severity)}>
                      {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)} {allergy.type} allergy
                    </Badge>
                  </CardContent>
                </Card>
              ))}

              {(localData.allergies || []).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No known allergies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Surgical History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-700">Surgical History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {commonSurgeries.map(surgery => (
                <div key={surgery} className="flex items-center space-x-2">
                  <Checkbox
                    id={`surgery-${surgery}`}
                    checked={(localData.surgical_history || []).includes(surgery)}
                    onCheckedChange={() => toggleArrayItem('surgical_history', surgery)}
                    disabled={isReadOnly}
                  />
                  <Label
                    htmlFor={`surgery-${surgery}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {surgery}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Immunizations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-700">Immunizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {immunizations.map(vaccine => (
                <div key={vaccine} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vaccine-${vaccine}`}
                    checked={(localData.immunizations || []).includes(vaccine)}
                    onCheckedChange={() => toggleArrayItem('immunizations', vaccine)}
                    disabled={isReadOnly}
                  />
                  <Label
                    htmlFor={`vaccine-${vaccine}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {vaccine}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Alerts Summary */}
      {((localData.allergies || []).length > 0 || (localData.medical_conditions || []).some(c => c.status === 'current')) && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Medical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(localData.allergies || []).map((allergy, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2 text-red-700 border-red-300">
                  {allergy.allergen} allergy ({allergy.severity})
                </Badge>
              ))}
              {(localData.medical_conditions || [])
                .filter(c => c.status === 'current')
                .map((condition, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2 text-orange-700 border-orange-300">
                    {condition.condition}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}