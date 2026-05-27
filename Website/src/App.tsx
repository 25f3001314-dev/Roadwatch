import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoadingState } from '@/components/ui/LoadingState'

// Auth & landing — eager
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
<<<<<<< HEAD

// Lazy-loaded routes (each gets its own Vite chunk)
const Complaints = lazy(() => import('@/pages/Complaints'))
const ComplaintDetail = lazy(() => import('@/pages/ComplaintDetail'))
const ComplaintPipeline = lazy(() => import('@/pages/ComplaintPipeline'))
const MapView = lazy(() => import('@/pages/MapView'))
const Roads = lazy(() => import('@/pages/Roads'))
const RoadInfrastructure = lazy(() => import('@/pages/RoadInfrastructure'))
const Authorities = lazy(() => import('@/pages/Authorities'))
const EmergencyCases = lazy(() => import('@/pages/EmergencyCases'))
const ResolvedComplaints = lazy(() => import('@/pages/ResolvedComplaints'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingState message="Loading…" />
    </div>
  )
}
=======
import Complaints from '@/pages/Complaints'
import ComplaintDetail from '@/pages/ComplaintDetail'
import ComplaintPipeline from '@/pages/ComplaintPipeline'
import MapView from '@/pages/MapView'
import Roads from '@/pages/Roads'
import Departments from '@/pages/Departments'
import EmergencyCases from '@/pages/EmergencyCases'
import ResolvedComplaints from '@/pages/ResolvedComplaints'
import Settings from '@/pages/Settings'
>>>>>>> e43aea6 (update frontend api config)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
<<<<<<< HEAD
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="complaints"
          element={
            <Suspense fallback={<PageFallback />}>
              <Complaints />
            </Suspense>
          }
        />
        <Route
          path="complaints/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ComplaintDetail />
            </Suspense>
          }
        />
        <Route
          path="complaint-pipeline"
          element={
            <Suspense fallback={<PageFallback />}>
              <ComplaintPipeline />
            </Suspense>
          }
        />
        <Route
          path="emergency-cases"
          element={
            <Suspense fallback={<PageFallback />}>
              <EmergencyCases />
            </Suspense>
          }
        />
        <Route
          path="resolved-complaints"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResolvedComplaints />
            </Suspense>
          }
        />
        <Route
          path="map"
          element={
            <Suspense fallback={<PageFallback />}>
              <MapView />
            </Suspense>
          }
        />
        <Route
          path="authorities"
          element={
            <Suspense fallback={<PageFallback />}>
              <Authorities />
            </Suspense>
          }
        />
        <Route
          path="roads"
          element={
            <Suspense fallback={<PageFallback />}>
              <Roads />
            </Suspense>
          }
        />
        <Route
          path="road-infrastructure"
          element={
            <Suspense fallback={<PageFallback />}>
              <RoadInfrastructure />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          }
        />
=======
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="complaint-pipeline" element={<ComplaintPipeline />} />
        <Route path="roads" element={<Roads />} />
        <Route path="departments" element={<Departments />} />
        <Route path="map" element={<MapView />} />
        <Route path="emergency-cases" element={<EmergencyCases />} />
        <Route path="resolved-complaints" element={<ResolvedComplaints />} />
        <Route path="settings" element={<Settings />} />
>>>>>>> e43aea6 (update frontend api config)
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
