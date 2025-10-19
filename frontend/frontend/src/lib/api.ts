const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
export async function recommend(body){
  const res = await fetch(`${BASE}/api/recommend`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  return await res.json()
}
export async function analytics(){
  const res = await fetch(`${BASE}/api/analytics`)
  return await res.json()
}
