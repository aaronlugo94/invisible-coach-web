import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { isLoggedIn } from './lib/api'
import { useStore } from './store'
import Layout     from './components/Layout'
import Login      from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home       from './pages/Home'
import Gym        from './pages/Gym'
import Nutricion  from './pages/Nutricion'
import Progreso   from './pages/Progreso'
import Perfil     from './pages/Perfil'

function Guard({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return children
}

function AuthRedirect() {
  const [params] = useSearchParams()
  const token = params.get('token')
  if (token) return <Navigate to={`/login?token=${token}`} replace />
  return <Navigate to="/" replace />
}

export default function App() {
  const { onboardingDone } = useStore()
  return (
    <Routes>
      <Route path="/login"      element={<Login />} />
      <Route path="/auth"       element={<AuthRedirect />} />
      <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index            element={onboardingDone ? <Home /> : <Navigate to="/onboarding" replace />} />
        <Route path="gym"       element={<Gym />} />
        <Route path="nutricion" element={<Nutricion />} />
        <Route path="progreso"  element={<Progreso />} />
        <Route path="perfil"    element={<Perfil />} />
      </Route>
    </Routes>
  )
}
