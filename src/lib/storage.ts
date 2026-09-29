import 'server-only';
import {serviceDb} from './supabase';
export interface StoredObject {bucket:string;path:string}
export interface StorageAdapter {
 put(object:StoredObject,bytes:Uint8Array,mime:string):Promise<void>;
 remove(object:StoredObject):Promise<void>;
 read(object:StoredObject):Promise<Uint8Array>;
 signedUrl(object:StoredObject,downloadName?:string):Promise<string>;
}
// All public components use media IDs, never provider-specific object URLs.
// A NAS/S3 adapter can replace this object without changing the content model.
export const storage:StorageAdapter={
 async put(o,bytes,mime){const {error}=await serviceDb().storage.from(o.bucket).upload(o.path,bytes,{contentType:mime,upsert:false});if(error)throw error;},
 async remove(o){const {error}=await serviceDb().storage.from(o.bucket).remove([o.path]);if(error)throw error;},
 async read(o){const {data,error}=await serviceDb().storage.from(o.bucket).download(o.path);if(error)throw error;return new Uint8Array(await data.arrayBuffer());},
 async signedUrl(o,downloadName){const {data,error}=await serviceDb().storage.from(o.bucket).createSignedUrl(o.path,60,downloadName?{download:downloadName}:{});if(error)throw error;return data.signedUrl;}
};
