import React, { useEffect, useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import axios from 'axios'
import { API_BASE_URL } from '../../api/config'
import SplitPane from '../../components/SplitPane'

export default function CodeBuilder({ portfolio }){
  const token = localStorage.getItem('token')
  const [html, setHtml] = useState(portfolio.codeHtml||'')
  const [css, setCss] = useState(portfolio.codeCss||'')
  const [js, setJs] = useState(portfolio.codeJs||'')
  const iframeRef = useRef()

  useEffect(()=>{
    setHtml(portfolio.codeHtml||'')
    setCss(portfolio.codeCss||'')
    setJs(portfolio.codeJs||'')
  },[portfolio.id])

  useEffect(()=>{
    const src = `data:text/html,${encodeURIComponent(`<style>${css}</style>${html}<script>${js}<\/script>`)}`
    if(iframeRef.current) iframeRef.current.src = src
  },[html,css,js])

  const save = async ()=>{
    try{
      await axios.put(`${API_BASE_URL}/api/portfolio/${portfolio.id}`, { codeHtml: html, codeCss: css, codeJs: js }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Saved')
    }catch(e){ console.error(e); alert('Save failed') }
  }

  const leftPanel = (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>Live Preview</h3>
        <iframe title="preview" ref={iframeRef} style={{width:'100%',height:500,border:'1px solid #e5e7eb'}} />
      </div>
    </div>
  )

  const rightPanel = (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>Code Editor</h3>
        <div style={{height:200}}>
          <label className="label">HTML</label>
          <Editor height="120px" defaultLanguage="html" value={html} onChange={(v)=>setHtml(v)} />
        </div>
        <div style={{height:200,marginTop:8}}>
          <label className="label">CSS</label>
          <Editor height="120px" defaultLanguage="css" value={css} onChange={(v)=>setCss(v)} />
        </div>
        <div style={{height:200,marginTop:8}}>
          <label className="label">JavaScript</label>
          <Editor height="120px" defaultLanguage="javascript" value={js} onChange={(v)=>setJs(v)} />
        </div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container">
      <SplitPane left={leftPanel} right={rightPanel} initialLeftWidth={80} />
    </div>
  )
}
