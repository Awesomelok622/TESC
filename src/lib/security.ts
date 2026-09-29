import 'server-only';
import { createHmac } from 'node:crypto';
import {ApiError,sameOrigin} from './auth';
import {serviceDb} from './supabase';
export const maxPublicBytes=()=>Math.min(20,Math.max(1,Number(process.env.MAX_PUBLIC_UPLOAD_MB)||10))*1024*1024;
export async function limitedForm(req:Request,max:number){
 const length=Number(req.headers.get('content-length'));if(length>max)throw new ApiError(413,'檔案超出大小限制。');
 const reader=req.body?.getReader();if(!reader)throw new ApiError(400,'缺少表單資料。');
 let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new ApiError(413,'檔案超出大小限制。');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return await new Response(bytes,{headers:{'content-type':req.headers.get('content-type')||''}}).formData();}catch{throw new ApiError(400,'表單格式不正確。');}
}
export async function publicGuard(req:Request,action:'resource'|'contact',bytes=0){sameOrigin(req);if(!process.env.RATE_LIMIT_SECRET)throw new ApiError(503,'此功能正待設定。');
 // Trust CF-Connecting-IP only when the origin is exclusively reachable through the configured tunnel.
 const ip=process.env.TRUST_CLOUDFLARE==='true'?(req.headers.get('cf-connecting-ip')||'missing'):'shared-local';
 const key=createHmac('sha256',process.env.RATE_LIMIT_SECRET).update(`${action}:${ip}`).digest('hex');
 const {data,error}=await serviceDb().rpc('consume_limit',{p_key:key,p_limit:action==='resource'?5:10,p_window:3600,p_bytes:bytes,p_quota:50*1024*1024});
 if(error)throw new ApiError(503,'此功能暫未能提供。');if(!data)throw new ApiError(429,'提交次數已達上限，請稍後再試。');
}
export async function captcha(form:FormData,action:string){if(form.get('website'))throw new ApiError(400,'未能提交。');const secret=process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;if(!secret)throw new ApiError(503,'此功能正待設定。');
 const token=form.get('cf-turnstile-response');if(typeof token!=='string'||token.length>2048)throw new ApiError(400,'請完成驗證。');
 const result=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token}),signal:AbortSignal.timeout(10000)}).then(r=>r.json());
 const hostname=new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname;
 if(!result.success||result.hostname!==hostname||result.action!==action)throw new ApiError(400,'驗證未能通過，請重新提交。');
}
export async function scan(bytes:Uint8Array,mime:string):Promise<'clean'|'infected'|'pending'|'error'>{
 if(!process.env.MALWARE_SCAN_URL)return 'pending';
 try{const r=await fetch(process.env.MALWARE_SCAN_URL,{method:'POST',headers:{'content-type':mime,authorization:`Bearer ${process.env.MALWARE_SCAN_TOKEN||''}`},body:Buffer.from(bytes),signal:AbortSignal.timeout(60000)});if(!r.ok)return 'error';const result=await r.json();return result.status==='clean'?'clean':result.status==='infected'?'infected':'error';}catch{return 'error';}
}
