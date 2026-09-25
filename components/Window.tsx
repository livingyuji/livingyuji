import { ReactNode } from 'react';
export default function Window({title,children,className=''}:{title:string;children:ReactNode;className?:string}){
 return <section className={`window ${className}`}><div className="window-bar"><span>{title}</span><span className="window-dots"><i/><i/><i/></span></div><div className="window-body">{children}</div></section>
}
