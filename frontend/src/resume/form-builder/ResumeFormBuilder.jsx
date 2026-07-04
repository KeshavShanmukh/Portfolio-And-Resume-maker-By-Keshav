import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../api/config'
import SplitPane from '../../components/SplitPane'

export default function ResumeFormBuilder({ resume }){
  const token = localStorage.getItem('token')
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

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
        <h3 style={{marginTop:0}}>Resume Editor</h3>
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

        <div style={{marginTop:12}}>
          {sections.map(s => (
            <div key={s.id} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:6,marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontWeight:600,textTransform:'capitalize'}}>{s.type}</div>
                <button className="btn btn-danger btn-sm" onClick={()=>removeSection(s.id)}>Remove</button>
              </div>
              <ResumeSectionEditor section={s} onChange={(c)=>updateSectionContent(s.id,c)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Resume Builder</div>
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
        <label className="label">Location</label>
        <input className="input" value={state.location||''} onChange={(e)=>setState(s=>({...s, location:e.target.value}))} onBlur={save} />
        <label className="label">LinkedIn</label>
        <input className="input" value={state.linkedin||''} onChange={(e)=>setState(s=>({...s, linkedin:e.target.value}))} onBlur={save} />
        <label className="label">GitHub</label>
        <input className="input" value={state.github||''} onChange={(e)=>setState(s=>({...s, github:e.target.value}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='summary'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Professional Summary</label>
        <textarea className="input" rows={4} value={state.text||''} onChange={(e)=>setState(s=>({...s, text:e.target.value}))} onBlur={save} />
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
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Duration" value={item.duration||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, duration:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <textarea className="input" placeholder="Description" rows={2} value={item.description||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, description:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
            <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>{
              const newItems = items.filter((_,i)=>i!==idx)
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }}>Remove</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {company:'',role:'',duration:'',description:''}]}))
          onChange({...state, items: [...items, {company:'',role:'',duration:'',description:''}]})
        }}>+ Add Experience</button>
      </div>
    )
  }

  if(section.type==='education'){
    const items = state.items || []
    return (
      <div style={{marginTop:8}}>
        <label className="label">Education</label>
        {items.map((item, idx)=>(
          <div key={idx} style={{padding:8,border:'1px solid #eee',borderRadius:4,marginBottom:8}}>
            <input className="input" placeholder="Institution" value={item.institution||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, institution:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Degree" value={item.degree||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, degree:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Year" value={item.year||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, year:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
            <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>{
              const newItems = items.filter((_,i)=>i!==idx)
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }}>Remove</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {institution:'',degree:'',year:''}]}))
          onChange({...state, items: [...items, {institution:'',degree:'',year:''}]})
        }}>+ Add Education</button>
      </div>
    )
  }

  if(section.type==='projects'){
    const items = state.items || []
    return (
      <div style={{marginTop:8}}>
        <label className="label">Projects</label>
        {items.map((item, idx)=>(
          <div key={idx} style={{padding:8,border:'1px solid #eee',borderRadius:4,marginBottom:8}}>
            <input className="input" placeholder="Project Name" value={item.name||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, name:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <textarea className="input" placeholder="Description" rows={2} value={item.description||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, description:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Technologies" value={item.technologies||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, technologies:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
            <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>{
              const newItems = items.filter((_,i)=>i!==idx)
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }}>Remove</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {name:'',description:'',technologies:''}]}))
          onChange({...state, items: [...items, {name:'',description:'',technologies:''}]})
        }}>+ Add Project</button>
      </div>
    )
  }

  if(section.type==='certifications'){
    const items = state.items || []
    return (
      <div style={{marginTop:8}}>
        <label className="label">Certifications</label>
        {items.map((item, idx)=>(
          <div key={idx} style={{padding:8,border:'1px solid #eee',borderRadius:4,marginBottom:8}}>
            <input className="input" placeholder="Certification Name" value={item.name||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, name:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Issuer" value={item.issuer||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, issuer:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Date" value={item.date||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, date:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
            <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>{
              const newItems = items.filter((_,i)=>i!==idx)
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }}>Remove</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {name:'',issuer:'',date:''}]}))
          onChange({...state, items: [...items, {name:'',issuer:'',date:''}]})
        }}>+ Add Certification</button>
      </div>
    )
  }

  if(section.type==='languages'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Languages (comma separated)</label>
        <input className="input" value={(state.languages||[]).join(', ')} onChange={(e)=>setState(s=>({...s, languages: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='interests'){
    return (
      <div style={{marginTop:8}}>
        <label className="label">Interests (comma separated)</label>
        <input className="input" value={(state.interests||[]).join(', ')} onChange={(e)=>setState(s=>({...s, interests: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} onBlur={save} />
      </div>
    )
  }

  if(section.type==='references'){
    const items = state.items || []
    return (
      <div style={{marginTop:8}}>
        <label className="label">References</label>
        {items.map((item, idx)=>(
          <div key={idx} style={{padding:8,border:'1px solid #eee',borderRadius:4,marginBottom:8}}>
            <input className="input" placeholder="Name" value={item.name||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, name:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Designation" value={item.designation||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, designation:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Company" value={item.company||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, company:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Email" value={item.email||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, email:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Phone" value={item.phone||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, phone:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} style={{marginBottom:4}} />
            <input className="input" placeholder="Relationship" value={item.relationship||''} onChange={(e)=>{
              const newItems = [...items]
              newItems[idx] = {...item, relationship:e.target.value}
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }} />
            <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>{
              const newItems = items.filter((_,i)=>i!==idx)
              setState(s=>({...s, items: newItems}))
              onChange({...state, items: newItems})
            }}>Remove</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={()=>{
          setState(s=>({...s, items: [...items, {name:'',designation:'',company:'',email:'',phone:'',relationship:''}]}))
          onChange({...state, items: [...items, {name:'',designation:'',company:'',email:'',phone:'',relationship:''}]})
        }}>+ Add Reference</button>
      </div>
    )
  }

  return <div>Unknown section type</div>
}

function ResumePreview({ sections }){
  const contact = sections.find(s=>s.type==='contact')?.content || {}
  const summary = sections.find(s=>s.type==='summary')?.content || {}
  const skills = sections.find(s=>s.type==='skills')?.content || {}
  const experience = sections.find(s=>s.type==='experience')?.content || {}
  const education = sections.find(s=>s.type==='education')?.content || {}
  const projects = sections.find(s=>s.type==='projects')?.content || {}
  const certifications = sections.find(s=>s.type==='certifications')?.content || {}
  const languages = sections.find(s=>s.type==='languages')?.content || {}
  const interests = sections.find(s=>s.type==='interests')?.content || {}
  const references = sections.find(s=>s.type==='references')?.content || {}

  return (
    <div style={{fontFamily:'Arial,sans-serif',fontSize:'14px',lineHeight:'1.5'}}>
      {contact.name && <h1 style={{margin:'0 0 4px 0',fontSize:'24px'}}>{contact.name}</h1>}
      <div style={{color:'#666',fontSize:'12px',marginBottom:'12px'}}>
        {contact.email && <span>{contact.email} • </span>}
        {contact.phone && <span>{contact.phone} • </span>}
        {contact.location && <span>{contact.location} • </span>}
        {contact.linkedin && <span>{contact.linkedin}</span>}
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
              <div style={{color:'#666',fontSize:'12px'}}>{item.duration}</div>
              <div style={{marginTop:'2px'}}>{item.description}</div>
            </div>
          ))}
        </div>
      )}

      {education.items && education.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Education</h3>
          {education.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'4px'}}>
              <strong>{item.degree}</strong> - {item.institution} ({item.year})
            </div>
          ))}
        </div>
      )}

      {projects.items && projects.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Projects</h3>
          {projects.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'8px'}}>
              <div style={{fontWeight:'600'}}>{item.name}</div>
              <div>{item.description}</div>
              <div style={{color:'#666',fontSize:'12px'}}>Technologies: {item.technologies}</div>
            </div>
          ))}
        </div>
      )}

      {certifications.items && certifications.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Certifications</h3>
          {certifications.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'4px'}}>
              {item.name} - {item.issuer} ({item.date})
            </div>
          ))}
        </div>
      )}

      {languages.languages && languages.languages.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Languages</h3>
          <p style={{margin:0}}>{languages.languages.join(', ')}</p>
        </div>
      )}

      {interests.interests && interests.interests.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>Interests</h3>
          <p style={{margin:0}}>{interests.interests.join(', ')}</p>
        </div>
      )}

      {references.items && references.items.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          <h3 style={{margin:'0 0 4px 0',fontSize:'14px',textTransform:'uppercase',borderBottom:'1px solid #ccc'}}>References</h3>
          {references.items.map((item, idx)=>(
            <div key={idx} style={{marginBottom:'8px'}}>
              <div style={{fontWeight:'600'}}>{item.name}</div>
              <div style={{color:'#666',fontSize:'12px'}}>{item.designation}{item.company && ` at ${item.company}`}</div>
              <div style={{fontSize:'12px'}}>
                {item.email && <span>{item.email} • </span>}
                {item.phone && <span>{item.phone} • </span>}
                {item.relationship && <span>{item.relationship}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
