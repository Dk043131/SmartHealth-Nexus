import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Hospitals from './pages/Hospitals';
import Inventory from './pages/Inventory';
import Patients from './pages/Patients';
import BedManagement from './pages/BedManagement';
import DoctorManagement from './pages/DoctorManagement';
import AmbulanceMonitor from './pages/AmbulanceMonitor';
import AlertCenter from './pages/AlertCenter';
import Reporting from './pages/Reporting';
import AiIntelligence from './pages/AiIntelligence';
import ResourceOptimization from './pages/ResourceOptimization';
import AiTransparency from './pages/AiTransparency';
import AiCopilot from './pages/AiCopilot';
import CitizenPortal from './pages/CitizenPortal';
import SyncCenter from './pages/SyncCenter';
import SecurityActivity from './pages/SecurityActivity';
import SystemOperations from './pages/SystemOperations';
import Administration from './pages/Administration';
import ExportCenter from './pages/ExportCenter';
import DemoMode from './pages/DemoMode';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Authorizing Node Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardHome />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hospitals"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Hospitals />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/patients"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Patients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/beds"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BedManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctors"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DoctorManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ambulances"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AmbulanceMonitor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/alerts"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AlertCenter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reporting />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ai-insights"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AiIntelligence />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/optimization"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResourceOptimization />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ai-transparency"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AiTransparency />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/copilot"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AiCopilot />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CitizenPortal />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sync"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SyncCenter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/security"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SecurityActivity />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operations"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SystemOperations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Administration />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/export"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ExportCenter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/demo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DemoMode />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
