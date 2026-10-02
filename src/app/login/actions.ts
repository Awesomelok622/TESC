'use server';
import {redirect} from 'next/navigation';
import {sessionDb,configured} from '@/lib/supabase';
import {identity} from '@/lib/auth';
import {z} from 'zod';
import {localAuthenticate,createLocalUser,deleteUnverifiedLocalUser,newEmailVerificationCode,pendingVerification,saveEmailVerification,verifyLocalEmail} from '@/lib/local-db';
import {localSignIn,localSignOut} from '@/lib/local-auth';
import {emailIssue,passwordStrength} from '@/lib/signup-validation';
import {sendVerificationEmail,verificationMailReady} from '@/lib/verification-mail';

export async function memberLogin(form:FormData){
 if(!configured()){const email=String(form.get('email')||''),password=String(form.get('password')||'');const user=z.email().safeParse(email).success&&password.length>=8?localAuthenticate(email,password):null;if(!user)redirect('/login?error=login');await localSignIn(user.id);redirect(user.role==='member'?'/zh-Hant/prayer':'/admin');}
 const email=String(form.get('email')||''),password=String(form.get('password')||'');
 if(!z.email().safeParse(email).success||password.length<8)redirect('/login?error=login');
 const db=await sessionDb();
 const {error}=await db.auth.signInWithPassword({email,password});
 if(error)redirect('/login?error=login');
 const actor=await identity();
 if(!actor){await db.auth.signOut();redirect('/login?error=forbidden');}
 await db.rpc('touch_profile');
 redirect(actor.role==='member'?'/zh-Hant/prayer':'/admin');
}

export async function memberSignup(form:FormData){
 const parsed=z.object({display_name:z.string().trim().min(1).max(120),email:z.string().trim().max(254),password:z.string().max(200),confirm:z.string()}).safeParse(Object.fromEntries(form));
 if(!parsed.success)redirect('/signup?error=invalid');
 const {display_name,email,password,confirm}=parsed.data;
 if(emailIssue(email)||!z.email().safeParse(email).success)redirect('/signup?error=email');
 if(!passwordStrength(password).valid)redirect('/signup?error=password');
 if(password!==confirm)redirect('/signup?error=confirm');
 if(!configured()){
  if(!verificationMailReady())redirect('/signup?error=unavailable');
  let user;
  try{user=createLocalUser(email,display_name,password,'member',false);}catch{redirect('/signup?error=exists');}
  const code=newEmailVerificationCode();
  try{saveEmailVerification(user.id,code);await sendVerificationEmail(email,code);}
  catch(e){deleteUnverifiedLocalUser(user.id);console.error('Member verification delivery failed',e instanceof Error?e.message:'unknown');redirect('/signup?error=delivery');}
  redirect('/verify-email?sent=1');
 }
 const db=await sessionDb();const {data,error}=await db.auth.signUp({email,password,options:{data:{display_name},emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/login?message=verified`}});
 if(error||!data.user)redirect('/signup?error=exists');
 if(data.session)await db.auth.signOut();
 redirect('/verify-email?sent=1');
}
export async function resendVerification(form:FormData){
 const email=String(form.get('email')||'').trim();if(emailIssue(email))redirect('/signup?error=email');
 if(configured()){
  const db=await sessionDb();await db.auth.resend({type:'signup',email});redirect('/verify-email?sent=1');
 }
 if(!verificationMailReady())redirect('/signup?error=unavailable');
 const pending=pendingVerification(email);
 if(pending&&(!pending.sent_at||Date.now()-Date.parse(pending.sent_at)>=60_000)){
  const code=newEmailVerificationCode();
  try{saveEmailVerification(pending.id,code);await sendVerificationEmail(email,code);}
  catch(e){console.error('Member verification resend failed',e instanceof Error?e.message:'unknown');redirect('/signup?error=delivery');}
 }
 redirect('/verify-email?sent=1');
}
export async function confirmEmailOtp(form:FormData){
 const parsed=z.object({email:z.string().trim().email().max(254),code:z.string().regex(/^\d{6}$/)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)redirect('/verify-email?error=invalid');
 const {email,code}=parsed.data;
 if(configured()){
  const db=await sessionDb();const {error}=await db.auth.verifyOtp({email,token:code,type:'signup'});
  if(error)redirect('/verify-email?error=invalid');
  await db.auth.signOut();redirect('/login?message=verified');
 }
 if(!verifyLocalEmail(email,code))redirect('/verify-email?error=invalid');
 redirect('/login?message=verified');
}
export async function memberLogout(){if(configured())await (await sessionDb()).auth.signOut();else await localSignOut();redirect('/zh-Hant');}
