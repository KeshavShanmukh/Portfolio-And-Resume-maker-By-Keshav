import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:4000/api/auth/register', form)
      setMsg('Registered — token stored')
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
            <img src="/logo.svg" alt="Portfolio Maker" style={{width:44,height:44,objectFit:'cover',borderRadius:10}} />
          </div>
          <div>
            <div className="auth-title">Create account</div>
            <div className="auth-sub">Start building your professional portfolio</div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-field">
            <label>Username</label>
            <input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} placeholder="Your name" />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="you@company.com" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Choose a secure password" />
          </div>

          <div className="form-actions">
            <div>
              <button className="btn btn-primary" type="submit"><span className="icon">✨</span>Create account</button>
            </div>
            <div style={{textAlign:'right'}}>
              <a className="secondary-link" href="/login">Already have an account?</a>
            </div>
          </div>
        </form>

        {msg && <p className="small" style={{marginTop:12}}>{msg}</p>}
      </div>
    </div>
  )
}
