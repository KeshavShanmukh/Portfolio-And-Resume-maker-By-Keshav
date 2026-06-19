import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function FormBuilder({ portfolio }){
  const token = localStorage.getItem('token')
  const [meta, setMeta] = useState(portfolio.meta||{
    personal:{ name:'', role:'', image:'', tagline:'' },
    about:{ description:'' },
    skills:[],
    projects:[],
    education:[],
    experience:[],
    certifications:[],
    contact:{ email:'', phone:'', linkedin:'', github:'', portfolioUrl:'' }
  })

  useEffect(()=> setMeta(portfolio.meta || meta), [portfolio.id])

  const save = async (next)=>{
    const payload = { meta: next }
    try{
      await axios.put(`http://localhost:4000/api/portfolio/${portfolio.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
    }catch(e){ console.error(e) }
  }

  // autosave on meta change (debounced)
  useEffect(()=>{
    const t = setTimeout(()=> save(meta), 700)
    return ()=> clearTimeout(t)
  },[meta])

  const addItem = (key, item)=> setMeta(m=>{ const next = {...m, [key]: [...(m[key]||[]), item]}; return next })
  const removeItem = (key, idx)=> setMeta(m=>{ const arr = [...(m[key]||[])]; arr.splice(idx,1); return {...m, [key]: arr} })
  const updateItem = (key, idx, nextItem)=> setMeta(m=>{ const arr = [...(m[key]||[])]; arr[idx]=nextItem; return {...m, [key]: arr} })

  return (
    <div className="container" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div>
        <div className="card">
          <h3 style={{marginTop:0}}>Form Builder</h3>
          <label className="label">Name</label>
          <input className="input" value={meta.personal.name||''} onChange={(e)=>setMeta(m=>({...m, personal:{...m.personal, name:e.target.value}}))} />
          <label className="label">Role</label>
          <input className="input" value={meta.personal.role||''} onChange={(e)=>setMeta(m=>({...m, personal:{...m.personal, role:e.target.value}}))} />
          <label className="label">Tagline</label>
          <input className="input" value={meta.personal.tagline||''} onChange={(e)=>setMeta(m=>({...m, personal:{...m.personal, tagline:e.target.value}}))} />
          <label className="label">Profile Image URL</label>
          <input className="input" value={meta.personal.image||''} onChange={(e)=>setMeta(m=>({...m, personal:{...m.personal, image:e.target.value}}))} />
        </div>

        <div className="card" style={{marginTop:12}}>
          <h4>Skills</h4>
          { (meta.skills||[]).map((s,idx)=> (
            <div key={idx} style={{display:'flex',gap:8,marginBottom:6}}>
              <input className="input" value={s.name||''} onChange={(e)=> updateItem('skills', idx, {...s, name: e.target.value})} placeholder="Skill" />
              <input className="input" value={s.level||''} onChange={(e)=> updateItem('skills', idx, {...s, level: e.target.value})} placeholder="Level" />
              <button className="btn btn-danger btn-sm" onClick={()=> removeItem('skills', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={()=> addItem('skills', {name:'', level:''})}>Add Skill</button>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h4>Projects</h4>
          {(meta.projects||[]).map((p,idx)=> (
            <div key={idx} style={{border:'1px solid #eee',padding:8,marginBottom:8}}>
              <input className="input" value={p.title||''} onChange={(e)=> updateItem('projects', idx, {...p, title:e.target.value})} placeholder="Title" />
              <textarea className="input" value={p.description||''} onChange={(e)=> updateItem('projects', idx, {...p, description:e.target.value})} placeholder="Description" />
              <input className="input" value={p.github||''} onChange={(e)=> updateItem('projects', idx, {...p, github:e.target.value})} placeholder="GitHub URL" />
              <input className="input" value={p.live||''} onChange={(e)=> updateItem('projects', idx, {...p, live:e.target.value})} placeholder="Live URL" />
              <input className="input" value={p.image||''} onChange={(e)=> updateItem('projects', idx, {...p, image:e.target.value})} placeholder="Image URL" />
              <button className="btn btn-danger btn-sm" onClick={()=> removeItem('projects', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={()=> addItem('projects', {title:'', description:'', github:'', live:'', image:''})}>Add Project</button>
        </div>

      </div>

      <div>
        <div className="card">
          <h3 style={{marginTop:0}}>Live Preview</h3>
          <div style={{padding:12,border:'1px solid #e5e7eb'}}>
            <h1>{meta.personal.name || 'Your Name'}</h1>
            <div>{meta.personal.role}</div>
            <p>{meta.personal.tagline}</p>
            <hr />
            <h3>About</h3>
            <p>{meta.about.description}</p>
            <h3>Skills</h3>
            <ul>{(meta.skills||[]).map((s,idx)=>(<li key={idx}>{s.name} — {s.level}</li>))}</ul>
            <h3>Projects</h3>
            {(meta.projects||[]).map((p,idx)=>(<div key={idx}><strong>{p.title}</strong><div>{p.description}</div></div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
