import 'server-only';
import {serviceDb} from './supabase';
import {mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
export interface StoredObject {bucket:string;path:string}
export interface StorageAdapter {
 put(object:StoredObject,bytes:Uint8Array,mime:string):Promise<void>;
 remove(object:StoredObject):Promise<void>;
 read(object:StoredObject):Promise<Uint8Array>;
 signedUrl(object:StoredObject,downloadName?:string):Promise<string>;
}
const local=process.env.STORAGE_DRIVER==='filesystem';
function localPath(o:StoredObject){
 if(!['admin-media','public-assets','public-resources'].includes(o.bucket)||! /^(media|submissions)\/[0-9a-f-]{36}\.(pdf|jpg|jpeg|png|webp|mp4)$/i.test(o.path))throw new Error('Invalid storage path');
 const root=resolve(process.env.UPLOAD_DIR||'/data/uploads');
 const file=resolve(root,o.bucket,o.path);
 if(!file.startsWith(root+sep))throw new Error('Invalid storage path');
 return file;
}
// All public components use media IDs, never provider-specific object URLs.
// A NAS/S3 adapter can replace this object without changing the content model.
export const storage:StorageAdapter={
 async put(o,bytes,mime){if(local){const file=localPath(o);await mkdir(resolve(file,'..'),{recursive:true});await writeFile(file,bytes,{flag:'wx'});return;}const {error}=await serviceDb().storage.from(o.bucket).upload(o.path,bytes,{contentType:mime,upsert:false});if(error)throw error;},
 async remove(o){if(local){await unlink(localPath(o));return;}const {error}=await serviceDb().storage.from(o.bucket).remove([o.path]);if(error)throw error;},
 async read(o){if(local)return new Uint8Array(await readFile(localPath(o)));const {data,error}=await serviceDb().storage.from(o.bucket).download(o.path);if(error)throw error;return new Uint8Array(await data.arrayBuffer());},
 async signedUrl(o,downloadName){if(local)throw new Error('Filesystem media is served directly');const {data,error}=await serviceDb().storage.from(o.bucket).createSignedUrl(o.path,60,downloadName?{download:downloadName}:{});if(error)throw error;return data.signedUrl;}
};
