// Finnish dictionary (source language).
// This is the canonical shape — other dictionaries must match these keys.
// Keys are grouped by namespace. Extend as more UI strings are extracted.

const fi = {
  nav: {
    overview: "Yleiskuva",
    properties: "Kiinteistöt",
    inspections: "Tarkastukset",
    pts: "PTS-suunnitelma",
    maintenance: "Huoltohistoria",
    analytics: "Analytiikka",
    reports: "Raportit",
    settings: "Asetukset",
    sectionProperty: "Kiinteistö",
    sectionAdmin: "Hallinta",
    propertyOverview: "Yleiskatsaus",
    components: "Komponentit",
    targetPlanning: "Tavoitesuunnittelu",
    selectPropertyHint: "Valitse kiinteistö nähdäksesi lisätoiminnot",
    searchPlaceholder: "Hae kiinteistöjä, raportteja...",
    logout: "Kirjaudu ulos",
  },
  common: {
    save: "Tallenna",
    cancel: "Peruuta",
    delete: "Poista",
    edit: "Muokkaa",
    add: "Lisää",
    back: "Takaisin",
    loading: "Ladataan...",
    search: "Hae",
    language: "Kieli",
  },
} as const

export default fi

// The Finnish dictionary defines the required key structure for all languages.
export type Dictionary = typeof fi
