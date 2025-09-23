'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface PrescriptionTabProps {
  data?: any
  onChange?: (data: any) => void
  isReadOnly?: boolean
  onSave?: (data: any) => void
}

export function PrescriptionTab({ data, onChange, isReadOnly = false, onSave }: PrescriptionTabProps) {
  // Simple state management - initialize with stable defaults to prevent controlled/uncontrolled switches
  const [prescribedMedications, setPrescribedMedications] = useState<string[]>([])
  const [medicationInstructions, setMedicationInstructions] = useState('')
  const [painManagement, setPainManagement] = useState('')
  const [antibiotics, setAntibiotics] = useState('')
  const [antiInflammatory, setAntiInflammatory] = useState('')
  const [mouthwash, setMouthwash] = useState('')
  const [allergiesChecked, setAllergiesChecked] = useState(false)
  const [drugInteractionsChecked, setDrugInteractionsChecked] = useState(false)
  const [pharmacyInstructions, setPharmacyInstructions] = useState('')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Update local state when data prop changes - ensure stable defaults
  useEffect(() => {
    setPrescribedMedications(data?.prescribed_medications || [])
    setMedicationInstructions(data?.medication_instructions || '')
    setPainManagement(data?.pain_management || '')
    setAntibiotics(data?.antibiotics || '')
    setAntiInflammatory(data?.anti_inflammatory || '')
    setMouthwash(data?.mouthwash || '')
    setAllergiesChecked(data?.allergies_checked || false)
    setDrugInteractionsChecked(data?.drug_interactions_checked || false)
    setPharmacyInstructions(data?.pharmacy_instructions || '')
    setFollowUpRequired(data?.follow_up_required || false)
    setAdditionalNotes(data?.additional_notes || '')
  }, [data])

  // Event handlers
  const updateAllFields = (updatedFields: any) => {
    if (onChange) {
      onChange({
        prescribed_medications: prescribedMedications,
        medication_instructions: medicationInstructions,
        pain_management: painManagement,
        antibiotics: antibiotics,
        anti_inflammatory: antiInflammatory,
        mouthwash: mouthwash,
        allergies_checked: allergiesChecked,
        drug_interactions_checked: drugInteractionsChecked,
        pharmacy_instructions: pharmacyInstructions,
        follow_up_required: followUpRequired,
        additional_notes: additionalNotes,
        ...updatedFields
      })
    }
  }

  const handleMedicationToggle = (medication: string) => {
    const newMedications = prescribedMedications.includes(medication)
      ? prescribedMedications.filter(m => m !== medication)
      : [...prescribedMedications, medication]
    setPrescribedMedications(newMedications)
    updateAllFields({ prescribed_medications: newMedications })
  }

  const handleMedicationInstructionsChange = (value: string) => {
    setMedicationInstructions(value)
    updateAllFields({ medication_instructions: value })
  }

  const handlePainManagementChange = (value: string) => {
    setPainManagement(value)
    updateAllFields({ pain_management: value })
  }

  const handleAntibioticsChange = (value: string) => {
    setAntibiotics(value)
    updateAllFields({ antibiotics: value })
  }

  const handleAntiInflammatoryChange = (value: string) => {
    setAntiInflammatory(value)
    updateAllFields({ anti_inflammatory: value })
  }

  const handleMouthwashChange = (value: string) => {
    setMouthwash(value)
    updateAllFields({ mouthwash: value })
  }

  const handleAllergiesCheckedChange = (checked: boolean) => {
    setAllergiesChecked(checked)
    updateAllFields({ allergies_checked: checked })
  }

  const handleDrugInteractionsCheckedChange = (checked: boolean) => {
    setDrugInteractionsChecked(checked)
    updateAllFields({ drug_interactions_checked: checked })
  }

  const handlePharmacyInstructionsChange = (value: string) => {
    setPharmacyInstructions(value)
    updateAllFields({ pharmacy_instructions: value })
  }

  const handleFollowUpRequiredChange = (checked: boolean) => {
    setFollowUpRequired(checked)
    updateAllFields({ follow_up_required: checked })
  }

  const handleAdditionalNotesChange = (value: string) => {
    setAdditionalNotes(value)
    updateAllFields({ additional_notes: value })
  }

  // Simple options arrays
  const commonMedications = [
    "Ibuprofen (400mg)", "Acetaminophen (500mg)", "Amoxicillin (500mg)", 
    "Clindamycin (150mg)", "Diclofenac (50mg)", "Naproxen (250mg)",
    "Metronidazole (400mg)", "Chlorhexidine mouthwash", "Benzocaine gel"
  ]

  const painManagementOptions = [
    "Over-the-counter only", "Mild prescription pain relief", 
    "Moderate prescription pain relief", "Strong prescription pain relief"
  ]

  const antibioticOptions = [
    "Not required", "Preventive course", "Active infection treatment", "Post-operative prophylaxis"
  ]

  const antiInflammatoryOptions = [
    "Not required", "Mild anti-inflammatory", "Moderate anti-inflammatory", "Strong anti-inflammatory"
  ]

  const mouthwashOptions = [
    "Regular mouthwash", "Antiseptic mouthwash", "Chlorhexidine mouthwash", "Salt water rinse only"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-600">Prescription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Prescribed Medications */}
          <div>
            <Label>Prescribed Medications</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {commonMedications.map(medication => (
                <div key={medication} className="flex items-center space-x-2">
                  <Checkbox
                    id={`med-${medication}`}
                    checked={prescribedMedications.includes(medication)}
                    onCheckedChange={() => handleMedicationToggle(medication)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`med-${medication}`} className="text-sm cursor-pointer">
                    {medication}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Medication Instructions */}
          <div>
            <Label htmlFor="medication-instructions">Detailed Medication Instructions</Label>
            <Textarea
              id="medication-instructions"
              value={medicationInstructions}
              onChange={(e) => handleMedicationInstructionsChange(e.target.value)}
              placeholder="Detailed instructions for taking prescribed medications (dosage, frequency, duration, timing with meals, etc.)"
              rows={4}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Pain Management */}
          <div>
            <Label htmlFor="pain-management">Pain Management Plan</Label>
            <Select
              value={painManagement}
              onValueChange={handlePainManagementChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select pain management approach" />
              </SelectTrigger>
              <SelectContent>
                {painManagementOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Antibiotics */}
          <div>
            <Label htmlFor="antibiotics">Antibiotic Therapy</Label>
            <Select
              value={antibiotics}
              onValueChange={handleAntibioticsChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select antibiotic requirement" />
              </SelectTrigger>
              <SelectContent>
                {antibioticOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Anti-inflammatory */}
          <div>
            <Label htmlFor="anti-inflammatory">Anti-inflammatory Treatment</Label>
            <Select
              value={antiInflammatory}
              onValueChange={handleAntiInflammatoryChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select anti-inflammatory level" />
              </SelectTrigger>
              <SelectContent>
                {antiInflammatoryOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mouthwash */}
          <div>
            <Label htmlFor="mouthwash">Oral Rinse Recommendations</Label>
            <Select
              value={mouthwash}
              onValueChange={handleMouthwashChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select mouthwash type" />
              </SelectTrigger>
              <SelectContent>
                {mouthwashOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Safety Checks */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allergies-checked"
                checked={allergiesChecked}
                onCheckedChange={handleAllergiesCheckedChange}
                disabled={isReadOnly}
              />
              <Label htmlFor="allergies-checked" className="cursor-pointer">
                Patient allergies have been verified and considered
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="drug-interactions-checked"
                checked={drugInteractionsChecked}
                onCheckedChange={handleDrugInteractionsCheckedChange}
                disabled={isReadOnly}
              />
              <Label htmlFor="drug-interactions-checked" className="cursor-pointer">
                Drug interactions with current medications have been checked
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow-up-required"
                checked={followUpRequired}
                onCheckedChange={handleFollowUpRequiredChange}
                disabled={isReadOnly}
              />
              <Label htmlFor="follow-up-required" className="cursor-pointer">
                Follow-up required to monitor medication effectiveness
              </Label>
            </div>
          </div>

          {/* Pharmacy Instructions */}
          <div>
            <Label htmlFor="pharmacy-instructions">Instructions for Pharmacy</Label>
            <Textarea
              id="pharmacy-instructions"
              value={pharmacyInstructions}
              onChange={(e) => handlePharmacyInstructionsChange(e.target.value)}
              placeholder="Special instructions or notes for the pharmacist"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="additional-notes">Additional Prescription Notes</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => handleAdditionalNotesChange(e.target.value)}
              placeholder="Any additional notes or special considerations regarding the prescription"
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
                      prescribed_medications: prescribedMedications,
                      medication_instructions: medicationInstructions,
                      pain_management: painManagement,
                      antibiotics: antibiotics,
                      anti_inflammatory: antiInflammatory,
                      mouthwash: mouthwash,
                      allergies_checked: allergiesChecked,
                      drug_interactions_checked: drugInteractionsChecked,
                      pharmacy_instructions: pharmacyInstructions,
                      follow_up_required: followUpRequired,
                      additional_notes: additionalNotes
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