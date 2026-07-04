import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../api/config'
import SplitPane from '../../components/SplitPane'

// Portfolio section types configuration
const PORTFOLIO_SECTIONS = [
  'hero', 'about', 'skills', 'projects', 'education', 'experience',
  'certifications', 'achievements', 'testimonials', 'services',
  'gallery', 'blogs', 'socialLinks', 'contact', 'custom'
]

export default function FormBuilder({ portfolio }){
  const token = localStorage.getItem('token')
  const [meta, setMeta] = useState(portfolio.meta || {
    personal: { name: '', role: '', image: '', tagline: '' },
    about: { description: '' },
    skills: [],
    projects: [],
    education: [],
    experience: [],
    certifications: [],
    achievements: [],
    testimonials: [],
    services: [],
    gallery: [],
    blogs: [],
    socialLinks: { github: '', linkedin: '', twitter: '', instagram: '', youtube: ''},
    contact: { email: '', phone: '', location: ''},
    custom: []
  })

  useEffect(() => setMeta(portfolio.meta || meta), [portfolio.id])

  const save = async (next) => {
    const payload = { meta: next }
    try {
      await axios.put(`${API_BASE_URL}/api/portfolio/${portfolio.id}`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
    } catch(e) { 
      console.error(e) 
    }
  }

  // autosave on meta change (debounced)
  useEffect(() => {
    const t = setTimeout(() => save(meta), 700)
    return () => clearTimeout(t)
  }, [meta])

  const addItem = (key, item) => setMeta(m => { 
    const next = { ...m, [key]: [...(m[key] || []), item] }
    return next 
  })

  const removeItem = (key, idx) => setMeta(m => { 
    const arr = [...(m[key] || [])]
    arr.splice(idx, 1)
    return { ...m, [key]: arr } 
  })

  const updateItem = (key, idx, nextItem) => setMeta(m => { 
    const arr = [...(m[key] || [])]
    arr[idx] = nextItem
    return { ...m, [key]: arr } 
  })

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '20% 80%', gap: 12 }}>
      <div>
        {/* Personal Information */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Personal Information</h3>
          <label className="label">Full Name</label>
          <input className="input" value={meta.personal.name || ''} 
            onChange={(e) => setMeta(m => ({ ...m, personal: { ...m.personal, name: e.target.value } }))} />
          <label className="label">Professional Title</label>
          <input className="input" value={meta.personal.role || ''} 
            onChange={(e) => setMeta(m => ({ ...m, personal: { ...m.personal, role: e.target.value } }))} />
          <label className="label">Tagline</label>
          <input className="input" value={meta.personal.tagline || ''} 
            onChange={(e) => setMeta(m => ({ ...m, personal: { ...m.personal, tagline: e.target.value } }))} />
          <label className="label">Profile Image URL</label>
          <input className="input" value={meta.personal.image || ''} 
            onChange={(e) => setMeta(m => ({ ...m, personal: { ...m.personal, image: e.target.value } }))} />
        </div>

        {/* About Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>About</h4>
          <label className="label">Description</label>
          <textarea className="input" rows={4} value={meta.about.description || ''} 
            onChange={(e) => setMeta(m => ({ ...m, about: { description: e.target.value } }))} />
        </div>

        {/* Skills Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Skills</h4>
          {(meta.skills || []).map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input className="input" value={s.name || ''} 
                onChange={(e) => updateItem('skills', idx, { ...s, name: e.target.value })} placeholder="Skill" />
              <input className="input" value={s.level || ''} 
                onChange={(e) => updateItem('skills', idx, { ...s, level: e.target.value })} placeholder="Level" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('skills', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('skills', { name: '', level: '' })}>Add Skill</button>
        </div>

        {/* Projects Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Projects</h4>
          {(meta.projects || []).map((p, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={p.title || ''} 
                onChange={(e) => updateItem('projects', idx, { ...p, title: e.target.value })} placeholder="Title" />
              <textarea className="input" value={p.description || ''} 
                onChange={(e) => updateItem('projects', idx, { ...p, description: e.target.value })} placeholder="Description" />
              <input className="input" value={p.github || ''} 
                onChange={(e) => updateItem('projects', idx, { ...p, github: e.target.value })} placeholder="GitHub URL" />
              <input className="input" value={p.live || ''} 
                onChange={(e) => updateItem('projects', idx, { ...p, live: e.target.value })} placeholder="Live URL" />
              <input className="input" value={p.image || ''} 
                onChange={(e) => updateItem('projects', idx, { ...p, image: e.target.value })} placeholder="Image URL" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('projects', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('projects', { title: '', description: '', github: '', live: '', image: '' })}>Add Project</button>
        </div>

        {/* Education Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Education</h4>
          {(meta.education || []).map((e, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={e.institution || ''} 
                onChange={(e2) => updateItem('education', idx, { ...e, institution: e2.target.value })} placeholder="Institution" />
              <input className="input" value={e.degree || ''} 
                onChange={(e2) => updateItem('education', idx, { ...e, degree: e2.target.value })} placeholder="Degree" />
              <input className="input" value={e.year || ''} 
                onChange={(e2) => updateItem('education', idx, { ...e, year: e2.target.value })} placeholder="Year" />
              <textarea className="input" value={e.description || ''} 
                onChange={(e2) => updateItem('education', idx, { ...e, description: e2.target.value })} placeholder="Description" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('education', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('education', { institution: '', degree: '', year: '', description: '' })}>Add Education</button>
        </div>

        {/* Experience Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Experience</h4>
          {(meta.experience || []).map((e, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={e.company || ''} 
                onChange={(e2) => updateItem('experience', idx, { ...e, company: e2.target.value })} placeholder="Company" />
              <input className="input" value={e.role || ''} 
                onChange={(e2) => updateItem('experience', idx, { ...e, role: e2.target.value })} placeholder="Role" />
              <input className="input" value={e.duration || ''} 
                onChange={(e2) => updateItem('experience', idx, { ...e, duration: e2.target.value })} placeholder="Duration" />
              <textarea className="input" value={e.description || ''} 
                onChange={(e2) => updateItem('experience', idx, { ...e, description: e2.target.value })} placeholder="Description" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('experience', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}>Add Experience</button>
        </div>

        {/* Certifications Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Certifications</h4>
          {(meta.certifications || []).map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={c.name || ''} 
                onChange={(e2) => updateItem('certifications', idx, { ...c, name: e2.target.value })} placeholder="Certification Name" />
              <input className="input" value={c.issuer || ''} 
                onChange={(e2) => updateItem('certifications', idx, { ...c, issuer: e2.target.value })} placeholder="Issuer" />
              <input className="input" value={c.date || ''} 
                onChange={(e2) => updateItem('certifications', idx, { ...c, date: e2.target.value })} placeholder="Date" />
              <input className="input" value={c.credentialUrl || ''} 
                onChange={(e2) => updateItem('certifications', idx, { ...c, credentialUrl: e2.target.value })} placeholder="Credential URL" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('certifications', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('certifications', { name: '', issuer: '', date: '', credentialUrl: '' })}>Add Certification</button>
        </div>

        {/* Achievements Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Achievements</h4>
          {(meta.achievements || []).map((a, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={a.title || ''} 
                onChange={(e2) => updateItem('achievements', idx, { ...a, title: e2.target.value })} placeholder="Achievement Title" />
              <textarea className="input" value={a.description || ''} 
                onChange={(e2) => updateItem('achievements', idx, { ...a, description: e2.target.value })} placeholder="Description" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('achievements', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('achievements', { title: '', description: '' })}>Add Achievement</button>
        </div>

        {/* Testimonials Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Testimonials</h4>
          {(meta.testimonials || []).map((t, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={t.name || ''} 
                onChange={(e2) => updateItem('testimonials', idx, { ...t, name: e2.target.value })} placeholder="Client Name" />
              <input className="input" value={t.designation || ''} 
                onChange={(e2) => updateItem('testimonials', idx, { ...t, designation: e2.target.value })} placeholder="Designation" />
              <input className="input" value={t.company || ''} 
                onChange={(e2) => updateItem('testimonials', idx, { ...t, company: e2.target.value })} placeholder="Company" />
              <textarea className="input" value={t.review || ''} 
                onChange={(e2) => updateItem('testimonials', idx, { ...t, review: e2.target.value })} placeholder="Review" />
              <input className="input" value={t.photo || ''} 
                onChange={(e2) => updateItem('testimonials', idx, { ...t, photo: e2.target.value })} placeholder="Photo URL" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('testimonials', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('testimonials', { name: '', designation: '', company: '', review: '', photo: '' })}>Add Testimonial</button>
        </div>

        {/* Services Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Services</h4>
          {(meta.services || []).map((s, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={s.name || ''} 
                onChange={(e2) => updateItem('services', idx, { ...s, name: e2.target.value })} placeholder="Service Name" />
              <textarea className="input" value={s.description || ''} 
                onChange={(e2) => updateItem('services', idx, { ...s, description: e2.target.value })} placeholder="Description" />
              <input className="input" value={s.icon || ''} 
                onChange={(e2) => updateItem('services', idx, { ...s, icon: e2.target.value })} placeholder="Icon (emoji or URL)" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('services', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('services', { name: '', description: '', icon: '' })}>Add Service</button>
        </div>

        {/* Gallery Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Gallery</h4>
          {(meta.gallery || []).map((g, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={g.image || ''} 
                onChange={(e2) => updateItem('gallery', idx, { ...g, image: e2.target.value })} placeholder="Image URL" />
              <input className="input" value={g.title || ''} 
                onChange={(e2) => updateItem('gallery', idx, { ...g, title: e2.target.value })} placeholder="Title" />
              <textarea className="input" value={g.description || ''} 
                onChange={(e2) => updateItem('gallery', idx, { ...g, description: e2.target.value })} placeholder="Description" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('gallery', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('gallery', { image: '', title: '', description: '' })}>Add Gallery Item</button>
        </div>

        {/* Blogs Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Blogs</h4>
          {(meta.blogs || []).map((b, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={b.title || ''} 
                onChange={(e2) => updateItem('blogs', idx, { ...b, title: e2.target.value })} placeholder="Blog Title" />
              <textarea className="input" value={b.summary || ''} 
                onChange={(e2) => updateItem('blogs', idx, { ...b, summary: e2.target.value })} placeholder="Summary" />
              <input className="input" value={b.url || ''} 
                onChange={(e2) => updateItem('blogs', idx, { ...b, url: e2.target.value })} placeholder="URL" />
              <input className="input" value={b.date || ''} 
                onChange={(e2) => updateItem('blogs', idx, { ...b, date: e2.target.value })} placeholder="Date" />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('blogs', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('blogs', { title: '', summary: '', url: '', date: '' })}>Add Blog</button>
        </div>

        {/* Social Links Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Social Links</h4>
          <label className="label">GitHub</label>
          <input className="input" value={meta.socialLinks.github || ''} 
            onChange={(e) => setMeta(m => ({ ...m, socialLinks: { ...m.socialLinks, github: e.target.value } }))} placeholder="GitHub URL" />
          <label className="label">LinkedIn</label>
          <input className="input" value={meta.socialLinks.linkedin || ''} 
            onChange={(e) => setMeta(m => ({ ...m, socialLinks: { ...m.socialLinks, linkedin: e.target.value } }))} placeholder="LinkedIn URL" />
          <label className="label">Twitter/X</label>
          <input className="input" value={meta.socialLinks.twitter || ''} 
            onChange={(e) => setMeta(m => ({ ...m, socialLinks: { ...m.socialLinks, twitter: e.target.value } }))} placeholder="Twitter URL" />
          <label className="label">Instagram</label>
          <input className="input" value={meta.socialLinks.instagram || ''} 
            onChange={(e) => setMeta(m => ({ ...m, socialLinks: { ...m.socialLinks, instagram: e.target.value } }))} placeholder="Instagram URL" />
          <label className="label">YouTube</label>
          <input className="input" value={meta.socialLinks.youtube || ''} 
            onChange={(e) => setMeta(m => ({ ...m, socialLinks: { ...m.socialLinks, youtube: e.target.value } }))} placeholder="YouTube URL" />
          </div>

        {/* Contact Section */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Contact Information</h4>
          <label className="label">Email</label>
          <input className="input" value={meta.contact.email || ''} 
            onChange={(e) => setMeta(m => ({ ...m, contact: { ...m.contact, email: e.target.value } }))} placeholder="Email" />
          <label className="label">Phone</label>
          <input className="input" value={meta.contact.phone || ''} 
            onChange={(e) => setMeta(m => ({ ...m, contact: { ...m.contact, phone: e.target.value } }))} placeholder="Phone" />
          <label className="label">Location</label>
          <input className="input" value={meta.contact.location || ''} 
            onChange={(e) => setMeta(m => ({ ...m, contact: { ...m.contact, location: e.target.value } }))} placeholder="Location" />
          <label className="label">linkedin</label>
          <input className="input" value={meta.contact.linkedin || ''} 
            onChange={(e) => setMeta(m => ({ ...m, contact: { ...m.contact, linkedin: e.target.value } }))} placeholder="LinkedIn" />
        </div>

        {/* Custom Sections */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Custom Sections</h4>
          {(meta.custom || []).map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <input className="input" value={c.title || ''} 
                onChange={(e2) => updateItem('custom', idx, { ...c, title: e2.target.value })} placeholder="Section Title" />
              <textarea className="input" value={c.content || ''} 
                onChange={(e2) => updateItem('custom', idx, { ...c, content: e2.target.value })} placeholder="Rich Text Content" rows={3} />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem('custom', idx)}>Remove</button>
            </div>
          ))}
          <button className="btn" onClick={() => addItem('custom', { title: '', content: '' })}>Add Custom Section</button>
        </div>

      </div>

      <div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Live Preview</h3>
          <div style={{ padding: 12, border: '1px solid #e5e7eb' }}>
            <PortfolioPreview meta={meta} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PortfolioPreview({ meta }) {
  return (
    <div>
      {/* Personal Info Preview */}
      <h1>{meta.personal.name || 'Your Name'}</h1>
      <div style={{ color: '#6b7280' }}>{meta.personal.role || 'Your Role'}</div>
      <p>{meta.personal.tagline || 'Your tagline here'}</p>
      
      <hr style={{ margin: '16px 0' }} />

      {/* About Preview */}
      {meta.about.description && (
        <>
          <h3>About</h3>
          <p>{meta.about.description}</p>
        </>
      )}

      {/* Skills Preview */}
      {(meta.skills || []).length > 0 && (
        <>
          <h3>Skills</h3>
          <ul>
            {meta.skills.map((s, idx) => (
              <li key={idx}>{s.name}{s.level && ` — ${s.level}`}</li>
            ))}
          </ul>
        </>
      )}

      {/* Projects Preview */}
      {(meta.projects || []).length > 0 && (
        <>
          <h3>Projects</h3>
          {meta.projects.map((p, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <strong>{p.title}</strong>
              <p>{p.description}</p>
              {p.github && <div>GitHub: {p.github}</div>}
              {p.live && <div>Live: {p.live}</div>}
            </div>
          ))}
        </>
      )}

      {/* Education Preview */}
      {(meta.education || []).length > 0 && (
        <>
          <h3>Education</h3>
          {meta.education.map((e, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{e.institution}</strong> — {e.degree} ({e.year})
              {e.description && <p>{e.description}</p>}
            </div>
          ))}
        </>
      )}

      {/* Experience Preview */}
      {(meta.experience || []).length > 0 && (
        <>
          <h3>Experience</h3>
          {meta.experience.map((e, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{e.company}</strong> — {e.role} ({e.duration})
              {e.description && <p>{e.description}</p>}
            </div>
          ))}
        </>
      )}

      {/* Certifications Preview */}
      {(meta.certifications || []).length > 0 && (
        <>
          <h3>Certifications</h3>
          {meta.certifications.map((c, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              {c.name} — {c.issuer} ({c.date})
              {c.credentialUrl && <div>Credential: {c.credentialUrl}</div>}
            </div>
          ))}
        </>
      )}

      {/* Achievements Preview */}
      {(meta.achievements || []).length > 0 && (
        <>
          <h3>Achievements</h3>
          {meta.achievements.map((a, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{a.title}</strong>
              {a.description && <p>{a.description}</p>}
            </div>
          ))}
        </>
      )}

      {/* Testimonials Preview */}
      {(meta.testimonials || []).length > 0 && (
        <>
          <h3>Testimonials</h3>
          {meta.testimonials.map((t, idx) => (
            <div key={idx} style={{ marginBottom: 12, padding: 8, background: '#f9fafb', borderRadius: 4 }}>
              <p>"{t.review}"</p>
              <div style={{ fontWeight: 600 }}>— {t.name}{t.designation && `, ${t.designation}`}{t.company && ` at ${t.company}`}</div>
            </div>
          ))}
        </>
      )}

      {/* Services Preview */}
      {(meta.services || []).length > 0 && (
        <>
          <h3>Services</h3>
          {meta.services.map((s, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              {s.icon && <span>{s.icon} </span>}
              <strong>{s.name}</strong>
              <p>{s.description}</p>
            </div>
          ))}
        </>
      )}

      {/* Gallery Preview */}
      {(meta.gallery || []).length > 0 && (
        <>
          <h3>Gallery</h3>
          {meta.gallery.map((g, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              {g.image && <div style={{ width: 100, height: 100, background: '#eee', marginBottom: 4 }}></div>}
              <strong>{g.title}</strong>
              <p>{g.description}</p>
            </div>
          ))}
        </>
      )}

      {/* Blogs Preview */}
      {(meta.blogs || []).length > 0 && (
        <>
          <h3>Blog Posts</h3>
          {meta.blogs.map((b, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{b.title}</strong>
              {b.date && <div style={{ fontSize: 12, color: '#666' }}>{b.date}</div>}
              <p>{b.summary}</p>
              {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer">Read more</a>}
            </div>
          ))}
        </>
      )}

      {/* Social Links Preview */}
      {Object.values(meta.socialLinks || {}).some(v => v) && (
        <>
          <h3>Connect With Me</h3>
          <div>
            {meta.socialLinks.github && <div>GitHub: {meta.socialLinks.github}</div>}
            {meta.socialLinks.linkedin && <div>LinkedIn: {meta.socialLinks.linkedin}</div>}
            {meta.socialLinks.twitter && <div>Twitter: {meta.socialLinks.twitter}</div>}
            {meta.socialLinks.instagram && <div>Instagram: {meta.socialLinks.instagram}</div>}
            {meta.socialLinks.youtube && <div>YouTube: {meta.socialLinks.youtube}</div>}
            {meta.socialLinks.website && <div>Website: {meta.socialLinks.website}</div>}
          </div>
        </>
      )}

      {/* Contact Preview */}
      {Object.values(meta.contact || {}).some(v => v) && (
        <>
          <h3>Contact</h3>
          <div>
            {meta.contact.email && <div>Email: {meta.contact.email}</div>}
            {meta.contact.phone && <div>Phone: {meta.contact.phone}</div>}
            {meta.contact.location && <div>Location: {meta.contact.location}</div>}
            {meta.contact.website && <div>Website: {meta.contact.website}</div>}
          </div>
        </>
      )}

      {/* Custom Sections Preview */}
      {(meta.custom || []).length > 0 && (
        <>
          <hr style={{ margin: '16px 0' }} />
          {meta.custom.map((c, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <h3>{c.title}</h3>
              <div>{c.content}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}