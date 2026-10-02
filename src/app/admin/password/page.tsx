import {identity} from '@/lib/auth';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {updatePassword} from '../actions';
import {configured} from '@/lib/supabase';
import {localIdentity} from '@/lib/local-auth';
import {adminLocale,adminText} from '@/lib/admin-i18n';

export default async function Password({searchParams}:{searchParams:Promise<{error?:string;lang?:string}>}){
 const actor=configured()?await identity():await localIdentity();
 if(!actor)redirect('/admin/login');
 const query=await searchParams,locale=adminLocale(query.lang),t=adminText(locale);
 const back=actor.role==='member'?`/${locale}/prayer`:configured()?'/admin':`/admin/account?lang=${locale}`;
 return <main className="admin-login"><div className="admin-login-heading"><Link className="brand-word" href={back}>TESC</Link><nav className="local-admin-languages" aria-label="Language / 語言"><Link href="/admin/password?lang=zh-Hant" aria-current={locale==='zh-Hant'?'page':undefined}>繁</Link><Link href="/admin/password?lang=zh-Hans" aria-current={locale==='zh-Hans'?'page':undefined}>简</Link><Link href="/admin/password?lang=en" aria-current={locale==='en'?'page':undefined}>EN</Link></nav></div><h1>{t.changePassword}</h1>{query.error&&<p role="alert" className="error-text">{t.passwordError}</p>}<form action={updatePassword}><input type="hidden" name="lang" value={locale}/><label className="field">{t.newPassword}<input name="password" type="password" minLength={12} required autoComplete="new-password"/></label><label className="field">{t.confirmPassword}<input name="confirm" type="password" minLength={12} required autoComplete="new-password"/></label><button className="button">{t.savePassword}</button></form><Link className="text-link" href={back}>← {t.backAdmin}</Link></main>;
}
