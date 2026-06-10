import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken } from '../lib/api'
import { useStore } from '../store'

export default function Perfil() {
  const { user, updateUser, clear } = useStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [d, setD] = useState({nombre:'',email:'',peso_kg:'',altura_cm:'',hora_gym:'',hora_reminder:''})
  const set = (k,v) => setD(p=>({...p,[k]:v}))

  useEffect(()=>{
    if (user) setD({
      nombre:       user.nombre||'',
      email:        user.email||'',
      peso_kg:      user.peso_kg||'',
      altura_cm:    user.altura_cm||'',
      hora_gym:     user.hora_gym||'17:00',
      hora_reminder:user.hora_reminder||'',
    })
  },[user])

  async function save(e) {
    e.preventDefault(); setSaving(true)
    try {
      const h = parseInt(d.hora_gym?.split(':')[0]||17)
      const up = await api.updateMe({
        nombre: d.nombre, email: d.email,
        peso_kg: parseFloat(d.peso_kg), altura_cm: parseFloat(d.altura_cm),
        hora_gym: d.hora_gym,
        hora_reminder: `${((h-2+24)%24).toString().padStart(2,'0')}:00`,
        hora_checkin:  `${((h+2)%24).toString().padStart(2,'0')}:00`,
      })
      updateUser(up)
      setSaved(true); setTimeout(()=>setSaved(false),2000)
    } catch {} finally { setSaving(false) }
  }

  async function conectarFit() {
    try { const res = await api.getGoogleFitUrl(); if (res?.url) window.open(res.url,'_blank') } catch {}
  }

  function logout() { clearToken(); clear(); navigate('/login',{replace:true}) }

  const h = parseInt(d.hora_gym?.split(':')[0]||17)
  const briefing = `${((h-2+24)%24).toString().padStart(2,'0')}:00`
  const checkin  = `${((h+2)%24).toString().padStart(2,'0')}:00`

  return (
    <div className="page">
      <div className="px-4 pt-12 pb-4">
        <p className="label">Ajustes</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Tu perfil</h1>
      </div>
      <form onSubmit={save} className="section space-y-4">

        <div className="card p-4 space-y-4">
          <p className="label">Personal</p>
          {[['nombre','Nombre','Aaron García','text'],['email','Email','tu@email.com','email']].map(([k,l,ph,t])=>(
            <div key={k}>
              <label className="label block mb-1.5">{l}</label>
              <input className="input" type={t} placeholder={ph} value={d[k]} onChange={e=>set(k,e.target.value)}/>
            </div>
          ))}
        </div>

        <div className="card p-4 space-y-4">
          <p className="label">Cuerpo</p>
          <div className="grid grid-cols-2 gap-3">
            {[['peso_kg','Peso (kg)','0.1'],['altura_cm','Altura (cm)','1']].map(([k,l,s])=>(
              <div key={k}>
                <label className="label block mb-1.5">{l}</label>
                <input className="input" type="number" step={s} value={d[k]} onChange={e=>set(k,e.target.value)}/>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="label mb-3">Horario de entrenamiento</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[['07:00','🌅 7am'],['12:00','☀️ 12pm'],['17:00','🌆 5pm'],['20:00','🌙 8pm']].map(([v,l])=>(
              <button key={v} type="button" onClick={()=>set('hora_gym',v)}
                className={`py-2.5 rounded-xl border text-xs transition-all ${d.hora_gym===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
            ))}
          </div>
          <div className="surface p-3 space-y-1">
            <p className="text-[#444] text-xs">📅 Briefing matutino: <span className="text-white">{briefing}</span></p>
            <p className="text-[#444] text-xs">🌙 Check-in nocturno: <span className="text-white">{checkin}</span></p>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Google Fit</p>
            <p className="text-[#444] text-xs mt-0.5">
              {user?.google_fit_token ? '✅ Conectado · HRV y sueño activos' : 'Conecta tu OnePlus Watch 4'}
            </p>
          </div>
          <button type="button" onClick={conectarFit}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${user?.google_fit_token?'border-[#1D9E75] text-[#1D9E75]':'border-[#333] text-white'}`}>
            {user?.google_fit_token ? 'Reconectar' : 'Conectar'}
          </button>
        </div>

        {user && (
          <div className="card p-4">
            <p className="label mb-3">Resumen de tu plan</p>
            <div className="space-y-1.5 text-xs text-[#555]">
              {[
                ['Objetivo', user.objetivo_vida],
                ['Nivel',    user.nivel],
                ['Días',     `${user.dias_semana} días/semana`],
                ['Duración', `${user.duracion_sesion||60} min/sesión`],
                ['Dieta',    user.tipo_dieta],
                ['Estrés',   user.nivel_estres],
                ['Wearable', user.wearable],
              ].map(([k,v])=> v && (
                <div key={k} className="flex justify-between">
                  <span>{k}</span><span className="text-[#888]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving?'Guardando...':saved?'✓ Guardado':'Guardar cambios'}
        </button>
        <button type="button" onClick={logout} className="w-full py-3 text-sm text-[#333] hover:text-red-400 transition-colors">
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
