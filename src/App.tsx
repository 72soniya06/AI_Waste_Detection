import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LiveDetectionPage } from './pages/detection/LiveDetectionPage';
import { UploadImagePage } from './pages/detection/UploadImagePage';
import { UploadVideoPage } from './pages/detection/UploadVideoPage';
import { HistoryPage } from './pages/dashboard/HistoryPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { ReportPage } from './pages/dashboard/ReportPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/live"
                element={
                  <ProtectedRoute>
                    <LiveDetectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/upload-image"
                element={
                  <ProtectedRoute>
                    <UploadImagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/upload-video"
                element={
                  <ProtectedRoute>
                    <UploadVideoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/report"
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
