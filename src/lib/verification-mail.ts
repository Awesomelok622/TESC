import 'server-only';

export function verificationMailReady(){return Boolean(process.env.RESEND_API_KEY&&process.env.AUTH_EMAIL_FROM&&process.env.NEXT_PUBLIC_SITE_URL);}

export async function sendVerificationEmail(to:string,code:string){
 if(!verificationMailReady())throw new Error('Verification email delivery is not configured');
 const base=new URL(process.env.NEXT_PUBLIC_SITE_URL!);
 if(process.env.NODE_ENV==='production'&&base.protocol!=='https:')throw new Error('Verification email requires an HTTPS site URL');
 const response=await fetch('https://api.resend.com/emails',{
  method:'POST',
  headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
  body:JSON.stringify({from:process.env.AUTH_EMAIL_FROM,to:[to],subject:'您的 TESC 電郵驗證碼',text:`您的 TESC 電郵驗證碼是：${code}\n\n驗證碼將於 10 分鐘後失效。如非您本人註冊，請忽略此郵件。`,html:`<div style="font-family:Arial,sans-serif;color:#153043"><p>您的 TESC 電郵驗證碼是：</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>驗證碼將於 10 分鐘後失效。如非您本人註冊，請忽略此郵件。</p></div>`}),
  signal:AbortSignal.timeout(10_000),
 });
 if(!response.ok)throw new Error(`Verification email provider returned ${response.status}`);
}
