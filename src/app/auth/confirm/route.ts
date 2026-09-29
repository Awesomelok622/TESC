import {NextResponse} from 'next/server';
import type {EmailOtpType} from '@supabase/supabase-js';
import {configured,sessionDb} from '@/lib/supabase';
export async function GET(req:Request){const u=new URL(req.url),base=process.env.NEXT_PUBLIC_SITE_URL||u.origin;if(!configured())return NextResponse.redirect(`${base}/admin/login?error=config`);const db=await sessionDb();let error:unknown=true;const hash=u.searchParams.get('token_hash'),type=u.searchParams.get('type'),code=u.searchParams.get('code');if(hash&&type&&['recovery','invite'].includes(type)){({error}=await db.auth.verifyOtp({token_hash:hash,type:type as EmailOtpType}));}else if(code){({error}=await db.auth.exchangeCodeForSession(code));}return NextResponse.redirect(`${base}${error?'/admin/login?error=login':'/admin/password'}`);}
