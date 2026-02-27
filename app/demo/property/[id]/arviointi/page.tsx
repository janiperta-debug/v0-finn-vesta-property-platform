"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, CheckCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Plus, X, Camera, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import { UrgencyBadge } from "@/components/kuntoarvio/urgency-badge"
import { BuildingTypeSelector } from "@/components/kuntoarvio/building-type-selector"
import { 
  CATEGORY_DEFINITIONS, 
  MOCK_PROPERTY_EVALUATION,
  type CategoryEvaluation,
  type SubItemEvaluation,
  type ConditionRating,
  type UrgencyLevel
} from "@/lib/kuntoarvio-data"
import { properties } from "@/lib/mock-data"

// Condition rating options
const CONDITION_OPTIONS: { value: ConditionRating; label: string; description: string }[] = [
  { value: 1, label: "1 - Uusi/Erinomainen", description: "Äskettäin uusittu tai uudenveroinen" },
  { value: 2, label: "2 - Hyvä", description: "Hyväkuntoinen, ei korjaustarpeita" },
  { value: 3, label: "3 - Tyydyttävä", description: "Toimiva, huoltoa tarvitseva" },
  { value: 4, label: "4 - Välttävä", description: "Korjaustarve lähivuosina" },
  { value: 5, label: "5 - Heikko", description: "Välitön korjaustarve" },
]

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: "immediate", label: "Välitön (0-1v)" },
  { value: "short", label: "Lyhyt (1-3v)" },
  { value: "medium", label: "Keskipitkä (3-5v)" },
  { value: "long", label: "Pitkä (5-10v)" },
  { value: "none", label: "Ei kiireellistä" },
]

export default function ArviointiPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const property = properties.find(p => p.id === propertyId)
  
  // State for evaluation data
  const [evaluations, setEvaluations] = useState<Record<string, CategoryEvaluation>>(
    MOCK_PROPERTY_EVALUATION.categories
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("all")
  const [buildingType, setBuildingType] = useState<string>("kerrostalo")
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_DEFINITIONS))
  )
  const [showBuildingTypeSelector, setShowBuildingTypeSelector] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Calculate progress
  const progress = useMemo(() => {
    const enabledCats = Array.from(enabledCategories)
    const evaluated = enabledCats.filter(catId => evaluations[catId]?.condition).length
    return Math.round((evaluated / enabledCats.length) * 100)
  }, [evaluations, enabledCategories])
  
  // Group categories by type
  const categoriesByGroup = useMemo(() => {
    const groups: Record<string, typeof CATEGORY_DEFINITIONS[keyof typeof CATEGORY_DEFINITIONS][]> = {
      piha: [],
      rakenne: [],
      talotekniikka: [],
      sisatilat: [],
    }
    
    Object.values(CATEGORY_DEFINITIONS).forEach(cat => {
      if (enabledCategories.has(cat.id)) {
        groups[cat.group]?.push(cat)
      }
    })
    
    return groups
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
  
  const updateCategoryCondition = (categoryId: string, condition: ConditionRating) => {
    setEvaluations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        categoryId,
        condition,
        evaluationDate: new Date().toISOString(),
        evaluator: "Demo User",
        subItems: prev[categoryId]?.subItems || [],
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
  
  const updateCategoryUrgency = (categoryId: string, urgency: UrgencyLevel) => {
    setEvaluations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        urgency,
      }
    }))
  }
  
  const updateSubItem = (categoryId: string, subItemId: string, updates: Partial<SubItemEvaluation>) => {
    setEvaluations(prev => {
      const category = prev[categoryId]
      if (!category) return prev
      
      const subItems = category.subItems?.map(item => 
        item.subItemId === subItemId ? { ...item, ...updates } : item
      ) || []
      
      return {
        ...prev,
        [categoryId]: {
          ...category,
          subItems,
        }
      }
    })
  }
  
  const initializeSubItems = (categoryId: string) => {
    const categoryDef = CATEGORY_DEFINITIONS[categoryId as keyof typeof CATEGORY_DEFINITIONS]
    if (!categoryDef) return
    
    setEvaluations(prev => {
      const existing = prev[categoryId]
      if (existing?.subItems && existing.subItems.length > 0) return prev
      
      const subItems: SubItemEvaluation[] = categoryDef.subItems.map(subItem => ({
        subItemId: subItem.id,
        condition: null,
        notes: "",
      }))
      
      return {
        ...prev,
        [categoryId]: {
          ...existing,
          categoryId,
          condition: existing?.condition || null,
          subItems,
          evaluationDate: new Date().toISOString(),
          evaluator: "Demo User",
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
  
  const handleBuildingTypeSelect = (type: string, categories: Set<string>) => {
    setBuildingType(type)
    setEnabledCategories(categories)
    setShowBuildingTypeSelector(false)
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kohdetta ei löytynyt</p>
      </div>
    )
  }
  
  const renderCategoryCard = (category: typeof CATEGORY_DEFINITIONS[keyof typeof CATEGORY_DEFINITIONS]) => {
    const evaluation = evaluations[category.id]
    const isExpanded = expandedCategories.has(category.id)
    const Icon = category.icon
    
    return (
      <Card key={category.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">{category.name}</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {category.subItems.length} alaosaa
                </CardDescription>
              </div>
            </div>
            {evaluation?.condition && (
              <ConditionBadge condition={evaluation.condition} size="sm" />
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
                  onClick={() => updateCategoryCondition(category.id, option.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    evaluation?.condition === option.value
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
          
          {/* Urgency Selection */}
          {evaluation?.condition && evaluation.condition >= 3 && (
            <div className="space-y-2">
              <Label className="text-sm">Kiireellisyys</Label>
              <Select
                value={evaluation?.urgency || "none"}
                onValueChange={(value) => updateCategoryUrgency(category.id, value as UrgencyLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Valitse kiireellisyys" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Tarkenna Button - Expand to Thorough Mode */}
          <Collapsible open={isExpanded} onOpenChange={() => {
            if (!isExpanded) {
              initializeSubItems(category.id)
            }
            toggleExpanded(category.id)
          }}>
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
                  
                  return (
                    <div key={subItem.id} className="p-3 rounded-lg bg-muted/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{subItem.name}</p>
                          {subItem.description && (
                            <p className="text-xs text-muted-foreground">{subItem.description}</p>
                          )}
                        </div>
                        {subEval?.condition && (
                          <ConditionBadge condition={subEval.condition} size="sm" />
                        )}
                      </div>
                      
                      {/* Sub-item Rating */}
                      <div className="flex flex-wrap gap-1.5">
                        {CONDITION_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            onClick={() => updateSubItem(category.id, subItem.id, { condition: option.value })}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              subEval?.condition === option.value
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
                      
                      {/* Sub-item Year Input */}
                      {subItem.requiresYear && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">Asennusvuosi:</Label>
                          <Input
                            type="number"
                            placeholder="YYYY"
                            value={subEval?.year || ""}
                            onChange={(e) => updateSubItem(category.id, subItem.id, { year: parseInt(e.target.value) || undefined })}
                            className="w-24 text-sm h-8"
                          />
                        </div>
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
  
  const groupLabels: Record<string, string> = {
    piha: "Piha-alueet",
    rakenne: "Rakenteet",
    talotekniikka: "Talotekniikka",
    sisatilat: "Sisätilat",
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
            <span>{Array.from(enabledCategories).filter(id => evaluations[id]?.condition).length} / {enabledCategories.size} kategoriaa arvioitu</span>
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
                selectedType={buildingType}
                onSelect={handleBuildingTypeSelect}
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
            {Object.entries(categoriesByGroup).map(([groupKey, categories]) => (
              categories.length > 0 && (
                <div key={groupKey} className="space-y-4">
                  <h2 className="text-lg font-semibold">{groupLabels[groupKey]}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categories.map(cat => renderCategoryCard(cat))}
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>
        
        {Object.entries(categoriesByGroup).map(([groupKey, categories]) => (
          <TabsContent key={groupKey} value={groupKey} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map(cat => renderCategoryCard(cat))}
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
                  {Object.values(evaluations).filter(e => e.condition && e.condition <= 2).length} hyvässä kunnossa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {Object.values(evaluations).filter(e => e.condition && e.condition >= 4).length} korjaustarpeita
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/demo/property/${propertyId}`}>
                  Peruuta
                </Link>
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Tallenna ja jatka
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
