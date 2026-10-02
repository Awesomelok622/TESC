import Link from 'next/link';
import {resendVerification} from '../login/actions';
import {MemberSignupForm} from '@/components/member-signup-form';
import {configured} from '@/lib/supabase';
import {verificationMailReady} from '@/lib/verification-mail';

export const metadata={title:'會員註冊 | TESC',robots:{index:false,follow:false}};
const errors:Record<string,string>={exists:'此電郵已註冊。如尚未驗證，請使用下方表格重寄驗證電郵。',invalid:'請檢查姓名、電郵及密碼。',email:'請輸入有效的電郵地址。',password:'密碼須至少 12 個字元，並包含大寫、小寫英文字母、數字和符號。',confirm:'兩次輸入的密碼不相同。',delivery:'驗證電郵暫時未能寄出，請稍後再試。',unavailable:'驗證電郵服務尚未設定，請聯絡管理員。'};
export default async function Signup({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
 const p=await searchParams,ready=configured()||verificationMailReady();
 return <main className="admin-login"><Link className="brand-word" href="/zh-Hant">TESC</Link><h1>建立會員帳戶</h1><p className="muted">註冊後請確認電郵地址，才可登入會員帳戶。</p>
  {p.error&&<p role="alert" className="error-text">{errors[p.error]||errors.invalid}</p>}
  {p.message==='verify'?<p role="status" className="notice">若此地址可註冊，我們已寄出六位數驗證碼。驗證碼有效 10 分鐘。</p>:ready?<MemberSignupForm/>:<p role="status" className="notice">驗證電郵服務尚未設定，會員註冊暫不可用。請聯絡管理員。</p>}
  {ready&&<details className="signup-resend"><summary>未收到驗證碼？</summary><form action={resendVerification}><label className="field">註冊電郵<input type="email" name="email" required autoComplete="email"/></label><button className="button button-outline">重寄驗證碼</button></form><p className="muted">為避免重複寄送，每次請相隔至少一分鐘。</p></details>}
  <nav className="auth-links" aria-label="帳戶導覽"><Link className="text-link" href="/zh-Hant">← 返回網站</Link><Link className="text-link" href="/login">已有帳戶？登入 →</Link></nav>
 </main>;
}
