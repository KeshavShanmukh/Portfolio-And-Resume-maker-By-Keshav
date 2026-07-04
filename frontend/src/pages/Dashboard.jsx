import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { API_BASE_URL } from '../api/config'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [contactForm, setContactForm] = useState({ slug: '', visitorName: '', visitorEmail: '', messageText: '' })
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const nav = useNavigate()
  const { darkMode, toggleTheme } = useTheme()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    ;(async ()=>{
      try{
        const res = await axios.get(`${API_BASE_URL}/api/dashboard`, { headers })
        setData(res.data)
      }catch(err){
        setData({ error: err.response?.data?.error || 'Error' })
      }
    })()
    ;(async ()=>{
      try{
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers })
        setUser(res.data)
      }catch(e){ console.error(e) }
    })()
    ;(async ()=>{
      try{
        setLoadingMessages(true)
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/messages`, { headers })
        setMessages(res.data || [])
      }catch(e){
        console.error(e)
      } finally {
        setLoadingMessages(false)
      }
    })()
  },[])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactStatus({ type: 'info', message: 'Sending your message…' })

    try {
      const slug = contactForm.slug.trim()
      if (!slug) throw new Error('Please enter a portfolio slug')

      const res = await axios.post(`${API_BASE_URL}/api/portfolio/${encodeURIComponent(slug)}/contact`, {
        visitorName: contactForm.visitorName,
        visitorEmail: contactForm.visitorEmail,
        messageText: contactForm.messageText
      })

      setContactStatus({ type: 'success', message: 'Message sent beautifully. Your portfolio just received a new note.' })
      setContactForm({ slug: '', visitorName: '', visitorEmail: '', messageText: '' })
      if (res.data?.message) {
        setMessages(prev => [res.data.message, ...prev])
      }
    } catch (err) {
      setContactStatus({ type: 'error', message: err.response?.data?.error || err.message || 'Something went wrong' })
    }
  }

  return (
    <div className="container">
      <div className="decor-blob blob-a" aria-hidden></div>
      <div className="decor-blob blob-b" aria-hidden></div>
      <header className="app-header fade-in">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{fontSize:22, marginRight:8}}>✨</div>
          <div>
            <div style={{display:'flex',alignItems:'center'}}>
              <div className="brand">Portfolio Maker</div>
              <div className="badge">NEW</div>
            </div>
            <div className="brand-sub">Build your resume and portfolio — fast</div>
          </div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/settings">Settings</a>
          <button onClick={toggleTheme} style={{background:'none',border:'none',cursor:'pointer',fontSize:16}}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div className="hero fade-in" style={{marginTop:'1rem'}}>
        <div className="content">
          <h1>Welcome, {user?.username || 'User'}!</h1>
          <p>Create stunning portfolios and professional resumes with AI assistance.</p>
        </div>
        <div className="art" aria-hidden>
          <lottie-player src="https://assets10.lottiefiles.com/packages/lf20_tfb3estd.json" background="transparent" speed="1" style={{width:'220px',height:'140px'}} loop autoplay></lottie-player>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'1rem',marginTop:'1rem'}}>
        <div className="card" style={{cursor:'pointer'}} onClick={()=>nav('/dashboard/portfolios')}>
          <div style={{fontSize:32,marginBottom:8}}>📁</div>
          <h3 style={{margin:0}}>My Portfolios</h3>
          <p style={{color:'#6b7280',fontSize:14,marginTop:4}}>Create and manage your portfolios</p>
        </div>

        <div className="card" style={{cursor:'pointer'}} onClick={()=>nav('/dashboard/resumes')}>
          <div style={{fontSize:32,marginBottom:8}}>📄</div>
          <h3 style={{margin:0}}>My Resumes</h3>
          <p style={{color:'#6b7280',fontSize:14,marginTop:4}}>Build professional resumes</p>
        </div>

        <div className="card" style={{cursor:'pointer'}} onClick={()=>nav('/dashboard/ai')}>
          <div style={{fontSize:32,marginBottom:8}}>🤖</div>
          <h3 style={{margin:0}}>AI Assistant</h3>
          <p style={{color:'#6b7280',fontSize:14,marginTop:4}}>Get AI-powered content suggestions</p>
        </div>

        <div className="card" style={{cursor:'pointer'}} onClick={()=>nav('/dashboard/ats')}>
          <div style={{fontSize:32,marginBottom:8}}>📊</div>
          <h3 style={{margin:0}}>ATS Scoring</h3>
          <p style={{color:'#6b7280',fontSize:14,marginTop:4}}>Analyze your resume for ATS</p>
        </div>
      </div>

      <div style={{marginTop:'1rem'}} className="card">
        <h3 style={{marginTop:0}}>Quick Stats</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginTop:8}}>
          <div style={{textAlign:'center',padding:16,background:'#f8fafc',borderRadius:6}}>
            <div style={{fontSize:24,fontWeight:700,color:'#3b82f6'}}>3</div>
            <div style={{color:'#6b7280',fontSize:12}}>Builder Types</div>
          </div>
          <div style={{textAlign:'center',padding:16,background:'#f8fafc',borderRadius:6}}>
            <div style={{fontSize:24,fontWeight:700,color:'#22c55e'}}>AI</div>
            <div style={{color:'#6b7280',fontSize:12}}>Powered</div>
          </div>
          <div style={{textAlign:'center',padding:16,background:'#f8fafc',borderRadius:6}}>
            <div style={{fontSize:24,fontWeight:700,color:'#eab308'}}>Free</div>
            <div style={{color:'#6b7280',fontSize:12}}>Publishing</div>
          </div>
        </div>
      </div>

      <div className="card fade-in" style={{marginTop:'1rem'}}>
        <div className="section-head">
          <div>
            <h3 style={{margin:0}}>Inbox & Visitor Contact</h3>
            <p className="small" style={{margin:'4px 0 0'}}>Turn every portfolio into a conversation with gorgeous, animated engagement.</p>
          </div>
          <div className="status-pill">{messages.length} messages</div>
        </div>

        <div className="dashboard-grid">
          <div className="message-panel">
            <div className="subtle-panel">
              <div style={{fontWeight:700}}>Recent messages</div>
              <div className="small" style={{marginTop:4}}>Protected and scoped to your authenticated account.</div>
            </div>

            {loadingMessages ? (
              <div className="empty-state">Loading your inbox…</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">No messages yet. Share your portfolio and let visitors reach out.</div>
            ) : (
              messages.slice(0, 5).map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-meta">
                    <strong>{msg.visitorName}</strong>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="small" style={{marginTop:4}}>{msg.visitorEmail}</div>
                  <p style={{margin:'8px 0 0',lineHeight:1.6}}>{msg.messageText}</p>
                </div>
              ))
            )}
          </div>

          <div className="contact-panel">
            <div className="subtle-panel">
              <div style={{fontWeight:700}}>Try the public contact form</div>
              <div className="small" style={{marginTop:4}}>Use your portfolio slug to test how visitors can leave messages.</div>
            </div>

            <form onSubmit={handleContactSubmit} className="contact-form">
              <input
                className="input"
                placeholder="Portfolio slug"
                value={contactForm.slug}
                onChange={(e) => setContactForm({ ...contactForm, slug: e.target.value })}
              />
              <input
                className="input"
                placeholder="Your name"
                value={contactForm.visitorName}
                onChange={(e) => setContactForm({ ...contactForm, visitorName: e.target.value })}
              />
              <input
                className="input"
                type="email"
                placeholder="Your email"
                value={contactForm.visitorEmail}
                onChange={(e) => setContactForm({ ...contactForm, visitorEmail: e.target.value })}
              />
              <textarea
                className="input"
                rows="4"
                placeholder="Write a beautiful message..."
                value={contactForm.messageText}
                onChange={(e) => setContactForm({ ...contactForm, messageText: e.target.value })}
              />
              <button className="btn btn-primary" type="submit">Send message</button>
              {contactStatus.message ? (
                <div className={`toast-inline ${contactStatus.type === 'success' ? 'toast-success' : contactStatus.type === 'error' ? 'toast-error' : ''}`}>
                  {contactStatus.message}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
