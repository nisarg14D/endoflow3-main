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
import { FileImage, TestTube, Activity, Upload, Plus, X, Calendar, Clock } from "lucide-react"

interface RadiographicInvestigation {
  type: string[]
  findings: string
  interpretation: string
  date_taken: string
  uploaded_files: string[]
  quality: string
  pathology_detected: string[]
}

interface ClinicalTest {
  vitality_tests: VitalityTest[]
  percussion_tests: PercussionTest[]
  palpation_findings: PalpationTest[]
  mobility_assessment: MobilityTest[]
  thermal_tests: ThermalTest[]
}

interface VitalityTest {
  tooth_number: string
  test_type: string
  response: string
  notes: string
}

interface PercussionTest {
  tooth_number: string
  vertical_percussion: string
  horizontal_percussion: string
  notes: string
}

interface PalpationTest {
  location: string
  findings: string
  tenderness: string
  swelling: string
}

interface MobilityTest {
  tooth_number: string
  mobility_grade: string
  direction: string
  notes: string
}

interface ThermalTest {
  tooth_number: string
  cold_test: string
  heat_test: string
  notes: string
}

interface LaboratoryTest {
  test_name: string
  ordered_date: string
  result_date: string
  results: string
  reference_range: string
  interpretation: string
}

interface InvestigationsData {
  radiographic: RadiographicInvestigation
  clinical_tests: ClinicalTest
  laboratory: LaboratoryTest[]
  special_investigations: string[]
  recommendations: string
  follow_up_required: string[]
}

interface InvestigationsTabProps {
  data: InvestigationsData
  onChange: (data: InvestigationsData) => void
  isReadOnly?: boolean
}

export function InvestigationsTab({ data, onChange, isReadOnly = false }: InvestigationsTabProps) {
  const [localData, setLocalData] = useState<InvestigationsData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof InvestigationsData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const handleNestedUpdate = (section: keyof InvestigationsData, field: string, value: any) => {
    const updatedSection = { ...localData[section], [field]: value }
    handleUpdate(section, updatedSection)
  }

  const toggleArrayItem = (field: keyof InvestigationsData, item: string) => {
    const currentArray = (localData[field] as string[]) || []
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    handleUpdate(field, updatedArray)
  }

  const toggleNestedArrayItem = (section: keyof InvestigationsData, field: string, item: string) => {
    const currentSection = localData[section] as any
    const currentArray = currentSection[field] || []
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter((i: string) => i !== item)
      : [...currentArray, item]
    handleNestedUpdate(section, field, updatedArray)
  }

  // Add functions for managing arrays of tests
  const addVitalityTest = () => {
    const newTest: VitalityTest = { tooth_number: '', test_type: '', response: '', notes: '' }
    const currentTests = localData.clinical_tests.vitality_tests || []
    handleNestedUpdate('clinical_tests', 'vitality_tests', [...currentTests, newTest])
  }

  const updateVitalityTest = (index: number, field: keyof VitalityTest, value: string) => {
    const tests = [...(localData.clinical_tests.vitality_tests || [])]
    tests[index] = { ...tests[index], [field]: value }
    handleNestedUpdate('clinical_tests', 'vitality_tests', tests)
  }

  const removeVitalityTest = (index: number) => {
    const tests = localData.clinical_tests.vitality_tests?.filter((_, i) => i !== index) || []
    handleNestedUpdate('clinical_tests', 'vitality_tests', tests)
  }

  const addLabTest = () => {
    const newTest: LaboratoryTest = {
      test_name: '', ordered_date: '', result_date: '', results: '', reference_range: '', interpretation: ''
    }
    handleUpdate('laboratory', [...(localData.laboratory || []), newTest])
  }

  const updateLabTest = (index: number, field: keyof LaboratoryTest, value: string) => {
    const tests = [...(localData.laboratory || [])]
    tests[index] = { ...tests[index], [field]: value }
    handleUpdate('laboratory', tests)
  }

  const removeLabTest = (index: number) => {
    const tests = localData.laboratory?.filter((_, i) => i !== index) || []
    handleUpdate('laboratory', tests)
  }

  // Options for different investigation types
  const radiographicTypes = [
    "Intraoral Periapical (IOPA)", "Bitewing", "Occlusal", "Panoramic (OPG)",
    "Lateral Cephalometric", "CBCT", "CT Scan", "MRI", "Sialography"
  ]

  const pathologyOptions = [
    "Caries", "Periapical lesion", "Periodontal bone loss", "Impaction",
    "Root resorption", "Fracture", "Cyst", "Tumor", "Calcification",
    "Foreign body", "Sinus involvement", "TMJ pathology"
  ]

  const vitalityTestTypes = ["Cold test", "Heat test", "Electric pulp test", "Laser doppler", "Pulse oximetry"]
  const vitalityResponses = ["Positive", "Negative", "Delayed", "Hyperresponsive", "Hyporesponsive"]

  const percussionResponses = ["Positive", "Negative", "Mild positive", "Severe positive"]
  const mobilityGrades = ["Grade 0 (Normal)", "Grade 1 (Slight)", "Grade 2 (Moderate)", "Grade 3 (Severe)"]

  const specialInvestigations = [
    "Biopsy", "Fine needle aspiration", "Saliva testing", "Microbiological culture",
    "Sensitivity testing", "Histopathology", "Immunofluorescence", "Genetic testing",
    "Allergy testing", "Blood glucose monitoring"
  ]

  const followUpOptions = [
    "Repeat radiographs", "Laboratory follow-up", "Biopsy results", "Culture results",
    "Specialist consultation", "Monitoring healing", "Post-operative assessment"
  ]

  const commonLabTests = [
    "Complete Blood Count (CBC)", "Blood Glucose", "HbA1c", "PT/INR", "PTT",
    "Liver Function Tests", "Kidney Function Tests", "ESR", "CRP", "Vitamin D",
    "Calcium", "Phosphorus", "Alkaline Phosphatase", "HIV", "Hepatitis B/C"
  ]

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'text-green-600 bg-green-100'
      case 'Good': return 'text-blue-600 bg-blue-100'
      case 'Fair': return 'text-yellow-600 bg-yellow-100'
      case 'Poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getResponseColor = (response: string) => {
    if (response.includes('Positive') || response === 'Normal') return 'text-green-600 bg-green-100'
    if (response.includes('Negative')) return 'text-red-600 bg-red-100'
    if (response.includes('Delayed') || response.includes('Hypo')) return 'text-yellow-600 bg-yellow-100'
    if (response.includes('Hyper')) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-indigo-900">Investigations</h3>
        </div>
        <p className="text-sm text-indigo-700">Radiographic, clinical, and laboratory investigations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Radiographic Investigations */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-500" />
                Radiographic Investigations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Types of radiographs taken</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {radiographicTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`radio-${type}`}
                        checked={((localData.radiographic.type as string[]) || []).includes(type)}
                        onCheckedChange={() => toggleNestedArrayItem('radiographic', 'type', type)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`radio-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Image Quality</Label>
                <Select
                  value={localData.radiographic.quality}
                  onValueChange={(value) => handleNestedUpdate('radiographic', 'quality', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                {localData.radiographic.quality && (
                  <Badge variant="outline" className={`mt-2 ${getQualityColor(localData.radiographic.quality)}`}>
                    {localData.radiographic.quality} quality
                  </Badge>
                )}
              </div>

              <div>
                <Label>Date Taken</Label>
                <Input
                  type="date"
                  value={localData.radiographic.date_taken}
                  onChange={(e) => handleNestedUpdate('radiographic', 'date_taken', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Pathology Detected</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {pathologyOptions.map(pathology => (
                    <div key={pathology} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pathology-${pathology}`}
                        checked={((localData.radiographic.pathology_detected as string[]) || []).includes(pathology)}
                        onCheckedChange={() => toggleNestedArrayItem('radiographic', 'pathology_detected', pathology)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`pathology-${pathology}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {pathology}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Radiographic Findings</Label>
                <Textarea
                  value={localData.radiographic.findings}
                  onChange={(e) => handleNestedUpdate('radiographic', 'findings', e.target.value)}
                  placeholder="Describe what is visible in the radiographs..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Radiographic Interpretation</Label>
                <Textarea
                  value={localData.radiographic.interpretation}
                  onChange={(e) => handleNestedUpdate('radiographic', 'interpretation', e.target.value)}
                  placeholder="Clinical interpretation of the radiographic findings..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Upload Radiographs</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Drag and drop files or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled={isReadOnly}>
                    Choose Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Laboratory Tests */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-green-500" />
                  Laboratory Tests
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLabTest}
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(localData.laboratory || []).map((test, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={test.test_name}
                        onValueChange={(value) => updateLabTest(index, 'test_name', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test..." />
                        </SelectTrigger>
                        <SelectContent>
                          {commonLabTests.map(testName => (
                            <SelectItem key={testName} value={testName}>{testName}</SelectItem>
                          ))}
                          <SelectItem value="other">Other (specify)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLabTest(index)}
                        disabled={isReadOnly}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Ordered Date</Label>
                        <Input
                          type="date"
                          value={test.ordered_date}
                          onChange={(e) => updateLabTest(index, 'ordered_date', e.target.value)}
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Result Date</Label>
                        <Input
                          type="date"
                          value={test.result_date}
                          onChange={(e) => updateLabTest(index, 'result_date', e.target.value)}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Results</Label>
                      <Input
                        value={test.results}
                        onChange={(e) => updateLabTest(index, 'results', e.target.value)}
                        placeholder="Test results..."
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Reference Range</Label>
                      <Input
                        value={test.reference_range}
                        onChange={(e) => updateLabTest(index, 'reference_range', e.target.value)}
                        placeholder="Normal range..."
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Interpretation</Label>
                      <Textarea
                        value={test.interpretation}
                        onChange={(e) => updateLabTest(index, 'interpretation', e.target.value)}
                        placeholder="Clinical interpretation..."
                        rows={2}
                        disabled={isReadOnly}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(localData.laboratory || []).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No laboratory tests ordered</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Clinical Tests */}
        <div className="space-y-6">
          {/* Vitality Tests */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  Vitality Tests
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVitalityTest}
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(localData.clinical_tests.vitality_tests || []).map((test, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <Input
                          value={test.tooth_number}
                          onChange={(e) => updateVitalityTest(index, 'tooth_number', e.target.value)}
                          placeholder="Tooth #"
                          disabled={isReadOnly}
                        />
                        <Select
                          value={test.test_type}
                          onValueChange={(value) => updateVitalityTest(index, 'test_type', value)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Test type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {vitalityTestTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVitalityTest(index)}
                        disabled={isReadOnly}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Response</Label>
                      <Select
                        value={test.response}
                        onValueChange={(value) => updateVitalityTest(index, 'response', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select response..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vitalityResponses.map(response => (
                            <SelectItem key={response} value={response}>{response}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {test.response && (
                        <Badge variant="outline" className={`mt-1 ${getResponseColor(test.response)}`}>
                          {test.response}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={test.notes}
                        onChange={(e) => updateVitalityTest(index, 'notes', e.target.value)}
                        placeholder="Additional notes..."
                        rows={2}
                        disabled={isReadOnly}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(localData.clinical_tests.vitality_tests || []).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No vitality tests performed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Percussion and Palpation Tests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Percussion & Palpation Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Percussion Findings</Label>
                <Textarea
                  value={localData.clinical_tests.percussion_tests?.map(t => `Tooth ${t.tooth_number}: Vertical - ${t.vertical_percussion}, Horizontal - ${t.horizontal_percussion}`).join('\n') || ''}
                  onChange={(e) => {
                    // Simple text handling for percussion tests
                    // In a full implementation, you'd want proper test management
                  }}
                  placeholder="Describe percussion test results for each tooth..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Palpation Findings</Label>
                <Textarea
                  value={localData.clinical_tests.palpation_findings?.map(t => `${t.location}: ${t.findings} - ${t.tenderness}`).join('\n') || ''}
                  onChange={(e) => {
                    // Simple text handling for palpation tests
                  }}
                  placeholder="Describe palpation findings for different areas..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Mobility Assessment</Label>
                <Textarea
                  value={localData.clinical_tests.mobility_assessment?.map(t => `Tooth ${t.tooth_number}: ${t.mobility_grade} ${t.direction ? '(' + t.direction + ')' : ''}`).join('\n') || ''}
                  onChange={(e) => {
                    // Simple text handling for mobility tests
                  }}
                  placeholder="Assess tooth mobility for affected teeth..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Special Investigations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Special Investigations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Additional investigations performed/required</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {specialInvestigations.map(investigation => (
                    <div key={investigation} className="flex items-center space-x-2">
                      <Checkbox
                        id={`special-${investigation}`}
                        checked={(localData.special_investigations || []).includes(investigation)}
                        onCheckedChange={() => toggleArrayItem('special_investigations', investigation)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`special-${investigation}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {investigation}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Investigation Recommendations</Label>
                <Textarea
                  value={localData.recommendations}
                  onChange={(e) => handleUpdate('recommendations', e.target.value)}
                  placeholder="Recommendations for additional investigations, referrals, or follow-up..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Follow-up Required</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {followUpOptions.map(followUp => (
                    <div key={followUp} className="flex items-center space-x-2">
                      <Checkbox
                        id={`followup-${followUp}`}
                        checked={(localData.follow_up_required || []).includes(followUp)}
                        onCheckedChange={() => toggleArrayItem('follow_up_required', followUp)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`followup-${followUp}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {followUp}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Investigation Summary */}
      {(localData.radiographic.type?.length > 0 || localData.laboratory?.length > 0 || localData.clinical_tests.vitality_tests?.length > 0) && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-indigo-700 flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Investigation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {localData.radiographic.type?.length > 0 && (
                <p><strong>Radiographs:</strong> {localData.radiographic.type.join(', ')} ({localData.radiographic.quality} quality)</p>
              )}
              {localData.laboratory?.length > 0 && (
                <p><strong>Laboratory:</strong> {localData.laboratory.map(t => t.test_name).join(', ')}</p>
              )}
              {localData.clinical_tests.vitality_tests?.length > 0 && (
                <p><strong>Clinical Tests:</strong> {localData.clinical_tests.vitality_tests.length} vitality tests performed</p>
              )}
              {localData.special_investigations?.length > 0 && (
                <p><strong>Special Investigations:</strong> {localData.special_investigations.join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}