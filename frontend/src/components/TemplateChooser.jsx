import { useEffect, useState } from 'react'
import { loadPortfolioTemplate, loadResumeTemplate, getAllPortfolioTemplates, getAllResumeTemplates } from '../utils/templateLoader'

export default function TemplateChooser({ type, onApply, onGalleryLink }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      setLoading(true)
      try {
        const list = type === 'portfolio' ? getAllPortfolioTemplates() : getAllResumeTemplates()
        const loaded = list.map((template) => ({
          ...template,
          ...(type === 'portfolio' ? loadPortfolioTemplate(template.id) : loadResumeTemplate(template.id))
        }))
        setTemplates(loaded)
        setSelectedTemplate(loaded[0] || null)
      } catch (error) {
        console.error('Unable to load templates', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [type])

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selected = selectedTemplate && templates.find((t) => t.id === selectedTemplate.id)

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>
            {type === 'portfolio' ? 'Choose a Portfolio Template' : 'Choose a Resume Template'}
          </h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Start from a ready-made structure and get editing faster.
          </p>
        </div>
        {onGalleryLink && (
          <button className="btn btn-secondary" onClick={onGalleryLink}>
            Browse full gallery
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        <input
          className="input"
          style={{ flex: '1 1 260px' }}
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => selected && onApply(selected)}
          disabled={!selected || loading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {loading ? 'Loading...' : 'Create with selected template'}
        </button>
      </div>

      <div className="template-grid" style={{ marginTop: 16 }}>
        {loading && <p>Loading templates...</p>}
        {!loading && filteredTemplates.length === 0 && <p style={{ color: '#6b7280' }}>No templates match your search.</p>}
        {!loading && filteredTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template-card"
            style={{
              borderColor: selected?.id === template.id ? '#3b82f6' : '#e5e7eb',
              background: selected?.id === template.id ? '#eef6ff' : 'white'
            }}
            onClick={() => setSelectedTemplate(template)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{template.name}</div>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{template.layout}</span>
            </div>
            <div style={{ marginBottom: 10, color: '#6b7280', fontSize: 13 }}>{template.description}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ width: 32, height: 32, background: template.theme.primaryColor, borderRadius: 6 }} />
              <div style={{ width: 32, height: 32, background: template.theme.secondaryColor, borderRadius: 6 }} />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, background: '#f8fafc' }}>
          <h4 style={{ marginTop: 0 }}>{selected.name} Preview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Theme</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, background: selected.theme.primaryColor, borderRadius: 4 }} />
                  <span>Primary</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, background: selected.theme.secondaryColor, borderRadius: 4 }} />
                  <span>Secondary</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Sections</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {selected.sections.slice(0, 6).map((section, idx) => (
                  <div key={idx} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white' }}>
                    <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{section.type}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Position {section.position}</div>
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
