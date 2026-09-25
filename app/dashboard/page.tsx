import { getContent } from '@/lib/content';
import Window from '@/components/Window';
import { Github, Youtube, MessageCircle, Instagram, Twitter } from 'lucide-react';

const iconMap:any={GitHub:Github,YouTube:Youtube,Discord:MessageCircle,Instagram:Instagram,X:Twitter};

export default async function Dashboard(){
 const c=await getContent();
 return <main className="site dashboard-page" style={{'--bg':c.theme.bg,'--panel':c.theme.panel,'--panel-2':c.theme.panel2,'--bar':c.theme.bar,'--ink':c.theme.ink,'--line':c.theme.line,'--shadow':c.theme.shadow,'--pink':c.theme.pink,'--cyan':c.theme.cyan,'--purple':c.theme.purple} as React.CSSProperties}>
  <header className="nav"><a className="brand" href="/">{c.site.brand}</a><a className="pixel-btn small-btn" href="/">← BACK HOME</a></header>
  <section className="section"><div className="container">
   <div className="section-head"><div className="kicker">PERSONAL DASHBOARD</div><h1 className="section-title">{c.site.brand}</h1><p className="section-sub">A deeper look at my profile, interests, projects and capabilities.</p></div>
   <Window title="PROFILE"><div className="profile-grid"><div>{c.profile.image?<img className="avatar" src={c.profile.image} alt={c.profile.name}/>:<div className="avatar" style={{display:'grid',placeItems:'center',fontFamily:'Press Start 2P'}}>LY</div>}</div><div className="meta"><p><span className="label">Name:</span> {c.profile.name}</p><p><span className="label">Age:</span> {c.profile.age}</p><p><span className="label">Place:</span> {c.profile.place}</p><p><span className="label">Class:</span> {c.profile.classGrade}</p><p><span className="label">Role:</span> {c.profile.role}</p></div><div><h3 className="label">GOALS</h3><ul className="list">{c.profile.goals.map(x=><li key={x}>{x}</li>)}</ul></div></div></Window>
   <div className="two-col"><Window title="ABOUT"><div className="prose">{c.about.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div></Window><Window title="STATS"><div className="stats">{c.about.stats.map(s=><div className="stat" key={s.label}><span>{s.label}</span><strong>{s.value}</strong></div>)}</div></Window></div>
   <Window title="PROJECTS"><div className="projects">{c.projects.map(p=><div className="item" key={p.id}><strong>{p.name}</strong><p>{p.description}</p></div>)}</div></Window>
   <Window title="MINECRAFT / PLUGIN / DISCORD / WEB"><div className="projects">{c.plugins.map((p,i)=><div className="item" key={p.id}><strong>{p.name}</strong><p>{p.description}</p><div className="tags">{p.tags.map((t:string)=><span className="tag" key={t}>{t}</span>)}</div></div>)}</div></Window>
   <Window title="STAFFING"><div className="item-grid">{c.staffing.map(x=><div className="item" key={x}>{x}</div>)}</div></Window>
   <Window title="CARDS"><ol className="number-list">{c.cards.map((x,i)=><li key={x}><span className="number">{i+1}</span><span>{x}</span></li>)}</ol><p className="cards-closing">{c.cardsClosing}</p></Window>
   <Window title="CONNECTIONS"><div className="connections">{c.connections.map(x=>{const I=iconMap[x.name]||MessageCircle; return <div className="row" key={x.name}><span className="connection-icon"><I size={19}/></span><strong>{x.name}</strong><span>{x.handle}</span><a className="pixel-btn small-btn" href={x.url} target="_blank" rel="noreferrer">VISIT →</a></div>})}</div></Window>
  </div></section>
  <footer className="footer">{c.site.footer}</footer>
 </main>
}
