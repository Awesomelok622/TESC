import {redirect,notFound} from 'next/navigation';
import {identity} from '@/lib/auth';
import {canManage} from '@/lib/domain';
import {modules} from '@/lib/modules';
import {AdminShell} from '@/components/admin-shell';
import {AdminApp} from '@/components/admin-app';
export const metadata={title:'TESC 內容管理',robots:{index:false,follow:false}};
export default async function Module({params}:{params:Promise<{module:string}>}){const {module}=await params;const m=modules.find(m=>m.key===module);if(!m)notFound();const actor=await identity();if(!actor)redirect('/admin/login');return <AdminShell module={module} role={actor.role} email={actor.email}>{canManage(actor.role,module)?<AdminApp key={module} module={module} role={actor.role}/>:<div className="admin-panel"><h1>沒有權限</h1><p>此頁只供主管理員使用。</p></div>}</AdminShell>}
