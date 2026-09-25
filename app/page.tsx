import { getContent } from '@/lib/content';
import Nav from '@/components/Nav';
import Window from '@/components/Window';
import { Github, Youtube, MessageCircle, Instagram, Twitter } from 'lucide-react';

export default async function Home(){
 const c=await getContent();
 const iconMap:any={GitHub:Github,YouTube:Youtube,Discord:MessageCircle,Instagram:Instagram,X:Twitter};
 return <main className="site" style={{'--bg':c.theme.bg,'--panel':c.theme.panel,'--panel-2':c.theme.panel2,'--bar':c.theme.bar,'--ink':c.theme.ink,'--line':c.theme.line,'--shadow':c.theme.shadow,'--pink':c.theme.pink,'--cyan':c.theme.cyan,'--purple':c.theme.purple} as React.CSSProperties}>
  <Nav content={c}/>
  <section className="hero"><div className="hero-inner"><div className="kicker">{c.site.kicker}</div><h1>{c.site.heroTitle}</h1><p>{c.site.heroText}</p><div className="socials">{c.connections.slice(0,5).map(x=>{const I=iconMap[x.name]||MessageCircle; return <a className="pixel-btn" key={x.name} href={x.url} target="_blank" rel="noreferrer"><I size={18}/></a>})}</div><div style={{marginTop:32}}><a className="pixel-btn accent" href="/dashboard">{c.site.dashboardLabel}</a></div></div></section>

  <section className="section" id="about"><div className="container"><div className="section-head"><h2 className="section-title">{c.about.title}</h2><p className="section-sub">{c.about.subtitle}</p></div>
   <Window title="PROFILE"><div className="profile-grid"><div>{c.profile.image?<img className="avatar" src={c.profile.image} alt={c.profile.name}/>:<div className="avatar" style={{display:'grid',placeItems:'center',fontFamily:'Press Start 2P',fontSize:12}}>LY</div>}</div><div className="meta"><p><span className="label">Name:</span> {c.profile.name}</p><p><span className="label">Age:</span> {c.profile.age}</p><p><span className="label">Place:</span> {c.profile.place}</p><p><span className="label">Class / Grade:</span> {c.profile.classGrade}</p><p><span className="label">Role:</span> {c.profile.role}</p></div><div><h3 className="label">GOALS</h3><ul className="list">{c.profile.goals.map(x=><li key={x}>{x}</li>)}</ul><h3 className="label" style={{marginTop:25}}>WHY</h3><ul className="list">{c.profile.why.map(x=><li key={x}>{x}</li>)}</ul></div></div></Window>
   <div className="two-col"><Window title="ABOUT"><div className="prose">{c.about.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div></Window><Window title="STATS"><div className="stats">{c.about.stats.map(s=><div className="stat" key={s.label}><span>{s.label}</span><strong>{s.value}</strong></div>)}</div></Window></div>
  </div></section>

  <section className="section" id="hobbies"><div className="container"><Window title="HOBBIES"><div className="item-grid">{c.hobbies.map(x=><div className="item" key={x}>{x}</div>)}</div></Window></div></section>
  <section className="section" id="habits"><div className="container"><Window title="HABITS"><div className="item-grid">{c.habits.map(x=><div className="item cyan" key={x}>{x}</div>)}</div></Window></div></section>

  <section className="section" id="projects"><div className="container"><div className="section-head"><h2 className="section-title">PROJECTS</h2><p className="section-sub">A collection of things I’ve been building, designing and tinkering with.</p></div><div className="projects">{c.projects.map((p,i)=><ProjectCard key={p.id} p={p} index={i}/>)}</div></div></section>
  <section className="section"><div className="container"><div className="section-head"><h2 className="section-title">MINECRAFT / DISCORD / WEB</h2><p className="section-sub">Services and systems I enjoy building.</p></div><div className="projects">{c.plugins.map((p,i)=><ProjectCard key={p.id} p={p} index={i}/>)}</div></div></section>

  <section className="section" id="staffing"><div className="container"><Window title="STAFFING"><div className="item-grid">{c.staffing.map(x=><div className="item" key={x}>{x}</div>)}</div></Window></div></section>
  
  <section className="section" id="connections"><div className="container"><Window title="CONNECTIONS"><div className="connections">{c.connections.map(x=>{const I=iconMap[x.name]||MessageCircle; return <div className="row" key={x.name}><span className="connection-icon"><I size={19}/></span><strong>{x.name}</strong><span>{x.handle}</span><a className="pixel-btn small-btn" href={x.url} target="_blank" rel="noreferrer">VISIT →</a></div>})}</div></Window></div></section>
  <footer className="footer">{c.site.footer}</footer>
 </main>
}
function ProjectCard({p,index}:{p:any;index:number}){return <article className="window project"><div className="window-bar"><span>REPO_{String(index+1).padStart(2,'0')}</span><span className="window-dots"><i/><i/><i/></span></div><div className="window-body"><h3>{p.name}</h3><p>{p.description}</p><div className="tags">{p.tags.map((t:string,i:number)=><span className={`tag ${i%2?'purple':''}`} key={t}>{t}</span>)}</div><div className="project-actions"><a className="pixel-btn small-btn accent" href={p.url} target="_blank" rel="noreferrer">{p.private?'PRIVATE 🔒':'VIEW →'}</a></div></div></article>}
