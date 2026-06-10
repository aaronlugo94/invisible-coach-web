import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, isLoggedIn } from '../lib/api'
import { useStore } from '../store'

export default function Login() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { setUser, setOnboardingDone } = useStore()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (isLoggedIn()) { navigate('/', { replace: true }); return }
    const token = params.get('token')
    if (!token) return
    setLoading(true)
    api.loginWithToken(token)
      .then(async () => {
        try { const me = await api.getMe(); setUser(me); if (me?.onboarding_done) setOnboardingDone() } catch {}
        navigate('/', { replace: true })
      })
      .catch(() => setError('Token inválido o expirado. Usa /login en el bot.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleEmail(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try { await api.loginWithEmail(email); setSent(true) }
    catch { setError('Error al enviar. Usa /login en Telegram.') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="min-h-dvh bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="text-5xl mb-5">💪</div>
          <h1 className="text-3xl font-bold tracking-tight">Invisible Coach</h1>
          <p className="text-[#555] text-sm mt-2">Tu entrenador y nutriólogo personal</p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-5 text-red-300 text-sm">{error}</div>
        )}

        {sent ? (
          <div className="text-center card p-8">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-semibold mb-2">Revisa tu correo</h2>
            <p className="text-[#555] text-sm">Link de acceso enviado a <strong className="text-white">{email}</strong></p>
            <button onClick={() => setSent(false)} className="mt-5 text-sm text-[#444] underline">Usar otro correo</button>
          </div>
        ) : (<>
          <div className="card p-5 mb-5">
            <p className="text-sm font-medium mb-1">Entrar desde Telegram</p>
            <p className="text-[#555] text-xs mb-3">Escribe este comando en el bot:</p>
            <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 font-mono text-sm text-[#2AABEE] text-center">/login</div>
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1a1a1a]"/>
            <span className="text-[#333] text-xs">o con email</span>
            <div className="flex-1 h-px bg-[#1a1a1a]"/>
          </div>
          <form onSubmit={handleEmail} className="space-y-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" className="input" required/>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Recibir link →'}
            </button>
          </form>
          <p className="text-center text-[#333] text-xs mt-6">Sin contraseña. Link de un solo uso, válido 10 minutos.</p>
        </>)}
      </div>
    </div>
  )
}
