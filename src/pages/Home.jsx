import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useStore } from '../store'

// ── Rings ─────────────────────────────────────────────────────────────────────
function Ring({ r, color, pct }) {
  const c = 2 * Math.PI * r
  const d = c * Math.min(pct / 100, 1)
  return <>
    <circle cx="45" cy="45" r={r} fill="none" stroke="#1a1a1a" strokeWidth="5"/>
    <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="5"
      strokeLinecap="round" strokeDasharray={`${d} ${c - d}`}
      style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
      transform="rotate(-90 45 45)"/>
  </>
}

function RingsCard({ activ }) {
  const pasos = activ?.pasos || 0
  const cals  = activ?.calorias_activas || 0
  const sleep = (activ?.sueño_total_min || 0) / 60
  const hrv   = activ?.hrv_promedio
  const pP = Math.round((pasos / 10000) * 100)
  const pC = Math.round((cals / 500) * 100)
  const pS = Math.round((sleep / 8) * 100)
  const score = Math.round((pP + pC + pS) / 3)
  return (
    <div className="card p-4 flex gap-4 items-center">
      <div className="relative w-[88px] h-[88px] flex-shrink-0">
        <svg width="88" height="88" viewBox="0 0 90 90" className="absolute inset-0">
          <Ring r={41} color="#FF6B00" pct={pC}/>
          <Ring r={33} color="#30D158" pct={pP}/>
          <Ring r={25} color="#7F77DD" pct={pS}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-lg font-bold leading-none">{score}</span>
          <span className="text-[#333] text-[9px] uppercase tracking-widest">score</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {[
          ['Calorías activas', `${cals} / 500`, '#FF6B00', pC],
          ['Pasos', `${pasos.toLocaleString()} / 10k`, '#30D158', pP],
          [hrv ? `Sueño · HRV ${Math.round(hrv)}` : 'Sueño', `${Math.round(sleep * 10) / 10}h`, '#7F77DD', pS],
        ].map(([n, v, c, p]) => (
          <div key={n} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#444]">{n}</p>
                <p className="text-[11px] font-medium text-white">{v}</p>
              </div>
              <div className="h-1 bg-[#1a1a1a] rounded-full mt-1">
                <div className="h-1 rounded-full transition-all duration-700"
                  style={{ background: c, width: `${Math.min(p, 100)}%` }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Coach AI Card ─────────────────────────────────────────────────────────────
function CoachCard({ texto, fecha }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: '#080f0a', borderColor: '#1a3a28' }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: '#1D9E75', color: '#fff' }}>★</div>
        <span className="text-xs font-medium" style={{ color: '#1D9E75' }}>
          Coach AI · {fecha || 'análisis reciente'}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#9fe1cb' }}>{texto}</p>
    </div>
  )
}

// ── Bannister Status ──────────────────────────────────────────────────────────
function BannisterCard({ hoy }) {
  const snc    = hoy?.snc_pct || 85
  const rec    = hoy?.rec_volumen || 'normal'
  const label  = hoy?.label || ''
  const semana = hoy?.semana || 1

  const color = snc >= 85 ? '#30D158' : snc >= 70 ? '#EF9F27' : '#FF453A'
  const texto = snc >= 85 ? 'Listo para carga alta'
    : snc >= 70 ? 'Recuperación moderada'
    : 'Fatiga SNC — reduce volumen hoy'
  const deload = rec === 'deload'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="label">Estado del SNC · Bannister</p>
          <p className="text-white font-semibold mt-1">Semana {semana}/4 · {label}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>{snc}%</p>
          <p className="text-[10px] text-[#444]">recuperación</p>
        </div>
      </div>
      <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-2">
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ background: color, width: `${snc}%` }}/>
      </div>
      <p className="text-xs" style={{ color }}>{texto}</p>
      {deload && (
        <div className="mt-2 bg-amber-950/50 border border-amber-800/30 rounded-xl px-3 py-2 text-xs text-amber-300">
          ⚡ Deload activo — pesos iguales, volumen -40%. Supercompensación en curso.
        </div>
      )}
    </div>
  )
}

// ── Workout Preview ───────────────────────────────────────────────────────────
function WorkoutCard({ hoy }) {
  const ejs   = (hoy?.ejercicios || []).filter(e => !e.es_cardio)
  const grupo = hoy?.grupo || ''
  const ICON  = { empuje:'💪', tiron:'🏋️', pierna:'🦵', gluteo:'🍑', core:'🎯' }

  if (!ejs.length) return (
    <div className="card p-4">
      <p className="label mb-3">Hoy</p>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌿</span>
        <div>
          <p className="text-white font-medium text-sm">Descanso activo</p>
          <p className="text-[#444] text-xs mt-0.5">Movilidad, caminata zona 2 o core ligero</p>
        </div>
      </div>
    </div>
  )

  const dur = ejs.length * 18 + 15
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="label">Hoy — gym</p>
          <p className="text-white font-semibold mt-1">{ICON[grupo] || '💪'} {grupo.toUpperCase()} · S{hoy?.semana}</p>
          <p className="text-[#444] text-xs">~{dur} min · {ejs.length} ejercicios</p>
        </div>
        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform">
          Empezar
        </button>
      </div>
      <div className="space-y-2">
        {ejs.slice(0, 3).map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[10px] text-[#444] flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-[#bbb] text-xs flex-1 truncate">{e.ejercicio}</span>
            {e.peso_sugerido && <>
              {e.es_nuevo_peso && <span className="text-green-400 text-[10px] font-medium">+5↑</span>}
              <span className="text-white text-xs font-bold bg-[#1a1a1a] px-2 py-0.5 rounded-lg">{e.peso_sugerido} lbs</span>
            </>}
          </div>
        ))}
        {ejs.length > 3 && <p className="text-[#2a2a2a] text-xs pl-8">+{ejs.length - 3} más</p>}
      </div>
    </div>
  )
}

// ── Macros Card ───────────────────────────────────────────────────────────────
function MacrosCard({ macros }) {
  const { kcal, proteina_g, carbs_g, grasas_g, es_gym, ajuste_siso, es_refeed, toma_proteina } = macros
  const aj = ajuste_siso || {}
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label">Nutrición hoy</p>
          <p className="text-white text-2xl font-bold mt-1">
            {kcal} <span className="text-sm font-normal text-[#444]">kcal</span>
          </p>
          <p className="text-[#333] text-xs">{es_gym ? 'Día de gym · carbos periworkout' : 'Día de descanso · grasas prioritarias'}</p>
        </div>
        {aj.accion && aj.accion !== 'mantener' && (
          <div className={`text-right text-xs ${aj.accion === 'reducir' ? 'text-red-400' : 'text-green-400'}`}>
            <p className="font-bold">{aj.accion === 'reducir' ? '−' : '+'}{aj.kcal} kcal</p>
            <p className="text-[#333] text-[10px]">Ajuste SISO</p>
          </div>
        )}
      </div>
      {es_refeed && (
        <div className="text-xs text-amber-300 bg-amber-950/50 border border-amber-800/30 rounded-xl px-3 py-2 mb-3">
          🔄 Semana de refeed — comes a mantenimiento esta semana (restaurando leptina)
        </div>
      )}
      <div className="space-y-2.5">
        {[
          ['Proteína', proteina_g, '#FF6B00', 280],
          ['Carbs',    carbs_g,    '#EF9F27', 400],
          ['Grasas',   grasas_g,   '#378ADD', 120],
        ].map(([n, v, c, max]) => (
          <div key={n} className="flex items-center gap-3">
            <span className="text-[#444] text-xs w-14">{n}</span>
            <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ background: c, width: `${Math.min((v / max) * 100, 100)}%` }}/>
            </div>
            <span className="text-white text-xs font-medium w-10 text-right">{v}g</span>
          </div>
        ))}
      </div>
      {toma_proteina && (
        <p className="text-[#333] text-[10px] mt-3">
          {toma_proteina}g × 4 tomas · separar 3-4h (threshold leucina) · +40g caseína antes de dormir
        </p>
      )}
    </div>
  )
}

// ── Sleep Card ────────────────────────────────────────────────────────────────
function SleepCard({ activ }) {
  const total = activ?.sueño_total_min || 0
  const deep  = activ?.sueño_profundo_min || 0
  const rem   = activ?.sueño_rem_min || 0
  const hrv   = activ?.hrv_promedio
  const fc    = activ?.fc_reposo
  const h     = Math.round(total / 60 * 10) / 10
  const recovery = hrv && fc
    ? Math.min(100, Math.round((hrv / 70) * 60 + ((70 - Math.min(fc, 70)) / 70) * 40))
    : null
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="label">Sueño</p>
          <p className="text-white font-semibold mt-1">
            {h}h · {h >= 7.5 ? 'Óptimo' : h >= 6 ? 'Bueno' : 'Insuficiente'}
          </p>
        </div>
        {hrv && <p className="text-xs font-medium" style={{ color: '#7F77DD' }}>HRV {Math.round(hrv)} ms</p>}
      </div>
      <div className="flex items-end gap-1 h-10 mb-3">
        {[
          [deep/total*100||0,  '#3C3489'], [deep/total*85||0,  '#3C3489'],
          [rem/total*100||0,   '#534AB7'], [rem/total*90||0,   '#7F77DD'],
          [(total-deep-rem)/total*100||0, '#AFA9EC'],
          [(total-deep-rem)/total*80||0,  '#AFA9EC'],
          [(total-deep-rem)/total*60||0,  '#AFA9EC'],
        ].map(([pct, c], i) => (
          <div key={i} className="flex-1 rounded-t-sm"
            style={{ height: `${Math.max(pct, 8)}%`, background: c }}/>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1a1a1a]">
        {[
          ['Profundo', `${Math.round(deep/60*10)/10}h`, '#3C3489'],
          ['REM',      `${Math.round(rem/60*10)/10}h`,  '#7F77DD'],
          ['Recovery', recovery ? `${recovery}%` : '—',  '#30D158'],
        ].map(([l, v, c]) => (
          <div key={l} className="text-center">
            <p className="text-[10px] text-[#444]">{l}</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>
      {(hrv || fc) && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1a1a1a]">
          {hrv && <div className="text-center"><p className="text-[10px] text-[#444]">HRV</p><p className="text-sm font-bold text-green-400">{Math.round(hrv)}</p></div>}
          {fc  && <div className="text-center"><p className="text-[10px] text-[#444]">FC reposo</p><p className="text-sm font-bold text-blue-400">{Math.round(fc)}</p></div>}
        </div>
      )}
    </div>
  )
}

// ── Week Card ─────────────────────────────────────────────────────────────────
function WeekCard({ hoy }) {
  const D = ['L','M','X','J','V','S','D']
  const completados = hoy?.dias_completados || []
  const diasGym = hoy?.dias_gym || []
  const hoyIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  return (
    <div className="card p-4">
      <p className="label mb-3">Esta semana</p>
      <div className="grid grid-cols-7 gap-1">
        {D.map((d, i) => {
          const done  = completados.includes(i)
          const today = i === hoyIdx
          const gym   = diasGym.includes(i)
          return (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-[#333]">{d}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                done  ? 'bg-[#1D9E75] text-white' :
                today ? 'border border-white text-white' :
                gym   ? 'bg-[#111] text-[#333] border border-[#222]' :
                        'text-[#222]'}`}>
                {done ? '✓' : today ? '●' : gym ? '○' : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useStore()
  const nombre = user?.nombre?.split(' ')[0] || 'ahí'
  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'

  const { data: hoy }      = useQuery({ queryKey:['hoy'],     queryFn: api.getHoy,      refetchInterval: 60_000 })
  const { data: macros }   = useQuery({ queryKey:['macros'],  queryFn: api.getMacros })
  const { data: analisis } = useQuery({ queryKey:['analisis'],queryFn: api.getAnalisis })
  const { data: activ }    = useQuery({ queryKey:['activ'],   queryFn: api.getActividad })

  const racha  = hoy?.racha || 0
  const semana = hoy?.semana || 1
  const dia    = hoy?.dia || ''

  return (
    <div className="page">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#444] text-sm">{saludo}</p>
            <h1 className="text-2xl font-bold tracking-tight">{nombre} 👋</h1>
            <p className="text-[#333] text-xs mt-0.5">
              {dia && `${dia.charAt(0).toUpperCase() + dia.slice(1)} · `}Semana {semana}/4
            </p>
          </div>
          {racha >= 2 && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-white text-sm font-bold leading-none">{racha}</p>
                <p className="text-[#444] text-[10px]">días</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 stagger">
        <div className="section fade-up"><RingsCard activ={activ}/></div>
        {hoy && <div className="section fade-up"><BannisterCard hoy={hoy}/></div>}
        {analisis?.texto && <div className="section fade-up"><CoachCard texto={analisis.texto} fecha={analisis.fecha}/></div>}
        <div className="section fade-up"><WorkoutCard hoy={hoy}/></div>
        {macros && <div className="section fade-up"><MacrosCard macros={macros}/></div>}
        {(activ?.sueño_total_min > 0) && <div className="section fade-up"><SleepCard activ={activ}/></div>}
        <div className="section fade-up"><WeekCard hoy={hoy}/></div>
      </div>
      <div className="h-4"/>
    </div>
  )
}
