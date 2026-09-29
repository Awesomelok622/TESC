import {cpSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const output=resolve('.next/standalone');
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
if(!existsSync(`${output}/server.js`))throw new Error('Run npm run build before npm run start.');
cpSync('public',`${output}/public`,{recursive:true});
cpSync('.next/static',`${output}/.next/static`,{recursive:true});
process.env.HOSTNAME=process.env.APP_HOST||'0.0.0.0';
await import(pathToFileURL(`${output}/server.js`).href);
