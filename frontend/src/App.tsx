import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import {
  selectAuthStatus,
  selectIsAuthenticated,
} from './app/features/auth/authSlice';
import { resolveAuthGate } from './app/features/auth/authGate';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthCallbackPage } from './pages/AuthCallback/AuthCallbackPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { ComingSoonPage } from './pages/ComingSoon/ComingSoonPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LoginPage } from './pages/Login/LoginPage';
import { ExpensesPage } from './pages/Expenses/ExpensesPage';
import { MaterialsPage } from './pages/Materials/MaterialsPage';
import { ProjectDetailsPage } from './pages/ProjectDetails/ProjectDetailsPage';
import { ProjectsPage } from './pages/Projects/ProjectsPage';
import { RevenuePage } from './pages/Revenue/RevenuePage';

function AuthLoading() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function ProtectedRoute() {
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const decision = resolveAuthGate({
    status,
    isAuthenticated,
    mode: 'protected',
  });

  if (decision === 'loading') {
    return <AuthLoading />;
  }
  if (decision === 'redirect-login') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const decision = resolveAuthGate({
    status,
    isAuthenticated,
    mode: 'guest-only',
  });

  if (decision === 'loading') {
    return <AuthLoading />;
  }
  if (decision === 'redirect-dashboard') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function CatchAllRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return (
    <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
  );
}

function App() {
  return (
    <AuthBootstrap>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <LoginPage initialMode="register" />
            </GuestOnlyRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route
              path="suppliers"
              element={<ComingSoonPage kind="suppliers" />}
            />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="reports" element={<AnalyticsPage />} />
            <Route
              path="analytics"
              element={<Navigate to="/reports" replace />}
            />
            <Route
              path="settings"
              element={<ComingSoonPage kind="settings" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </AuthBootstrap>
  );
}

export default App;
