import 'server-only';
import {configured,sessionDb} from './supabase';
import {type Role,canManage} from './domain';
export async function identity(){if(!configured())return null;const db=await sessionDb();const {data:{user},error}=await db.auth.getUser();if(error||!user)return null;const {data:profile}=await db.from('profiles').select('role,display_name').eq('id',user.id).single();return profile?{id:user.id,email:user.email,role:profile.role as Role,display_name:profile.display_name,db}:null;}
export async function requireAdmin(kind?:string){const actor=await identity();if(!actor)throw new ApiError(401,'請先登入管理系統。');if(!canManage(actor.role,kind||'dashboard'))throw new ApiError(403,'你沒有此操作的權限。');return actor;}
export class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
export function apiError(e:unknown){if(e instanceof ApiError)return Response.json({error:e.message},{status:e.status});console.error('Request failed',e instanceof Error?e.name:'unknown');return Response.json({error:'操作未能完成，請稍後再試。'},{status:500});}
export function sameOrigin(req:Request){const expected=new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').origin;if(req.headers.get('origin')!==expected)throw new ApiError(403,'請從網站表單提交。');}
