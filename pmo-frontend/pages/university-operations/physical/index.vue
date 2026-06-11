<script setup lang="ts">
/**
 * Phase CZ-B: Physical Accomplishments View (BAR No. 1)
 *
 * This page displays the Physical Accomplishments with:
 * - Fiscal year selector (top right)
 * - 4 pillar tabs (Higher Ed, Advanced Ed, Research, Extension)
 * - Outcome and Output indicator tables per pillar
 * - Draft/Review workflow integration
 * - Edit Data button per section
 */

import type { PublicationStatus } from '~/utils/adapters'
import { getPublicationStatusColor } from '~/utils/status-colors'
// Phase DQ-A: VueApexCharts removed — analytics belong on main module page only

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const route = useRoute()
const api = useApi()
const toast = useToast()
const authStore = useAuthStore()
const { isAdmin, isStaff, canAdd, isSuperAdmin } = usePermissions()

// Phase DW-C: Centralized fiscal year store
import { useFiscalYearStore } from '~/stores/fiscalYear'
import { storeToRefs } from 'pinia'

const fiscalYearStore = useFiscalYearStore()
const { selectedFiscalYear, fiscalYearOptions } = storeToRefs(fiscalYearStore)

// Phase DW-C: Fiscal year creation permission (moved to main module)
// canCreateFiscalYear removed - button now in main university-operations page

// Phase DR-D: Organizational Outcome Definitions (BAR1 Standard - Corrected)
// OO assignments per DBM BAR1 reporting requirements
const OO_DEFINITIONS = {
  OO1: {
    code: 'OO1',
    description: 'Relevant and quality tertiary education ensured to achieve inclusive growth and access of poor but deserving students to quality tertiary education increased',
    pillars: ['HIGHER_EDUCATION'],  // Only Higher Education
  },
  OO2: {
    code: 'OO2',
    description: 'Higher education research improved to promote economic productivity and innovation',
    pillars: ['ADVANCED_EDUCATION', 'RESEARCH'],  // Both Advanced Ed and Research
  },
  OO3: {
    code: 'OO3',
    description: 'Community engagement increased',
    pillars: ['TECHNICAL_ADVISORY'],
  },
} as const

// Fixed Pillar Definitions (BAR1 Standard)
const PILLARS = [
  {
    id: 'HIGHER_EDUCATION',
    name: 'Higher Education',
    fullName: 'Higher Education Program',
    uacs: '310100000000000',
    oo: 'OO1',
    icon: 'mdi-school',
    color: 'blue'
  },
  {
    id: 'ADVANCED_EDUCATION',
    name: 'Advanced Ed',
    fullName: 'Advanced Education Program',
    uacs: '320100000000000',
    oo: 'OO2',  // Phase DR-D: Corrected from OO1 to OO2
    icon: 'mdi-book-education',
    color: 'purple'
  },
  {
    id: 'RESEARCH',
    name: 'Research',
    fullName: 'Research Program',
    uacs: '320200000000000',
    oo: 'OO2',
    icon: 'mdi-flask',
    color: 'teal'
  },
  {
    id: 'TECHNICAL_ADVISORY',
    name: 'Extension',
    fullName: 'Technical Advisory Extension Program',
    uacs: '330100000000000',
    oo: 'OO3',
    icon: 'mdi-handshake',
    color: 'orange'
  },
] as const

// Phase HN: Pillar-based tab visibility (Directive 158)
const visiblePillars = computed(() => {
  if (isAdmin.value || isSuperAdmin.value) return PILLARS
  const assignments = authStore.user?.pillarAssignments ?? []
  if (assignments.length === 0) return PILLARS // no restriction if unassigned
  return PILLARS.filter(p => assignments.includes(p.id))
})

// State
// Phase DW-C: selectedFiscalYear now comes from fiscalYearStore (storeToRefs)
// Phase DW-A: Remove ALL; default to Q1; Q4 = Final Year Projection
// Phase GA-3: Read quarter from URL query for deep-link support (Directive 222)
const selectedQuarter = ref<string>(
  (route.query.quarter as string) && ['Q1', 'Q2', 'Q3', 'Q4'].includes(route.query.quarter as string)
    ? (route.query.quarter as string)
    : 'Q1'
)
const activePillar = ref<string>(
  (route.query.pillar as string) && PILLARS.some(p => p.id === route.query.pillar)
    ? (route.query.pillar as string)
    : PILLARS[0].id
)
const loading = ref(true)
const actionLoading = ref(false)

// Phase DW-A: Quarter options — no ALL mode
const quarterOptions = [
  { title: 'Q1 (Jan–Mar)', value: 'Q1' },
  { title: 'Q2 (Apr–Jun)', value: 'Q2' },
  { title: 'Q3 (Jul–Sep)', value: 'Q3' },
  { title: 'Q4 (Oct–Dec)', value: 'Q4' },
]

// Phase DW-B: Quarter highlight helper
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const
function qCellClass(quarter: string): string {
  return quarter === selectedQuarter.value ? 'q-active-cell' : 'q-dimmed-cell'
}

// Data
const pillarTaxonomy = ref<any[]>([])
const pillarIndicators = ref<any[]>([])
const currentOperation = ref<any>(null)
// Phase EL-B: All pillar operations for the current FY — used by cross-pillar submit
const allPillarOperations = ref<any[]>([])
// Phase EM-C: University-wide quarterly report for the selected FY+quarter
const currentQuarterlyReport = ref<any>(null)
// Phase EP-B: Loading guard — Submit button hidden while quarterly report is being fetched
const isLoadingQuarterlyReport = ref(true)
// Phase EP-D: Error guard — Submit button hidden when quarterly report fetch failed (state unknown)
const quarterlyReportFetchFailed = ref(false)
// Phase EP-A: Initialization guard — prevents watch(selectedFiscalYear) from racing onMounted
let isInitializing = true

// Phase DP-B: AbortController for cancelling stale fetches
let fetchAbortController: AbortController | null = null

// Quarterly entry dialog
const entryDialog = ref(false)
const selectedIndicator = ref<any>(null)
const entryForm = ref<any>({})
const saving = ref(false)

// Phase FJ: Prior-quarter prefill state
const wasPrefilled = ref(false)
const prefillSourceQ = ref<string | null>(null)

// Phase AAAA-C: Cross-quarter fraction display fallback for the entry dialog.
// Presentation-only — does NOT mutate entryForm's save-bound numerator/denominator fields.
// Holds a fraction caption (e.g. "286/268") per quarter for target/actual when the
// current record's own fraction columns are empty but a value is present.
const dialogFractionFallback = ref<{ target: (string | null)[]; actual: (string | null)[] }>({
  target: [null, null, null, null],
  actual: [null, null, null, null],
})

async function refreshDialogFractionFallback(record: any) {
  const fallback: { target: (string | null)[]; actual: (string | null)[] } = {
    target: [null, null, null, null],
    actual: [null, null, null, null],
  }
  if (record && selectedIndicator.value?.unit_type === 'PERCENTAGE') {
    for (let i = 1; i <= 4; i++) {
      const targetFractionText = parsePctInput(entryForm.value[`target_str_q${i}`]).fractionText
      if (!targetFractionText) {
        const str = await getFractionAwareStr(record, i, 'target')
        fallback.target[i - 1] = parsePctInput(str).fractionText
      }
      const actualFractionText = parsePctInput(entryForm.value[`actual_str_q${i}`]).fractionText
      if (!actualFractionText) {
        const str = await getFractionAwareStr(record, i, 'actual')
        fallback.actual[i - 1] = parsePctInput(str).fractionText
      }
    }
  }
  dialogFractionFallback.value = fallback
}
const PRIOR_QUARTER_MAP: Record<string, string | null> = {
  Q1: null, Q2: 'Q1', Q3: 'Q2', Q4: 'Q3',
}

// Phase FM-1: Check if a record has all data fields empty (null/zero/empty string)
function isRecordEffectivelyEmpty(data: any): boolean {
  if (!data) return true
  const fields = [
    'target_q1', 'target_q2', 'target_q3', 'target_q4',
    'accomplishment_q1', 'accomplishment_q2', 'accomplishment_q3', 'accomplishment_q4',
    'score_q1', 'score_q2', 'score_q3', 'score_q4',
  ]
  return fields.every(f => data[f] == null || data[f] === '' || data[f] === 0)
}

// Phase GOV-UI: Governance dialogs for post-publication editing
const publishedEditWarningDialog = ref(false)
const pendingEditIndicator = ref<any>(null)
const unlockRequestDialog = ref(false)
const unlockRequestReason = ref('')
const unlockRequestLoading = ref(false)

// Phase DT-A: Tab-navigation state removed — dialog now shows all quarters simultaneously

// Phase DW-C: Fiscal year dialog moved to main university-operations page
// (fiscalYearDialog, newFiscalYear, creatingFiscalYear removed)

// Phase DW-C: Fiscal year options now come from fiscalYearStore (storeToRefs)
// Local fetchFiscalYears removed - using fiscalYearStore.fetchFiscalYears()

// Phase DW-C: Fiscal year creation moved to main university-operations page
// (createFiscalYear and openFiscalYearDialog removed)

// Current pillar info
const currentPillar = computed(() => {
  return PILLARS.find(p => p.id === activePillar.value) || PILLARS[0]
})

// Phase DC-E: Current Organizational Outcome
const currentOO = computed(() => {
  const ooKey = currentPillar.value.oo as keyof typeof OO_DEFINITIONS
  return OO_DEFINITIONS[ooKey]
})

// Phase EN-B: Quarter status derived from quarterly_reports.publication_status (not per-pillar status_qN)
// Phase EP-D: Distinguish fetch failure from genuine "no record" state
const currentQuarterStatus = computed(() => {
  if (quarterlyReportFetchFailed.value) return 'FETCH_ERROR'
  return currentQuarterlyReport.value?.publication_status ?? 'NOT_STARTED'
})

// Phase DS-A: Unit type display with abbreviated labels for consistent chip width
const unitTypeConfig: Record<string, { suffix: string; color: string; icon: string; label: string; title: string }> = {
  PERCENTAGE: { suffix: '%', color: 'blue', icon: 'mdi-percent', label: 'PCT', title: 'Percentage' },
  COUNT: { suffix: '', color: 'green', icon: 'mdi-counter', label: 'CNT', title: 'Count' },
  WEIGHTED_COUNT: { suffix: '', color: 'orange', icon: 'mdi-scale-balance', label: 'WGT', title: 'Weighted Count' },
}

function getUnitConfig(unitType: string) {
  return unitTypeConfig[unitType] || { suffix: '', color: 'grey', icon: 'mdi-help', label: '?', title: 'Unknown' }
}

// Phase UUU-A: Smart dual-entry parser for PERCENTAGE indicators
// Accepts "90" (direct %) or "286/268" (fraction → computed %)
interface PctParseResult {
  computed: number | null
  numerator: number | null
  denominator: number | null
  display: string
  fractionText: string | null
  isValid: boolean
  error: string | null
}

function parsePctInput(raw: string | null | undefined): PctParseResult {
  if (!raw || raw.trim() === '') {
    return { computed: null, numerator: null, denominator: null, display: '', fractionText: null, isValid: true, error: null }
  }
  const trimmed = raw.trim()
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/')
    const n = parseFloat(parts[0].trim())
    const d = parseFloat(parts[1]?.trim() ?? '')
    if (isNaN(n) || isNaN(d)) {
      return { computed: null, numerator: null, denominator: null, display: '', fractionText: trimmed, isValid: false, error: 'Invalid fraction format' }
    }
    if (d === 0) {
      return { computed: null, numerator: n, denominator: 0, display: '', fractionText: trimmed, isValid: false, error: 'Denominator cannot be zero' }
    }
    const pct = Math.min((n / d) * 100, 9999.99)
    return { computed: parseFloat(pct.toFixed(4)), numerator: n, denominator: d, display: `${pct.toFixed(2)}%`, fractionText: `${n}/${d}`, isValid: true, error: null }
  } else {
    const v = parseFloat(trimmed)
    if (isNaN(v)) {
      return { computed: null, numerator: null, denominator: null, display: '', fractionText: null, isValid: false, error: 'Invalid value' }
    }
    return { computed: parseFloat(v.toFixed(4)), numerator: null, denominator: null, display: `${v.toFixed(2)}%`, fractionText: null, isValid: true, error: null }
  }
}

// Phase UUU-B: Reconstruct the string input value from stored DB fields
// If N/D are stored → reconstruct fraction string "N/D"
// If only accomplishment stored (legacy or direct %) → return the raw number as string
function buildPctStrFromRecord(num: any, den: any, accomplishment: any): string {
  const n = num != null ? Number(num) : null
  const d = den != null ? Number(den) : null
  if (n != null && d != null && !isNaN(n) && !isNaN(d) && d > 0) {
    return `${n}/${d}`
  }
  if (accomplishment != null && accomplishment !== '') {
    const v = Number(accomplishment)
    return isNaN(v) ? '' : String(v)
  }
  return ''
}

// XXX-G: Reconstruct override fraction string input from stored fraction text or numeric override
function buildOverridePctStr(fractionStr: any, totalValue: any): string {
  if (typeof fractionStr === 'string' && fractionStr.includes('/')) {
    return fractionStr
  }
  if (totalValue != null && totalValue !== '') {
    const v = Number(totalValue)
    return isNaN(v) ? '' : String(v)
  }
  return ''
}

// Phase AAAA-A: Cache of per-quarter indicator lists for the active pillar/fiscal year.
// One fetch per quarter — cleared whenever pillar or fiscal year changes.
const quarterIndicatorCache = ref<Map<string, any[]>>(new Map())

async function getQuarterIndicatorList(quarter: string): Promise<any[]> {
  if (quarterIndicatorCache.value.has(quarter)) {
    return quarterIndicatorCache.value.get(quarter)!
  }
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) return []
  try {
    const res = await api.get<any[]>(
      `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&quarter=${quarter}`
    )
    const list = Array.isArray(res) ? res : (res as any)?.data || []
    quarterIndicatorCache.value.set(quarter, list)
    return list
  } catch (err) {
    console.error('[Physical] getQuarterIndicatorList failed:', err)
    return []
  }
}

// Phase AAAA-B: Cross-quarter fraction-aware fallback. If the given record's own
// numerator/denominator for quarter `quarterIndex` are missing but its target/actual
// value is present, fall back to the indicator's own reported_quarter=QN record's
// fraction columns to reconstruct an "N/D" string.
async function getFractionAwareStr(record: any, quarterIndex: number, kind: 'target' | 'actual'): Promise<string> {
  const qKey = `q${quarterIndex}`
  const numField = kind === 'target' ? `target_numerator_${qKey}` : `numerator_${qKey}`
  const denField = kind === 'target' ? `target_denominator_${qKey}` : `denominator_${qKey}`
  const valField = kind === 'target' ? `target_${qKey}` : `accomplishment_${qKey}`

  if (record?.[numField] != null && record?.[denField] != null) {
    return buildPctStrFromRecord(record[numField], record[denField], record[valField])
  }
  if (record?.[valField] === null || record?.[valField] === undefined) {
    return ''
  }

  const list = await getQuarterIndicatorList(`Q${quarterIndex}`)
  const match = list.find((r: any) => r.pillar_indicator_id === record?.pillar_indicator_id)
  if (match?.[numField] != null && match?.[denField] != null) {
    return buildPctStrFromRecord(match[numField], match[denField], record[valField])
  }
  return buildPctStrFromRecord(record?.[numField], record?.[denField], record?.[valField])
}

// Outcome indicators
const outcomeIndicators = computed(() => {
  return pillarTaxonomy.value.filter(t => t.indicator_type === 'OUTCOME')
})

// Output indicators
const outputIndicators = computed(() => {
  return pillarTaxonomy.value.filter(t => t.indicator_type === 'OUTPUT')
})

// Phase DR-E: Lightweight rate summary computed from existing pillarIndicators
// Uses same rate model as backend: SUM(actual/target) per indicator
const pillarRateSummary = computed(() => {
  const indicators = pillarIndicators.value.filter(i => i.pillar_indicator_id !== null)
  const withData = pillarTaxonomy.value.filter(t => getIndicatorData(t.id) !== null).length
  const total = pillarTaxonomy.value.length

  let targetRate = 0
  let actualRate = 0

  for (const indicator of indicators) {
    const target = (parseFloat(indicator.target_q1) || 0) + (parseFloat(indicator.target_q2) || 0)
      + (parseFloat(indicator.target_q3) || 0) + (parseFloat(indicator.target_q4) || 0)
    const actual = (parseFloat(indicator.accomplishment_q1) || 0) + (parseFloat(indicator.accomplishment_q2) || 0)
      + (parseFloat(indicator.accomplishment_q3) || 0) + (parseFloat(indicator.accomplishment_q4) || 0)

    if (target > 0) {
      targetRate += 1.0
      actualRate += actual / target
    }
  }

  const ratePct = targetRate > 0 ? (actualRate / targetRate) * 100 : null

  return { withData, total, targetRate, actualRate, ratePct }
})

// Get indicator data by taxonomy ID
function getIndicatorData(taxonomyId: string) {
  return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
}

// Phase FM-1: Check if prior-quarter prefill is available for an indicator
// Prefill available when current quarter has no record OR has an empty record
function hasPrefillAvailable(taxonomyId: string): boolean {
  const priorQ = PRIOR_QUARTER_MAP[selectedQuarter.value]
  if (!priorQ) return false
  const data = getIndicatorData(taxonomyId)
  return data === null || isRecordEffectivelyEmpty(data)
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase DQ-A: Decoupled Data Fetching Architecture
// Taxonomy (static, pillar-based) is fetched SEPARATELY from indicator data
// (fiscal-year-specific) to ensure indicators always render per BAR1 standard
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phase DQ-A: Fetch taxonomy (static, pillar-based)
 * Taxonomy is INDEPENDENT of fiscal year and must always display
 */
async function fetchTaxonomy() {
  try {
    const taxonomyRes = await api.get<any[]>(
      `/api/university-operations/taxonomy/${activePillar.value}`
    )
    pillarTaxonomy.value = Array.isArray(taxonomyRes) ? taxonomyRes : (taxonomyRes as any)?.data || []
    console.log('[Physical] Taxonomy fetched:', {
      pillar: activePillar.value,
      count: pillarTaxonomy.value.length,
      outcome: pillarTaxonomy.value.filter(t => t.indicator_type === 'OUTCOME').length,
      output: pillarTaxonomy.value.filter(t => t.indicator_type === 'OUTPUT').length,
    })
  } catch (err: any) {
    console.error('[Physical] Taxonomy fetch failed:', err)
    // Only clear taxonomy on its own error - don't affect other state
    pillarTaxonomy.value = []
  }
}

/**
 * Phase DQ-A: Fetch indicator data (fiscal-year-specific)
 * Indicator data failure does NOT affect taxonomy display
 * Phase DW-C: Guard against invalid fiscal year
 */
async function fetchIndicatorData() {
  // Phase DW-C: Guard - ensure fiscal year is valid before API call
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) {
    console.warn('[Physical] fetchIndicatorData: Invalid fiscal year, skipping fetch')
    pillarIndicators.value = []
    return
  }

  try {
    // Phase FL-3: Pass quarter to fetch — per-quarter record isolation
    const indicatorsRes = await api.get<any[]>(
      `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&quarter=${selectedQuarter.value}`
    )
    pillarIndicators.value = Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []
    console.log('[Physical] Indicator data fetched:', {
      pillar: activePillar.value,
      fiscalYear: selectedFiscalYear.value,
      quarter: selectedQuarter.value,
      count: pillarIndicators.value.length,
    })
  } catch (err: any) {
    console.error('[Physical] Indicator data fetch failed:', err)
    // Clear indicator data but PRESERVE taxonomy
    pillarIndicators.value = []
  }
}

/**
 * Phase DQ-B: Fetch all pillar data with decoupled error handling
 * Taxonomy and indicator data are fetched independently
 */
async function fetchPillarData() {
  // Phase DP-B: Cancel any pending fetch before starting new one
  if (fetchAbortController) {
    fetchAbortController.abort()
  }
  fetchAbortController = new AbortController()
  const currentController = fetchAbortController

  loading.value = true

  // Phase DQ-A: Fetch taxonomy first (pillar-based, fiscal-year-independent)
  await fetchTaxonomy()

  // Phase DP-B: Check if this fetch was aborted (newer fetch started)
  if (currentController.signal.aborted) return

  // Phase DQ-A: Fetch indicator data (fiscal-year-specific)
  // This can fail without affecting taxonomy display
  await fetchIndicatorData()

  if (currentController.signal.aborted) return

  // Find existing operation for this pillar/year
  await findCurrentOperation()

  if (currentController.signal.aborted) return

  loading.value = false
}

// Phase HU: Use pillar-operation endpoint — no ownership filter, correct for display context (Directive 211)
async function findCurrentOperation() {
  try {
    console.log('[Physical] findCurrentOperation: Searching for', {
      operation_type: activePillar.value,
      fiscal_year: selectedFiscalYear.value,
    });

    const found = await api.get<any>(
      `/api/university-operations/pillar-operation?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
    ).catch(() => null)

    currentOperation.value = found

    console.log('[Physical] findCurrentOperation: Result:', currentOperation.value ? {
      id: currentOperation.value.id,
      operation_type: currentOperation.value.operation_type,
      fiscal_year: currentOperation.value.fiscal_year,
      title: currentOperation.value.title,
    } : 'NULL (no operation found for this pillar + year)');
  } catch (err) {
    console.error('[Physical] findCurrentOperation: Error:', err);
    currentOperation.value = null
  }
}

// Phase EL-B + EI-E: Load all 4 pillar operations for the current FY (for cross-pillar submit)
// Phase EI-E: Filter to known pillar types only — prevents non-pillar operations from being included
async function fetchAllPillarOperations() {
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) return
  try {
    const response = await api.get<any>(
      `/api/university-operations?fiscal_year=${selectedFiscalYear.value}&limit=10`
    )
    const allOps = Array.isArray(response) ? response : (response?.data || [])
    // Phase EI-E: Only include operations matching known pillar types
    allPillarOperations.value = allOps.filter(
      (op: any) => PILLARS.some(p => p.id === op.operation_type)
    )
  } catch (err) {
    console.error('[Physical] fetchAllPillarOperations: Error:', err)
    allPillarOperations.value = []
  }
}

// Phase EM-C: Fetch or create quarterly report for current FY+quarter
async function fetchQuarterlyReport() {
  // Phase EP-B: Track loading state so canSubmitAllPillars() blocks during fetch
  isLoadingQuarterlyReport.value = true
  quarterlyReportFetchFailed.value = false
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) {
    currentQuarterlyReport.value = null
    isLoadingQuarterlyReport.value = false
    return
  }
  try {
    const response = await api.get<any>(
      `/api/university-operations/quarterly-reports?fiscal_year=${selectedFiscalYear.value}&quarter=${selectedQuarter.value}`
    )
    const reports = Array.isArray(response) ? response : (response?.data || [])
    currentQuarterlyReport.value = reports.length > 0 ? reports[0] : null
    console.log('[Physical] fetchQuarterlyReport:', {
      fiscalYear: selectedFiscalYear.value,
      quarter: selectedQuarter.value,
      found: !!currentQuarterlyReport.value,
      status: currentQuarterlyReport.value?.publication_status,
    })
  } catch (err) {
    console.error('[Physical] fetchQuarterlyReport: Error:', err)
    currentQuarterlyReport.value = null
    // Phase EP-D: Mark fetch as failed so Submit is blocked and status shows warning
    quarterlyReportFetchFailed.value = true
  } finally {
    isLoadingQuarterlyReport.value = false
  }
}

function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(2)
}

// Phase VVV-B: Returns the primary cell display + optional fraction line for a
// read-only indicator table cell. For PERCENTAGE indicators, renders "106.72%"
// with a "286/268" fraction line below when numerator/denominator are stored.
function getPctCellDisplay(
  record: any,
  fieldPrefix: string,
  q: string,
  unitType: string,
): { primary: string; fraction: string | null } {
  const qKey = q.toLowerCase()
  const val = record?.[`${fieldPrefix}_${qKey}`]
  if (val === null || val === undefined) return { primary: '—', fraction: null }
  const num = Number(val)
  if (isNaN(num)) return { primary: '—', fraction: null }
  if (unitType !== 'PERCENTAGE') {
    const suffix = getUnitConfig(unitType).suffix
    return { primary: num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix, fraction: null }
  }
  const primary = `${num.toFixed(2)}%`
  // XXX-D: branch on fieldPrefix so 'target' reads target_numerator/denominator_qN
  // (new XXX-A columns) and 'accomplishment' reads the existing numerator/denominator_qN
  // (VVV fix, unchanged) — prevents the actual fraction from bleeding into the target cell
  const numerator = fieldPrefix === 'target' ? record?.[`target_numerator_${qKey}`] : record?.[`numerator_${qKey}`]
  const denominator = fieldPrefix === 'target' ? record?.[`target_denominator_${qKey}`] : record?.[`denominator_${qKey}`]
  const n = numerator != null ? Number(numerator) : null
  const d = denominator != null ? Number(denominator) : null
  let fraction = (n !== null && d !== null && !isNaN(n) && !isNaN(d) && d > 0)
    ? `${n}/${d}`
    : null

  // Phase AAAA-D: fall back to the indicator's own reported_quarter=QN record's
  // fraction columns when this snapshot's numerator/denominator are missing
  if (fraction === null && record?.pillar_indicator_id) {
    fraction = fractionOverlay.value[`${record.pillar_indicator_id}|${qKey}|${fieldPrefix}`] ?? null
  }

  return { primary, fraction }
}

// Phase AAAA-D: Cross-quarter fraction overlay for the read-only indicator tables.
// Maps "<pillarIndicatorId>|<qKey>|<fieldPrefix>" -> "N/D" for cells whose own
// numerator/denominator are missing for that quarter but a value is present,
// falling back to the indicator's own reported_quarter=QN record.
const fractionOverlay = ref<Record<string, string>>({})

async function buildFractionOverlay() {
  const overlay: Record<string, string> = {}
  for (const record of pillarIndicators.value) {
    const taxonomyId = record?.pillar_indicator_id
    if (!taxonomyId) continue
    const indicator = pillarTaxonomy.value.find(t => t.id === taxonomyId)
    if (indicator?.unit_type !== 'PERCENTAGE') continue

    for (let i = 1; i <= 4; i++) {
      const qKey = `q${i}`
      for (const fieldPrefix of ['target', 'accomplishment'] as const) {
        const numField = fieldPrefix === 'target' ? `target_numerator_${qKey}` : `numerator_${qKey}`
        const denField = fieldPrefix === 'target' ? `target_denominator_${qKey}` : `denominator_${qKey}`
        const valField = `${fieldPrefix}_${qKey}`

        if (record[numField] != null && record[denField] != null) continue
        if (record[valField] === null || record[valField] === undefined) continue

        const list = await getQuarterIndicatorList(`Q${i}`)
        const match = list.find((r: any) => r.pillar_indicator_id === taxonomyId)
        if (match?.[numField] != null && match?.[denField] != null && Number(match[denField]) > 0) {
          overlay[`${taxonomyId}|${qKey}|${fieldPrefix}`] = `${Number(match[numField])}/${Number(match[denField])}`
        }
      }
    }
  }
  fractionOverlay.value = overlay
}

// Phase AAAA-D: Rebuild the overlay whenever the current quarter's indicator data changes
watch(pillarIndicators, () => {
  buildFractionOverlay()
})

// Format percentage (used in indicator table rows and entry dialog)
function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—'
  return `${Number(val).toFixed(1)}%`
}

// Get color based on accomplishment rate (used in indicator table rows)
function getRateColor(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return 'grey'
  if (rate >= 100) return 'success'
  if (rate >= 80) return 'warning'
  return 'error'
}

// Get variance color (used in indicator table rows)
function getVarianceColor(variance: number | null | undefined): string {
  if (variance === null || variance === undefined) return 'grey'
  return variance >= 0 ? 'success' : 'error'
}


// Phase HG: Unified column visibility config (Directives 107–110)
const columnVisibility = reactive({
  score: false,
  remarks: false,
  notes: false, // XXX-F: per-quarter Notes (remarks_q1-4)
  catch_up_plans: false,
  facilitating_factors: false,
  ways_forward: false,
  mov: false,
})

// Phase HK: Stacked panel visibility guard (Directive 138)
const anyNarrativeVisible = computed(() =>
  columnVisibility.score || columnVisibility.remarks || columnVisibility.notes || columnVisibility.catch_up_plans || columnVisibility.facilitating_factors || columnVisibility.ways_forward || columnVisibility.mov
)

// Phase HK: Colspan = 13 base + edit col (Directive 136)
const narrativeRowColspan = computed(() => {
  let n = 13 // Indicator(1) + Q cols(8) + Totals(2) + Variance(1) + Rate(1)
  if (canEditData()) n++
  return n
})

// Phase HL: MOV type-selector state (Directive 146)
const movType = ref<'text' | 'link' | 'file'>('text')
const movValue = ref('')
const movUploading = ref(false)
const movFileMetadata = ref<{ filename: string; size: number; mimeType: string } | null>(null)
const movFileInputRef = ref<HTMLInputElement | null>(null)

function parseMov(raw: string | null | undefined): { type: 'text' | 'link' | 'file'; value: string; metadata: any } {
  if (!raw) return { type: 'text', value: '', metadata: null }
  try {
    const parsed = JSON.parse(raw)
    if (parsed.type && parsed.value !== undefined) return { type: parsed.type, value: parsed.value, metadata: parsed.metadata || null }
  } catch {}
  return { type: 'text', value: raw, metadata: null }
}

function serializeMov(): string | null {
  if (!movValue.value && movType.value !== 'file') return null
  const obj: any = { type: movType.value, value: movValue.value }
  if (movType.value === 'file' && movFileMetadata.value) obj.metadata = movFileMetadata.value
  return JSON.stringify(obj)
}

watch(movType, () => { movValue.value = ''; movFileMetadata.value = null })

async function handleMovFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.[0]) return
  const file = input.files[0]
  const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25MB
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.error(`File too large. Maximum allowed size is 25MB (selected file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
    if (input) input.value = ''
    return
  }
  const formData = new FormData()
  formData.append('file', file)
  movUploading.value = true
  try {
    const response = await api.upload<{ filePath: string; originalName: string; fileSize: number; mimeType: string }>('/api/uploads', formData)
    movValue.value = response.filePath
    movFileMetadata.value = { filename: response.originalName, size: response.fileSize, mimeType: response.mimeType }
  } catch (err: any) {
    toast.error(err.message || 'File upload failed')
  } finally {
    movUploading.value = false
    if (input) input.value = ''
  }
}

// Publication status helpers

function getPublicationStatusLabel(status: PublicationStatus | string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending Review',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
    FETCH_ERROR: 'Status Unavailable',
  }
  return labels[status] || status
}

// --- Permission Checks (COI/Repairs pattern) ---

function isOwnerOrAssigned(op: any): boolean {
  if (!op) return false
  const userId = authStore.user?.id
  if (!userId) return false
  const isAssigned = Array.isArray(op.assigned_users) && op.assigned_users.some((u: any) => u.id === userId)
  return op.created_by === userId || isAssigned
}

function canEditData(): boolean {
  if (!currentOperation.value) return canAdd('operations')
  // Phase GOV-C: Admin on PUBLISHED quarterly must have explicit unlock approval
  if (isAdmin.value) {
    if (currentQuarterlyReport.value?.publication_status === 'PUBLISHED') {
      return isSuperAdmin.value || !!currentQuarterlyReport.value?.unlocked_by
    }
    return true
  }
  if (currentOperation.value.publication_status === 'PUBLISHED') return false
  // Phase ER-A: Published quarterly report locks indicator/financial edits for non-admin users
  if (currentQuarterlyReport.value?.publication_status === 'PUBLISHED') return false
  return isOwnerOrAssigned(currentOperation.value)
}

// Phase EM-C: Cross-pillar submit guard — checks quarterly report status
function canSubmitAllPillars(): boolean {
  // Phase EP-B: Block Submit button while quarterly report status is loading
  if (isLoadingQuarterlyReport.value) return false
  // Phase EP-D: Block Submit when quarterly report state is unknown (fetch failed)
  if (quarterlyReportFetchFailed.value) return false
  // If we have a quarterly report, check its status
  if (currentQuarterlyReport.value) {
    const status = currentQuarterlyReport.value.publication_status
    if (status !== 'DRAFT' && status !== 'REJECTED') return false
    if (isAdmin.value) return true
    return currentQuarterlyReport.value.created_by === authStore.user?.id
  }
  // No quarterly report yet — allow creating one if there are pillar operations
  if (allPillarOperations.value.length === 0) return false
  if (isAdmin.value) return true
  return allPillarOperations.value.some(op => isOwnerOrAssigned(op))
}

// Phase EM-C: Withdraw guard — checks quarterly report status
function canWithdrawAllPillars(): boolean {
  if (!currentQuarterlyReport.value) return false
  if (currentQuarterlyReport.value.publication_status !== 'PENDING_REVIEW') return false
  if (isAdmin.value) return true
  return currentQuarterlyReport.value.submitted_by === authStore.user?.id
}



function goBack() {
  router.push({
    path: '/university-operations',
    query: { year: selectedFiscalYear.value.toString() }
  })
}

// Phase DV-B: Removed createNewEntry() - no longer needed
// Old workflow: Navigate to /university-operations/new
// New workflow: Click indicator rows → quarterly entry dialog

// Open quarterly entry dialog
function openEntryDialog(indicator: any) {
  if (!canEditData()) {
    toast.warning('You do not have permission to edit this data')
    return
  }

  // Phase GOV-C: Show governance warning when SuperAdmin or unlocked Admin edits a PUBLISHED quarter
  if (currentQuarterlyReport.value?.publication_status === 'PUBLISHED') {
    if (isSuperAdmin.value || (isAdmin.value && currentQuarterlyReport.value?.unlocked_by)) {
      pendingEditIndicator.value = indicator
      publishedEditWarningDialog.value = true
      return
    }
  }

  openEntryDialogDirect(indicator)
}

// Phase GOV-UI: Proceed with edit after governance warning acknowledged
function confirmPublishedEdit() {
  publishedEditWarningDialog.value = false
  if (pendingEditIndicator.value) {
    openEntryDialogDirect(pendingEditIndicator.value)
    pendingEditIndicator.value = null
  }
}

// Phase GOV-UI: Internal helper — opens entry dialog without governance checks
// Phase FL-4: Made async for per-quarter prefill (API fetch of prior quarter's record)
async function openEntryDialogDirect(indicator: any) {
  selectedIndicator.value = indicator
  const existingData = getIndicatorData(indicator.id)

  // Debug logging
  console.log('[Physical] Opening entry dialog:', {
    taxonomyId: indicator.id,
    taxonomyName: indicator.indicator_name,
    existingData: existingData,
    existingDataId: existingData?.id,
    quarter: selectedQuarter.value,
    pillarIndicatorsCount: pillarIndicators.value.length,
  })

  // Phase FM-1: Per-quarter record model — prefill from prior quarter's record
  // Empty records (all data fields null) still allow prior-quarter reference
  wasPrefilled.value = false
  prefillSourceQ.value = null

  const needsPrefill = !existingData || isRecordEffectivelyEmpty(existingData)

  if (existingData && !needsPrefill) {
    // Current quarter has a populated record — load it directly
    entryForm.value = {
      pillar_indicator_id: indicator.id,
      fiscal_year: selectedFiscalYear.value,
      target_q1: existingData.target_q1 ?? null,
      target_q2: existingData.target_q2 ?? null,
      target_q3: existingData.target_q3 ?? null,
      target_q4: existingData.target_q4 ?? null,
      accomplishment_q1: existingData.accomplishment_q1 ?? null,
      accomplishment_q2: existingData.accomplishment_q2 ?? null,
      accomplishment_q3: existingData.accomplishment_q3 ?? null,
      accomplishment_q4: existingData.accomplishment_q4 ?? null,
      remarks: existingData.remarks || '',
      // Phase HE: APR/UPR narrative fields (Directive 386)
      catch_up_plan: existingData.catch_up_plan || '',
      facilitating_factors: existingData.facilitating_factors || '',
      ways_forward: existingData.ways_forward || '',
      // Phase HK: MOV field (Directive 140)
      mov: existingData.mov || '',
      // Phase GY/GZ: Annual-only overrides (Directive 359)
      override_rate: existingData.override_rate ?? null,
      override_variance: existingData.override_variance ?? null,
      // Phase HA: Total overrides (Directive 371)
      override_total_target: existingData.override_total_target ?? null,
      override_total_actual: existingData.override_total_actual ?? null,
      // XXX-G: Override fraction string inputs for PERCENTAGE indicators
      override_total_target_str: buildOverridePctStr(existingData.override_total_target_fraction, existingData.override_total_target),
      override_total_actual_str: buildOverridePctStr(existingData.override_total_actual_fraction, existingData.override_total_actual),
      // Phase TTT/UUU: N/D stored for PERCENTAGE fraction auditability
      numerator_q1: existingData.numerator_q1 ?? null,
      denominator_q1: existingData.denominator_q1 ?? null,
      numerator_q2: existingData.numerator_q2 ?? null,
      denominator_q2: existingData.denominator_q2 ?? null,
      numerator_q3: existingData.numerator_q3 ?? null,
      denominator_q3: existingData.denominator_q3 ?? null,
      numerator_q4: existingData.numerator_q4 ?? null,
      denominator_q4: existingData.denominator_q4 ?? null,
      // XXX-E: Target N/D stored for PERCENTAGE fraction auditability (mirrors numerator_qN above)
      target_numerator_q1: existingData.target_numerator_q1 ?? null,
      target_denominator_q1: existingData.target_denominator_q1 ?? null,
      target_numerator_q2: existingData.target_numerator_q2 ?? null,
      target_denominator_q2: existingData.target_denominator_q2 ?? null,
      target_numerator_q3: existingData.target_numerator_q3 ?? null,
      target_denominator_q3: existingData.target_denominator_q3 ?? null,
      target_numerator_q4: existingData.target_numerator_q4 ?? null,
      target_denominator_q4: existingData.target_denominator_q4 ?? null,
      // Phase UUU: Smart string inputs for PERCENTAGE dual-entry (Target + Actual)
      // XXX-E: target_str_qN reconstructs from target_numerator/denominator_qN when present (mirrors actual_str_qN)
      target_str_q1: buildPctStrFromRecord(existingData.target_numerator_q1, existingData.target_denominator_q1, existingData.target_q1),
      target_str_q2: buildPctStrFromRecord(existingData.target_numerator_q2, existingData.target_denominator_q2, existingData.target_q2),
      target_str_q3: buildPctStrFromRecord(existingData.target_numerator_q3, existingData.target_denominator_q3, existingData.target_q3),
      target_str_q4: buildPctStrFromRecord(existingData.target_numerator_q4, existingData.target_denominator_q4, existingData.target_q4),
      actual_str_q1: buildPctStrFromRecord(existingData.numerator_q1, existingData.denominator_q1, existingData.accomplishment_q1),
      actual_str_q2: buildPctStrFromRecord(existingData.numerator_q2, existingData.denominator_q2, existingData.accomplishment_q2),
      actual_str_q3: buildPctStrFromRecord(existingData.numerator_q3, existingData.denominator_q3, existingData.accomplishment_q3),
      actual_str_q4: buildPctStrFromRecord(existingData.numerator_q4, existingData.denominator_q4, existingData.accomplishment_q4),
      // XXX-F: Per-quarter notes (optional, no calculation impact)
      remarks_str_q1: existingData.remarks_q1 || '',
      remarks_str_q2: existingData.remarks_q2 || '',
      remarks_str_q3: existingData.remarks_q3 || '',
      remarks_str_q4: existingData.remarks_q4 || '',
      _existingId: existingData.id || null,
    }
  } else {
    // No record OR empty record — check for prior quarter prefill
    // Preserve _existingId if empty record exists (PATCH to update, not POST duplicate)
    const preservedId = existingData?.id || null
    const priorQ = PRIOR_QUARTER_MAP[selectedQuarter.value]
    let priorData: any = null

    if (priorQ) {
      try {
        const priorIndicators = await api.get<any[]>(
          `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&quarter=${priorQ}`
        )
        const priorList = Array.isArray(priorIndicators) ? priorIndicators : (priorIndicators as any)?.data || []
        priorData = priorList.find((i: any) => i.pillar_indicator_id === indicator.id) || null
        console.log('[Physical] Prior quarter prefill lookup:', {
          priorQ,
          found: !!priorData,
          priorDataId: priorData?.id,
          emptyRecordId: preservedId,
        })
      } catch (err) {
        console.warn('[Physical] Prior quarter fetch failed, starting empty:', err)
      }
    }

    if (priorData) {
      // Deep-copy target/actual columns from prior quarter's record as starting point
      entryForm.value = {
        pillar_indicator_id: indicator.id,
        fiscal_year: selectedFiscalYear.value,
        target_q1: priorData.target_q1 ?? null,
        target_q2: priorData.target_q2 ?? null,
        target_q3: priorData.target_q3 ?? null,
        target_q4: priorData.target_q4 ?? null,
        accomplishment_q1: priorData.accomplishment_q1 ?? null,
        accomplishment_q2: priorData.accomplishment_q2 ?? null,
        accomplishment_q3: priorData.accomplishment_q3 ?? null,
        accomplishment_q4: priorData.accomplishment_q4 ?? null,
        remarks: priorData.remarks || '',
        // Phase HE: Do not inherit prior quarter's narrative fields (Directive 386)
        catch_up_plan: '',
        facilitating_factors: '',
        ways_forward: '',
        // Phase HK: MOV not inherited from prior quarter (Directive 142)
        mov: '',
        override_rate: null,
        override_variance: null,
        // Phase HA: Do not inherit prior quarter's total overrides (Directive 371)
        override_total_target: null,
        override_total_actual: null,
        // XXX-G: Override fraction string inputs not inherited (mirrors override_total_target/actual)
        override_total_target_str: '',
        override_total_actual_str: '',
        // Phase UUU: Inherit N/D from prior quarter (prefill starting point, user edits freely)
        numerator_q1: priorData.numerator_q1 ?? null,
        denominator_q1: priorData.denominator_q1 ?? null,
        numerator_q2: priorData.numerator_q2 ?? null,
        denominator_q2: priorData.denominator_q2 ?? null,
        numerator_q3: priorData.numerator_q3 ?? null,
        denominator_q3: priorData.denominator_q3 ?? null,
        numerator_q4: priorData.numerator_q4 ?? null,
        denominator_q4: priorData.denominator_q4 ?? null,
        // XXX-E: Inherit Target N/D from prior quarter (prefill starting point, user edits freely)
        target_numerator_q1: priorData.target_numerator_q1 ?? null,
        target_denominator_q1: priorData.target_denominator_q1 ?? null,
        target_numerator_q2: priorData.target_numerator_q2 ?? null,
        target_denominator_q2: priorData.target_denominator_q2 ?? null,
        target_numerator_q3: priorData.target_numerator_q3 ?? null,
        target_denominator_q3: priorData.target_denominator_q3 ?? null,
        target_numerator_q4: priorData.target_numerator_q4 ?? null,
        target_denominator_q4: priorData.target_denominator_q4 ?? null,
        // Phase UUU: Smart string inputs — reconstruct from prior data
        // XXX-E: target_str_qN reconstructs from target_numerator/denominator_qN when present
        target_str_q1: buildPctStrFromRecord(priorData.target_numerator_q1, priorData.target_denominator_q1, priorData.target_q1),
        target_str_q2: buildPctStrFromRecord(priorData.target_numerator_q2, priorData.target_denominator_q2, priorData.target_q2),
        target_str_q3: buildPctStrFromRecord(priorData.target_numerator_q3, priorData.target_denominator_q3, priorData.target_q3),
        target_str_q4: buildPctStrFromRecord(priorData.target_numerator_q4, priorData.target_denominator_q4, priorData.target_q4),
        actual_str_q1: buildPctStrFromRecord(priorData.numerator_q1, priorData.denominator_q1, priorData.accomplishment_q1),
        actual_str_q2: buildPctStrFromRecord(priorData.numerator_q2, priorData.denominator_q2, priorData.accomplishment_q2),
        actual_str_q3: buildPctStrFromRecord(priorData.numerator_q3, priorData.denominator_q3, priorData.accomplishment_q3),
        actual_str_q4: buildPctStrFromRecord(priorData.numerator_q4, priorData.denominator_q4, priorData.accomplishment_q4),
        // XXX-F: Inherit per-quarter notes from prior quarter (prefill starting point, user edits freely)
        remarks_str_q1: priorData.remarks_q1 || '',
        remarks_str_q2: priorData.remarks_q2 || '',
        remarks_str_q3: priorData.remarks_q3 || '',
        remarks_str_q4: priorData.remarks_q4 || '',
        _existingId: preservedId,
      }
      wasPrefilled.value = true
      prefillSourceQ.value = priorQ
    } else {
      // No prior data — start with empty form
      entryForm.value = {
        pillar_indicator_id: indicator.id,
        fiscal_year: selectedFiscalYear.value,
        target_q1: null, target_q2: null, target_q3: null, target_q4: null,
        accomplishment_q1: null, accomplishment_q2: null, accomplishment_q3: null, accomplishment_q4: null,
        remarks: '',
        // Phase HE: APR/UPR narrative fields (Directive 386)
        catch_up_plan: '',
        facilitating_factors: '',
        ways_forward: '',
        // Phase HK: MOV default empty (Directive 140)
        mov: '',
        override_rate: null,
        override_variance: null,
        // Phase HA: Total overrides default to null (Directive 371)
        override_total_target: null,
        override_total_actual: null,
        // XXX-G: Override fraction string inputs default empty
        override_total_target_str: '',
        override_total_actual_str: '',
        // Phase TTT/UUU: Fraction fields default to null
        numerator_q1: null, denominator_q1: null,
        numerator_q2: null, denominator_q2: null,
        numerator_q3: null, denominator_q3: null,
        numerator_q4: null, denominator_q4: null,
        // XXX-E: Target fraction fields default to null
        target_numerator_q1: null, target_denominator_q1: null,
        target_numerator_q2: null, target_denominator_q2: null,
        target_numerator_q3: null, target_denominator_q3: null,
        target_numerator_q4: null, target_denominator_q4: null,
        // Phase UUU: Smart string inputs default empty
        target_str_q1: '', target_str_q2: '', target_str_q3: '', target_str_q4: '',
        actual_str_q1: '', actual_str_q2: '', actual_str_q3: '', actual_str_q4: '',
        // XXX-F: Per-quarter notes default empty
        remarks_str_q1: '', remarks_str_q2: '', remarks_str_q3: '', remarks_str_q4: '',
        _existingId: preservedId,
      }
    }
  }

  // Phase DT-A: Tab navigation removed — all quarters shown simultaneously
  // Phase HL: Initialize MOV type-selector from stored JSON (Directive 146)
  const movParsed = parseMov(entryForm.value.mov || null)
  movType.value = movParsed.type
  movValue.value = movParsed.value
  movFileMetadata.value = movParsed.metadata
  entryDialog.value = true

  // Phase AAAA-C: Compute cross-quarter fraction display fallbacks (presentation-only)
  refreshDialogFractionFallback(existingData)
}

/**
 * Phase DV-A: Sanitize empty strings to null for numeric fields
 *
 * Vue v-model.number clears to "" when user deletes field content.
 * Backend DTO validation rejects empty strings for @IsNumber() fields.
 * Solution: Convert "" → null before sending to API.
 */
function sanitizeNumericPayload(data: any): any {
  const numericFields = [
    'target_q1',
    'target_q2',
    'target_q3',
    'target_q4',
    'accomplishment_q1',
    'accomplishment_q2',
    'accomplishment_q3',
    'accomplishment_q4',
    'override_total_target',
    'override_total_actual',
    'numerator_q1',
    'denominator_q1',
    'numerator_q2',
    'denominator_q2',
    'numerator_q3',
    'denominator_q3',
    'numerator_q4',
    'denominator_q4',
    // Phase XXX: target-fraction columns (XXX-C) — excludes remarks_q1-4 and
    // override_total_*_fraction (text fields, must not be coerced to numeric)
    'target_numerator_q1',
    'target_denominator_q1',
    'target_numerator_q2',
    'target_denominator_q2',
    'target_numerator_q3',
    'target_denominator_q3',
    'target_numerator_q4',
    'target_denominator_q4',
  ]

  const sanitized = { ...data }

  numericFields.forEach(field => {
    const val = sanitized[field]
    if (val === '' || val === null || (typeof val === 'number' && isNaN(val))) {
      sanitized[field] = null
    }
  })

  return sanitized
}

// Save quarterly data
async function saveQuarterlyData() {
  if (!selectedIndicator.value) return

  // Phase DL-B: Comprehensive debug logging at entry
  console.group('[Physical] saveQuarterlyData ENTRY');
  console.log('selectedIndicator (taxonomy):', {
    id: selectedIndicator.value?.id,
    indicator_name: selectedIndicator.value?.indicator_name,
    pillar_type: selectedIndicator.value?.pillar_type,
  });
  console.log('currentOperation:', {
    id: currentOperation.value?.id,
    operation_type: currentOperation.value?.operation_type,
    fiscal_year: currentOperation.value?.fiscal_year,
    title: currentOperation.value?.title,
  });
  console.log('selectedFiscalYear:', selectedFiscalYear.value);
  console.log('activePillar:', activePillar.value);
  console.log('entryForm._existingId:', entryForm.value._existingId);
  console.log('pillarIndicators (sample 3):', pillarIndicators.value.slice(0, 3).map(i => ({
    id: i.id,
    pillar_indicator_id: i.pillar_indicator_id,
    fiscal_year: i.fiscal_year,
    operation_id: i.operation_id,
    particular: i.particular,
  })));
  console.groupEnd();

  // Phase UUU: Validate all PERCENTAGE string inputs before saving
  const isPctType = selectedIndicator.value?.unit_type === 'PERCENTAGE'
  if (isPctType) {
    const f = entryForm.value
    const checks = [
      { str: f.target_str_q1, label: 'Target Q1' }, { str: f.target_str_q2, label: 'Target Q2' },
      { str: f.target_str_q3, label: 'Target Q3' }, { str: f.target_str_q4, label: 'Target Q4' },
      { str: f.actual_str_q1, label: 'Actual Q1' }, { str: f.actual_str_q2, label: 'Actual Q2' },
      { str: f.actual_str_q3, label: 'Actual Q3' }, { str: f.actual_str_q4, label: 'Actual Q4' },
      // XXX-G: Validate override fraction string inputs
      { str: f.override_total_target_str, label: 'Override Total Target' },
      { str: f.override_total_actual_str, label: 'Override Total Actual' },
    ]
    for (const { str, label } of checks) {
      if (str && str.trim() !== '') {
        const r = parsePctInput(str)
        if (!r.isValid) {
          toast.error(`${label}: ${r.error}`)
          return
        }
      }
    }
  }

  saving.value = true
  try {
    // First ensure we have an operation
    if (!currentOperation.value) {
      console.log('[Physical] No current operation - creating new operation');
      // Create operation first
      const createRes = await api.post<any>('/api/university-operations', {
        title: `${currentPillar.value.fullName} - FY ${selectedFiscalYear.value}`,
        operation_type: activePillar.value,
        fiscal_year: selectedFiscalYear.value,
        campus: 'MAIN',
        status: 'ONGOING',
      })
      currentOperation.value = createRes
      console.log('[Physical] Created new operation:', currentOperation.value.id);
    }

    const { _existingId } = entryForm.value

    // Phase UUU: Parse PERCENTAGE string inputs into computed values + N/D for storage
    const f = entryForm.value
    const tP1 = isPctType ? parsePctInput(f.target_str_q1) : null
    const tP2 = isPctType ? parsePctInput(f.target_str_q2) : null
    const tP3 = isPctType ? parsePctInput(f.target_str_q3) : null
    const tP4 = isPctType ? parsePctInput(f.target_str_q4) : null
    const aP1 = isPctType ? parsePctInput(f.actual_str_q1) : null
    const aP2 = isPctType ? parsePctInput(f.actual_str_q2) : null
    const aP3 = isPctType ? parsePctInput(f.actual_str_q3) : null
    const aP4 = isPctType ? parsePctInput(f.actual_str_q4) : null
    // XXX-G: Parse override fraction string inputs for PERCENTAGE indicators
    const oTP = isPctType ? parsePctInput(f.override_total_target_str) : null
    const oAP = isPctType ? parsePctInput(f.override_total_actual_str) : null

    const quarterPayload: any = {
      pillar_indicator_id: f.pillar_indicator_id,
      fiscal_year: f.fiscal_year,
      reported_quarter: selectedQuarter.value,
      // Phase VVV-A: PERCENTAGE fields use `?? null` (not `?? f.*`) so a cleared
      // field sends null to the API instead of restoring the stale stored value
      target_q1: isPctType ? (tP1?.computed ?? null) : f.target_q1,
      target_q2: isPctType ? (tP2?.computed ?? null) : f.target_q2,
      target_q3: isPctType ? (tP3?.computed ?? null) : f.target_q3,
      target_q4: isPctType ? (tP4?.computed ?? null) : f.target_q4,
      accomplishment_q1: isPctType ? (aP1?.computed ?? null) : f.accomplishment_q1,
      accomplishment_q2: isPctType ? (aP2?.computed ?? null) : f.accomplishment_q2,
      accomplishment_q3: isPctType ? (aP3?.computed ?? null) : f.accomplishment_q3,
      accomplishment_q4: isPctType ? (aP4?.computed ?? null) : f.accomplishment_q4,
      remarks: f.remarks,
      // Phase HE: APR/UPR narrative fields (Directive 386)
      catch_up_plan: f.catch_up_plan?.trim() || null,
      facilitating_factors: f.facilitating_factors?.trim() || null,
      ways_forward: f.ways_forward?.trim() || null,
      // Phase HK → Phase HL: MOV field — serialize from type-selector (Directive 146)
      mov: serializeMov(),
      override_rate: f.override_rate,
      override_variance: f.override_variance,
      // Phase HA: Total overrides (Directive 373)
      // XXX-G: PERCENTAGE indicators derive override totals from the fraction/% string input
      override_total_target: isPctType ? (oTP?.computed ?? null) : f.override_total_target,
      override_total_actual: isPctType ? (oAP?.computed ?? null) : f.override_total_actual,
      override_total_target_fraction: isPctType ? (oTP?.fractionText ?? null) : null,
      override_total_actual_fraction: isPctType ? (oAP?.fractionText ?? null) : null,
      // Phase TTT/UUU: N/D from Actual parse (null for direct % entry, populated for fraction entry)
      numerator_q1: isPctType ? (aP1?.numerator ?? null) : null,
      denominator_q1: isPctType ? (aP1?.denominator ?? null) : null,
      numerator_q2: isPctType ? (aP2?.numerator ?? null) : null,
      denominator_q2: isPctType ? (aP2?.denominator ?? null) : null,
      numerator_q3: isPctType ? (aP3?.numerator ?? null) : null,
      denominator_q3: isPctType ? (aP3?.denominator ?? null) : null,
      numerator_q4: isPctType ? (aP4?.numerator ?? null) : null,
      denominator_q4: isPctType ? (aP4?.denominator ?? null) : null,
      // XXX-E: N/D from Target parse (mirrors Actual numerator/denominator above)
      target_numerator_q1: isPctType ? (tP1?.numerator ?? null) : null,
      target_denominator_q1: isPctType ? (tP1?.denominator ?? null) : null,
      target_numerator_q2: isPctType ? (tP2?.numerator ?? null) : null,
      target_denominator_q2: isPctType ? (tP2?.denominator ?? null) : null,
      target_numerator_q3: isPctType ? (tP3?.numerator ?? null) : null,
      target_denominator_q3: isPctType ? (tP3?.denominator ?? null) : null,
      target_numerator_q4: isPctType ? (tP4?.numerator ?? null) : null,
      target_denominator_q4: isPctType ? (tP4?.denominator ?? null) : null,
      // XXX-F: Per-quarter notes (optional, no calculation impact)
      remarks_q1: f.remarks_str_q1?.trim() || null,
      remarks_q2: f.remarks_str_q2?.trim() || null,
      remarks_q3: f.remarks_str_q3?.trim() || null,
      remarks_q4: f.remarks_str_q4?.trim() || null,
    }

    // Phase DV-A: Sanitize empty strings to null for numeric fields
    const payload = sanitizeNumericPayload(quarterPayload)

    // Phase DM-A: Use indicator's actual operation_id for UPDATE to prevent 404 mismatch
    const operationId = _existingId
      ? (pillarIndicators.value.find(i => i.id === _existingId)?.operation_id || currentOperation.value.id)
      : currentOperation.value.id

    // Phase DM-B: Validate operationId exists before proceeding
    if (!operationId) {
      console.error('[Physical] CRITICAL: operationId is NULL or undefined', {
        _existingId,
        currentOperation: currentOperation.value,
        indicatorFound: pillarIndicators.value.find(i => i.id === _existingId),
      })
      toast.error('Cannot save: Operation ID not found. Please refresh the page.')
      saving.value = false
      return
    }

    // Phase DI-C: Validate _existingId before attempting PATCH
    if (_existingId) {
      // Verify indicator still exists in current year's data
      const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)

      console.log('[Physical] _existingId validation:', {
        _existingId,
        existsInCurrentYear,
        pillarIndicatorsTotal: pillarIndicators.value.length,
      });

      if (!existsInCurrentYear) {
        console.warn('[Physical] _existingId not found in current year data. Switching to POST (create new).')
        console.log('[Physical] Indicator might be from different year. Creating new record for current year.')
        // Treat as new record for this year
        await api.post(
          `/api/university-operations/${operationId}/indicators/quarterly`,
          payload
        )
        toast.success('Quarterly data saved for current year')
        entryDialog.value = false
        await fetchPillarData()
        return
      }
    }

    // Debug logging
    console.log('[Physical] Saving quarterly data:', {
      operationId,
      _existingId,
      pillar_indicator_id: payload.pillar_indicator_id,
      fiscal_year: payload.fiscal_year,
      hasRemarks: !!payload.remarks,
      route: _existingId ? 'PATCH (update)' : 'POST (create)',
    })

    if (_existingId) {
      // Phase DJ-A: Use dedicated quarterly PATCH endpoint with full validation
      const patchUrl = `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`;
      console.log('[Physical] PATCH REQUEST:', {
        url: patchUrl,
        operationId,
        indicatorId: _existingId,
        fieldCount: Object.keys(payload).length,
      });
      await api.patch(patchUrl, payload)
      toast.success('Quarterly data updated successfully')
    } else {
      // Create new
      const postUrl = `/api/university-operations/${operationId}/indicators/quarterly`;
      console.log('[Physical] POST REQUEST:', { url: postUrl, operationId });
      await api.post(postUrl, payload)
      toast.success('Quarterly data saved successfully')
    }

    entryDialog.value = false
    await fetchPillarData()
    // Phase GOV-UI: Refresh quarterly report status after save (backend auto-reverts to DRAFT)
    await fetchQuarterlyReport()
  } catch (err: any) {
    console.error('[Physical] Save failed:', err);
    toast.error(err.message || 'Failed to save quarterly data')
  } finally {
    saving.value = false
  }
}

// Phase UUU-E: Per-quarter accomplishment percentage — real-time feedback
// PERCENTAGE: reads actual_str_qN via parsePctInput (handles both direct % and fraction)
// COUNT/WEIGHTED_COUNT: original (actual/target)*100 formula
const quarterlyComputedPct = computed(() => {
  const f = entryForm.value
  const isPct = selectedIndicator.value?.unit_type === 'PERCENTAGE'
  if (isPct) {
    return [f.actual_str_q1, f.actual_str_q2, f.actual_str_q3, f.actual_str_q4].map(str => {
      const r = parsePctInput(str)
      return (r.isValid && r.computed !== null) ? r.computed : null
    })
  }
  const quarters = [
    { target: f.target_q1, actual: f.accomplishment_q1 },
    { target: f.target_q2, actual: f.accomplishment_q2 },
    { target: f.target_q3, actual: f.accomplishment_q3 },
    { target: f.target_q4, actual: f.accomplishment_q4 },
  ]
  return quarters.map(({ target, actual }) => {
    const t = Number(target)
    const a = actual
    if (a === null || a === undefined || a === '' || isNaN(Number(a))) return null
    if (!t || t === 0) return null
    return Math.min((Number(a) / t) * 100, 9999.99)
  })
})

// Phase SSS-B: Unit-type-aware instructional banner text
const entryBannerText = computed(() => {
  const type = selectedIndicator.value?.unit_type || 'COUNT'
  if (type === 'PERCENTAGE') {
    return 'Enter a percentage directly (e.g., 90 for 90%) or a fraction (e.g., 286/268 — the system computes the percentage automatically). Both Target and Actual support this dual-entry format.'
  }
  return 'Enter the target and actual values for each quarter (e.g., number of beneficiaries, graduates). Accomplishment percentages are automatically computed — do not pre-compute or enter percentages manually.'
})

// Phase FY-1: DBM BAR1 standard — ALL indicator types use SUM (Directive 211/212)
// Phase ZZZ-A: PERCENTAGE indicators derive totals/overrides live from the `_str`
// fraction inputs (mirroring the save-time parsing in saveQuarterlyData), so the
// Variance/Rate preview updates immediately while editing — including Override
// Total Target/Actual.
const computedPreview = computed(() => {
  const f = entryForm.value
  const isPctType = selectedIndicator.value?.unit_type === 'PERCENTAGE'

  let totalTarget: number | null
  let totalActual: number | null
  let overrideTarget: number | null
  let overrideActual: number | null
  // Phase AAAC-C: fraction-aggregate caption strings (ΣN/ΣD), parity with backend AAAC-A
  let totalTargetFraction: string | null = null
  let totalActualFraction: string | null = null

  if (isPctType) {
    // Phase AAAC-C: mirror backend AAAC-A — when every filled quarter has a valid
    // numerator/denominator pair, total = ΣN/ΣD × 100; otherwise legacy sum-of-%.
    const sideTotal = (strs: string[]): { total: number | null; fraction: string | null } => {
      const parsed = strs.map(s => parsePctInput(s))
      const filled = parsed.filter(p => p.computed !== null)
      const legacySum = filled.length > 0
        ? filled.reduce((a, p) => a + (p.computed as number), 0)
        : null
      let sumNum = 0
      let sumDen = 0
      let allHaveFraction = filled.length > 0
      for (const p of parsed) {
        if (p.computed === null) continue
        if (p.numerator === null || p.denominator === null || p.denominator <= 0) {
          allHaveFraction = false
          break
        }
        sumNum += p.numerator
        sumDen += p.denominator
      }
      if (allHaveFraction && sumDen > 0) {
        return { total: parseFloat(((sumNum / sumDen) * 100).toFixed(4)), fraction: `${sumNum}/${sumDen}` }
      }
      return { total: legacySum, fraction: null }
    }

    const tSide = sideTotal([f.target_str_q1, f.target_str_q2, f.target_str_q3, f.target_str_q4])
    const aSide = sideTotal([f.actual_str_q1, f.actual_str_q2, f.actual_str_q3, f.actual_str_q4])
    totalTarget = tSide.total
    totalActual = aSide.total
    totalTargetFraction = tSide.fraction
    totalActualFraction = aSide.fraction
    overrideTarget = parsePctInput(f.override_total_target_str).computed
    overrideActual = parsePctInput(f.override_total_actual_str).computed
  } else {
    const targets = [f.target_q1, f.target_q2, f.target_q3, f.target_q4]
      .filter(v => v !== null && v !== undefined && v !== '')
    const actuals = [f.accomplishment_q1, f.accomplishment_q2, f.accomplishment_q3, f.accomplishment_q4]
      .filter(v => v !== null && v !== undefined && v !== '')

    totalTarget = targets.length > 0 ? targets.reduce((a, b) => Number(a) + Number(b), 0) : null
    totalActual = actuals.length > 0 ? actuals.reduce((a, b) => Number(a) + Number(b), 0) : null

    // Phase HA: Apply override totals as effective base for variance/rate (Directive 374)
    overrideTarget = (f.override_total_target != null && f.override_total_target !== '')
      ? Number(f.override_total_target)
      : null
    overrideActual = (f.override_total_actual != null && f.override_total_actual !== '')
      ? Number(f.override_total_actual)
      : null
  }

  const effectiveTarget = overrideTarget ?? totalTarget
  const effectiveActual = overrideActual ?? totalActual

  const variance = effectiveTarget !== null && effectiveActual !== null ? effectiveActual - effectiveTarget : null
  const rate = effectiveTarget !== null && effectiveTarget !== 0 && effectiveActual !== null
    ? (effectiveActual / effectiveTarget) * 100
    : null

  return { totalTarget, totalActual, totalTargetFraction, totalActualFraction, variance, rate }
})

// Phase EM-C: Submit quarterly report for the current FY+quarter (single API call)
async function submitAllPillarsForReview() {
  actionLoading.value = true
  try {
    // Phase EP-C: Defensive re-fetch to ensure latest status before submitting
    await fetchQuarterlyReport()
    if (currentQuarterlyReport.value &&
        currentQuarterlyReport.value.publication_status !== 'DRAFT' &&
        currentQuarterlyReport.value.publication_status !== 'REJECTED') {
      const label = currentQuarterlyReport.value.publication_status.toLowerCase().replace('_', ' ')
      toast.warning(`This quarter is already ${label}`)
      return
    }

    let report = currentQuarterlyReport.value
    // If no quarterly report exists yet, create one
    if (!report) {
      report = await api.post<any>('/api/university-operations/quarterly-reports', {
        fiscal_year: selectedFiscalYear.value,
        quarter: selectedQuarter.value,
      })
      currentQuarterlyReport.value = report
    }
    // Submit for review — single API call
    await api.post(`/api/university-operations/quarterly-reports/${report.id}/submit`, {})
    toast.success(`${selectedQuarter.value} submitted for review`)
    await fetchQuarterlyReport()
    await findCurrentOperation()
  } catch (err: any) {
    console.error('[Physical] submitAllPillarsForReview:', err)
    toast.error(err.message || 'Failed to submit quarterly report')
  } finally {
    actionLoading.value = false
  }
}

// Phase EM-C: Withdraw quarterly report submission (single API call)
async function withdrawAllPillarsSubmission() {
  if (!currentQuarterlyReport.value) return
  actionLoading.value = true
  try {
    await api.post(`/api/university-operations/quarterly-reports/${currentQuarterlyReport.value.id}/withdraw`, {})
    toast.success(`${selectedQuarter.value} submission withdrawn`)
    await fetchQuarterlyReport()
    await findCurrentOperation()
  } catch (err: any) {
    console.error('[Physical] withdrawAllPillarsSubmission:', err)
    toast.error(err.message || 'Failed to withdraw quarterly report')
  } finally {
    actionLoading.value = false
  }
}

// Phase GOV-UI: Submit unlock request for published quarterly report (non-admin)
async function submitUnlockRequest() {
  if (!currentQuarterlyReport.value) return
  if (!unlockRequestReason.value.trim()) {
    toast.warning('Please provide a reason for the unlock request')
    return
  }
  unlockRequestLoading.value = true
  try {
    await api.post(
      `/api/university-operations/quarterly-reports/${currentQuarterlyReport.value.id}/request-unlock`,
      { reason: unlockRequestReason.value.trim() }
    )
    toast.success('Unlock request submitted successfully')
    unlockRequestDialog.value = false
    unlockRequestReason.value = ''
    await fetchQuarterlyReport()
  } catch (err: any) {
    console.error('[Physical] submitUnlockRequest:', err)
    toast.error(err.message || 'Failed to submit unlock request')
  } finally {
    unlockRequestLoading.value = false
  }
}


// Phase DQ-B: Decoupled Watch Handlers
// Pillar changes refetch taxonomy + indicator data
// Fiscal year changes ONLY refetch indicator data (taxonomy is static per pillar)
// ═══════════════════════════════════════════════════════════════════════════

// Watch pillar changes - refetch taxonomy AND indicator data
// Phase DP-A: Guard against fetch when fiscal year not yet initialized
watch(activePillar, async () => {
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) {
    console.warn('[Physical] Skipping fetch - fiscal year not initialized')
    return
  }
  // Phase AAAA-A: Pillar changed — cached per-quarter indicator lists are stale
  quarterIndicatorCache.value.clear()
  loading.value = true
  await fetchTaxonomy()
  await fetchIndicatorData()
  await findCurrentOperation()
  loading.value = false
})

// Watch fiscal year changes - ONLY refetch indicator data (taxonomy is pillar-based)
// Phase DP-A: Guard against invalid fiscal year
watch(selectedFiscalYear, async (newYear) => {
  // Phase EP-A: Skip during onMounted initialization to prevent race condition
  if (isInitializing) return
  if (!newYear || newYear < 2020) return
  // Phase AAAA-A: Fiscal year changed — cached per-quarter indicator lists are stale
  quarterIndicatorCache.value.clear()
  // Phase DI-B: Sync year changes to URL query
  router.replace({
    query: { ...route.query, year: newYear.toString() }
  })
  // Phase DQ-B: Only refetch indicator data - taxonomy is fiscal-year-independent
  loading.value = true
  await fetchIndicatorData()
  await findCurrentOperation()
  // Phase EL-B: Reload all pillar operations when FY changes
  await fetchAllPillarOperations()
  // Phase EM-C: Reload quarterly report for new FY+quarter
  await fetchQuarterlyReport()
  loading.value = false
})

// Phase FL-3: Watch quarter changes — reload indicator data + quarterly report
// Per-quarter record isolation: each quarter has its own DB records
watch(selectedQuarter, async () => {
  await fetchIndicatorData()
  await fetchQuarterlyReport()
})

// Phase DW-C: Fix race condition - await fiscal year fetch before indicator data
onMounted(async () => {
  // Phase HN: If current activePillar not in visiblePillars, select first visible
  if (!visiblePillars.value.some(p => p.id === activePillar.value)) {
    activePillar.value = visiblePillars.value[0]?.id ?? PILLARS[0].id
  }
  // Ensure fiscal year is initialized before fetching pillar data
  await fiscalYearStore.fetchFiscalYears()
  await fetchPillarData()
  // Phase EL-B: Load all pillar operations after initial data is ready
  await fetchAllPillarOperations()
  // Phase EM-C: Load quarterly report for initial FY+quarter
  await fetchQuarterlyReport()
  // Phase EP-A: Allow watch(selectedFiscalYear) to fire for user-driven changes
  isInitializing = false
})
</script>

<template>
  <div>
    <!-- Row 1: Title + Submit/Status (Phase HK-1 — Directive 133) -->
    <div class="d-flex align-center ga-3 mb-2" style="justify-content: space-between">
      <div class="d-flex align-center ga-3">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            Physical Accomplishments
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            BAR No. 1 - Quarterly Physical Report of Operations
          </p>
        </div>
      </div>
      <div class="d-flex align-center flex-wrap ga-2">
        <v-btn
          v-if="canSubmitAllPillars()"
          color="primary"
          variant="flat"
          density="compact"
          :prepend-icon="currentQuarterlyReport?.publication_status === 'REJECTED' ? 'mdi-refresh' : 'mdi-send'"
          :loading="actionLoading"
          @click="submitAllPillarsForReview"
          class="flex-shrink-0"
        >
          <span class="d-none d-sm-inline">{{ currentQuarterlyReport?.publication_status === 'REJECTED' ? 'Resubmit' : 'Submit for Review' }}</span>
          <v-icon class="d-sm-none">{{ currentQuarterlyReport?.publication_status === 'REJECTED' ? 'mdi-refresh' : 'mdi-send' }}</v-icon>
        </v-btn>
        <v-btn
          v-else-if="canWithdrawAllPillars()"
          color="warning"
          variant="tonal"
          density="compact"
          prepend-icon="mdi-undo"
          :loading="actionLoading"
          @click="withdrawAllPillarsSubmission"
          class="flex-shrink-0"
        >
          <span class="d-none d-sm-inline">Withdraw Submission</span>
          <v-icon class="d-sm-none">mdi-undo</v-icon>
        </v-btn>
        <v-btn
          v-else-if="currentQuarterlyReport?.publication_status === 'PENDING_REVIEW'"
          color="info"
          variant="tonal"
          density="compact"
          prepend-icon="mdi-clock-outline"
          disabled
          class="flex-shrink-0"
        >
          <span class="d-none d-sm-inline">Pending Review</span>
          <v-icon class="d-sm-none">mdi-clock-outline</v-icon>
        </v-btn>
        <v-chip
          v-else-if="currentQuarterlyReport?.publication_status === 'PUBLISHED'"
          color="success"
          variant="tonal"
          size="small"
          prepend-icon="mdi-check-circle"
          class="flex-shrink-0"
        >
          Approved
        </v-chip>
      </div>
    </div>

    <!-- Row 2: Controls — Quarter + FY + Columns + Export (Phase HK-1) -->
    <div class="d-flex align-center flex-wrap ga-2 mb-4">
      <v-select
        v-model="selectedQuarter"
        :items="quarterOptions"
        item-title="title"
        item-value="value"
        label="Reporting Period"
        variant="outlined"
        density="compact"
        hide-details
        style="width: 200px"
        prepend-inner-icon="mdi-calendar-range"
      />
      <v-select
        v-model="selectedFiscalYear"
        :items="fiscalYearOptions"
        label="Fiscal Year"
        variant="outlined"
        density="compact"
        hide-details
        style="width: 170px"
        prepend-inner-icon="mdi-calendar"
      />
      <!-- Phase HG: Column visibility toggle (Directive 108) -->
      <v-menu :close-on-content-click="false" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="outlined" density="compact" prepend-icon="mdi-table-column" class="flex-shrink-0">
            <span class="d-none d-sm-inline">Columns</span>
            <v-icon class="d-sm-none">mdi-table-column</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" min-width="210">
          <v-list-subheader class="text-caption">Optional Columns</v-list-subheader>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.score" label="Score" density="compact" hide-details color="primary" />
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.remarks" label="Remarks" density="compact" hide-details color="primary" />
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.notes" label="Notes (per-quarter)" density="compact" hide-details color="primary" />
          </v-list-item>
          <v-list-subheader class="text-caption">Narrative Fields (APR/UPR)</v-list-subheader>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.catch_up_plans" label="Catch-Up Plans" density="compact" hide-details color="primary" />
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.facilitating_factors" label="Facilitating Factors" density="compact" hide-details color="primary" />
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.ways_forward" label="Ways Forward" density="compact" hide-details color="primary" />
          </v-list-item>
          <!-- Phase HK: MOV toggle under Verification subheader (Directive 139) -->
          <v-list-subheader class="text-caption">Verification</v-list-subheader>
          <v-list-item>
            <v-checkbox v-model="columnVisibility.mov" label="Means of Verification (MOV)" density="compact" hide-details color="primary" />
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="outlined"
            density="compact"
            prepend-icon="mdi-file-export"
            class="flex-shrink-0"
            v-bind="props"
          >
            <span class="d-none d-sm-inline">Export</span>
            <v-icon class="d-sm-none">mdi-file-export</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item disabled>
            <template v-slot:prepend>
              <v-icon>mdi-file-pdf-box</v-icon>
            </template>
            <v-list-item-title>Export to PDF</v-list-item-title>
            <v-list-item-subtitle class="text-caption">Coming soon</v-list-item-subtitle>
          </v-list-item>
          <v-list-item disabled>
            <template v-slot:prepend>
              <v-icon>mdi-file-excel</v-icon>
            </template>
            <v-list-item-title>Export to Excel</v-list-item-title>
            <v-list-item-subtitle class="text-caption">Coming soon</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <!-- Phase DW-C: "Add Fiscal Year" button on main university-operations page -->

    <!-- Phase EO-B: Consolidated hero bar — single authoritative quarterly status -->
    <v-sheet v-if="currentPillar" rounded="lg" class="mb-4 pa-3 d-flex align-center justify-space-between flex-wrap ga-2" color="grey-lighten-4">
      <div class="d-flex align-center ga-2">
        <v-icon :icon="currentPillar.icon" :color="currentPillar.color" size="small" />
        <span class="text-body-2 font-weight-medium">{{ currentPillar.fullName }}</span>
      </div>
      <div class="d-flex align-center ga-2">
        <v-chip size="x-small" variant="outlined" color="primary">
          {{ selectedQuarter }}
        </v-chip>
        <v-chip
          :color="getPublicationStatusColor(currentQuarterStatus as any)"
          size="x-small"
          variant="tonal"
          :prepend-icon="currentQuarterStatus === 'FETCH_ERROR' ? 'mdi-alert-circle' : undefined"
        >
          {{ currentQuarterStatus === 'NOT_STARTED' ? 'Not Started' : getPublicationStatusLabel(currentQuarterStatus as any) }}
        </v-chip>
      </div>
    </v-sheet>

    <!-- Phase EP-D: Retry banner — shown when quarterly report fetch failed -->
    <v-alert
      v-if="quarterlyReportFetchFailed"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center justify-space-between">
        <span class="text-body-2">
          Unable to load quarterly report status. Submit is disabled until the status is confirmed.
        </span>
        <v-btn
          variant="outlined"
          color="warning"
          size="small"
          prepend-icon="mdi-refresh"
          :loading="isLoadingQuarterlyReport"
          @click="fetchQuarterlyReport"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- Phase EO-E: Rejection banner — reads from quarterly report status -->
    <v-alert
      v-if="currentQuarterlyReport && currentQuarterlyReport.publication_status === 'REJECTED'"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center ga-3">
        <v-chip color="error" variant="flat">Rejected</v-chip>
        <span class="text-body-2">
          {{ currentQuarterlyReport.review_notes || 'This quarterly report was rejected. Please revise and resubmit.' }}
        </span>
      </div>
    </v-alert>

    <!-- Phase GOV-C: Lock advisory with Request Update workflow — non-admin OR admin without unlock -->
    <v-alert
      v-if="!isSuperAdmin && currentQuarterlyReport && currentQuarterlyReport.publication_status === 'PUBLISHED' && !currentQuarterlyReport.unlocked_by"
      :type="currentQuarterlyReport.unlock_requested_by ? 'warning' : 'info'"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="small">{{ currentQuarterlyReport.unlock_requested_by ? 'mdi-clock-outline' : 'mdi-lock-outline' }}</v-icon>
        <span v-if="currentQuarterlyReport.unlock_requested_by" class="text-body-2">
          An unlock request has been submitted and is pending administrator review.
        </span>
        <span v-else class="text-body-2">
          This quarter's report has been published. Data entry is locked.
        </span>
        <v-spacer />
        <v-btn
          v-if="!currentQuarterlyReport.unlock_requested_by"
          size="small"
          variant="outlined"
          color="primary"
          @click="unlockRequestDialog = true"
        >
          <v-icon start size="small">mdi-lock-open-variant-outline</v-icon>
          Request Update
        </v-btn>
      </div>
    </v-alert>

    <!-- Phase GOV-C: Admin/SuperAdmin advisory when report is unlocked or SuperAdmin bypass -->
    <v-alert
      v-if="(isSuperAdmin || (isAdmin && currentQuarterlyReport?.unlocked_by)) && currentQuarterlyReport && currentQuarterlyReport.publication_status === 'PUBLISHED'"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="small">mdi-shield-alert-outline</v-icon>
        <span class="text-body-2">
          This quarter's report is published. Editing data will automatically revert the report to Draft status, requiring re-submission.
        </span>
      </div>
    </v-alert>

    <!-- Phase DR-C: Pillar Tabs with Full Program Names -->
    <v-card class="mb-4">
      <v-tabs v-model="activePillar" bg-color="primary" show-arrows class="pillar-tabs">
        <v-tab v-for="pillar in visiblePillars" :key="pillar.id" :value="pillar.id" class="pillar-tab">
          <v-icon start>{{ pillar.icon }}</v-icon>
          {{ pillar.fullName }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, table" />
    </v-card>

    <!-- Pillar Content -->
    <template v-else>
      <!-- Phase DC-E: Organizational Outcome Header -->
      <v-card class="mb-4" color="primary" variant="tonal">
        <v-card-text class="py-3">
          <div class="d-flex align-center ga-2">
            <v-chip color="primary" variant="flat" size="small">{{ currentOO.code }}</v-chip>
            <span class="text-body-2 font-weight-medium">{{ currentOO.description }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Phase EE-B: Consolidated Pillar Header (merged DR-E summary + publication status + action controls) -->
      <v-card class="mb-4" :color="currentPillar.color" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center justify-space-between pillar-header-content">
            <!-- Left: Pillar identity -->
            <div>
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon :icon="currentPillar.icon" size="large" />
                <h2 class="text-h5 font-weight-bold">{{ currentPillar.fullName }}</h2>
              </div>
              <p class="text-body-2 mb-0">
                <strong>UACS Code:</strong> {{ currentPillar.uacs }}
              </p>
            </div>
            <!-- Right: FY + Status + Indicator metrics -->
            <div class="d-flex flex-column align-end ga-2">
              <!-- Phase EO-D: FY chip only — publication status removed (canonical status in header row) -->
              <div class="d-flex ga-1 align-center">
                <v-chip color="primary" size="small">
                  FY {{ selectedFiscalYear }}
                </v-chip>
              </div>
              <!-- Row 2: Indicator count + Achievement rate -->
              <div v-if="pillarTaxonomy.length > 0" class="d-flex ga-1 flex-wrap justify-end">
                <v-chip size="x-small" variant="tonal" color="primary">
                  <v-icon start size="x-small">mdi-database-check</v-icon>
                  {{ pillarRateSummary.withData }}/{{ pillarRateSummary.total }} Indicators
                </v-chip>
                <v-chip size="x-small" variant="tonal"
                  :color="pillarRateSummary.ratePct === null ? 'grey'
                    : pillarRateSummary.ratePct >= 100 ? 'success'
                    : pillarRateSummary.ratePct >= 80 ? 'warning' : 'error'">
                  <v-icon start size="x-small">mdi-chart-line</v-icon>
                  {{ pillarRateSummary.ratePct !== null ? `${pillarRateSummary.ratePct.toFixed(1)}%` : 'No data' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Phase DX-C: Collapsible quarterly reporting guidance -->
      <v-expansion-panels variant="accordion" class="mb-4">
        <v-expansion-panel>
          <v-expansion-panel-title class="text-body-2">
            <v-icon start size="small" color="info">mdi-information-outline</v-icon>
            Quarterly Reporting Guide
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="text-body-2">
              <p class="mb-2">
                <strong>How It Works:</strong> Each quarter (Q1–Q4) stores your data as an independent record for that reporting period. When you select a quarter and save, only that quarter's record is affected — other quarters remain untouched.
              </p>
              <p class="mb-2">
                <strong>Entering Data:</strong> 1) Select your reporting period using the Quarter dropdown. 2) Click any indicator row to open the data entry form. 3) Enter Target, Actual, and Score values for all four quarters — you can edit any column freely. 4) Click Save. Your data is saved to the selected quarter's record only.
              </p>
              <p class="mb-2">
                <strong>Prior-Quarter Reference:</strong> When you open an indicator in a new quarter with no existing data, the system automatically fills in values from the previous quarter as a starting point. You can edit these values before saving — they will not affect the previous quarter's record.
              </p>
              <p class="mb-2">
                <strong>Quarter Schedule:</strong> Q1 (Jan–Mar) · Q2 (Apr–Jun) · Q3 (Jul–Sep) · Q4 (Oct–Dec)
              </p>
              <p class="mb-2">
                <strong>Override Totals:</strong> The "Total Target" and "Total Actual" columns
                show the sum of your Q1–Q4 entries by default. However, if the official BAR No. 1
                report uses a different verified total (e.g., due to annual targets or official
                adjustments), you can enter an override value in the entry dialog. When an override
                is set, the table will display the official value instead of the auto-calculated sum.
                Use this to ensure your entries match the submitted government report exactly.
              </p>
              <p class="mb-0">
                <strong>Submission &amp; Review:</strong> Once all indicators are complete for a quarter, submit for review using the Submit button. Your data goes through: Draft → Pending Review → Published. Published quarters are locked for editing unless unlocked by an administrator.
              </p>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Outcome Indicators -->
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
          <v-icon start color="primary">mdi-target</v-icon>
          Outcome Indicators
          <v-chip size="small" class="ml-2" color="primary" variant="tonal">
            {{ outcomeIndicators.length }}
          </v-chip>
          <v-spacer />
        </v-card-title>
        <v-divider />

        <!-- Phase EG-B: Score columns removed from overview table (accessible via entry dialog) -->
        <div v-if="outcomeIndicators.length > 0" class="responsive-table-wrapper">
          <v-table density="compact">
            <thead>
              <tr class="bg-primary text-white">
                <th class="text-left indicator-column" rowspan="2">Indicator</th>
                <th v-for="q in QUARTERS" :key="q" colspan="2" class="text-center qgroup-header border-right-q" :class="{ 'q-active-group': q === selectedQuarter }">{{ q }}</th>
                <!-- Phase GZ: Total Target + Total Actual columns (Directive 361) -->
                <th class="text-center total-column" rowspan="2">Total Target</th>
                <th class="text-center total-column" rowspan="2">Total Actual</th>
                <th class="variance-column" rowspan="2">Variance</th>
                <th class="rate-column" rowspan="2">Rate</th>
                <!-- Phase HL: Action column label (Directive 149) -->
                <th v-if="canEditData()" class="action-column text-center" rowspan="2">
                  <v-icon size="x-small" color="grey">mdi-pencil-outline</v-icon>
                </th>
              </tr>
              <tr class="bg-grey-lighten-5">
                <template v-for="q in QUARTERS" :key="q + '-sub'">
                  <th class="text-center qsub-col" :class="qCellClass(q)">Target</th>
                  <th class="text-center qsub-col border-right-q" :class="qCellClass(q)">Actual</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <template v-for="indicator in outcomeIndicators" :key="indicator.id">
              <tr
                class="cursor-pointer"
                @click="canEditData() && openEntryDialog(indicator)"
              >
                <td class="indicator-cell">
                  <div class="d-flex align-start ga-2">
                    <v-tooltip location="top">
                      <template #activator="{ props }">
                        <v-chip
                          v-bind="props"
                          :color="getUnitConfig(indicator.unit_type).color"
                          size="x-small"
                          variant="tonal"
                          class="mt-1 flex-shrink-0 unit-type-chip"
                        >
                          <v-icon start size="x-small">{{ getUnitConfig(indicator.unit_type).icon }}</v-icon>
                          {{ getUnitConfig(indicator.unit_type).label }}
                        </v-chip>
                      </template>
                      {{ getUnitConfig(indicator.unit_type).title }}
                    </v-tooltip>
                    <div>
                      <v-tooltip location="top" max-width="400">
                        <template #activator="{ props }">
                          <div v-bind="props" class="font-weight-medium indicator-text">{{ indicator.indicator_name }}</div>
                        </template>
                        <span style="white-space: pre-line">{{ indicator.indicator_name }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props }">
                          <div v-bind="props" class="text-caption text-grey uacs-code">{{ indicator.indicator_code }}</div>
                        </template>
                        <span>UACS Code: {{ indicator.indicator_code }}</span>
                      </v-tooltip>
                    </div>
                  </div>
                </td>
                <template v-if="getIndicatorData(indicator.id)">
                  <!-- Phase DW-D: Always render all 12 quarter cells with highlight -->
                  <template v-for="q in QUARTERS" :key="q + '-data'">
                    <td class="text-center qsub-cell" :class="qCellClass(q)">
                      <div>{{ getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).primary }}</div>
                      <div
                        v-if="getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).fraction"
                        class="text-caption text-grey"
                      >{{ getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).fraction }}</div>
                    </td>
                    <td class="text-center qsub-cell text-success border-right-q" :class="qCellClass(q)">
                      <div>{{ getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).primary }}</div>
                      <div
                        v-if="getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).fraction"
                        class="text-caption text-grey"
                      >{{ getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).fraction }}</div>
                    </td>
                  </template>
                  <!-- Phase GZ: Total Target + Total Actual (Directive 361) -->
                  <td class="text-center">
                    {{ formatNumber(getIndicatorData(indicator.id)?.total_target) }}{{ getUnitConfig(indicator.unit_type).suffix }}
                    <!-- XXX-G: Override target fraction caption -->
                    <div v-if="getIndicatorData(indicator.id)?.override_total_target_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.override_total_target_fraction }}</div>
                    <!-- AAAC-B: fraction-aggregate caption (ΣN/ΣD) when no override fraction set -->
                    <div v-else-if="getIndicatorData(indicator.id)?.total_target_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.total_target_fraction }}</div>
                  </td>
                  <td class="text-center text-success">
                    {{ formatNumber(getIndicatorData(indicator.id)?.total_accomplishment) }}{{ getUnitConfig(indicator.unit_type).suffix }}
                    <!-- XXX-G: Override actual fraction caption -->
                    <div v-if="getIndicatorData(indicator.id)?.override_total_actual_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.override_total_actual_fraction }}</div>
                    <!-- AAAC-B: fraction-aggregate caption (ΣN/ΣD) when no override fraction set -->
                    <div v-else-if="getIndicatorData(indicator.id)?.total_actual_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.total_actual_fraction }}</div>
                  </td>
                  <!-- Phase GZ: Annual Variance + Rate (Directives 360, 363) -->
                  <td class="text-right">
                    <v-chip
                      size="x-small"
                      class="metric-chip"
                      :color="getVarianceColor(getIndicatorData(indicator.id)?.variance)"
                      variant="tonal"
                    >
                      {{ formatNumber(getIndicatorData(indicator.id)?.variance) }}
                    </v-chip>
                  </td>
                  <td class="text-right">
                    <v-chip
                      size="x-small"
                      class="metric-chip"
                      :color="getRateColor(getIndicatorData(indicator.id)?.accomplishment_rate)"
                      variant="tonal"
                    >
                      {{ formatPercent(getIndicatorData(indicator.id)?.accomplishment_rate) }}
                    </v-chip>
                  </td>
                </template>
                <!-- Phase HK: No-data colspan (Directive 137) -->
                <td v-else colspan="12" class="text-center">
                  <div class="no-data-hint pa-2">
                    <v-icon size="small" color="grey" class="mr-1">mdi-pencil-plus-outline</v-icon>
                    <span class="text-grey">Click row to enter quarterly data</span>
                  </div>
                </td>
                <td v-if="canEditData()" class="text-center">
                  <v-btn icon="mdi-pencil" variant="text" size="x-small" @click.stop="openEntryDialog(indicator)" />
                </td>
              </tr>
              <!-- Phase HK: Below-row stacked panel — remarks + narratives + MOV (Directives 135, 138, 141) -->
              <!-- Phase HL: Stacked panel click-to-edit (Directive 148) -->
              <tr v-if="anyNarrativeVisible && getIndicatorData(indicator.id)" class="narrative-stacked-row" :class="{ 'cursor-pointer': canEditData() }" @click="canEditData() && openEntryDialog(indicator)">
                <td :colspan="narrativeRowColspan" class="pa-0">
                  <div class="narrative-stacked-panel">
                    <div v-if="columnVisibility.score" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Score:</span>
                      <span class="narrative-stacked-text">
                        Q1: {{ getIndicatorData(indicator.id)?.score_q1 || '—' }} |
                        Q2: {{ getIndicatorData(indicator.id)?.score_q2 || '—' }} |
                        Q3: {{ getIndicatorData(indicator.id)?.score_q3 || '—' }} |
                        Q4: {{ getIndicatorData(indicator.id)?.score_q4 || '—' }}
                      </span>
                    </div>
                    <div v-if="columnVisibility.remarks" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Remarks:</span>
                      <span v-if="getIndicatorData(indicator.id)?.remarks" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.remarks }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <!-- XXX-F: Per-quarter Notes (Issue A) -->
                    <div v-if="columnVisibility.notes" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Notes:</span>
                      <span v-if="getIndicatorData(indicator.id)?.remarks_q1 || getIndicatorData(indicator.id)?.remarks_q2 || getIndicatorData(indicator.id)?.remarks_q3 || getIndicatorData(indicator.id)?.remarks_q4" class="narrative-stacked-text">
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q1">Q1: {{ getIndicatorData(indicator.id)?.remarks_q1 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q2">Q2: {{ getIndicatorData(indicator.id)?.remarks_q2 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q3">Q3: {{ getIndicatorData(indicator.id)?.remarks_q3 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q4">Q4: {{ getIndicatorData(indicator.id)?.remarks_q4 }}</template>
                      </span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.catch_up_plans" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Catch-Up Plans:</span>
                      <span v-if="getIndicatorData(indicator.id)?.catch_up_plan" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.catch_up_plan }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.facilitating_factors" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Facilitating Factors:</span>
                      <span v-if="getIndicatorData(indicator.id)?.facilitating_factors" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.facilitating_factors }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.ways_forward" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Ways Forward:</span>
                      <span v-if="getIndicatorData(indicator.id)?.ways_forward" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.ways_forward }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <!-- Phase HL: Type-aware MOV display (Directive 147) -->
                    <div v-if="columnVisibility.mov" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">MOV:</span>
                      <template v-if="getIndicatorData(indicator.id)?.mov">
                        <a v-if="parseMov(getIndicatorData(indicator.id).mov).type === 'link'"
                           :href="parseMov(getIndicatorData(indicator.id).mov).value"
                           target="_blank" rel="noopener" class="narrative-stacked-text text-primary"
                           @click.stop>
                          <v-icon size="x-small" class="mr-1">mdi-open-in-new</v-icon>
                          {{ parseMov(getIndicatorData(indicator.id).mov).value }}
                        </a>
                        <span v-else-if="parseMov(getIndicatorData(indicator.id).mov).type === 'file'" class="narrative-stacked-text">
                          <v-icon size="x-small" class="mr-1">mdi-file-check</v-icon>
                          {{ parseMov(getIndicatorData(indicator.id).mov).metadata?.filename || parseMov(getIndicatorData(indicator.id).mov).value }}
                        </span>
                        <span v-else class="narrative-stacked-text">{{ parseMov(getIndicatorData(indicator.id).mov).value }}</span>
                      </template>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                  </div>
                </td>
              </tr>
              </template>
            </tbody>
          </v-table>

          <!-- Phase FJ-3: Prefill availability notice for outcome indicators -->
          <div v-if="outcomeIndicators.some(ind => hasPrefillAvailable(ind.id))" class="text-caption text-grey px-4 pb-2">
            <v-icon size="x-small" color="info" class="mr-1">mdi-information-outline</v-icon>
            {{ PRIOR_QUARTER_MAP[selectedQuarter] }} data available for some indicators — click a row to pre-fill {{ selectedQuarter }} values.
          </div>
        </div>

        <v-card-text v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-target</v-icon>
          <div class="text-h6 text-grey-darken-1">No Outcome Indicators</div>
          <div class="text-body-2 text-grey mt-1">
            Outcome indicators for {{ currentPillar.name }} have not been configured in the taxonomy.
          </div>
        </v-card-text>
      </v-card>

      <!-- Output Indicators -->
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
          <v-icon start color="success">mdi-chart-box</v-icon>
          Output Indicators
          <v-chip size="small" class="ml-2" color="success" variant="tonal">
            {{ outputIndicators.length }}
          </v-chip>
        </v-card-title>
        <v-divider />

        <!-- Phase DW-C: Always render all 4 quarter groups; highlight selected -->
        <div v-if="outputIndicators.length > 0" class="responsive-table-wrapper">
          <v-table density="compact">
            <thead>
              <tr class="bg-primary text-white">
                <th class="text-left indicator-column" rowspan="2">Indicator</th>
                <th v-for="q in QUARTERS" :key="q" colspan="2" class="text-center qgroup-header border-right-q" :class="{ 'q-active-group': q === selectedQuarter }">{{ q }}</th>
                <!-- Phase GZ: Total Target + Total Actual columns (Directive 361) -->
                <th class="text-center total-column" rowspan="2">Total Target</th>
                <th class="text-center total-column" rowspan="2">Total Actual</th>
                <th class="variance-column" rowspan="2">Variance</th>
                <th class="rate-column" rowspan="2">Rate</th>
                <!-- Phase HL: Action column label (Directive 149) -->
                <th v-if="canEditData()" class="action-column text-center" rowspan="2">
                  <v-icon size="x-small" color="grey">mdi-pencil-outline</v-icon>
                </th>
              </tr>
              <tr class="bg-grey-lighten-5">
                <template v-for="q in QUARTERS" :key="q + '-sub'">
                  <th class="text-center qsub-col" :class="qCellClass(q)">Target</th>
                  <th class="text-center qsub-col border-right-q" :class="qCellClass(q)">Actual</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <template v-for="indicator in outputIndicators" :key="indicator.id">
              <tr
                class="cursor-pointer"
                @click="canEditData() && openEntryDialog(indicator)"
              >
                <td class="indicator-cell">
                  <div class="d-flex align-start ga-2">
                    <v-tooltip location="top">
                      <template #activator="{ props }">
                        <v-chip
                          v-bind="props"
                          :color="getUnitConfig(indicator.unit_type).color"
                          size="x-small"
                          variant="tonal"
                          class="mt-1 flex-shrink-0 unit-type-chip"
                        >
                          <v-icon start size="x-small">{{ getUnitConfig(indicator.unit_type).icon }}</v-icon>
                          {{ getUnitConfig(indicator.unit_type).label }}
                        </v-chip>
                      </template>
                      {{ getUnitConfig(indicator.unit_type).title }}
                    </v-tooltip>
                    <div>
                      <v-tooltip location="top" max-width="400">
                        <template #activator="{ props }">
                          <div v-bind="props" class="font-weight-medium indicator-text">{{ indicator.indicator_name }}</div>
                        </template>
                        <span style="white-space: pre-line">{{ indicator.indicator_name }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props }">
                          <div v-bind="props" class="text-caption text-grey uacs-code">{{ indicator.indicator_code }}</div>
                        </template>
                        <span>UACS Code: {{ indicator.indicator_code }}</span>
                      </v-tooltip>
                    </div>
                  </div>
                </td>
                <template v-if="getIndicatorData(indicator.id)">
                  <!-- Phase DW-D: Always render all 8 quarter cells with highlight -->
                  <template v-for="q in QUARTERS" :key="q + '-data'">
                    <td class="text-center qsub-cell" :class="qCellClass(q)">
                      <div>{{ getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).primary }}</div>
                      <div
                        v-if="getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).fraction"
                        class="text-caption text-grey"
                      >{{ getPctCellDisplay(getIndicatorData(indicator.id), 'target', q, indicator.unit_type).fraction }}</div>
                    </td>
                    <td class="text-center qsub-cell text-success border-right-q" :class="qCellClass(q)">
                      <div>{{ getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).primary }}</div>
                      <div
                        v-if="getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).fraction"
                        class="text-caption text-grey"
                      >{{ getPctCellDisplay(getIndicatorData(indicator.id), 'accomplishment', q, indicator.unit_type).fraction }}</div>
                    </td>
                  </template>
                  <!-- Phase GZ: Total Target + Total Actual (Directive 361) -->
                  <td class="text-center">
                    {{ formatNumber(getIndicatorData(indicator.id)?.total_target) }}{{ getUnitConfig(indicator.unit_type).suffix }}
                    <!-- XXX-G: Override target fraction caption -->
                    <div v-if="getIndicatorData(indicator.id)?.override_total_target_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.override_total_target_fraction }}</div>
                    <!-- AAAC-B: fraction-aggregate caption (ΣN/ΣD) when no override fraction set -->
                    <div v-else-if="getIndicatorData(indicator.id)?.total_target_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.total_target_fraction }}</div>
                  </td>
                  <td class="text-center text-success">
                    {{ formatNumber(getIndicatorData(indicator.id)?.total_accomplishment) }}{{ getUnitConfig(indicator.unit_type).suffix }}
                    <!-- XXX-G: Override actual fraction caption -->
                    <div v-if="getIndicatorData(indicator.id)?.override_total_actual_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.override_total_actual_fraction }}</div>
                    <!-- AAAC-B: fraction-aggregate caption (ΣN/ΣD) when no override fraction set -->
                    <div v-else-if="getIndicatorData(indicator.id)?.total_actual_fraction" class="text-caption text-grey">{{ getIndicatorData(indicator.id)?.total_actual_fraction }}</div>
                  </td>
                  <!-- Phase GZ: Annual Variance + Rate (Directives 360, 363) -->
                  <td class="text-right">
                    <v-chip
                      size="x-small"
                      class="metric-chip"
                      :color="getVarianceColor(getIndicatorData(indicator.id)?.variance)"
                      variant="tonal"
                    >
                      {{ formatNumber(getIndicatorData(indicator.id)?.variance) }}
                    </v-chip>
                  </td>
                  <td class="text-right">
                    <v-chip
                      size="x-small"
                      class="metric-chip"
                      :color="getRateColor(getIndicatorData(indicator.id)?.accomplishment_rate)"
                      variant="tonal"
                    >
                      {{ formatPercent(getIndicatorData(indicator.id)?.accomplishment_rate) }}
                    </v-chip>
                  </td>
                </template>
                <!-- Phase HK: No-data colspan (Directive 137) -->
                <td v-else colspan="12" class="text-center">
                  <div class="no-data-hint pa-2">
                    <v-icon size="small" color="grey" class="mr-1">mdi-pencil-plus-outline</v-icon>
                    <span class="text-grey">Click row to enter quarterly data</span>
                  </div>
                </td>
                <td v-if="canEditData()" class="text-center">
                  <v-btn icon="mdi-pencil" variant="text" size="x-small" @click.stop="openEntryDialog(indicator)" />
                </td>
              </tr>
              <!-- Phase HK: Below-row stacked panel — remarks + narratives + MOV (Directives 135, 138, 141) -->
              <!-- Phase HL: Stacked panel click-to-edit (Directive 148) -->
              <tr v-if="anyNarrativeVisible && getIndicatorData(indicator.id)" class="narrative-stacked-row" :class="{ 'cursor-pointer': canEditData() }" @click="canEditData() && openEntryDialog(indicator)">
                <td :colspan="narrativeRowColspan" class="pa-0">
                  <div class="narrative-stacked-panel">
                    <div v-if="columnVisibility.score" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Score:</span>
                      <span class="narrative-stacked-text">
                        Q1: {{ getIndicatorData(indicator.id)?.score_q1 || '—' }} |
                        Q2: {{ getIndicatorData(indicator.id)?.score_q2 || '—' }} |
                        Q3: {{ getIndicatorData(indicator.id)?.score_q3 || '—' }} |
                        Q4: {{ getIndicatorData(indicator.id)?.score_q4 || '—' }}
                      </span>
                    </div>
                    <div v-if="columnVisibility.remarks" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Remarks:</span>
                      <span v-if="getIndicatorData(indicator.id)?.remarks" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.remarks }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <!-- XXX-F: Per-quarter Notes (Issue A) -->
                    <div v-if="columnVisibility.notes" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Notes:</span>
                      <span v-if="getIndicatorData(indicator.id)?.remarks_q1 || getIndicatorData(indicator.id)?.remarks_q2 || getIndicatorData(indicator.id)?.remarks_q3 || getIndicatorData(indicator.id)?.remarks_q4" class="narrative-stacked-text">
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q1">Q1: {{ getIndicatorData(indicator.id)?.remarks_q1 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q2">Q2: {{ getIndicatorData(indicator.id)?.remarks_q2 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q3">Q3: {{ getIndicatorData(indicator.id)?.remarks_q3 }}<br></template>
                        <template v-if="getIndicatorData(indicator.id)?.remarks_q4">Q4: {{ getIndicatorData(indicator.id)?.remarks_q4 }}</template>
                      </span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.catch_up_plans" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Catch-Up Plans:</span>
                      <span v-if="getIndicatorData(indicator.id)?.catch_up_plan" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.catch_up_plan }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.facilitating_factors" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Facilitating Factors:</span>
                      <span v-if="getIndicatorData(indicator.id)?.facilitating_factors" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.facilitating_factors }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <div v-if="columnVisibility.ways_forward" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">Ways Forward:</span>
                      <span v-if="getIndicatorData(indicator.id)?.ways_forward" class="narrative-stacked-text">{{ getIndicatorData(indicator.id)?.ways_forward }}</span>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                    <!-- Phase HL: Type-aware MOV display (Directive 147) -->
                    <div v-if="columnVisibility.mov" class="narrative-stacked-item">
                      <span class="narrative-stacked-label">MOV:</span>
                      <template v-if="getIndicatorData(indicator.id)?.mov">
                        <a v-if="parseMov(getIndicatorData(indicator.id).mov).type === 'link'"
                           :href="parseMov(getIndicatorData(indicator.id).mov).value"
                           target="_blank" rel="noopener" class="narrative-stacked-text text-primary"
                           @click.stop>
                          <v-icon size="x-small" class="mr-1">mdi-open-in-new</v-icon>
                          {{ parseMov(getIndicatorData(indicator.id).mov).value }}
                        </a>
                        <span v-else-if="parseMov(getIndicatorData(indicator.id).mov).type === 'file'" class="narrative-stacked-text">
                          <v-icon size="x-small" class="mr-1">mdi-file-check</v-icon>
                          {{ parseMov(getIndicatorData(indicator.id).mov).metadata?.filename || parseMov(getIndicatorData(indicator.id).mov).value }}
                        </span>
                        <span v-else class="narrative-stacked-text">{{ parseMov(getIndicatorData(indicator.id).mov).value }}</span>
                      </template>
                      <span v-else class="text-grey text-caption">—</span>
                    </div>
                  </div>
                </td>
              </tr>
              </template>
            </tbody>
          </v-table>

          <!-- Phase FJ-3: Prefill availability notice for output indicators -->
          <div v-if="outputIndicators.some(ind => hasPrefillAvailable(ind.id))" class="text-caption text-grey px-4 pb-2">
            <v-icon size="x-small" color="info" class="mr-1">mdi-information-outline</v-icon>
            {{ PRIOR_QUARTER_MAP[selectedQuarter] }} data available for some indicators — click a row to pre-fill {{ selectedQuarter }} values.
          </div>
        </div>

        <v-card-text v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-chart-box</v-icon>
          <div class="text-h6 text-grey-darken-1">No Output Indicators</div>
          <div class="text-body-2 text-grey mt-1">
            Output indicators for {{ currentPillar.name }} have not been configured in the taxonomy.
          </div>
        </v-card-text>
      </v-card>
    </template>

    <!-- Phase DW-C: Fiscal Year Creation Dialog moved to main university-operations page -->

    <!-- Phase DU-A: Quarterly Data Entry Dialog — Vertical Quarter-Row Table -->
    <!-- Phase HD: persistent removed — enables outside-click + ESC close (Directive 384) -->
    <v-dialog v-model="entryDialog" max-width="900">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-table-edit</v-icon>
          Enter Quarterly Data
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="entryDialog = false" />
        </v-card-title>

        <v-divider />

        <!-- Phase GOV-C: Advisory when editing an unlocked post-publication report -->
        <v-alert
          v-if="currentQuarterlyReport?.unlocked_by"
          type="warning"
          variant="tonal"
          class="mx-4 mt-4"
          density="compact"
        >
          <div class="d-flex align-center ga-2">
            <v-icon size="small">mdi-alert-outline</v-icon>
            <span class="text-body-2">
              This quarterly report has already been published and may have been submitted to external agencies such as DBM.
              Any modification will require re-validation and re-submission for review.
            </span>
          </div>
        </v-alert>

        <v-card-text class="pa-4">
          <!-- Indicator Info -->
          <v-alert type="info" variant="tonal" class="mb-4" density="compact">
            <div class="font-weight-medium">{{ selectedIndicator?.indicator_name }}</div>
            <div class="text-caption">
              Unit Type: {{ selectedIndicator?.unit_type }} | UACS: {{ selectedIndicator?.uacs_code }} | FY {{ selectedFiscalYear }}
            </div>
          </v-alert>

          <!-- Phase FJ-2: Advisory notice when prior-quarter prefill occurred -->
          <v-alert v-if="wasPrefilled" type="info" variant="tonal" class="mb-4" density="compact" closable>
            <v-icon start size="small">mdi-content-copy</v-icon>
            All values pre-filled from <strong>{{ prefillSourceQ }}</strong> record — edit freely. This will create a new {{ selectedQuarter }} record.
          </v-alert>

          <!-- Phase SSS-B: Instructional banner — unit-type-aware guidance -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
            closable
            icon="mdi-information-outline"
          >
            {{ entryBannerText }}
          </v-alert>

          <!-- Phase UUU: Vertical tabular data entry — Quarter / Target / Actual / Acc. % -->
          <!-- Score column removed: fraction is now native to Target/Actual dual-entry inputs -->
          <!-- Phase YYY-A: overflow-x wrapper so widened columns scroll on narrow viewports -->
          <div style="overflow-x: auto">
          <v-table density="compact" class="mb-4">
            <thead>
              <tr class="bg-primary text-white">
                <th class="q-label-cell">Quarter</th>
                <th class="text-center">Target</th>
                <th class="text-center">Actual</th>
                <th class="text-center acc-pct-col">Acc. %</th>
                <th class="text-center">Notes (Optional)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Q1 -->
              <tr>
                <td class="q-label-cell">
                  <v-chip size="small" color="blue" variant="tonal" class="font-weight-bold">Q1</v-chip>
                </td>
                <!-- Target Q1 -->
                <td class="du-input-cell du-input-cell--target">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.target_q1" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.target_str_q1" placeholder="90 or 200/200"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.target_str_q1 && parsePctInput(entryForm.target_str_q1).error)" />
                    <div v-if="parsePctInput(entryForm.target_str_q1).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.target_str_q1).display }}</span>
                      <span v-if="parsePctInput(entryForm.target_str_q1).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.target_str_q1).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.target[0]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.target[0] }})</span>
                    </div>
                    <div v-if="entryForm.target_str_q1 && parsePctInput(entryForm.target_str_q1).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.target_str_q1).error }}</div>
                  </template>
                </td>
                <!-- Actual Q1 -->
                <td class="du-input-cell du-input-cell--actual">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.accomplishment_q1" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.actual_str_q1" placeholder="75 or 286/268"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.actual_str_q1 && parsePctInput(entryForm.actual_str_q1).error)" />
                    <div v-if="parsePctInput(entryForm.actual_str_q1).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.actual_str_q1).display }}</span>
                      <span v-if="parsePctInput(entryForm.actual_str_q1).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.actual_str_q1).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.actual[0]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.actual[0] }})</span>
                    </div>
                    <div v-if="entryForm.actual_str_q1 && parsePctInput(entryForm.actual_str_q1).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.actual_str_q1).error }}</div>
                  </template>
                </td>
                <td class="text-center acc-pct-col">
                  <v-chip v-if="quarterlyComputedPct[0] !== null" size="x-small"
                    :color="quarterlyComputedPct[0]! >= 100 ? 'success' : quarterlyComputedPct[0]! >= 80 ? 'warning' : 'error'"
                    variant="tonal">
                    {{ quarterlyComputedPct[0]!.toFixed(1) }}%
                  </v-chip>
                  <span v-else class="text-grey text-caption">—</span>
                </td>
                <!-- XXX-F: Notes Q1 (optional, no calculation impact) -->
                <td class="du-input-cell du-input-cell--notes">
                  <v-textarea v-model="entryForm.remarks_str_q1" placeholder="Optional note"
                    density="compact" variant="outlined" hide-details rows="2" auto-grow />
                </td>
              </tr>
              <!-- Q2 -->
              <tr>
                <td class="q-label-cell">
                  <v-chip size="small" color="teal" variant="tonal" class="font-weight-bold">Q2</v-chip>
                </td>
                <!-- Target Q2 -->
                <td class="du-input-cell du-input-cell--target">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.target_q2" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.target_str_q2" placeholder="90 or 200/200"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.target_str_q2 && parsePctInput(entryForm.target_str_q2).error)" />
                    <div v-if="parsePctInput(entryForm.target_str_q2).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.target_str_q2).display }}</span>
                      <span v-if="parsePctInput(entryForm.target_str_q2).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.target_str_q2).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.target[1]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.target[1] }})</span>
                    </div>
                    <div v-if="entryForm.target_str_q2 && parsePctInput(entryForm.target_str_q2).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.target_str_q2).error }}</div>
                  </template>
                </td>
                <!-- Actual Q2 -->
                <td class="du-input-cell du-input-cell--actual">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.accomplishment_q2" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.actual_str_q2" placeholder="75 or 286/268"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.actual_str_q2 && parsePctInput(entryForm.actual_str_q2).error)" />
                    <div v-if="parsePctInput(entryForm.actual_str_q2).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.actual_str_q2).display }}</span>
                      <span v-if="parsePctInput(entryForm.actual_str_q2).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.actual_str_q2).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.actual[1]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.actual[1] }})</span>
                    </div>
                    <div v-if="entryForm.actual_str_q2 && parsePctInput(entryForm.actual_str_q2).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.actual_str_q2).error }}</div>
                  </template>
                </td>
                <td class="text-center acc-pct-col">
                  <v-chip v-if="quarterlyComputedPct[1] !== null" size="x-small"
                    :color="quarterlyComputedPct[1]! >= 100 ? 'success' : quarterlyComputedPct[1]! >= 80 ? 'warning' : 'error'"
                    variant="tonal">
                    {{ quarterlyComputedPct[1]!.toFixed(1) }}%
                  </v-chip>
                  <span v-else class="text-grey text-caption">—</span>
                </td>
                <!-- XXX-F: Notes Q2 (optional, no calculation impact) -->
                <td class="du-input-cell du-input-cell--notes">
                  <v-textarea v-model="entryForm.remarks_str_q2" placeholder="Optional note"
                    density="compact" variant="outlined" hide-details rows="2" auto-grow />
                </td>
              </tr>
              <!-- Q3 -->
              <tr>
                <td class="q-label-cell">
                  <v-chip size="small" color="orange" variant="tonal" class="font-weight-bold">Q3</v-chip>
                </td>
                <!-- Target Q3 -->
                <td class="du-input-cell du-input-cell--target">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.target_q3" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.target_str_q3" placeholder="90 or 200/200"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.target_str_q3 && parsePctInput(entryForm.target_str_q3).error)" />
                    <div v-if="parsePctInput(entryForm.target_str_q3).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.target_str_q3).display }}</span>
                      <span v-if="parsePctInput(entryForm.target_str_q3).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.target_str_q3).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.target[2]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.target[2] }})</span>
                    </div>
                    <div v-if="entryForm.target_str_q3 && parsePctInput(entryForm.target_str_q3).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.target_str_q3).error }}</div>
                  </template>
                </td>
                <!-- Actual Q3 -->
                <td class="du-input-cell du-input-cell--actual">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.accomplishment_q3" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.actual_str_q3" placeholder="75 or 286/268"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.actual_str_q3 && parsePctInput(entryForm.actual_str_q3).error)" />
                    <div v-if="parsePctInput(entryForm.actual_str_q3).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.actual_str_q3).display }}</span>
                      <span v-if="parsePctInput(entryForm.actual_str_q3).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.actual_str_q3).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.actual[2]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.actual[2] }})</span>
                    </div>
                    <div v-if="entryForm.actual_str_q3 && parsePctInput(entryForm.actual_str_q3).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.actual_str_q3).error }}</div>
                  </template>
                </td>
                <td class="text-center acc-pct-col">
                  <v-chip v-if="quarterlyComputedPct[2] !== null" size="x-small"
                    :color="quarterlyComputedPct[2]! >= 100 ? 'success' : quarterlyComputedPct[2]! >= 80 ? 'warning' : 'error'"
                    variant="tonal">
                    {{ quarterlyComputedPct[2]!.toFixed(1) }}%
                  </v-chip>
                  <span v-else class="text-grey text-caption">—</span>
                </td>
                <!-- XXX-F: Notes Q3 (optional, no calculation impact) -->
                <td class="du-input-cell du-input-cell--notes">
                  <v-textarea v-model="entryForm.remarks_str_q3" placeholder="Optional note"
                    density="compact" variant="outlined" hide-details rows="2" auto-grow />
                </td>
              </tr>
              <!-- Q4 -->
              <tr>
                <td class="q-label-cell">
                  <v-chip size="small" color="deep-purple" variant="tonal" class="font-weight-bold">Q4</v-chip>
                </td>
                <!-- Target Q4 -->
                <td class="du-input-cell du-input-cell--target">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.target_q4" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.target_str_q4" placeholder="90 or 200/200"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.target_str_q4 && parsePctInput(entryForm.target_str_q4).error)" />
                    <div v-if="parsePctInput(entryForm.target_str_q4).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.target_str_q4).display }}</span>
                      <span v-if="parsePctInput(entryForm.target_str_q4).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.target_str_q4).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.target[3]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.target[3] }})</span>
                    </div>
                    <div v-if="entryForm.target_str_q4 && parsePctInput(entryForm.target_str_q4).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.target_str_q4).error }}</div>
                  </template>
                </td>
                <!-- Actual Q4 -->
                <td class="du-input-cell du-input-cell--actual">
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field v-model.number="entryForm.accomplishment_q4" type="number" step="0.01" min="0"
                      density="compact" variant="outlined" hide-details />
                  </template>
                  <template v-else>
                    <v-text-field v-model="entryForm.actual_str_q4" placeholder="75 or 286/268"
                      density="compact" variant="outlined" hide-details
                      :error="!!(entryForm.actual_str_q4 && parsePctInput(entryForm.actual_str_q4).error)" />
                    <div v-if="parsePctInput(entryForm.actual_str_q4).computed !== null" class="text-caption mt-1">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.actual_str_q4).display }}</span>
                      <span v-if="parsePctInput(entryForm.actual_str_q4).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.actual_str_q4).fractionText }}</span>
                      <span v-else-if="dialogFractionFallback.actual[3]" class="text-grey-darken-1 ml-1 font-italic">({{ dialogFractionFallback.actual[3] }})</span>
                    </div>
                    <div v-if="entryForm.actual_str_q4 && parsePctInput(entryForm.actual_str_q4).error" class="text-caption text-error mt-1">{{ parsePctInput(entryForm.actual_str_q4).error }}</div>
                  </template>
                </td>
                <td class="text-center acc-pct-col">
                  <v-chip v-if="quarterlyComputedPct[3] !== null" size="x-small"
                    :color="quarterlyComputedPct[3]! >= 100 ? 'success' : quarterlyComputedPct[3]! >= 80 ? 'warning' : 'error'"
                    variant="tonal">
                    {{ quarterlyComputedPct[3]!.toFixed(1) }}%
                  </v-chip>
                  <span v-else class="text-grey text-caption">—</span>
                </td>
                <!-- XXX-F: Notes Q4 (optional, no calculation impact) -->
                <td class="du-input-cell du-input-cell--notes">
                  <v-textarea v-model="entryForm.remarks_str_q4" placeholder="Optional note"
                    density="compact" variant="outlined" hide-details rows="2" auto-grow />
                </td>
              </tr>
            </tbody>
          </v-table>
          </div>

          <!-- Phase HB: Annual Performance Summary (Directives 375–380) — Moved before remarks (HQ-8, Directive 180) -->
          <v-card variant="outlined" class="bg-grey-lighten-4 mb-4">
            <v-card-text class="py-2">
              <!-- HB-1: Renamed header (Directive 375) -->
              <div class="text-subtitle-2 mb-2">
                <v-icon start size="small">mdi-chart-bar</v-icon>
                Annual Performance Summary
              </div>

              <!-- HB-2: Group 1 — Auto-Calculated Values (Directive 376) -->
              <div class="text-caption text-medium-emphasis font-weight-medium mb-1">Auto-Calculated Values</div>
              <div class="d-flex ga-3 flex-wrap mb-2">
                <v-chip variant="tonal" size="small">
                  Total Target: {{ formatNumber(computedPreview.totalTarget) }}
                  <!-- AAAC-C: fraction-aggregate caption (ΣN/ΣD) -->
                  <span v-if="computedPreview.totalTargetFraction" class="ml-1 text-grey-darken-1">({{ computedPreview.totalTargetFraction }})</span>
                </v-chip>
                <v-chip variant="tonal" size="small">
                  Total Actual: {{ formatNumber(computedPreview.totalActual) }}
                  <span v-if="computedPreview.totalActualFraction" class="ml-1 text-grey-darken-1">({{ computedPreview.totalActualFraction }})</span>
                </v-chip>
                <v-chip
                  :color="getVarianceColor(computedPreview.variance)"
                  variant="tonal"
                  size="small"
                >
                  Variance: {{ computedPreview.variance !== null ? formatNumber(computedPreview.variance) : '—' }}
                </v-chip>
                <v-chip
                  :color="getRateColor(computedPreview.rate)"
                  variant="tonal"
                  size="small"
                >
                  Rate: {{ computedPreview.rate !== null ? formatPercent(computedPreview.rate) : '—' }}
                </v-chip>
                <v-chip
                  v-if="computedPreview.rate !== null && computedPreview.rate > 100"
                  color="success"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start size="x-small">mdi-trophy-outline</v-icon>
                  Overachievement
                </v-chip>
              </div>

              <v-divider class="my-3" />

              <!-- HB-2: Group 2 — Override Values (Directive 376) -->
              <div class="text-caption text-medium-emphasis font-weight-medium mb-1">
                Override Values
                <span class="font-weight-regular ml-1">(Optional — use when official BAR1 values differ from system calculations)</span>
              </div>

              <!-- HB-3: 2-column grid, no max-width (Directives 377–379) -->
              <v-row dense class="mt-1">
                <v-col cols="12" sm="6">
                  <!-- XXX-G: PERCENTAGE indicators support fraction entry for override total target -->
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field
                      v-model.number="entryForm.override_total_target"
                      label="Override Total Target"
                      type="number"
                      step="0.01"
                      :min="0"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hint="Replaces quarterly sum as base for variance/rate."
                      persistent-hint
                      class="mb-3"
                      @click:clear="entryForm.override_total_target = null"
                    />
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="entryForm.override_total_target_str"
                      label="Override Total Target"
                      placeholder="90 or 200/200"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hint="Replaces quarterly sum as base for variance/rate. Enter % or N/D fraction."
                      persistent-hint
                      class="mb-3"
                      :error="!!(entryForm.override_total_target_str && parsePctInput(entryForm.override_total_target_str).error)"
                      @click:clear="entryForm.override_total_target_str = ''"
                    />
                    <div v-if="parsePctInput(entryForm.override_total_target_str).computed !== null" class="text-caption mt-1 mb-2">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.override_total_target_str).display }}</span>
                      <span v-if="parsePctInput(entryForm.override_total_target_str).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.override_total_target_str).fractionText }}</span>
                    </div>
                    <div v-if="entryForm.override_total_target_str && parsePctInput(entryForm.override_total_target_str).error" class="text-caption text-error mt-1 mb-2">{{ parsePctInput(entryForm.override_total_target_str).error }}</div>
                  </template>
                  <v-text-field
                    v-model.number="entryForm.override_rate"
                    label="Override Rate (%)"
                    type="number"
                    :min="0"
                    :max="9999.99"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details="auto"
                    hint="Overrides computed achievement rate."
                    persistent-hint
                    @click:clear="entryForm.override_rate = null"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <!-- XXX-G: PERCENTAGE indicators support fraction entry for override total actual -->
                  <template v-if="selectedIndicator?.unit_type !== 'PERCENTAGE'">
                    <v-text-field
                      v-model.number="entryForm.override_total_actual"
                      label="Override Total Actual"
                      type="number"
                      step="0.01"
                      :min="0"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hint="Replaces quarterly sum as base for variance/rate."
                      persistent-hint
                      class="mb-3"
                      @click:clear="entryForm.override_total_actual = null"
                    />
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="entryForm.override_total_actual_str"
                      label="Override Total Actual"
                      placeholder="75 or 286/268"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hint="Replaces quarterly sum as base for variance/rate. Enter % or N/D fraction."
                      persistent-hint
                      class="mb-3"
                      :error="!!(entryForm.override_total_actual_str && parsePctInput(entryForm.override_total_actual_str).error)"
                      @click:clear="entryForm.override_total_actual_str = ''"
                    />
                    <div v-if="parsePctInput(entryForm.override_total_actual_str).computed !== null" class="text-caption mt-1 mb-2">
                      <span class="font-weight-medium">{{ parsePctInput(entryForm.override_total_actual_str).display }}</span>
                      <span v-if="parsePctInput(entryForm.override_total_actual_str).fractionText" class="text-grey-darken-1 ml-1">{{ parsePctInput(entryForm.override_total_actual_str).fractionText }}</span>
                    </div>
                    <div v-if="entryForm.override_total_actual_str && parsePctInput(entryForm.override_total_actual_str).error" class="text-caption text-error mt-1 mb-2">{{ parsePctInput(entryForm.override_total_actual_str).error }}</div>
                  </template>
                  <v-text-field
                    v-model.number="entryForm.override_variance"
                    label="Override Variance"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details="auto"
                    hint="Overrides computed annual variance."
                    persistent-hint
                    @click:clear="entryForm.override_variance = null"
                  />
                </v-col>
              </v-row>

              <!-- HB-4: Active override badges — one per active field (Directive 380) -->
              <div
                v-if="entryForm.override_total_target != null || entryForm.override_total_actual != null || entryForm.override_rate != null || entryForm.override_variance != null"
                class="d-flex ga-2 flex-wrap mt-3"
              >
                <v-chip v-if="entryForm.override_total_target != null && entryForm.override_total_target !== ''"
                        color="warning" variant="tonal" size="small">
                  <v-icon start size="x-small">mdi-pencil-circle</v-icon>
                  Target Override
                </v-chip>
                <v-chip v-if="entryForm.override_total_actual != null && entryForm.override_total_actual !== ''"
                        color="warning" variant="tonal" size="small">
                  <v-icon start size="x-small">mdi-pencil-circle</v-icon>
                  Actual Override
                </v-chip>
                <v-chip v-if="entryForm.override_rate != null && entryForm.override_rate !== ''"
                        color="warning" variant="tonal" size="small">
                  <v-icon start size="x-small">mdi-pencil-circle</v-icon>
                  Rate Override: {{ entryForm.override_rate }}%
                </v-chip>
                <v-chip v-if="entryForm.override_variance != null && entryForm.override_variance !== ''"
                        color="warning" variant="tonal" size="small">
                  <v-icon start size="x-small">mdi-pencil-circle</v-icon>
                  Variance Override
                </v-chip>
              </div>

            </v-card-text>
          </v-card>

          <!-- Remarks -->
          <v-textarea
            v-model="entryForm.remarks"
            label="Remarks"
            rows="2"
            variant="outlined"
            density="compact"
            class="mb-3"
          />

          <!-- Phase HE: APR/UPR Narrative Fields (Directive 386) -->
          <v-divider class="my-2" />
          <div class="text-subtitle-2 text-grey-darken-1 mb-2 mt-1">
            <v-icon start size="small" color="grey">mdi-text-box-outline</v-icon>
            Narrative Fields (APR/UPR)
          </div>
          <v-textarea
            v-model="entryForm.catch_up_plan"
            label="Catch-Up Plans (Not Met Targets)"
            variant="outlined"
            density="compact"
            rows="3"
            auto-grow
            class="mb-2 narrative-textarea"
            hint="Remediation actions planned for indicators that missed their targets"
            persistent-hint
          />
          <v-textarea
            v-model="entryForm.facilitating_factors"
            label="Facilitating Factors (Met Targets)"
            variant="outlined"
            density="compact"
            rows="3"
            auto-grow
            class="mb-2 narrative-textarea"
            hint="Conditions or resources that enabled achievement of targets"
            persistent-hint
          />
          <v-textarea
            v-model="entryForm.ways_forward"
            label="Ways Forward"
            variant="outlined"
            density="compact"
            rows="3"
            auto-grow
            class="mb-3 narrative-textarea"
            hint="Recommended next steps and improvements for the next period"
            persistent-hint
          />
          <!-- Phase HL: MOV type-selector UI (Directive 146) -->
          <div class="mb-3">
            <div class="text-subtitle-2 mb-2">Means of Verification (MOV)</div>
            <v-btn-toggle v-model="movType" mandatory density="compact" color="primary" class="mb-2">
              <v-btn value="text" size="small"><v-icon start size="small">mdi-text</v-icon>Text</v-btn>
              <v-btn value="link" size="small"><v-icon start size="small">mdi-link</v-icon>Link</v-btn>
              <v-btn value="file" size="small"><v-icon start size="small">mdi-file-upload</v-icon>File</v-btn>
            </v-btn-toggle>

            <v-textarea
              v-if="movType === 'text'"
              v-model="movValue"
              label="MOV Description"
              variant="outlined"
              density="compact"
              rows="2"
              auto-grow
              hint="Evidence or documentation supporting accomplishment claims"
              persistent-hint
            />
            <v-text-field
              v-else-if="movType === 'link'"
              v-model="movValue"
              label="MOV URL"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-link"
              hint="Paste a link to the supporting document or resource"
              persistent-hint
            />
            <div v-else-if="movType === 'file'">
              <input ref="movFileInputRef" type="file" style="display:none" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" @change="handleMovFileUpload" />
              <v-btn variant="outlined" size="small" :loading="movUploading" @click="movFileInputRef?.click()">
                <v-icon start size="small">mdi-upload</v-icon>
                {{ movFileMetadata ? 'Replace File' : 'Upload File' }}
              </v-btn>
              <div v-if="movFileMetadata" class="mt-2 text-body-2">
                <v-icon size="small" class="mr-1">mdi-file-check</v-icon>
                {{ movFileMetadata.filename }}
                <span class="text-grey ml-1">({{ (movFileMetadata.size / 1024).toFixed(1) }} KB)</span>
              </div>
              <div v-else-if="movValue" class="mt-2 text-body-2">
                <v-icon size="small" class="mr-1">mdi-file</v-icon>
                {{ movValue }}
              </div>
            </div>
          </div>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="entryDialog = false" :disabled="movUploading">Cancel</v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            :disabled="movUploading"
            @click="saveQuarterlyData"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Phase GOV-UI: Published Report Governance Warning Dialog (Admin) -->
    <v-dialog v-model="publishedEditWarningDialog" max-width="520" persistent>
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="warning">mdi-shield-alert-outline</v-icon>
          Published Report — Governance Warning
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-3">
            This quarterly report has already been published and may have been submitted
            to external agencies such as DBM.
          </p>
          <p class="text-body-1 font-weight-medium">
            Updating this report will automatically revert it to Draft status,
            requiring re-submission for review.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="publishedEditWarningDialog = false; pendingEditIndicator = null">
            Cancel
          </v-btn>
          <v-btn color="warning" variant="flat" @click="confirmPublishedEdit">
            Proceed with Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Phase GOV-UI: Unlock Request Dialog (Non-Admin) -->
    <v-dialog v-model="unlockRequestDialog" max-width="520" persistent>
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="primary">mdi-lock-open-variant-outline</v-icon>
          Request Update Authorization
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            Provide a reason for requesting modification of this published report.
            Your request will be reviewed by an administrator.
          </p>
          <v-textarea
            v-model="unlockRequestReason"
            label="Reason for update request"
            rows="3"
            variant="outlined"
            :rules="[(v: string) => !!v?.trim() || 'Reason is required']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="unlockRequestDialog = false; unlockRequestReason = ''">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="unlockRequestLoading"
            :disabled="!unlockRequestReason.trim()"
            @click="submitUnlockRequest"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Phase DE-E: Responsive table enhancements */
.responsive-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.v-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #003300 !important;
  color: white !important;
}

/* Phase DS-D: Multiline indicator text with preserved line breaks per BAR1 standard
 * Indicators must display complete descriptions without truncation
 * Text wrapping is enabled to accommodate long indicator names with sub-items
 * white-space: pre-line preserves explicit newlines while collapsing other whitespace
 */
.indicator-text {
  white-space: pre-line;  /* Preserve newlines, wrap normally */
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
  max-width: none;
  /* Phase EE-F: Line-clamp to 3 lines — full text readable via tooltip on hover */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Phase DS-B: Fixed width unit type chip for consistent alignment */
.unit-type-chip {
  min-width: 52px;
  max-width: 52px;
  justify-content: center;
}

.unit-type-chip .v-chip__content {
  justify-content: center;
  gap: 2px;
}

/* Phase DS-E: Responsive indicator text sizing with preserved line breaks */
@media (max-width: 960px) {
  .indicator-text {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .unit-type-chip {
    min-width: 48px;
    max-width: 48px;
  }
}

@media (max-width: 600px) {
  .indicator-text {
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .unit-type-chip {
    min-width: 44px;
    max-width: 44px;
    font-size: 0.65rem;
  }
}

/* Phase DR-F: Flexible indicator column for full BAR1 text display */
/* Phase HA: Reduced from 320px → 220px to eliminate horizontal scroll at 1366px sidebar-open (Directive 365) */
.indicator-column {
  min-width: 220px;
  width: auto;
}

.indicator-cell {
  min-width: 220px;  /* Phase HA: Reduced from 320px (Directive 365) */
  padding: 14px 16px !important;  /* Increased vertical padding */
  vertical-align: top;
}

/* Phase DR-A: Consistent row vertical alignment for wrapped indicator text */
/* All non-indicator cells align to top to match indicator cell behavior */
.v-table th:not(.indicator-column),
.v-table td:not(.indicator-cell) {
  white-space: nowrap;
  min-width: auto;
  vertical-align: top;  /* Match indicator cell alignment */
}

/* Ensure consistent cell padding across all columns */
.v-table tbody tr td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

/* Phase DR-B: Fixed column widths for data consistency */
.quarter-column {
  width: 90px;
  min-width: 90px;
  max-width: 90px;
  text-align: center;
  vertical-align: top;
}

.variance-column {
  width: 100px;
  min-width: 100px;
  text-align: right;
  vertical-align: top;
}

/* Phase ZZZ-C / AAAB-A: Variance/Rate chip — middle value, readable but less dominant */
.metric-chip {
  font-size: 0.8125rem !important;
  font-weight: 500;
  height: 22px;
}

/* Phase GZ: Total Target + Total Actual columns (Directive 361) */
.total-column {
  min-width: 90px;
  white-space: nowrap;
}

/* Phase HJ: Narrative below-row stacked sections (Directive 128) */
.narrative-stacked-row td {
  background-color: #f9f9f9;
  border-top: none;
}
.narrative-stacked-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 16px 10px;
}
.narrative-stacked-item {
  flex: 1 1 280px;
  min-width: 200px;
}
.narrative-stacked-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #616161;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}
.narrative-stacked-text {
  font-size: 0.8rem;
  color: #212121;
  white-space: pre-line;
}

/* Phase HF: Narrative textarea resize (Directive 102) */
.narrative-textarea :deep(textarea) {
  resize: vertical;
  min-height: 72px;
}

.rate-column {
  width: 100px;
  min-width: 100px;
  text-align: right;
  vertical-align: top;
}

.action-column {
  width: 60px;
  min-width: 60px;
  text-align: center;
  vertical-align: top;
}

/* Computed fields shading */
.computed-field {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Mobile-friendly pillar header */
@media (max-width: 600px) {
  .pillar-header-content {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .pillar-header-content .text-right {
    text-align: left !important;
    margin-top: 8px;
  }
}

/* Mobile table improvements */
@media (max-width: 768px) {
  .v-table td,
  .v-table th {
    padding: 6px 8px !important;
    font-size: 0.8rem;
  }

  .v-table .text-caption {
    font-size: 0.7rem !important;
  }

  /* Phase ZZZ-C / AAAB-A: Variance/Rate chips — tuned down on mobile */
  .metric-chip {
    font-size: 0.75rem !important;
    height: 20px;
  }
}

/* Phase DH: UACS code styling */
.uacs-code {
  cursor: help;
  border-bottom: 1px dotted #9e9e9e;
  display: inline-block;
}

/* Phase DH: No data hint styling */
.no-data-hint {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.no-data-hint:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

/* Phase DR-C: Tab label styling for full program names */
.pillar-tabs .pillar-tab {
  text-transform: none;  /* Preserve original case */
  letter-spacing: normal;
  font-weight: 500;
}

/* Mobile: Adjust tab text for narrower viewports */
@media (max-width: 960px) {
  .pillar-tabs .pillar-tab {
    font-size: 0.8rem;
    padding: 0 12px;
    min-width: auto;
  }
}

@media (max-width: 600px) {
  .pillar-tabs .pillar-tab {
    font-size: 0.75rem;
    padding: 0 8px;
  }

  .pillar-tabs .pillar-tab .v-icon {
    margin-right: 4px;
    font-size: 16px;
  }
}

/* Phase DU-B: Expanded ALL-mode quarterly sub-columns */
/* Phase HA: Reduced from 68px → 56px to eliminate table overflow (Directive 366) */
.qgroup-header {
  font-weight: 600;
  font-size: 0.8rem;
}
.qsub-col {
  min-width: 56px;
  width: 56px;
  font-size: 0.75rem;
}
.qsub-col-score {
  min-width: 80px;
  width: 80px;
  font-size: 0.75rem;
}
.qsub-cell {
  min-width: 56px;
  font-size: 0.8rem;
}
.qsub-cell-score {
  min-width: 80px;
  font-size: 0.8rem;
}
.border-right-q {
  border-right: 1px solid rgba(0,0,0,0.1) !important;
}

/* Phase DU-A: Dialog vertical table */
.q-label-cell {
  width: 60px;
  text-align: center;
  vertical-align: middle;
}
.du-input-cell {
  padding: 8px 6px !important;
  vertical-align: middle;
}

/* Phase YYY-A: widen Target/Actual/Notes input cells in the Quarterly Entry Dialog */
.du-input-cell--target,
.du-input-cell--actual {
  min-width: 220px;
}

.du-input-cell--notes {
  min-width: 180px;
}

.acc-pct-col {
  width: 72px;
  min-width: 72px;
  vertical-align: middle;
}

/* Phase DW-E: Quarter highlight classes */
.q-active-cell {
  background-color: rgba(var(--v-theme-primary), 0.06) !important;
  font-weight: 600;
}
.q-active-group {
  background-color: rgba(var(--v-theme-primary), 0.10) !important;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
.q-dimmed-cell {
  opacity: 0.7;   /* Phase DX-A: raised from 0.45 to prevent "disabled" misperception */
}
</style>
