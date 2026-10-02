-- Publish the supplied contact and donation details. Preserve content already edited by an administrator.
insert into public.content_entries (kind,slug,title,description,body,data,status,published_at,display_order,is_demo)
values
 ('contact','contact',
  jsonb_build_object('zh-Hant','聯絡我們','zh-Hans','联系我们','en','Contact us'),
  jsonb_build_object('zh-Hant','','zh-Hans','','en',''),
  jsonb_build_object('zh-Hant','','zh-Hans','','en',''),
  jsonb_build_object('email','tescadm@gmail.com'),
  'published',now(),41,false),
 ('donation','default',
  jsonb_build_object('zh-Hant','奉獻方式','zh-Hans','奉献方式','en','Ways to give'),
  jsonb_build_object('zh-Hant','如有感動奉獻，可以以下方式支持：','zh-Hans','如有感动奉献，可以通过以下方式支持：','en','If you would like to support our work, you can give in the following ways:'),
  jsonb_build_object(
   'zh-Hant',$$<ol><li><strong>支票：</strong>抬頭請寫「神學教育服務團有限公司」或「Theological Education Service Corps Limited」。</li><li><strong>現金／銀行入數：</strong>恒生銀行帳戶號碼：239-888803-883。</li><li><strong>轉數快：</strong>FPS ID：112124474。</li></ol><p>請將入數紙或轉數快的截圖電郵至 <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>，或將入數紙寄回「簡便回郵94號TSW」（若在本港投寄，無需貼上郵票）。</p><p>凡奉獻金額達 HK$100 或以上，可憑收據按香港稅務局規定申請扣稅。<a href="https://www.ird.gov.hk/chi/tax/ach.htm">了解稅務局的認可慈善捐款規定</a>。</p>$$,
   'zh-Hans',$$<ol><li><strong>支票：</strong>抬头请写“神学教育服务团有限公司”或“Theological Education Service Corps Limited”。</li><li><strong>现金／银行存款：</strong>恒生银行账户号码：239-888803-883。</li><li><strong>转数快：</strong>FPS ID：112124474。</li></ol><p>请将存款单或转数快的截图电邮至 <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>，或将存款单寄回“简便回邮94号TSW”（若在香港投寄，无需贴邮票）。</p><p>凡奉献金额达 HK$100 或以上，可凭收据按香港税务局规定申请扣税。<a href="https://www.ird.gov.hk/chs/tax/ach.htm">了解税务局的认可慈善捐款规定</a>。</p>$$,
   'en',$$<ol><li><strong>Cheque:</strong> Make payable to “神學教育服務團有限公司” or “Theological Education Service Corps Limited”.</li><li><strong>Cash / bank deposit:</strong> Hang Seng Bank account: 239-888803-883.</li><li><strong>Faster Payment System (FPS):</strong> FPS ID: 112124474.</li></ol><p>Please email a copy of your bank deposit slip or FPS transaction screenshot to <a href="mailto:tescadm@gmail.com">tescadm@gmail.com</a>, or mail the deposit slip to “Freepost No. 94 TSW” (no stamp is needed when posting within Hong Kong).</p><p>Donations of HK$100 or more may qualify for a Hong Kong tax deduction with a receipt, subject to Inland Revenue Department rules. <a href="https://www.ird.gov.hk/eng/tax/ach.htm">Read the official charitable donation guidance</a>.</p>$$),
  '{}'::jsonb,'published',now(),40,false)
on conflict (kind,slug) do update set
 title=excluded.title,description=excluded.description,body=excluded.body,
 data=public.content_entries.data || excluded.data,status='published',
 published_at=excluded.published_at,is_demo=false,updated_at=now()
where public.content_entries.is_demo=true;
