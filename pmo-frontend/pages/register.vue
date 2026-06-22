<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  middleware: 'guest',
})

// PT-C: prevent horizontal scrollbar on blank layout pages
useHead({ style: [{ innerHTML: 'html, body { overflow-x: hidden; max-width: 100%; }' }] })

// PHASE BBBA (BBBA-0a): public self-registration is CLOSED. Accounts are created by an
// administrator (Access Control). This route redirects to login; the form below is retained
// only for potential future admin-invite repurposing.
await navigateTo('/login')

const router = useRouter()
const api = useApi()

// ZD-A: Google OAuth — same flow as login.vue; Google handles login vs registration
function handleGoogleLogin() {
  window.location.href = '/api/auth/google'
}

// ── Form state ───────────────────────────────────────────────────────────────
const form = ref({
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  department: '',
  position: '',
  phone: '',
  user_type: 'CSU_PERSONNEL',
  user_type_other: '',
})

const step = ref(1)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const userTypeOptions = [
  { value: 'CSU_PERSONNEL',       label: 'CSU Personnel' },
  { value: 'CONTRACTOR',          label: 'Contractor' },
  { value: 'SUPPLIER',            label: 'Supplier' },
  { value: 'CONSULTANT',          label: 'Consultant' },
  { value: 'EXTERNAL_STAKEHOLDER',label: 'External Stakeholder' },
  { value: 'OTHERS',              label: 'Others' },
]

const userTypeLabel = computed(() =>
  userTypeOptions.find(o => o.value === form.value.user_type)?.label ?? form.value.user_type
)

// ── Password strength ─────────────────────────────────────────────────────────
const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return { level: 0, label: '', color: 'grey' }
  if (p.length < 8) return { level: 1, label: 'Too short (min 8)', color: 'error' }
  const score = [/[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length
  if (score === 0) return { level: 2, label: 'Weak', color: 'warning' }
  if (score === 1) return { level: 3, label: 'Fair', color: 'warning' }
  if (score === 2) return { level: 4, label: 'Good', color: 'info' }
  return { level: 5, label: 'Strong', color: 'success' }
})

// ── Step validation ───────────────────────────────────────────────────────────
const step1Valid = computed(() =>
  form.value.full_name.trim().length > 0 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
  form.value.password.length >= 8 &&
  form.value.password === form.value.confirm_password
)
// Step 2: all optional — always valid
const step2Valid = computed(() => true)
const step3Valid = computed(() =>
  form.value.user_type !== 'OTHERS' || form.value.user_type_other.trim().length > 0
)
const formValid = computed(() => step1Valid.value && step3Valid.value)

function nextStep() {
  if (step.value < 4) step.value++
}
function prevStep() {
  if (step.value > 1) step.value--
}
function canNext(): boolean {
  if (step.value === 1) return step1Valid.value
  if (step.value === 2) return step2Valid.value
  if (step.value === 3) return step3Valid.value
  return false
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await api.post('/api/auth/register', {
      full_name: form.value.full_name.trim(),
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
      confirm_password: form.value.confirm_password,
      department: form.value.department.trim() || undefined,
      position: form.value.position.trim() || undefined,
      phone: form.value.phone.trim() || undefined,
      user_type: form.value.user_type,
      user_type_other: form.value.user_type === 'OTHERS' ? form.value.user_type_other.trim() : undefined,
    })
    successMessage.value = 'Your account has been created. You can now sign in with your credentials.'
  } catch (err: any) {
    errorMessage.value = err?.message || 'Registration failed. Please try again.'
    step.value = 4
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Left Panel: Branding (identical to login page) -->
    <div class="branding-panel">
      <div class="branding-content">
        <v-img src="/csu-logo.svg" alt="Caraga State University" width="120" class="mb-6" />
        <h1 class="branding-title">CSU CORE </h1>
        <h2 class="branding-subtitle">Centralized Operations and Reporting Engine (CORE) Dashboard System</h2>
        <div class="branding-divider" />
        <p class="branding-tagline">
          Caraga State University<br />
          <span class="text-gold">Building Tomorrow, Today</span>
        </p>
      </div>
      <p class="branding-footer">
        &copy; {{ new Date().getFullYear() }} Caraga State University
      </p>
    </div>

    <!-- Right Panel: Registration Form -->
    <div class="form-panel">
      <div class="form-wrapper">
        <!-- Mobile logo -->
        <div class="mobile-logo">
          <v-img src="/csu-logo.svg" alt="CSU" width="80" class="mx-auto mb-4" />
        </div>

        <v-img src="/csu-official-seal.png" alt="CSU Official Seal" width="52" class="mx-auto mb-2 seal-badge" />
        <h1 class="form-title">Create Account</h1>
        <p class="form-subtitle">Institutional Registration — CSU CORE</p>

        <!-- ZD-A: Google OAuth registration / sign-in -->
        <div v-if="!successMessage" class="mb-2">
          <v-btn
            variant="outlined"
            size="large"
            block
            class="google-btn mb-2"
            @click="handleGoogleLogin"
          >
            <v-icon start>mdi-google</v-icon>
            Continue with Google
          </v-btn>
          <div class="d-flex align-center">
            <v-divider />
            <span class="text-caption text-medium-emphasis mx-2" style="white-space: nowrap">or register with email</span>
            <v-divider />
          </div>
        </div>

        <!-- ── Success State ── -->
        <div v-if="successMessage" class="login-form text-center">
          <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
          <div class="text-h6 font-weight-bold mb-2" style="color:#1a1a2e">Registration Submitted</div>
          <p style="color:#6b7280;font-size:0.88rem;line-height:1.6" class="mb-4">{{ successMessage }}</p>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-login" @click="router.push('/login')">Back to Sign In</v-btn>
        </div>

        <!-- ── Stepper ── -->
        <template v-else>
          <!-- Stepper bar with connecting line -->
          <div class="stepper-bar mb-2">
            <template v-for="s in [1,2,3,4]" :key="s">
              <div class="stepper-node" :class="{ 'node-done': step > s, 'node-active': step === s }">
                <div class="node-circle">
                  <v-icon v-if="step > s" size="12">mdi-check</v-icon>
                  <span v-else class="node-num">{{ s }}</span>
                </div>
                <div class="node-label">{{ ['Account','Institution','User Type','Review'][s-1] }}</div>
              </div>
              <div v-if="s < 4" class="stepper-line" :class="{ 'line-done': step > s }" />
            </template>
          </div>

          <!-- ── Step 1: Account Information ── -->
          <div v-if="step === 1" class="login-form">
            <p class="step-title">Account Information</p>

            <div class="input-group">
              <label class="input-label">Full Name <span class="req">*</span></label>
              <v-text-field v-model="form.full_name" placeholder="Juan Dela Cruz" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" autocomplete="name" />
            </div>

            <div class="input-group">
              <label class="input-label">Email Address <span class="req">*</span></label>
              <v-text-field v-model="form.email" type="email" placeholder="juan@csu.edu.ph" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" autocomplete="email" />
            </div>

            <div class="input-group">
              <label class="input-label">Password <span class="req">*</span></label>
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimum 8 characters"
                variant="outlined" density="comfortable" hide-details="auto" bg-color="white"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="showPassword = !showPassword"
              />
              <div v-if="form.password" class="d-flex align-center ga-2 mt-1">
                <v-progress-linear :model-value="(passwordStrength.level / 5) * 100" :color="passwordStrength.color" height="4" rounded style="max-width:100px;flex-shrink:0" />
                <span class="text-caption" :class="`text-${passwordStrength.color}`">{{ passwordStrength.label }}</span>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Confirm Password <span class="req">*</span></label>
              <v-text-field
                v-model="form.confirm_password"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter your password"
                variant="outlined" density="comfortable" hide-details="auto" bg-color="white"
                :error="form.confirm_password.length > 0 && form.password !== form.confirm_password"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />
              <p v-if="form.confirm_password.length > 0 && form.password !== form.confirm_password" class="text-caption text-error mt-1">Passwords do not match</p>
            </div>

            <v-btn color="success" block size="large" class="login-btn mt-2" :disabled="!step1Valid" @click="nextStep">
              Next: Institution <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>

          <!-- ── Step 2: Institution ── -->
          <div v-else-if="step === 2" class="login-form">
            <p class="step-title">Contact &amp; Institution</p>

            <div class="input-group">
              <label class="input-label">Office / Company</label>
              <v-text-field v-model="form.department" :placeholder="form.user_type === 'CSU_PERSONNEL' ? 'e.g. Office of the Campus Director' : 'e.g. Company / Agency Name'" variant="outlined" density="comfortable" hide-details bg-color="white" />
            </div>

            <div class="input-group">
              <label class="input-label">Position / Designation</label>
              <v-text-field v-model="form.position" placeholder="e.g. Administrative Officer II" variant="outlined" density="comfortable" hide-details bg-color="white" />
            </div>

            <div class="input-group">
              <label class="input-label">Contact Number</label>
              <v-text-field v-model="form.phone" placeholder="+63 912 345 6789" variant="outlined" density="comfortable" hide-details bg-color="white" />
            </div>

            <div class="d-flex ga-2 mt-4">
              <v-btn variant="outlined" @click="prevStep"><v-icon start>mdi-arrow-left</v-icon> Back</v-btn>
              <v-btn color="success" class="login-btn flex-grow-1" @click="nextStep">Next: User Type <v-icon end>mdi-arrow-right</v-icon></v-btn>
            </div>
          </div>

          <!-- ── Step 3: User Type ── -->
          <div v-else-if="step === 3" class="login-form">
            <p class="step-title">User Classification</p>

            <div class="input-group">
              <label class="input-label">User Type</label>
              <v-select v-model="form.user_type" :items="userTypeOptions" item-title="label" item-value="value" variant="outlined" density="comfortable" hide-details bg-color="white" />
            </div>

            <div v-if="form.user_type === 'OTHERS'" class="input-group">
              <label class="input-label">Please specify <span class="req">*</span></label>
              <v-text-field v-model="form.user_type_other" placeholder="Describe your role or affiliation" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
            </div>

            <div class="d-flex ga-2 mt-2">
              <v-btn variant="outlined" @click="prevStep"><v-icon start>mdi-arrow-left</v-icon> Back</v-btn>
              <v-btn color="success" class="login-btn flex-grow-1" :disabled="!step3Valid" @click="nextStep">Review <v-icon end>mdi-arrow-right</v-icon></v-btn>
            </div>
          </div>

          <!-- ── Step 4: Review + Submit ── -->
          <div v-else-if="step === 4" class="login-form">
            <p class="step-title">Review Your Information</p>

            <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-3" closable @click:close="errorMessage = ''">{{ errorMessage }}</v-alert>

            <v-table density="compact" class="review-table mb-3">
              <tbody>
                <tr><td class="review-label">Full Name</td><td>{{ form.full_name }}</td></tr>
                <tr><td class="review-label">Email</td><td>{{ form.email }}</td></tr>
                <tr><td class="review-label">Password</td><td>••••••••</td></tr>
                <tr v-if="form.department"><td class="review-label">Office / Company</td><td>{{ form.department }}</td></tr>
                <tr v-if="form.position"><td class="review-label">Position</td><td>{{ form.position }}</td></tr>
                <tr v-if="form.phone"><td class="review-label">Contact</td><td>{{ form.phone }}</td></tr>
                <tr>
                  <td class="review-label">User Type</td>
                  <td>
                    {{ userTypeLabel }}
                    <span v-if="form.user_type === 'OTHERS' && form.user_type_other"> — {{ form.user_type_other }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div class="d-flex ga-2">
              <v-btn variant="outlined" :disabled="submitting" @click="prevStep"><v-icon start>mdi-arrow-left</v-icon> Edit</v-btn>
              <v-btn
                color="success"
                class="login-btn flex-grow-1"
                :loading="submitting"
                :disabled="!formValid || submitting"
                @click="submit"
              >
                <v-icon start>mdi-account-plus</v-icon>
                Submit Registration
              </v-btn>
            </div>
          </div>
        </template>

        <p class="form-footer">
          Already have an account?
          <a href="/login" style="color:#003300;font-weight:600">Sign In</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Two-panel layout (same as login.vue) ── */
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
    linear-gradient(135deg, #003300 0%, rgba(0,102,0,0.90) 100%),
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
.form-wrapper { width: 100%; max-width: 440px; padding: 0.25rem 0; overflow-x: hidden; }
.mobile-logo { display: block; text-align: center; margin-bottom: 1rem; }
.seal-badge { opacity: 0.95; }
.form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.25rem; text-align: center; }
.form-subtitle { font-size: 0.88rem; color: #6b7280; margin-bottom: 0.375rem; text-align: center; }

/* ── Stepper bar with connecting line ── */
.stepper-bar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  width: 100%;
  overflow: hidden;
}
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

.step-title { font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f0f0f0; }
.req { color: #e53e3e; }

/* ── Form ── */
.login-form { background: white; padding: 0.875rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
.input-group { margin-bottom: 0.5rem; }
.input-label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.35rem; }
.login-btn { font-weight: 600; letter-spacing: 0.3px; text-transform: none; border-radius: 12px; }

/* ── Review table ── */
.review-table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.review-table td { vertical-align: middle; padding: 7px 12px; }
.review-label { font-size: 0.78rem; font-weight: 600; color: #6b7280; width: 35%; white-space: nowrap; background: #fafafa; }

.form-footer { text-align: center; margin-top: 0.5rem; font-size: 0.82rem; color: #9ca3af; }

.google-btn {
  border-color: #dadce0;
  color: #3c4043;
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  border-radius: 12px;
}
.google-btn:hover {
  background-color: #f8f9fa;
}

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
