import {redirect,notFound} from 'next/navigation';
import {identity} from '@/lib/auth';
import {canManage} from '@/lib/domain';
import {modules} from '@/lib/modules';
import {AdminShell} from '@/components/admin-shell';
import {AdminApp} from '@/components/admin-app';
import {configured} from '@/lib/supabase';
import {localIdentity} from '@/lib/local-auth';
import {LocalAdmin,type LocalAdminModule} from '@/components/local-admin';
import {adminLocale} from '@/lib/admin-i18n';
export const metadata={title:'TESC 內容管理',robots:{index:false,follow:false}};
export default async function Module({params,searchParams}:{params:Promise<{module:string}>;searchParams:Promise<{lang?:string;message?:string}>}){const {module}=await params;if(!configured()){if(!(['prayer','site','account'] as string[]).includes(module))notFound();const actor=await localIdentity();if(!actor||actor.role!=='super_admin')redirect('/admin/login');const query=await searchParams;return <LocalAdmin module={module as LocalAdminModule} actor={actor} locale={adminLocale(query.lang)} message={query.message}/>;}const m=modules.find(m=>m.key===module);if(!m)notFound();const actor=await identity();if(!actor||actor.role==='member')redirect('/admin/login');return <AdminShell module={module} role={actor.role} email={actor.email}>{canManage(actor.role,module)?<AdminApp key={module} module={module} role={actor.role}/>:<div className="admin-panel"><h1>沒有權限</h1><p>此頁只供主管理員使用。</p></div>}</AdminShell>}
