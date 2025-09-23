'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClinicalExaminationTabProps {
  data?: any
  onChange?: (data: any) => void
  isReadOnly?: boolean
  onSave?: (data: any) => void
}

export function ClinicalExaminationTab({ data, onChange, isReadOnly = false, onSave }: ClinicalExaminationTabProps) {
  // Simple state management - initialize with stable defaults to prevent controlled/uncontrolled switches
  const [extraoralFindings, setExtraoralFindings] = useState('')
  const [intraoralFindings, setIntraoralFindings] = useState('')
  const [oralHygiene, setOralHygiene] = useState('')
  const [gingivalCondition, setGingivalCondition] = useState('')
  const [periodontalStatus, setPeriodontalStatus] = useState('')
  const [occlusionNotes, setOcclusionNotes] = useState('')

  // Update local state when data prop changes - ensure stable defaults
  useEffect(() => {
    setExtraoralFindings(data?.extraoral_findings || '')
    setIntraoralFindings(data?.intraoral_findings || '')
    setOralHygiene(data?.oral_hygiene || '')
    setGingivalCondition(data?.gingival_condition || '')
    setPeriodontalStatus(data?.periodontal_status || '')
    setOcclusionNotes(data?.occlusion_notes || '')
  }, [data])

  // Event handlers
  const handleExtraoralChange = (value: string) => {
    setExtraoralFindings(value)
    if (onChange) {
      onChange({
        extraoral_findings: value,
        intraoral_findings: intraoralFindings,
        oral_hygiene: oralHygiene,
        gingival_condition: gingivalCondition,
        periodontal_status: periodontalStatus,
        occlusion_notes: occlusionNotes
      })
    }
  }

  const handleIntraoralChange = (value: string) => {
    setIntraoralFindings(value)
    if (onChange) {
      onChange({
        extraoral_findings: extraoralFindings,
        intraoral_findings: value,
        oral_hygiene: oralHygiene,
        gingival_condition: gingivalCondition,
        periodontal_status: periodontalStatus,
        occlusion_notes: occlusionNotes
      })
    }
  }

  const handleOralHygieneChange = (value: string) => {
    setOralHygiene(value)
    if (onChange) {
      onChange({
        extraoral_findings: extraoralFindings,
        intraoral_findings: intraoralFindings,
        oral_hygiene: value,
        gingival_condition: gingivalCondition,
        periodontal_status: periodontalStatus,
        occlusion_notes: occlusionNotes
      })
    }
  }

  const handleGingivalChange = (value: string) => {
    setGingivalCondition(value)
    if (onChange) {
      onChange({
        extraoral_findings: extraoralFindings,
        intraoral_findings: intraoralFindings,
        oral_hygiene: oralHygiene,
        gingival_condition: value,
        periodontal_status: periodontalStatus,
        occlusion_notes: occlusionNotes
      })
    }
  }

  const handlePeriodontalChange = (value: string) => {
    setPeriodontalStatus(value)
    if (onChange) {
      onChange({
        extraoral_findings: extraoralFindings,
        intraoral_findings: intraoralFindings,
        oral_hygiene: oralHygiene,
        gingival_condition: gingivalCondition,
        periodontal_status: value,
        occlusion_notes: occlusionNotes
      })
    }
  }

  const handleOcclusionChange = (value: string) => {
    setOcclusionNotes(value)
    if (onChange) {
      onChange({
        extraoral_findings: extraoralFindings,
        intraoral_findings: intraoralFindings,
        oral_hygiene: oralHygiene,
        gingival_condition: gingivalCondition,
        periodontal_status: periodontalStatus,
        occlusion_notes: value
      })
    }
  }

  // Simple option arrays
  const oralHygieneOptions = ["Excellent", "Good", "Fair", "Poor"]
  const gingivalConditionOptions = ["Healthy", "Mild gingivitis", "Moderate gingivitis", "Severe gingivitis"]
  const periodontalStatusOptions = ["Healthy", "Mild periodontitis", "Moderate periodontitis", "Severe periodontitis"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-600">Clinical Examination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Extraoral Findings */}
          <div>
            <Label htmlFor="extraoral-findings">Extraoral Examination Findings</Label>
            <Textarea
              id="extraoral-findings"
              value={extraoralFindings}
              onChange={(e) => handleExtraoralChange(e.target.value)}
              placeholder="Describe extraoral findings (facial symmetry, lymph nodes, TMJ, swellings, skin condition)"
              rows={4}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Intraoral Findings */}
          <div>
            <Label htmlFor="intraoral-findings">Intraoral Examination Findings</Label>
            <Textarea
              id="intraoral-findings"
              value={intraoralFindings}
              onChange={(e) => handleIntraoralChange(e.target.value)}
              placeholder="Describe intraoral findings (teeth condition, restorations, caries, soft tissues)"
              rows={4}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Oral Hygiene Assessment */}
          <div>
            <Label htmlFor="oral-hygiene">Oral Hygiene Status</Label>
            <Select
              value={oralHygiene}
              onValueChange={handleOralHygieneChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select oral hygiene status" />
              </SelectTrigger>
              <SelectContent>
                {oralHygieneOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gingival Condition */}
          <div>
            <Label htmlFor="gingival-condition">Gingival Condition</Label>
            <Select
              value={gingivalCondition}
              onValueChange={handleGingivalChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select gingival condition" />
              </SelectTrigger>
              <SelectContent>
                {gingivalConditionOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periodontal Status */}
          <div>
            <Label htmlFor="periodontal-status">Periodontal Status</Label>
            <Select
              value={periodontalStatus}
              onValueChange={handlePeriodontalChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select periodontal status" />
              </SelectTrigger>
              <SelectContent>
                {periodontalStatusOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occlusion Notes */}
          <div>
            <Label htmlFor="occlusion-notes">Occlusion & Bite Assessment</Label>
            <Textarea
              id="occlusion-notes"
              value={occlusionNotes}
              onChange={(e) => handleOcclusionChange(e.target.value)}
              placeholder="Describe occlusal relationships, bite pattern, any malocclusion"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Save Button */}
          {!isReadOnly && onSave && (
            <div className="pt-4 border-t">
              <Button 
                onClick={() => {
                  if (onSave) {
                    onSave({
                      extraoral_findings: extraoralFindings,
                      intraoral_findings: intraoralFindings,
                      oral_hygiene: oralHygiene,
                      gingival_condition: gingivalCondition,
                      periodontal_status: periodontalStatus,
                      occlusion_notes: occlusionNotes
                    })
                  }
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Save
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}