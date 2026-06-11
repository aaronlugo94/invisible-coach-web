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

// Bloquea acceso a rutas principales si el onboarding no está completo
function RequireOnboarding({ children }) {
  const { onboardingDone } = useStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!onboardingDone) return <Navigate to="/onboarding" replace />
  return children
}

// Si ya completó el onboarding, no debe poder volver a verlo
function OnboardingGuard({ children }) {
  const { onboardingDone } = useStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (onboardingDone) return <Navigate to="/" replace />
  return children
}

function AuthRedirect() {
  const [params] = useSearchParams()
  const token = params.get('token')
  if (token) return <Navigate to={`/login?token=${token}`} replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"      element={<Login />} />
      <Route path="/auth"       element={<AuthRedirect />} />
      <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index            element={<RequireOnboarding><Home /></RequireOnboarding>} />
        <Route path="gym"       element={<RequireOnboarding><Gym /></RequireOnboarding>} />
        <Route path="nutricion" element={<RequireOnboarding><Nutricion /></RequireOnboarding>} />
        <Route path="progreso"  element={<RequireOnboarding><Progreso /></RequireOnboarding>} />
        <Route path="perfil"    element={<RequireOnboarding><Perfil /></RequireOnboarding>} />
      </Route>
    </Routes>
  )
}
