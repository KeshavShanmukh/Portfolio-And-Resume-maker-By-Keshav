import { useEffect, useState } from 'react'
import axios from 'axios'

export default function PortfolioForm({onChange}){
  const [form, setForm] = useState({
    fullName:'', headline:'', bio:'', email:'', website:'', skills:'', links:''
  })
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token')
      if(!token) return
      try{
        const res = await axios.get('http://localhost:4000/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
        if(res.data) setForm(res.data)
      }catch(e){/* ignore */}
    }
    load()
  },[])

  function handleChange(e){
    const {name, value} = e.target
    const next = {...form, [name]: value}
    setForm(next)
    if(onChange) onChange(next)
  }

  async function save(e){
    e.preventDefault(); setLoading(true)
    const token = localStorage.getItem('token')
    try{
      if(token){
        await axios.post('http://localhost:4000/api/portfolio', form, { headers: { Authorization: `Bearer ${token}` } })
        alert('Portfolio saved to server')
      } else {
        localStorage.setItem('portfolio', JSON.stringify(form))
        alert('Not authenticated — saved locally')
      }
      if(onChange) onChange(form)
    }catch(e){
      alert('Save failed')
    }finally{setLoading(false)}
  }

  function clearAll(){
    localStorage.removeItem('portfolio'); setForm({fullName:'', headline:'', bio:'', email:'', website:'', skills:'', links:''});
    if(onChange) onChange(null)
  }

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Portfolio Details</h3>
      <form onSubmit={save}>
        <div className="form-field"><label>Full name</label><input name="fullName" value={form.fullName||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Headline</label><input name="headline" value={form.headline||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Bio</label><textarea name="bio" value={form.bio||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Email</label><input name="email" value={form.email||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Website</label><input name="website" value={form.website||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Skills (comma separated)</label><input name="skills" value={form.skills||''} onChange={handleChange} /></div>
        <div className="form-field"><label>Links (comma separated)</label><input name="links" value={form.links||''} onChange={handleChange} /></div>
        <div className="row" style={{marginTop:'0.5rem'}}>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading? 'Saving...':'Save'}</button>
          <button type="button" className="btn btn-secondary" onClick={clearAll}>Clear</button>
        </div>
      </form>
    </div>
  )
}
