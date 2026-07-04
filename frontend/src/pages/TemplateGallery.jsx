import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPortfolioTemplate, loadResumeTemplate, getAllPortfolioTemplates, getAllResumeTemplates } from '../utils/templateLoader'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function TemplateGallery(){
  const [activeTab, setActiveTab] = useState('portfolio')
  const [portfolioTemplates, setPortfolioTemplates] = useState([])
  const [resumeTemplates, setResumeTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(()=>{
    loadTemplates()
  },[])

  const loadTemplates = ()=>{
    setLoading(true)
    try{
      const portfolioList = getAllPortfolioTemplates()
      const resumeList = getAllResumeTemplates()
      
      // Load detailed template data
      const portfolioData = portfolioList.map(t => ({
        ...t,
        ...loadPortfolioTemplate(t.id)
      }))
      
      const resumeData = resumeList.map(t => ({
        ...t,
        ...loadResumeTemplate(t.id)
      }))
      
      setPortfolioTemplates(portfolioData)
      setResumeTemplates(resumeData)
    }catch(e){
      console.error('Error loading templates:', e)
    }
    setLoading(false)
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
  }

  const applyPortfolioTemplate = async () => {
    if(!selectedTemplate) return
    
    try{
      setLoading(true)
      // Create portfolio with template data
      const payload = {
        title: `${selectedTemplate.name} Portfolio`,
        builderType: 'DRAG_DROP',
        theme: JSON.stringify(selectedTemplate.theme),
        meta: JSON.stringify({ templateId: selectedTemplate.id })
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/portfolio/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      const portfolioId = res.data.id
      
      // Create sections from template
      for(const section of selectedTemplate.sections){
        await axios.post(`${API_BASE_URL}/api/portfolio/section`, {
          portfolioId,
          type: section.type,
          content: section.content,
          position: section.position
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      alert('Template applied successfully!')
      nav(`/dashboard/portfolio/${portfolioId}`)
    }catch(e){
      alert('Error applying template: ' + (e.response?.data?.error || 'Failed'))
    }
    setLoading(false)
  }

  const applyResumeTemplate = async () => {
    if(!selectedTemplate) return
    
    try{
      setLoading(true)
      // Create resume with template data
      const payload = {
        title: `${selectedTemplate.name} Resume`,
        builderType: 'FORM',
        theme: JSON.stringify(selectedTemplate.theme),
        meta: JSON.stringify({ templateId: selectedTemplate.id })
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/resume/create`, payload, { headers: { Authorization: `Bearer ${token}` } })
      const resumeId = res.data.id
      
      // Create sections from template
      for(const section of selectedTemplate.sections){
        await axios.post(`${API_BASE_URL}/api/resume/section`, {
          resumeId,
          type: section.type,
          content: section.content,
          position: section.position
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      
      alert('Template applied successfully!')
      nav(`/dashboard/resume/${resumeId}/form`)
    }catch(e){
      alert('Error applying template: ' + (e.response?.data?.error || 'Failed'))
    }
    setLoading(false)
  }

  const filteredPortfolioTemplates = portfolioTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredResumeTemplates = resumeTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Template Gallery</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/portfolios">Portfolios</a>
          <a href="/dashboard/resumes">Resumes</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0}}>Choose a Template</h3>
          <input 
            className="input" 
            style={{width:300}}
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <button 
            className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={()=>setActiveTab('portfolio')}
          >
            Portfolio Templates
          </button>
          <button 
            className={`btn ${activeTab === 'resume' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={()=>setActiveTab('resume')}
          >
            Resume Templates
          </button>
        </div>

        {loading && <p>Loading templates...</p>}

        {!loading && activeTab === 'portfolio' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {filteredPortfolioTemplates.map(template => (
              <div 
                key={template.id}
                style={{
                  padding:16,
                  border:'1px solid #e5e7eb',
                  borderRadius:8,
                  cursor:'pointer',
                  background:selectedTemplate?.id === template.id ? '#f0f9ff' : '#fff',
                  transition:'all 0.2s'
                }}
                onClick={()=>handleTemplateSelect(template)}
                onMouseEnter={(e)=>e.currentTarget.style.borderColor = template.theme.primaryColor}
                onMouseLeave={(e)=>e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{height:120,background:template.theme.backgroundColor,borderRadius:6,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid',borderColor:template.theme.primaryColor}}>
                  <div style={{fontSize:32}}>📁</div>
                </div>
                <div style={{fontWeight:600,marginBottom:4}}>{template.name}</div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>{template.description}</div>
                <div style={{fontSize:11,color:'#9ca3af'}}>
                  Layout: {template.layout} • {template.sections.length} sections
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'resume' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {filteredResumeTemplates.map(template => (
              <div 
                key={template.id}
                style={{
                  padding:16,
                  border:'1px solid #e5e7eb',
                  borderRadius:8,
                  cursor:'pointer',
                  background:selectedTemplate?.id === template.id ? '#f0f9ff' : '#fff',
                  transition:'all 0.2s'
                }}
                onClick={()=>handleTemplateSelect(template)}
                onMouseEnter={(e)=>e.currentTarget.style.borderColor = template.theme.primaryColor}
                onMouseLeave={(e)=>e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{height:120,background:template.theme.backgroundColor,borderRadius:6,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid',borderColor:template.theme.primaryColor}}>
                  <div style={{fontSize:32}}>📄</div>
                </div>
                <div style={{fontWeight:600,marginBottom:4}}>{template.name}</div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>{template.description}</div>
                <div style={{fontSize:11,color:'#9ca3af'}}>
                  Layout: {template.layout} • {template.sections.length} sections
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTemplate && (
        <div style={{marginTop:16}} className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Template Preview: {selectedTemplate.name}</h3>
            <button 
              className="btn btn-primary"
              onClick={activeTab === 'portfolio' ? applyPortfolioTemplate : applyResumeTemplate}
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply Template'}
            </button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <h4 style={{marginTop:0}}>Theme Settings</h4>
              <div style={{marginTop:8}}>
                <div style={{marginBottom:8}}>
                  <label className="label">Primary Color</label>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:40,height:40,background:selectedTemplate.theme.primaryColor,borderRadius:4,border:'1px solid #e5e7eb'}} />
                    <span>{selectedTemplate.theme.primaryColor}</span>
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <label className="label">Secondary Color</label>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:40,height:40,background:selectedTemplate.theme.secondaryColor,borderRadius:4,border:'1px solid #e5e7eb'}} />
                    <span>{selectedTemplate.theme.secondaryColor}</span>
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <label className="label">Font</label>
                  <div>{selectedTemplate.theme.font}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{marginTop:0}}>Sections ({selectedTemplate.sections.length})</h4>
              <div style={{marginTop:8}}>
                {selectedTemplate.sections.map((section, idx) => (
                  <div key={idx} style={{padding:8,border:'1px solid #e5e7eb',borderRadius:4,marginBottom:4}}>
                    <div style={{fontWeight:600,textTransform:'capitalize'}}>{section.type}</div>
                    <div style={{fontSize:12,color:'#6b7280'}}>Position: {section.position}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
