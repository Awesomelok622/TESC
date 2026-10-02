import type {Locale} from './domain';

export function adminLocale(value?:string):Locale{return value==='en'||value==='zh-Hans'?value:'zh-Hant';}
export function adminText(locale:Locale){
 const t=(hant:string,hans:string,en:string)=>locale==='en'?en:locale==='zh-Hans'?hans:hant;
 return {
  portal:t('管理平台','管理平台','Admin portal'),
  eyebrow:t('神學教育服務團 / 管理平台','神学教育服务团 / 管理平台','TESC / ADMIN PORTAL'),
  dashboard:t('總覽','总览','Overview'),
  prayer:t('代禱信','代祷信','Prayer letters'),
  users:t('會員','会员','Members'),
  site:t('網站頁面','网站页面','Website'),
  account:t('帳戶','账户','Account'),
  publicSite:t('公開網站','公开网站','Public site'),
  logout:t('登出','退出','Sign out'),
  dashboardTitle:t('管理總覽','管理总览','Admin overview'),
  dashboardIntro:t('掌握代禱信、會員和網站內容的最新情況。','掌握代祷信、会员和网站内容的最新情况。','See the latest prayer letters, members and website content at a glance.'),
  publishedLetters:t('公開代禱信','公开代祷信','Published letters'),
  registeredMembers:t('註冊會員','注册会员','Registered members'),
  recentSignins:t('近期登入會員','近期登录会员','Recently signed-in members'),
  latestLetter:t('最新代禱信','最新代祷信','Latest letter'),
  openPrayer:t('管理代禱信','管理代祷信','Manage letters'),
  openUsers:t('查看會員','查看会员','View members'),
  openSite:t('檢視網站','查看网站','Review website'),
  uploadLetter:t('上載代禱信','上传代祷信','Upload prayer letter'),
  quickActions:t('快速操作','快捷操作','Quick actions'),
  latestActivity:t('最近內容','最近内容','Recent content'),
  recentMembers:t('會員登入記錄','会员登录记录','Member sign-ins'),
  noSignins:t('尚未有會員登入記錄。','尚无会员登录记录。','No member sign-ins recorded yet.'),
  noLetters:t('目前沒有代禱信。','目前没有代祷信。','No prayer letters yet.'),
  prayerTitle:t('代禱信管理','代祷信管理','Prayer letter management'),
  prayerIntro:t('上載 PDF、檢視已發佈文件，並管理公開代禱信。','上传 PDF、查看已发布文件，并管理公开代祷信。','Upload PDFs, review published files and manage public prayer letters.'),
  uploadHint:t('PDF 最多 250 MB；發佈後任何人均可閱讀及下載。','PDF 最大 250 MB；发布后所有人都可阅读及下载。','PDF up to 250 MB. Published letters are public to read and download.'),
  library:t('文件庫','文件库','Letter library'),
  newestFirst:t('按日期由新至舊顯示','按日期从新到旧显示','Sorted newest to oldest'),
  title:t('標題','标题','Title'),
  author:t('作者','作者','Author'),
  date:t('日期','日期','Date'),
  file:t('檔案','文件','File'),
  actions:t('操作','操作','Actions'),
  view:t('查看','查看','View'),
  download:t('下載 PDF','下载 PDF','Download PDF'),
  remove:t('移除','移除','Remove'),
  usersTitle:t('會員管理','会员管理','Member management'),
  usersIntro:t('查看註冊會員及最近登入時間。','查看注册会员及最近登录时间。','Review registered members and their most recent sign-ins.'),
  totalUsers:t('全部帳戶','全部账户','All accounts'),
  admins:t('管理員','管理员','Administrators'),
  members:t('一般會員','普通会员','Regular members'),
  name:t('姓名','姓名','Name'),
  email:t('電郵','电子邮箱','Email'),
  role:t('角色','角色','Role'),
  joined:t('註冊日期','注册日期','Joined'),
  lastSeen:t('最近登入','最近登录','Last sign-in'),
  never:t('尚未登入','尚未登录','Never'),
  siteTitle:t('網站內容總覽','网站内容总览','Website content overview'),
  siteIntro:t('快速開啟公開頁面，檢查課程、團隊、計劃、代禱信及奉獻資料。','快速打开公开页面，检查课程、团队、计划、代祷信及奉献资料。','Open public pages to review courses, team profiles, projects, letters and giving information.'),
  visitPage:t('開啟頁面','打开页面','Open page'),
  aboutPage:t('機構簡介','机构简介','About TESC'),
  teamPage:t('團隊介紹','团队介绍','Team'),
  ministryPage:t('課程與服侍','课程与服侍','Courses and ministry'),
  projectPage:t('文獻數位化','文献数字化','Digitisation'),
  prayerPage:t('代禱信列表','代祷信列表','Prayer letters'),
  givingPage:t('聯絡及奉獻','联络及奉献','Contact and giving'),
  accountTitle:t('帳戶與安全','账户与安全','Account and security'),
  accountIntro:t('檢視管理員帳戶和密碼設定。','查看管理员账户和密码设置。','Review your administrator account and password settings.'),
  changePassword:t('更改密碼','更改密码','Change password'),
  signedInAs:t('目前登入','当前登录','Signed in as'),
  currentRole:t('權限','权限','Role'),
  noticeUploaded:t('代禱信已上載。','代祷信已上传。','Prayer letter uploaded.'),
  noticeDeleted:t('代禱信已移除。','代祷信已移除。','Prayer letter removed.'),
  noticePassword:t('密碼已更新。','密码已更新。','Password updated.'),
  formTitle:t('標題','标题','Title'),
  formPlaceholder:t('例如：暉牧代禱信 · 2026年10月','例如：暉牧代祷信 · 2026年10月','For example: Pastor Fai Prayer Letter · October 2026'),
  publishDate:t('發佈日期','发布日期','Publication date'),
  pdfFile:t('PDF 檔案','PDF 文件','PDF file'),
  publish:t('上載並發佈','上传并发布','Upload and publish'),
  uploading:t('上載中…','上传中…','Uploading…'),
  uploadFailed:t('上載失敗。','上传失败。','Upload failed.'),
  confirmDelete:t('確定移除此代禱信？','确定移除此代祷信？','Remove this prayer letter?'),
  actionFailed:t('操作失敗。','操作失败。','Action failed.')
  ,loginTitle:t('管理員登入','管理员登录','Administrator sign-in')
  ,loginIntro:t('神學教育服務團內容管理系統','神学教育服务团内容管理系统','TESC content management')
  ,loginEmail:t('電郵','电子邮箱','Email')
  ,loginPassword:t('密碼','密码','Password')
  ,signIn:t('登入','登录','Sign in')
  ,forgotPassword:t('忘記密碼？','忘记密码？','Forgot password?')
  ,sendReset:t('寄出重設郵件','发送重设邮件','Send reset email')
  ,backWebsite:t('返回公開網站','返回公开网站','Back to public site')
  ,loginInvalid:t('登入未能完成，請檢查電郵及密碼。','登录未能完成，请检查邮箱及密码。','Sign-in failed. Check your email and password.')
  ,loginForbidden:t('此帳戶沒有管理員權限。','此账户没有管理员权限。','This account has no administrator access.')
  ,loginConfig:t('管理系統尚未完成設定。','管理系统尚未完成设置。','The admin system is not yet configured.')
  ,resetSent:t('如帳戶存在，密碼重設郵件將寄到你的電郵。','如果账户存在，密码重设邮件将发送到你的邮箱。','If the account exists, a reset email has been sent.')
  ,newPassword:t('新密碼','新密码','New password')
  ,confirmPassword:t('再次輸入','再次输入','Confirm password')
  ,savePassword:t('儲存密碼','保存密码','Save password')
  ,passwordError:t('密碼至少需要 12 個字元，並且兩次輸入相同。','密码至少需要 12 个字符，两次输入必须相同。','Use at least 12 characters and enter the same password twice.')
  ,backAdmin:t('返回管理平台','返回管理平台','Back to admin portal')
 };
}
