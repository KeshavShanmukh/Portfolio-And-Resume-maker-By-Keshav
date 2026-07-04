import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function AIAssistant(){
  const token = localStorage.getItem('token')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const sendChat = async ()=>{
    if(!prompt.trim()) return
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, { prompt }, { headers: { Authorization: `Bearer ${token}` } })
      setResponse(res.data.response)
      setHistory(prev=>[{ role: 'user', content: prompt }, { role: 'assistant', content: res.data.response }, ...prev])
      setPrompt('')
    }catch(e){
      setResponse('Error: ' + (e.response?.data?.error || 'Failed to get AI response'))
    }
    setLoading(false)
  }

  const generateSummary = async ()=>{
    const skills = prompt('Enter your skills (comma separated):')
    const experience = prompt('Enter your experience:')
    if(!skills) return
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/ai/generate-summary`, { skills, experience }, { headers: { Authorization: `Bearer ${token}` } })
      setResponse(res.data.summary)
    }catch(e){
      setResponse('Error: ' + (e.response?.data?.error || 'Failed to generate summary'))
    }
    setLoading(false)
  }

  const improveContent = async ()=>{
    const content = prompt('Enter content to improve:')
    const type = prompt('Type (project/experience/about):')
    if(!content) return
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/ai/improve-content`, { content, type }, { headers: { Authorization: `Bearer ${token}` } })
      setResponse(res.data.improved)
    }catch(e){
      setResponse('Error: ' + (e.response?.data?.error || 'Failed to improve content'))
    }
    setLoading(false)
  }

  const suggestSkills = async ()=>{
    const role = prompt('Enter your target role:')
    const industry = prompt('Enter industry (optional):')
    if(!role) return
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/ai/suggest-skills`, { role, industry }, { headers: { Authorization: `Bearer ${token}` } })
      setResponse('Suggested skills: ' + res.data.skills.join(', '))
    }catch(e){
      setResponse('Error: ' + (e.response?.data?.error || 'Failed to suggest skills'))
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">AI Assistant</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="/dashboard/portfolios">Portfolios</a>
          <a href="/dashboard/resumes">Resumes</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Quick Actions</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn" onClick={generateSummary}>Generate Summary</button>
          <button className="btn" onClick={improveContent}>Improve Content</button>
          <button className="btn" onClick={suggestSkills}>Suggest Skills</button>
        </div>
      </div>

      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Chat with AI</h3>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input 
            className="input" 
            style={{flex:1}} 
            placeholder="Ask for help with your resume or portfolio..."
            value={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
            onKeyPress={(e)=>e.key==='Enter' && sendChat()}
          />
          <button className="btn" onClick={sendChat} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {response && (
          <div style={{marginTop:12,padding:12,background:'#f8fafc',borderRadius:6,border:'1px solid #e5e7eb'}}>
            <div style={{fontWeight:600,marginBottom:4}}>AI Response:</div>
            <div style={{whiteSpace:'pre-wrap'}}>{response}</div>
          </div>
        )}

        {history.length > 0 && (
          <div style={{marginTop:16}}>
            <h4>Chat History</h4>
            {history.slice(0, 5).map((msg, idx)=>(
              <div key={idx} style={{padding:8,marginBottom:8,borderRadius:6,background:msg.role==='user'?'#e0f2fe':'#f1f5f9'}}>
                <div style={{fontWeight:600,fontSize:12,color:'#6b7280'}}>{msg.role}</div>
                <div>{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
