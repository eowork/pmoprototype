<script setup lang="ts">
/**
 * Phase MG-B (2026-05-21): UI refactor — grid layout (cards in columns)
 * replacing stacked expansion panels for better horizontal space utilization
 * and reduced scrolling.
 *
 * Layout (responsive):
 *   Row A (full width)              Core Project Identity
 *   Row B (12/6 + 12/6)             Location          | Implementation Agencies
 *   Row C (12/6 + 12/6)             Funding & Cost    | Other Attributes
 *   Row D (12/6 + 12/6)             Project Objectives| Beneficiary Groups
 *   Row E (full width)              Strategic Alignment
 *
 * Beneficiary aggregate count removed per ECO directive 2026-05-21.
 */
import type { BasicInfoFormState } from '~/utils/coiFormState'
import { LIKHA_OPTIONS, RDP_OPTIONS, SOCIOECONOMIC_OPTIONS, SDG_OPTIONS } from '~/utils/coiHierarchies'
// NC fix (2026-05-21): Explicit imports — Nuxt default auto-import path-prefixes
// nested-dir components (components/coi/Foo.vue → <CoiFoo>), so the filename-only
// tags in this template would silently fail to render without these imports.
import CiHierarchicalSelectorTrigger from '~/components/coi/CiHierarchicalSelectorTrigger.vue'
import CiBulletListInput from '~/components/coi/CiBulletListInput.vue'

const form = defineModel<BasicInfoFormState>({ required: true })

const props = withDefaults(defineProps<{
  fundingSources: { id: string; name: string; type?: string }[]
  contractors:    { id: string; name: string }[]    // legacy — no longer rendered
  rules?: {
    required:       (v: string)          => boolean | string
    positiveNumber: (v: number | null)   => boolean | string
    projectCode?:   (v: string)          => boolean | string
  }
  readOnly?: boolean
}>(), {
  readOnly: false,
})

// NC: Hierarchy data sourced from utils/coiHierarchies.ts (single source of truth)
const rdpOptions   = RDP_OPTIONS
const socioOptions = SOCIOECONOMIC_OPTIONS
const likhaOptions = LIKHA_OPTIONS
const sdgOptions   = SDG_OPTIONS

// ── Static Option Lists ──────────────────────────────────────────────────────
const campusOptions = [
  { title: 'Main Campus',       value: 'MAIN' },
  { title: 'Cabadbaran Campus', value: 'CABADBARAN' },
  { title: 'Both Campuses',     value: 'BOTH' },
]

const statusOptions = [
  { title: 'Proposal',  value: 'PROPOSAL'  },
  { title: 'Ongoing',   value: 'ONGOING'   },
  { title: 'Complete',  value: 'COMPLETE'  },
  { title: 'On Hold',   value: 'ON_HOLD'   },
  { title: 'Cancelled', value: 'CANCELLED' },
]

const fundingTypeOptions = [
  { title: 'Internal Funds', value: 'INTERNAL' },
  { title: 'External Funds', value: 'EXTERNAL' },
]

// ── Rule helpers ────────────────────────────────────────────────────────────
const r = computed(() => ({
  required:       props.rules?.required       ?? (() => true),
  positiveNumber: props.rules?.positiveNumber ?? (() => true),
}))

// ── Funding source filtering ────────────────────────────────────────────────
const filteredFundingSources = computed(() => {
  if (!form.value.funding_source_type) return props.fundingSources
  return props.fundingSources.filter(
    fs => !fs.type || fs.type === form.value.funding_source_type,
  )
})

// NC: Inline bullet helpers (addObjective/addBeneficiary/etc) removed —
// now handled internally by CiBulletListInput components.

// ── Custom funding source row ───────────────────────────────────────────────
const newCustomFundType = ref<'INTERNAL' | 'EXTERNAL' | 'CUSTOM'>('CUSTOM')
const newCustomFundName = ref('')
const newCustomFundNotes = ref('')

function addCustomFundingSource() {
  const name = newCustomFundName.value.trim()
  if (!name) return
  if (!Array.isArray(form.value.additional_funding_sources)) {
    form.value.additional_funding_sources = []
  }
  if (form.value.additional_funding_sources.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    return
  }
  form.value.additional_funding_sources.push({
    type: newCustomFundType.value,
    name,
    notes: newCustomFundNotes.value.trim() || undefined,
  })
  newCustomFundName.value = ''
  newCustomFundNotes.value = ''
  newCustomFundType.value = 'CUSTOM'
}
function removeCustomFundingSource(i: number) {
  form.value.additional_funding_sources.splice(i, 1)
}
</script>

<template>
  <!-- ══════════════════════════════════════════════════════════════════════
       ROW A — Core Project Identity (always visible, required)
       ══════════════════════════════════════════════════════════════════════ -->
  <v-card class="mb-3" elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
      <v-icon size="small" icon="mdi-identifier" color="primary" />
      <span class="text-subtitle-1 font-weight-medium">Project Identity</span>
      <v-chip size="x-small" color="error" variant="tonal" class="ml-1">Required</v-chip>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
      Core identifying information. All starred (*) fields are required to create or update the project record.
    </v-card-subtitle>
    <v-divider />
    <v-card-text class="py-3">
      <v-row dense>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="form.project_code"
            label="Project Code *"
            placeholder="e.g., CP-2026-001"
            :rules="[r.required]"
            density="compact"
            variant="outlined"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.campus"
            label="Campus *"
            :items="campusOptions"
            :rules="[r.required]"
            density="compact"
            variant="outlined"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.status"
            label="Project Status *"
            :items="statusOptions"
            :rules="[r.required]"
            density="compact"
            variant="outlined"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="form.title"
            label="Project Title *"
            placeholder="e.g., College of Engineering Building"
            :rules="[r.required]"
            density="compact"
            variant="outlined"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="form.description"
            label="Project Description"
            placeholder="Describe the project scope, purpose, and intended outcome..."
            rows="2"
            auto-grow
            density="compact"
            variant="outlined"
            hide-details="auto"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- XXX-F: Section overline header for Row B -->
  <div class="d-flex align-center ga-2 mb-1 mt-2">
    <v-icon size="16" color="grey-darken-1">mdi-map-marker-outline</v-icon>
    <span class="text-overline text-grey-darken-1">Location &amp; Implementation</span>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW B — Location | Implementation Agencies (side-by-side)
       ══════════════════════════════════════════════════════════════════════ -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-map-marker-outline" color="info" />
          <span class="text-subtitle-1 font-weight-medium">Location</span>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Geographic scope of the project: spatial coverage area, municipality, and province for COA / GPPA reporting.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.spatial_coverage"
                label="Spatial Coverage"
                placeholder="e.g., 1.5 hectares main quadrangle"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.municipality"
                label="Municipality"
                placeholder="e.g., Butuan City"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.province"
                label="Province"
                placeholder="e.g., Agusan del Norte"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-office-building-outline" color="info" />
          <span class="text-subtitle-1 font-weight-medium">Implementation Agencies</span>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Agencies responsible for project execution. Implementing Agency is the primary owner; co-implementing and attached agencies are supporting parties.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.implementing_agency"
                label="Implementing Agency"
                placeholder="e.g., CSU Engineering and Construction Office (ECO)"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.co_implementing_agency"
                label="Co-Implementing Agency"
                placeholder="Optional"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.attached_agency"
                label="Attached Agency"
                placeholder="Optional"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- XXX-F: Section overline header for Row C -->
  <div class="d-flex align-center ga-2 mb-1 mt-2">
    <v-icon size="16" color="grey-darken-1">mdi-cash-multiple</v-icon>
    <span class="text-overline text-grey-darken-1">Funding &amp; Project Details</span>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW C — Funding & Cost | Other Attributes (side-by-side)
       ══════════════════════════════════════════════════════════════════════ -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-cash-multiple" color="success" />
          <span class="text-subtitle-1 font-weight-medium">Funding Source &amp; Cost</span>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Select fund type (Internal/External) to filter primary sources, then add cost in PHP. Use the chip area to register additional or custom funding sources.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.funding_source_type"
                label="Funding Type"
                :items="fundingTypeOptions"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cost_amount"
                label="Cost Amount (PHP)"
                type="number"
                placeholder="1000000.00"
                :rules="[r.positiveNumber]"
                prefix="₱"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                v-model="form.funding_source_id"
                label="Primary Funding Source"
                :items="filteredFundingSources"
                item-title="name"
                item-value="id"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- Chip list of additional funding sources -->
          <div v-if="form.additional_funding_sources?.length" class="mt-3 d-flex flex-wrap ga-1">
            <v-chip
              v-for="(src, i) in form.additional_funding_sources"
              :key="i"
              closable
              :color="src.type === 'INTERNAL' ? 'primary' : src.type === 'EXTERNAL' ? 'success' : 'grey'"
              variant="tonal"
              size="small"
              @click:close="removeCustomFundingSource(i)"
            >
              <strong>{{ src.type }}</strong>:&nbsp;{{ src.name }}
              <span v-if="src.notes" class="ml-1 text-caption">({{ src.notes }})</span>
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <p class="text-caption text-grey font-weight-medium text-uppercase mb-2">
            Add Custom / Additional Funding Source
          </p>
          <v-row dense align="end">
            <v-col cols="4" sm="3">
              <v-select
                v-model="newCustomFundType"
                label="Type"
                :items="[
                  { title: 'Internal', value: 'INTERNAL' },
                  { title: 'External', value: 'EXTERNAL' },
                  { title: 'Custom',   value: 'CUSTOM'   },
                ]"
                density="compact"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="8" sm="6">
              <v-text-field
                v-model="newCustomFundName"
                label="Source Name"
                placeholder="e.g., DPWH Counterpart Fund"
                density="compact"
                variant="outlined"
                hide-details
                @keydown.enter.prevent="addCustomFundingSource"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-btn
                color="primary"
                variant="tonal"
                block
                :disabled="!newCustomFundName.trim()"
                prepend-icon="mdi-plus"
                @click="addCustomFundingSource"
              >
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-cube-outline" color="warning" />
          <span class="text-subtitle-1 font-weight-medium">Other Attributes</span>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Contractor (free-text, no dropdown), Project Engineer, building classification, and floor area in square meters.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.contractor"
                label="Contractor"
                placeholder="Free-text name of contracting firm or builder"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.project_engineer"
                label="Project Engineer (Contractor)"
                placeholder="e.g., Engr. Juan Dela Cruz"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.building_type"
                label="Building Type"
                placeholder="e.g., Academic, Laboratory"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.floor_area"
                label="Floor Area (sqm)"
                type="number"
                placeholder="e.g., 1200"
                :rules="[r.positiveNumber]"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- XXX-F: Section overline header for Row D -->
  <div class="d-flex align-center ga-2 mb-1 mt-2">
    <v-icon size="16" color="grey-darken-1">mdi-target</v-icon>
    <span class="text-overline text-grey-darken-1">Objectives &amp; Beneficiaries</span>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW D — Project Objectives | Beneficiary Groups (side-by-side)
       ══════════════════════════════════════════════════════════════════════ -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-target" color="primary" />
          <span class="text-subtitle-1 font-weight-medium">Project Objectives</span>
          <v-chip size="x-small" variant="tonal" color="primary">
            {{ (form.objectives_list || []).filter(s => s.trim()).length }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          List specific, measurable objectives (one per bullet). These map to MPR/WAR planning sections.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiBulletListInput
            v-model="form.objectives_list"
            add-label="Add Objective"
            color="primary"
            :placeholder="(i: number) => `Objective ${i + 1}`"
            :read-only="readOnly"
            empty-state-text="No objectives listed."
          />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-account-group-outline" color="success" />
          <span class="text-subtitle-1 font-weight-medium">Beneficiary Groups</span>
          <v-chip size="x-small" variant="tonal" color="success">
            {{ (form.beneficiary_list || []).filter(s => s.trim()).length }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          List who benefits from this project (one group per bullet, e.g., "College of Engineering students"). Used for impact reporting.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiBulletListInput
            v-model="form.beneficiary_list"
            add-label="Add Beneficiary Group"
            color="success"
            icon="mdi-circle-medium"
            :placeholder="(i: number) => `Group ${i + 1} (e.g., students, faculty, community)`"
            :read-only="readOnly"
            empty-state-text="No beneficiary groups listed."
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- XXX-F: Section overline header for Row E -->
  <div class="d-flex align-center ga-2 mb-1 mt-2">
    <v-icon size="16" color="grey-darken-1">mdi-strategy</v-icon>
    <span class="text-overline text-grey-darken-1">Strategic Alignment</span>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW E — Strategic Alignment (SSS-A: balanced container layout)
       Row 1: Narrative (full width)  |  Row 2: SDG + RDP  |  Row 3: SEA + LIKHA
       ══════════════════════════════════════════════════════════════════════ -->
  <!-- Row 1: Narrative -->
  <v-card elevation="2" rounded="lg" class="mb-1">
    <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
      <v-icon size="small" icon="mdi-strategy" color="purple" />
      <span class="text-subtitle-1 font-weight-medium">Strategic Alignment Narrative</span>
      <v-chip size="x-small" variant="tonal" color="grey">Optional</v-chip>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
      Describe how this project aligns with institutional strategic priorities — used in strategic dashboard rollups.
    </v-card-subtitle>
    <v-divider />
    <v-card-text class="py-3">
      <v-textarea
        v-model="form.strategic_alignment"
        label="Strategic Alignment Narrative (optional)"
        placeholder="Describe how this project aligns with institutional strategic priorities..."
        rows="3"
        auto-grow
        density="compact"
        variant="outlined"
        hide-details="auto"
        :readonly="readOnly"
        counter
        maxlength="2000"
      />
    </v-card-text>
  </v-card>

  <!-- Row 2: SDG + RDP -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-earth" color="teal" />
          <span class="text-subtitle-1 font-weight-medium">UN SDGs</span>
          <v-chip v-if="(form.sdg_goals || []).length" size="x-small" variant="tonal" color="teal">{{ (form.sdg_goals || []).length }}</v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          UN Sustainable Development Goals addressed by this project.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiHierarchicalSelectorTrigger
            v-model="form.sdg_goals"
            label="Sustainable Development Goals"
            title="UN Sustainable Development Goals"
            :options="sdgOptions"
            icon="mdi-earth"
            color="teal"
            description="Select all UN SDGs that this project contributes to."
            search-placeholder="Search SDGs…"
            :read-only="readOnly"
            :max-visible-chips="5"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-map-outline" color="primary" />
          <span class="text-subtitle-1 font-weight-medium">RDP 2023–2028</span>
          <v-chip v-if="(form.rdp_alignment || []).length" size="x-small" variant="tonal" color="primary">{{ (form.rdp_alignment || []).length }}</v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Caraga Regional Development Plan chapters and sub-chapters.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiHierarchicalSelectorTrigger
            v-model="form.rdp_alignment"
            label="RDP 2023–2028 (Caraga)"
            title="RDP 2023–2028 — Caraga Regional Development Plan"
            :options="rdpOptions"
            icon="mdi-map-outline"
            color="primary"
            description="Select all applicable Parts, Chapters, and Sub-chapters."
            search-placeholder="Search RDP chapters…"
            :read-only="readOnly"
            :max-visible-chips="5"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Row 3: Socio-Economic Agenda + LIKHA -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-flag-variant-outline" color="warning" />
          <span class="text-subtitle-1 font-weight-medium">0+8 Socio-Economic Agenda</span>
          <v-chip v-if="(form.socioeconomic_agenda || []).length" size="x-small" variant="tonal" color="warning">{{ (form.socioeconomic_agenda || []).length }}</v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Socio-Economic Agenda priorities (sub-items independently selectable).
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiHierarchicalSelectorTrigger
            v-model="form.socioeconomic_agenda"
            label="0+8 Socio-Economic Agenda"
            title="0+8 Socio-Economic Agenda (Marcos Administration)"
            :options="socioOptions"
            icon="mdi-flag-variant-outline"
            color="warning"
            description="Sub-items are independently selectable."
            search-placeholder="Search agenda items…"
            :read-only="readOnly"
            :max-visible-chips="5"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" icon="mdi-school-outline" color="success" />
          <span class="text-subtitle-1 font-weight-medium">CSU LIKHA Goals</span>
          <v-chip v-if="(form.csu_likha_goals || []).length" size="x-small" variant="tonal" color="success">{{ (form.csu_likha_goals || []).length }}</v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Caraga State University institutional strategic plan goals.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiHierarchicalSelectorTrigger
            v-model="form.csu_likha_goals"
            label="CSU LIKHA Goals"
            title="CSU LIKHA Strategic Goals"
            :options="likhaOptions"
            icon="mdi-school-outline"
            color="success"
            description="Caraga State University institutional strategic plan."
            search-placeholder="Search LIKHA goals…"
            :read-only="readOnly"
            :max-visible-chips="5"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW G — Output / Outcome Indicators (OD: 2 dedicated cards)
       OD (2026-05-21): Extracted from Strategic Alignment card. Each gets
       its own card with clear shadow/padding boundary.
       ══════════════════════════════════════════════════════════════════════ -->
  <v-row dense class="mb-1">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" color="info">mdi-arrow-right-thick</v-icon>
          <span class="text-subtitle-1 font-weight-medium">Output Indicators</span>
          <v-chip size="x-small" variant="tonal" color="info">
            {{ (form.output_indicators_list || []).filter((s: string) => s.trim()).length }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          What the project delivers (e.g., 1 building constructed).
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiBulletListInput
            v-model="form.output_indicators_list"
            add-label="Add Output Indicator"
            color="info"
            :placeholder="(i: number) => `Output ${i + 1}`"
            :read-only="readOnly"
            empty-state-text="No output indicators listed."
          />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" class="h-100">
        <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
          <v-icon size="small" color="purple">mdi-target-account</v-icon>
          <span class="text-subtitle-1 font-weight-medium">Outcome Indicators</span>
          <v-chip size="x-small" variant="tonal" color="purple">
            {{ (form.outcome_indicators_list || []).filter((s: string) => s.trim()).length }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
          Long-term impact (e.g., 500 students served).
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="py-3">
          <CiBulletListInput
            v-model="form.outcome_indicators_list"
            add-label="Add Outcome Indicator"
            color="purple"
            :placeholder="(i: number) => `Outcome ${i + 1}`"
            :read-only="readOnly"
            empty-state-text="No outcome indicators listed."
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
