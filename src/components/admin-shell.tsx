import Link from 'next/link';
import {logout} from '@/app/admin/actions';
import {modules} from '@/lib/modules';
import type {Role} from '@/lib/domain';
export function AdminShell({children,module,role,email}:{children:React.ReactNode;module:string;role:Role;email?:string}){return <div className="admin-layout"><aside className="admin-sidebar"><Link className="footer-logo" href="/admin">TESC</Link><p>內容管理 · {role==='super_admin'?'主管理員':'編輯'}<br/>{email}</p><nav aria-label="管理選單">{modules.filter(m=>role==='super_admin'||!['settings','roles','users'].includes(m.key)).map(m=><Link key={m.key} href={m.key==='dashboard'?'/admin':`/admin/${m.key}`} aria-current={module===m.key?'page':undefined}>{m.label}</Link>)}</nav><hr/><Link href="/zh-Hant" target="_blank">公開網站 ↗</Link><form action={logout}><button>登出</button></form></aside><div className="admin-content">{children}</div></div>}
