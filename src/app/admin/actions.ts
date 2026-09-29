'use server';
import {redirect} from 'next/navigation';
import {sessionDb,configured} from '@/lib/supabase';
import {identity} from '@/lib/auth';
import {z} from 'zod';
export async function login(form:FormData){if(!configured())redirect('/admin/login?error=config');const email=String(form.get('email')||''),password=String(form.get('password')||'');if(!z.email().safeParse(email).success||password.length<8)redirect('/admin/login?error=login');const db=await sessionDb();const {error}=await db.auth.signInWithPassword({email,password});if(error)redirect('/admin/login?error=login');if(!await identity()){await db.auth.signOut();redirect('/admin/login?error=forbidden');}redirect('/admin');}
export async function logout(){if(configured())await (await sessionDb()).auth.signOut();redirect('/admin/login');}
export async function resetPassword(form:FormData){if(!configured())redirect('/admin/login?error=config');const email=String(form.get('email')||'');if(z.email().safeParse(email).success){await (await sessionDb()).auth.resetPasswordForEmail(email,{redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/admin/password`});}redirect('/admin/login?message=reset');}
export async function updatePassword(form:FormData){const user=await identity();if(!user)redirect('/admin/login');const password=String(form.get('password')||'');if(password.length<12||password!==form.get('confirm'))redirect('/admin/password?error=password');const {error}=await user.db.auth.updateUser({password});if(error)redirect('/admin/password?error=password');redirect('/admin?message=password');}
