/* Silkpath dataset — verified 2026-10-22
 *
 * Every figure is in CNY (¥) unless noted. Each university carries:
 *   confidence: 'official'  -> fee/scholarship pages read on the university's own site
 *               'partial'   -> some fields from older pages, search snippets, or category rates
 *               'agency'    -> third-party repost / agency listing only; verify before relying on it
 *   programs[].confirmed    -> false when the programme is expected but not seen on a page I read
 *   null values             -> not published on the pages I could read; the engine falls back to a
 *                              flagged estimate or asks the student to confirm.
 * Nothing here is invented: where a number is an estimate it is named "est" or marked editorial.
 */
window.SILKPATH_DATA = {
  verifiedOn: '2026-10-22',
  rates: { cnyPerUsd: 6.75, etbPerUsd: 160.9, note: 'Mid-market, Aug–Oct 2026. Edit in js/data.js.' },
  defaults: {
    dormEst: 7000,      // used only when a university publishes no dorm price (flagged as estimate in UI)
    applicationEst: 500,
    insurance: 800,
    cscStipendMonthly: 2500, // undergraduate CSC stipend per month (Jiangnan University page)
    academicMonths: 10
  },

  universities: [
    {
      id: 'tongji', name: 'Tongji University', zh: '同济大学', city: 'Shanghai', province: 'Shanghai',
      living: 3200, strength: 5, confidence: 'official',
      site: 'https://study.tongji.edu.cn/', apply: 'https://study.tongji.edu.cn/',
      programs: [
        { id: 'tongji-arch-zh', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 28700, hsk: null, confirmed: true, note: 'Chinese-taught. Duration of 5 years is the typical architecture length — confirm.' },
        { id: 'tongji-arch-en', name: 'Architecture — International Class', field: 'architecture', lang: 'en', years: 4, tuition: 33800, confirmed: true, note: 'English-taught. One listing says 48 months; confirm the length with admissions.' },
        { id: 'tongji-design-zh', name: 'Design & Innovation', field: 'art', lang: 'zh', years: 4, tuition: 28700, hsk: null, confirmed: true, note: 'College of Design and Innovation, Chinese-taught.' }
      ],
      fees: { application: 600, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: [14500, 19350], languageNote: 'Pre-university programme: ¥14,500 (semester 1) + ¥19,350 (semester 2). Older page.', dormNote: 'Dorm price not published in the pages read.' },
      csc: { status: 'confirmed', prep: true, note: 'Listed in older Ministry guidance as an undergraduate preparatory-year institution for CSC students. Confirm the current list.' },
      scholarships: [
        { name: 'Chinese Government Scholarship (CSC)', kind: 'csc', covers: 'full', note: 'Tuition, housing, insurance and monthly stipend. Chinese-taught undergraduates normally start with a prep year.' },
        { name: 'Shanghai Government Scholarship (bachelor)', kind: 'municipal', covers: 'tuition', note: 'Class A covers tuition, housing, insurance and stipend; Class B is partial (mostly tuition). Detail from a third-party summary — confirm on the university page.' }
      ],
      deadlines: [{ label: 'Shanghai Government Scholarship (bachelor)', open: '2026-01-10', close: '2026-03-31', cycle: '2026 cycle' }],
      fastTrack: { status: 'none', label: 'Pre-university (language) programme — intake dates not confirmed' },
      portfolio: null, englishProof: null,
      sources: [
        { label: 'Fees & costs', url: 'https://study.tongji.edu.cn/en/CURRENT_STUDENTS/Free_Costs.htm' },
        { label: 'Shanghai Government Scholarship', url: 'https://study.tongji.edu.cn/info/1088/2632.htm' }
      ]
    },
    {
      id: 'zust', name: 'Zhejiang University of Science and Technology', zh: '浙江科技大学', city: 'Hangzhou', province: 'Zhejiang',
      living: 2500, strength: 3, confidence: 'official',
      site: 'https://ies.zust.edu.cn/', apply: 'https://ies.zust.edu.cn/',
      programs: [
        { id: 'zust-arch-en', name: 'Architecture', field: 'architecture', lang: 'en', years: 5, tuition: 21000, confirmed: true, note: 'English-taught, 5 years.' },
        { id: 'zust-arch-zh', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 17000, hsk: null, confirmed: true, note: 'Chinese-taught; the fee page notes architecture is 5 years.' },
        { id: 'zust-art-zh', name: 'Art & Design', field: 'art', lang: 'zh', years: 4, tuition: 20000, hsk: null, confirmed: true, note: 'Chinese-taught artistic majors.' },
        { id: 'zust-vcd-en', name: 'Visual Communication Design', field: 'art', lang: 'en', years: 4, tuition: 24000, confirmed: true, note: 'English-taught.' }
      ],
      fees: { application: 400, insurance: 800, dormShared: 6000, dormSingle: 12000, languageSemesters: [7500, 7500], languageNote: '¥7,500 per semester (1–4 semesters).', dormNote: 'Double room ¥600/month, single ¥1,200/month × 10 months. Plus refundable ¥1,000 deposit and ¥1,000 electricity prepay.' },
      csc: { status: 'check', prep: false, note: 'Third-party sites list CSC at ZUST. Confirm with ZUST.' },
      scholarships: [
        { name: 'Zhejiang Provincial Government Scholarship (bachelor)', kind: 'provincial', covers: 'partial', amount: 20000, years: 1, note: '¥20,000 for undergraduates; age limit applies (under 30 on ZUST’s notice).' },
        { name: 'Outstanding Freshman Scholarship', kind: 'university', covers: 'tuition', pct: 100, years: 1, note: 'Waives 100%, 70% or 50% of first-year tuition. Under 25. Needs pre-admission. 2026 window Jan 18 – May 30.' }
      ],
      deadlines: [{ label: 'Outstanding Freshman Scholarship', open: '2026-01-18', close: '2026-05-30', cycle: '2026 cycle' }],
      fastTrack: { status: 'reported', label: 'A March intake is reported by an agency page — confirm with ZUST before relying on it' },
      portfolio: null, englishProof: null,
      sources: [
        { label: 'Fee schedule', url: 'https://ies.zust.edu.cn/StudywithUS/Fees.htm' },
        { label: 'Fee details', url: 'https://ies.zust.edu.cn/info/1244/3822.htm' },
        { label: 'Notices', url: 'https://ies.zust.edu.cn/info/1271/4218.htm' }
      ]
    },
    {
      id: 'scut', name: 'South China University of Technology', zh: '华南理工大学', city: 'Guangzhou', province: 'Guangdong',
      living: 2700, strength: 4, confidence: 'partial',
      site: 'https://sie.scut.edu.cn/', apply: 'https://www.scut.edu.cn/apply',
      programs: [
        { id: 'scut-arch-zh', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: null, hsk: null, confirmed: true, note: 'School of Architecture lists Architecture, Urban & Rural Planning, Landscape Architecture. Undergraduate tuition not found on the pages read — ask admissions.' }
      ],
      fees: { application: 450, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: [8100, 8100], languageNote: '¥8,500 per semester or ¥16,200 per year.', dormNote: 'Dorm price page not readable; limited on-campus beds, first come first served.' },
      csc: { status: 'confirmed', prep: true, note: 'SCUT states it is authorised to give CSC undergraduates their preparatory year. Undergraduate CSC applicants apply via the embassy and the SCUT online system.' },
      scholarships: [
        { name: 'Chinese Government Scholarship (CSC)', kind: 'csc', covers: 'full', note: 'CSC deadline normally March 31.' },
        { name: 'SCUT International Scholarship for Excellence', kind: 'university', covers: 'tuition', pct: 100, years: 'all', note: 'Comprehensive or partial tuition waiver for the standard programme length. No separate application — chosen from self-funded applicants.' },
        { name: 'Guangdong Government Outstanding International Student Scholarship', kind: 'provincial', covers: 'partial', amount: null, note: 'Amount not stated on SCUT’s page (¥10,000 per year at Shenzhen University).' }
      ],
      deadlines: [
        { label: 'Chinese Language Programme — spring intake', open: null, close: '2026-12-31', cycle: 'Current notice — confirm' },
        { label: 'Undergraduate degree programmes', open: null, close: '2026-06-30', cycle: '2026 cycle (last)' },
        { label: 'CSC (undergraduate)', open: null, close: '2026-03-31', cycle: '2026 cycle (last)' }
      ],
      fastTrack: { status: 'verified', label: 'Chinese Language Programme, spring intake (starts early March)', deadline: '2026-12-31' },
      portfolio: null, englishProof: null,
      sources: [
        { label: 'Admissions Q&A (fees, dates, scholarships)', url: 'https://sie.scut.edu.cn/FQA/list.htm' },
        { label: 'Scholarship for Excellence', url: 'https://sie.scut.edu.cn/29046/list.htm' },
        { label: 'Chinese language programmes', url: 'https://sie.scut.edu.cn/p1242c1132/list.htm' }
      ]
    },
    {
      id: 'tju', name: 'Tianjin University', zh: '天津大学', city: 'Tianjin', province: 'Tianjin',
      living: 2400, strength: 5, confidence: 'partial',
      site: 'https://en.tju.edu.cn/Admissions1/Undergraduates.htm', apply: 'https://en.tju.edu.cn/Admissions1/Undergraduates.htm',
      programs: [
        { id: 'tju-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 26000, hsk: 5, confirmed: true, note: '“Special major” rate of ¥26,000 (architecture, planning, landscape, software engineering). The university states programmes are delivered in Chinese or English; HSK 5 for Chinese-taught.' }
      ],
      fees: { application: null, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: null, languageNote: 'Language fee not found.', dormNote: 'Not found.' },
      csc: { status: 'confirmed', prep: true, note: 'Listed in older Ministry guidance as an undergraduate preparatory-year institution. Confirm the current list.' },
      scholarships: [
        { name: 'Government, Tianjin University and enterprise scholarships', kind: 'university', covers: 'partial', amount: null, note: 'The university says a large share of bachelor’s students receive scholarships. Amounts not found.' },
        { name: 'Chinese Government Scholarship (CSC)', kind: 'csc', covers: 'full', note: 'Apply via CSC; confirm quota for undergraduates.' }
      ],
      deadlines: [{ label: 'Undergraduate applications', open: null, close: '2026-05-31', cycle: '2026 cycle (last)' }],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [
        { label: 'Undergraduate admissions', url: 'https://en.tju.edu.cn/Admissions1/Undergraduates.htm' },
        { label: 'International School of Education', url: 'https://sie.tju.edu.cn/en/xwxm/UNDERGRADUATE/202510/t20251013_324445.html' }
      ]
    },
    {
      id: 'cqu', name: 'Chongqing University', zh: '重庆大学', city: 'Chongqing', province: 'Chongqing',
      living: 2000, strength: 4, confidence: 'partial',
      site: 'https://study.cqu.edu.cn/', apply: 'https://study.cqu.edu.cn/',
      programs: [
        { id: 'cqu-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 18000, tuitionMax: 22000, hsk: 4, confirmed: true, note: 'Chinese-taught programmes ¥18,000–22,000 (2026 guide); architecture runs 5 years; HSK 4 (210) required.' }
      ],
      fees: { application: 600, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: null, languageNote: 'Language fee not found.', dormNote: 'Not found.' },
      csc: { status: 'check', prep: false, note: 'Confirm CSC quota for undergraduates.' },
      scholarships: [
        { name: 'CQU President Scholarship', kind: 'university', covers: 'tuition', pct: 100, years: 'all', note: 'Covers tuition; ¥1,500/month stipend for bachelor’s (2022 notice). In 2025 only second- and third-class awards were offered — expect partial.' },
        { name: 'Chongqing Municipal Government Scholarship', kind: 'municipal', covers: 'partial', amount: null, note: 'Partial award; amount not confirmed.' }
      ],
      deadlines: [{ label: 'President Scholarship', open: null, close: '2026-04-25', cycle: '2026 cycle (third-party date)' }],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [
        { label: '2026 undergraduate application guide', url: 'https://study.cqu.edu.cn/info/1887/2789.htm' },
        { label: 'President Scholarship', url: 'https://chongjian.cqu.edu.cn/English/Admission/Scholarships/Chongqing_University_President_Scholarship.htm' }
      ]
    },
    {
      id: 'jnu', name: 'Jiangnan University', zh: '江南大学', city: 'Wuxi', province: 'Jiangsu',
      living: 2000, strength: 4, confidence: 'official',
      site: 'https://studyabroad.jiangnan.edu.cn/', apply: 'https://jiangnan.17gz.org/',
      programs: [
        { id: 'jnu-design-zh', name: 'Design', field: 'art', lang: 'zh', years: 4, tuition: 16400, hsk: 4, confirmed: true, note: 'Chinese-taught. Portfolio of at least 3 works required.' }
      ],
      fees: { application: 400, insurance: 800, dormShared: 3000, dormSingle: null, languageSemesters: [7000, 7000], languageNote: '¥7,000 per semester or ¥3,000 per month.', dormNote: '¥3,000/yr at Lihu campus; ¥1,500/yr at Xiakewan campus.' },
      csc: { status: 'confirmed', prep: false, note: 'CSC Bilateral Programme is open to undergraduates; Design is an eligible field.' },
      scholarships: [
        { name: 'CSC Bilateral Programme', kind: 'csc', covers: 'full', note: 'Tuition, on-campus housing, insurance and ¥2,500/month for undergraduates. Window Nov 1 – Mar 31.' },
        { name: 'Jiangsu Provincial Government Scholarship', kind: 'provincial', covers: 'partial', amount: null, note: 'Amount not stated.' },
        { name: 'Gong Tiecheng Scholarship', kind: 'university', covers: 'partial', amount: null, note: 'For undergraduates from Belt and Road countries with excellent records.' }
      ],
      deadlines: [
        { label: 'Degree applications (and CSCA registration screenshot Jun 28)', open: null, close: '2026-06-30', cycle: '2026 cycle (last)' },
        { label: 'CSC Bilateral Programme', open: '2025-11-01', close: '2026-03-31', cycle: '2026 cycle (last)' }
      ],
      fastTrack: { status: 'none', label: '' },
      portfolio: true, englishProof: 'IELTS 5.5+, TOEFL 75+ or CEFR B2 for English-taught programmes',
      sources: [
        { label: 'Bachelor programme: fees, dates, requirements', url: 'https://studyabroad.jiangnan.edu.cn/en/Admission/Bachelor_Program.htm' },
        { label: 'CSC Bilateral Programme', url: 'https://studyabroad.jiangnan.edu.cn/en/Scholarship/CSC_Scholarship_Bilateral_Program_.htm' }
      ]
    },
    {
      id: 'sfai', name: 'Sichuan Fine Arts Institute', zh: '四川美术学院', city: 'Chongqing', province: 'Chongqing',
      living: 2000, strength: 4, confidence: 'agency',
      site: 'https://www.scfai.edu.cn/', apply: 'mailto:guojichu@scfai.edu.cn',
      programs: [
        { id: 'sfai-design', name: 'Design (visual communication, environmental, product…)', field: 'art', lang: 'zh', years: 4, tuition: 20000, hsk: 4, confirmed: true, note: 'Many art and design majors; portfolio required.' },
        { id: 'sfai-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 20000, hsk: 4, confirmed: true, note: 'Five-year programme; portfolio required.' }
      ],
      fees: { application: null, insurance: 800, dormShared: 9000, dormSingle: 10000, languageSemesters: [3500, 3500], languageNote: 'Chinese lessons ¥7,000 per school year.', dormNote: '¥900–1,000 per month.' },
      csc: { status: 'check', prep: false, note: 'Not mentioned in the guide I read.' },
      scholarships: [
        { name: 'Chongqing Municipal Government Mayor Scholarship', kind: 'municipal', covers: 'partial', amount: null, note: 'Under 25. Amount not stated.' }
      ],
      deadlines: [{ label: 'Overseas undergraduate applications', open: '2026-03-10', close: '2026-05-31', cycle: '2026 cycle (last)' }],
      fastTrack: { status: 'none', label: 'If your Chinese is below HSK 4 the Institute gives a one-year Chinese course first' },
      portfolio: true, englishProof: null,
      sources: [
        { label: 'Enrollment guide (third-party repost of the official guide)', url: 'https://wentchina.com/sichuan-fine-arts-institute-enrollment-guide/' },
        { label: 'Official site', url: 'https://www.scfai.edu.cn/' }
      ]
    },
    {
      id: 'szu', name: 'Shenzhen University', zh: '深圳大学', city: 'Shenzhen', province: 'Guangdong',
      living: 3200, strength: 4, confidence: 'official',
      site: 'https://lxs.szu.edu.cn/', apply: 'https://status.szu.edu.cn/szulxs/stuzs/stuLogin.action?fpage_id=216',
      programs: [
        { id: 'szu-arts', name: 'Arts programmes (category rate)', field: 'art', lang: 'zh', years: 4, tuition: 40000, hsk: 5, confirmed: true, note: 'Arts are in the ¥40,000 tier; HSK 5 (180+) for arts. Specific majors are in the 2026 programme list. Fine-art applicants may need a specialised test.' }
      ],
      fees: { application: 400, insurance: 800, dormShared: 1500, dormSingle: 4800, languageSemesters: null, languageNote: 'Not mentioned in the 2026 brochure.', dormNote: 'Lihu campus four-bed ¥750/semester; Yuehai campus rooms ¥2,400–8,000/semester.' },
      csc: { status: 'check', prep: false, note: 'Not stated in the brochure.' },
      scholarships: [
        { name: 'Liyuan International Scholarship', kind: 'university', covers: 'tuition', pct: 100, years: 'all', note: '1st class: full tuition + ¥1,000/month; 2nd: full tuition; 3rd: 50% tuition.' },
        { name: 'Guangdong Government Outstanding International Student Scholarship', kind: 'provincial', covers: 'partial', amount: 10000, years: 'all', note: '¥10,000 per year.' }
      ],
      deadlines: [
        { label: 'Round 1', open: '2026-01-01', close: '2026-03-20', cycle: '2026 cycle (last)' },
        { label: 'Round 2', open: '2026-03-20', close: '2026-05-31', cycle: '2026 cycle (last)' }
      ],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [{ label: '2026 admission brochure', url: 'https://en.szu.edu.cn/info/1023/1903.htm' }]
    },
    {
      id: 'shu', name: 'Shanghai University', zh: '上海大学', city: 'Shanghai', province: 'Shanghai',
      living: 3200, strength: 4, confidence: 'official',
      site: 'https://apply.shu.edu.cn/', apply: 'https://apply.shu.edu.cn/',
      programs: [
        { id: 'shu-art', name: 'Art programmes', field: 'art', lang: 'zh', years: 4, tuition: 32000, hsk: null, confirmed: true, note: 'Chinese-taught, Art category.' }
      ],
      fees: { application: 500, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: [9900, 9900], languageNote: '¥9,900 per semester.', dormNote: 'Not found.' },
      csc: { status: 'check', prep: false, note: 'Confirm CSC / Shanghai Government Scholarship eligibility.' },
      scholarships: [],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [{ label: 'Tuition fee schedule (PDF)', url: 'https://apply.shu.edu.cn/upload/shangda/7/b/4/Tuition%20fee%20related.pdf' }]
    },
    {
      id: 'ecust', name: 'East China University of Science and Technology', zh: '华东理工大学', city: 'Shanghai', province: 'Shanghai',
      living: 3200, strength: 3, confidence: 'official',
      site: 'https://cie.ecust.edu.cn/', apply: 'https://cie.ecust.edu.cn/',
      programs: [
        { id: 'ecust-art', name: 'Art programmes', field: 'art', lang: 'zh', years: 4, tuition: 30000, hsk: null, confirmed: true, note: 'Chinese-taught art undergraduate; fee effective autumn 2025.' }
      ],
      fees: { application: 600, insurance: 800, dormShared: null, dormSingle: 24000, languageSemesters: [9800, 9800], languageNote: 'Standard Chinese ¥9,800 per semester.', dormNote: 'Single room only: ¥80–110 per day (≈ ¥24,000 over 10 months at ¥80).' },
      csc: { status: 'check', prep: false, note: 'CSC holders’ insurance is covered; confirm undergraduate quota.' },
      scholarships: [],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [{ label: 'Tuition and fees notice', url: 'https://cie.ecust.edu.cn/notices/165.html' }]
    },
    {
      id: 'sues', name: 'Shanghai University of Engineering Science', zh: '上海工程技术大学', city: 'Shanghai', province: 'Shanghai',
      living: 3200, strength: 2, confidence: 'partial',
      site: 'https://cie.sues.edu.cn/', apply: 'https://cie.sues.edu.cn/',
      programs: [
        { id: 'sues-art', name: 'Art Design / Fashion Design', field: 'art', lang: 'zh', years: 4, tuition: 23000, tuitionMax: 39000, hsk: null, confirmed: true, note: 'Artistic majors ¥23,000–39,000 depending on major.' }
      ],
      fees: { application: null, insurance: 800, dormShared: 1200, dormSingle: null, languageSemesters: null, languageNote: 'Listed on a separate page.', dormNote: 'Four-bed room ¥1,200 as listed — confirm the period (per year).' },
      csc: { status: 'check', prep: false, note: 'Designated institution for the Shanghai Municipal Government Scholarship (search result).' },
      scholarships: [{ name: 'Shanghai Municipal Government Scholarship', kind: 'municipal', covers: 'partial', amount: null, note: 'SUES is a designated institution. Terms not confirmed.' }],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [{ label: 'Tuition & fees', url: 'https://cie.sues.edu.cn/global/wuitionwwwwees/list.htm' }]
    },
    {
      id: 'qut', name: 'Qingdao University of Technology', zh: '青岛理工大学', city: 'Qingdao', province: 'Shandong',
      living: 2000, strength: 3, confidence: 'partial',
      site: 'https://english.qut.edu.cn/Admissions/Undergraduate.htm', apply: 'https://english.qut.edu.cn/Admissions/Undergraduate.htm',
      programs: [
        { id: 'qut-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 17000, hsk: 4, confirmed: false, note: 'School of Architecture and Urban Planning exists; the international undergraduate list was not confirmed. ¥17,000 is the general undergraduate rate.' },
        { id: 'qut-art', name: 'Art & Design', field: 'art', lang: 'zh', years: 4, tuition: 17000, hsk: 4, confirmed: false, note: 'School of Arts exists; international list not confirmed. Art may carry a surcharge — ask.' }
      ],
      fees: { application: 400, insurance: 800, dormShared: 9000, dormSingle: null, languageSemesters: [6800, 6800], languageNote: '¥6,800 per semester (language centre page).', dormNote: '¥9,000 per year.' },
      csc: { status: 'check', prep: false, note: 'Not stated.' },
      scholarships: [
        { name: 'QUT University Scholarship', kind: 'university', covers: 'partial', amount: 26000, years: 'all', note: 'Up to ¥26,000 per year (tuition + accommodation).' },
        { name: 'Shandong Provincial Government Scholarship', kind: 'provincial', covers: 'partial', amount: null, note: 'Amount not stated.' }
      ],
      deadlines: [{ label: 'Fall intake materials', open: null, close: '2026-05-31', cycle: '2026 cycle; applications said to be accepted year-round' }],
      fastTrack: { status: 'reported', label: 'Applications are said to be accepted year-round — confirm intake dates with QUT' },
      portfolio: null, englishProof: null,
      sources: [{ label: 'Undergraduate admissions', url: 'https://english.qut.edu.cn/Admissions/Undergraduate.htm' }]
    },
    {
      id: 'sju', name: 'Shandong Jianzhu University', zh: '山东建筑大学', city: 'Jinan', province: 'Shandong',
      living: 1800, strength: 3, confidence: 'partial',
      site: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/Fees.htm', apply: 'https://sdjzu.17gz.org',
      programs: [
        { id: 'sju-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 16000, tuitionMax: 18000, hsk: 4, confirmed: false, note: 'The fee page does not name architecture; it falls under “all other programmes” (¥16,000 liberal arts / ¥18,000 science & engineering). Confirm the programme and rate.' },
        { id: 'sju-art', name: 'Art & Design', field: 'art', lang: 'zh', years: 4, tuition: 16000, tuitionMax: 18000, hsk: 4, confirmed: false, note: 'Same: “all other programmes”. Confirm the programme and rate.' }
      ],
      fees: { application: null, insurance: 800, dormShared: 7000, dormSingle: null, languageSemesters: [5000, 5000], languageNote: '¥5,000 per semester.', dormNote: 'Twin room with bathroom ¥7,000 per year.' },
      csc: { status: 'check', prep: false, note: 'Not stated.' },
      scholarships: [
        { name: 'Shandong Provincial Government Scholarship', kind: 'provincial', covers: 'partial', amount: null, note: 'Application form is part of the application pack.' },
        { name: 'University scholarship / Jinan Sister-City scholarship', kind: 'university', covers: 'partial', amount: null, note: 'Levels and amounts not stated.' }
      ],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: 'English proof is waived if your previous degree was taught in English (certificate from your university)',
      sources: [
        { label: 'Fees', url: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/Fees.htm' },
        { label: '2025 prospectus', url: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/s2025.htm' },
        { label: 'Application material', url: 'https://www.sdjzu.edu.cn/english/International_Admissions/Academic_Education/Application_material.htm' }
      ]
    },
    {
      id: 'seu', name: 'Southeast University', zh: '东南大学', city: 'Nanjing', province: 'Jiangsu',
      living: 2400, strength: 5, confidence: 'partial',
      site: 'https://cis.seu.edu.cn/', apply: 'https://cis.seu.edu.cn/',
      programs: [
        { id: 'seu-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 25000, tuitionMax: 30000, hsk: null, confirmed: false, note: 'Range from older pages (2019–2020); confirm current fee and language.' }
      ],
      fees: { application: 400, insurance: 800, dormShared: 6000, dormSingle: null, languageSemesters: null, languageNote: 'Students below the programme’s HSK level study Chinese first (placement test).', dormNote: 'About ¥6,000 per academic year; water and electricity extra.' },
      csc: { status: 'confirmed', prep: false, note: 'CSC listed for undergraduates.' },
      scholarships: [
        { name: 'Chinese Government Scholarship (CSC)', kind: 'csc', covers: 'full', note: 'Older page: full award = all tuition + monthly allowance.' },
        { name: 'Jiangsu Jasmine Scholarship / Nanjing Municipal Government Scholarship', kind: 'provincial', covers: 'partial', amount: null, note: 'Listed for undergraduates; amounts not stated.' },
        { name: 'SEU President Scholarship', kind: 'university', covers: 'partial', amount: null, note: 'Listed for undergraduates; amounts not stated.' }
      ],
      deadlines: [{ label: 'Application period (older page)', open: '2026-03-15', close: '2026-06-30', cycle: 'Older page — may vary by programme' }],
      fastTrack: { status: 'none', label: '' },
      portfolio: null, englishProof: null,
      sources: [
        { label: 'Scholarships', url: 'https://cis.seu.edu.cn/hwenglish/13931/list.htm' },
        { label: 'Enrollment & dorm cost', url: 'https://cis.seu.edu.cn/hwenglish/Enrollment/list.htm' },
        { label: 'Undergraduate notice (2020)', url: 'https://cis.seu.edu.cn/2019/1126/c14469a296284/page.htm' }
      ]
    },
    {
      id: 'caa', name: 'China Academy of Art', zh: '中国美术学院', city: 'Hangzhou', province: 'Zhejiang',
      living: 2500, strength: 5, confidence: 'agency',
      site: 'https://www.caa.edu.cn/', apply: 'https://www.caa.edu.cn/',
      programs: [
        { id: 'caa-art', name: 'Art & Design programmes', field: 'art', lang: 'zh', years: 4, tuition: 52000, hsk: null, confirmed: false, note: 'Fee from aggregator sites only. Mostly Chinese-taught; portfolio and online interview.' },
        { id: 'caa-arch', name: 'Architecture', field: 'architecture', lang: 'zh', years: 5, tuition: 52000, hsk: null, confirmed: false, note: 'Fee from aggregator sites only; five years.' }
      ],
      fees: { application: 800, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: null, languageNote: 'Not found.', dormNote: 'Not found.' },
      csc: { status: 'check', prep: false, note: 'Not confirmed.' },
      scholarships: [],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: true, englishProof: null,
      sources: [{ label: 'Aggregator guide (verify on the official site)', url: 'https://applyforchina.com/universities/china-academy-of-art-guide/' }]
    },
    {
      id: 'cafa', name: 'Central Academy of Fine Arts', zh: '中央美术学院', city: 'Beijing', province: 'Beijing',
      living: 3200, strength: 5, confidence: 'agency',
      site: 'https://www.cafa.edu.cn/', apply: 'https://www.cafa.edu.cn/',
      programs: [
        { id: 'cafa-art', name: 'Art & Design programmes', field: 'art', lang: 'zh', years: 4, tuition: 52000, hsk: null, confirmed: false, note: 'Fee from aggregator sites only. Preparatory courses for foreign students are reported.' }
      ],
      fees: { application: null, insurance: 800, dormShared: null, dormSingle: null, languageSemesters: null, languageNote: 'Preparatory courses reported — fee not found.', dormNote: 'Not found.' },
      csc: { status: 'check', prep: false, note: 'Scholarships reported to be tied to Chinese government scholarship holders.' },
      scholarships: [],
      deadlines: [],
      fastTrack: { status: 'none', label: '' },
      portfolio: true, englishProof: null,
      sources: [{ label: 'Aggregator guide (verify on the official site)', url: 'https://applyforchina.com/universities/central-academy-of-fine-arts-beijing/' }]
    }
  ],

  /* ---------- Guide content (Ethiopia-specific) ---------- */
  routes: [
    {
      id: 'csc-a', name: 'CSC Type A — through Ethiopia', best: 'Free everything, including the language year',
      body: 'Ethiopia receives a bilateral quota. The Ministry of Education announces the call (reported Nov–Feb), shortlists candidates and forwards them. You still complete the CSC online application at campuschina.org. I could not find the 2026/27 Ethiopia notice or agency number — ask the Ministry of Education and the Chinese Embassy in Addis Ababa.',
      status: 'Dates unconfirmed for 2027 entry'
    },
    {
      id: 'csc-b', name: 'CSC Type B — through a university', best: 'Free tuition, housing, insurance + monthly stipend',
      body: 'Apply to a university that holds CSC quota, then submit the CSC online form with that university’s agency number. For 2026/27 entry, first-batch windows ran Nov 1 – late Feb and many schools closed in March. Bachelor’s applicants also need a CSCA score.',
      status: 'Next cycle expected to open around Nov–Dec 2026 (unconfirmed)'
    },
    {
      id: 'uni', name: 'University or provincial scholarship', best: 'Partial to full tuition waiver',
      body: 'Self-funded applicants are often considered automatically (SCUT, ZUST, SZU, QUT). Provincial awards (Zhejiang ¥20,000, Guangdong ¥10,000, Shanghai) usually need a separate form after pre-admission.',
      status: 'Windows usually Jan–Jun'
    },
    {
      id: 'self', name: 'Self-funded', best: 'Fastest start — you choose the intake',
      body: 'Some universities accept applications through the year and run Chinese-language programmes in both March and September. This is the quickest way to arrive in 2027, then switch to a degree programme.',
      status: 'Open now at some universities'
    }
  ],

  docs: [
    { key: 'passport', label: 'Passport (valid 18+ months, information page scan)', all: true },
    { key: 'certificate', label: 'Grade 12 (ESSLCE) certificate and transcript', all: true, tip: 'If you hold a degree, prepare it as well. Documents not in Chinese or English need a notarised translation.' },
    { key: 'translation', label: 'Notarised translation / authentication of certificates', all: true, tip: 'Confirm the legalisation steps with the Chinese Embassy in Addis Ababa — rules differ by university.' },
    { key: 'photo', label: 'Passport-size photo (white background)', all: true },
    { key: 'plan', label: 'Study plan or personal statement (200–500 words)', all: true },
    { key: 'recs', label: 'Two recommendation letters (if asked)', all: false },
    { key: 'medical', label: 'Foreigner Physical Examination Form, stamped by a hospital', all: true },
    { key: 'police', label: 'Police clearance (non-criminal record)', all: true },
    { key: 'bank', label: 'Bank statement or guarantor letter (self-funded)', all: false },
    { key: 'csca', label: 'CSCA score report (Math compulsory)', all: true, tip: 'Sessions: Jan, Mar, Apr, Jun, Dec. January and March sessions suit Africa. Register at csca.cn.' },
    { key: 'hsk', label: 'HSK certificate (Chinese-taught programmes)', all: false, tip: 'HSK 4 is common; arts at some schools ask HSK 5. Valid for two years.' },
    { key: 'english', label: 'English proof (IELTS/TOEFL or English-medium letter)', all: false },
    { key: 'portfolio', label: 'Portfolio — at least 3 works (art, design, architecture)', all: false, tip: 'Label each work with title, size and medium. Do not reuse identical pieces for design and architecture.' }
  ],

  steps: [
    { t: 'Choose 3–5 universities', d: 'Use Discover. Include one safe, one stretch and one scholarship-first option.' },
    { t: 'Register for CSCA', d: 'Needed for bachelor’s scholarship applications. English-taught programmes skip Professional Chinese but Math is still required.' },
    { t: 'Prepare documents', d: 'Use My plan to track every document. Notarised translations take the longest.' },
    { t: 'Apply on the official portal', d: 'Use the university’s own portal, and campuschina.org for CSC. Never pay an agent for a “guaranteed” scholarship.' },
    { t: 'Receive admission notice and JW201/JW202', d: 'Some universities ask for a tuition deposit first (for example ¥3,000 at Jiangnan).' },
    { t: 'Apply for the X1 visa', d: 'At the Chinese Embassy / visa centre in Addis Ababa.' },
    { t: 'Arrive and register', d: 'Residence permit within 30 days of arrival (Southeast University lists ¥400/yr for 1–2 years).' }
  ]
};
