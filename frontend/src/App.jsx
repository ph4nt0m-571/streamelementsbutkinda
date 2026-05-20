import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Overlays from './pages/Overlays'
import Chatbot from './pages/Chatbot'
import Loyalty from './pages/Loyalty'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import NavSidebar from './components/NavSidebar'
import Toast from './components/Toast.jsx'

export default function App() {
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-950 text-white">
                <NavSidebar />
                <main className="flex-1 overflow-y-auto p-8">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/overlays" element={<Overlays />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/loyalty" element={<Loyalty />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}