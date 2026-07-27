'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ConditionBadge } from './condition-badge'
import { getCategoryById, getConditionInfo, getCategoryName, getConditionLabel } from '@/lib/kuntoarvio-data'
import { useTranslation } from '@/lib/i18n'
import type { CategoryEvaluation, ConditionScore } from '@/lib/kuntoarvio-types'
import {
  Building,
  Building2,
  Home,
  CloudRain,
  Square,
  DoorOpen,
  Droplets,
  Thermometer,
  Pipette,
  Wind,
  Zap,
  MoveVertical,
  Trees,
  Construction,
  PaintBucket,
  Armchair,
  Layers,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  foundation: Layers,
  building: Building,
  'building-2': Building2,
  home: Home,
  'cloud-rain': CloudRain,
  square: Square,
  'door-open': DoorOpen,
  droplets: Droplets,
  thermometer: Thermometer,
  pipette: Pipette,
  wind: Wind,
  zap: Zap,
  'move-vertical': MoveVertical,
  trees: Trees,
  construction: Construction,
  'paint-bucket': PaintBucket,
  armchair: Armchair,
}

interface CategoryCardProps {
  categoryId: string
  evaluation?: CategoryEvaluation
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  className?: string
}

export function CategoryCard({
  categoryId,
  evaluation,
  onClick,
  selected = false,
  disabled = false,
  className,
}: CategoryCardProps) {
  const { t } = useTranslation()
  const category = getCategoryById(categoryId)
  if (!category) return null

  const Icon = iconMap[category.icon] || Building
  const score = evaluation?.overallScore
  const conditionInfo = score ? getConditionInfo(score) : null
  const hasEvaluation = !!evaluation
  const isThorough = evaluation?.mode === 'thorough'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50',
        selected && 'border-primary ring-1 ring-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        !hasEvaluation && 'border-dashed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                conditionInfo ? conditionInfo.bgColor : 'bg-muted'
              )}
            >
              <Icon className={cn('h-5 w-5', conditionInfo ? conditionInfo.color : 'text-muted-foreground')} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm leading-tight truncate">{getCategoryName(categoryId, t)}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasEvaluation ? (
                  <>
                    {isThorough ? t("evaluationUi.thorough") : t("evaluationUi.basicAssessment")} • {evaluation.date}
                  </>
                ) : (
                  t("evaluationUi.notEvaluated")
                )}
              </p>
            </div>
          </div>
          {score && <ConditionBadge score={score} size="md" />}
          {!score && (
            <div className="h-8 w-8 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">–</span>
            </div>
          )}
        </div>
        {evaluation?.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{evaluation.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface CategoryGridProps {
  categoryIds: string[]
  evaluations: CategoryEvaluation[]
  onCategoryClick?: (categoryId: string) => void
  selectedCategoryId?: string
  className?: string
}

export function CategoryGrid({
  categoryIds,
  evaluations,
  onCategoryClick,
  selectedCategoryId,
  className,
}: CategoryGridProps) {
  const getEvaluation = (categoryId: string) =>
    evaluations.find((e) => e.categoryId === categoryId)

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {categoryIds.map((categoryId) => (
        <CategoryCard
          key={categoryId}
          categoryId={categoryId}
          evaluation={getEvaluation(categoryId)}
          onClick={() => onCategoryClick?.(categoryId)}
          selected={selectedCategoryId === categoryId}
        />
      ))}
    </div>
  )
}

interface CategorySummaryStatsProps {
  evaluations: CategoryEvaluation[]
  totalCategories: number
  className?: string
}

export function CategorySummaryStats({
  evaluations,
  totalCategories,
  className,
}: CategorySummaryStatsProps) {
  const { t } = useTranslation()
  const evaluated = evaluations.length
  const thorough = evaluations.filter((e) => e.mode === 'thorough').length
  const avgScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length
      : 0

  const scoreDistribution = [5, 4, 3, 2, 1].map((score) => ({
    score: score as ConditionScore,
    count: evaluations.filter((e) => e.overallScore === score).length,
  }))

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{evaluated}/{totalCategories}</p>
          <p className="text-xs text-muted-foreground">{t("evaluationUi.evaluated")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{thorough}</p>
          <p className="text-xs text-muted-foreground">{t("evaluationUi.thorough")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">{t("evaluationUi.average")}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{t("evaluationUi.conditionDistribution")}</p>
        <div className="flex gap-1">
          {scoreDistribution.map(({ score, count }) => {
            const info = getConditionInfo(score)
            const percentage = totalCategories > 0 ? (count / totalCategories) * 100 : 0
            return (
              <div
                key={score}
                className={cn('h-2 rounded-sm transition-all', info.bgColor)}
                style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                title={`${getConditionLabel(score, t)}: ${count}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("evaluationUi.poorLabel")}</span>
          <span>{t("evaluationUi.excellentLabel")}</span>
        </div>
      </div>
    </div>
  )
}
