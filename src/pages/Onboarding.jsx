import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useStore } from '../store'

const OBJETIVOS = [
  { id:'recomposicion', e:'⚡', t:'Recomposición',     s:'Perder grasa Y ganar músculo a la vez' },
  { id:'deficit',       e:'🔥', t:'Bajar grasa',        s:'Perder peso reteniendo el músculo' },
  { id:'volumen',       e:'💪', t:'Volumen limpio',     s:'Ganar músculo sin engordar mucho' },
  { id:'gluteo',        e:'🍑', t:'Glúteo y pierna',    s:'Enfoque en tren inferior' },
  { id:'salud',         e:'🏃', t:'Salud y energía',    s:'Estar activo y sentirme mejor' },
]
const NIVELES = [
  { id:'principiante', e:'🌱', t:'Menos de 6 meses',  s:'Tu cuerpo responde rápido ahora — ganancias veloces' },
  { id:'intermedio',   e:'💪', t:'6 meses a 2 años',  s:'Necesitas progresión sistemática para seguir creciendo' },
  { id:'avanzado',     e:'🔥', t:'Más de 2 años',     s:'Requieres alta intensidad para progresar' },
]
const DIETAS = [
  { id:'omnivoro',  e:'🍗', t:'Omnívoro',      s:'Como de todo' },
  { id:'saludable', e:'🥗', t:'Saludable',      s:'Comida real, evito ultra-procesados' },
  { id:'proteina',  e:'🍖', t:'Alta proteína', s:'La proteína es mi prioridad' },
  { id:'vegano',    e:'🌱', t:'Vegano',         s:'Sin productos de origen animal' },
  { id:'keto',      e:'🥑', t:'Keto',           s:'Muy pocos carbohidratos' },
]
const COCINAS = [
  {id:'mexicana',e:'🌮',t:'Mexicana / Latina'},  {id:'americana',e:'🍔',t:'Americana / BBQ'},
  {id:'italiana',e:'🍝',t:'Italiana / Mediter.'},{id:'asiatica',e:'🍱',t:'Asiática'},
  {id:'arabe',e:'🫔',t:'Árabe / Medio Oriente'}, {id:'india',e:'🍛',t:'India'},
  {id:'española',e:'🥘',t:'Española'},           {id:'francesa',e:'🫕',t:'Francesa'},
  {id:'variada',e:'🌍',t:'Sin preferencia'},
]
const PROTEINAS = [
  {id:'pollo',e:'🍗',t:'Pollo'},       {id:'res',e:'🥩',t:'Res/Bistec'},
  {id:'atun',e:'🐟',t:'Atún'},          {id:'huevo',e:'🍳',t:'Huevo'},
  {id:'cerdo',e:'🐷',t:'Cerdo'},        {id:'salmon',e:'🐟',t:'Salmón'},
  {id:'camarones',e:'🍤',t:'Camarones'},{id:'pavo',e:'🦃',t:'Pavo'},
  {id:'legumbres',e:'🫘',t:'Legumbres'},{id:'dairy',e:'🥛',t:'Dairy/Caseína'},
  {id:'requesón',e:'🧀',t:'Requesón'},  {id:'tofu',e:'🌱',t:'Tofu/Tempeh'},
]
const RESTRICCIONES = [
  {id:'lacteos',e:'🥛',t:'Sin lácteos'},{id:'gluten',e:'🌾',t:'Sin gluten'},
  {id:'mani',e:'🥜',t:'Sin maní'},{id:'huevo',e:'🥚',t:'Sin huevo'},
  {id:'mariscos',e:'🦐',t:'Sin mariscos'},{id:'cerdo',e:'🐖',t:'Sin cerdo'},
  {id:'vegano',e:'🌱',t:'Vegano estricto'},
]
const ELECTRO = [
  {id:'air_fryer',e:'🍳',t:'Air fryer'},      {id:'slow_cooker',e:'🍲',t:'Slow cooker'},
  {id:'microondas',e:'📡',t:'Microondas'},     {id:'horno',e:'🔥',t:'Horno'},
  {id:'licuadora',e:'🥤',t:'Licuadora'},       {id:'pressure_cooker',e:'⚡',t:'Pressure cooker'},
  {id:'arrocera',e:'🍚',t:'Arrocera'},          {id:'sandwichera',e:'🥪',t:'Sandwichera'},
  {id:'estufa',e:'🍳',t:'Sartén/estufa'},
]
const TIEMPOS_COMIDA = [
  { v:10, l:'⚡ <10 min' }, { v:20, l:'🕐 10-20 min' },
  { v:40, l:'🍳 20-40 min' }, { v:60, l:'👨‍🍳 +40 min' },
]

function Bar({ step, total=6 }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({length:total}).map((_,i) => (
        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i<=step?'bg-white':'bg-[#222]'} ${i===step?'flex-[2]':'flex-1'}`}/>
      ))}
    </div>
  )
}

function Opt({ sel, onClick, e, t, s }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${sel?'border-white bg-white/8':'border-[#222] bg-[#111] hover:border-[#444]'}`}>
      <span className="text-xl flex-shrink-0">{e}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${sel?'text-white':'text-[#bbb]'}`}>{t}</p>
        {s && <p className="text-[#444] text-xs mt-0.5">{s}</p>}
      </div>
      {sel && <span className="text-white flex-shrink-0">✓</span>}
    </button>
  )
}

function Multi({ opts, sel, onToggle, max }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {opts.map(o => {
        const on = sel.includes(o.id)
        const disabled = max && !on && sel.length >= max
        return (
          <button key={o.id} disabled={disabled} onClick={() => onToggle(o.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${on?'border-white bg-white/8 text-white':'border-[#222] text-[#666]'} ${disabled?'opacity-30':''}`}>
            <span className="text-base">{o.e}</span>
            <span className="text-xs">{o.t}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser, setOnboardingDone } = useStore()
  const [step, setStep] = useState(0) // 0=wearable, 1=perfil, 2=experiencia, 3=alimentacion, 4=recuperacion, 5=final
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')
  const [fitConectado, setFitConectado] = useState(false)
  const [fitDatos, setFitDatos] = useState(null)

  const [d, setD] = useState({
    wearable:'',
    nombre:'', email:'', fecha_nac:'', sexo:'',
    peso_kg:'', altura_cm:'',
    objetivo:'', nivel:'', dias:4, duracion:60,
    hora_gym:'17:00', ambiente:'gym', limitaciones:'ninguna',
    dieta:'omnivoro', cocinas:[], n_comidas:3,
    tiempos_comida:{ desayuno:20, comida:40, cena:40 },
    proteinas:[], restricciones:[], prep:'casa',
    suplementos:'ninguno', alcohol:'no',
    electrodomesticos: ELECTRO.map(e=>e.id), // todos marcados por default
    sueño:7.5, trabajo:'moderado', estres:'moderado',
    recuperacion_activa:[],
    generar:'todo', // gym | dieta | todo
  })

  const set = (k,v) => setD(p => ({...p,[k]:v}))
  const tog = (k,id) => setD(p => ({...p,[k]:p[k].includes(id)?p[k].filter(x=>x!==id):[...p[k],id]}))
  const setTiempo = (comida, min) => setD(p => ({...p, tiempos_comida:{...p.tiempos_comida, [comida]:min}}))

  // Al elegir wearable Google Fit, intentar leer datos ya conectados
  useEffect(() => {
    if (d.wearable === 'google_fit') {
      (async () => {
        try {
          const res = await api.checkGoogleFit?.()
          if (res?.conectado) {
            setFitConectado(true)
            setFitDatos(res.datos || null)
            if (res.datos?.peso_kg) set('peso_kg', String(res.datos.peso_kg))
            if (res.datos?.sueño_horas) set('sueño', res.datos.sueño_horas)
          }
        } catch {}
      })()
    }
  }, [d.wearable])

  const RA_OPTS = [
    {id:'caminar',e:'🚶',t:'Caminar'},{id:'yoga',e:'🧘',t:'Yoga/Estiramiento'},
    {id:'bici',e:'🚴',t:'Bicicleta'},{id:'natacion',e:'🏊',t:'Natación'},
    {id:'trote',e:'🏃',t:'Trote suave'},
  ]

  function canNext() {
    if (step===0) return !!d.wearable
    if (step===1) return d.nombre && d.sexo && d.fecha_nac && d.peso_kg && d.altura_cm
    if (step===2) return d.objetivo && d.nivel && d.ambiente
    if (step===3) return d.dieta
    return true
  }

  const bmrPreview = (() => {
    const p = parseFloat(d.peso_kg), h = parseFloat(d.altura_cm)
    if (!p||!h) return null
    const edad = d.fecha_nac ? Math.floor((Date.now()-new Date(d.fecha_nac))/31_557_600_000) : 30
    const bmr = d.sexo==='mujer' ? Math.round(10*p+6.25*h-5*edad-161) : Math.round(10*p+6.25*h-5*edad+5)
    const FACT = {sedentario:1.2,moderado:1.375,activo:1.55,muy_activo:1.725}
    return { bmr, tdee: Math.round(bmr*(FACT[d.trabajo]||1.375)) }
  })()

  const comidasActivas = d.n_comidas <= 3
    ? ['desayuno','comida','cena'].slice(0, d.n_comidas)
    : ['desayuno','comida','cena','snack']

  const NOMBRE_COMIDA = { desayuno:'Desayuno', comida:'Comida', cena:'Cena', snack:'Snack' }

  async function handleNext() {
    if (step < 5) { setStep(s=>s+1); return }
    setBusy(true); setErr('')
    try {
      const h = parseInt(d.hora_gym.split(':')[0])
      const payload = {
        nombre: d.nombre, email: d.email, fecha_nac: d.fecha_nac, sexo: d.sexo,
        peso_kg: parseFloat(d.peso_kg), altura_cm: parseFloat(d.altura_cm),
        objetivo_vida: d.objetivo, nivel: d.nivel, ambiente: d.ambiente,
        dias_semana: Number(d.dias), duracion_sesion: Number(d.duracion),
        limitaciones: d.limitaciones,
        hora_gym: d.hora_gym,
        hora_reminder: `${((h-2+24)%24).toString().padStart(2,'0')}:00`,
        hora_checkin:  `${((h+2)%24).toString().padStart(2,'0')}:00`,
        tipo_dieta: d.dieta,
        cocina: d.cocinas.length ? d.cocinas.join(',') : 'variada',
        n_comidas: d.n_comidas,
        tiempos_comida: JSON.stringify(d.tiempos_comida),
        proteinas_favoritas: d.proteinas.length ? d.proteinas.join(',') : 'pollo,huevo,atun',
        alergias: d.restricciones.length ? d.restricciones.join(',') : 'ninguna',
        donde_come: d.prep, suplementos: d.suplementos, alcohol: d.alcohol,
        electrodomesticos: d.electrodomesticos.join(','),
        sueño_horas: d.sueño, actividad_nivel: d.trabajo,
        nivel_estres: d.estres, wearable: d.wearable,
        recuperacion_activa: d.recuperacion_activa.length ? d.recuperacion_activa.join(',') : 'caminar',
      }
      const res = await api.saveOnboarding(payload)
      setUser(res?.usuario || payload)
      if (d.generar === 'gym' || d.generar === 'todo') {
        try { await api.generarPlan() } catch {}
      }
      if (d.generar === 'dieta' || d.generar === 'todo') {
        try { await api.generarNutricion?.() } catch {}
      }
      setOnboardingDone()
      navigate('/', { replace:true })
    } catch(e) { setErr(e.message || 'Error. Intenta de nuevo.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col" style={{maxWidth:430,margin:'0 auto'}}>
      <div className="flex-1 overflow-y-auto px-5 pt-14 pb-6">
        <Bar step={step}/>

        {step===0 && (
          <div className="fade-up space-y-5">
            <div><h2 className="text-2xl font-bold">Conecta tu reloj</h2>
              <p className="text-[#444] text-sm mt-1">Si tienes datos de peso, altura y sueño en una app, los importamos automáticamente y saltamos esas preguntas</p></div>
            <div className="space-y-2">
              {[
                {v:'google_fit', e:'⌚', t:'Google Fit / WearOS', s:'OnePlus, Pixel Watch, WearOS'},
                {v:'apple', e:'🍎', t:'Apple Health', s:'Lo ingresarás manualmente'},
                {v:'samsung', e:'📱', t:'Samsung Health', s:'Lo ingresarás manualmente'},
                {v:'ninguno', e:'📊', t:'Sin reloj', s:'Solo uso báscula'},
              ].map(o => <Opt key={o.v} sel={d.wearable===o.v} onClick={()=>set('wearable',o.v)} e={o.e} t={o.t} s={o.s}/>)}
            </div>
            {d.wearable === 'google_fit' && !fitConectado && (
              <button onClick={()=>api.getGoogleFitUrl?.().then(r=>r?.url && window.open(r.url,'_blank'))}
                className="btn-secondary w-full">🔗 Conectar Google Fit</button>
            )}
            {fitConectado && (
              <div className="card p-4">
                <p className="text-green-400 text-sm font-medium">✅ Google Fit conectado</p>
                {fitDatos?.peso_kg && <p className="text-[#666] text-xs mt-1">Peso detectado: {fitDatos.peso_kg} kg</p>}
                {fitDatos?.sueño_horas && <p className="text-[#666] text-xs">Sueño promedio: {fitDatos.sueño_horas}h</p>}
              </div>
            )}
          </div>
        )}

        {step===1 && (
          <div className="fade-up space-y-5">
            <div><h2 className="text-2xl font-bold">Perfil biológico</h2>
              <p className="text-[#444] text-sm mt-1">La base de todos los cálculos científicos</p></div>
            <div><label className="label block mb-1.5">Tu nombre</label>
              <input className="input" placeholder="Aaron" value={d.nombre} onChange={e=>set('nombre',e.target.value)}/></div>
            <div><label className="label block mb-1.5">Correo electrónico</label>
              <input className="input" type="email" placeholder="tu@email.com" value={d.email} onChange={e=>set('email',e.target.value)}/></div>
            <div><label className="label block mb-1.5">Fecha de nacimiento</label>
              <input className="input" type="date" value={d.fecha_nac} onChange={e=>set('fecha_nac',e.target.value)}/></div>
            <div><label className="label block mb-2">Sexo biológico</label>
              <div className="grid grid-cols-2 gap-3">
                {[['hombre','Hombre'],['mujer','Mujer']].map(([v,l]) => (
                  <button key={v} onClick={()=>set('sexo',v)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${d.sexo===v?'border-white bg-white/8 text-white':'border-[#222] text-[#666]'}`}>{l}</button>
                ))}</div>
              <p className="text-[#333] text-xs mt-1">Necesario para Mifflin-St Jeor (BMR)</p></div>
            <div>
              <label className="label block mb-1.5">Peso actual {fitConectado && d.peso_kg && <span className="text-green-400 normal-case">· detectado de Fit</span>}</label>
              <div className="flex gap-2 items-center">
                <input className="input" type="number" min="30" max="300" step="0.1" placeholder="113"
                  value={d.peso_kg} onChange={e=>set('peso_kg',e.target.value)}/>
                <span className="text-[#444] text-sm flex-shrink-0">kg</span>
              </div>
              {d.peso_kg && <p className="text-[#333] text-xs mt-1">{Math.round(parseFloat(d.peso_kg)*2.205)} lbs</p>}
            </div>
            <div>
              <label className="label block mb-1.5">Altura</label>
              <div className="flex gap-2 items-center">
                <input className="input" type="number" min="130" max="230" placeholder="186"
                  value={d.altura_cm} onChange={e=>set('altura_cm',e.target.value)}/>
                <span className="text-[#444] text-sm flex-shrink-0">cm</span>
              </div>
              <p className="text-[#333] text-xs mt-1">La altura siempre se ingresa manual — ningún wearable la reporta</p>
            </div>
            {bmrPreview && (
              <div className="card p-4">
                <p className="label mb-3">Metabolismo estimado</p>
                <div className="grid grid-cols-2 gap-3">
                  {[['BMR',bmrPreview.bmr+' kcal','En reposo absoluto'],['TDEE',bmrPreview.tdee+' kcal','Con actividad moderada']].map(([k,v,s])=>(
                    <div key={k} className="surface p-3">
                      <p className="text-[#444] text-xs">{k}</p>
                      <p className="text-white font-bold text-lg mt-0.5">{v}</p>
                      <p className="text-[#333] text-xs">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step===2 && (
          <div className="fade-up space-y-6">
            <div><h2 className="text-2xl font-bold">Entrenamiento</h2>
              <p className="text-[#444] text-sm mt-1">Diseñamos el plan según tu historial real</p></div>
            <div><p className="label mb-3">¿Cuál es tu objetivo a 90 días?</p>
              <div className="space-y-2">{OBJETIVOS.map(o=><Opt key={o.id} sel={d.objetivo===o.id} onClick={()=>set('objetivo',o.id)} {...o}/>)}</div></div>
            <div><p className="label mb-3">¿Cuánto tiempo llevas entrenando fuerza?</p>
              <div className="space-y-2">{NIVELES.map(n=><Opt key={n.id} sel={d.nivel===n.id} onClick={()=>set('nivel',n.id)} {...n}/>)}</div></div>
            <div><p className="label mb-3">Días disponibles a la semana</p>
              <div className="grid grid-cols-4 gap-2">
                {[3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>set('dias',n)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${d.dias===n?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{n}d</button>
                ))}</div></div>
            <div><p className="label mb-3">Tiempo por sesión</p>
              <div className="grid grid-cols-3 gap-2">
                {[[45,'⚡ 45 min'],[60,'💪 60 min'],[90,'🏆 90 min']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('duracion',v)}
                    className={`py-3 rounded-xl border text-xs text-center transition-all ${d.duracion===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div><p className="label mb-3">¿A qué hora entrenas?</p>
              <div className="grid grid-cols-2 gap-2">
                {[['07:00','🌅 Mañana (7am)'],['12:00','☀️ Mediodía'],['17:00','🌆 Tarde (5pm)'],['20:00','🌙 Noche (8pm)']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('hora_gym',v)}
                    className={`py-3 px-3 rounded-xl border text-xs text-left transition-all ${d.hora_gym===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div><p className="label mb-3">¿Dónde entrenas?</p>
              <div className="grid grid-cols-3 gap-2">
                {[['gym','🏋️ Gym'],['home','🏠 Casa'],['band','🦺 Banda']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('ambiente',v)}
                    className={`py-3 rounded-xl border text-xs text-center transition-all ${d.ambiente===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div><p className="label mb-3">Lesiones o limitaciones</p>
              <div className="grid grid-cols-2 gap-2">
                {[['ninguna','✅ Ninguna'],['rodilla','🦵 Rodilla'],['espalda','🔙 Espalda baja'],['hombro','💪 Hombro'],
                  ['lumbar','🔙 Lumbar crónico'],['it_band','🏃 Rodilla de corredor']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('limitaciones',v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs text-left transition-all ${d.limitaciones===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
          </div>
        )}

        {step===3 && (
          <div className="fade-up space-y-6">
            <div><h2 className="text-2xl font-bold">Alimentación</h2>
              <p className="text-[#444] text-sm mt-1">Para un plan que realmente puedas seguir</p></div>
            <div><p className="label mb-3">¿Cómo describes tu dieta?</p>
              <div className="space-y-2">{DIETAS.map(o=><Opt key={o.id} sel={d.dieta===o.id} onClick={()=>set('dieta',o.id)} {...o}/>)}</div></div>
            <div><p className="label mb-3">Cocinas favoritas <span className="normal-case text-[#333]">(hasta 4)</span></p>
              <Multi opts={COCINAS} sel={d.cocinas} onToggle={id=>tog('cocinas',id)} max={4}/></div>
            <div><p className="label mb-3">¿Cuántas comidas principales haces al día?</p>
              <div className="grid grid-cols-3 gap-2">
                {[[2,'2 comidas'],[3,'3 comidas'],[4,'4+ comidas']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('n_comidas',v)}
                    className={`py-3 rounded-xl border text-xs text-center transition-all ${d.n_comidas===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div>
              <p className="label mb-3">Tiempo disponible por comida</p>
              <div className="space-y-3">
                {comidasActivas.map(c => (
                  <div key={c}>
                    <p className="text-[#666] text-xs mb-1.5">{NOMBRE_COMIDA[c]}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIEMPOS_COMIDA.map(t => (
                        <button key={t.v} onClick={()=>setTiempo(c, t.v)}
                          className={`py-2 rounded-lg border text-[10px] text-center transition-all ${d.tiempos_comida[c]===t.v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{t.l}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-3">Proteínas favoritas <span className="normal-case text-[#333]">(sin límite)</span></p>
              <Multi opts={PROTEINAS} sel={d.proteinas} onToggle={id=>tog('proteinas',id)}/>
              <p className="text-[#333] text-xs mt-1">{d.proteinas.length} seleccionadas</p>
            </div>
            <div><p className="label mb-3">Restricciones alimentarias</p><Multi opts={RESTRICCIONES} sel={d.restricciones} onToggle={id=>tog('restricciones',id)}/></div>
            <div><p className="label mb-3">¿Cómo preparas tus comidas?</p>
              <div className="grid grid-cols-2 gap-2">
                {[['casa','🍳 Cocino en casa'],['batch','📦 Batch cooking'],['rapido','⚡ Rápido 20 min'],['fuera','🏃 Como fuera']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('prep',v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs text-left transition-all ${d.prep===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div><p className="label mb-3">Suplementos que tomas</p>
              <div className="grid grid-cols-2 gap-2">
                {[['ninguno','Ninguno'],['whey','Proteína whey'],['creatina','Creatina'],['whey_creatina','Whey + Creatina'],['multi','Multivitamínico'],['varios','Varios']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('suplementos',v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs text-left transition-all ${d.suplementos===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div><p className="label mb-3">¿Consumes alcohol?</p>
              <div className="grid grid-cols-2 gap-2">
                {[['no','❌ No consumo'],['ocasional','🍷 Ocasional'],['moderado','🍺 Moderado'],['frecuente','🍻 Frecuente']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('alcohol',v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs text-left transition-all ${d.alcohol===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div></div>
            <div>
              <p className="label mb-3">Electrodomésticos <span className="normal-case text-[#333]">(quita lo que no tengas)</span></p>
              <Multi opts={ELECTRO} sel={d.electrodomesticos} onToggle={id=>tog('electrodomesticos',id)}/>
            </div>
          </div>
        )}

        {step===4 && (
          <div className="fade-up space-y-6">
            <div><h2 className="text-2xl font-bold">Recuperación</h2>
              <p className="text-[#444] text-sm mt-1">El modelo Bannister usa estos datos para ajustar tu plan</p></div>
            <div>
              <p className="label mb-2">Horas de sueño por noche: <span className="text-white normal-case font-medium">{d.sueño}h</span>
                {fitConectado && fitDatos?.sueño_horas && <span className="text-green-400 normal-case text-xs ml-2">· detectado de Fit</span>}</p>
              <input type="range" min="4" max="10" step="0.5" value={d.sueño} onChange={e=>set('sueño',parseFloat(e.target.value))} className="w-full accent-white"/>
              <div className="flex justify-between text-[#333] text-xs mt-1"><span>4h</span><span>10h</span></div>
              {d.sueño < 6.5 && <p className="text-amber-400 text-xs mt-1.5">⚠️ Menos de 6.5h reduce síntesis proteica hasta 30%.</p>}
              {d.sueño >= 8 && <p className="text-green-400 text-xs mt-1.5">✅ Recuperación óptima garantizada.</p>}
            </div>
            <div><p className="label mb-3">¿Cómo es tu trabajo o actividad diaria?</p>
              <div className="space-y-2">
                {[['sedentario','💺','Sedentario','Oficina, trabajo desde casa'],['moderado','🚶','Moderado','Me muevo algo durante el día'],['activo','🏗️','Activo','De pie o en movimiento constante'],['muy_activo','🏃','Muy activo','Trabajo físico intenso']].map(([v,e,t,s])=>(
                  <Opt key={v} sel={d.trabajo===v} onClick={()=>set('trabajo',v)} e={e} t={t} s={s}/>
                ))}</div></div>
            <div><p className="label mb-3">Nivel de estrés habitual</p>
              <div className="grid grid-cols-2 gap-2">
                {[['bajo','😌 Bajo'],['moderado','😐 Moderado'],['alto','😤 Alto'],['muy_alto','🤯 Muy alto']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('estres',v)}
                    className={`py-3 px-3 rounded-xl border text-xs transition-all ${d.estres===v?'border-white bg-white/8 text-white':'border-[#222] text-[#555]'}`}>{l}</button>
                ))}</div>
              <p className="text-[#333] text-xs mt-1.5">Estrés alto eleva cortisol → reduce déficit para proteger músculo</p></div>
            <div><p className="label mb-3">En días de descanso, ¿qué te gusta hacer?</p>
              <Multi opts={RA_OPTS} sel={d.recuperacion_activa} onToggle={id=>tog('recuperacion_activa',id)}/>
            </div>
            {err && <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">{err}</div>}
          </div>
        )}

        {step===5 && (
          <div className="fade-up space-y-6">
            <div><h2 className="text-2xl font-bold">¡Perfil completo! 🎉</h2>
              <p className="text-[#444] text-sm mt-1">¿Qué quieres que genere primero?</p></div>
            <div className="space-y-2">
              {[
                {v:'gym', e:'💪', t:'Rutina de gym', s:'Solo el plan de entrenamiento'},
                {v:'dieta', e:'🥗', t:'Plan de dieta', s:'Solo el plan de nutrición'},
                {v:'todo', e:'🔄', t:'Los dos', s:'Recomendado — rutina y dieta juntos'},
              ].map(o => <Opt key={o.v} sel={d.generar===o.v} onClick={()=>set('generar',o.v)} e={o.e} t={o.t} s={o.s}/>)}
            </div>
            {err && <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">{err}</div>}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-black/95 backdrop-blur px-5 py-4 flex gap-3 border-t border-[#1a1a1a]">
        {step>0 && <button onClick={()=>setStep(s=>s-1)} className="btn-secondary flex-none">← Atrás</button>}
        <button onClick={handleNext} disabled={!canNext()||busy} className="btn-primary flex-1">
          {busy ? 'Creando tu plan...' : step<5 ? `Continuar ${step+1}/6 →` : '✨ Crear mi plan'}
        </button>
      </div>
    </div>
  )
}
