import {
  FileBarChart,
  Building2,
  Gauge,
  ClipboardList,
  Lightbulb,
  Images,
  Wrench,
  TrendingDown,
  CalendarRange,
  LineChart,
  type LucideIcon,
} from "lucide-react"

// Logical sections the modules are grouped under in the compose step.
export type ReportGroup = "overview" | "inspection" | "maintenance" | "financial"

export const REPORT_GROUPS: ReportGroup[] = ["overview", "inspection", "maintenance", "financial"]

// A placeholder option group shown when a module is expanded. Labels are i18n keys.
export interface ReportModuleOptionGroup {
  labelKey: string
  choiceKeys: string[]
}

// Every report module is generated from one of these config objects so new
// modules can be added without touching the compose-step layout.
export interface ReportModuleConfig {
  id: string
  titleKey: string
  descriptionKey: string
  icon: LucideIcon
  group: ReportGroup
  required: boolean
  defaultSelected: boolean
  expandable: boolean
  estimatedPages: number
  estimatedPhotos: number
  estimatedTables: number
  /** Optional status badge (i18n key), e.g. "Required". */
  badgeKey?: string
  /** Optional availability hint (i18n key), e.g. "18 findings available". */
  metaKey?: string
  /** Placeholder option groups revealed when the module is expanded. */
  optionGroups?: ReportModuleOptionGroup[]
}

export const REPORT_MODULES: ReportModuleConfig[] = [
  // --- Overview ---
  {
    id: "executive-summary",
    titleKey: "reports.modExecutiveSummaryTitle",
    descriptionKey: "reports.modExecutiveSummaryDesc",
    icon: FileBarChart,
    group: "overview",
    required: true,
    defaultSelected: true,
    expandable: true,
    estimatedPages: 1,
    estimatedPhotos: 0,
    estimatedTables: 1,
    badgeKey: "reports.badgeRequired",
  },
  {
    id: "property-information",
    titleKey: "reports.modPropertyInformationTitle",
    descriptionKey: "reports.modPropertyInformationDesc",
    icon: Building2,
    group: "overview",
    required: false,
    defaultSelected: true,
    expandable: true,
    estimatedPages: 1,
    estimatedPhotos: 0,
    estimatedTables: 2,
  },
  {
    id: "condition-overview",
    titleKey: "reports.modConditionOverviewTitle",
    descriptionKey: "reports.modConditionOverviewDesc",
    icon: Gauge,
    group: "overview",
    required: false,
    defaultSelected: true,
    expandable: true,
    estimatedPages: 2,
    estimatedPhotos: 0,
    estimatedTables: 3,
  },
  // --- Inspection ---
  {
    id: "inspection-findings",
    titleKey: "reports.modInspectionFindingsTitle",
    descriptionKey: "reports.modInspectionFindingsDesc",
    icon: ClipboardList,
    group: "inspection",
    required: false,
    defaultSelected: true,
    expandable: true,
    estimatedPages: 4,
    estimatedPhotos: 6,
    estimatedTables: 2,
    metaKey: "reports.modInspectionFindingsMeta",
  },
  {
    id: "recommendations",
    titleKey: "reports.modRecommendationsTitle",
    descriptionKey: "reports.modRecommendationsDesc",
    icon: Lightbulb,
    group: "inspection",
    required: false,
    defaultSelected: true,
    expandable: true,
    estimatedPages: 2,
    estimatedPhotos: 0,
    estimatedTables: 1,
  },
  {
    id: "photo-gallery",
    titleKey: "reports.modPhotoGalleryTitle",
    descriptionKey: "reports.modPhotoGalleryDesc",
    icon: Images,
    group: "inspection",
    required: false,
    defaultSelected: false,
    expandable: true,
    estimatedPages: 3,
    estimatedPhotos: 42,
    estimatedTables: 0,
    metaKey: "reports.modPhotoGalleryMeta",
    optionGroups: [
      {
        labelKey: "reports.optPhotoScope",
        choiceKeys: ["reports.optPhotoAll", "reports.optPhotoCritical", "reports.optPhotoLatest"],
      },
      {
        labelKey: "reports.optImageSize",
        choiceKeys: ["reports.optSizeSmall", "reports.optSizeMedium", "reports.optSizeLarge"],
      },
    ],
  },
  // --- Maintenance ---
  {
    id: "maintenance-history",
    titleKey: "reports.modMaintenanceHistoryTitle",
    descriptionKey: "reports.modMaintenanceHistoryDesc",
    icon: Wrench,
    group: "maintenance",
    required: false,
    defaultSelected: false,
    expandable: true,
    estimatedPages: 2,
    estimatedPhotos: 0,
    estimatedTables: 2,
  },
  {
    id: "repair-debt",
    titleKey: "reports.modRepairDebtTitle",
    descriptionKey: "reports.modRepairDebtDesc",
    icon: TrendingDown,
    group: "maintenance",
    required: false,
    defaultSelected: false,
    expandable: true,
    estimatedPages: 2,
    estimatedPhotos: 0,
    estimatedTables: 2,
  },
  {
    id: "pts",
    titleKey: "reports.modPtsTitle",
    descriptionKey: "reports.modPtsDesc",
    icon: CalendarRange,
    group: "maintenance",
    required: false,
    defaultSelected: false,
    expandable: true,
    estimatedPages: 3,
    estimatedPhotos: 0,
    estimatedTables: 3,
    metaKey: "reports.modPtsMeta",
    optionGroups: [
      {
        labelKey: "reports.optPlanningPeriod",
        choiceKeys: ["reports.opt5Years", "reports.opt10Years", "reports.opt15Years"],
      },
      {
        labelKey: "reports.optIncludeCosts",
        choiceKeys: ["reports.optYes", "reports.optNo"],
      },
    ],
  },
  // --- Financial ---
  {
    id: "investment-forecast",
    titleKey: "reports.modInvestmentForecastTitle",
    descriptionKey: "reports.modInvestmentForecastDesc",
    icon: LineChart,
    group: "financial",
    required: false,
    defaultSelected: false,
    expandable: true,
    estimatedPages: 2,
    estimatedPhotos: 0,
    estimatedTables: 2,
  },
]
