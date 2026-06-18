import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const token = localStorage.getItem('token')
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="mb-6">
        <Link to="/register" className="mr-4">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
