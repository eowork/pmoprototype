import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// CSU Branding Colors (per MIS Web Development Policy)
const csuTheme = {
  dark: false,
  colors: {
    primary: '#009900',    // CSU Green
    secondary: '#f9dc07',  // CSU Gold
    accent: '#ff9900',     // CSU Orange
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FFFFFF',
    surface: '#FFFFFF',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
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
