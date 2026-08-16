import { create } from 'zustand'

// ── localStorage helpers ───────────────────────────────────────────────────
const LS_KEY = 'tricandle_settings'

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveSetting(key, value) {
  try {
    const current = loadSaved()
    localStorage.setItem(LS_KEY, JSON.stringify({ ...current, [key]: value }))
  } catch { /* ignore */ }
}

// Merge saved settings into defaults
const saved = loadSaved()

const DEFAULT_FORM = {
  source:      'api',
  apiKey:      '',
  accountType: 'live',
  instrument:  'XAU_USD',
  granularity: 'D',
  count:       500,
  allTf:       false,
}

// Keys that are persisted to localStorage
const PERSISTED_KEYS = ['apiKey', 'accountType', 'instrument', 'granularity', 'count', 'source']

const initialForm = {
  ...DEFAULT_FORM,
  ...Object.fromEntries(
    PERSISTED_KEYS
      .filter(k => saved[k] !== undefined)
      .map(k => [k, saved[k]])
  ),
}

export const useStore = create((set) => ({
  // ── analysis result ──────────────────────────────
  analysis:    null,
  setAnalysis: (a) => set({ analysis: a }),

  // ── ui state ─────────────────────────────────────
  activeTab:    'setup',
  setActiveTab: (t) => set({ activeTab: t }),

  // ── pipeline ─────────────────────────────────────
  pipeline: { fetch: 'idle', clean: 'idle', predict: 'idle', analyze: 'idle' },
  setPipeline: (key, val) =>
    set((s) => ({ pipeline: { ...s.pipeline, [key]: val } })),
  resetPipeline: () =>
    set({ pipeline: { fetch: 'idle', clean: 'idle', predict: 'idle', analyze: 'idle' } }),

  // ── form state ────────────────────────────────────
  form: initialForm,

  setForm: (patch) =>
    set((s) => {
      const next = { ...s.form, ...patch }
      // persist any changed persisted keys
      PERSISTED_KEYS.forEach(k => {
        if (patch[k] !== undefined) saveSetting(k, patch[k])
      })
      return { form: next }
    }),
}))
