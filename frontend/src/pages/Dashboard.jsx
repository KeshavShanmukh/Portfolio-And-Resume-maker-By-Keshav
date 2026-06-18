import { useEffect, useState } from 'react'
import axios from 'axios'
import PortfolioForm from '../components/PortfolioForm'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [portfolio, setPortfolio] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    axios.get('http://localhost:4000/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(err => setData({ error: err.response?.data?.error || 'Error' }))
    // load portfolio from backend if authenticated
    (async ()=>{
      try{
        const res = await axios.get('http://localhost:4000/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
        if(res.data) setPortfolio(res.data)
      }catch(e){
        const saved = localStorage.getItem('portfolio')
        if(saved) setPortfolio(JSON.parse(saved))
      }
    })()
  },[])

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
          <a href="#">Dashboard</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div className="hero fade-in" style={{marginTop:'1rem'}}>
        <div className="content">
          <h1>Design a standout portfolio — effortlessly</h1>
          <p>Use the editor to craft your bio, skills, and links. Save to your account and preview in real-time.</p>
        </div>
        <div className="art" aria-hidden>
          <svg viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
            <rect x="0" y="0" width="220" height="140" rx="12" fill="url(#g)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <g opacity="0.14">
              <circle cx="40" cy="40" r="28" fill="#fff" />
              <circle cx="150" cy="90" r="36" fill="#fff" />
            </g>
            <path d="M24 110 C60 40,160 20,200 80" stroke="#fff" stroke-opacity="0.4" stroke-width="6" fill="none" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginTop:'1rem'}}>
        <div>
          <PortfolioForm onChange={(p)=>setPortfolio(p)} />
        </div>
        <div>
          <div className="card">
            <h3 style={{marginTop:0}}>Preview</h3>
            {!portfolio && <p style={{color:'#6b7280'}}>No portfolio saved yet.</p>}
            {portfolio && (
              <div className="preview">
                <h2 style={{margin:'0 0 6px 0'}}>{portfolio.fullName || 'Your name'}</h2>
                <div style={{color:'#374151'}}>{portfolio.headline}</div>
                <p style={{color:'#374151'}}>{portfolio.bio}</p>
                <p><strong>Skills:</strong> {portfolio.skills}</p>
                <p><strong>Links:</strong> {portfolio.links}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{marginTop:'1rem'}} className="card">
        <h3 style={{marginTop:0}}>Server Response</h3>
        <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
