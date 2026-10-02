import Link from 'next/link';
import {identity} from '@/lib/auth';
import {configured} from '@/lib/supabase';
import {memberLogin,memberLogout} from './actions';
import {localIdentity} from '@/lib/local-auth';

export const metadata={title:'會員登入 | TESC',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
 const actor=configured()?await identity():await localIdentity(),{error,message}=await searchParams;
 return <main className="admin-login"><Link className="brand-word" href="/zh-Hant">TESC</Link><h1>會員登入</h1><p className="muted">歡迎登入神學教育服務團會員帳戶。</p>
 {actor?<><p>已登入：{actor.display_name||actor.email}</p><form action={memberLogout}><button className="button">登出</button></form></>:<>
 {message==='verified'&&<p role="status" className="notice">電郵驗證成功，現在可以登入。</p>}
 {error&&<p role="alert" className="error-text">{error==='forbidden'?'此帳戶未獲授權。':'電郵或密碼不正確；如剛註冊，請先驗證電郵。'}</p>}
 <form action={memberLogin}><label className="field">電郵<input type="email" name="email" required autoComplete="username"/></label><label className="field">密碼<input type="password" name="password" required autoComplete="current-password"/></label><button className="button">登入</button></form></>}
 <nav className="auth-links" aria-label="帳戶導覽"><Link className="text-link" href="/zh-Hant">← 返回網站</Link><Link className="text-link" href="/signup">建立會員帳戶 →</Link></nav></main>;
}
