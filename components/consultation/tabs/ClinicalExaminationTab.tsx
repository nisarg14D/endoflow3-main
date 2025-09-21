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
import { Eye, Search, Users, Smile, Heart, AlertTriangle } from "lucide-react"

interface ExtraoralFindings {
  general_appearance: string
  facial_symmetry: string
  facial_profile: string
  lip_competency: string
  facial_height: string
  lymph_nodes: string[]
  tmj_examination: string
  swellings: string[]
  skin_condition: string
  other_findings: string
}

interface IntraoralFindings {
  oral_hygiene: string
  gingival_condition: string
  periodontal_status: string
  tongue_examination: string
  palate_examination: string
  floor_of_mouth: string
  buccal_mucosa: string
  lips: string
  teeth_present: string[]
  teeth_missing: string[]
  restorations: string[]
  caries: string[]
  mobility: string[]
  occlusion: string
  other_findings: string
}

interface VitalSigns {
  blood_pressure: string
  pulse_rate: string
  temperature: string
  respiratory_rate: string
  oxygen_saturation: string
}

interface ClinicalExaminationData {
  extraoral_findings: ExtraoralFindings
  intraoral_findings: IntraoralFindings
  vital_signs: VitalSigns
  general_examination: string
  examination_date: string
  examination_time: string
  examiner_notes: string
}

interface ClinicalExaminationTabProps {
  data: ClinicalExaminationData
  onChange: (data: ClinicalExaminationData) => void
  isReadOnly?: boolean
}

export function ClinicalExaminationTab({ data, onChange, isReadOnly = false }: ClinicalExaminationTabProps) {
  const [localData, setLocalData] = useState<ClinicalExaminationData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof ClinicalExaminationData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const handleNestedUpdate = (section: keyof ClinicalExaminationData, field: string, value: any) => {
    const updatedSection = { ...localData[section], [field]: value }
    handleUpdate(section, updatedSection)
  }

  const toggleArrayItem = (section: keyof ClinicalExaminationData, field: string, item: string) => {
    const currentSection = localData[section] as any
    const currentArray = currentSection[field] || []
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter((i: string) => i !== item)
      : [...currentArray, item]
    handleNestedUpdate(section, field, updatedArray)
  }

  // Options for different examination components
  const facialSymmetryOptions = ["Symmetrical", "Asymmetrical - left side", "Asymmetrical - right side", "Mild asymmetry", "Severe asymmetry"]
  const facialProfileOptions = ["Straight profile", "Convex profile", "Concave profile", "Competent lips", "Incompetent lips"]
  const generalAppearanceOptions = ["Well-appearing", "Ill-appearing", "Anxious", "Cooperative", "Uncooperative", "Alert", "Lethargic"]

  const lymphNodeOptions = [
    "Submandibular - normal", "Submandibular - enlarged", "Submandibular - tender",
    "Submental - normal", "Submental - enlarged", "Submental - tender",
    "Cervical - normal", "Cervical - enlarged", "Cervical - tender",
    "Preauricular - normal", "Preauricular - enlarged", "Preauricular - tender"
  ]

  const swellingOptions = [
    "No swelling", "Facial swelling - diffuse", "Facial swelling - localized",
    "Periorbital swelling", "Lip swelling", "Cheek swelling", "Submandibular swelling"
  ]

  const oralHygieneOptions = ["Excellent", "Good", "Fair", "Poor", "Very poor"]
  const gingivalConditionOptions = [
    "Healthy - pink and firm", "Mild gingivitis", "Moderate gingivitis", "Severe gingivitis",
    "Bleeding on probing", "Spontaneous bleeding", "Gingival recession", "Gingival hyperplasia"
  ]

  const periodontalStatusOptions = [
    "Healthy periodontium", "Mild periodontitis", "Moderate periodontitis", "Severe periodontitis",
    "Localized periodontitis", "Generalized periodontitis", "Aggressive periodontitis"
  ]

  const tongueExaminationOptions = [
    "Normal size and color", "Enlarged", "Coated", "Geographic tongue", "Fissured tongue",
    "Black hairy tongue", "Tongue lesions", "Limited mobility", "Normal mobility"
  ]

  const palateExaminationOptions = [
    "Normal hard palate", "High arched palate", "Cleft palate", "Torus palatinus",
    "Normal soft palate", "Soft palate lesions", "Adequate palatal function"
  ]

  const occlusionOptions = [
    "Class I molar relationship", "Class II molar relationship", "Class III molar relationship",
    "Normal overjet", "Increased overjet", "Reverse overjet", "Normal overbite", "Deep bite", "Open bite",
    "Crossbite - anterior", "Crossbite - posterior", "Midline deviation"
  ]

  const teethNumbers = [
    "11", "12", "13", "14", "15", "16", "17", "18", // Upper right
    "21", "22", "23", "24", "25", "26", "27", "28", // Upper left
    "31", "32", "33", "34", "35", "36", "37", "38", // Lower left
    "41", "42", "43", "44", "45", "46", "47", "48"  // Lower right
  ]

  const getOralHygieneColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-100'
      case 'Good': return 'text-green-600 bg-green-100'
      case 'Fair': return 'text-yellow-600 bg-yellow-100'
      case 'Poor': return 'text-orange-600 bg-orange-100'
      case 'Very poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGingivalColor = (condition: string) => {
    if (condition.includes('Healthy')) return 'text-green-600 bg-green-100'
    if (condition.includes('Mild')) return 'text-yellow-600 bg-yellow-100'
    if (condition.includes('Moderate')) return 'text-orange-600 bg-orange-100'
    if (condition.includes('Severe')) return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Clinical Examination</h3>
        </div>
        <p className="text-sm text-blue-700">Systematic extraoral and intraoral examination findings</p>
      </div>

      {/* Examination Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <Label>Examination Date</Label>
          <Input
            type="date"
            value={localData.examination_date}
            onChange={(e) => handleUpdate('examination_date', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <Label>Examination Time</Label>
          <Input
            type="time"
            value={localData.examination_time}
            onChange={(e) => handleUpdate('examination_time', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <Label>General Condition</Label>
          <Select
            value={localData.general_examination}
            onValueChange={(value) => handleUpdate('general_examination', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="General appearance..." />
            </SelectTrigger>
            <SelectContent>
              {generalAppearanceOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Extraoral Examination */}
        <div className="space-y-6">
          {/* Vital Signs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    value={localData.vital_signs.blood_pressure}
                    onChange={(e) => handleNestedUpdate('vital_signs', 'blood_pressure', e.target.value)}
                    placeholder="e.g., 120/80"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label>Pulse Rate</Label>
                  <Input
                    value={localData.vital_signs.pulse_rate}
                    onChange={(e) => handleNestedUpdate('vital_signs', 'pulse_rate', e.target.value)}
                    placeholder="e.g., 72 bpm"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Temperature</Label>
                  <Input
                    value={localData.vital_signs.temperature}
                    onChange={(e) => handleNestedUpdate('vital_signs', 'temperature', e.target.value)}
                    placeholder="e.g., 98.6°F"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    value={localData.vital_signs.respiratory_rate}
                    onChange={(e) => handleNestedUpdate('vital_signs', 'respiratory_rate', e.target.value)}
                    placeholder="e.g., 16/min"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label>O2 Saturation</Label>
                  <Input
                    value={localData.vital_signs.oxygen_saturation}
                    onChange={(e) => handleNestedUpdate('vital_signs', 'oxygen_saturation', e.target.value)}
                    placeholder="e.g., 98%"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extraoral Examination */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Extraoral Examination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facial Symmetry</Label>
                  <Select
                    value={localData.extraoral_findings.facial_symmetry}
                    onValueChange={(value) => handleNestedUpdate('extraoral_findings', 'facial_symmetry', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {facialSymmetryOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Facial Profile</Label>
                  <Select
                    value={localData.extraoral_findings.facial_profile}
                    onValueChange={(value) => handleNestedUpdate('extraoral_findings', 'facial_profile', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {facialProfileOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lip Competency</Label>
                  <Input
                    value={localData.extraoral_findings.lip_competency}
                    onChange={(e) => handleNestedUpdate('extraoral_findings', 'lip_competency', e.target.value)}
                    placeholder="Competent/Incompetent"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label>Facial Height</Label>
                  <Input
                    value={localData.extraoral_findings.facial_height}
                    onChange={(e) => handleNestedUpdate('extraoral_findings', 'facial_height', e.target.value)}
                    placeholder="Normal/Increased/Decreased"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div>
                <Label>Lymph Node Examination</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {lymphNodeOptions.map(node => (
                    <div key={node} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lymph-${node}`}
                        checked={((localData.extraoral_findings.lymph_nodes as string[]) || []).includes(node)}
                        onCheckedChange={() => toggleArrayItem('extraoral_findings', 'lymph_nodes', node)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`lymph-${node}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {node}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>TMJ Examination</Label>
                <Textarea
                  value={localData.extraoral_findings.tmj_examination}
                  onChange={(e) => handleNestedUpdate('extraoral_findings', 'tmj_examination', e.target.value)}
                  placeholder="TMJ clicking, pain, deviation, range of motion..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <Label>Swellings</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {swellingOptions.map(swelling => (
                    <div key={swelling} className="flex items-center space-x-2">
                      <Checkbox
                        id={`swelling-${swelling}`}
                        checked={((localData.extraoral_findings.swellings as string[]) || []).includes(swelling)}
                        onCheckedChange={() => toggleArrayItem('extraoral_findings', 'swellings', swelling)}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`swelling-${swelling}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {swelling}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Other Extraoral Findings</Label>
                <Textarea
                  value={localData.extraoral_findings.other_findings}
                  onChange={(e) => handleNestedUpdate('extraoral_findings', 'other_findings', e.target.value)}
                  placeholder="Any other notable extraoral findings..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Intraoral Examination */}
        <div className="space-y-6">
          {/* Intraoral Examination */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Smile className="w-4 h-4 text-green-500" />
                Intraoral Examination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Oral Hygiene</Label>
                <Select
                  value={localData.intraoral_findings.oral_hygiene}
                  onValueChange={(value) => handleNestedUpdate('intraoral_findings', 'oral_hygiene', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assess oral hygiene..." />
                  </SelectTrigger>
                  <SelectContent>
                    {oralHygieneOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localData.intraoral_findings.oral_hygiene && (
                  <Badge variant="outline" className={`mt-2 ${getOralHygieneColor(localData.intraoral_findings.oral_hygiene)}`}>
                    {localData.intraoral_findings.oral_hygiene} oral hygiene
                  </Badge>
                )}
              </div>

              <div>
                <Label>Gingival Condition</Label>
                <Select
                  value={localData.intraoral_findings.gingival_condition}
                  onValueChange={(value) => handleNestedUpdate('intraoral_findings', 'gingival_condition', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assess gingival condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gingivalConditionOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localData.intraoral_findings.gingival_condition && (
                  <Badge variant="outline" className={`mt-2 ${getGingivalColor(localData.intraoral_findings.gingival_condition)}`}>
                    {localData.intraoral_findings.gingival_condition}
                  </Badge>
                )}
              </div>

              <div>
                <Label>Periodontal Status</Label>
                <Select
                  value={localData.intraoral_findings.periodontal_status}
                  onValueChange={(value) => handleNestedUpdate('intraoral_findings', 'periodontal_status', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assess periodontal status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodontalStatusOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tongue Examination</Label>
                <Select
                  value={localData.intraoral_findings.tongue_examination}
                  onValueChange={(value) => handleNestedUpdate('intraoral_findings', 'tongue_examination', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tongue examination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tongueExaminationOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Palate Examination</Label>
                <Select
                  value={localData.intraoral_findings.palate_examination}
                  onValueChange={(value) => handleNestedUpdate('intraoral_findings', 'palate_examination', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Palate examination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {palateExaminationOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Floor of Mouth</Label>
                  <Input
                    value={localData.intraoral_findings.floor_of_mouth}
                    onChange={(e) => handleNestedUpdate('intraoral_findings', 'floor_of_mouth', e.target.value)}
                    placeholder="Normal/Abnormal findings"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label>Buccal Mucosa</Label>
                  <Input
                    value={localData.intraoral_findings.buccal_mucosa}
                    onChange={(e) => handleNestedUpdate('intraoral_findings', 'buccal_mucosa', e.target.value)}
                    placeholder="Normal/Abnormal findings"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div>
                <Label>Occlusion Assessment</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {occlusionOptions.map(occlusion => (
                    <div key={occlusion} className="flex items-center space-x-2">
                      <Checkbox
                        id={`occlusion-${occlusion}`}
                        checked={localData.intraoral_findings.occlusion?.includes(occlusion) || false}
                        onCheckedChange={(checked) => {
                          const currentOcclusion = localData.intraoral_findings.occlusion || ''
                          const occlusionArray = currentOcclusion.split(', ').filter(o => o.length > 0)

                          let updatedOcclusion
                          if (checked) {
                            updatedOcclusion = [...occlusionArray, occlusion].join(', ')
                          } else {
                            updatedOcclusion = occlusionArray.filter(o => o !== occlusion).join(', ')
                          }

                          handleNestedUpdate('intraoral_findings', 'occlusion', updatedOcclusion)
                        }}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`occlusion-${occlusion}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {occlusion}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Other Intraoral Findings</Label>
                <Textarea
                  value={localData.intraoral_findings.other_findings}
                  onChange={(e) => handleNestedUpdate('intraoral_findings', 'other_findings', e.target.value)}
                  placeholder="Any other notable intraoral findings..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dental Chart Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            Dental Chart Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label>Teeth Present</Label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {teethNumbers.map(tooth => (
                  <div key={`present-${tooth}`} className="flex items-center justify-center">
                    <Checkbox
                      id={`present-${tooth}`}
                      checked={((localData.intraoral_findings.teeth_present as string[]) || []).includes(tooth)}
                      onCheckedChange={() => toggleArrayItem('intraoral_findings', 'teeth_present', tooth)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={`present-${tooth}`} className="text-xs ml-1">{tooth}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Teeth Missing</Label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {teethNumbers.map(tooth => (
                  <div key={`missing-${tooth}`} className="flex items-center justify-center">
                    <Checkbox
                      id={`missing-${tooth}`}
                      checked={((localData.intraoral_findings.teeth_missing as string[]) || []).includes(tooth)}
                      onCheckedChange={() => toggleArrayItem('intraoral_findings', 'teeth_missing', tooth)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={`missing-${tooth}`} className="text-xs ml-1">{tooth}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label>Carious Teeth</Label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {teethNumbers.map(tooth => (
                  <div key={`caries-${tooth}`} className="flex items-center justify-center">
                    <Checkbox
                      id={`caries-${tooth}`}
                      checked={((localData.intraoral_findings.caries as string[]) || []).includes(tooth)}
                      onCheckedChange={() => toggleArrayItem('intraoral_findings', 'caries', tooth)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={`caries-${tooth}`} className="text-xs ml-1">{tooth}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Restored Teeth</Label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {teethNumbers.map(tooth => (
                  <div key={`resto-${tooth}`} className="flex items-center justify-center">
                    <Checkbox
                      id={`resto-${tooth}`}
                      checked={((localData.intraoral_findings.restorations as string[]) || []).includes(tooth)}
                      onCheckedChange={() => toggleArrayItem('intraoral_findings', 'restorations', tooth)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={`resto-${tooth}`} className="text-xs ml-1">{tooth}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examiner Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-700">Examiner Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={localData.examiner_notes}
            onChange={(e) => handleUpdate('examiner_notes', e.target.value)}
            placeholder="Additional notes, observations, or clinical impressions from the examination..."
            rows={4}
            disabled={isReadOnly}
          />
        </CardContent>
      </Card>

      {/* Clinical Summary */}
      {(localData.extraoral_findings.facial_symmetry || localData.intraoral_findings.oral_hygiene) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Examination Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {localData.extraoral_findings.facial_symmetry && (
                <p><strong>Extraoral:</strong> {localData.extraoral_findings.facial_symmetry}, {localData.extraoral_findings.facial_profile}</p>
              )}
              {localData.intraoral_findings.oral_hygiene && (
                <p><strong>Intraoral:</strong> {localData.intraoral_findings.oral_hygiene} oral hygiene, {localData.intraoral_findings.gingival_condition}</p>
              )}
              {localData.vital_signs.blood_pressure && (
                <p><strong>Vitals:</strong> BP: {localData.vital_signs.blood_pressure}, Pulse: {localData.vital_signs.pulse_rate}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}