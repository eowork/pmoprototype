/**
 * ZY-1: useAttachmentFilter — shared multi-dimensional filter for the COI
 * attachment hub. Narrows documents and gallery rows across all hub sections
 * simultaneously. AND-evaluates every active dimension.
 */

export interface FilterableDoc {
  fileName?: string
  description?: string
  documentType?: string
  mimeType?: string
  createdAt?: string
  lifecycleStatus?: string
}

export interface FilterableGallery {
  caption?: string
  category?: string
  imageTakenDate?: string
  createdAt?: string
}

export function useAttachmentFilter() {
  const searchText = ref('')
  const filterType = ref<string | null>(null)
  const filterSection = ref<string | null>(null)
  const filterDateFrom = ref<string>('')
  const filterDateTo = ref<string>('')
  const filterStatus = ref<string | null>(null)

  function textMatches(...fields: (string | undefined)[]): boolean {
    if (!searchText.value) return true
    const q = searchText.value.toLowerCase()
    return fields.some((f) => (f ?? '').toLowerCase().includes(q))
  }

  function dateInRange(iso?: string): boolean {
    if (!filterDateFrom.value && !filterDateTo.value) return true
    if (!iso) return false
    const d = iso.slice(0, 10)
    if (filterDateFrom.value && d < filterDateFrom.value) return false
    if (filterDateTo.value && d > filterDateTo.value) return false
    return true
  }

  function matchesDoc(doc: FilterableDoc): boolean {
    if (!textMatches(doc.fileName, doc.description, doc.documentType)) return false
    if (filterType.value && doc.documentType !== filterType.value) return false
    if (filterStatus.value && doc.lifecycleStatus !== filterStatus.value) return false
    if (!dateInRange(doc.createdAt)) return false
    return true
  }

  function matchesGallery(img: FilterableGallery): boolean {
    if (!textMatches(img.caption, img.category)) return false
    if (!dateInRange(img.imageTakenDate ?? img.createdAt)) return false
    return true
  }

  const activeCount = computed(() => {
    let n = 0
    if (searchText.value) n++
    if (filterType.value) n++
    if (filterSection.value) n++
    if (filterDateFrom.value) n++
    if (filterDateTo.value) n++
    if (filterStatus.value) n++
    return n
  })

  function reset() {
    searchText.value = ''
    filterType.value = null
    filterSection.value = null
    filterDateFrom.value = ''
    filterDateTo.value = ''
    filterStatus.value = null
  }

  return {
    searchText,
    filterType,
    filterSection,
    filterDateFrom,
    filterDateTo,
    filterStatus,
    matchesDoc,
    matchesGallery,
    activeCount,
    reset,
  }
}
