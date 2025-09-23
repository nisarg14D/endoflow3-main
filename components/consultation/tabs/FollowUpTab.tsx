'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface FollowUpTabProps {
  data?: any
  onChange?: (data: any) => void
  isReadOnly?: boolean
  onSave?: (data: any) => void
}

export function FollowUpTab({ data, onChange, isReadOnly = false, onSave }: FollowUpTabProps) {
  // Simple state management - initialize with stable defaults to prevent controlled/uncontrolled switches
  const [nextAppointmentDate, setNextAppointmentDate] = useState('')
  const [appointmentType, setAppointmentType] = useState('')
  const [appointmentDuration, setAppointmentDuration] = useState('')
  const [followUpInstructions, setFollowUpInstructions] = useState('')
  const [homeCareTasks, setHomeCareTasks] = useState<string[]>([])
  const [warningSigns, setWarningSigns] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [recallPeriod, setRecallPeriod] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Update local state when data prop changes - ensure stable defaults
  useEffect(() => {
    setNextAppointmentDate(data?.next_appointment_date || '')
    setAppointmentType(data?.appointment_type || '')
    setAppointmentDuration(data?.appointment_duration || '')
    setFollowUpInstructions(data?.follow_up_instructions || '')
    setHomeCareTasks(data?.home_care_tasks || [])
    setWarningSigns(data?.warning_signs || '')
    setEmergencyContact(data?.emergency_contact || '')
    setRecallPeriod(data?.recall_period || '')
    setAdditionalNotes(data?.additional_notes || '')
  }, [data])

  // Event handlers
  const updateAllFields = (updatedFields: any) => {
    if (onChange) {
      onChange({
        next_appointment_date: nextAppointmentDate,
        appointment_type: appointmentType,
        appointment_duration: appointmentDuration,
        follow_up_instructions: followUpInstructions,
        home_care_tasks: homeCareTasks,
        warning_signs: warningSigns,
        emergency_contact: emergencyContact,
        recall_period: recallPeriod,
        additional_notes: additionalNotes,
        ...updatedFields
      })
    }
  }

  const handleNextAppointmentDateChange = (value: string) => {
    setNextAppointmentDate(value)
    updateAllFields({ next_appointment_date: value })
  }

  const handleAppointmentTypeChange = (value: string) => {
    setAppointmentType(value)
    updateAllFields({ appointment_type: value })
  }

  const handleAppointmentDurationChange = (value: string) => {
    setAppointmentDuration(value)
    updateAllFields({ appointment_duration: value })
  }

  const handleFollowUpInstructionsChange = (value: string) => {
    setFollowUpInstructions(value)
    updateAllFields({ follow_up_instructions: value })
  }

  const handleHomeCareTaskToggle = (task: string) => {
    const newTasks = homeCareTasks.includes(task)
      ? homeCareTasks.filter(t => t !== task)
      : [...homeCareTasks, task]
    setHomeCareTasks(newTasks)
    updateAllFields({ home_care_tasks: newTasks })
  }

  const handleWarningSignsChange = (value: string) => {
    setWarningSigns(value)
    updateAllFields({ warning_signs: value })
  }

  const handleEmergencyContactChange = (value: string) => {
    setEmergencyContact(value)
    updateAllFields({ emergency_contact: value })
  }

  const handleRecallPeriodChange = (value: string) => {
    setRecallPeriod(value)
    updateAllFields({ recall_period: value })
  }

  const handleAdditionalNotesChange = (value: string) => {
    setAdditionalNotes(value)
    updateAllFields({ additional_notes: value })
  }

  // Simple options arrays
  const appointmentTypes = [
    "Follow-up consultation", "Treatment continuation", "Progress check", 
    "Post-operative review", "Cleaning and maintenance", "Emergency check"
  ]

  const durationOptions = [
    "15 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours"
  ]

  const homeCareTaskOptions = [
    "Brush twice daily", "Floss daily", "Use prescribed mouthwash", 
    "Apply ice packs as needed", "Take medications as prescribed", 
    "Avoid hard foods", "Rinse with salt water", "Keep area clean"
  ]

  const recallPeriodOptions = [
    "1 week", "2 weeks", "1 month", "3 months", "6 months", "1 year"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-600">Follow-up Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Next Appointment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment-date">Next Appointment Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={nextAppointmentDate}
                onChange={(e) => handleNextAppointmentDateChange(e.target.value)}
                disabled={isReadOnly}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="appointment-type">Appointment Type</Label>
              <Select
                value={appointmentType}
                onValueChange={handleAppointmentTypeChange}
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Duration */}
          <div>
            <Label htmlFor="appointment-duration">Expected Duration</Label>
            <Select
              value={appointmentDuration}
              onValueChange={handleAppointmentDurationChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(duration => (
                  <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Follow-up Instructions */}
          <div>
            <Label htmlFor="follow-up-instructions">Follow-up Instructions</Label>
            <Textarea
              id="follow-up-instructions"
              value={followUpInstructions}
              onChange={(e) => handleFollowUpInstructionsChange(e.target.value)}
              placeholder="Specific instructions for follow-up care and what to expect"
              rows={4}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Home Care Tasks */}
          <div>
            <Label>Home Care Instructions</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {homeCareTaskOptions.map(task => (
                <div key={task} className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task}`}
                    checked={homeCareTasks.includes(task)}
                    onCheckedChange={() => handleHomeCareTaskToggle(task)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`task-${task}`} className="text-sm cursor-pointer">
                    {task}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Signs */}
          <div>
            <Label htmlFor="warning-signs">Warning Signs to Watch For</Label>
            <Textarea
              id="warning-signs"
              value={warningSigns}
              onChange={(e) => handleWarningSignsChange(e.target.value)}
              placeholder="List symptoms or signs that would require immediate attention"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <Label htmlFor="emergency-contact">Emergency Contact Information</Label>
            <Textarea
              id="emergency-contact"
              value={emergencyContact}
              onChange={(e) => handleEmergencyContactChange(e.target.value)}
              placeholder="Emergency contact details and after-hours instructions"
              rows={3}
              disabled={isReadOnly}
              className="mt-2"
            />
          </div>

          {/* Recall Period */}
          <div>
            <Label htmlFor="recall-period">Next Routine Check-up</Label>
            <Select
              value={recallPeriod}
              onValueChange={handleRecallPeriodChange}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select recall period" />
              </SelectTrigger>
              <SelectContent>
                {recallPeriodOptions.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="additional-notes">Additional Follow-up Notes</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => handleAdditionalNotesChange(e.target.value)}
              placeholder="Any additional notes or special considerations"
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
                      next_appointment_date: nextAppointmentDate,
                      appointment_type: appointmentType,
                      appointment_duration: appointmentDuration,
                      follow_up_instructions: followUpInstructions,
                      home_care_tasks: homeCareTasks,
                      warning_signs: warningSigns,
                      emergency_contact: emergencyContact,
                      recall_period: recallPeriod,
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