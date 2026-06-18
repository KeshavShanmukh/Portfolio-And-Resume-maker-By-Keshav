import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      nav('/dashboard')
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
        <input className="w-full p-2 border" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Login</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  )
}
