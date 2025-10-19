import React from 'react'
export default function ProductCard({item}){
  return (<div style={{border:'1px solid #ddd',borderRadius:12,padding:12}}>
    {item.image ? <img src={item.image} style={{width:'100%',height:200,objectFit:'cover',borderRadius:8}}/> : null}
    <h3 style={{margin:'8px 0'}}>{item.title}</h3>
    <div style={{color:'#555'}}>{item.brand} • {item.category} • ₹{item.price ?? 'NA'}</div>
    <p style={{marginTop:8}}>{item.blurb}</p>
  </div>)
}
