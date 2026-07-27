'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { buildingTypeTemplates, categories, getTemplateName, getCategoryName } from '@/lib/kuntoarvio-data'
import { useTranslation } from '@/lib/i18n'
import type { BuildingType } from '@/lib/kuntoarvio-types'
import {
  Building,
  Building2,
  Home,
  Factory,
  Store,
  Warehouse,
  Settings,
  Check,
} from 'lucide-react'

const buildingTypeIcons: Record<BuildingType, React.ComponentType<{ className?: string }>> = {
  kerrostalo: Building,
  rivitalo: Building2,
  paritalo: Home,
  omakotitalo: Home,
  toimisto: Building,
  liiketila: Store,
  teollisuus: Factory,
  varasto: Warehouse,
  muu: Settings,
}

interface BuildingTypeCardProps {
  type: BuildingType
  selected: boolean
  onSelect: () => void
}

function BuildingTypeCard({ type, selected, onSelect }: BuildingTypeCardProps) {
  const { t } = useTranslation()
  const template = buildingTypeTemplates.find((tmpl) => tmpl.id === type)
  if (!template) return null

  const Icon = buildingTypeIcons[type]
  const categoryCount = template.includedCategories.length

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50',
        selected && 'border-primary ring-1 ring-primary'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium">{getTemplateName(type, t)}</h4>
              {selected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {categoryCount > 0 ? `${categoryCount} ${t("evaluationUi.categoriesSuffix")}` : t("evaluationUi.selectYourself")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BuildingTypeSelectorProps {
  value: BuildingType
  customCategories?: string[]
  onChange: (type: BuildingType, categories: string[]) => void
  className?: string
}

export function BuildingTypeSelector({
  value,
  customCategories,
  onChange,
  className,
}: BuildingTypeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [selectedCustomCategories, setSelectedCustomCategories] = useState<string[]>(
    customCategories || []
  )

  const { t } = useTranslation()
  const template = buildingTypeTemplates.find((tmpl) => tmpl.id === value)
  const enabledCategories = value === 'muu' ? selectedCustomCategories : template?.includedCategories || []

  const handleTypeSelect = (type: BuildingType) => {
    if (type === 'muu') {
      setShowCustom(true)
    } else {
      const tmpl = buildingTypeTemplates.find((x) => x.id === type)
      onChange(type, tmpl?.includedCategories || [])
    }
  }

  const handleCustomCategoryToggle = (categoryId: string) => {
    setSelectedCustomCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCustomSave = () => {
    onChange('muu', selectedCustomCategories)
    setShowCustom(false)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {buildingTypeTemplates.map((template) => (
          <BuildingTypeCard
            key={template.id}
            type={template.id}
            selected={value === template.id}
            onSelect={() => handleTypeSelect(template.id)}
          />
        ))}
      </div>

      {value && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">
            {template ? getTemplateName(template.id, t) : t("evaluationUi.customLabel")}: {enabledCategories.length} {t("evaluationUi.categoriesInUse")}
          </p>
          <div className="flex flex-wrap gap-1">
            {enabledCategories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId)
              return (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-background border"
                >
                  {category ? getCategoryName(category.id, t) : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom Category Selection Dialog */}
      <Dialog open={showCustom} onOpenChange={setShowCustom}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("evaluationUi.selectCategoriesTitle")}</DialogTitle>
            <DialogDescription>
              {t("evaluationUi.selectCategoriesDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedCustomCategories.length} / {categories.length} {t("evaluationUi.selected")}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomCategories(categories.map((c) => c.id))}
                >
                  {t("evaluationUi.selectAll")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomCategories([])}
                >
                  {t("evaluationUi.clearAll")}
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCustomCategories.includes(category.id)}
                    onCheckedChange={() => handleCustomCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {getCategoryName(category.id, t)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({category.subItems.length})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCustom(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCustomSave}>
              {t("evaluationUi.saveWithCount")} ({selectedCustomCategories.length} {t("evaluationUi.categoriesSuffix")})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BuildingTypeBadgeProps {
  type: BuildingType
  className?: string
}

export function BuildingTypeBadge({ type, className }: BuildingTypeBadgeProps) {
  const { t } = useTranslation()
  const template = buildingTypeTemplates.find((tmpl) => tmpl.id === type)
  const Icon = buildingTypeIcons[type]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{template ? getTemplateName(template.id, t) : t("propertyDetail.notSet")}</span>
    </div>
  )
}
