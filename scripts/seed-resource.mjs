import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Service credentials required.');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
// Minimal valid single-page PDF, deliberately labelled demonstration content.
const stream='BT /F1 18 Tf 50 740 Td (DEMO / PLACEHOLDER - TESC) Tj 0 -35 Td /F1 12 Tf (This is a demonstration resource. No official content.) Tj ET';
const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const id=randomUUID(),bytes=Buffer.from(pdf),path=`demo/${id}.pdf`;
const {error:uploadError}=await db.storage.from('admin-media').upload(path,bytes,{contentType:'application/pdf'});if(uploadError)throw uploadError;
const {error:mediaError}=await db.from('media_items').insert({id,path,bucket:'admin-media',original_name:'DEMO-placeholder.pdf',mime_type:'application/pdf',file_size:bytes.length,category:'DEMO',scan_status:'pending'});if(mediaError)throw mediaError;
const {error}=await db.from('community_resources').insert({title:{'zh-Hant':'DEMO / 示範資源','zh-Hans':'DEMO / 示例资源',en:'DEMO / Example resource'},description:{'zh-Hant':'[待輸入正式內容]','zh-Hans':'[待输入正式内容]',en:'[Awaiting official content]'},category:'DEMO',media_id:id,file_size:bytes.length,status:'pending',published:false,scan_status:'pending'});if(error)throw error;
console.log('Demo PDF created as a private pending resource. Review and scan it before approving.');
