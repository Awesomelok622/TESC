import {jsonBody} from '@/lib/request';
import {requireAdmin,sameOrigin,apiError,ApiError} from '@/lib/auth';
import {serviceDb} from '@/lib/supabase';
import {z} from 'zod';
export async function GET(){try{const {db}=await requireAdmin('roles');const {data,error}=await db.from('profiles').select('*');if(error)throw error;return Response.json(data);}catch(e){return apiError(e);}}
export async function POST(req:Request){try{sameOrigin(req);const actor=await requireAdmin('roles');const p=z.object({id:z.uuid(),role:z.enum(['editor','super_admin']),display_name:z.string().max(120)}).safeParse(await jsonBody(req));if(!p.success)throw new ApiError(400,'資料不正確。');if(p.data.id===actor.id&&p.data.role!=='super_admin')throw new ApiError(400,'不能移除自己的主管理員權限。');const {error}=await actor.db.from('profiles').upsert(p.data);if(error)throw error;await serviceDb().from('audit_events').insert({actor_id:actor.id,entity:'profiles',entity_id:p.data.id,action:'ROLE_CHANGED'});return Response.json({ok:true});}catch(e){return apiError(e);}}
export async function DELETE(req:Request){try{sameOrigin(req);const actor=await requireAdmin('roles');const {id}=await jsonBody(req);if(id===actor.id)throw new ApiError(400,'不能移除自己的權限。');const {error}=await actor.db.from('profiles').delete().eq('id',id);if(error)throw error;return Response.json({ok:true});}catch(e){return apiError(e);}}
