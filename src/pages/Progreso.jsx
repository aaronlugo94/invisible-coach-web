import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

function Chart({ data, dataKey, color, label, unit, meta }) {
  if (!data?.length) return null
  return (
    <div className="card p-4">
      <p className="label mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{top:4,right:4,bottom:0,left:-28}}>
          <XAxis dataKey="fecha" tick={{fill:'#333',fontSize:9}} tickFormatter={d=>d?.slice(5)||''}/>
          <YAxis tick={{fill:'#333',fontSize:9}} domain={['auto','auto']}/>
          <Tooltip contentStyle={{background:'#111',border:'0.5px solid #222',borderRadius:10,fontSize:11}}
            labelStyle={{color:'#555'}} formatter={v=>[`${v} ${unit}`,label]}/>
          {meta && <ReferenceLine y={meta} stroke={color} strokeDasharray="3 3" opacity={0.4}/>}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
      {meta && <p className="text-[#444] text-[10px] mt-1">Meta: {meta} {unit}</p>}
    </div>
  )
}

export default function Progreso() {
  const { data: pesajes } = useQuery({ queryKey:['pesajes30'], queryFn:()=>api.getPesajes(30) })
  const { data: prog }    = useQuery({ queryKey:['prog'],      queryFn: api.getProgreso })
  const { data: resumen } = useQuery({ queryKey:['resumen'],   queryFn: api.getResumenSemanal })

  const pesoData  = [...(pesajes||[])].reverse()
  const grasaData = pesoData.filter(p=>p.grasa_pct)

  return (
    <div className="page">
      <div className="px-4 pt-12 pb-4">
        <p className="label">Progreso</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Tu evolución</h1>
      </div>
      <div className="section space-y-3">

        {resumen && (
          <div className="card p-4">
            <p className="label mb-3">Resumen — semana {resumen.semana}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ['Sesiones',   `${resumen.sesiones_completadas||0}/${resumen.sesiones_total||0}`, '#1D9E75'],
                ['Peso',       `${resumen.cambio_peso>0?'+':''}${resumen.cambio_peso||0} kg`,     resumen.cambio_peso<0?'#30D158':'#FF6B00'],
                ['Grasa',      `${resumen.cambio_grasa||'—'}%`, '#7F77DD'],
                ['Racha',      `${resumen.racha||0} días 🔥`, '#FF6B00'],
              ].map(([l,v,c])=>(
                <div key={l} className="surface p-3">
                  <p className="text-[#444] text-xs">{l}</p>
                  <p className="font-bold mt-1 text-sm" style={{color:c}}>{v}</p>
                </div>
              ))}
            </div>
            {resumen.mensaje && (
              <p className="text-xs leading-relaxed border-t border-[#1a1a1a] pt-3"
                style={{color:'#9fe1cb'}}>{resumen.mensaje}</p>
            )}
          </div>
        )}

        <Chart data={pesoData}  dataKey="peso_kg"   color="#FF6B00" label="Peso corporal" unit="kg"  meta={null}/>
        <Chart data={grasaData} dataKey="grasa_pct" color="#7F77DD" label="% Grasa corporal" unit="%" meta={22}/>

        {prog?.ejercicios?.length > 0 && (
          <div className="card p-4">
            <p className="label mb-4">Fuerza — doble progresión activa</p>
            <div className="space-y-3">
              {prog.ejercicios.slice(0,6).map((e,i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[#bbb] text-xs truncate flex-1">{e.ejercicio}</p>
                    <div className="flex items-center gap-2 ml-2">
                      <p className="text-white text-xs font-bold">{e.peso_actual} lbs</p>
                      {e.cambio>0 && <span className="text-green-400 text-[10px] font-bold">+{e.cambio}</span>}
                    </div>
                  </div>
                  <div className="h-1 bg-[#1a1a1a] rounded-full">
                    <div className="h-1 rounded-full bg-[#1D9E75]"
                      style={{width:`${Math.min((e.peso_actual/(e.peso_max||e.peso_actual))*100,100)}%`}}/>
                  </div>
                  {e.cambio>0 && <p className="text-green-400 text-[10px] mt-0.5">+{e.cambio} lbs desde el inicio</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
