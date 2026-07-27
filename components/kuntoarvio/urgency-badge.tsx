'use client'

import { cn } from '@/lib/utils'
import { getUrgencyInfo, getUrgencyLabel, getUrgencyTimeframe } from '@/lib/kuntoarvio-data'
import { useTranslation } from '@/lib/i18n'
import type { UrgencyClass } from '@/lib/kuntoarvio-types'

interface UrgencyBadgeProps {
  urgency: UrgencyClass
  showTimeframe?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UrgencyBadge({
  urgency,
  showTimeframe = false,
  size = 'md',
  className,
}: UrgencyBadgeProps) {
  const { t } = useTranslation()
  const info = getUrgencyInfo(urgency)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        info.bgColor,
        info.color,
        sizeClasses[size],
        className
      )}
    >
      <span>{getUrgencyLabel(urgency, t)}</span>
      {showTimeframe && (
        <span className="text-muted-foreground font-normal">({getUrgencyTimeframe(urgency, t)})</span>
      )}
    </div>
  )
}

interface UrgencyScaleLegendProps {
  className?: string
}

export function UrgencyScaleLegend({ className }: UrgencyScaleLegendProps) {
  const { t } = useTranslation()
  const urgencies: UrgencyClass[] = [1, 2, 3, 4]

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium text-muted-foreground mb-2">{t("evaluationUi.urgencyScaleTitle")}</p>
      {urgencies.map((urgency) => {
        const info = getUrgencyInfo(urgency)
        return (
          <div key={urgency} className="flex items-center gap-2">
            <UrgencyBadge urgency={urgency} size="sm" />
            <span className="text-xs text-muted-foreground">{getUrgencyTimeframe(urgency, t)}</span>
          </div>
        )
      })}
    </div>
  )
}
