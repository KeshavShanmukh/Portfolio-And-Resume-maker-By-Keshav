import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form)
      localStorage.setItem('token', res.data.token)
      location.href = '/dashboard'
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || 'Error')
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-head">
          <div className="logo-mark">
            <img src="/logo.svg" alt="Portfolio Maker" style={{width:44,height:44,objectFit:'cover',borderRadius:10}} />
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
