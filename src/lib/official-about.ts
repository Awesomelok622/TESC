import {type Entry,i18n} from './domain';

export const aboutTitle=i18n('創立與使命','Our origins and mission','创立与使命');
export const aboutDescription=i18n('從支援意大利華人神學院開始，將神學教育帶到有需要的宣教工場。','From supporting the Chinese theological seminary in Italy to serving mission fields through theological education.','从支持意大利华人神学院开始，将神学教育带到有需要的宣教工场。');
export const aboutBody=i18n(
 '<p>神學教育服務團創立於2022年，最初乃為協助意大利華人神學院籌募經費而設，支援教師薪酬、學生助學金及圖書購置等需要。其後，事工逐步拓展，進一步為不同有需要的宣教工場開拓神學教育資源，包括安排全球資深講師以網絡及實體方式開辦課程，支援各地現有人才培育機構，裝備當地牧者與信徒領袖。</p>'+
 '<p>我們深信藉着神學教育訓練各地同工，能更有效協助他們廣傳福音、培育門徒、建立教會。為持續推動有關事工，本團現時每年主要開支包括三方面：</p>'+
 '<ol><li><strong>常費支出：</strong>用以於香港開發每年四科全新的網上課程，並差派老師於國內及國外教會服侍；</li>'+
 '<li><strong>對外支持：</strong>當中包括資助意大利華人神學院約港幣100萬元，以支援學生助學金及其他神學教育需要；</li>'+
 '<li><strong>中國教會史文獻數位化計劃：</strong>為中國教會史的保存、研究與教學獻上一份具體而長遠的貢獻。透過有系統地整理、掃描、編目及建立可檢索的電子文本，將珍貴的歷史書籍與研究資源保存下來，避免因紙本老化、散佚或流通困難而影響後續教學與研究使用。</li></ol>',
 '<p>The Theological Education Service Corps (TESC) was founded in 2022 to raise funds for the Chinese theological seminary in Italy, initially supporting faculty salaries, student scholarships, and book purchases. Its ministry has since expanded to develop theological education resources for mission fields in need. This includes arranging experienced lecturers from around the world to teach online and in person, supporting existing local training institutions, and equipping pastors and lay leaders.</p>'+
 '<p>We believe theological education can better equip local coworkers to share the gospel, make disciples, and build churches. To sustain this work, TESC’s main annual expenses fall into three areas:</p>'+
 '<ol><li><strong>Operating costs:</strong> developing four new online courses each year in Hong Kong and sending teachers to serve churches in China and abroad;</li>'+
 '<li><strong>External support:</strong> including approximately HK$1 million for the Chinese theological seminary in Italy to fund student scholarships and other theological education needs;</li>'+
 '<li><strong>Digitisation of Chinese church history documents:</strong> making a concrete, long-term contribution to preservation, research, and teaching. By systematically organising, scanning, cataloguing, and creating searchable digital texts, the project preserves valuable historical books and research resources that might otherwise be lost to paper deterioration, dispersal, or limited circulation.</li></ol>',
 '<p>神学教育服务团创立于2022年，最初是为了协助意大利华人神学院筹募经费，支持教师薪酬、学生助学金及图书购置等需要。其后，事工逐步拓展，进一步为不同有需要的宣教工场开拓神学教育资源，包括安排全球资深讲师通过线上及实体方式开办课程，支持各地现有的人才培育机构，装备当地牧者与信徒领袖。</p>'+
 '<p>我们深信，通过神学教育培训各地同工，能更有效地帮助他们广传福音、培育门徒、建立教会。为持续推动有关事工，本团现时每年主要开支包括三个方面：</p>'+
 '<ol><li><strong>经常性支出：</strong>用于在香港每年开发四门全新的线上课程，并差派教师到国内及海外教会服侍；</li>'+
 '<li><strong>对外支持：</strong>其中包括资助意大利华人神学院约100万港元，以支持学生助学金及其他神学教育需要；</li>'+
 '<li><strong>中国教会史文献数字化计划：</strong>为中国教会史的保存、研究与教学作出具体而长远的贡献。通过系统地整理、扫描、编目及建立可检索的电子文本，保存珍贵的历史书籍与研究资源，避免纸本老化、散佚或流通困难影响后续教学与研究使用。</li></ol>'
);

export function officialAboutEntry():Entry{return {
 id:'00000000-0000-4000-8000-000000000002',kind:'page',slug:'who-we-are',
 title:aboutTitle,description:i18n('','',''),body:aboutBody,data:{},
 status:'published',published_at:'2020-01-01T00:00:00Z',display_order:1,
 featured:false,is_demo:false,is_private:false
};}
