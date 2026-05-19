'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConditionBadge, ConditionScaleLegend } from './condition-badge'
import { UrgencyBadge, UrgencyScaleLegend } from './urgency-badge'
import { getCategoryById, getConditionInfo, getUrgencyInfo } from '@/lib/kuntoarvio-data'
import type {
  ConditionScore,
  UrgencyClass,
  CategoryEvaluation,
  SubItemEvaluation,
} from '@/lib/kuntoarvio-types'
import { ChevronDown, ChevronUp, Camera, Save, Check } from 'lucide-react'

interface ScoreSelectorProps {
  value: ConditionScore | undefined
  onChange: (score: ConditionScore) => void
  disabled?: boolean
  className?: string
}

function ScoreSelector({ value, onChange, disabled, className }: ScoreSelectorProps) {
  const scores: ConditionScore[] = [1, 2, 3, 4, 5]

  return (
    <div className={cn('flex gap-1', className)}>
      {scores.map((score) => {
        const info = getConditionInfo(score)
        const isSelected = value === score
        return (
          <button
            key={score}
            type="button"
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              'h-10 w-10 rounded-md font-semibold transition-all',
              'border-2',
              isSelected
                ? cn(info.bgColor, info.color, info.borderColor)
                : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {score}
          </button>
        )
      })}
    </div>
  )
}

interface UrgencySelectorProps {
  value: UrgencyClass | undefined
  onChange: (urgency: UrgencyClass) => void
  disabled?: boolean
  className?: string
}

function UrgencySelector({ value, onChange, disabled, className }: UrgencySelectorProps) {
  const urgencies: UrgencyClass[] = [1, 2, 3, 4]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {urgencies.map((urgency) => {
        const info = getUrgencyInfo(urgency)
        const isSelected = value === urgency
        return (
          <button
            key={urgency}
            type="button"
            disabled={disabled}
            onClick={() => onChange(urgency)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              'border',
              isSelected
                ? cn(info.bgColor, info.color, 'border-current')
                : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {info.label}
          </button>
        )
      })}
    </div>
  )
}

interface SubItemFormProps {
  subItem: { id: string; name: string }
  evaluation?: SubItemEvaluation
  onChange: (evaluation: SubItemEvaluation) => void
}

function SubItemForm({ subItem, evaluation, onChange }: SubItemFormProps) {
  const handleScoreChange = (score: ConditionScore) => {
    onChange({
      subItemId: subItem.id,
      score,
      urgency: evaluation?.urgency,
      notes: evaluation?.notes,
      photos: evaluation?.photos,
      estimatedCost: evaluation?.estimatedCost,
    })
  }

  const handleUrgencyChange = (urgency: UrgencyClass) => {
    if (!evaluation?.score) return
    onChange({
      ...evaluation,
      urgency,
    })
  }

  const handleNotesChange = (notes: string) => {
    if (!evaluation?.score) return
    onChange({
      ...evaluation,
      notes,
    })
  }

  const handleCostChange = (cost: string) => {
    if (!evaluation?.score) return
    onChange({
      ...evaluation,
      estimatedCost: cost ? parseInt(cost, 10) : undefined,
    })
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h5 className="font-medium text-sm">{subItem.name}</h5>
        <ScoreSelector value={evaluation?.score} onChange={handleScoreChange} />
      </div>

      {evaluation?.score && (
        <div className="space-y-4 pt-2 border-t">
          <div className="space-y-2">
            <Label className="text-xs">Kiireellisyys</Label>
            <UrgencySelector value={evaluation.urgency} onChange={handleUrgencyChange} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`notes-${subItem.id}`} className="text-xs">
                Huomiot
              </Label>
              <Textarea
                id={`notes-${subItem.id}`}
                value={evaluation.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Lisähuomiot..."
                className="h-20 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`cost-${subItem.id}`} className="text-xs">
                Kustannusarvio (€)
              </Label>
              <Input
                id={`cost-${subItem.id}`}
                type="number"
                value={evaluation.estimatedCost || ''}
                onChange={(e) => handleCostChange(e.target.value)}
                placeholder="0"
              />
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Camera className="h-4 w-4" />
                Lisää kuva
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface EvaluationFormProps {
  categoryId: string
  existingEvaluation?: CategoryEvaluation
  onSave: (evaluation: CategoryEvaluation) => void
  onCancel?: () => void
  className?: string
}

export function EvaluationForm({
  categoryId,
  existingEvaluation,
  onSave,
  onCancel,
  className,
}: EvaluationFormProps) {
  const category = getCategoryById(categoryId)
  const [mode, setMode] = useState<'basic' | 'thorough'>(existingEvaluation?.mode || 'basic')
  const [overallScore, setOverallScore] = useState<ConditionScore | undefined>(
    existingEvaluation?.overallScore
  )
  const [notes, setNotes] = useState(existingEvaluation?.notes || '')
  const [subItemEvaluations, setSubItemEvaluations] = useState<SubItemEvaluation[]>(
    existingEvaluation?.subItemEvaluations || []
  )
  const [showLegend, setShowLegend] = useState(false)

  if (!category) return null

  const handleSubItemChange = (evaluation: SubItemEvaluation) => {
    setSubItemEvaluations((prev) => {
      const existing = prev.findIndex((e) => e.subItemId === evaluation.subItemId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = evaluation
        return updated
      }
      return [...prev, evaluation]
    })
  }

  const handleSave = () => {
    if (!overallScore) return

    const evaluation: CategoryEvaluation = {
      categoryId,
      date: new Date().toISOString().split('T')[0],
      mode,
      overallScore,
      notes: notes || undefined,
      subItemEvaluations: mode === 'thorough' ? subItemEvaluations : undefined,
    }
    onSave(evaluation)
  }

  const expandToThorough = () => {
    setMode('thorough')
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'basic' ? 'Perusarvio' : 'Tarkennettu arvio'} •{' '}
              {category.subItems.length} osa-aluetta
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs"
          >
            Asteikko
            {showLegend ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
        </div>

        {showLegend && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg grid gap-6 sm:grid-cols-2">
            <ConditionScaleLegend />
            <UrgencyScaleLegend />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Mode - Overall Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Yleisarvosana</Label>
            {overallScore && <ConditionBadge score={overallScore} showLabel size="md" />}
          </div>
          <ScoreSelector value={overallScore} onChange={setOverallScore} />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="overall-notes" className="text-sm font-medium">
            Yleiset huomiot
          </Label>
          <Textarea
            id="overall-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kirjoita yleiset huomiot tästä kategoriasta..."
            className="min-h-24"
          />
        </div>

        {/* Expand to Thorough Mode */}
        {mode === 'basic' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={expandToThorough}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Tarkenna – arvioi {category.subItems.length} osa-aluetta erikseen
          </Button>
        )}

        {/* Thorough Mode - Sub-items */}
        {mode === 'thorough' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Osa-alueet</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('basic')}
                className="text-xs"
              >
                Piilota osa-alueet
                <ChevronUp className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {category.subItems.map((subItem) => (
                <SubItemForm
                  key={subItem.id}
                  subItem={subItem}
                  evaluation={subItemEvaluations.find((e) => e.subItemId === subItem.id)}
                  onChange={handleSubItemChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Peruuta
            </Button>
          )}
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={!overallScore}
          >
            <Save className="h-4 w-4" />
            Tallenna arvio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface EvaluationProgressProps {
  total: number
  completed: number
  thorough: number
  className?: string
}

export function EvaluationProgress({
  total,
  completed,
  thorough,
  className,
}: EvaluationProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span>
          {completed} / {total} arvioitu
        </span>
        <span className="text-muted-foreground">
          {thorough} tarkennettu
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
