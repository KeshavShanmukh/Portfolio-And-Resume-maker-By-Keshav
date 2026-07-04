import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function ATSScoring(){
  const token = localStorage.getItem('token')
  const [resumes, setResumes] = useState([])
  const [reports, setReports] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [currentReport, setCurrentReport] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    loadResumes()
    loadReports()
  },[])

  const loadResumes = async ()=>{
    try{
      const res = await axios.get(`${API_BASE_URL}/api/resume`, { headers: { Authorization: `Bearer ${token}` } })
      setResumes(res.data || [])
    }catch(e){ console.error(e) }
  }

  const loadReports = async ()=>{
    try{
      const res = await axios.get(`${API_BASE_URL}/api/ats/reports`, { headers: { Authorization: `Bearer ${token}` } })
      setReports(res.data || [])
    }catch(e){ console.error(e) }
  }

  const analyzeResume = async ()=>{
    if(!selectedResume) return
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/ats/analyze`, { resumeId: selectedResume }, { headers: { Authorization: `Bearer ${token}` } })
      setCurrentReport(res.data)
      loadReports()
    }catch(e){
      alert('Error: ' + (e.response?.data?.error || 'Failed to analyze resume'))
    }
    setLoading(false)
  }

  const getScoreColor = (score)=>{
    if(score >= 80) return '#22c55e'
    if(score >= 60) return '#eab308'
    return '#ef4444'
  }

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">ATS Scoring</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="/dashboard/portfolios">Portfolios</a>
          <a href="/dashboard/resumes">Resumes</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Analyze Resume</h3>
        <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
          <select 
            className="input" 
            style={{flex:1}}
            value={selectedResume || ''}
            onChange={(e)=>setSelectedResume(parseInt(e.target.value))}
          >
            <option value="">Select a resume...</option>
            {resumes.map(r=>(
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button className="btn" onClick={analyzeResume} disabled={loading || !selectedResume}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {currentReport && (
          <div style={{marginTop:16,padding:16,background:'#f8fafc',borderRadius:6,border:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:12}}>
              <div style={{fontSize:48,fontWeight:700,color:getScoreColor(currentReport.score)}}>
                {currentReport.score}/100
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:18}}>ATS Score</div>
                <div style={{color:'#6b7280'}}>
                  {currentReport.score >= 80 ? 'Excellent!' : currentReport.score >= 60 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontWeight:600,color:'#22c55e'}}>✓ Strengths</div>
              <ul style={{margin:'4px 0',paddingLeft:20}}>
                {currentReport.strengths.map((s, idx)=>(
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontWeight:600,color:'#ef4444'}}>⚠ Weaknesses</div>
              <ul style={{margin:'4px 0',paddingLeft:20}}>
                {currentReport.weaknesses.map((w, idx)=>(
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontWeight:600,color:'#3b82f6'}}>💡 Suggestions</div>
              <ul style={{margin:'4px 0',paddingLeft:20}}>
                {currentReport.suggestions.map((s, idx)=>(
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {currentReport.keywords && currentReport.keywords.length > 0 && (
              <div>
                <div style={{fontWeight:600}}>🔑 Keywords Found</div>
                <div style={{marginTop:4}}>
                  {currentReport.keywords.map((k, idx)=>(
                    <span key={idx} style={{display:'inline-block',padding:'4px 8px',margin:'4px',background:'#e0f2fe',borderRadius:4,fontSize:12}}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div style={{marginTop:16}} className="card">
          <h3 style={{marginTop:0}}>Previous Reports</h3>
          <div style={{marginTop:8}}>
            {reports.map(r=>(
              <div key={r.id} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:6,marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600}}>{r.resume?.title || 'Resume'}</div>
                    <div style={{color:'#6b7280',fontSize:12}}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{fontSize:24,fontWeight:700,color:getScoreColor(r.score)}}>
                    {r.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
