import 'server-only';
import {cookies} from 'next/headers';
import {createLocalSession,deleteLocalSession,userForToken} from './local-db';
const name='tesc_session';
export async function localIdentity(){const token=(await cookies()).get(name)?.value;return token?userForToken(token)||null:null;}
export async function localSignIn(id:string){const token=createLocalSession(id);(await cookies()).set(name,token,{httpOnly:true,sameSite:'lax',secure:process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')||false,path:'/',maxAge:30*86400});}
export async function localSignOut(){const jar=await cookies(),token=jar.get(name)?.value;if(token)deleteLocalSession(token);jar.delete(name);}
