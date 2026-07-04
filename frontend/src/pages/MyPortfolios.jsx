import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import TemplateChooser from '../components/TemplateChooser'
import { API_BASE_URL } from '../api/config'

export default function MyPortfolios(){
  const [list, setList] = useState([])
  const [choosing, setChoosing] = useState(false)
  const [showTemplateChooser, setShowTemplateChooser] = useState(false)
  const nav = useNavigate()
  const token = localStorage.getItem('token')

  const load = async ()=>{
    try{
      const res = await axios.get(`${API_BASE_URL}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      setList(res.data || [])
    }catch(e){
      console.error(e)
    }
  }

  useEffect(()=>{ load() },[])

  const create = async (method)=>{
    try{
      const payload = { title: 'Untitled Portfolio', builderType: method }
      const res = await axios.post(`${API_BASE_URL}/api/portfolio/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      setChoosing(false)
      if(method==='FORM') nav(`/dashboard/portfolio/${res.data.id}/form`)
      else if(method==='CODE') nav(`/dashboard/portfolio/${res.data.id}/code`)
      else nav(`/dashboard/portfolio/${res.data.id}/drag`)
    }catch(e){ console.error(e) }
  }

  const remove = async (id)=>{
    if(!confirm('Delete this portfolio?')) return
    try{
      await axios.delete(`${API_BASE_URL}/api/portfolio/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      load()
    }catch(e){ console.error(e) }
  }

  const applyTemplate = async (template) => {
    if(!template) return
    try{
      const payload = {
        title: `${template.name} Portfolio`,
        builderType: 'DRAG_DROP',
        theme: JSON.stringify(template.theme),
        meta: JSON.stringify({ templateId: template.id })
      }
      const res = await axios.post(`${API_BASE_URL}/api/portfolio/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      const portfolioId = res.data.id
      for(const section of template.sections){
        await axios.post(`${API_BASE_URL}/api/portfolio/section`, {
          portfolioId,
          type: section.type,
          content: section.content,
          position: section.position
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      setChoosing(false)
      setShowTemplateChooser(false)
      alert('Portfolio created from template!')
      nav(`/dashboard/portfolio/${portfolioId}`)
    }catch(e){
      console.error(e)
      alert('Unable to create portfolio from template.')
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Portfolio Maker</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>My Portfolios</h3>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => { setShowTemplateChooser(v=>!v); setChoosing(false) }} className="btn btn-secondary">Create from Template</button>
            <button onClick={() => { setChoosing(v=>!v); setShowTemplateChooser(false) }} className="btn">Create Portfolio</button>
          </div>
        </div>

        {showTemplateChooser && (
          <TemplateChooser
            type="portfolio"
            onApply={applyTemplate}
            onGalleryLink={()=>nav('/dashboard/templates')}
          />
        )}

        {choosing && (
          <div style={{marginTop:8,display:'flex',gap:8}}>
            <button className="btn" onClick={()=>create('FORM')}>Form Builder</button>
            <button className="btn" onClick={()=>create('DRAG_DROP')}>Drag & Drop</button>
            <button className="btn" onClick={()=>create('CODE')}>Code Builder</button>
          </div>
        )}

        <div style={{marginTop:12}}>
          {list.length===0 && <p style={{color:'#6b7280'}}>You have no portfolios yet.</p>}
          {list.map(p=> (
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid #eee'}}>
              <div>
                <div style={{fontWeight:600}}>{p.title}</div>
                <div style={{color:'#6b7280',fontSize:13}}>{p.description}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>nav(`/dashboard/portfolio/${p.id}`)} className="btn btn-sm">Edit</button>
                <button onClick={()=>remove(p.id)} className="btn btn-danger btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
