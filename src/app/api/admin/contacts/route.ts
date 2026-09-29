import {jsonBody} from '@/lib/request';
import {requireAdmin,sameOrigin,apiError} from '@/lib/auth';
export async function GET(){try{const {db}=await requireAdmin();const {data,error}=await db.from('contact_submissions').select('*').order('created_at',{ascending:false});if(error)throw error;return Response.json(data);}catch(e){return apiError(e);}}
export async function PATCH(req:Request){try{sameOrigin(req);const {db}=await requireAdmin();const {id,resolved}=await jsonBody(req);const {error}=await db.from('contact_submissions').update({resolved:resolved===true}).eq('id',id);if(error)throw error;return Response.json({ok:true});}catch(e){return apiError(e);}}
