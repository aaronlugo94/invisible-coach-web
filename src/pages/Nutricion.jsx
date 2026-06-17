import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

export default function Nutricion() {
  const { data: macros } = useQuery({ queryKey:['macros'],    queryFn: api.getMacros })
  const { data: plan, refetch }   = useQuery({ queryKey:['nutricion'], queryFn: api.getNutricion })
  const diaIdx = new Date().getDay()===0 ? 6 : new Date().getDay()-1
  const [generando, setGenerando] = useState(false)

  async function handleGenerar() {
    setGenerando(true)
    try { await api.generarNutricion(); await refetch() }
    catch (e) { alert('Error generando el plan. Intenta de nuevo.') }
    finally { setGenerando(false) }
  }

  return (
    <div className="page">
      <div className="px-4 pt-12 pb-4">
        <p className="label">Nutrición</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Plan semanal</h1>
      </div>
      <div className="section space-y-3">
        {macros && (
          <div className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="label">Hoy · {macros.es_gym ? 'Día de gym' : 'Descanso'}</p>
                <p className="text-white text-2xl font-bold mt-1">{macros.kcal} <span className="text-sm font-normal text-[#444]">kcal</span></p>
              </div>
              {macros.deficit_pct > 0 && (
                <div className="text-right">
                  <p className="text-red-400 text-sm font-bold">−{macros.deficit_pct}%</p>
                  <p className="text-[#333] text-[10px]">déficit</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[['🥩 Prot',macros.proteina_g+'g','#FF6B00'],['🍞 Carbs',macros.carbs_g+'g','#EF9F27'],['🥑 Grasas',macros.grasas_g+'g','#378ADD']].map(([l,v,c])=>(
                <div key={l} className="surface p-2.5 text-center">
                  <p className="text-[10px] text-[#444]">{l}</p>
                  <p className="font-bold text-sm mt-0.5" style={{color:c}}>{v}</p>
                </div>
              ))}
            </div>
            {macros.toma_proteina && (
              <p className="text-[#333] text-xs border-t border-[#1a1a1a] pt-2">
                Proteína: {macros.toma_proteina}g × 4 tomas (3-4h entre sí) · Umbral leucina: 30g mín/toma
              </p>
            )}
            {macros.rer_hoy && (
              <p className="text-[#333] text-xs mt-1">
                RER ayer: {macros.rer_hoy} → {macros.rer_hoy <= 0.75 ? 'Carbos reducidos hoy (lipolisis activa)' : macros.rer_hoy >= 0.90 ? 'Carbos altos hoy (recarga glucógeno)' : 'Distribución estándar'}
              </p>
            )}
            {macros.es_refeed && (
              <div className="mt-2 bg-amber-950/50 border border-amber-800/30 rounded-xl px-3 py-2 text-xs text-amber-300">
                🔄 Semana de refeed — 3+ semanas en déficit. Comes a mantenimiento esta semana.
              </div>
            )}
          </div>
        )}

        {macros?.distribucion && (
          <div className="card p-4">
            <p className="label mb-3">Distribución de tomas</p>
            <div className="space-y-2">
              {Object.entries(macros.distribucion).map(([key, toma]) => (
                <div key={key} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                  <p className="text-[#555] text-xs w-32 flex-shrink-0">{toma.hora}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium capitalize">{key.replace(/_/g,' ')}</p>
                    <p className="text-[#444] text-[10px] mt-0.5 truncate">{toma.nota}</p>
                  </div>
                  <p className="text-[#1D9E75] text-xs font-bold flex-shrink-0">{toma.prot}g P</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan?.semana ? (
          <div className="space-y-3">
            <p className="label px-0">Plan semanal completo</p>
            {Object.entries(plan.semana).map(([diaNombre, diaData], i) => (
              <div key={diaNombre} className={`card p-4 ${i===diaIdx?'border-[#333]':''}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm capitalize">
                    {i===diaIdx && '👉 '}{diaNombre}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${diaData.tipo==='gym'?'border-[#333] text-[#888]':'border-[#1a1a1a] text-[#444]'}`}>
                    {diaData.tipo==='gym'?'Gym':'Descanso'} · {diaData.kcal} kcal
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(diaData.comidas||[]).map((c,j) => (
                    <div key={j} className="flex items-start justify-between py-1.5 border-b border-[#111] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#bbb] text-xs font-medium">{c.nombre}</p>
                        <p className="text-[#333] text-[10px] truncate">
                          {c.alimentos?.slice(0,2).map(a=>a.nombre).join(' · ')}{c.alimentos?.length>2?'...':''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-white text-xs font-medium">{c.total_kcal} kcal</p>
                        <p className="text-[#444] text-[10px]">{c.total_prot}g P</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-3">🥗</p>
            <p className="text-white font-semibold">Plan en camino</p>
            <p className="text-[#444] text-sm mt-1 mb-4">Toca el botón para generar tu plan semanal con IA</p>
            <button onClick={handleGenerar} disabled={generando} className="btn-primary">
              {generando ? 'Generando... (puede tardar 30s)' : '✨ Generar plan'}
            </button>
          </div>
        )}
        {/* Botón de regenerar siempre visible al final */}
        <div className="card p-4 text-center">
          <button onClick={handleGenerar} disabled={generando} className="btn-secondary w-full">
            {generando ? 'Generando...' : '🔄 Regenerar plan semanal'}
          </button>
          <p className="text-[#333] text-xs mt-2">Usa tus macros y preferencias actuales</p>
        </div>
      </div>
    </div>
  )
}
