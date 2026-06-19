import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyPortfolios from './pages/MyPortfolios'
import EditPortfolio from './pages/EditPortfolio'

function App() {
  const token = localStorage.getItem('token')
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/portfolios" element={token ? <MyPortfolios /> : <Navigate to="/login" />} />
        <Route path="/dashboard/portfolio/:id" element={token ? <EditPortfolio /> : <Navigate to="/login" />} />
        <Route path="/dashboard/portfolio/:id/:mode" element={token ? <EditPortfolio /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
