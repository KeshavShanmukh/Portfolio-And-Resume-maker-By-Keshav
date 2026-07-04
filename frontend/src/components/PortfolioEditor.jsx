import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { API_BASE_URL } from '../api/config'
import SplitPane from './SplitPane'

export default function PortfolioEditor({ portfolioId }){
  const token = localStorage.getItem('token')
  const [portfolio, setPortfolio] = useState(null)
  const [sections, setSections] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await axios.get(`${API_BASE_URL}/api/portfolio/${portfolioId}`, { headers: { Authorization: `Bearer ${token}` } })
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
      const res = await axios.post(`${API_BASE_URL}/api/portfolio/section`, { portfolioId, type, content: {} }, { headers: { Authorization: `Bearer ${token}` } })
      const s = { ...res.data, content: {} }
      setSections(prev=>[...prev, s])
      setSelected(s.id)
    }catch(e){ console.error(e) }
  }

  const removeSection = async (id)=>{
    if(!confirm('Remove section?')) return
    try{
      await axios.delete(`${API_BASE_URL}/api/portfolio/section/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setSections(prev=>prev.filter(p=>p.id!==id))
      if(selected===id) setSelected(null)
    }catch(e){ console.error(e) }
  }

  const updateSectionContent = async (id, content)=>{
    try{
      await axios.put(`${API_BASE_URL}/api/portfolio/section/${id}`, { content }, { headers: { Authorization: `Bearer ${token}` } })
      setSections(prev=>prev.map(s=> s.id===id ? { ...s, content } : s ))
    }catch(e){ console.error(e) }
  }

  const handleDragEnd = async (event)=>{
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id)
      const newIndex = sections.findIndex(s => s.id === over?.id)
      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)
      
      try {
        await Promise.all(newSections.map((s, idx) => 
          axios.put(`${API_BASE_URL}/api/portfolio/section/${s.id}`, { position: idx + 1 }, { headers: { Authorization: `Bearer ${token}` } })
        ))
      } catch (e) { console.error(e) }
    }
  }

  const savePortfolioMeta = async (patch)=>{
    try{
      const res = await axios.put(`${API_BASE_URL}/api/portfolio/${portfolioId}`, patch, { headers: { Authorization: `Bearer ${token}` } })
      setPortfolio(res.data)
    }catch(e){ console.error(e) }
  }

  if(loading) return <div className="container"><p>Loading...</p></div>

  const leftPanel = (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div>
          <h3 style={{margin:0}}>{portfolio?.title || 'Portfolio'}</h3>
          <p style={{margin:'6px 0 0',color:'#6b7280'}}>Preview and manage sections while editing.</p>
        </div>
        <button className="btn" onClick={()=>savePortfolioMeta({ title: portfolio.title, description: portfolio.description })}>Save</button>
      </div>

      <div className="card" style={{marginTop:12}}>
        <label className="label">Title</label>
        <input className="input" value={portfolio?.title||''} onChange={(e)=>setPortfolio(p=>({...p, title:e.target.value}))} onBlur={(e)=>savePortfolioMeta({ title: e.target.value })} />
        <label className="label" style={{marginTop:8}}>Description</label>
        <textarea className="input" value={portfolio?.description||''} onChange={(e)=>setPortfolio(p=>({...p, description:e.target.value}))} onBlur={(e)=>savePortfolioMeta({ description: e.target.value })} />
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:600}}>Sections (Drag to reorder)</div>
          <div>
            <select id="add-section" defaultValue="" onChange={(e)=>{ if(!e.target.value) return; addSection(e.target.value); e.target.value=''; }}>
              <option value="">Add section...</option>
              <option value="hero">Hero</option>
              <option value="about">About</option>
              <option value="skills">Skills</option>
              <option value="projects">Projects</option>
              <option value="education">Education</option>
              <option value="experience">Experience</option>
              <option value="certifications">Certifications</option>
              <option value="achievements">Achievements</option>
              <option value="testimonials">Testimonials</option>
              <option value="services">Services</option>
              <option value="gallery">Gallery</option>
              <option value="blogs">Blogs</option>
              <option value="socialLinks">Social Links</option>
              <option value="contact">Contact</option>
              <option value="custom">Custom Section</option>
            </select>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s=>s.id)} strategy={verticalListSortingStrategy}>
            <div style={{marginTop:8}}>
              {sections.map(s => (
                <SortableSection key={s.id} section={s} selected={selected} onSelect={setSelected} onRemove={removeSection} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3 style={{marginTop:0}}>Live Preview</h3>
        <div style={{border:'1px solid #e5e7eb',padding:12,borderRadius:6}}>
          <LivePreview sections={sections} />
        </div>
      </div>
    </div>
  )

  const rightPanel = (
    <div>
      <div className="card" style={{minHeight: 'calc(100vh - 210px)'}}>
        <h3 style={{marginTop:0}}>Editor</h3>
        {!selected && <p style={{color:'#6b7280'}}>Select a section to edit it.</p>}
        {selected && (()=>{
          const s = sections.find(x=>x.id===selected)
          if(!s) return <p>Section not found</p>
          return <SectionEditor section={s} onChange={(c)=>updateSectionContent(s.id,c)} />
        })()}
      </div>
    </div>
  )

  return (
    <div className="container">
      <SplitPane left={leftPanel} right={rightPanel} initialLeftWidth={80} leftMin={20} rightMin={20} />
    </div>
  )
}

function SortableSection({ section, selected, onSelect, onRemove }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,border:'1px solid #eee',borderRadius:6,background:selected===section.id? '#f8fafc' : '#fff',cursor:'move'}} onClick={()=>onSelect(section.id)}>
          <div>
            <div style={{fontWeight:600,textTransform:'capitalize'}}>☰ {section.type}</div>
            <div style={{color:'#6b7280',fontSize:13}}>{previewText(section)}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-sm" onClick={(e)=>{ e.stopPropagation(); onSelect(section.id); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={(e)=>{ e.stopPropagation(); onRemove(section.id); }}>Remove</button>
          </div>
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

  if(section.type==='certifications'){
    return (
      <div>
        <label className="label">Name</label>
        <input className="input" value={state.name||''} onChange={(e)=>setState(s=>({...s, name:e.target.value}))} />
        <label className="label">Issuer</label>
        <input className="input" value={state.issuer||''} onChange={(e)=>setState(s=>({...s, issuer:e.target.value}))} />
        <label className="label">Date</label>
        <input className="input" value={state.date||''} onChange={(e)=>setState(s=>({...s, date:e.target.value}))} />
        <label className="label">Credential URL</label>
        <input className="input" value={state.credentialUrl||''} onChange={(e)=>setState(s=>({...s, credentialUrl:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='achievements'){
    return (
      <div>
        <label className="label">Title</label>
        <input className="input" value={state.title||''} onChange={(e)=>setState(s=>({...s, title:e.target.value}))} />
        <label className="label">Description</label>
        <textarea className="input" value={state.description||''} onChange={(e)=>setState(s=>({...s, description:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='testimonials'){
    return (
      <div>
        <label className="label">Name</label>
        <input className="input" value={state.name||''} onChange={(e)=>setState(s=>({...s, name:e.target.value}))} />
        <label className="label">Designation</label>
        <input className="input" value={state.designation||''} onChange={(e)=>setState(s=>({...s, designation:e.target.value}))} />
        <label className="label">Company</label>
        <input className="input" value={state.company||''} onChange={(e)=>setState(s=>({...s, company:e.target.value}))} />
        <label className="label">Review</label>
        <textarea className="input" value={state.review||''} onChange={(e)=>setState(s=>({...s, review:e.target.value}))} />
        <label className="label">Photo URL</label>
        <input className="input" value={state.photo||''} onChange={(e)=>setState(s=>({...s, photo:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='services'){
    return (
      <div>
        <label className="label">Service Name</label>
        <input className="input" value={state.name||''} onChange={(e)=>setState(s=>({...s, name:e.target.value}))} />
        <label className="label">Description</label>
        <textarea className="input" value={state.description||''} onChange={(e)=>setState(s=>({...s, description:e.target.value}))} />
        <label className="label">Icon (emoji or URL)</label>
        <input className="input" value={state.icon||''} onChange={(e)=>setState(s=>({...s, icon:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='gallery'){
    return (
      <div>
        <label className="label">Image URL</label>
        <input className="input" value={state.image||''} onChange={(e)=>setState(s=>({...s, image:e.target.value}))} />
        <label className="label">Title</label>
        <input className="input" value={state.title||''} onChange={(e)=>setState(s=>({...s, title:e.target.value}))} />
        <label className="label">Description</label>
        <textarea className="input" value={state.description||''} onChange={(e)=>setState(s=>({...s, description:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='blogs'){
    return (
      <div>
        <label className="label">Title</label>
        <input className="input" value={state.title||''} onChange={(e)=>setState(s=>({...s, title:e.target.value}))} />
        <label className="label">Summary</label>
        <textarea className="input" value={state.summary||''} onChange={(e)=>setState(s=>({...s, summary:e.target.value}))} />
        <label className="label">URL</label>
        <input className="input" value={state.url||''} onChange={(e)=>setState(s=>({...s, url:e.target.value}))} />
        <label className="label">Date</label>
        <input className="input" value={state.date||''} onChange={(e)=>setState(s=>({...s, date:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='socialLinks'){
    return (
      <div>
        <label className="label">GitHub</label>
        <input className="input" value={state.github||''} onChange={(e)=>setState(s=>({...s, github:e.target.value}))} />
        <label className="label">LinkedIn</label>
        <input className="input" value={state.linkedin||''} onChange={(e)=>setState(s=>({...s, linkedin:e.target.value}))} />
        <label className="label">Twitter/X</label>
        <input className="input" value={state.twitter||''} onChange={(e)=>setState(s=>({...s, twitter:e.target.value}))} />
        <label className="label">Instagram</label>
        <input className="input" value={state.instagram||''} onChange={(e)=>setState(s=>({...s, instagram:e.target.value}))} />
        <label className="label">YouTube</label>
        <input className="input" value={state.youtube||''} onChange={(e)=>setState(s=>({...s, youtube:e.target.value}))} />
        <label className="label">Website</label>
        <input className="input" value={state.website||''} onChange={(e)=>setState(s=>({...s, website:e.target.value}))} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    )
  }

  if(section.type==='custom'){
    return (
      <div>
        <label className="label">Section Title</label>
        <input className="input" value={state.title||''} onChange={(e)=>setState(s=>({...s, title:e.target.value}))} />
        <label className="label">Content</label>
        <textarea className="input" rows={4} value={state.content||''} onChange={(e)=>setState(s=>({...s, content:e.target.value}))} />
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
          {c.github && <div style={{fontSize:12,color:'#666'}}>GitHub: {c.github}</div>}
          {c.live && <div style={{fontSize:12,color:'#666'}}><a href={c.live} target="_blank" rel="noopener noreferrer">Live Demo</a></div>}
        </div>
      )
    case 'education':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.institution}</div>
          <div>{c.degree} ({c.year})</div>
          {c.description && <p style={{fontSize:13,color:'#666'}}>{c.description}</p>}
        </div>
      )
    case 'experience':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.company}</div>
          <div>{c.role} ({c.duration})</div>
          {c.description && <p style={{fontSize:13,color:'#666'}}>{c.description}</p>}
        </div>
      )
    case 'certifications':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.name}</div>
          <div>{c.issuer} ({c.date})</div>
          {c.credentialUrl && <div style={{fontSize:12,color:'#666'}}>Credential: {c.credentialUrl}</div>}
        </div>
      )
    case 'achievements':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.title}</div>
          <p style={{margin:'4px 0'}}>{c.description}</p>
        </div>
      )
    case 'testimonials':
      return (
        <div style={{padding:8,background:'#f9fafb',borderRadius:4}}>
          <p style={{fontStyle:'italic',margin:'0 0 8px 0'}}>"{c.review}"</p>
          <div style={{fontWeight:600}}>— {c.name}{c.designation && `, ${c.designation}`}{c.company && ` at ${c.company}`}</div>
        </div>
      )
    case 'services':
      return (
        <div>
          {c.icon && <span style={{fontSize:20}}>{c.icon} </span>}
          <strong>{c.name}</strong>
          <p style={{margin:'4px 0'}}>{c.description}</p>
        </div>
      )
    case 'gallery':
      return (
        <div>
          {c.image && <div style={{width:80,height:80,background:'#eee',marginBottom:4}}></div>}
          <div style={{fontWeight:600}}>{c.title}</div>
          <p style={{margin:'4px 0',fontSize:13}}>{c.description}</p>
        </div>
      )
    case 'blogs':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.title}</div>
          {c.date && <div style={{fontSize:12,color:'#666'}}>{c.date}</div>}
          <p style={{margin:'4px 0'}}>{c.summary}</p>
          {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" style={{fontSize:13}}>Read more</a>}
        </div>
      )
    case 'socialLinks':
      return (
        <div>
          {c.github && <div>GitHub: {c.github}</div>}
          {c.linkedin && <div>LinkedIn: {c.linkedin}</div>}
          {c.twitter && <div>Twitter: {c.twitter}</div>}
          {c.instagram && <div>Instagram: {c.instagram}</div>}
          {c.youtube && <div>YouTube: {c.youtube}</div>}
          {c.website && <div>Website: {c.website}</div>}
        </div>
      )
    case 'contact':
      return (
        <div>
          {c.email && <div>Email: {c.email}</div>}
          {c.linkedin && <div>LinkedIn: {c.linkedin}</div>}
          {c.github && <div>GitHub: {c.github}</div>}
        </div>
      )
    case 'custom':
      return (
        <div>
          <div style={{fontWeight:600}}>{c.title}</div>
          <div style={{marginTop:4}}>{c.content}</div>
        </div>
      )
    default:
      return <div>{s.type}</div>
  }
}
