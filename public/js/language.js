/* Silkpath — Chinese-language route dataset. Checked 2026-10-24. All money in CNY.
 *
 * The easy way to China is a short Chinese-language programme. Two ways to pay for it:
 *   1. Scholarship (CLEC "International Chinese Language Teachers Scholarship", formerly the Confucius
 *      Institute Scholarship): tuition + housing + insurance are covered AND ¥2,500 a month is paid to you.
 *   2. Self-funded at a low-cost university (fees below).
 *
 * confidence: 'official'  fee page read on the university's own site
 *             'partial'   figure seen in a search result from the university's domain, or the page is old/unclear
 * intakes[].basis:  'published'  a date for this exact intake is on the page
 *                   'recurring'  the page gives a yearly date or last year's date; expect the same
 *                   'unknown'    no date found — ask admissions
 * null means "not published on the pages I could read"; the engine flags it instead of guessing.
 */
window.SILKPATH_LANG = {
  verifiedOn: '2026-10-24',

  // Size of the all-universities directory (public/js/institutions.js). A test keeps this in sync with the file.
  directory: { count: 2952, asOf: '2026-06-17' },

  scholarship: {
    id: 'clec',
    name: 'International Chinese Language Teachers Scholarship',
    formerly: 'Confucius Institute Scholarship',
    run: 'Center for Language Education and Cooperation (CLEC), China',
    portal: 'https://www.chinese.cn/',
    portalNote: 'Shanghai Jiao Tong University’s 2026 notice says the application system is on CLEC’s site, www.chinese.cn (open since 1 March 2026). Some other universities’ guides still name cis.chinese.cn, which returned “Not Found” when checked on 28 October 2026. If a link does not open, use www.chinese.cn or write to scholarships@chinese.cn.',
    email: 'scholarships@chinese.cn',
    allowanceMonthly: 2500,       // students on one-semester and one-year programmes
    offCampusHousingMonthly: 700, // only if the host university cannot house you
    age: { min: 16, max: 35, on: 'September 1 of the intake year' },
    covers: ['Tuition', 'Shared on-campus housing', 'Comprehensive medical insurance', 'Monthly living allowance (not for four-week study)'],
    notCovered: ['International flights', 'Visa and medical exam fees', 'Textbooks'],
    rules: [
      'Age 16–35 on 1 September of the intake year (in-service Chinese teachers up to 45).',
      'In principle, anyone who received a similar scholarship in the last three years cannot get the one-semester or one-year award again.',
      'Incomplete applications are not processed; results come about three months before the start.'
    ],
    recommender: 'The head of a recommending institution: a Confucius Institute, an HSK test centre, or the Chinese department of a university in your country.',
    tracks: [
      { id: 'semester', label: 'One semester', months: 5, starts: 'September or March', hsk3Min: 180, hskk: 'required', note: 'HSK level 3 with at least 180 points, plus an HSKK score.' },
      { id: 'year', label: 'One academic year (Chinese Language Study)', months: 11, starts: 'September', hsk3Min: 210, hskk: 'priority', note: 'HSK level 3 with at least 210 points. An HSKK score gives priority.' },
      { id: 'year-teacher', label: 'One academic year (International Chinese Language Education)', months: 11, starts: 'September', hsk3Min: 270, hskk: 'required', note: 'For future Chinese teachers: HSK level 3 with at least 270 points, plus HSKK.' }
    ],
    // Student deadlines. "closed" is computed from the date; only the March 2027 one is a confirmed 2026/27 date.
    deadlines: [
      { intake: 'March 2027 (one semester)', studentClose: '2026-10-31', reviewClose: '2026-11-10', basis: 'published' },
      { intake: 'September 2027 (semester or year)', studentClose: '2027-05-15', reviewClose: '2027-05-25', basis: 'recurring', note: 'The September 2026 intake closed on 15 May 2026 and the portal opened on 1 March 2026. Expect the same pattern; CLEC has not published 2027 dates.' }
    ],
    resultsNote: 'Results are published about three months before the programme starts.',
    sources: [
      { label: 'Xiamen University copy of the 2026 CLEC guide (tracks, scores, allowance, dates)', url: 'https://admissions.xmu.edu.cn/Scholarships/International_Chinese_Language_Teachers_Scholars.htm' },
      { label: 'Nankai University: coverage and deadlines', url: 'https://ensie.nankai.edu.cn/info/1077/1132.htm' },
      { label: 'CLEC website (application system)', url: 'https://www.chinese.cn/' },
      { label: 'Shanghai Jiao Tong University 2026 notice (portal, rules)', url: 'https://en.sjtu.edu.cn/news-events/notice/2477' }
    ]
  },

  hskInfo: {
    site: 'https://www.chinesetest.cn',
    note: 'Register for HSK and HSKK on chinesetest.cn. Scores are valid for two years. Whether Ethiopia has a test centre, and its dates, must be confirmed with the Confucius Institute at Addis Ababa University or on chinesetest.cn.'
  },

  /* Universities confirmed (on a 2026 page) to take CLEC scholarship students. The full host list is inside the
   * CLEC portal after you register. Fees for these are not listed because scholarship students do not pay them. */
  hosts: [
    { zh: '厦门大学', en: 'Xiamen University', city: 'Xiamen', province: 'Fujian', tracks: 'One semester, one year', source: 'https://admissions.xmu.edu.cn/Scholarships/International_Chinese_Language_Teachers_Scholars.htm' },
    { zh: '上海交通大学', en: 'Shanghai Jiao Tong University', city: 'Shanghai', province: 'Shanghai', tracks: 'One semester, one year', source: 'https://en.sjtu.edu.cn/news-events/notice/2477' },
    { zh: '北京师范大学', en: 'Beijing Normal University', city: 'Beijing (semester students at the Zhuhai campus)', province: 'Beijing', tracks: 'One semester, one year', source: 'https://admission-is.bnu.edu.cn/jxj/kzxy/index.html' },
    { zh: '天津科技大学', en: 'Tianjin University of Science and Technology', city: 'Tianjin', province: 'Tianjin', tracks: 'One semester (Sep or Mar), one year (Sep)', source: 'https://gjl.tust.edu.cn/docs/2026-03/5f5c676625444f298a5f6725b41bf389.docx' },
    { zh: '华东师范大学', en: 'East China Normal University', city: 'Shanghai', province: 'Shanghai', tracks: 'Language programme', source: 'https://lxs.ecnu.edu.cn/en_scholarship_non_degree_international_chinese_language_teachers_scholarship_language_program/list.htm' },
    { zh: '南开大学', en: 'Nankai University', city: 'Tianjin', province: 'Tianjin', tracks: 'One semester, one year', source: 'https://ensie.nankai.edu.cn/info/1077/1132.htm' },
    { zh: '南京信息工程大学', en: 'Nanjing University of Information Science and Technology', city: 'Nanjing', province: 'Jiangsu', tracks: 'Published a 2026 guide — confirm the language track', source: 'https://gjy.nuist.edu.cn/english/ConfuciusInstituteScholarship/listm.htm' },
    { zh: '中南大学', en: 'Central South University', city: 'Changsha', province: 'Hunan', tracks: 'Published a 2026 guide — confirm the language track', source: 'https://intl.csu.edu.cn/info/1145/3868.htm' }
  ],

  /* Self-funded Chinese-language programmes with published fees. semester/year are tuition. */
  programmes: [
    { id: 'sju', zh: '山东建筑大学', en: 'Shandong Jianzhu University', city: 'Jinan', province: 'Shandong', living: 1800,
      semester: 5000, year: null, app: null, insSem: 400, dormMonthly: 583, dormNote: 'Twin room with bathroom: ¥7,000 a year (shown as ¥583 a month).',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'official', note: 'Cheapest published tuition found. Also offers a 4-week course (¥2,000) and a 3-month course (¥4,400).',
      sources: [{ label: 'Fees', url: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/Fees.htm' }, { label: '2025 prospectus (housing)', url: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/s2025.htm' }] },
    { id: 'qut', zh: '青岛理工大学', en: 'Qingdao University of Technology', city: 'Qingdao', province: 'Shandong', living: 2000,
      semester: 6800, year: null, app: 400, insSem: 400, dormMonthly: 750, dormNote: 'Undergraduate housing is ¥9,000 a year; language-student housing may differ.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-05-31', basis: 'recurring' }],
      clec: null, conf: 'partial', note: 'Applications are said to be accepted year-round.',
      sources: [{ label: 'Admissions', url: 'https://english.qut.edu.cn/Admissions/Undergraduate.htm' }, { label: 'Language centre', url: 'https://english.qut.edu.cn/International/Language_Center.htm' }] },
    { id: 'heu', zh: '哈尔滨工程大学', en: 'Harbin Engineering University', city: 'Harbin', province: 'Heilongjiang', living: 1800,
      semester: 7000, year: null, app: 260, insSem: 400, dormMonthly: 600, dormNote: '¥600 per room per month (a double room can be shared).',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2027-03-01', basis: 'recurring' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-09-01', basis: 'recurring' }],
      clec: null, conf: 'official', note: 'Page dated 2023. Registration windows: 15 Feb – 1 Mar (spring), 15 Aug – 1 Sep (autumn).',
      sources: [{ label: 'Chinese Language Program', url: 'https://studyheu.hrbeu.edu.cn/en/Admission/Chinese_Language_Program.htm' }] },
    { id: 'hit', zh: '哈尔滨工业大学', en: 'Harbin Institute of Technology', city: 'Harbin', province: 'Heilongjiang', living: 1800,
      semester: 7300, year: 14600, app: 500, insSem: 400, dormMonthly: 900, dormNote: '¥800–1,000 per bed per month; utilities extra; a bed is not guaranteed.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2027-01-15', basis: 'published' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-07-15', basis: 'published' }],
      clec: null, conf: 'official', note: '16-week semesters.',
      sources: [{ label: 'Long-term Chinese Language Program', url: 'https://studyathit.hit.edu.cn/LongwtermChineseLanguageProgram/list.htm' }] },
    { id: 'swjtu', zh: '西南交通大学', en: 'Southwest Jiaotong University', city: 'Chengdu', province: 'Sichuan', living: 2200,
      semester: 7000, year: 14000, app: 400, insSem: 400, dormMonthly: 600, dormNote: 'Single room in a three-bedroom international apartment; utilities extra.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2027-01-21', basis: 'recurring' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-06-30', basis: 'recurring' }],
      clec: null, conf: 'official', note: 'Dates are from the 2025/26 page (21 Jan, 30 Jun). A ¥400 registration fee is also listed.',
      sources: [{ label: 'Chinese Language Learning Programs 2025/26', url: 'https://sie.swjtu.edu.cn/info/1087/2572.htm' }] },
    { id: 'nku', zh: '南开大学', en: 'Nankai University', city: 'Tianjin', province: 'Tianjin', living: 2400,
      semester: 7000, year: 14000, app: 400, insSem: 400, dormMonthly: null, dormNote: 'Double rooms at Yiyuan Dormitory; price not published.',
      intakes: [{ term: 'Autumn 2026', start: '2026-09-07', deadline: '2026-06-15', basis: 'published' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-06-15', basis: 'recurring' }],
      clec: 'listed', conf: 'official', note: 'Page lists the CLEC scholarship for its language programme. Four-week summer course ¥3,400.',
      sources: [{ label: '2026 Chinese Language Study Program', url: 'https://ensie.nankai.edu.cn/info/1077/1132.htm' }] },
    { id: 'zust', zh: '浙江科技大学', en: 'Zhejiang University of Science and Technology', city: 'Hangzhou', province: 'Zhejiang', living: 2500,
      semester: 7500, year: 15000, app: 400, insSem: 400, dormMonthly: 600, dormNote: 'Double room ¥600 per person per month; ¥1,000 refundable deposit.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'official', note: '1–4 semesters. Two-month short course ¥4,000.',
      sources: [{ label: 'Fees', url: 'https://ies.zust.edu.cn/StudywithUS/Fees.htm' }] },
    { id: 'jnu', zh: '江南大学', en: 'Jiangnan University', city: 'Wuxi', province: 'Jiangsu', living: 2000,
      semester: 7000, year: 14000, app: 400, insSem: 400, dormMonthly: 250, dormNote: 'Degree-student housing is ¥1,500–3,000 a year; language-student housing may differ.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'Also ¥3,000 per month for shorter stays.',
      sources: [{ label: 'Chinese Language Program', url: 'https://studyabroad.jiangnan.edu.cn/en/Admission/Chinese_Language_Program.htm' }] },
    { id: 'zzu', zh: '郑州大学', en: 'Zhengzhou University', city: 'Zhengzhou', province: 'Henan', living: 1800,
      semester: 7500, year: null, app: null, insSem: 400, dormMonthly: 500, dormNote: '¥5,000–10,000 a year depending on the room.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'The fee page looks old (© 2012). Confirm before applying.',
      sources: [{ label: 'International office', url: 'http://international.zzu.edu.cn/' }] },
    { id: 'lnnu', zh: '辽宁师范大学', en: 'Liaoning Normal University', city: 'Dalian', province: 'Liaoning', living: 2200,
      semester: 8000, year: 15000, app: 400, insSem: 120, dormMonthly: 1200, dormNote: '¥40–80 per day by building and room type (shown at ¥40 a day).',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2027-02-20', basis: 'recurring' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-08-20', basis: 'recurring' }],
      clec: 'listed', conf: 'official', note: 'First-semester total on the page: ¥8,820 (tuition, registration ¥400, insurance ¥120, materials ¥300). Links to the CLEC scholarship.',
      sources: [{ label: 'Chinese Language Program', url: 'https://en.lnnu.edu.cn/PROGRAM/Chinese_Language_Program.htm' }] },
    { id: 'scnu', zh: '华南师范大学', en: 'South China Normal University', city: 'Guangzhou', province: 'Guangdong', living: 2700,
      semester: 8900, year: null, app: 420, insSem: 500, dormMonthly: null, dormNote: 'Housing price not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2027-01-15', basis: 'recurring' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-07-15', basis: 'recurring' }],
      clec: null, conf: 'official', note: 'General programme. The intensive programme is ¥16,500 a semester.',
      sources: [{ label: '2026 Prospectus', url: 'http://english.scnu.edu.cn/a/20260105/1600.html' }] },
    { id: 'scut', zh: '华南理工大学', en: 'South China University of Technology', city: 'Guangzhou', province: 'Guangdong', living: 2700,
      semester: 8500, year: 16200, app: 450, insSem: 400, dormMonthly: null, dormNote: 'Limited beds, first come first served; price not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2026-12-31', basis: 'published' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-06-30', basis: 'recurring' }],
      clec: null, conf: 'official', note: 'Language courses start in early March and early September. After HSK it can lead into a degree.',
      sources: [{ label: 'Admissions Q&A', url: 'https://sie.scut.edu.cn/FQA/list.htm' }, { label: 'Chinese language programmes', url: 'https://sie.scut.edu.cn/p1242c1132/list.htm' }] },
    { id: 'cqu', zh: '重庆大学', en: 'Chongqing University', city: 'Chongqing', province: 'Chongqing', living: 2000,
      semester: 8000, year: null, app: 600, insSem: 400, dormMonthly: null, dormNote: 'Housing price not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'Two search results gave ¥7,000 and ¥8,000 a semester; the higher figure is used.',
      sources: [{ label: 'Application guide', url: 'https://study.cqu.edu.cn/info/1382/2554.htm' }] },
    { id: 'dufe', zh: '东北财经大学', en: 'Dongbei University of Finance and Economics', city: 'Dalian', province: 'Liaoning', living: 2200,
      semester: 8800, year: 16500, app: null, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'Its page mentions scholarships for language students — ask what they cover.',
      sources: [{ label: 'Chinese Language Program', url: 'https://sie.dufe.edu.cn/en/studyad/clp/' }] },
    { id: 'zju', zh: '浙江大学', en: 'Zhejiang University', city: 'Hangzhou', province: 'Zhejiang', living: 2500,
      semester: 9000, year: null, app: 400, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'Non-degree Chinese language and culture programme.',
      sources: [{ label: 'Chinese Language & Culture Programs', url: 'https://iczu.zju.edu.cn/admissionsen/whinesewwanguagewwwwulturewwrograms/list.htm' }] },
    { id: 'shnu', zh: '上海师范大学', en: 'Shanghai Normal University', city: 'Shanghai', province: 'Shanghai', living: 3200,
      semester: 9000, year: null, app: null, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'General programme; intensive is ¥17,000.',
      sources: [{ label: 'Fees & costs', url: 'https://iccs.shnu.edu.cn/en/29466/list.htm' }] },
    { id: 'shu', zh: '上海大学', en: 'Shanghai University', city: 'Shanghai', province: 'Shanghai', living: 3200,
      semester: 9900, year: 19800, app: 500, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'official', note: '',
      sources: [{ label: 'Tuition fee schedule (PDF)', url: 'https://apply.shu.edu.cn/upload/shangda/7/b/4/Tuition%20fee%20related.pdf' }] },
    { id: 'ecust', zh: '华东理工大学', en: 'East China University of Science and Technology', city: 'Shanghai', province: 'Shanghai', living: 3200,
      semester: 9800, year: null, app: 400, insSem: 400, dormMonthly: 2400, dormNote: 'Single room ¥80–110 a day (shown at ¥80 a day).',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'official', note: 'Standard Chinese ¥9,800 a semester; intensive ¥14,000. Fees effective autumn 2025.',
      sources: [{ label: 'Tuition and fees', url: 'https://cie.ecust.edu.cn/notices/165.html' }] },
    { id: 'npu', zh: '西北工业大学', en: 'Northwestern Polytechnical University', city: "Xi'an", province: 'Shaanxi', living: 2000,
      semester: 10000, year: 20000, app: 600, insSem: 400, dormMonthly: 600, dormNote: 'Double room, Youyi campus.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: '2026-12-31', basis: 'recurring' }, { term: 'Autumn 2027', start: '2027-09', deadline: '2027-06-15', basis: 'recurring' }],
      clec: null, conf: 'official', note: 'The spring semester is for students who have already passed HSK 4. Dates are from the 2026 page (31 Dec, 15 Jun).',
      sources: [{ label: '2026 Chinese Language Program', url: 'https://studyat.nwpu.edu.cn/info/1138/9191.htm' }] },
    { id: 'sisu', zh: '上海外国语大学', en: 'Shanghai International Studies University', city: 'Shanghai', province: 'Shanghai', living: 3200,
      semester: 10000, year: null, app: 500, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: '',
      sources: [{ label: 'Non-degree Chinese language programme', url: 'https://www.oisa.shisu.edu.cn/index.php/en/index/lxxm/cid/135.html' }] },
    { id: 'pku', zh: '北京大学', en: 'Peking University', city: 'Beijing', province: 'Beijing', living: 3200,
      semester: 18000, year: null, app: 400, insSem: 400, dormMonthly: null, dormNote: 'Not published.',
      intakes: [{ term: 'Spring 2027', start: '2027-03', deadline: null, basis: 'unknown' }, { term: 'Autumn 2027', start: '2027-09', deadline: null, basis: 'unknown' }],
      clec: null, conf: 'partial', note: 'Shown as a price reference: the most famous name costs about three times the cheapest.',
      sources: [{ label: 'Semester-long Chinese Language Programs', url: 'https://isdplus.pku.edu.cn/HOME/ADMISSION/Non_degree_Programs/Chinese_Language_Programs1/Semester_long_Chinese_Language_Programs.htm' }] }
  ],

  steps: [
    { t: 'Check the rules for you', d: 'Age 16–35, an HSK 3 score of 180+ (210+ for a full year) and an HSKK score. If you do not have these yet, the plan below tells you the fastest way.' },
    { t: 'Learn the basics and pass HSK 3', d: 'Join Chinese classes (ask the Confucius Institute at Addis Ababa University). Register for HSK 3 and HSKK on chinesetest.cn. Scores last two years.' },
    { t: 'Get your recommendation letter', d: 'The head of a Confucius Institute, an HSK test centre, or a university Chinese department signs it. Without it the application cannot go through.' },
    { t: 'Apply on the CLEC site', d: 'Register on www.chinese.cn (the scholarship section), search for your recommending institution and a host university, upload your passport page, HSK/HSKK reports and the recommendation. Results come about three months before the start.' },
    { t: 'Receive your admission documents', d: 'The host university issues the admission notice and JW202 form. Then apply for the X1 visa at the Chinese Embassy or visa centre in Addis Ababa.' },
    { t: 'Fly out, register, collect your first allowance', d: 'Flights are not covered. Register within the first days, apply for the residence permit within 30 days, and the ¥2,500 monthly allowance starts (half a month if you enrol after the 15th).' }
  ]
};
