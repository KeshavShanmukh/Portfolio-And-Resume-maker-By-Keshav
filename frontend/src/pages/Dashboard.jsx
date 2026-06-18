import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    axios.get('http://localhost:4000/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(err => setData({ error: err.response?.data?.error || 'Error' }))
  },[])

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Dashboard</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
