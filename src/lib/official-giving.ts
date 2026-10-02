import {type Entry,i18n} from './domain';

export const givingTitle=i18n('奉獻方式','Ways to give','奉献方式');
export const givingDescription=i18n('如有感動奉獻，可以以下方式支持：','If you would like to support our work, you can give in the following ways:','如有感动奉献，可以通过以下方式支持：');
export const givingBody=i18n(
 '<ol><li><strong>支票：</strong>抬頭請寫「神學教育服務團有限公司」或「Theological Education Service Corps Limited」。</li><li><strong>現金／銀行入數：</strong>恒生銀行帳戶號碼：239-888803-883。</li><li><strong>轉數快：</strong>FPS ID：112124474。</li></ol><p>請將入數紙或轉數快的截圖電郵至 <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>，或將入數紙寄回「簡便回郵94號TSW」（若在本港投寄，無需貼上郵票）。</p><p>凡奉獻金額達 HK$100 或以上，可憑收據按香港稅務局規定申請扣稅。<a href="https://www.ird.gov.hk/chi/tax/ach.htm">了解稅務局的認可慈善捐款規定</a>。</p>',
 '<ol><li><strong>Cheque:</strong> Make payable to “神學教育服務團有限公司” or “Theological Education Service Corps Limited”.</li><li><strong>Cash / bank deposit:</strong> Hang Seng Bank account: 239-888803-883.</li><li><strong>Faster Payment System (FPS):</strong> FPS ID: 112124474.</li></ol><p>Please email a copy of your bank deposit slip or FPS transaction screenshot to <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>, or mail the deposit slip to “Freepost No. 94 TSW” (no stamp is needed when posting within Hong Kong).</p><p>Donations of HK$100 or more may qualify for a Hong Kong tax deduction with a receipt, subject to Inland Revenue Department rules. <a href="https://www.ird.gov.hk/eng/tax/ach.htm">Read the official charitable donation guidance</a>.</p>',
 '<ol><li><strong>支票：</strong>抬头请写“神学教育服务团有限公司”或“Theological Education Service Corps Limited”。</li><li><strong>现金／银行存款：</strong>恒生银行账户号码：239-888803-883。</li><li><strong>转数快：</strong>FPS ID：112124474。</li></ol><p>请将存款单或转数快的截图电邮至 <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>，或将存款单寄回“简便回邮94号TSW”（若在香港投寄，无需贴邮票）。</p><p>凡奉献金额达 HK$100 或以上，可凭收据按香港税务局规定申请扣税。<a href="https://www.ird.gov.hk/chs/tax/ach.htm">了解税务局的认可慈善捐款规定</a>。</p>'
);

export function officialDonationEntry():Entry{return {
 id:'00000000-0000-4000-8000-000000000041',kind:'donation',slug:'default',
 title:givingTitle,description:givingDescription,body:givingBody,data:{},
 status:'published',published_at:'2020-01-01T00:00:00Z',display_order:40,
 featured:false,is_demo:false,is_private:false
};}

export function officialContactEntry():Entry{return {
 id:'00000000-0000-4000-8000-000000000042',kind:'contact',slug:'contact',
 title:i18n('聯絡我們','Contact us','联系我们'),description:i18n('','',''),body:i18n('','',''),
 data:{email:'tescadm@gmail.com'},status:'published',published_at:'2020-01-01T00:00:00Z',
 display_order:41,featured:false,is_demo:false,is_private:false
};}
