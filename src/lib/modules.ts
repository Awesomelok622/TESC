import type {Kind} from './domain';
export const modules:{key:string;label:string;kind?:Kind;group?:string}[]=[{key:'dashboard',label:'總覽'},{key:'page',label:'機構資料',kind:'page'},{key:'board',label:'董事會',kind:'person',group:'board'},{key:'staff',label:'同工',kind:'person',group:'staff'},{key:'ministry',label:'服侍向度',kind:'ministry'},{key:'video',label:'介紹片',kind:'video'},{key:'course',label:'課程',kind:'course'},{key:'course_category',label:'課程分類',kind:'course_category'},{key:'project',label:'數位化計劃',kind:'project'},{key:'project_section',label:'計劃段落／進度',kind:'project_section'},{key:'project_document',label:'計劃文獻',kind:'project_document'},{key:'prayer',label:'代禱信',kind:'prayer'},{key:'resources',label:'會友版面審核'},{key:'resource_category',label:'資源分類',kind:'resource_category'},{key:'contact',label:'聯絡資料',kind:'contact'},{key:'contacts',label:'查詢收件匣'},{key:'donation',label:'奉獻資料',kind:'donation'},{key:'media',label:'媒體庫'},{key:'settings',label:'網站設定',kind:'settings'},{key:'roles',label:'管理員權限'}];
export type ExtraField={key:string;label:string;type:'text'|'i18n'|'image'|'pdf'|'video'|'url'|'select';options?:string[]};
const image:ExtraField={key:'image_id',label:'封面／圖片',type:'image'};
const pdf:ExtraField={key:'pdf_id',label:'PDF 附件',type:'pdf'};
export const fields:Partial<Record<Kind,ExtraField[]>>={
 page:[image,{key:'quote',label:'引言',type:'i18n'}],
 person:[image,{key:'role',label:'職分',type:'i18n'},{key:'biography',label:'簡歷',type:'i18n'},{key:'responsibilities',label:'職責',type:'i18n'},{key:'email',label:'公開電郵（選填）',type:'text'}],
 ministry:[image,{key:'video_id',label:'影片',type:'video'},{key:'cta_label',label:'連結文字',type:'i18n'},{key:'cta_url',label:'連結網址',type:'url'}],
 video:[{key:'source_type',label:'影片來源',type:'select',options:['upload','youtube','vimeo']},{key:'video_url',label:'YouTube / Vimeo 網址',type:'url'},{key:'video_id',label:'上載影片（MP4）',type:'video'},{key:'poster_id',label:'封面圖',type:'image'},{key:'duration',label:'片長',type:'i18n'}],
 course:[image,{key:'subtitle',label:'副標題',type:'i18n'},{key:'objectives',label:'學習目標',type:'i18n'},{key:'audience',label:'對象',type:'i18n'},{key:'lecturer',label:'講師',type:'i18n'},{key:'format',label:'形式',type:'i18n'},{key:'duration',label:'時數',type:'i18n'},{key:'credits',label:'學分資料',type:'i18n'},{key:'category',label:'分類',type:'text'},{key:'video_id',label:'影片',type:'video'},pdf,{key:'registration_url',label:'報名 HTTPS 網址',type:'url'}],
 project:[image], project_section:[image,pdf,{key:'timeline_date',label:'進度日期（選填）',type:'text'},{key:'statistic_value',label:'已核實統計（選填）',type:'text'}],project_document:[image,pdf,{key:'archival_id',label:'文獻編號（選填）',type:'text'}],
 prayer:[{key:'author',label:'作者',type:'select',options:['暉牧','JOYCE LOK']},image,pdf],
 contact:[{key:'address',label:'地址',type:'i18n'},{key:'email',label:'電郵',type:'text'},{key:'phone',label:'電話',type:'text'},{key:'whatsapp',label:'WhatsApp',type:'text'},{key:'social_url',label:'社交網站',type:'url'}],
 donation:[{key:'account_name',label:'戶口名稱',type:'text'},{key:'bank_info',label:'銀行資料',type:'text'},{key:'qr_id',label:'QR 碼',type:'image'},{key:'donation_url',label:'連結',type:'url'},{key:'notes',label:'備註',type:'i18n'}],
 settings:[{key:'mission',label:'首頁使命宣言',type:'i18n'},{key:'resource_label',label:'會友版面顯示名稱',type:'i18n'},{key:'logo_light_id',label:'淺色標誌',type:'image'},{key:'logo_dark_id',label:'深色標誌',type:'image'},image]
};
