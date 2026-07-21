import type { Dictionary } from "./fi"

// English dictionary. Must satisfy the same key shape as the Finnish source.
// TypeScript enforces this via the `Dictionary` type, so a missing key is a
// compile error — this is what keeps translations in sync as they grow.

const en: Dictionary = {
  nav: {
    overview: "Overview",
    properties: "Properties",
    inspections: "Inspections",
    pts: "PTS plan",
    maintenance: "Maintenance",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
    sectionProperty: "Property",
    sectionAdmin: "Administration",
    propertyOverview: "Overview",
    components: "Components",
    targetPlanning: "Target planning",
    selectPropertyHint: "Select a property to see more tools",
    searchPlaceholder: "Search properties, reports...",
    logout: "Log out",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    back: "Back",
    loading: "Loading...",
    search: "Search",
    language: "Language",
  },
}

export default en
