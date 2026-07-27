'use client'

import { cn } from '@/lib/utils'
import { getConditionInfo, getConditionLabel, getConditionDescription } from '@/lib/kuntoarvio-data'
import { useTranslation } from '@/lib/i18n'
import type { ConditionScore } from '@/lib/kuntoarvio-types'

interface ConditionBadgeProps {
  score: ConditionScore
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConditionBadge({
  score,
  showLabel = false,
  size = 'md',
  className,
}: ConditionBadgeProps) {
  const { t } = useTranslation()
  const info = getConditionInfo(score)

  const sizeClasses = {
    sm: 'h-6 min-w-6 text-xs',
    md: 'h-8 min-w-8 text-sm',
    lg: 'h-10 min-w-10 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold',
        info.bgColor,
        info.color,
        info.borderColor,
        'border',
        sizeClasses[size],
        showLabel ? 'px-3 gap-2' : 'px-2',
        className
      )}
    >
      <span>{score}</span>
      {showLabel && <span className="font-medium">{getConditionLabel(score, t)}</span>}
    </div>
  )
}

interface ConditionScaleLegendProps {
  className?: string
  compact?: boolean
}

export function ConditionScaleLegend({ className, compact = false }: ConditionScaleLegendProps) {
  const { t } = useTranslation()
  const scores: ConditionScore[] = [5, 4, 3, 2, 1]

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {scores.map((score) => {
          const info = getConditionInfo(score)
          return (
            <div key={score} className="flex items-center gap-1">
              <div className={cn('h-3 w-3 rounded-sm', info.bgColor, info.borderColor, 'border')} />
              <span className="text-xs text-muted-foreground">{score}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium text-muted-foreground mb-2">{t("evaluationUi.conditionScaleTitle")}</p>
      {scores.map((score) => {
        const info = getConditionInfo(score)
        return (
          <div key={score} className="flex items-center gap-2">
            <ConditionBadge score={score} size="sm" />
            <span className="text-sm">{getConditionLabel(score, t)}</span>
            <span className="text-xs text-muted-foreground">– {getConditionDescription(score, t)}</span>
          </div>
        )
      })}
    </div>
  )
}
