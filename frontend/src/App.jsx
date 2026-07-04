import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyPortfolios from './pages/MyPortfolios'
import EditPortfolio from './pages/EditPortfolio'
import MyResumes from './pages/MyResumes'
import EditResume from './pages/EditResume'
import AIAssistant from './pages/AIAssistant'
import ATSScoring from './pages/ATSScoring'
import ProfileSettings from './pages/ProfileSettings'
import TemplateGallery from './pages/TemplateGallery'

function Protected({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/dashboard/portfolios" element={<Protected><MyPortfolios /></Protected>} />
        <Route path="/dashboard/portfolio/:id" element={<Protected><EditPortfolio /></Protected>} />
        <Route path="/dashboard/portfolio/:id/:mode" element={<Protected><EditPortfolio /></Protected>} />
        <Route path="/dashboard/resumes" element={<Protected><MyResumes /></Protected>} />
        <Route path="/dashboard/resume/:id" element={<Protected><EditResume /></Protected>} />
        <Route path="/dashboard/resume/:id/:mode" element={<Protected><EditResume /></Protected>} />
        <Route path="/dashboard/ai" element={<Protected><AIAssistant /></Protected>} />
        <Route path="/dashboard/ats" element={<Protected><ATSScoring /></Protected>} />
        <Route path="/dashboard/settings" element={<Protected><ProfileSettings /></Protected>} />
        <Route path="/dashboard/templates" element={<Protected><TemplateGallery /></Protected>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
