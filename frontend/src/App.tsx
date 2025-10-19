import React, { useState } from 'react'
import Chat from './pages/Chat'
import Analytics from './pages/Analytics'
export default function App(){
  const [tab, setTab] = useState('chat')
  return (<div style={{fontFamily:'Inter,system-ui,sans-serif',maxWidth:960,margin:'0 auto',padding:16}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <h2>IKARUS Recommender</h2>
      <nav style={{display:'flex',gap:12}}>
        <button onClick={()=>setTab('chat')} style={{padding:'8px 12px'}}>Chat</button>
        <button onClick={()=>setTab('analytics')} style={{padding:'8px 12px'}}>Analytics</button>
      </nav>
    </header>
    {tab==='chat'?<Chat/>:<Analytics/>}
  </div>)
}
