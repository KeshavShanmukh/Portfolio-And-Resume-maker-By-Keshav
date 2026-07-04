import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import SplitPane from '../../components/SplitPane'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { API_BASE_URL } from '../../api/config'

export default function ResumeDragBuilder({ resume }){
  const token = localStorage.getItem('token')
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await axios.get(`${API_BASE_URL}/api/resume/${resume.id}`, { headers: { Authorization: `Bearer ${token}` } })
      const secs = (res.data.sections || []).map(s=>({ ...s, content: safeParse(s.content) }))
      secs.sort((a,b)=>a.position - b.position)
      setSections(secs)
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{ load() },[resume.id])

  function safeParse(v){ try{ return JSON.parse(v) }catch(e){ return {} } }

  const addSection = async (type)=>{
    try{
      const res = await axios.post(`${API_BASE_URL}/api/resume/section`, { resumeId: resume.id, type, content: {} }, { headers: { Authorization: `Bearer ${token}` } })
      const s = { ...res.data, content: {} }
      setSections(prev=>[...prev, s])
    }catch(e){ console.error(e) }
  }

  const removeSection = async (id)=>{
    if(!confirm('Remove section?')) return
    try{
      await axios.delete(`${API_BASE_URL}/api/resume/section/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setSections(prev=>prev.filter(s=>s.id!==id))
    }catch(e){ console.error(e) }
  }

  const updateSectionContent = async (id, content)=>{
    try{
      await axios.put(`${API_BASE_URL}/api/resume/section/${id}`, { content }, { headers: { Authorization: `Bearer ${token}` } })
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
          axios.put(`${API_BASE_URL}/api/resume/section/${s.id}`, { position: idx + 1 }, { headers: { Authorization: `Bearer ${token}` } })
        ))
      } catch (e) { console.error(e) }
    }
  }

  const togglePublish = async ()=>{
    try{
      await axios.put(`${API_BASE_URL}/api/resume/${resume.id}`, { isPublished: !resume.isPublished }, { headers: { Authorization: `Bearer ${token}` } })
      resume.isPublished = !resume.isPublished
    }catch(e){ console.error(e) }
  }

  if(loading) return <div className="container"><p>Loading...</p></div>

  const leftPanel = (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>Live Preview</h3>
        <div style={{border:'1px solid #e5e7eb',padding:16,borderRadius:6,background:'#fff'}}>
          <ResumePreview sections={sections} />
        </div>
      </div>
    </div>
  )

  const rightPanel = (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>Sections (Drag to reorder)</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
          <button className="btn btn-sm" onClick={()=>addSection('contact')}>+ Contact</button>
          <button className="btn btn-sm" onClick={()=>addSection('summary')}>+ Summary</button>
          <button className="btn btn-sm" onClick={()=>addSection('skills')}>+ Skills</button>
          <button className="btn btn-sm" onClick={()=>addSection('experience')}>+ Experience</button>
          <button className="btn btn-sm" onClick={()=>addSection('education')}>+ Education</button>
          <button className="btn btn-sm" onClick={()=>addSection('projects')}>+ Projects</button>
          <button className="btn btn-sm" onClick={()=>addSection('certifications')}>+ Certifications</button>
          <button className="btn btn-sm" onClick={()=>addSection('languages')}>+ Languages</button>
          <button className="btn btn-sm" onClick={()=>addSection('interests')}>+ Interests</button>
          <button className="btn btn-sm" onClick={()=>addSection('references')}>+ References</button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s=>s.id)} strategy={verticalListSortingStrategy}>
            <div style={{marginTop:12}}>
              {sections.map(s => (
                <SortableSection key={s.id} section={s} onRemove={removeSection} onUpdate={updateSectionContent} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Resume Builder (Drag & Drop)</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="/dashboard/resumes">My Resumes</a>
          <a href="#" onClick={togglePublish}>{resume.isPublished ? 'Unpublish' : 'Publish'}</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:'1rem'}}>
        <SplitPane left={leftPanel} right={rightPanel} initialLeftWidth={80} />
      </div>
    </div>
  )
}

function SortableSection({ section, onRemove, onUpdate }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{padding:12,border:'1px solid #e5e7eb',borderRadius:6,marginBottom:8,background:'#fff',cursor:'move'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:600,textTransform:'capitalize'}}>☰ {section.type}</div>
          <button className="btn btn-danger btn-sm" onClick={(e)=>{ e.stopPropagation(); onRemove(section.id); }}>Remove</button>
        </div>
        <ResumeSectionEditor section={section} onChange={(c)=>onUpdate(section.id,c)} />
      </div>
    </div>
  )
}

function ResumeSectionEditor({ section, onChange }){
  const [state, setState] = useState(section.content || {})
  useEffect(()=> setState(section.content || {}), [section.id])

  const save = ()=> onChange(state)

  if(section.type==='contact'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Name</label>
        <input className="input" value={state.name||''} onChange={(e)=>setState(s=>({...s, name:e.target.value}))} onBlur={save} />
        <label className="label">Email</label>
        <input className="input" value={state.email||''} onChange={(e)=>setState(s=>({...s, email:e.target.value}))} onBlur={save} />
        <label className="label">Phone</label>
        <input className="input" value={state.phone||''} onChange={(e)=>setState(s=>({...s, phone:e.target.value}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='summary'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Professional Summary</label>
        <textarea className="input" rows={3} value={state.text||''} onChange={(e)=>setState(s=>({...s, text:e.target.value}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='skills'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Skills (comma separated)</label>
        <input className="input" value={(state.skills||[]).join(', ')} onChange={(e)=>setState(s=>({...s, skills: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='experience'){
    const items = state.items || []
    return (
      <div style={{marginTop:8}}>
        <label className="label">Work Experience</label>
        {items.map((item, idx)=>(
          <div key={idx} style={{padding:8,border:'1px solid #eee',borderRadius:4,marginBottom:8}}>
            <input className="input" placeholder="Company" value={item.company||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, company:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Role" value={item.role||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, role:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {company:'',role:''}]}))
          onChange({...state, items: [...items, {company:'',role:''}]})
        }}>+ Add Experience</button>
      </div>
    )
  }

  return <div style={{marginTop:8,color:'#666',fontSize:'12px'}}>Edit this section in Form Builder for full options</div>
}

function ResumePreview({ sections }){
  const contact = sections.find(s=>s.type==='contact')?.content || {}
  const summary = sections.find(s=>s.type==='summary')?.content || {}
  const skills = sections.find(s=>s.type==='skills')?.content || {}
  const experience = sections.find(s=>s.type==='experience')?.content || {}
  const education = sections.find(s=>s.type==='education')?.content || {}

  return (
    <div style={{fontFamily:'Arial,sans-serif',fontSize:'14px',lineHeight:'1.5'}}>
      {contact.name && <h1 style={{margin:'0 0 4px 0',fontSize:'24px'}}>{contact.name}</h1>}
      <div style={{color:'#666',fontSize:'12px',marginBottom:'12px'}}>
        {contact.email && <span>{contact.email} • </span>}
        {contact.phone && <span>{contact.phone}</span>}
      </div>

      {summary.text && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Professional Summary</h3>
          <p style={{margin:0}}>{summary.text}</p>
        </div>
      )}

      {skills.skills && skills.skills.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Skills</h3>
          <p style={{margin:0}}>{skills.skills.join(', ')}</p>
        </div>
      )}

      {experience.items && experience.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Experience</h3>
          {experience.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'8px'}}>
              <div style={{fontWeight:'600'}}>{item.role} at {item.company}</div>
            </div>
          ))}
        </div>
      )}

      {education.items && education.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Education</h3>
          {education.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'4px'}}>
              <strong>{item.degree}</strong> - {item.institution}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
