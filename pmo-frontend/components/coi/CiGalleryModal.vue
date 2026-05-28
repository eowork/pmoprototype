<script setup lang="ts">
// AAA-G: Full-screen gallery repository modal. Grid/list toggle, category filter,
// caption search, lightbox preview, per-image download/delete, drag-drop upload.

interface GalleryImage {
  id: string
  imageUrl: string
  caption?: string
  category?: string
  imageTakenDate?: string
  createdAt?: string
  uploadedByName?: string
}

interface Props {
  modelValue: boolean
  projectId?: string
  title?: string
  images: GalleryImage[]
  canUpload?: boolean
  canDelete?: boolean
  mode?: 'view' | 'edit' | 'staging'
}

const props = withDefaults(defineProps<Props>(), {
  projectId: '',
  title: 'Project Gallery',
  canUpload: false,
  canDelete: false,
  mode: 'view',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  upload: [file: File, caption: string, category: string, takenDate: string]
  delete: [id: string]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const CATEGORY_ITEMS = [
  { title: 'All categories', value: '' },
  { title: 'Profile', value: 'PROFILE' },
  { title: 'Before', value: 'BEFORE' },
  { title: 'In Progress', value: 'IN_PROGRESS' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Documentation', value: 'DOCUMENTATION' },
]
const CATEGORY_LABELS: Record<string, string> = {
  PROFILE: 'Profile', BEFORE: 'Before', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed', DOCUMENTATION: 'Documentation',
}

const viewMode = ref<'grid' | 'list'>('grid')
const filterCategory = ref('')
const searchText = ref('')

const filteredImages = computed(() => {
  let imgs = [...props.images]
  if (filterCategory.value) imgs = imgs.filter((i) => i.category === filterCategory.value)
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    imgs = imgs.filter((i) => (i.caption ?? '').toLowerCase().includes(q))
  }
  return imgs
})

function formatDate(d?: string) {
  if (!d) return '—'
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Lightbox
const lightboxOpen = ref(false)
const lightboxImage = ref<GalleryImage | null>(null)
function openLightbox(img: GalleryImage) {
  lightboxImage.value = img
  lightboxOpen.value = true
}

// Upload
const uploadFile = ref<File | null>(null)
const uploadCaption = ref('')
const uploadCategory = ref('IN_PROGRESS')
const uploadTakenDate = ref('')
const isDragOver = ref(false)
const showUpload = ref(false)

function submitUpload() {
  if (!uploadFile.value) return
  emit('upload', uploadFile.value, uploadCaption.value, uploadCategory.value, uploadTakenDate.value)
  uploadFile.value = null; uploadCaption.value = ''; uploadCategory.value = 'IN_PROGRESS'; uploadTakenDate.value = ''
}
function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
  for (const f of files) emit('upload', f, '', uploadCategory.value, '')
}
</script>

<template>
  <v-dialog v-model="open" max-width="1200" scrollable>
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-icon icon="mdi-image-multiple" class="ml-4" />
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-chip size="small" variant="tonal" class="mr-2">{{ filteredImages.length }} / {{ images.length }}</v-chip>
        <v-btn icon="mdi-close" @click="open = false" />
      </v-toolbar>

      <!-- Toolbar controls -->
      <div class="d-flex align-center ga-2 flex-wrap pa-3">
        <v-text-field
          v-model="searchText"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search captions…"
          variant="outlined" density="compact" hide-details single-line clearable
          clear-icon="mdi-close-circle-outline"
          style="min-width:220px;flex:1 1 220px"
        />
        <v-select
          v-model="filterCategory"
          :items="CATEGORY_ITEMS"
          label="Category"
          variant="outlined" density="compact" hide-details
          style="max-width:200px"
        />
        <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined">
          <v-btn value="grid" icon="mdi-view-grid" size="small" />
          <v-btn value="list" icon="mdi-view-list" size="small" />
        </v-btn-toggle>
        <v-btn v-if="canUpload" color="primary" variant="tonal" size="small" :prepend-icon="showUpload ? 'mdi-chevron-up' : 'mdi-upload'" @click="showUpload = !showUpload">
          {{ showUpload ? 'Hide Upload' : 'Upload' }}
        </v-btn>
      </div>

      <!-- Upload zone -->
      <v-expand-transition>
        <div v-if="canUpload && showUpload" class="px-3 pb-3">
          <div
            class="pa-5 rounded text-center"
            :style="{ border: '2px dashed', borderColor: isDragOver ? 'rgb(var(--v-theme-primary))' : 'rgba(var(--v-border-color),0.3)' }"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="handleDrop"
          >
            <v-icon icon="mdi-cloud-upload-outline" size="32" color="grey" />
            <div class="text-body-2 text-grey mt-1 mb-2">Drag images here, or select below</div>
            <v-row dense align="end" justify="center">
              <v-col cols="12" sm="4"><v-file-input v-model="uploadFile" label="Image (≤ 10 MB)" accept="image/*" prepend-icon="mdi-image" show-size variant="outlined" density="compact" hide-details /></v-col>
              <v-col cols="12" sm="3"><v-text-field v-model="uploadCaption" label="Caption" variant="outlined" density="compact" hide-details /></v-col>
              <v-col cols="6" sm="2">
                <v-select v-model="uploadCategory" :items="CATEGORY_ITEMS.filter((c) => c.value)" label="Category" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="6" sm="2"><v-text-field v-model="uploadTakenDate" type="date" label="Date Taken" variant="outlined" density="compact" hide-details /></v-col>
              <v-col cols="12" sm="1"><v-btn color="primary" block :disabled="!uploadFile" @click="submitUpload">{{ mode === 'staging' ? 'Stage' : 'Add' }}</v-btn></v-col>
            </v-row>
          </div>
        </div>
      </v-expand-transition>

      <v-divider />

      <v-card-text style="max-height:72vh;overflow-y:auto">
        <div v-if="!filteredImages.length" class="text-center text-grey py-12">
          <v-icon icon="mdi-image-off-outline" size="48" color="grey-lighten-1" />
          <div class="text-body-2 mt-2">No images match the current filters.</div>
        </div>

        <!-- Grid view -->
        <v-row v-else-if="viewMode === 'grid'" dense>
          <v-col v-for="img in filteredImages" :key="img.id" cols="6" sm="4" md="3">
            <v-card variant="outlined" class="h-100">
              <v-img :src="img.imageUrl" height="160" cover class="cursor-pointer" loading="lazy" @click="openLightbox(img)">
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height"><v-progress-circular indeterminate size="24" /></div>
                </template>
              </v-img>
              <v-card-text class="pa-2">
                <v-chip v-if="img.category" size="x-small" variant="tonal" color="primary" class="mb-1">{{ CATEGORY_LABELS[img.category] ?? img.category }}</v-chip>
                <div class="text-caption text-truncate">{{ img.caption || 'No caption' }}</div>
              </v-card-text>
              <v-divider />
              <v-card-actions class="pa-1">
                <v-btn size="x-small" variant="text" icon="mdi-magnify-plus-outline" @click="openLightbox(img)" />
                <v-btn size="x-small" variant="text" icon="mdi-download" :href="img.imageUrl" :download="img.caption || 'image'" target="_blank" />
                <v-spacer />
                <v-btn v-if="canDelete" size="x-small" variant="text" color="error" icon="mdi-delete" @click="emit('delete', img.id)" />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- List view -->
        <v-list v-else density="comfortable">
          <v-list-item v-for="img in filteredImages" :key="img.id" class="px-2">
            <template #prepend>
              <v-img :src="img.imageUrl" width="64" height="48" cover class="rounded cursor-pointer mr-2" @click="openLightbox(img)" />
            </template>
            <v-list-item-title>{{ img.caption || 'No caption' }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              <span v-if="img.category">{{ CATEGORY_LABELS[img.category] ?? img.category }}</span>
              <span v-if="img.imageTakenDate"> · Taken {{ formatDate(img.imageTakenDate) }}</span>
              <span v-if="img.uploadedByName"> · {{ img.uploadedByName }}</span>
            </v-list-item-subtitle>
            <template #append>
              <v-btn size="small" variant="text" icon="mdi-download" :href="img.imageUrl" :download="img.caption || 'image'" target="_blank" />
              <v-btn v-if="canDelete" size="small" variant="text" color="error" icon="mdi-delete" @click="emit('delete', img.id)" />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Lightbox -->
    <v-dialog v-model="lightboxOpen" max-width="900">
      <v-card v-if="lightboxImage">
        <v-img :src="lightboxImage.imageUrl" max-height="70vh" contain class="bg-grey-darken-3" />
        <v-card-text>
          <div class="d-flex align-center ga-2 mb-1">
            <v-chip v-if="lightboxImage.category" size="small" variant="tonal" color="primary">{{ CATEGORY_LABELS[lightboxImage.category] ?? lightboxImage.category }}</v-chip>
            <span class="text-body-1 font-weight-medium">{{ lightboxImage.caption || 'No caption' }}</span>
          </div>
          <div class="text-caption text-grey">
            <span v-if="lightboxImage.imageTakenDate">Taken {{ formatDate(lightboxImage.imageTakenDate) }}</span>
            <span v-if="lightboxImage.uploadedByName"> · Uploaded by {{ lightboxImage.uploadedByName }}</span>
            <span v-if="lightboxImage.createdAt"> · {{ formatDate(lightboxImage.createdAt) }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" prepend-icon="mdi-download" :href="lightboxImage.imageUrl" :download="lightboxImage.caption || 'image'" target="_blank">Download</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="lightboxOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
