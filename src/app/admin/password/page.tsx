import {identity} from '@/lib/auth';
import {redirect} from 'next/navigation';
import {updatePassword} from '../actions';
export default async function Password({searchParams}:{searchParams:Promise<{error?:string}>}){if(!await identity())redirect('/admin/login');const p=await searchParams;return <main className="admin-login"><h1>設定新密碼</h1>{p.error&&<p role="alert">密碼至少需要 12 個字元，並且兩次輸入相同。</p>}<form action={updatePassword}><label className="field">新密碼<input name="password" type="password" minLength={12} required autoComplete="new-password"/></label><label className="field">再次輸入<input name="confirm" type="password" minLength={12} required autoComplete="new-password"/></label><button className="button">儲存密碼</button></form></main>}
