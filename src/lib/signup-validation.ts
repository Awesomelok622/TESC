export function emailIssue(value:string){
 const email=value.trim();
 if(!email)return '請輸入電郵地址。';
 if(email.length>254||!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u).test(email))return '請輸入有效的電郵地址，例如 name@example.com。';
 return '';
}

export function passwordChecks(value:string){return [
 {key:'length',label:'至少 12 個字元',valid:value.length>=12},
 {key:'upper',label:'包含大寫英文字母',valid:/[A-Z]/u.test(value)},
 {key:'lower',label:'包含小寫英文字母',valid:/[a-z]/u.test(value)},
 {key:'number',label:'包含數字',valid:/\d/u.test(value)},
 {key:'symbol',label:'包含符號',valid:/[^A-Za-z\d\s]/u.test(value)},
];}

export function passwordStrength(value:string){const checks=passwordChecks(value),score=checks.filter(check=>check.valid).length;return {checks,score,valid:score===checks.length,label:!value?'尚未輸入':score<=2?'弱':score<5?'中等':'強'};}
