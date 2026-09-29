import {contactSchema} from '@/lib/domain';
import {apiError,ApiError} from '@/lib/auth';
import {limitedForm,publicGuard,captcha} from '@/lib/security';
import {serviceDb} from '@/lib/supabase';
export async function POST(req:Request){try{await publicGuard(req,'contact');const form=await limitedForm(req,30000);await captcha(form,'contact');const parsed=contactSchema.safeParse({...Object.fromEntries(form),consent:form.get('consent')==='on'});if(!parsed.success)throw new ApiError(400,'請檢查必填資料及電郵地址。');
 const db=serviceDb();const {data,error}=await db.from('contact_submissions').insert(parsed.data).select('id').single();if(error)throw error;
 let delivery='unconfigured';if(process.env.CONTACT_WEBHOOK_URL&&process.env.CONTACT_RECEIVER_EMAIL){try{const sent=await fetch(process.env.CONTACT_WEBHOOK_URL,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${process.env.CONTACT_WEBHOOK_TOKEN||''}`},body:JSON.stringify({to:process.env.CONTACT_RECEIVER_EMAIL,submission_id:data.id,...parsed.data}),signal:AbortSignal.timeout(10000)});delivery=sent.ok?'sent':'failed';}catch{delivery='failed';}}
 await db.from('contact_submissions').update({delivery_status:delivery}).eq('id',data.id);return Response.json({ok:true},{status:201});
 }catch(e){return apiError(e);}}
