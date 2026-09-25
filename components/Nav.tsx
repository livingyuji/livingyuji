'use client';
import { useState } from 'react';
import { Content } from '@/lib/default-content';
export default function Nav({content}:{content:Content}){
 const [open,setOpen]=useState(false);
 return <nav className="nav"><a className="brand" href="/">{content.site.brand}</a><button className="menu" onClick={()=>setOpen(!open)}>MENU</button><div className={`navlinks ${open?'open':''}`}>{content.nav.map(n=><a key={n.href} href={n.href} onClick={()=>setOpen(false)}>{n.label}</a>)}</div></nav>
}
