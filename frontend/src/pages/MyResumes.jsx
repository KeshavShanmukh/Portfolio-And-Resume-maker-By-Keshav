import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import TemplateChooser from '../components/TemplateChooser'
import { API_BASE_URL } from '../api/config'

export default function MyResumes(){
  const [list, setList] = useState([])
  const [choosing, setChoosing] = useState(false)
  const [showTemplateChooser, setShowTemplateChooser] = useState(false)
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  const [uploading, setUploading] = useState(false)

  const load = async ()=>{
    try{
      const res = await axios.get(`${API_BASE_URL}/api/resume`, { headers: { Authorization: `Bearer ${token}` } })
      setList(res.data || [])
    }catch(e){
      console.error(e)
    }
  }

  useEffect(()=>{ load() },[])

  const create = async (method)=>{
    try{
      const payload = { title: 'Untitled Resume', builderType: method }
      const res = await axios.post(`${API_BASE_URL}/api/resume/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      setChoosing(false)
      if(method==='FORM') nav(`/dashboard/resume/${res.data.id}/form`)
      else nav(`/dashboard/resume/${res.data.id}/drag`)
    }catch(e){ console.error(e) }
  }

  const remove = async (id)=>{
    if(!confirm('Delete this resume?')) return
    try{
      await axios.delete(`${API_BASE_URL}/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      load()
    }catch(e){ console.error(e) }
  }

  const applyTemplate = async (template) => {
    if(!template) return
    try{
      const payload = {
        title: `${template.name} Resume`,
        builderType: 'FORM',
        theme: JSON.stringify(template.theme),
        meta: JSON.stringify({ templateId: template.id })
      }
      const res = await axios.post(`${API_BASE_URL}/api/resume/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      const resumeId = res.data.id
      for(const section of template.sections){
        await axios.post(`${API_BASE_URL}/api/resume/section`, {
          resumeId,
          type: section.type,
          content: section.content,
          position: section.position
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      setChoosing(false)
      setShowTemplateChooser(false)
      alert('Resume created from template!')
      nav(`/dashboard/resume/${resumeId}/form`)
    }catch(e){
      console.error(e)
      alert('Unable to create resume from template.')
    }
  }

  const handlePDFUpload = async (e)=>{
    const file = e.target.files[0]
    if(!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/upload/resume-pdf`, formData, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      })
      
      // Create new resume with extracted data
      const payload = { title: 'Imported Resume', builderType: 'FORM' }
      const resumeRes = await axios.post(`${API_BASE_URL}/api/resume/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      
      // Auto-fill sections with extracted data
      const data = res.data.extractedData
      const resumeId = resumeRes.data.id
      
      if(data.name || data.email || data.phone){
        await axios.post(`${API_BASE_URL}/api/resume/section`, { 
          resumeId, type: 'contact', content: { name: data.name, email: data.email, phone: data.phone } 
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      if(data.skills && data.skills.length > 0){
        await axios.post(`${API_BASE_URL}/api/resume/section`, { 
          resumeId, type: 'skills', content: { skills: data.skills } 
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      if(data.experience && data.experience.length > 0){
        await axios.post(`${API_BASE_URL}/api/resume/section`, { 
          resumeId, type: 'experience', content: { items: data.experience.map(e=>({company:e,role:'',duration:'',description:''})) } 
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      if(data.education && data.education.length > 0){
        await axios.post(`${API_BASE_URL}/api/resume/section`, { 
          resumeId, type: 'education', content: { items: data.education.map(e=>({institution:e,degree:'',year:''})) } 
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      alert('Resume imported successfully!')
      nav(`/dashboard/resume/${resumeId}/form`)
    }catch(e){
      alert('Error importing resume: ' + (e.response?.data?.error || 'Import failed'))
    }
    setUploading(false)
  }

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Portfolio Maker</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="/dashboard/portfolios">Portfolios</a>
          <a href="/dashboard/resumes">Resumes</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>My Resumes</h3>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => { setShowTemplateChooser(v=>!v); setChoosing(false) }} className="btn btn-secondary">Create from Template</button>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePDFUpload}
              style={{display:'none'}}
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="btn" style={{cursor:'pointer'}}>
              {uploading ? 'Importing...' : '📄 Import PDF'}
            </label>
            <button onClick={() => { setChoosing(v=>!v); setShowTemplateChooser(false) }} className="btn">Create Resume</button>
          </div>
        </div>

        {showTemplateChooser && (
          <TemplateChooser
            type="resume"
            onApply={applyTemplate}
            onGalleryLink={()=>nav('/dashboard/templates')}
          />
        )}

        {choosing && (
          <div style={{marginTop:8,display:'flex',gap:8}}>
            <button className="btn" onClick={()=>create('FORM')}>Form Builder</button>
            <button className="btn" onClick={()=>create('DRAG_DROP')}>Drag & Drop</button>
          </div>
        )}

        <div style={{marginTop:12}}>
          {list.length===0 && <p style={{color:'#6b7280'}}>You have no resumes yet. Import from PDF or create a new one.</p>}
          {list.map(r=> (
            <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #eee'}}>
              <div>
                <div style={{fontWeight:600}}>{r.title}</div>
                <div style={{color:'#6b7280',fontSize:13}}>{r.isPublished ? '✓ Published' : 'Draft'}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>nav(`/dashboard/resume/${r.id}`)} className="btn btn-sm">Edit</button>
                <button onClick={()=>remove(r.id)} className="btn btn-danger btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
