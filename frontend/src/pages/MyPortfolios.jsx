import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function MyPortfolios(){
  const [list, setList] = useState([])
  const nav = useNavigate()
  const token = localStorage.getItem('token')

  const load = async ()=>{
    try{
      const res = await axios.get('http://localhost:4000/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
      setList(res.data || [])
    }catch(e){
      console.error(e)
    }
  }

  useEffect(()=>{ load() },[])

  const [choosing, setChoosing] = useState(false)
  const create = async (method)=>{
    try{
      const payload = { title: 'Untitled Portfolio', builderType: method }
      const res = await axios.post('http://localhost:4000/api/portfolio/create', payload, { headers: { Authorization: `Bearer ${token}` } })
      setChoosing(false)
      if(method==='FORM') nav(`/dashboard/portfolio/${res.data.id}/form`)
      else if(method==='CODE') nav(`/dashboard/portfolio/${res.data.id}/code`)
      else nav(`/dashboard/portfolio/${res.data.id}/drag`)
    }catch(e){ console.error(e) }
  }

  const remove = async (id)=>{
    if(!confirm('Delete this portfolio?')) return
    try{
      await axios.delete(`http://localhost:4000/api/portfolio/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      load()
    }catch(e){ console.error(e) }
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
          <div>
            <button onClick={()=>setChoosing(v=>!v)} className="btn">Create Portfolio</button>
          </div>
        </div>

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
