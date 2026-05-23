import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Complaints from '@/pages/Complaints'
import ComplaintDetail from '@/pages/ComplaintDetail'
import MapView from '@/pages/MapView'
import Roads from '@/pages/Roads'
import Authorities from '@/pages/Authorities'

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
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="roads" element={<Roads />} />
        <Route path="authorities" element={<Authorities />} />
        <Route path="map" element={<MapView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
