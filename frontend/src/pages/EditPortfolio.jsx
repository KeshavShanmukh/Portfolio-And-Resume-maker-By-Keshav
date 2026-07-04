import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import FormBuilder from '../portfolio/form-builder/FormBuilder'
import DragBuilder from '../portfolio/drag-builder/DragBuilder'
import CodeBuilder from '../portfolio/code-builder/CodeBuilder'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function EditPortfolio(){
  const { id, mode } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await axios.get(`${API_BASE_URL}/api/portfolio/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        setPortfolio(res.data)
      }catch(e){ console.error(e) }
    })()
  },[id])

  if(!portfolio) return <div className="container"><p>Loading...</p></div>

  // prefer explicit mode from pathname (/form /drag /code) otherwise use portfolio.builderType
  const builder = mode ? mode.toUpperCase() : (portfolio.builderType || 'DRAG_DROP')

  if(builder==='FORM' || builder==='FORMBUILDER') return <FormBuilder portfolio={portfolio} />
  if(builder==='CODE') return <CodeBuilder portfolio={portfolio} />
  return <DragBuilder portfolio={portfolio} />
}
