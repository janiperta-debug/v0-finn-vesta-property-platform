"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, CheckCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import { BuildingTypeSelector } from "@/components/kuntoarvio/building-type-selector"
import { 
  categories,
  samplePropertyKuntoarvio,
  getCategoryById,
  getConditionInfo,
  buildingTypeTemplates,
  getCategoryName,
  getSubItemName,
} from "@/lib/kuntoarvio-data"
import { useTranslation } from "@/lib/i18n"
import type { 
  ConditionScore, 
  UrgencyClass,
  CategoryEvaluation,
  SubItemEvaluation,
  EvaluationMode,
  Category,
} from "@/lib/kuntoarvio-types"
import { properties } from "@/lib/mock-data"
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

// Icon mapping
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

// Condition rating options (5 = best, 1 = worst)
const CONDITION_OPTIONS: { value: ConditionScore; label: string; description: string }[] = [
  { value: 5, label: "5 - Erinomainen", description: "Uudenveroinen, ei toimenpiteitä" },
  { value: 4, label: "4 - Hyvä", description: "Normaali kuluminen, huolto riittää" },
  { value: 3, label: "3 - Tyydyttävä", description: "Korjaustarve 5-10v sisällä" },
  { value: 2, label: "2 - Välttävä", description: "Korjaustarve 1-5v sisällä" },
  { value: 1, label: "1 - Heikko", description: "Välitön korjaustarve" },
]

const URGENCY_OPTIONS: { value: UrgencyClass; label: string }[] = [
  { value: 1, label: "Välitön (heti)" },
  { value: 2, label: "Kiireellinen (1-2v)" },
  { value: 3, label: "Suunniteltava (3-5v)" },
  { value: 4, label: "Seurattava (ei akuuttia)" },
]

// Internal state types for the form
interface FormCategoryEvaluation {
  categoryId: string
  overallScore: ConditionScore | null
  notes: string
  urgency: UrgencyClass | null
  mode: EvaluationMode
  subItems: FormSubItemEvaluation[]
}

interface FormSubItemEvaluation {
  subItemId: string
  score: ConditionScore | null
  notes: string
  urgency: UrgencyClass | null
}

// Group categories
const categoryGroups: Record<string, { label: string; categoryIds: string[] }> = {
  piha: {
    label: "Piha-alueet",
    categoryIds: ["piha"],
  },
  rakenne: {
    label: "Rakenteet", 
    categoryIds: ["perustukset", "runko", "julkisivut", "ikkunat", "ovet", "katto", "vesikate"],
  },
  talotekniikka: {
    label: "Talotekniikka",
    categoryIds: ["lvi-lammitys", "lvi-vesi", "lvi-ilmanvaihto", "sahko", "hissi"],
  },
  sisatilat: {
    label: "Sisätilat",
    categoryIds: ["sisatilat-pinnat", "sisatilat-kalusteet", "markatilat", "erityisrakenteet"],
  },
}

export default function ArviointiPage() {
  const params = useParams()
  const { t } = useTranslation()
  const propertyId = params.id as string
  
  const property = properties.find(p => p.id === propertyId)
  
  // Initialize form state from mock data
  const initialEvaluations = useMemo(() => {
    const formData: Record<string, FormCategoryEvaluation> = {}
    
    categories.forEach(cat => {
      const existingEval = samplePropertyKuntoarvio.evaluations.find(e => e.categoryId === cat.id)
      
      formData[cat.id] = {
        categoryId: cat.id,
        overallScore: existingEval?.overallScore || null,
        notes: existingEval?.notes || "",
        urgency: existingEval?.subItemEvaluations?.[0]?.urgency || null,
        mode: existingEval?.mode || "basic",
        subItems: cat.subItems.map(sub => {
          const existingSubEval = existingEval?.subItemEvaluations?.find(s => s.subItemId === sub.id)
          return {
            subItemId: sub.id,
            score: existingSubEval?.score || null,
            notes: existingSubEval?.notes || "",
            urgency: existingSubEval?.urgency || null,
          }
        })
      }
    })
    
    return formData
  }, [])
  
  const [evaluations, setEvaluations] = useState<Record<string, FormCategoryEvaluation>>(initialEvaluations)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("all")
  const [buildingType, setBuildingType] = useState<string>(samplePropertyKuntoarvio.buildingType)
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    new Set(samplePropertyKuntoarvio.enabledCategories)
  )
  const [showBuildingTypeSelector, setShowBuildingTypeSelector] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Calculate progress
  const progress = useMemo(() => {
    const enabledCats = Array.from(enabledCategories)
    const evaluated = enabledCats.filter(catId => evaluations[catId]?.overallScore !== null).length
    return enabledCats.length > 0 ? Math.round((evaluated / enabledCats.length) * 100) : 0
  }, [evaluations, enabledCategories])
  
  // Group enabled categories
  const categoriesByGroup = useMemo(() => {
    const result: Record<string, Category[]> = {}
    
    Object.entries(categoryGroups).forEach(([groupKey, group]) => {
      result[groupKey] = group.categoryIds
        .filter(id => enabledCategories.has(id))
        .map(id => getCategoryById(id))
        .filter((cat): cat is Category => cat !== undefined)
    })
    
    return result
  }, [enabledCategories])
  
  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }
  
  const updateCategoryScore = (categoryId: string, score: ConditionScore) => {
    setEvaluations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        overallScore: score,
      }
    }))
  }
  
  const updateCategoryNotes = (categoryId: string, notes: string) => {
    setEvaluations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        notes,
      }
    }))
  }
  
  const updateCategoryUrgency = (categoryId: string, urgency: UrgencyClass) => {
    setEvaluations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        urgency,
      }
    }))
  }
  
  const updateSubItem = (categoryId: string, subItemId: string, updates: Partial<FormSubItemEvaluation>) => {
    setEvaluations(prev => {
      const category = prev[categoryId]
      if (!category) return prev
      
      const subItems = category.subItems.map(item => 
        item.subItemId === subItemId ? { ...item, ...updates } : item
      )
      
      return {
        ...prev,
        [categoryId]: {
          ...category,
          subItems,
          mode: "thorough" as EvaluationMode,
        }
      }
    })
  }
  
  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastSaved(new Date())
    setIsSaving(false)
  }
  
  const handleBuildingTypeSelect = (type: string, selectedCategories: string[]) => {
    setBuildingType(type)
    setEnabledCategories(new Set(selectedCategories))
    setShowBuildingTypeSelector(false)
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kohdetta ei löytynyt</p>
      </div>
    )
  }
  
  const renderCategoryCard = (category: Category) => {
    const evaluation = evaluations[category.id]
    const isExpanded = expandedCategories.has(category.id)
    const Icon = iconMap[category.icon] || Building
    const conditionInfo = evaluation?.overallScore ? getConditionInfo(evaluation.overallScore) : null
    
    return (
      <Card key={category.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${conditionInfo ? conditionInfo.bgColor : 'bg-muted'}`}>
                <Icon className={`h-5 w-5 ${conditionInfo ? conditionInfo.color : 'text-muted-foreground'}`} />
              </div>
              <div>
                <CardTitle className="text-base">{getCategoryName(String(category.id), t)}</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {category.subItems.length} alaosaa
                </CardDescription>
              </div>
            </div>
            {evaluation?.overallScore && (
              <ConditionBadge score={evaluation.overallScore} size="sm" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Basic Mode: Quick Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Yleisarvio</Label>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateCategoryScore(category.id, option.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    evaluation?.overallScore === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Notes */}
          <div className="space-y-2">
            <Label className="text-sm">Huomiot</Label>
            <Textarea
              placeholder="Lisää huomioita..."
              value={evaluation?.notes || ""}
              onChange={(e) => updateCategoryNotes(category.id, e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
          
          {/* Urgency Selection - show if condition is 3 or worse */}
          {evaluation?.overallScore && evaluation.overallScore <= 3 && (
            <div className="space-y-2">
              <Label className="text-sm">Kiireellisyys</Label>
              <Select
                value={evaluation?.urgency?.toString() || ""}
                onValueChange={(value) => updateCategoryUrgency(category.id, parseInt(value) as UrgencyClass)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Valitse kiireellisyys" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Tarkenna Button - Expand to Thorough Mode */}
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(category.id)}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Piilota yksityiskohdat
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Tarkenna ({category.subItems.length} alaosaa)
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <Separator />
              
              {/* Sub-items Grid */}
              <div className="space-y-3">
                {category.subItems.map(subItem => {
                  const subEval = evaluation?.subItems?.find(s => s.subItemId === subItem.id)
                  const subConditionInfo = subEval?.score ? getConditionInfo(subEval.score) : null
                  
                  return (
                    <div key={subItem.id} className="p-3 rounded-lg bg-muted/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{getSubItemName(String(subItem.id), t)}</p>
                        </div>
                        {subEval?.score && (
                          <ConditionBadge score={subEval.score} size="sm" />
                        )}
                      </div>
                      
                      {/* Sub-item Rating */}
                      <div className="flex flex-wrap gap-1.5">
                        {CONDITION_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            onClick={() => updateSubItem(category.id, subItem.id, { score: option.value })}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              subEval?.score === option.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-border"
                            }`}
                          >
                            {option.value}
                          </button>
                        ))}
                      </div>
                      
                      {/* Sub-item Notes */}
                      <Input
                        placeholder="Huomiot..."
                        value={subEval?.notes || ""}
                        onChange={(e) => updateSubItem(category.id, subItem.id, { notes: e.target.value })}
                        className="text-sm h-8"
                      />
                      
                      {/* Sub-item Urgency - show if score <= 3 */}
                      {subEval?.score && subEval.score <= 3 && (
                        <Select
                          value={subEval?.urgency?.toString() || ""}
                          onValueChange={(value) => updateSubItem(category.id, subItem.id, { urgency: parseInt(value) as UrgencyClass })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Kiireellisyys" />
                          </SelectTrigger>
                          <SelectContent>
                            {URGENCY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/demo/property/${propertyId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kuntoarvio</h1>
            <p className="text-muted-foreground">{property.address}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Tallennettu {lastSaved.toLocaleTimeString("fi-FI")}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Tallennetaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tallenna
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Arvioinnin edistyminen</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {Array.from(enabledCategories).filter(id => evaluations[id]?.overallScore !== null).length} / {enabledCategories.size} kategoriaa arvioitu
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs"
              onClick={() => setShowBuildingTypeSelector(true)}
            >
              Muuta rakennustyyppiä
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Building Type Selector Modal */}
      {showBuildingTypeSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Valitse rakennustyyppi</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowBuildingTypeSelector(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Rakennustyyppi määrittää mitkä kategoriat ovat oletuksena käytössä
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BuildingTypeSelector
                value={buildingType as any}
                onChange={handleBuildingTypeSelect as any}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">Kaikki</TabsTrigger>
          <TabsTrigger value="piha">Piha-alueet</TabsTrigger>
          <TabsTrigger value="rakenne">Rakenteet</TabsTrigger>
          <TabsTrigger value="talotekniikka">Talotekniikka</TabsTrigger>
          <TabsTrigger value="sisatilat">Sisätilat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-8">
            {Object.entries(categoriesByGroup).map(([groupKey, cats]) => (
              cats.length > 0 && (
                <div key={groupKey} className="space-y-4">
                  <h2 className="text-lg font-semibold">{categoryGroups[groupKey]?.label}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {cats.map(cat => renderCategoryCard(cat))}
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>
        
        {Object.entries(categoriesByGroup).map(([groupKey, cats]) => (
          <TabsContent key={groupKey} value={groupKey} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {cats.map(cat => renderCategoryCard(cat))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Summary Footer */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {Object.values(evaluations).filter(e => e.overallScore && e.overallScore >= 4).length} hyvässä kunnossa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {Object.values(evaluations).filter(e => e.overallScore && e.overallScore <= 2).length} korjaustarpeita
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/demo/property/${propertyId}/historia`}>
                  Katso historia
                </Link>
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Tallenna arvio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
