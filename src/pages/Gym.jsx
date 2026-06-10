import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Gym() {
  const { data: hoy }  = useQuery({ queryKey:['hoy'],  queryFn: api.getHoy })
  const { data: prog } = useQuery({ queryKey:['prog'], queryFn: api.getProgreso })
  const ICON = {empuje:'💪',tiron:'🏋️',pierna:'🦵',gluteo:'🍑',core:'🎯'}
  const ejs  = (hoy?.ejercicios||[]).filter(e=>!e.es_cardio)
  const grupo = hoy?.grupo||''

  return (
    <div className="page">
      <div className="px-4 pt-12 pb-4">
        <p className="label">Gym</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {ejs.length ? `${ICON[grupo]||'💪'} ${grupo.toUpperCase()}` : 'Rutina'}
        </h1>
      </div>
      <div className="section space-y-3">
        {ejs.length ? (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="label">Semana {hoy?.semana} · {hoy?.label} · {hoy?.dia}</p>
              <span className="text-[10px] text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                {hoy?.rec_volumen === 'deload' ? '⚡ Deload' : hoy?.rec_volumen === 'reducir' ? '⬇ Reducido' : '✅ Normal'}
              </span>
            </div>
            <div className="space-y-3 mt-3">
              {ejs.map((e,i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                  <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[11px] text-[#444] flex-shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{e.ejercicio}</p>
                    <p className="text-[#444] text-xs">{e.series}×{e.reps} · RIR {e.rir_objetivo} · {e.rol}</p>
                    {e.notas && <p className="text-[#333] text-xs italic truncate mt-0.5">{e.notas}</p>}
                  </div>
                  {e.peso_sugerido && (
                    <div className="text-right flex-shrink-0">
                      {e.es_nuevo_peso && <p className="text-green-400 text-[10px] font-bold">+5 lbs ↑</p>}
                      <p className="text-white text-sm font-bold bg-[#1a1a1a] px-3 py-1 rounded-xl">{e.peso_sugerido} lbs</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[#333] text-xs mt-3 border-t border-[#1a1a1a] pt-3">
              💡 Los pesos se registran en Telegram durante la sesión
            </p>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-white font-semibold">Descanso activo</p>
            <p className="text-[#444] text-sm mt-1">Caminata zona 2, movilidad o core ligero</p>
          </div>
        )}

        {prog?.ejercicios?.length > 0 && (
          <div className="card p-4">
            <p className="label mb-4">Progresión de fuerza — doble progresión</p>
            <div className="space-y-4">
              {prog.ejercicios.slice(0,5).map((e,i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[#bbb] text-xs truncate flex-1">{e.ejercicio}</p>
                    <div className="flex items-center gap-2 ml-2">
                      <p className="text-white text-sm font-bold">{e.peso_actual} lbs</p>
                      {e.cambio > 0 && <span className="text-green-400 text-[10px] font-bold">+{e.cambio}</span>}
                    </div>
                  </div>
                  <div className="h-1 bg-[#1a1a1a] rounded-full">
                    <div className="h-1 rounded-full bg-[#1D9E75] transition-all"
                      style={{width:`${Math.min((e.peso_actual/(e.peso_max||e.peso_actual))*100,100)}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
