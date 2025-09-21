'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, DollarSign, Clock, User, CheckCircle, AlertTriangle, Wrench } from "lucide-react"
import { InteractiveDentalChart } from "@/components/dentist/interactive-dental-chart"

interface TreatmentProcedure {
  id: string
  procedure_code: string
  procedure_name: string
  description: string
  tooth_specific?: string[]
  priority: 'emergency' | 'urgent' | 'routine' | 'elective'
  estimated_duration: string
  estimated_cost: number
  success_rate: number
  alternative_procedures: string[]
  risks_complications: string[]
  post_op_instructions: string
  sequence_order: number
  status: 'planned' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

interface TreatmentPhase {
  id: string
  phase_number: number
  phase_name: string
  procedures: TreatmentProcedure[]
  estimated_duration: string
  target_completion_date: string
  phase_goals: string[]
  status: 'pending' | 'active' | 'completed'
}

interface TreatmentPlanData {
  treatment_phases: TreatmentPhase[]
  tooth_specific_treatments: {
    [toothNumber: string]: {
      primary_treatment: TreatmentProcedure | null
      alternative_treatments: TreatmentProcedure[]
      prognosis: string
      treatment_goals: string[]
      estimated_sessions: number
      total_cost: number
    }
  }
  overall_prognosis: string
  treatment_goals: string[]
  patient_consent_obtained: boolean
  insurance_verification: boolean
  estimated_total_cost: number
  estimated_total_duration: string
  contraindications: string[]
  patient_preferences: string
  follow_up_plan: string
}

interface TreatmentPlanTabProps {
  data: TreatmentPlanData
  onChange: (data: TreatmentPlanData) => void
  isReadOnly?: boolean
}

const COMMON_PROCEDURES = [
  { code: 'D0120', name: 'Periodic oral evaluation', category: 'Diagnostic', duration: '30 mins', cost: 150 },
  { code: 'D2140', name: 'Amalgam restoration - one surface', category: 'Restorative', duration: '45 mins', cost: 200 },
  { code: 'D2750', name: 'Crown - porcelain fused to metal', category: 'Prosthodontic', duration: '90 mins', cost: 1200 },
  { code: 'D3310', name: 'Endodontic therapy, anterior tooth', category: 'Endodontic', duration: '60 mins', cost: 800 },
  { code: 'D7140', name: 'Extraction, erupted tooth', category: 'Oral Surgery', duration: '30 mins', cost: 300 },
  { code: 'D4210', name: 'Gingivectomy - four or more teeth', category: 'Periodontal', duration: '60 mins', cost: 600 },
  { code: 'D5110', name: 'Complete denture - upper', category: 'Prosthodontic', duration: '120 mins', cost: 2000 },
  { code: 'D8080', name: 'Comprehensive orthodontic treatment', category: 'Orthodontic', duration: '24 months', cost: 5000 },
]

export function TreatmentPlanTab({ data, onChange, isReadOnly = false }: TreatmentPlanTabProps) {
  const [localData, setLocalData] = useState<TreatmentPlanData>(data)
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleUpdate = (field: keyof TreatmentPlanData, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onChange(updatedData)
  }

  const addTreatmentPhase = () => {
    const newPhase: TreatmentPhase = {
      id: `phase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phase_number: localData.treatment_phases.length + 1,
      phase_name: '',
      procedures: [],
      estimated_duration: '',
      target_completion_date: '',
      phase_goals: [],
      status: 'pending'
    }

    handleUpdate('treatment_phases', [...localData.treatment_phases, newPhase])
  }

  const addProcedure = (phaseId: string, isToothSpecific = false) => {
    const newProcedure: TreatmentProcedure = {
      id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      procedure_code: '',
      procedure_name: '',
      description: '',
      tooth_specific: isToothSpecific && selectedTooth ? [selectedTooth] : undefined,
      priority: 'routine',
      estimated_duration: '30',
      estimated_cost: 0,
      success_rate: 90,
      alternative_procedures: [],
      risks_complications: [],
      post_op_instructions: '',
      sequence_order: 1,
      status: 'planned'
    }

    if (isToothSpecific && selectedTooth) {
      const currentToothData = localData.tooth_specific_treatments[selectedTooth] || {
        primary_treatment: null,
        alternative_treatments: [],
        prognosis: '',
        treatment_goals: [],
        estimated_sessions: 1,
        total_cost: 0
      }

      if (!currentToothData.primary_treatment) {
        const updatedToothTreatments = {
          ...localData.tooth_specific_treatments,
          [selectedTooth]: {
            ...currentToothData,
            primary_treatment: newProcedure
          }
        }
        handleUpdate('tooth_specific_treatments', updatedToothTreatments)
      } else {
        const updatedToothTreatments = {
          ...localData.tooth_specific_treatments,
          [selectedTooth]: {
            ...currentToothData,
            alternative_treatments: [...currentToothData.alternative_treatments, newProcedure]
          }
        }
        handleUpdate('tooth_specific_treatments', updatedToothTreatments)
      }
    } else {
      const updatedPhases = localData.treatment_phases.map(phase =>
        phase.id === phaseId
          ? { ...phase, procedures: [...phase.procedures, newProcedure] }
          : phase
      )
      handleUpdate('treatment_phases', updatedPhases)
    }
  }

  const selectCommonProcedure = (commonProc: typeof COMMON_PROCEDURES[0], phaseId?: string) => {
    const newProcedure: TreatmentProcedure = {
      id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      procedure_code: commonProc.code,
      procedure_name: commonProc.name,
      description: '',
      priority: 'routine',
      estimated_duration: commonProc.duration,
      estimated_cost: commonProc.cost,
      success_rate: 90,
      alternative_procedures: [],
      risks_complications: [],
      post_op_instructions: '',
      sequence_order: 1,
      status: 'planned'
    }

    if (phaseId) {
      const updatedPhases = localData.treatment_phases.map(phase =>
        phase.id === phaseId
          ? { ...phase, procedures: [...phase.procedures, newProcedure] }
          : phase
      )
      handleUpdate('treatment_phases', updatedPhases)
    }
  }

  const getToothData = (toothNumber: string) => {
    return localData.tooth_specific_treatments[toothNumber] || {
      primary_treatment: null,
      alternative_treatments: [],
      prognosis: '',
      treatment_goals: [],
      estimated_sessions: 1,
      total_cost: 0
    }
  }

  const getOralCavityStatus = () => {
    const toothNumbers = Array.from({ length: 32 }, (_, i) => (i + 1).toString())
    const treatmentTeeth = Object.keys(localData.tooth_specific_treatments).filter(tooth => {
      const toothData = localData.tooth_specific_treatments[tooth]
      return toothData.primary_treatment || toothData.alternative_treatments.length > 0
    })

    return {
      total: 32,
      healthy: toothNumbers.length - treatmentTeeth.length,
      planned: treatmentTeeth.length,
      urgent: treatmentTeeth.filter(tooth => {
        const toothData = localData.tooth_specific_treatments[tooth]
        return toothData.primary_treatment?.priority === 'urgent' || toothData.primary_treatment?.priority === 'emergency'
      }).length
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300'
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'elective': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const calculateTotalCost = () => {
    const phaseCosts = localData.treatment_phases.reduce((total, phase) => {
      return total + phase.procedures.reduce((phaseTotal, proc) => phaseTotal + proc.estimated_cost, 0)
    }, 0)

    const toothCosts = Object.values(localData.tooth_specific_treatments).reduce((total, toothData) => {
      const primaryCost = toothData.primary_treatment?.estimated_cost || 0
      const altCosts = toothData.alternative_treatments.reduce((altTotal, proc) => altTotal + proc.estimated_cost, 0)
      return total + primaryCost + altCosts
    }, 0)

    return phaseCosts + toothCosts
  }

  const oralStatus = getOralCavityStatus()

  return (
    <div className="space-y-6">
      {/* Interactive Dental Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Tooth-Specific Treatment Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InteractiveDentalChart
              onToothSelect={(toothNumber) => {
                setSelectedTooth(toothNumber)
                console.log(`Selected tooth ${toothNumber} for treatment planning`)
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
                <div className="text-sm text-gray-600">No Treatment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{oralStatus.planned}</div>
                <div className="text-sm text-gray-600">Treatment Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{oralStatus.urgent}</div>
                <div className="text-sm text-gray-600">Urgent/Emergency</div>
              </div>
            </div>

            {selectedTooth && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Selected: Tooth #{selectedTooth}
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-700">
                    {getToothData(selectedTooth).primary_treatment ? '1 Primary' : 'No Primary'}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700">
                    {getToothData(selectedTooth).alternative_treatments.length} Alternative(s)
                  </Badge>
                  <Badge variant="outline" className="text-blue-700">
                    ${getToothData(selectedTooth).total_cost || 0}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Procedure Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Procedure Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMMON_PROCEDURES.map((proc) => (
              <Card key={proc.code} className="p-3 hover:bg-gray-50 cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {proc.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{proc.code}</span>
                  </div>
                  <h4 className="text-sm font-medium">{proc.name}</h4>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{proc.duration}</span>
                    <span>${proc.cost}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 w-full"
                    onClick={() => {
                      if (selectedPhase) {
                        selectCommonProcedure(proc, selectedPhase)
                      }
                    }}
                    disabled={!selectedPhase || isReadOnly}
                  >
                    Add to Phase
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Phases */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Treatment Phases
                </CardTitle>
                <Button
                  onClick={addTreatmentPhase}
                  size="sm"
                  disabled={isReadOnly}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localData.treatment_phases.map((phase) => (
                <Card
                  key={phase.id}
                  className={`p-4 border-2 cursor-pointer ${
                    selectedPhase === phase.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800">
                        Phase {phase.phase_number}
                      </Badge>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div>
                      <Label>Phase Name</Label>
                      <Input
                        value={phase.phase_name}
                        onChange={(e) => {
                          const updatedPhases = localData.treatment_phases.map(p =>
                            p.id === phase.id ? { ...p, phase_name: e.target.value } : p
                          )
                          handleUpdate('treatment_phases', updatedPhases)
                        }}
                        placeholder="e.g., Emergency Treatment"
                        disabled={isReadOnly}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={phase.estimated_duration}
                          onChange={(e) => {
                            const updatedPhases = localData.treatment_phases.map(p =>
                              p.id === phase.id ? { ...p, estimated_duration: e.target.value } : p
                            )
                            handleUpdate('treatment_phases', updatedPhases)
                          }}
                          placeholder="e.g., 2 weeks"
                          disabled={isReadOnly}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <Label>Target Date</Label>
                        <Input
                          type="date"
                          value={phase.target_completion_date}
                          onChange={(e) => {
                            const updatedPhases = localData.treatment_phases.map(p =>
                              p.id === phase.id ? { ...p, target_completion_date: e.target.value } : p
                            )
                            handleUpdate('treatment_phases', updatedPhases)
                          }}
                          disabled={isReadOnly}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {phase.procedures.length} procedure(s)
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          addProcedure(phase.id)
                        }}
                        size="sm"
                        variant="outline"
                        disabled={isReadOnly}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Procedure
                      </Button>
                    </div>

                    {selectedPhase === phase.id && (
                      <div className="space-y-3 border-t pt-3">
                        {phase.procedures.map((procedure) => (
                          <Card key={procedure.id} className="p-3 bg-white">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge className={getPriorityColor(procedure.priority)}>
                                  {procedure.priority.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(procedure.status)}>
                                  {procedure.status}
                                </Badge>
                              </div>
                              <Input
                                value={procedure.procedure_name}
                                onChange={(e) => {
                                  const updatedPhases = localData.treatment_phases.map(p =>
                                    p.id === phase.id ? {
                                      ...p,
                                      procedures: p.procedures.map(proc =>
                                        proc.id === procedure.id ? { ...proc, procedure_name: e.target.value } : proc
                                      )
                                    } : p
                                  )
                                  handleUpdate('treatment_phases', updatedPhases)
                                }}
                                placeholder="Procedure name"
                                disabled={isReadOnly}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  value={procedure.estimated_duration}
                                  onChange={(e) => {
                                    const updatedPhases = localData.treatment_phases.map(p =>
                                      p.id === phase.id ? {
                                        ...p,
                                        procedures: p.procedures.map(proc =>
                                          proc.id === procedure.id ? { ...proc, estimated_duration: e.target.value } : proc
                                        )
                                      } : p
                                    )
                                    handleUpdate('treatment_phases', updatedPhases)
                                  }}
                                  placeholder="Duration"
                                  disabled={isReadOnly}
                                />
                                <Input
                                  type="number"
                                  value={procedure.estimated_cost}
                                  onChange={(e) => {
                                    const updatedPhases = localData.treatment_phases.map(p =>
                                      p.id === phase.id ? {
                                        ...p,
                                        procedures: p.procedures.map(proc =>
                                          proc.id === procedure.id ? { ...proc, estimated_cost: parseFloat(e.target.value) || 0 } : proc
                                        )
                                      } : p
                                    )
                                    handleUpdate('treatment_phases', updatedPhases)
                                  }}
                                  placeholder="Cost ($)"
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {localData.treatment_phases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No treatment phases planned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tooth-Specific Treatment and Summary */}
        <div className="space-y-6">
          {/* Tooth-Specific Treatment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Tooth-Specific Treatment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTooth ? (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Tooth #{selectedTooth} Treatment Plan</h4>
                  </div>

                  {/* Primary Treatment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">Primary Treatment</Label>
                      {!getToothData(selectedTooth).primary_treatment && (
                        <Button
                          onClick={() => addProcedure('', true)}
                          size="sm"
                          disabled={isReadOnly}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Primary
                        </Button>
                      )}
                    </div>

                    {getToothData(selectedTooth).primary_treatment ? (
                      <Card className="p-4 border-blue-200">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <Badge className={getPriorityColor(getToothData(selectedTooth).primary_treatment!.priority)}>
                              PRIMARY - {getToothData(selectedTooth).primary_treatment!.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              ${getToothData(selectedTooth).primary_treatment!.estimated_cost}
                            </Badge>
                          </div>
                          <Input
                            value={getToothData(selectedTooth).primary_treatment!.procedure_name}
                            onChange={(e) => {
                              const updatedToothTreatments = {
                                ...localData.tooth_specific_treatments,
                                [selectedTooth]: {
                                  ...getToothData(selectedTooth),
                                  primary_treatment: {
                                    ...getToothData(selectedTooth).primary_treatment!,
                                    procedure_name: e.target.value
                                  }
                                }
                              }
                              handleUpdate('tooth_specific_treatments', updatedToothTreatments)
                            }}
                            placeholder="Primary treatment for this tooth"
                            disabled={isReadOnly}
                          />
                        </div>
                      </Card>
                    ) : (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-sm">No primary treatment for tooth #{selectedTooth}</p>
                      </div>
                    )}
                  </div>

                  {/* Treatment Goals */}
                  <div>
                    <Label>Treatment Goals</Label>
                    <Textarea
                      value={getToothData(selectedTooth).treatment_goals.join('\n')}
                      onChange={(e) => {
                        const updatedToothTreatments = {
                          ...localData.tooth_specific_treatments,
                          [selectedTooth]: {
                            ...getToothData(selectedTooth),
                            treatment_goals: e.target.value.split('\n').filter(goal => goal.trim())
                          }
                        }
                        handleUpdate('tooth_specific_treatments', updatedToothTreatments)
                      }}
                      placeholder="Treatment goals for this tooth (one per line)..."
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
                        const updatedToothTreatments = {
                          ...localData.tooth_specific_treatments,
                          [selectedTooth]: {
                            ...getToothData(selectedTooth),
                            prognosis: value
                          }
                        }
                        handleUpdate('tooth_specific_treatments', updatedToothTreatments)
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
                  <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a tooth from the dental chart above</p>
                  <p className="text-sm">to plan tooth-specific treatments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treatment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Treatment Plan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{localData.treatment_phases.length}</div>
                  <div className="text-sm text-gray-600">Treatment Phases</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${calculateTotalCost()}</div>
                  <div className="text-sm text-gray-600">Estimated Total Cost</div>
                </div>
              </div>

              <div>
                <Label htmlFor="overall-prognosis">Overall Prognosis</Label>
                <Select
                  value={localData.overall_prognosis}
                  onValueChange={(value) => handleUpdate('overall_prognosis', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select overall prognosis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="guarded">Guarded</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="treatment-goals">Overall Treatment Goals</Label>
                <Textarea
                  id="treatment-goals"
                  value={localData.treatment_goals.join('\n')}
                  onChange={(e) => handleUpdate('treatment_goals', e.target.value.split('\n').filter(goal => goal.trim()))}
                  placeholder="Overall treatment goals (one per line)..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="patient-consent"
                    checked={localData.patient_consent_obtained}
                    onChange={(e) => handleUpdate('patient_consent_obtained', e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="patient-consent" className="text-sm">
                    Patient consent obtained
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="insurance-verification"
                    checked={localData.insurance_verification}
                    onChange={(e) => handleUpdate('insurance_verification', e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="insurance-verification" className="text-sm">
                    Insurance verification completed
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="patient-preferences">Patient Preferences & Concerns</Label>
                <Textarea
                  id="patient-preferences"
                  value={localData.patient_preferences}
                  onChange={(e) => handleUpdate('patient_preferences', e.target.value)}
                  placeholder="Patient's preferences, concerns, or special requests..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}