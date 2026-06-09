<script setup lang="ts">
// NNN-I: User Profile page — Account Overview + Security (Change Password) tabs.
definePageMeta({
  middleware: 'auth',
})

const api = useApi()
const toast = useToast()
const route = useRoute()
const authStore = useAuthStore()

// Tab state — supports ?tab=settings / ?tab=security deep links from the user menu.
const tab = ref<string>(typeof route.query.tab === 'string' ? route.query.tab : 'overview')
// Normalize legacy/menu values to the two real tabs.
if (tab.value === 'settings') tab.value = 'overview'

const user = computed(() => authStore.user)

function initials(): string {
  const f = user.value?.firstName?.charAt(0) || ''
  const l = user.value?.lastName?.charAt(0) || ''
  return (f + l).toUpperCase() || (authStore.userFullName?.charAt(0) || 'U').toUpperCase()
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Overview: editable profile fields ──────────────────────────────
const profileForm = reactive({
  displayName: user.value?.displayName || '',
  phone: user.value?.phone || '',
})
const savingProfile = ref(false)

const profileDirty = computed(() =>
  profileForm.displayName !== (user.value?.displayName || '') ||
  profileForm.phone !== (user.value?.phone || ''),
)

async function saveProfile() {
  savingProfile.value = true
  try {
    const updated = await api.patch<any>('/api/auth/me', {
      displayName: profileForm.displayName,
      phone: profileForm.phone,
    })
    // Reflect server-confirmed values into the cached user.
    authStore.patchUser({
      displayName: updated?.display_name || '',
      phone: updated?.phone || '',
    })
    profileForm.displayName = updated?.display_name || ''
    profileForm.phone = updated?.phone || ''
    toast.success('Profile updated')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

// ── Security: change password ──────────────────────────────────────
const isSso = computed(() => user.value?.isSso ?? false)

const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const showCurrent = ref(false)
const showNew = ref(false)
const changingPw = ref(false)

const newPwStrength = computed(() => {
  const v = pwForm.newPassword
  if (!v) return { score: 0, label: '', color: 'grey' }
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  const map = [
    { label: 'Very weak', color: 'error' },
    { label: 'Weak', color: 'warning' },
    { label: 'Fair', color: 'amber' },
    { label: 'Strong', color: 'success' },
    { label: 'Very strong', color: 'success' },
  ]
  return { score, ...map[score] }
})

const pwValid = computed(() =>
  pwForm.currentPassword.length > 0 &&
  pwForm.newPassword.length >= 8 &&
  pwForm.newPassword === pwForm.confirmPassword &&
  pwForm.newPassword !== pwForm.currentPassword,
)

const confirmMismatch = computed(() =>
  pwForm.confirmPassword.length > 0 && pwForm.newPassword !== pwForm.confirmPassword,
)

async function changePassword() {
  if (!pwValid.value) return
  changingPw.value = true
  try {
    await api.post('/api/auth/change-password', {
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
      confirmPassword: pwForm.confirmPassword,
    })
    toast.success('Password changed successfully')
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirmPassword = ''
  } catch (err: any) {
    toast.error(err?.message || 'Failed to change password')
  } finally {
    changingPw.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-4">
      <h1 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">My Profile</h1>
      <p class="text-subtitle-2 text-grey-darken-1">Manage your account information and security settings.</p>
    </div>

    <v-row>
      <!-- Identity card -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="1" class="pa-5 text-center h-100">
          <v-avatar size="96" color="secondary" class="mb-3">
            <v-img v-if="authStore.userAvatarUrl" :src="authStore.userAvatarUrl" alt="Profile" cover />
            <span v-else class="text-h4 font-weight-bold text-primary">{{ initials() }}</span>
          </v-avatar>
          <div class="text-h6 font-weight-bold">{{ user?.displayName || authStore.userFullName }}</div>
          <div class="text-caption text-grey-darken-1 mb-2">{{ user?.email }}</div>
          <v-chip size="small" color="primary" variant="tonal">{{ user?.roleName || 'User' }}</v-chip>

          <v-tooltip text="Avatar upload is coming soon" location="bottom">
            <template #activator="{ props }">
              <div v-bind="props" class="mt-4">
                <v-btn size="small" variant="outlined" color="grey-darken-1" prepend-icon="mdi-camera" disabled block>
                  Upload Photo
                </v-btn>
              </div>
            </template>
          </v-tooltip>

          <v-divider class="my-4" />
          <div class="text-left">
            <div class="d-flex justify-space-between text-caption mb-2">
              <span class="text-grey-darken-1">Campus</span>
              <span class="font-weight-medium">{{ user?.campus || '—' }}</span>
            </div>
            <div class="d-flex justify-space-between text-caption mb-2">
              <span class="text-grey-darken-1">Last login</span>
              <span class="font-weight-medium">{{ formatDate(user?.lastLoginAt) }}</span>
            </div>
            <div class="d-flex justify-space-between text-caption">
              <span class="text-grey-darken-1">Password changed</span>
              <span class="font-weight-medium">{{ formatDate(user?.lastPasswordChangeAt) }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Tabbed detail -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="1" class="h-100">
          <v-tabs v-model="tab" color="primary" density="comfortable">
            <v-tab value="overview" prepend-icon="mdi-account-details">Account Overview</v-tab>
            <v-tab value="security" prepend-icon="mdi-shield-lock">Security</v-tab>
          </v-tabs>
          <v-divider />

          <v-window v-model="tab">
            <!-- Overview tab -->
            <v-window-item value="overview" class="pa-5">
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                Your name and email are managed by your administrator. You can update your display name and phone below.
              </v-alert>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="user?.firstName || '—'"
                    label="First Name"
                    variant="outlined"
                    density="compact"
                    readonly
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="user?.lastName || '—'"
                    label="Last Name"
                    variant="outlined"
                    density="compact"
                    readonly
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :model-value="user?.email || '—'"
                    label="Email"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-email"
                    readonly
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileForm.displayName"
                    label="Display Name"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-circle"
                    placeholder="How your name appears in the app"
                    clearable
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileForm.phone"
                    label="Phone"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-phone"
                    clearable
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-2">
                <v-btn
                  color="primary"
                  :loading="savingProfile"
                  :disabled="!profileDirty"
                  prepend-icon="mdi-content-save"
                  @click="saveProfile"
                >
                  Save Changes
                </v-btn>
              </div>
            </v-window-item>

            <!-- Security tab -->
            <v-window-item value="security" class="pa-5">
              <v-alert v-if="isSso" type="warning" variant="tonal" density="compact">
                Your account uses Google Sign-In. Password management is handled by Google — there is no local password to change.
              </v-alert>

              <template v-else>
                <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                  Choose a strong password of at least 8 characters. You'll need your current password to confirm.
                </v-alert>

                <v-form @submit.prevent="changePassword">
                  <v-text-field
                    v-model="pwForm.currentPassword"
                    :type="showCurrent ? 'text' : 'password'"
                    label="Current Password"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
                    autocomplete="current-password"
                    @click:append-inner="showCurrent = !showCurrent"
                  />
                  <v-text-field
                    v-model="pwForm.newPassword"
                    :type="showNew ? 'text' : 'password'"
                    label="New Password"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-lock-plus"
                    :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                    autocomplete="new-password"
                    @click:append-inner="showNew = !showNew"
                  />
                  <div v-if="pwForm.newPassword" class="mb-3">
                    <v-progress-linear
                      :model-value="(newPwStrength.score / 4) * 100"
                      :color="newPwStrength.color"
                      height="6"
                      rounded
                    />
                    <div class="text-caption mt-1" :class="`text-${newPwStrength.color}`">
                      Strength: {{ newPwStrength.label }}
                    </div>
                  </div>
                  <v-text-field
                    v-model="pwForm.confirmPassword"
                    :type="showNew ? 'text' : 'password'"
                    label="Confirm New Password"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-lock-check"
                    autocomplete="new-password"
                    :error="confirmMismatch"
                    :error-messages="confirmMismatch ? 'Passwords do not match' : ''"
                  />

                  <div class="d-flex justify-end">
                    <v-btn
                      type="submit"
                      color="primary"
                      :loading="changingPw"
                      :disabled="!pwValid"
                      prepend-icon="mdi-key-change"
                    >
                      Change Password
                    </v-btn>
                  </div>
                </v-form>
              </template>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
