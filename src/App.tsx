import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/AuthProvider'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Index from '@/pages/Index'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import Notes from '@/pages/Notes'
import Profile from '@/pages/Profile'
import '@/App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Index />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  )
}

export default App