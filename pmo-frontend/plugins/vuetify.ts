import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// LL-B: Built-in Vuetify date adapter — required for VDatePicker; no external package needed
import { VuetifyDateAdapter } from 'vuetify/date/adapters/vuetify'

// CSU Branding Colors (per MIS Web Development Policy).
// Tokens prefixed `figma-` are reserved for Figma-aligned components (Phase JS+); do NOT use on legacy pages.
const csuTheme = {
  dark: false,
  colors: {
    primary: '#003300',     // CSU Emerald
    secondary: '#f9dc07',  // CSU Gold
    accent: '#f9dc07',     // CSU Yellow
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'figma-primary': '#0F172A',
    'figma-surface': '#F8FAFC',
    'figma-surface-elevated': '#FFFFFF',
    'figma-accent': '#0EA5E9',
    'figma-muted': '#64748B',
    'figma-border': '#E2E8F0',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    date: {
      adapter: new VuetifyDateAdapter({ locale: 'en-PH' }),
    },
    theme: {
      defaultTheme: 'csuTheme',
      themes: {
        csuTheme,
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
      },
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
    },
  })
  app.vueApp.use(vuetify)
})
