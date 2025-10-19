import React, { useEffect, useState } from 'react'
import { analytics } from '../lib/api'
export default function Analytics(){
  const [data,setData]=useState(null)
  useEffect(()=>{(async()=>setData(await analytics()))()},[])
  if(!data) return <div>Loading analytics…</div>
  return (<div style={{display:'grid',gap:12}}>
    <div>Total products: <b>{data.total_products}</b></div>
    <div><h4>Top Brands</h4><ul>{data.brand_counts.map(b=>(<li key={b[0]}>{b[0]} — {b[1]}</li>))}</ul></div>
    <div><h4>Top Categories</h4><ul>{data.category_counts.map(c=>(<li key={c[0]}>{c[0]} — {c[1]}</li>))}</ul></div>
    <div><h4>Price Summary</h4><div>Min: {data.price_summary.min} | Avg: {Math.round((data.price_summary.avg||0)*100)/100} | Max: {data.price_summary.max}</div></div>
  </div>)
}
