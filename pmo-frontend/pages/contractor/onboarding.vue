<script setup lang="ts">
import type { InviteValidation } from '~/stores/contractorAuth'

definePageMeta({ layout: 'blank' })

useHead({ style: [{ innerHTML: 'html, body { overflow-x: hidden; max-width: 100%; }' }] })

const route = useRoute()
const contractorAuth = useContractorAuthStore()
const authStore = useAuthStore()  // PM-A: unified auth store replaces deprecated contractorAuth.isAuthenticated

const token = computed(() => route.query.token as string | undefined)

// PM-E: Explicit state machine — replaces tokenLoading/tokenError/completed/submitting booleans
type OnboardingPhase =
  | 'loading'
  | 'validating'
  | 'invalid-token'
  | 'expired-token'
  | 'onboarding-ready'
  | 'registration-processing'
  | 'registration-success'

const phase = ref<OnboardingPhase>('loading')
const tokenData = ref<InviteValidation | null>(null)
const tokenError = ref('')  // preserved for error display text
const step = ref(1)

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  phone: '',
  position: '',
})
const showPassword = ref(false)
const submitError = ref('')

// PM-G: One-shot validation guard — prevents re-validation on reactive/hydration re-runs
const validated = ref(false)

const passwordMismatch = computed(() =>
  form.confirmPassword.length > 0 && form.password !== form.confirmPassword,
)
const step1Valid = computed(() => !!tokenData.value && !tokenError.value)
const step2Valid = computed(() =>
  form.fullName.trim().length > 0 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
  form.password.length >= 8 &&
  !passwordMismatch.value,
)

function canNext(): boolean {
  if (step.value === 1) return step1Valid.value
  if (step.value === 2) return step2Valid.value
  return true
}

async function loadInvite() {
  phase.value = 'validating'  // PM-E
  tokenError.value = ''
  try {
    tokenData.value = await contractorAuth.validateInvite(token.value!)
    phase.value = 'onboarding-ready'  // PM-E
  } catch (err: any) {
    tokenError.value = err?.data?.message || err?.message || 'This invite link is invalid or has expired.'
    const msg = tokenError.value.toLowerCase()
    phase.value = (msg.includes('expir') || msg.includes('used') || msg.includes('revoked'))
      ? 'expired-token'
      : 'invalid-token'  // PM-E
  }
}

async function handleSubmit() {
  if (!token.value || !step2Valid.value) return
  phase.value = 'registration-processing'  // PM-E
  submitError.value = ''
  try {
    await contractorAuth.register({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      companyName: form.companyName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      position: form.position.trim() || undefined,
      inviteToken: token.value,
    })
    phase.value = 'registration-success'  // PM-E
  } catch (err: any) {
    submitError.value = err?.data?.message || err?.message || 'Registration failed. Please try again.'
    phase.value = 'onboarding-ready'  // PM-E
  }
}

onMounted(async () => {
  // PM-B: Clear stale legacy localStorage keys left from pre-PJ contractor auth system
  if (import.meta.client) {
    localStorage.removeItem('contractor_access_token')
    localStorage.removeItem('contractor_user')
  }

  if (!token.value) {
    tokenError.value = 'No invite token found in URL.'
    phase.value = 'invalid-token'  // PM-E
    return
  }

  // PM-A: Use unified authStore — replaces deprecated contractorAuth.isAuthenticated check
  if (authStore.isAuthenticated) {
    navigateTo(`/contractor/accept-invite?token=${token.value}`, { replace: true })  // PM-F
    return
  }

  // PM-G: One-shot guard — token validation fires exactly once per mount
  if (!validated.value) {
    validated.value = true
    await loadInvite()
  }
})
</script>

<template>
  <div class="login-container">
    <!-- Left Panel: Branding (identical to login.vue / register.vue) -->
    <div class="branding-panel">
      <div class="branding-content">
        <v-img src="/csu-logo.svg" alt="Caraga State University" width="120" class="mb-6" />
        <h1 class="branding-title">CSU CORE</h1>
        <h2 class="branding-subtitle">Centralized Operations and Reporting Engine (CORE) Dashboard System</h2>
        <div class="branding-divider" />
        <p class="branding-tagline">
          Caraga State University<br />
          <span class="text-gold">Building Tomorrow, Today</span>
        </p>
      </div>
      <p class="branding-footer">&copy; {{ new Date().getFullYear() }} Caraga State University</p>
    </div>

    <!-- Right Panel: Onboarding Wizard -->
    <div class="form-panel">
      <div class="form-wrapper">
        <div class="mobile-logo">
          <v-img src="/csu-logo.svg" alt="CSU" width="80" class="mx-auto mb-4" />
        </div>

        <v-img src="/csu-official-seal.png" alt="CSU Official Seal" width="70" class="mx-auto mb-3 seal-badge" />
        <h1 class="form-title">Contractor Onboarding</h1>
        <p class="form-subtitle">Project Invitation — CSU CORE Infrastructure Portal</p>

        <!-- ── Success State ── -->
        <div v-if="phase === 'registration-success'" class="login-form text-center">
          <v-icon size="52" color="success" class="mb-3">mdi-check-circle</v-icon>
          <div class="text-subtitle-1 font-weight-bold mb-2" style="color:#1a1a2e">Account Created Successfully</div>
          <p style="color:#6b7280;font-size:0.88rem;line-height:1.6" class="mb-2">
            Your account has been created and you've been assigned to the project.
            Please sign in with your credentials to access the platform.
          </p>
          <v-chip color="success" variant="tonal" class="mb-4" prepend-icon="mdi-office-building-outline">
            {{ tokenData?.projectTitle }}
          </v-chip>
          <div>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-login" block to="/login?registered=1">
              Sign In to CSU CORE
            </v-btn>
          </div>
        </div>

        <!-- ── Token Error State ── -->
        <div v-else-if="phase === 'invalid-token' || phase === 'expired-token'" class="login-form text-center">
          <v-icon size="48" color="error" class="mb-3">mdi-link-off</v-icon>
          <div class="text-subtitle-1 font-weight-bold mb-2" style="color:#1a1a2e">Invite Unavailable</div>
          <v-alert type="error" variant="tonal" density="compact" rounded="lg" class="mb-3 text-left">
            {{ tokenError }}
          </v-alert>
          <p style="color:#6b7280;font-size:0.85rem" class="mb-4">
            Contact your project administrator to request a new invite link.
          </p>
          <div class="d-flex ga-2 justify-center">
            <v-btn variant="tonal" size="small" color="primary" to="/login">Sign In</v-btn>
            <v-btn variant="text" size="small" to="/register">Register</v-btn>
          </div>
        </div>

        <!-- ── Stepper Wizard ── -->
        <template v-else>
          <!-- Stepper bar (identical pattern to register.vue) -->
          <div class="stepper-bar mb-4">
            <template v-for="s in [1, 2, 3, 4]" :key="s">
              <div class="stepper-node" :class="{ 'node-done': step > s, 'node-active': step === s }">
                <div class="node-circle">
                  <v-icon v-if="step > s" size="12">mdi-check</v-icon>
                  <span v-else class="node-num">{{ s }}</span>
                </div>
                <div class="node-label">{{ ['Verify', 'Account', 'Company', 'Review'][s - 1] }}</div>
              </div>
              <div v-if="s < 4" class="stepper-line" :class="{ 'line-done': step > s }" />
            </template>
          </div>

          <!-- ── Step 1: Verify Invite ── -->
          <div v-if="step === 1" class="login-form">
            <p class="step-title">Verify Invite</p>

            <div v-if="phase === 'loading' || phase === 'validating'" class="text-center py-6">
              <v-progress-circular indeterminate color="primary" size="40" />
              <p class="text-body-2 text-grey mt-3">Validating invite link…</p>
            </div>

            <template v-else-if="phase === 'onboarding-ready'">
              <div class="invite-card mb-3">
                <div class="d-flex align-center ga-2 mb-3">
                  <v-icon color="primary" size="20">mdi-office-building-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-semibold">{{ tokenData?.projectTitle }}</span>
                </div>
                <v-divider class="mb-3" />
                <table class="review-table" style="width:100%">
                  <tbody>
                    <tr>
                      <td class="review-label">Campus</td>
                      <td style="font-size:0.85rem">{{ tokenData?.projectCampus || '—' }}</td>
                    </tr>
                    <tr>
                      <td class="review-label">Invited by</td>
                      <td style="font-size:0.85rem">{{ tokenData?.createdByName }}</td>
                    </tr>
                    <tr>
                      <td class="review-label">Link expires</td>
                      <td style="font-size:0.85rem">
                        {{ tokenData ? new Date(tokenData.expiresAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }}
                      </td>
                    </tr>
                    <tr v-if="tokenData?.targetEmail">
                      <td class="review-label">Invited email</td>
                      <td style="font-size:0.85rem">{{ tokenData?.targetEmail }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <v-alert type="info" variant="tonal" density="compact" rounded="lg" icon="mdi-information-outline" class="mb-0">
                Complete the next steps to create your account and accept this invitation.
              </v-alert>
            </template>

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="primary"
                variant="flat"
                class="login-btn"
                :disabled="!canNext()"
                append-icon="mdi-chevron-right"
                @click="step = 2"
              >
                Continue
              </v-btn>
            </div>
          </div>

          <!-- ── Step 2: Account Information ── -->
          <div v-if="step === 2" class="login-form">
            <p class="step-title">Account Information</p>

            <div class="input-group">
              <label class="input-label">Full Name <span class="req">*</span></label>
              <v-text-field
                v-model="form.fullName"
                placeholder="Juan Dela Cruz"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                bg-color="white"
                autocomplete="name"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Email Address <span class="req">*</span></label>
              <v-text-field
                v-model="form.email"
                type="email"
                placeholder="juan@company.com"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                bg-color="white"
                autocomplete="email"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Password <span class="req">*</span></label>
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimum 8 characters"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                bg-color="white"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                autocomplete="new-password"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Confirm Password <span class="req">*</span></label>
              <v-text-field
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Re-enter password"
                variant="outlined"
                density="comfortable"
                :error="passwordMismatch"
                :error-messages="passwordMismatch ? 'Passwords do not match' : ''"
                hide-details="auto"
                bg-color="white"
                autocomplete="new-password"
              />
            </div>

            <div class="d-flex ga-2 justify-space-between mt-4">
              <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="step = 1">Back</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="login-btn"
                :disabled="!canNext()"
                append-icon="mdi-chevron-right"
                @click="step = 3"
              >
                Continue
              </v-btn>
            </div>
          </div>

          <!-- ── Step 3: Company Information ── -->
          <div v-if="step === 3" class="login-form">
            <p class="step-title">Company Information</p>
            <p class="text-caption text-grey mb-3">All fields are optional — you can update your profile after registration.</p>

            <div class="input-group">
              <label class="input-label">Company / Organization</label>
              <v-text-field
                v-model="form.companyName"
                placeholder="Dela Cruz Construction Inc."
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="white"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Phone Number</label>
              <v-text-field
                v-model="form.phone"
                placeholder="+63 9XX XXX XXXX"
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="white"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Position / Role</label>
              <v-text-field
                v-model="form.position"
                placeholder="e.g. Project Engineer, Site Inspector"
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="white"
              />
            </div>

            <div class="d-flex ga-2 justify-space-between mt-4">
              <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="step = 2">Back</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="login-btn"
                append-icon="mdi-chevron-right"
                @click="step = 4"
              >
                Continue
              </v-btn>
            </div>
          </div>

          <!-- ── Step 4: Review & Confirm ── -->
          <div v-if="step === 4" class="login-form">
            <p class="step-title">Review &amp; Confirm</p>

            <v-alert
              v-if="submitError"
              type="error"
              variant="tonal"
              density="compact"
              closable
              class="mb-3"
              @click:close="submitError = ''"
            >
              {{ submitError }}
            </v-alert>

            <table class="review-table mb-3" style="width:100%">
              <tbody>
                <tr>
                  <td class="review-label">Full Name</td>
                  <td style="font-size:0.85rem">{{ form.fullName }}</td>
                </tr>
                <tr>
                  <td class="review-label">Email</td>
                  <td style="font-size:0.85rem">{{ form.email }}</td>
                </tr>
                <tr v-if="form.companyName">
                  <td class="review-label">Company</td>
                  <td style="font-size:0.85rem">{{ form.companyName }}</td>
                </tr>
                <tr v-if="form.phone">
                  <td class="review-label">Phone</td>
                  <td style="font-size:0.85rem">{{ form.phone }}</td>
                </tr>
                <tr v-if="form.position">
                  <td class="review-label">Position</td>
                  <td style="font-size:0.85rem">{{ form.position }}</td>
                </tr>
              </tbody>
            </table>

            <v-sheet rounded="lg" border color="green-lighten-5" class="pa-3 mb-3">
              <div class="text-caption text-grey-darken-1 font-weight-semibold mb-1">PROJECT ASSIGNMENT</div>
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="18">mdi-office-building-outline</v-icon>
                <div>
                  <div class="text-body-2 font-weight-semibold">{{ tokenData?.projectTitle }}</div>
                  <div class="text-caption text-grey">{{ tokenData?.projectCampus }}</div>
                </div>
              </div>
            </v-sheet>

            <v-alert type="warning" variant="tonal" density="compact" rounded="lg" icon="mdi-shield-check-outline" class="mb-3">
              Once submitted, your account will be created and automatically assigned to this project.
            </v-alert>

            <div class="d-flex ga-2 justify-space-between">
              <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="step = 3">Back</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="login-btn"
                :loading="phase === 'registration-processing'"
                prepend-icon="mdi-account-plus"
                @click="handleSubmit"
              >
                Create Account &amp; Accept Invite
              </v-btn>
            </div>
          </div>

        </template>

        <p class="form-footer">
          &copy; {{ new Date().getFullYear() }} Caraga State University &bull; All Rights Reserved
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Two-panel layout (identical to login.vue / register.vue) ── */
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.branding-panel {
  display: none;
  width: 45%;
  background:
    linear-gradient(135deg, #003300 0%, rgba(0, 102, 0, 0.90) 100%),
    url('/csu-admin-building.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}
.branding-panel::before {
  content: '';
  position: absolute;
  top: -50%; right: -50%;
  width: 100%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}
.branding-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.branding-title { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 0.5rem; }
.branding-subtitle { font-size: 1.1rem; font-weight: 400; opacity: 0.9; margin-bottom: 2rem; }
.branding-divider { width: 60px; height: 4px; background: #f9dc07; border-radius: 2px; margin-bottom: 2rem; }
.branding-tagline { font-size: 1rem; line-height: 1.8; opacity: 0.85; }
.text-gold { color: #f9dc07; font-weight: 600; }
.branding-footer { position: absolute; bottom: 2rem; left: 3rem; font-size: 0.85rem; opacity: 0.7; }

.form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f8f9fa; overflow-y: auto; overflow-x: hidden; max-width: 100%; min-width: 0; }
.form-wrapper { width: 100%; max-width: 440px; padding: 1rem 0; overflow-x: hidden; }
.mobile-logo { display: block; text-align: center; margin-bottom: 1rem; }
.seal-badge { opacity: 0.95; }
.form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.25rem; text-align: center; }
.form-subtitle { font-size: 0.88rem; color: #6b7280; margin-bottom: 1rem; text-align: center; }

/* ── Stepper bar (identical to register.vue) ── */
.stepper-bar { display: flex; align-items: flex-start; justify-content: center; gap: 0; width: 100%; overflow: hidden; }
.stepper-node { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 0 0 auto; }
.node-circle {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; color: #9ca3af;
  transition: all 0.25s;
}
.node-num { font-size: 0.7rem; font-weight: 700; }
.node-label { font-size: 0.6rem; font-weight: 600; color: #9ca3af; white-space: normal; text-align: center; max-width: 56px; overflow: hidden; text-overflow: ellipsis; transition: color 0.25s; line-height: 1.2; }
.stepper-node.node-active .node-circle { border-color: #003300; background: #003300; color: white; }
.stepper-node.node-active .node-label { color: #003300; font-weight: 700; }
.stepper-node.node-done .node-circle { border-color: #16a34a; background: #16a34a; color: white; }
.stepper-node.node-done .node-label { color: #16a34a; }
.stepper-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 2px; margin-top: 14px; transition: background 0.25s; min-width: 6px; }
.stepper-line.line-done { background: #16a34a; }

.step-title { font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.875rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f0f0f0; }
.req { color: #e53e3e; }

/* ── Form card ── */
.login-form { background: white; padding: 1.25rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
.input-group { margin-bottom: 0.875rem; }
.input-label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.35rem; }
.login-btn { font-weight: 600; letter-spacing: 0.3px; text-transform: none; border-radius: 12px; }

/* ── Invite preview card ── */
.invite-card { border: 1px solid rgba(0, 100, 0, 0.2); border-radius: 12px; padding: 1rem; background: rgba(0, 100, 0, 0.03); }

/* ── Review table ── */
.review-table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.review-table td { vertical-align: middle; padding: 7px 12px; }
.review-label { font-size: 0.78rem; font-weight: 600; color: #6b7280; width: 35%; white-space: nowrap; background: #fafafa; }

.form-footer { text-align: center; margin-top: 1rem; font-size: 0.82rem; color: #9ca3af; }

@media (min-width: 960px) {
  .branding-panel { display: flex; flex-direction: column; }
  .mobile-logo { display: none; }
  .form-panel { background: #fafbfc; }
  .login-form { padding: 1.75rem; }
}
@media (min-width: 1280px) {
  .branding-panel { width: 50%; padding: 4rem; }
  .branding-title { font-size: 3rem; }
  .form-wrapper { max-width: 460px; }
}
</style>
