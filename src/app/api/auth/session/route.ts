import {z} from 'zod';
import {configured,sessionDb} from '@/lib/supabase';
import {identity,sameOrigin,apiError,ApiError} from '@/lib/auth';
import {jsonBody} from '@/lib/request';
import {localIdentity,localSignIn,localSignOut} from '@/lib/local-auth';
import {localAuthenticate} from '@/lib/local-db';
export async function GET(){const actor=configured()?await identity():await localIdentity();return actor?Response.json({id:actor.id,role:actor.role,display_name:actor.display_name}):Response.json({error:'未登入。'},{status:401});}
export async function POST(req:Request){try{sameOrigin(req);const parsed=z.object({email:z.email(),password:z.string().min(8)}).safeParse(await jsonBody(req));if(!parsed.success)throw new ApiError(400,'資料格式不正確。');if(!configured()){const actor=localAuthenticate(parsed.data.email,parsed.data.password);if(!actor)throw new ApiError(401,'電郵或密碼不正確。');await localSignIn(actor.id);return Response.json({id:actor.id,role:actor.role,display_name:actor.display_name});}const db=await sessionDb();const {error}=await db.auth.signInWithPassword(parsed.data);if(error)throw new ApiError(401,'電郵或密碼不正確。');const actor=await identity();if(!actor){await db.auth.signOut();throw new ApiError(403,'此帳戶未獲授權。');}await db.rpc('touch_profile');return Response.json({id:actor.id,role:actor.role,display_name:actor.display_name});}catch(e){return apiError(e);}}
export async function DELETE(req:Request){try{sameOrigin(req);if(configured())await (await sessionDb()).auth.signOut();else await localSignOut();return Response.json({ok:true});}catch(e){return apiError(e);}}
