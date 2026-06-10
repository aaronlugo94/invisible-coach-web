const BASE = import.meta.env.VITE_API_URL || 'https://coach-ai-production-98fb.up.railway.app'

export const getToken  = ()  => localStorage.getItem('ic_token')
export const setToken  = (t) => localStorage.setItem('ic_token', t)
export const clearToken= ()  => { localStorage.removeItem('ic_token'); localStorage.removeItem('ic_uid') }
export const isLoggedIn= ()  => !!getToken()

async function req(method, path, body) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) { clearToken(); window.location.href = '/login'; return }
  if (!res.ok) { const e = await res.text().catch(()=>''); throw new Error(e || `Error ${res.status}`) }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : res.text()
}

export const api = {
  loginWithToken: async (token) => {
    const res = await fetch(`${BASE}/auth/login?token=${token}`)
    if (!res.ok) throw new Error('Token inválido o expirado')
    const data = await res.json()
    setToken(token)
    if (data.user_id) localStorage.setItem('ic_uid', String(data.user_id))
    return data
  },
  loginWithEmail:    (email) => req('POST', '/auth/email',        { email }),
  getMe:             ()      => req('GET',  '/api/me'),
  updateMe:          (d)     => req('PUT',  '/api/me', d),
  saveOnboarding:    (d)     => req('POST', '/api/onboarding', d),
  generarPlan:       ()      => req('POST', '/api/plan/generar'),
  getHoy:            ()      => req('GET',  '/api/hoy'),
  getMacros:         ()      => req('GET',  '/api/macros/hoy'),
  getNutricion:      ()      => req('GET',  '/api/nutricion'),
  getPesajes:        (n=30)  => req('GET',  `/api/pesajes?n=${n}`),
  getActividad:      ()      => req('GET',  '/api/actividad'),
  getAnalisis:       ()      => req('GET',  '/api/analisis'),
  getProgreso:       ()      => req('GET',  '/api/progreso'),
  getResumenSemanal: ()      => req('GET',  '/api/resumen/semanal'),
  getGoogleFitUrl:   ()      => req('GET',  '/api/google-fit/auth-url'),
  askCoach:          (q)     => req('POST', '/api/coach/ask', { pregunta: q }),
}
