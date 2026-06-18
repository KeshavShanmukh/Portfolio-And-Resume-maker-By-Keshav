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
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-head">
          <div className="logo-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="#fff" opacity="0.06"/>
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            </svg>
          </div>
          <div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">Sign in to manage your portfolio</div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-field">
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="you@company.com" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Your secure password" />
          </div>

          <div className="form-actions">
            <div>
              <button className="btn btn-primary" type="submit"><span className="icon">🔒</span>Sign in</button>
            </div>
            <div style={{textAlign:'right'}}>
              <a className="secondary-link" href="/register">Create account</a>
            </div>
          </div>
        </form>

        {msg && <p className="small" style={{marginTop:12}}>{msg}</p>}
      </div>
    </div>
  )
}
