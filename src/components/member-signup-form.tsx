'use client';
import {useState,type FormEvent} from 'react';
import {memberSignup} from '@/app/login/actions';
import {emailIssue,passwordStrength} from '@/lib/signup-validation';

export function MemberSignupForm(){
 const [email,setEmail]=useState(''),[emailTouched,setEmailTouched]=useState(false);
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [submitted,setSubmitted]=useState(false);
 const emailError=emailIssue(email),strength=passwordStrength(password),confirmError=confirm&&password!==confirm?'兩次輸入的密碼不相同。':'';
 function onSubmit(event:FormEvent<HTMLFormElement>){setSubmitted(true);if(emailError||!strength.valid||password!==confirm||!confirm)event.preventDefault();}
 return <form action={memberSignup} noValidate onSubmit={onSubmit}>
  <label className="field">姓名<input name="display_name" required maxLength={120} autoComplete="name"/></label>
  <label className="field">電郵<input type="email" name="email" required autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} onBlur={()=>setEmailTouched(true)} aria-invalid={(emailTouched||submitted)&&!!emailError} aria-describedby="signup-email-help"/></label>
  <p id="signup-email-help" className={(emailTouched||submitted)&&emailError?'auth-input-error':'auth-input-help'} role={(emailTouched||submitted)&&emailError?'alert':undefined}>{(emailTouched||submitted)&&emailError?emailError:'我們會將六位數驗證碼寄到此電郵地址。'}</p>
  <label className="field">密碼<input type="password" name="password" required minLength={12} maxLength={200} autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} aria-invalid={submitted&&!strength.valid} aria-describedby="signup-password-help signup-password-checks"/></label>
  <div id="signup-password-help" className="password-strength" aria-live="polite"><span>密碼強度：<strong>{strength.label}</strong></span><span className="password-strength-bars" data-score={strength.score} aria-hidden="true"><i/><i/><i/><i/><i/></span></div>
  <ul id="signup-password-checks" className="password-checks">{strength.checks.map(check=><li key={check.key} className={check.valid?'is-valid':''}>{check.valid?'✓':'○'} {check.label}</li>)}</ul>
  <label className="field">確認密碼<input type="password" name="confirm" required autoComplete="new-password" value={confirm} onChange={event=>setConfirm(event.target.value)} aria-invalid={!!confirmError} aria-describedby="signup-confirm-help"/></label>
  <p id="signup-confirm-help" className="auth-input-error" role={confirmError?'alert':undefined}>{confirmError}</p>
  <button className="button" type="submit">註冊並寄送驗證碼</button>
 </form>;
}
