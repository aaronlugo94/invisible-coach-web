import { Outlet, NavLink } from 'react-router-dom'
import { Home, Dumbbell, Salad, TrendingUp, User } from 'lucide-react'

const TABS = [
  { to:'/',          icon:Home,       label:'Hoy',    end:true },
  { to:'/gym',       icon:Dumbbell,   label:'Gym'          },
  { to:'/nutricion', icon:Salad,      label:'Dieta'        },
  { to:'/progreso',  icon:TrendingUp, label:'Progreso'     },
  { to:'/perfil',    icon:User,       label:'Perfil'       },
]

export default function Layout() {
  return (
    <div style={{ maxWidth:430, margin:'0 auto' }} className="flex flex-col min-h-dvh bg-black">
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
      <nav className="fixed bottom-0 bg-black/95 backdrop-blur border-t border-[#1a1a1a] z-50"
           style={{ maxWidth:430, left:'50%', transform:'translateX(-50%)', width:'100%' }}>
        <div className="flex">
          {TABS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center pt-2.5 pb-2 gap-0.5 transition-colors ${isActive ? 'text-white' : 'text-[#3a3a3a]'}`}>
              {({ isActive }) => (<>
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/10' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className="text-[10px]">{label}</span>
              </>)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
