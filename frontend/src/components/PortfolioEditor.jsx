import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function PortfolioEditor({ portfolioId }){
  const token = localStorage.getItem('token')
  const [portfolio, setPortfolio] = useState(null)
  const [sections, setSections] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await axios.get(`http://localhost:4000/api/portfolio/${portfolioId}`, { headers: { Authorization: `Bearer ${token}` } })
      setPortfolio(res.data)
      const secs = (res.data.sections || []).map(s=>({ ...s, content: safeParse(s.content) }))
      secs.sort((a,b)=>a.position - b.position)
      setSections(secs)
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{ load() },[portfolioId])

  function safeParse(v){ try{ return JSON.parse(v) }catch(e){ return {} } }

  const addSection = async (type)=>{
    try{
      const res = await axios.post('http://localhost:4000/api/portfolio/section', { portfolioId, type, content: {} }, { headers: { Authorization: `Bearer ${token}` } })
      const s = { ...res.data, content: {} }
      setSections(prev=>[...prev, s])
      setSelected(s.id)
    }catch(e){ console.error(e) }
  }

  const removeSection = async (id)=>{
    if(!confirm('Remove section?')) return
    try{
      await axios.delete(`http://localhost:4000/api/portfolio/section/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setSections(prev=>prev.filter(p=>p.id!==id))
      if(selected===id) setSelected(null)
    }catch(e){ console.error(e) }
  }

  const updateSectionContent = async (id, content)=>{
    try{
      await axios.put(`http://localhost:4000/api/portfolio/section/${id}`, { content }, { headers: { Authorization: `Bearer ${token}` } })
      setSections(prev=>prev.map(s=> s.id===id ? { ...s, content } : s ))
    }catch(e){ console.error(e) }
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e, index) => {
    e.preventDefault()
    const src = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (Number.isNaN(src)) return
    if (src === index) return
    const newArr = Array.from(sections)
    const [moved] = newArr.splice(src, 1)
    newArr.splice(index, 0, moved)
    const positioned = newArr.map((s, idx) => ({ ...s, position: idx + 1 }))
    setSections(positioned)
    try {
      await Promise.all(positioned.map(s => axios.put(`http://localhost:4000/api/portfolio/section/${s.id}`, { position: s.position }, { headers: { Authorization: `Bearer ${token}` } })))
    } catch (e) { console.error(e) }
  }

  const savePortfolioMeta = async (patch)=>{
    try{
      const res = await axios.put(`http://localhost:4000/api/portfolio/${portfolioId}`, patch, { headers: { Authorization: `Bearer ${token}` } })
      setPortfolio(res.data)
    }catch(e){ console.error(e) }
  }

  if(loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container editor-grid">
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>{portfolio?.title || 'Portfolio'}</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={()=>savePortfolioMeta({ title: portfolio.title })}>Save</button>
          </div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <label className="label">Title</label>
          <input className="input" value={portfolio?.title||''} onChange={(e)=>setPortfolio(p=>({...p, title:e.target.value}))} onBlur={(e)=>savePortfolioMeta({ title: e.target.value })} />
          <label className="label" style={{marginTop:8}}>Description</label>
          <textarea className="input" value={portfolio?.description||''} onChange={(e)=>setPortfolio(p=>({...p, description:e.target.value}))} onBlur={(e)=>savePortfolioMeta({ description: e.target.value })} />
        </div>

        <div className="card" style={{marginTop:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontWeight:600}}>Sections</div>
            <div>
              <select id="add-section" defaultValue="" onChange={(e)=>{ if(!e.target.value) return; addSection(e.target.value); e.target.value=''; }}>
                <option value="">Add section...</option>
                <option value="hero">Hero</option>
                <option value="about">About</option>
                <option value="skills">Skills</option>
                <option value="projects">Projects</option>
                <option value="education">Education</option>
                <option value="experience">Experience</option>
                <option value="contact">Contact</option>
              </select>
            </div>
          </div>

          <div style={{marginTop:8}}>
            <div>
              {sections.map((s, idx) => (
                <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, idx)} style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,border:'1px solid #eee',borderRadius:6,background:selected===s.id? '#f8fafc' : '#fff'}} onClick={()=>setSelected(s.id)}>
                    <div>
                      <div style={{fontWeight:600,textTransform:'capitalize'}}>{s.type}</div>
                      <div style={{color:'#6b7280',fontSize:13}}>{previewText(s)}</div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-sm" onClick={(e)=>{ e.stopPropagation(); setSelected(s.id); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={(e)=>{ e.stopPropagation(); removeSection(s.id); }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div>
        <div className="card">
          <h3 style={{marginTop:0}}>Live Preview</h3>
          <div style={{border:'1px solid #e5e7eb',padding:12,borderRadius:6}}>
            <LivePreview sections={sections} />
          </div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h3 style={{marginTop:0}}>Editor</h3>
          {!selected && <p style={{color:'#6b7280'}}>Select a section to edit it.</p>}
          {selected && (()=>{
            const s = sections.find(x=>x.id===selected)
            if(!s) return <p>Section not found</p>
            return <SectionEditor section={s} onChange={(c)=>updateSectionContent(s.id,c)} />
          })()}
        </div>
      </div>
    </div>
  )

  function previewText(s){
    const c = s.content || {}
    if(s.type==='hero') return c.name || c.tagline || ''
    if(s.type==='about') return (c.description||'').slice(0,60)
    if(s.type==='skills') return (c.skills||[]).join(', ')
    if(s.type==='projects') return (c.title||'')
    if(s.type==='education') return (c.institution||'')
    if(s.type==='experience') return (c.company||'')
    if(s.type==='contact') return c.email || ''
    return ''
  }
}

function SectionEditor({ section, onChange }){
  const [state, setState] = useState(section.content || {})
  useEffect(()=> setState(section.content || {}), [section.id])

  const save = ()=> onChange(state)

  if(section.type==='hero'){
    return (
      <div>
        <label className="label">Name</label>
        <input className="input" value={state.name||''} onChange={(e)=>setState(s=>({...s, name:e.target.value}))} />
        <label className="label">Role</label>
        <input className="input" value={state.role||''} onChange={(e)=>setState(s=>({...s, role:e.target.value}))} />
        <label className="label">Tagline</label>
        <input className="input" value={state.tagline||''} onChange={(e)=>setState(s=>({...s, tagline:e.target.value}))} />
        <label className="label">Profile Image URL</label>
        <input className="input" value={state.image||''} onChange={(e)=>setState(s=>({...s, image:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='about'){
    return (
      <div>
        <label className="label">Description</label>
        <textarea className="input" value={state.description||''} onChange={(e)=>setState(s=>({...s, description:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='skills'){
    return (
      <div>
        <label className="label">Skills (comma separated)</label>
        <input className="input" value={(state.skills||[]).join(', ')} onChange={(e)=>setState(s=>({...s, skills: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='projects'){
    return (
      <div>
        <label className="label">Title</label>
        <input className="input" value={state.title||''} onChange={(e)=>setState(s=>({...s, title:e.target.value}))} />
        <label className="label">Description</label>
        <textarea className="input" value={state.description||''} onChange={(e)=>setState(s=>({...s, description:e.target.value}))} />
        <label className="label">GitHub URL</label>
        <input className="input" value={state.github||''} onChange={(e)=>setState(s=>({...s, github:e.target.value}))} />
        <label className="label">Live URL</label>
        <input className="input" value={state.live||''} onChange={(e)=>setState(s=>({...s, live:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='education'){
    return (
      <div>
        <label className="label">Institution</label>
        <input className="input" value={state.institution||''} onChange={(e)=>setState(s=>({...s, institution:e.target.value}))} />
        <label className="label">Degree</label>
        <input className="input" value={state.degree||''} onChange={(e)=>setState(s=>({...s, degree:e.target.value}))} />
        <label className="label">Year</label>
        <input className="input" value={state.year||''} onChange={(e)=>setState(s=>({...s, year:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='experience'){
    return (
      <div>
        <label className="label">Company</label>
        <input className="input" value={state.company||''} onChange={(e)=>setState(s=>({...s, company:e.target.value}))} />
        <label className="label">Role</label>
        <input className="input" value={state.role||''} onChange={(e)=>setState(s=>({...s, role:e.target.value}))} />
        <label className="label">Duration</label>
        <input className="input" value={state.duration||''} onChange={(e)=>setState(s=>({...s, duration:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='contact'){
    return (
      <div>
        <label className="label">Email</label>
        <input className="input" value={state.email||''} onChange={(e)=>setState(s=>({...s, email:e.target.value}))} />
        <label className="label">LinkedIn</label>
        <input className="input" value={state.linkedin||''} onChange={(e)=>setState(s=>({...s, linkedin:e.target.value}))} />
        <label className="label">GitHub</label>
        <input className="input" value={state.github||''} onChange={(e)=>setState(s=>({...s, github:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  return <div>Unknown section type</div>
}

function LivePreview({ sections }){
  return (
    <div>
      {sections.map(s=> (
        <div key={s.id} style={{padding:12,borderBottom:'1px solid #f3f4f6'}}>
          {renderSectionPreview(s)}
        </div>
      ))}
    </div>
  )
}

function renderSectionPreview(s){
  const c = s.content || {}
  switch(s.type){
    case 'hero':
      return (
        <div>
          <h1 style={{margin:0}}>{c.name || 'Your Name'}</h1>
          <div style={{color:'#6b7280'}}>{c.role || ''}</div>
          <div style={{marginTop:6}}>{c.tagline || ''}</div>
        </div>
      )
    case 'about':
      return <p>{c.description||''}</p>
    case 'skills':
      return <p><strong>Skills:</strong> {(c.skills||[]).join(', ')}</p>
    case 'projects':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.title||'Project'}</div>
          <div>{c.description||''}</div>
        </div>
      )
    case 'education':
      return <div>{c.institution} — {c.degree} ({c.year})</div>
    case 'experience':
      return <div>{c.company} — {c.role} ({c.duration})</div>
    case 'contact':
      return <div>Email: {c.email} • GitHub: {c.github}</div>
    default:
      return <div>{s.type}</div>
  }
}
