'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface InvestigationsTabProps {
  data?: any
  onChange?: (data: any) => void
  isReadOnly?: boolean
  onSave?: (data: any) => void
}

export function InvestigationsTab({ data, onChange, isReadOnly = false, onSave }: InvestigationsTabProps) {
  // Simple state management - initialize with stable defaults to prevent controlled/uncontrolled switches
  const [radiographicFindings, setRadiographicFindings] = useState('')
  const [radiographicTypes, setRadiographicTypes] = useState<string[]>([])
  const [vitalityTests, setVitalityTests] = useState('')
  const [percussionTests, setPercussionTests] = useState('')
  const [palpationFindings, setPalpationFindings] = useState('')
  const [laboratoryTests, setLaboratoryTests] = useState('')
  const [recommendations, setRecommendations] = useState('')

  // Update local state when data prop changes - ensure stable defaults
  useEffect(() => {
    setRadiographicFindings(data?.radiographic_findings || '')
    setRadiographicTypes(data?.radiographic_types || [])
    setVitalityTests(data?.vitality_tests || '')
    setPercussionTests(data?.percussion_tests || '')
    setPalpationFindings(data?.palpation_findings || '')
    setLaboratoryTests(data?.laboratory_tests || '')
    setRecommendations(data?.recommendations || '')
  }, [data])

  // Event handlers
  const handleRadiographicFindingsChange = (value: string) => {
    setRadiographicFindings(value)
    if (onChange) {
      onChange({
        radiographic_findings: value,
        radiographic_types: radiographicTypes,
        vitality_tests: vitalityTests,
        percussion_tests: percussionTests,
        palpation_findings: palpationFindings,
        laboratory_tests: laboratoryTests,
        recommendations: recommendations
      })
    }
  }

  const handleRadiographicTypeToggle = (type: string) => {
    const newTypes = radiographicTypes.includes(type)
      ? radiographicTypes.filter(t => t !== type)
      : [...radiographicTypes, type]
    setRadiographicTypes(newTypes)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: newTypes,
        vitality_tests: vitalityTests,
        percussion_tests: percussionTests,
        palpation_findings: palpationFindings,
        laboratory_tests: laboratoryTests,
        recommendations: recommendations
      })
    }
  }

  const handleVitalityTestsChange = (value: string) => {
    setVitalityTests(value)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: radiographicTypes,
        vitality_tests: value,
        percussion_tests: percussionTests,
        palpation_findings: palpationFindings,
        laboratory_tests: laboratoryTests,
        recommendations: recommendations
      })
    }
  }

  const handlePercussionTestsChange = (value: string) => {
    setPercussionTests(value)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: radiographicTypes,
        vitality_tests: vitalityTests,
        percussion_tests: value,
        palpation_findings: palpationFindings,
        laboratory_tests: laboratoryTests,
        recommendations: recommendations
      })
    }
  }

  const handlePalpationFindingsChange = (value: string) => {
    setPalpationFindings(value)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: radiographicTypes,
        vitality_tests: vitalityTests,
        percussion_tests: percussionTests,
        palpation_findings: value,
        laboratory_tests: laboratoryTests,
        recommendations: recommendations
      })
    }
  }

  const handleLaboratoryTestsChange = (value: string) => {
    setLaboratoryTests(value)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: radiographicTypes,
        vitality_tests: vitalityTests,
        percussion_tests: percussionTests,
        palpation_findings: palpationFindings,
        laboratory_tests: value,
        recommendations: recommendations
      })
    }
  }

  const handleRecommendationsChange = (value: string) => {
    setRecommendations(value)
    if (onChange) {
      onChange({
        radiographic_findings: radiographicFindings,
        radiographic_types: radiographicTypes,
        vitality_tests: vitalityTests,
        percussion_tests: percussionTests,
        palpation_findings: palpationFindings,
        laboratory_tests: laboratoryTests,
        recommendations: value
      })
    }
  }

  // Simple options arrays
  const radiographicTypeOptions = [
    "IOPA (Intraoral Periapical)", "Bitewing", "Panoramic (OPG)", "CBCT", "CT Scan", "Occlusal"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-600">Investigations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Radiographic Investigations */}
          <div>
            <Label>Radiographic Investigations Taken</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {radiographicTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`radio-${type}`}
                    checked={radiographicTypes.includes(type)}
                    onCheckedChange={() => handleRadiographicTypeToggle(type)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`radio-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Radiographic Findings */}
          <div>
            <Label htmlFor="radiographic-findings">Radiographic Findings</Label>
            <Textarea
              id="radiographic-findings"
              value={radiographicFindings}
              onChange={(e) => handleRadiographicFindingsChange(e.target.value)}
              placeholder="Describe findings from X-rays, OPG, CBCT or other imaging (pathology, bone levels, root condition, etc.)"
              rows={4}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Vitality Tests */}
          <div>
            <Label htmlFor="vitality-tests">Vitality Tests (Pulp Testing)</Label>
            <Textarea
              id="vitality-tests"
              value={vitalityTests}
              onChange={(e) => handleVitalityTestsChange(e.target.value)}
              placeholder="Record cold test, heat test, electric pulp test results with tooth numbers and responses"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Percussion Tests */}
          <div>
            <Label htmlFor="percussion-tests">Percussion & Palpation Tests</Label>
            <Textarea
              id="percussion-tests"
              value={percussionTests}
              onChange={(e) => handlePercussionTestsChange(e.target.value)}
              placeholder="Record percussion (vertical/horizontal) and palpation test results"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Laboratory Tests */}
          <div>
            <Label htmlFor="laboratory-tests">Laboratory Tests & Results</Label>
            <Textarea
              id="laboratory-tests"
              value={laboratoryTests}
              onChange={(e) => handleLaboratoryTestsChange(e.target.value)}
              placeholder="List any blood tests, cultures, biopsies ordered or completed with results"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Investigation Recommendations */}
          <div>
            <Label htmlFor="recommendations">Additional Investigations Recommended</Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => handleRecommendationsChange(e.target.value)}
              placeholder="Recommend any follow-up imaging, tests, or specialist referrals needed"
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
                      radiographic_findings: radiographicFindings,
                      radiographic_types: radiographicTypes,
                      vitality_tests: vitalityTests,
                      percussion_tests: percussionTests,
                      palpation_findings: palpationFindings,
                      laboratory_tests: laboratoryTests,
                      recommendations: recommendations
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