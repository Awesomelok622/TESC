import {requireAdmin,sameOrigin,apiError,ApiError} from '@/lib/auth';
import {serviceDb} from '@/lib/supabase';
import {jsonBody} from '@/lib/request';
import {z} from 'zod';

export async function GET(){try{const actor=await requireAdmin('users');const {data,error}=await actor.db.from('profiles').select('id,role,display_name,created_at,last_seen_at').eq('role','member').order('created_at',{ascending:false});if(error)throw error;return Response.json(data);}catch(e){return apiError(e);}}
export async function POST(req:Request){try{sameOrigin(req);await requireAdmin('users');const p=z.object({email:z.email(),display_name:z.string().trim().min(1).max(120)}).safeParse(await jsonBody(req));if(!p.success)throw new ApiError(400,'請輸入有效的姓名和電郵。');const {data,error}=await serviceDb().auth.admin.inviteUserByEmail(p.data.email,{redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/admin/password`});if(error||!data.user)throw new ApiError(400,'未能發出邀請；請檢查電郵是否已註冊。');const {error:profileError}=await serviceDb().from('profiles').upsert({id:data.user.id,role:'member',display_name:p.data.display_name});if(profileError)throw profileError;return Response.json({ok:true});}catch(e){return apiError(e);}}
