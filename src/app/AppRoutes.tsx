import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '@/hooks/useSession'
import { HomePage } from '@/pages/HomePage'
import { OnboardingPage } from '@/pages/child/OnboardingPage'
import { ChildWorldMapPage } from '@/pages/child/WorldMapPage'
import { ChildProgressPage } from '@/pages/child/ProgressPage'
import { ChildSettingsPage } from '@/pages/child/SettingsPage'
import { PlayActivityPage } from '@/pages/child/PlayActivityPage'
import { TeacherDashboardPage, TeacherLoginPage } from '@/pages/teacher/TeacherPages'
import { PrivacyPage } from '@/pages/legal/PrivacyPage'
import { ValidationPage } from '@/pages/ValidationPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * Garde de route côté client. Elle empêche d'afficher un écran au mauvais rôle,
 * mais la véritable autorisation est appliquée par PostgreSQL/RLS côté serveur :
 * cette garde ne protège aucune donnée à elle seule.
 */
export function RequireRole({ roles, children }: { readonly roles: readonly string[]; readonly children: ReactNode }) {
  const { isAuthenticated, role } = useSession()
  const location = useLocation()
  if (!isAuthenticated || !role || !roles.includes(role)) {
    return <Navigate to="/enseignant" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/enfant/nouveau" element={<OnboardingPage />} />
      <Route path="/enfant" element={<ChildWorldMapPage />} />
      <Route path="/enfant/progression" element={<ChildProgressPage />} />
      <Route path="/enfant/reglages" element={<ChildSettingsPage />} />
      <Route path="/enfant/jouer/:activityId" element={<PlayActivityPage />} />
      <Route path="/enseignant" element={<TeacherLoginPage />} />
      <Route
        path="/enseignant/tableau-de-bord"
        element={
          <RequireRole roles={['teacher', 'admin']}>
            <TeacherDashboardPage />
          </RequireRole>
        }
      />
      <Route path="/confidentialite" element={<PrivacyPage />} />
      <Route path="/validation" element={<ValidationPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
