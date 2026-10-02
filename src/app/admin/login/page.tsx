import {login,resetPassword} from '../actions';
import Link from 'next/link';
import {configured} from '@/lib/supabase';
import {adminLocale,adminText} from '@/lib/admin-i18n';

export const metadata={title:'TESC 管理員登入',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string;lang?:string}>}){
 const query=await searchParams,locale=adminLocale(query.lang),t=adminText(locale);
 const error=query.error==='forbidden'?t.loginForbidden:query.error==='config'?t.loginConfig:query.error?t.loginInvalid:'';
 return <main className="admin-login"><div className="admin-login-heading"><Link className="brand-word" href={`/${locale}`}>TESC</Link><nav className="local-admin-languages" aria-label="Language / 語言"><Link href="/admin/login?lang=zh-Hant" aria-current={locale==='zh-Hant'?'page':undefined}>繁</Link><Link href="/admin/login?lang=zh-Hans" aria-current={locale==='zh-Hans'?'page':undefined}>简</Link><Link href="/admin/login?lang=en" aria-current={locale==='en'?'page':undefined}>EN</Link></nav></div><h1>{t.loginTitle}</h1><p className="muted">{t.loginIntro}</p>{error&&<p role="alert" className="error-text">{error}</p>}{query.message==='reset'&&<p role="status" className="notice">{t.resetSent}</p>}<form action={login}><input type="hidden" name="lang" value={locale}/><label className="field">{t.loginEmail}<input type="email" name="email" required autoComplete="username"/></label><label className="field">{t.loginPassword}<input type="password" name="password" required minLength={8} autoComplete="current-password"/></label><button className="button">{t.signIn}</button></form>{configured()&&<details style={{marginTop:25}}><summary>{t.forgotPassword}</summary><form action={resetPassword}><input type="hidden" name="lang" value={locale}/><label className="field">{t.loginEmail}<input type="email" name="email" required/></label><button className="button secondary">{t.sendReset}</button></form></details>}<Link className="text-link" href={`/${locale}`}>← {t.backWebsite}</Link></main>;
}
