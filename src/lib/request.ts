import {ApiError} from './auth';
export async function jsonBody(req:Request):Promise<Record<string,unknown>>{
 const limit=600000;if(Number(req.headers.get('content-length'))>limit)throw new ApiError(413,'內容過長。');
 const reader=req.body?.getReader();if(!reader)throw new ApiError(400,'缺少資料。');let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new ApiError(413,'內容過長。');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{const parsed:unknown=JSON.parse(new TextDecoder().decode(bytes));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();return parsed as Record<string,unknown>;}catch{throw new ApiError(400,'資料格式不正確。');}
}
