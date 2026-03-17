import { defineStore } from 'pinia'

/**
 * Phase DW-A: Fiscal Year Store
 *
 * Centralized state management for fiscal year selection across
 * all University Operations modules (Physical, Financial, etc.)
 *
 * Features:
 * - Single source of truth for fiscal year state
 * - URL query param synchronization
 * - Centralized fiscal year creation
 * - Fallback to current year if invalid
 */
export const useFiscalYearStore = defineStore('fiscalYear', () => {
  const api = useApi()
  const router = useRouter()
  const route = useRoute()

  // State
  const selectedFiscalYear = ref<number>(new Date().getFullYear())
  const fiscalYearOptions = ref<number[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  // Initialize from URL query param on store creation
  function initializeFromRoute() {
    if (route.query.year) {
      const year = parseInt(route.query.year as string, 10)
      if (!isNaN(year) && year >= 2020 && year <= 2099) {
        selectedFiscalYear.value = year
      }
    }
  }

  // Fetch fiscal years from backend
  async function fetchFiscalYears(): Promise<void> {
    loading.value = true
    try {
      const fiscalYears = await api.get<any[]>('/api/university-operations/config/fiscal-years')
      fiscalYearOptions.value = (fiscalYears || []).map((fy: any) => fy.year).sort((a: number, b: number) => b - a)

      // If selected year is not in options, default to first available
      if (fiscalYearOptions.value.length > 0 && !fiscalYearOptions.value.includes(selectedFiscalYear.value)) {
        selectedFiscalYear.value = fiscalYearOptions.value[0]
      }

      initialized.value = true
    } catch (error) {
      console.error('[FiscalYearStore] Failed to fetch fiscal years:', error)
      // Fallback: Generate last 5 years
      const currentYear = new Date().getFullYear()
      fiscalYearOptions.value = Array.from({ length: 5 }, (_, i) => currentYear - i)
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  // Set selected fiscal year and update URL
  function setFiscalYear(year: number): void {
    if (year < 2020 || year > 2099) {
      console.warn('[FiscalYearStore] Invalid fiscal year:', year)
      return
    }

    selectedFiscalYear.value = year

    // Update URL query param (preserve other params)
    router.replace({
      query: { ...route.query, year: year.toString() }
    })
  }

  // Create new fiscal year
  async function createFiscalYear(year: number, label?: string): Promise<void> {
    if (year < 2020 || year > 2099) {
      throw new Error('Invalid fiscal year. Must be between 2020 and 2099.')
    }

    await api.post('/api/university-operations/config/fiscal-years', {
      year,
      label: label || `FY ${year}`,
    })

    // Refresh options
    await fetchFiscalYears()

    // Auto-select newly created year
    setFiscalYear(year)
  }

  // Initialize on first use (client-side only)
  if (import.meta.client) {
    initializeFromRoute()
  }

  return {
    // State
    selectedFiscalYear,
    fiscalYearOptions,
    loading,
    initialized,
    // Actions
    fetchFiscalYears,
    setFiscalYear,
    createFiscalYear,
    initializeFromRoute,
  }
})
