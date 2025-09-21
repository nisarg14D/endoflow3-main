'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Search, CheckCircle, AlertTriangle, Stethoscope, BookOpen } from "lucide-react"
import { InteractiveDentalChart } from "@/components/dentist/interactive-dental-chart"

interface Diagnosis {
  id: string
  type: 'provisional' | 'differential' | 'final'
  diagnosis_code: string
  diagnosis_name: string
  description: string
  confidence_level: number
  tooth_specific?: string[]
  supporting_evidence: string[]
  icd_code?: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
}

interface DiagnosisData {
  provisional_diagnoses: Diagnosis[]
  differential_diagnoses: Diagnosis[]
  final_diagnoses: Diagnosis[]
  tooth_specific_diagnoses: {
    [toothNumber: string]: {
      primary_diagnosis: Diagnosis | null
      secondary_diagnoses: Diagnosis[]
      clinical_findings: string
      radiographic_findings: string
      prognosis: string
    }
  }
  clinical_impression: string
  diagnostic_reasoning: string
  further_investigations_needed: boolean
  consultation_required: boolean
  specialist_referral: {
    required: boolean
    specialty: string
    reason: string
  }
}

interface DiagnosisTabProps {
  data: DiagnosisData
  onChange: (data: DiagnosisData) => void
  isReadOnly?: boolean
}

const COMMON_DIAGNOSES = [
  { code: 'K02.9', name: 'Dental caries, unspecified', category: 'Caries' },
  { code: 'K04.0', name: 'Pulpitis', category: 'Endodontic' },
  { code: 'K04.6', name: 'Periapical abscess', category: 'Endodontic' },
  { code: 'K05.0', name: 'Acute gingivitis', category: 'Periodontal' },
  { code: 'K05.3', name: 'Chronic periodontitis', category: 'Periodontal' },
  { code: 'K08.1', name: 'Complete loss of teeth', category: 'Missing teeth' },
  { code: 'K03.0', name: 'Excessive attrition of teeth', category: 'Wear' },
  { code: 'S02.5', name: 'Fracture of tooth', category: 'Trauma' },
  { code: 'K07.1', name: 'Anomalies of jaw-cranial base relationship', category: 'Orthodontic' },
]

export function DiagnosisTab({ data, onChange, isReadOnly = false }: DiagnosisTabProps) {
  const [localData, setLocalData] = useState<DiagnosisData>(data)
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof DiagnosisData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const addDiagnosis = (type: 'provisional' | 'differential' | 'final', isToothSpecific = false) => {
    const newDiagnosis: Diagnosis = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      diagnosis_code: '',
      diagnosis_name: '',
      description: '',
      confidence_level: 70,
      tooth_specific: isToothSpecific && selectedTooth ? [selectedTooth] : undefined,
      supporting_evidence: [],
      severity: 'moderate'
    }

    if (isToothSpecific && selectedTooth) {
      const currentToothData = localData.tooth_specific_diagnoses[selectedTooth] || {
        primary_diagnosis: null,
        secondary_diagnoses: [],
        clinical_findings: '',
        radiographic_findings: '',
        prognosis: ''
      }

      if (type === 'final' && !currentToothData.primary_diagnosis) {
        const updatedToothDiagnoses = {
          ...localData.tooth_specific_diagnoses,
          [selectedTooth]: {
            ...currentToothData,
            primary_diagnosis: newDiagnosis
          }
        }
        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
      } else {
        const updatedToothDiagnoses = {
          ...localData.tooth_specific_diagnoses,
          [selectedTooth]: {
            ...currentToothData,
            secondary_diagnoses: [...currentToothData.secondary_diagnoses, newDiagnosis]
          }
        }
        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
      }
    } else {
      const fieldName = `${type}_diagnoses` as keyof DiagnosisData
      const currentDiagnoses = localData[fieldName] as Diagnosis[]
      handleUpdate(fieldName, [...currentDiagnoses, newDiagnosis])
    }
  }

  const updateDiagnosis = (diagnosisId: string, field: keyof Diagnosis, value: any, type: 'provisional' | 'differential' | 'final' | 'tooth-specific') => {
    if (type === 'tooth-specific' && selectedTooth) {
      const toothData = localData.tooth_specific_diagnoses[selectedTooth]
      if (toothData?.primary_diagnosis?.id === diagnosisId) {
        const updatedToothDiagnoses = {
          ...localData.tooth_specific_diagnoses,
          [selectedTooth]: {
            ...toothData,
            primary_diagnosis: { ...toothData.primary_diagnosis, [field]: value }
          }
        }
        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
      } else {
        const updatedToothDiagnoses = {
          ...localData.tooth_specific_diagnoses,
          [selectedTooth]: {
            ...toothData,
            secondary_diagnoses: toothData.secondary_diagnoses.map(diag =>
              diag.id === diagnosisId ? { ...diag, [field]: value } : diag
            )
          }
        }
        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
      }
    } else {
      const fieldName = `${type}_diagnoses` as keyof DiagnosisData
      const currentDiagnoses = localData[fieldName] as Diagnosis[]
      const updatedDiagnoses = currentDiagnoses.map(diag =>
        diag.id === diagnosisId ? { ...diag, [field]: value } : diag
      )
      handleUpdate(fieldName, updatedDiagnoses)
    }
  }

  const selectCommonDiagnosis = (commonDiag: typeof COMMON_DIAGNOSES[0], type: 'provisional' | 'differential' | 'final') => {
    const newDiagnosis: Diagnosis = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      diagnosis_code: commonDiag.code,
      diagnosis_name: commonDiag.name,
      description: '',
      confidence_level: 80,
      supporting_evidence: [],
      severity: 'moderate',
      icd_code: commonDiag.code
    }

    const fieldName = `${type}_diagnoses` as keyof DiagnosisData
    const currentDiagnoses = localData[fieldName] as Diagnosis[]
    handleUpdate(fieldName, [...currentDiagnoses, newDiagnosis])
  }

  const getToothData = (toothNumber: string) => {
    return localData.tooth_specific_diagnoses[toothNumber] || {
      primary_diagnosis: null,
      secondary_diagnoses: [],
      clinical_findings: '',
      radiographic_findings: '',
      prognosis: ''
    }
  }

  const getOralCavityStatus = () => {
    const toothNumbers = Array.from({ length: 32 }, (_, i) => (i + 1).toString())
    const diagnosedTeeth = Object.keys(localData.tooth_specific_diagnoses).filter(tooth => {
      const toothData = localData.tooth_specific_diagnoses[tooth]
      return toothData.primary_diagnosis || toothData.secondary_diagnoses.length > 0
    })

    return {
      total: 32,
      healthy: toothNumbers.length - diagnosedTeeth.length,
      diagnosed: diagnosedTeeth.length,
      problematic: diagnosedTeeth.filter(tooth => {
        const toothData = localData.tooth_specific_diagnoses[tooth]
        return toothData.primary_diagnosis?.severity === 'severe' || toothData.primary_diagnosis?.severity === 'critical'
      }).length
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'mild': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredDiagnoses = COMMON_DIAGNOSES.filter(diag => {
    const matchesSearch = diag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diag.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || diag.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const oralStatus = getOralCavityStatus()

  return (
    <div className="space-y-6">
      {/* Interactive Dental Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Tooth-Specific Diagnosis Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InteractiveDentalChart
              onToothSelect={(toothNumber) => {
                setSelectedTooth(toothNumber)
                console.log(`Selected tooth ${toothNumber} for diagnosis`)
              }}
              toothData={{}}
              showLabels={true}
            />

            {/* Oral Cavity Status */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{oralStatus.total}</div>
                <div className="text-sm text-gray-600">Total Teeth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{oralStatus.healthy}</div>
                <div className="text-sm text-gray-600">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{oralStatus.diagnosed}</div>
                <div className="text-sm text-gray-600">Diagnosed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{oralStatus.problematic}</div>
                <div className="text-sm text-gray-600">Critical/Severe</div>
              </div>
            </div>

            {selectedTooth && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Selected: Tooth #{selectedTooth}
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-700">
                    {getToothData(selectedTooth).primary_diagnosis ? '1 Primary' : 'No Primary'}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700">
                    {getToothData(selectedTooth).secondary_diagnoses.length} Secondary
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Common Diagnoses Quick Select */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Quick Diagnosis Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search diagnoses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Caries">Caries</SelectItem>
                  <SelectItem value="Endodontic">Endodontic</SelectItem>
                  <SelectItem value="Periodontal">Periodontal</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                  <SelectItem value="Orthodontic">Orthodontic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDiagnoses.map((diag) => (
                <Card key={diag.code} className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {diag.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{diag.code}</span>
                    </div>
                    <h4 className="text-sm font-medium">{diag.name}</h4>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => selectCommonDiagnosis(diag, 'provisional')}
                        disabled={isReadOnly}
                      >
                        Provisional
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => selectCommonDiagnosis(diag, 'differential')}
                        disabled={isReadOnly}
                      >
                        Differential
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => selectCommonDiagnosis(diag, 'final')}
                        disabled={isReadOnly}
                      >
                        Final
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Diagnoses */}
        <div className="space-y-6">
          {/* Provisional Diagnoses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Provisional Diagnoses
                </CardTitle>
                <Button
                  onClick={() => addDiagnosis('provisional', false)}
                  size="sm"
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localData.provisional_diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} className="p-4 border-yellow-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = localData.provisional_diagnoses.filter(d => d.id !== diagnosis.id)
                          handleUpdate('provisional_diagnoses', updated)
                        }}
                        disabled={isReadOnly}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Diagnosis Code</Label>
                        <Input
                          value={diagnosis.diagnosis_code}
                          onChange={(e) => updateDiagnosis(diagnosis.id, 'diagnosis_code', e.target.value, 'provisional')}
                          placeholder="e.g., K02.9"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Confidence (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={diagnosis.confidence_level}
                          onChange={(e) => updateDiagnosis(diagnosis.id, 'confidence_level', parseInt(e.target.value), 'provisional')}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Diagnosis Name</Label>
                      <Input
                        value={diagnosis.diagnosis_name}
                        onChange={(e) => updateDiagnosis(diagnosis.id, 'diagnosis_name', e.target.value, 'provisional')}
                        placeholder="e.g., Dental caries"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label>Description & Notes</Label>
                      <Textarea
                        value={diagnosis.description}
                        onChange={(e) => updateDiagnosis(diagnosis.id, 'description', e.target.value, 'provisional')}
                        placeholder="Clinical findings and reasoning..."
                        rows={3}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {localData.provisional_diagnoses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No provisional diagnoses added</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Diagnoses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Final Diagnoses
                </CardTitle>
                <Button
                  onClick={() => addDiagnosis('final', false)}
                  size="sm"
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localData.final_diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} className="p-4 border-green-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-green-700">
                        CONFIRMED
                      </Badge>
                    </div>

                    <div>
                      <Label>Final Diagnosis</Label>
                      <Input
                        value={diagnosis.diagnosis_name}
                        onChange={(e) => updateDiagnosis(diagnosis.id, 'diagnosis_name', e.target.value, 'final')}
                        placeholder="Confirmed diagnosis"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label>ICD-10 Code</Label>
                      <Input
                        value={diagnosis.icd_code || ''}
                        onChange={(e) => updateDiagnosis(diagnosis.id, 'icd_code', e.target.value, 'final')}
                        placeholder="e.g., K02.9"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {localData.final_diagnoses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No final diagnoses confirmed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tooth-Specific and Clinical Assessment */}
        <div className="space-y-6">
          {/* Tooth-Specific Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Tooth-Specific Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTooth ? (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Tooth #{selectedTooth} Diagnosis</h4>
                  </div>

                  {/* Primary Diagnosis */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">Primary Diagnosis</Label>
                      {!getToothData(selectedTooth).primary_diagnosis && (
                        <Button
                          onClick={() => addDiagnosis('final', true)}
                          size="sm"
                          disabled={isReadOnly}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Primary
                        </Button>
                      )}
                    </div>

                    {getToothData(selectedTooth).primary_diagnosis ? (
                      <Card className="p-4 border-blue-200">
                        <div className="space-y-3">
                          <Badge className={getSeverityColor(getToothData(selectedTooth).primary_diagnosis!.severity)}>
                            PRIMARY - {getToothData(selectedTooth).primary_diagnosis!.severity.toUpperCase()}
                          </Badge>
                          <Input
                            value={getToothData(selectedTooth).primary_diagnosis!.diagnosis_name}
                            onChange={(e) => updateDiagnosis(getToothData(selectedTooth).primary_diagnosis!.id, 'diagnosis_name', e.target.value, 'tooth-specific')}
                            placeholder="Primary diagnosis for this tooth"
                            disabled={isReadOnly}
                          />
                        </div>
                      </Card>
                    ) : (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-sm">No primary diagnosis for tooth #{selectedTooth}</p>
                      </div>
                    )}
                  </div>

                  {/* Clinical Findings */}
                  <div>
                    <Label>Clinical Findings</Label>
                    <Textarea
                      value={getToothData(selectedTooth).clinical_findings}
                      onChange={(e) => {
                        const updatedToothDiagnoses = {
                          ...localData.tooth_specific_diagnoses,
                          [selectedTooth]: {
                            ...getToothData(selectedTooth),
                            clinical_findings: e.target.value
                          }
                        }
                        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
                      }}
                      placeholder="Clinical findings for this tooth..."
                      rows={3}
                      disabled={isReadOnly}
                    />
                  </div>

                  {/* Prognosis */}
                  <div>
                    <Label>Prognosis</Label>
                    <Select
                      value={getToothData(selectedTooth).prognosis}
                      onValueChange={(value) => {
                        const updatedToothDiagnoses = {
                          ...localData.tooth_specific_diagnoses,
                          [selectedTooth]: {
                            ...getToothData(selectedTooth),
                            prognosis: value
                          }
                        }
                        handleUpdate('tooth_specific_diagnoses', updatedToothDiagnoses)
                      }}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select prognosis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="hopeless">Hopeless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a tooth from the dental chart above</p>
                  <p className="text-sm">to add tooth-specific diagnosis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinical-impression">Clinical Impression</Label>
                <Textarea
                  id="clinical-impression"
                  value={localData.clinical_impression}
                  onChange={(e) => handleUpdate('clinical_impression', e.target.value)}
                  placeholder="Overall clinical impression..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label htmlFor="diagnostic-reasoning">Diagnostic Reasoning</Label>
                <Textarea
                  id="diagnostic-reasoning"
                  value={localData.diagnostic_reasoning}
                  onChange={(e) => handleUpdate('diagnostic_reasoning', e.target.value)}
                  placeholder="Reasoning behind the diagnosis..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="further-investigations"
                    checked={localData.further_investigations_needed}
                    onChange={(e) => handleUpdate('further_investigations_needed', e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="further-investigations" className="text-sm">
                    Further investigations needed
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="consultation-required"
                    checked={localData.consultation_required}
                    onChange={(e) => handleUpdate('consultation_required', e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="consultation-required" className="text-sm">
                    Specialist consultation required
                  </Label>
                </div>
              </div>

              {localData.consultation_required && (
                <Card className="p-4 bg-orange-50 border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-3">Specialist Referral</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Specialty Required</Label>
                      <Select
                        value={localData.specialist_referral.specialty}
                        onValueChange={(value) => handleUpdate('specialist_referral', {
                          ...localData.specialist_referral,
                          specialty: value
                        })}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="endodontics">Endodontics</SelectItem>
                          <SelectItem value="periodontics">Periodontics</SelectItem>
                          <SelectItem value="oral-surgery">Oral Surgery</SelectItem>
                          <SelectItem value="orthodontics">Orthodontics</SelectItem>
                          <SelectItem value="prosthodontics">Prosthodontics</SelectItem>
                          <SelectItem value="oral-pathology">Oral Pathology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Reason for Referral</Label>
                      <Textarea
                        value={localData.specialist_referral.reason}
                        onChange={(e) => handleUpdate('specialist_referral', {
                          ...localData.specialist_referral,
                          reason: e.target.value
                        })}
                        placeholder="Reason for specialist referral..."
                        rows={3}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}