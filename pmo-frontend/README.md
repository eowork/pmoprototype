# PMO Dashboard Frontend

Nuxt 3 + Vuetify 3 frontend for the PMO Dashboard.

## Prerequisites

- Node.js 18+
- Backend running on port 3000

## Development Setup

### IMPORTANT: Startup Sequence

The backend **MUST** start before the frontend due to dev proxy configuration.

```bash
# Terminal 1: Start backend FIRST (owns port 3000)
cd pmo-backend
npm run start:dev
# Wait for: "PMO Backend running on http://localhost:3000"

# Terminal 2: Start frontend AFTER backend is ready
cd pmo-frontend
npm run dev
# Nuxt will auto-select available port (3001+)
```

### Why Order Matters

- The dev proxy forwards `/api/*` requests to `http://localhost:3000`
- If Nuxt starts first, it takes port 3000 and proxy fails
- Login would return HTML (Nuxt 404) instead of JSON

### Verify Setup

```bash
# 1. Check backend is running
curl http://localhost:3000/health

# 2. Check login endpoint directly
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Unexpected token '<'` | Backend not running or on wrong port | Start backend FIRST on 3000 |
| `Backend unreachable` alert | Proxy cannot reach backend | Verify backend is running |
| `CORS error` | Not using proxy (direct cross-origin) | Ensure dev proxy is configured |
| Login returns 404 | Nuxt intercepting `/api/*` | Backend must own port 3000 |

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
pmo-frontend/
├── composables/
│   └── useApi.ts          # HTTP client (proxy-aware)
├── stores/
│   └── auth.ts            # Pinia auth store
├── pages/
│   ├── login.vue          # Login page
│   ├── dashboard.vue      # Dashboard
│   └── projects.vue       # Construction projects
├── layouts/
│   ├── default.vue        # Main layout (AppBar + Drawer)
│   └── blank.vue          # Auth pages layout
├── middleware/
│   ├── auth.ts            # Protect authenticated routes
│   └── guest.ts           # Redirect logged-in users
└── plugins/
    └── vuetify.ts         # CSU branding theme
```

## Dev Proxy Configuration

The `nuxt.config.ts` includes:

```typescript
nitro: {
  devProxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

This forwards all `/api/*` requests to the NestJS backend during development.

## CSU Branding

- Primary: `#009900` (CSU Green)
- Secondary: `#f9dc07` (CSU Gold)
- Accent: `#ff9900` (CSU Orange)
- Font: Poppins
