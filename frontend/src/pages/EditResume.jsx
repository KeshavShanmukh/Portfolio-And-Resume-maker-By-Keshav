import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ResumeFormBuilder from '../resume/form-builder/ResumeFormBuilder'
import ResumeDragBuilder from '../resume/drag-builder/ResumeDragBuilder'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function EditResume(){
  const { id, mode } = useParams()
  const [resume, setResume] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await axios.get(`${API_BASE_URL}/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        setResume(res.data)
      }catch(e){ console.error(e) }
    })()
  },[id])

  if(!resume) return <div className="container"><p>Loading...</p></div>

  const builder = mode ? mode.toUpperCase() : (resume.builderType || 'FORM')

  if(builder==='FORM') return <ResumeFormBuilder resume={resume} />
  return <ResumeDragBuilder resume={resume} />
}
