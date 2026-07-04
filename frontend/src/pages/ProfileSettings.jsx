import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'

export default function ProfileSettings(){
  const token = localStorage.getItem('token')
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    loadUser()
  },[])

  const loadUser = async ()=>{
    try{
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      setUsername(res.data.username)
      setEmail(res.data.email)
      setProfileImage(res.data.profileImage)
    }catch(e){ console.error(e) }
  }

  const handleImageUpload = async (e)=>{
    const file = e.target.files[0]
    if(!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try{
      const res = await axios.post(`${API_BASE_URL}/api/upload/profile-image`, formData, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      })
      setProfileImage(res.data.filePath)
      alert('Profile image uploaded successfully!')
    }catch(e){
      alert('Error uploading image: ' + (e.response?.data?.error || 'Upload failed'))
    }
    setUploading(false)
  }

  const updateProfile = async ()=>{
    setSaving(true)
    try{
      await axios.put(`${API_BASE_URL}/api/auth/me`, { username, email }, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      alert('Profile updated successfully!')
      loadUser()
    }catch(e){
      alert('Error updating profile: ' + (e.response?.data?.error || 'Update failed'))
    }
    setSaving(false)
  }

  if(!user) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="brand">Profile Settings</div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">Home</a>
          <a href="/dashboard/portfolios">Portfolios</a>
          <a href="/dashboard/resumes">Resumes</a>
          <a href="#" onClick={()=>{localStorage.removeItem('token'); location.href='/login'}}>Logout</a>
        </div>
      </header>

      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Profile Information</h3>
        
        <div style={{display:'flex',gap:16,alignItems:'flex-start',marginTop:12}}>
          <div style={{flex:1}}>
            <label className="label">Username</label>
            <input 
              className="input" 
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
            
            <label className="label" style={{marginTop:8}}>Email</label>
            <input 
              className="input" 
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <div style={{marginTop:16}}>
              <button className="btn" onClick={updateProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div style={{textAlign:'center'}}>
            <div style={{width:120,height:120,borderRadius:'50%',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',marginBottom:8}}>
              {profileImage ? (
                <img src={`${API_BASE_URL}${profileImage}`} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              ) : (
                <div style={{fontSize:48,color:'#9ca3af'}}>👤</div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{display:'none'}}
              id="profile-image-input"
            />
            <label htmlFor="profile-image-input" className="btn btn-sm" style={{cursor:'pointer'}}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
          </div>
        </div>
      </div>

      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Account Info</h3>
        <div style={{marginTop:8,color:'#6b7280'}}>
          <div><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
          <div><strong>User ID:</strong> {user.id}</div>
        </div>
      </div>
    </div>
  )
}
