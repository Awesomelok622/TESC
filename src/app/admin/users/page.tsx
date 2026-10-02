import {redirect} from 'next/navigation';
import {identity} from '@/lib/auth';
import {AdminShell} from '@/components/admin-shell';
import {UsersAdmin} from '@/components/users-admin';
import {configured} from '@/lib/supabase';
import {localIdentity} from '@/lib/local-auth';
import {LocalAdmin} from '@/components/local-admin';
import {adminLocale} from '@/lib/admin-i18n';
export default async function Users({searchParams}:{searchParams:Promise<{lang?:string}>}){if(!configured()){const actor=await localIdentity();if(!actor||actor.role!=='super_admin')redirect('/admin/login');return <LocalAdmin module="users" actor={actor} locale={adminLocale((await searchParams).lang)}/>;}const actor=await identity();if(!actor)redirect('/admin/login');if(actor.role!=='super_admin')redirect('/admin');return <AdminShell module="users" role={actor.role} email={actor.email}><UsersAdmin/></AdminShell>}
