/* Silkpath — Canada dataset. Checked 2026-10-24. Money in CAD unless noted.
 *
 * Canada is the hardest route in this app. Read `reality` first: new study-permit applications are refused more
 * often than approved, you must show living funds plus a year of tuition up front, and the big scholarships are
 * for a handful of students nominated by their school or chosen by need.
 *
 * conf: 'official' = read on the university's or the Government of Canada's own page
 *       'partial'  = figure seen in a search result from the official domain, or the page is a summary
 * null = not found on the pages I could read (never guessed).
 */
window.SILKPATH_CANADA = {
  verifiedOn: '2026-10-24',
  cadPerUsd: 1.41, // mid-2026 estimate; edit when it moves

  reality: {
    fundsLiving: 23448,       // IRCC: single applicant outside Quebec, applications on/after 1 Sep 2026
    fundsLivingBefore: 22895, // applications 1 Jan 2025 – 31 Aug 2026
    fundsQuebecNote: 'Quebec sets its own figure (CAD 24,617 for one person from 1 Jan 2026 per news reports) and needs a Quebec Acceptance Certificate first.',
    refusalNew2025: 59, refusalNew2024: 52, // % of new study-permit applications refused (IRCC briefing, April 2026)
    cap2026: 408000, capNewArrivals2026: 155000, palSpaces2026: 180000,
    workHoursOffCampus: 24,
    facts: [
      'You must show at least CAD 23,448 for living costs, plus the first year of tuition, plus return travel. The living amount is for one person outside Quebec (applications from 1 September 2026).',
      'IRCC refused 59% of new study-permit applications in 2025 (52% in 2024). Ethiopia-specific figures are not published.',
      'Canada capped new arrivals at 155,000 for 2026. Undergraduates also need a provincial attestation letter (PAL) from their school; master’s and PhD students at public institutions no longer do (since 1 January 2026).',
      'The Student Direct Stream, which used to speed up some applications, has been ended.',
      'Off-campus work is limited to 24 hours a week during term.',
      'IRCC checks every acceptance letter with the school.'
    ],
    sources: [
      { label: 'Proof of funds (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html' },
      { label: 'Provincial attestation letter (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/provincial-attestation-letter.html' },
      { label: 'International students briefing, April 2026 (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/committees/secu-apr-30-2026/international-students.html' },
      { label: '2026 allocations under the cap (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/2026-provincial-territorial-allocations-under-international-student-cap.html' },
      { label: 'Designated learning institutions list (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html' }
    ]
  },

  // who the student is: finalYear | earlierGrad | bachelor | master
  situations: [
    { id: 'finalYear', label: 'In my last year of high school (or finished in 2026)' },
    { id: 'earlierGrad', label: 'Finished high school earlier, no degree yet' },
    { id: 'bachelor', label: 'I already have a bachelor’s degree' },
    { id: 'master', label: 'I already have a master’s degree' }
  ],

  scholarships: [
    { id: 'pearson', name: 'Lester B. Pearson International Scholarship', uni: 'University of Toronto', fullRide: true, annualMax: null, years: 4, totalMax: null, count: 37,
      valueNote: 'Tuition, books, incidental fees and four years of residence.', basis: 'Merit and leadership', nomination: 'Your own secondary school must nominate you (one student per school per year).', auto: false,
      for: ['finalYear'], rule: 'Final year of secondary school in 2026/27, or graduated no earlier than June 2026; no earlier post-secondary study.',
      deadlines: [{ label: 'School nomination (Sept 2027 entry)', date: '2026-10-09', basis: 'published' }, { label: 'Admission application (OUAC)', date: '2026-10-16', basis: 'published' }, { label: 'Scholarship application', date: '2026-11-06', basis: 'published' }],
      note: 'About 37 awards a year worldwide. The 2027-entry nomination deadline has passed; the next cycle is for September 2028 entry. U of T warns that it works with no recruitment agents.', conf: 'official',
      sources: [{ label: 'Pearson scholarship page', url: 'https://future.utoronto.ca/pearson/about/' }] },
    { id: 'ubc-isp', name: 'UBC International Scholars Program (includes the Karen McKellin International Leader of Tomorrow Award)', uni: 'University of British Columbia', fullRide: true, annualMax: null, years: 4, totalMax: null, count: null,
      valueNote: 'Up to the full cost of the programme and living expenses; renewable to graduation.', basis: 'Merit, leadership and financial need', nomination: 'Older UBC packages let a school nominate up to two students; current rules not confirmed.', auto: null,
      for: ['finalYear', 'earlierGrad'], rule: 'First-entry undergraduate with significant financial need and strong leadership.',
      deadlines: [], note: 'UBC says you do not choose the award: the programme matches you from your admission application. Very competitive (one recipient reported competing against 1,500+ students).', conf: 'partial',
      sources: [{ label: 'UBC International Scholars', url: 'https://you.ubc.ca/financial-planning/scholarships-awards-international-students/international-scholars/' }] },
    { id: 'ualberta-pids', name: 'President’s International Distinction Scholarship', uni: 'University of Alberta', fullRide: false, annualMax: 30000, years: 4, totalMax: 120000, count: 25,
      valueNote: 'Up to CAD 120,000, paid over four years.', basis: 'Superior admission average and leadership', nomination: null, auto: null,
      for: ['finalYear', 'earlierGrad'], rule: 'Entering first-year undergraduate study on a study permit.',
      deadlines: [], note: 'Also: International Leader Scholarship, up to CAD 15,000. Renewal terms were not stated on the page.', conf: 'partial',
      sources: [{ label: 'International entrance scholarships', url: 'https://www.ualberta.ca/en/admissions/tuition-and-scholarships/international-entrance-scholarships/index.html' }] },
    { id: 'mcmaster-excellence', name: 'McMaster University Award of Excellence (Engineering, Computer Science, iBioMed, B.Tech)', uni: 'McMaster University', fullRide: false, annualMax: 35000, years: 4, totalMax: 140000, count: 5,
      valueNote: 'CAD 35,000 a year for four years; renewable.', basis: 'Application and reference letters (AwardSpring)', nomination: null, auto: false,
      for: ['finalYear', 'earlierGrad'], rule: 'Entering Level 1 as an international fee-paying student.',
      deadlines: [{ label: 'Application', date: '2027-02-19', basis: 'published' }, { label: 'Reference letters', date: '2027-02-21', basis: 'published' }],
      note: 'Five awards. McMaster’s Engineering international scholar awards add CAD 10,000 one-time, automatically.', conf: 'official',
      sources: [{ label: 'Engineering entrance scholarships', url: 'https://www.eng.mcmaster.ca/future-students/future-undergraduate-students/undergraduate-entrance-scholarships/' }] },
    { id: 'queens-admission', name: 'International Admission Awards (Arts & Science, Commerce, Engineering, Health Sciences)', uni: 'Queen’s University', fullRide: false, annualMax: 25000, years: 4, totalMax: 100000, count: null,
      valueNote: 'CAD 5,000 to 25,000 a year, renewable for four years; the amount depends on your admission average.', basis: 'Admission average', nomination: null, auto: true,
      for: ['finalYear', 'earlierGrad'], rule: 'First-entry international fee payers. No separate application.',
      deadlines: [], note: 'Automatic: you are considered when you apply for admission.', conf: 'official',
      sources: [{ label: 'Queen’s international awards', url: 'https://www.queensu.ca/registrar/financial-aid/specific-students/international' }] },
    { id: 'york-glot', name: 'Global Leader of Tomorrow Award (Faculty of Science)', uni: 'York University', fullRide: false, annualMax: 20000, years: 4, totalMax: 80000, count: 2,
      valueNote: 'CAD 20,000 a year, renewable for four years.', basis: 'Academic profile and leadership', nomination: null, auto: false,
      for: ['finalYear', 'earlierGrad'], rule: 'Exceptional academic profile; leadership through service, arts or sport. You do not need an offer of admission to apply.',
      deadlines: [{ label: 'Application (2026-27 cycle)', date: '2027-01-26', basis: 'published' }],
      note: 'Two awards a year on the Faculty of Science page; the application opens 1 November 2026. A CAD 2,000 acceptance deposit is required whatever the scholarship.', conf: 'partial',
      sources: [{ label: 'York Science international awards', url: 'https://www.yorku.ca/science/students/international-students/international-scholarships-and-awards/' }] },
    { id: 'waterloo-science', name: 'Faculty of Science international scholarships (and the CAD 10,000 International Student Entrance Scholarship)', uni: 'University of Waterloo', fullRide: false, annualMax: null, years: 1, totalMax: 80000, count: 15,
      valueNote: 'Up to 15 awards of CAD 25,000–80,000; every international fee payer in most programmes also gets CAD 10,000 for first year.', basis: 'Application', nomination: null, auto: null,
      for: ['finalYear', 'earlierGrad'], rule: 'International fee-paying first-year students.',
      deadlines: [], note: 'The CAD 10,000 award is paid in two instalments. Combine with the CAD 2,000 President’s Scholarship of Distinction (95%+ average).', conf: 'partial',
      sources: [{ label: 'Waterloo international scholarships', url: 'https://uwaterloo.ca/future-students/financing/international-scholarships' }] },
    { id: 'uottawa-english', name: 'International English Admission Scholarship', uni: 'University of Ottawa', fullRide: false, annualMax: 15000, years: 4, totalMax: 60000, count: null,
      valueNote: 'Reported as CAD 7,500 per term (CAD 60,000 over four years) and automatic — uOttawa’s own page could not be opened, so confirm the amount.', basis: 'Admission', nomination: null, auto: true,
      for: ['finalYear', 'earlierGrad'], rule: 'International students studying in English.',
      deadlines: [], note: 'Can be combined with an Academic Excellence award of CAD 10,000 a year. Unverified: read it on uottawa.ca before relying on it.', conf: 'partial',
      sources: [{ label: 'uOttawa scholarships for international students', url: 'https://www.uottawa.ca/study/fees-financial-support/international-english-scholarship' }] },
    { id: 'mun-entrance', name: 'International entrance scholarships', uni: 'Memorial University', fullRide: false, annualMax: 6000, years: 1, totalMax: 6000, count: null,
      valueNote: 'Not more than CAD 6,000 each a year; not normally renewable.', basis: 'Admission average', nomination: null, auto: null,
      for: ['finalYear', 'earlierGrad'], rule: 'International first-entry students.', deadlines: [], note: 'Memorial has the lowest tuition of the large universities listed here.', conf: 'partial',
      sources: [{ label: 'Memorial international entrance scholarships', url: 'https://www.mun.ca/scholarships/entrance-scholarships/international-students/' }] },
    { id: 'umanitoba-entrance', name: 'International Undergraduate Student Entrance Scholarship', uni: 'University of Manitoba', fullRide: false, annualMax: 3000, years: 1, totalMax: 3000, count: null,
      valueNote: 'CAD 3,000 (95%+), 2,000 (90–94.99%) or 1,000 (85–89.99%), one-time (2024-25 values).', basis: 'High-school average', nomination: null, auto: false,
      for: ['finalYear', 'earlierGrad'], rule: 'Minimum 85% average; apply by 1 March; full-time in fall and winter.', deadlines: [], note: '', conf: 'partial',
      sources: [{ label: 'University of Manitoba international awards', url: 'https://www.umanitoba.ca/financial-aid-and-awards/international' }] }
  ],

  universities: [
    { id: 'uoft', name: 'University of Toronto', city: 'Toronto', province: 'Ontario', site: 'https://www.utoronto.ca', tuition: { arts: 66110, science: 66110, eng: 72860 }, fees: 3048, tuitionNote: 'Plus about CAD 2,100 incidental fees and CAD 948 health insurance. Residence and meals about CAD 27,120.', ethiopia: { status: 'unknown', note: 'Ask admissions what they accept from Ethiopia.' }, scholarships: ['pearson'], conf: 'partial',
      sources: [{ label: 'Tuition Explorer 2026-27', url: 'https://tuitionexplorer.registrar.utoronto.ca/index.php?academicYear=2026-27&sessionType=1&studyLevel=UG&residency=INT&campus=UTSG&faculty=ARTSC-UG&college=UC&program=207' }] },
    { id: 'ubc', name: 'University of British Columbia (Vancouver)', city: 'Vancouver', province: 'British Columbia', site: 'https://www.ubc.ca', tuition: { arts: 51530, science: 53082, eng: 66200 }, tuitionNote: 'First-year full course load, 2026/27. Increases for incoming international students are capped at 3% a year.', ethiopia: { status: 'unknown', note: 'UBC lists country requirements for graduate study; check the undergraduate page.' }, scholarships: ['ubc-isp'], conf: 'partial',
      sources: [{ label: 'Undergraduate tuition fees', url: 'https://students.ubc.ca/finances/tuition-fees/undergraduate-tuition-fees/' }] },
    { id: 'ualberta', name: 'University of Alberta', city: 'Edmonton', province: 'Alberta', site: 'https://www.ualberta.ca', tuition: { arts: 39233, science: 39792, eng: 49952 }, tuitionNote: '2026-27 cohort rates; fixed for the standard programme length plus one year. A 5.5% rise is proposed for Fall 2027.', ethiopia: { status: 'listed', note: 'Accepts the Ethiopian higher-education entrance exam, university entrance exam or secondary-school leaving exam.', url: 'https://www.ualberta.ca/admissions/international/admission/admission-requirements/international-course-equivalencies/international-curricula.html?v=international' }, scholarships: ['ualberta-pids'], conf: 'partial',
      sources: [{ label: '2026-27 tuition consultation', url: 'https://www.ualberta.ca/en/registrar/media-library/presentations/2026-27_tuitionstudentconsultationpresentation.pdf' }] },
    { id: 'mcmaster', name: 'McMaster University', city: 'Hamilton', province: 'Ontario', site: 'https://www.mcmaster.ca', tuition: { arts: null, science: null, eng: null }, tuitionNote: 'The 2026-27 international fee schedule could not be read. See McMaster’s cost estimator.', ethiopia: { status: 'unknown', note: '' }, scholarships: ['mcmaster-excellence'], conf: 'partial',
      sources: [{ label: 'Undergraduate fees', url: 'https://registrar.mcmaster.ca/fees/undergraduate/' }] },
    { id: 'queens', name: 'Queen’s University', city: 'Kingston', province: 'Ontario', site: 'https://www.queensu.ca', tuition: { arts: 44810, science: 44810, eng: 59284 }, fees: 2514, tuitionNote: 'Arts & Science tuition includes a CAD 10,000 reduction in 2026-27; total with fees CAD 47,324 (Engineering CAD 61,868).', ethiopia: { status: 'unknown', note: '' }, scholarships: ['queens-admission'], conf: 'official',
      sources: [{ label: 'Undergraduate tuition and fees', url: 'https://www.queensu.ca/registrar/tuition-fees/undergraduate' }] },
    { id: 'york', name: 'York University', city: 'Toronto', province: 'Ontario', site: 'https://www.yorku.ca', tuition: { arts: 40000, science: 40000, eng: 47000 }, tuitionNote: 'York gives approximate averages; the year is not clearly stated.', ethiopia: { status: 'unknown', note: '' }, scholarships: ['york-glot'], conf: 'partial',
      sources: [{ label: 'Tuition & fees', url: 'https://futurestudents.yorku.ca/financing-your-degree/tuition-fees' }] },
    { id: 'waterloo', name: 'University of Waterloo', city: 'Waterloo', province: 'Ontario', site: 'https://uwaterloo.ca', tuition: { arts: null, science: null, eng: null }, tuitionNote: 'Charged per course: Arts about CAD 5,402 a course (up to CAD 27,010 a term), Science about CAD 5,059 (up to CAD 25,296 a term), Fall 2026.', ethiopia: { status: 'unknown', note: '' }, scholarships: ['waterloo-science'], conf: 'partial',
      sources: [{ label: 'Fee schedule, international undergraduates, Fall 2026', url: 'https://uwaterloo.ca/finance/fee-schedule-international-undergraduate-students-fall-2026' }] },
    { id: 'uottawa', name: 'University of Ottawa', city: 'Ottawa', province: 'Ontario', site: 'https://www.uottawa.ca', tuition: { arts: null, science: null, eng: null }, tuitionNote: 'International fees not found.', ethiopia: { status: 'unknown', note: '' }, scholarships: ['uottawa-english'], conf: 'partial',
      sources: [{ label: 'International scholarships', url: 'https://www.uottawa.ca/study/fees-financial-support/international-english-scholarship' }] },
    { id: 'dalhousie', name: 'Dalhousie University', city: 'Halifax', province: 'Nova Scotia', site: 'https://www.dal.ca', tuition: { arts: 37992, science: 37992, eng: 48594 }, tuitionNote: '2026-27 international tuition guarantee. Dalhousie’s large named awards are for Caribbean students.', ethiopia: { status: 'listed', note: 'Lists the Ethiopian Secondary School Leaving Certificate and the Ethiopian University Entrance Examination.', url: 'https://www.dal.ca/admissions/how-to-apply/undergraduate-admissions/international-applicants/international-admissions-requirements-by-country.html' }, scholarships: [], conf: 'partial',
      sources: [{ label: 'International tuition guarantee', url: 'https://www.dal.ca/admissions/money_matters/tuition_payments/International_Tuition_Guarantee.html' }] },
    { id: 'manitoba', name: 'University of Manitoba', city: 'Winnipeg', province: 'Manitoba', site: 'https://umanitoba.ca', tuition: { arts: 24000, science: 28000, eng: 31400 }, tuitionNote: 'Approximate full-year tuition and fees from the university’s estimate table (includes a transit pass, gym pass and health plan).', ethiopia: { status: 'listed', note: 'Names the Ethiopian Higher Education Entrance Examination / University Entrance Examination Certificate (page about two years old).', url: 'https://umanitoba.ca/explore/undergraduate-admissions/requirements/international-admission-requirements' }, scholarships: ['umanitoba-entrance'], conf: 'partial',
      sources: [{ label: 'Undergraduate tuition and fees', url: 'https://umanitoba.ca/registrar/tuition-fees/undergraduate' }] },
    { id: 'memorial', name: 'Memorial University of Newfoundland (St. John’s)', city: 'St. John’s', province: 'Newfoundland and Labrador', site: 'https://www.mun.ca', tuition: { arts: 22500, science: 22500, eng: 22500 }, fees: 945, tuitionNote: 'One international rate for ten courses over two semesters, plus CAD 945 required fees; program-dependent extras (for example a co-op fee) are added.', ethiopia: { status: 'unknown', note: '' }, scholarships: ['mun-entrance'], conf: 'official',
      sources: [{ label: '2026-27 tuition and fees', url: 'https://www.mun.ca/undergrad/money-matters/' }] },
    { id: 'usask', name: 'University of Saskatchewan', city: 'Saskatoon', province: 'Saskatchewan', site: 'https://www.usask.ca', tuition: { arts: 39007, science: 40894, eng: 59383 }, tuitionNote: '2026/27 typical first-year load.', ethiopia: { status: 'unknown', note: '' }, scholarships: [], conf: 'partial',
      sources: [{ label: '2026/27 tuition fact sheet', url: 'https://students.usask.ca/documents/registrarial/2026-2027-tuition-factsheet.pdf' }] }
  ],

  // Mastercard Foundation Scholars Program: status of the Canadian partners (from the Foundation's own pages)
  mastercard: [
    { uni: 'Queen’s University', level: 'Undergraduate', status: 'Closed', note: 'Listed as undergraduate in Kingston; admissions marked closed. Africans aged 29 or under for a bachelor’s.', url: 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/where-to-apply/queens-university/' },
    { uni: 'University of British Columbia', level: 'Post-graduate', status: 'Open', note: 'Focus on refugees and displaced persons; forestry, agriculture, water and land management.', url: 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/where-to-apply/university-of-british-columbia/' },
    { uni: 'University of Toronto', level: 'Graduate', status: 'Check', note: 'Healthcare-focused study; linked to African partner institutions in the Africa Health Collaborative (Addis Ababa University is listed).', url: 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/where-to-apply/university-of-toronto-u-of-t/' },
    { uni: 'McGill University', level: 'Master’s', status: 'Check', note: 'Nutrition, public health, public policy and sustainable agriculture; candidates from Sub-Saharan Africa.', url: 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/where-to-apply/mcgill-university/' }
  ],
  mastercardNote: 'For a bachelor’s degree the Foundation sets an age limit of 29, and most undergraduate places are at universities inside Africa — not in Canada.',

  steps: [
    { t: 'Check that the school can enrol you', d: 'Only designated learning institutions (DLIs) may take international students. Look the school up on IRCC’s DLI list.' },
    { t: 'Apply and get your letter of acceptance', d: 'Some schools want the Ethiopian national exam results, an English test (IELTS or similar), and an application fee. Apply by the school’s deadline; scholarships often have earlier ones.' },
    { t: 'Get a provincial attestation letter (PAL)', d: 'Your school requests it from the province. Undergraduates need one; it only works for the cap year it was issued in.' },
    { t: 'Prove your funds', d: 'Show CAD 23,448 for living costs plus the first year of tuition plus return travel, and how you will pay for later years. Bank statements must show where the money came from.' },
    { t: 'Apply for the study permit online', d: 'Through IRCC. Expect biometrics and possibly a medical exam. I could not confirm where Ethiopian applicants give biometrics — check the IRCC page for your country.' },
    { t: 'Arrive and study', d: 'You can work up to 24 hours a week off campus during term. Keep your enrolment active or your permit can be cancelled.' }
  ],

  // Universities Canada member institutions (97) — [name, province index, website or ""]. Websites from Wikidata (CC0).
  members: {"provinces":["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"],"rows":[["Athabasca University",0,"https://www.athabascau.ca"],["Concordia University of Edmonton",0,"https://concordia.ab.ca"],["King's University",0,""],["MacEwan University",0,"https://www.macewan.ca"],["Mount Royal University",0,"http://www.mtroyal.ca"],["St. Mary's University",0,"http://www.stmu.ca"],["University of Alberta",0,"https://www.ualberta.ca"],["University of Calgary",0,"https://www.ucalgary.ca"],["University of Lethbridge",0,"https://www.uleth.ca"],["Capilano University",1,"https://www.capilanou.ca"],["Emily Carr University of Art + Design",1,""],["Kwantlen Polytechnic University",1,"https://www.kpu.ca"],["Royal Roads University",1,"https://www.royalroads.ca"],["Simon Fraser University",1,"https://www.sfu.ca"],["Thompson Rivers University",1,"https://www.tru.ca"],["Trinity Western University",1,"https://www.twu.ca"],["University of British Columbia",1,"https://www.ubc.ca"],["University of Northern British Columbia",1,"https://www.unbc.ca"],["University of the Fraser Valley",1,"https://www.ufv.ca"],["University of Victoria",1,"https://www.uvic.ca"],["Vancouver Island University",1,"https://www.viu.ca"],["Brandon University",2,"https://www.brandonu.ca"],["Canadian Mennonite University",2,""],["St. Paul's College",2,""],["Université de Saint-Boniface",2,"http://www.ustboniface.ca"],["University of Manitoba",2,"https://umanitoba.ca"],["University of Winnipeg",2,"https://uwinnipeg.ca"],["Mount Allison University",3,"https://mta.ca"],["St. Thomas University",3,"https://stu.ca"],["Université de Moncton",3,"http://www.umoncton.ca"],["University of New Brunswick",3,"https://www.unb.ca"],["Memorial University of Newfoundland and Labrador",4,""],["Acadia University",5,"http://www.acadiau.ca"],["Cape Breton University",5,"https://www.cbu.ca"],["Dalhousie University",5,"https://www.dal.ca"],["Mount Saint Vincent University",5,"http://www.msvu.ca"],["NSCAD University",5,""],["Saint Mary's University",5,"https://www.smu.ca"],["St. Francis Xavier University",5,"http://www.stfx.ca"],["Université Sainte-Anne",5,"https://www.usainteanne.ca"],["University of King's College",5,"https://www.ukings.ca"],["Algoma University",6,"http://www.algomau.ca"],["Brock University",6,"https://brocku.ca"],["Carleton University",6,"https://carleton.ca"],["Huron University College",6,"https://huronatwestern.ca"],["King's University College at Western University",6,""],["Lakehead University",6,"http://www.lakeheadu.ca"],["Laurentian University",6,"https://laurentian.ca"],["McMaster University",6,"https://www.mcmaster.ca"],["Nipissing University",6,"http://www.nipissingu.ca"],["OCAD University",6,"http://www.ocadu.ca"],["Ontario Tech University",6,"https://ontariotechu.ca"],["Queen's University",6,"https://queensu.ca"],["Redeemer University",6,"http://www.redeemer.ca"],["Royal Military College of Canada",6,"https://www.rmc-cmr.ca/fr"],["St. Jerome's University",6,"http://www.sju.ca"],["Toronto Metropolitan University",6,"https://www.torontomu.ca"],["Trent University",6,"https://trentu.ca"],["University of Guelph",6,"https://www.uoguelph.ca"],["University of Ottawa",6,"https://www.uottawa.ca/en"],["University of St. Michael's College",6,"https://stmikes.utoronto.ca"],["University of Sudbury",6,"https://usudbury.ca/en/welcome"],["University of Toronto",6,"https://www.utoronto.ca"],["University of Trinity College",6,""],["University of Waterloo",6,"https://uwaterloo.ca"],["University of Windsor",6,"https://www.uwindsor.ca"],["Victoria University",6,"https://vicu.utoronto.ca"],["Western University",6,""],["Wilfrid Laurier University",6,"http://www.wlu.ca"],["York University",6,"https://www.yorku.ca"],["University of Prince Edward Island",7,"http://upei.ca"],["Bishop's University",8,"https://www.ubishops.ca"],["Concordia University",8,"https://www.concordia.ca"],["École de technologie supérieure",8,"https://www.etsmtl.ca"],["École nationale d'administration publique",8,"http://www.enap.ca"],["HEC Montréal",8,"https://www.hec.ca"],["Institut national de la recherche scientifique",8,"https://inrs.ca"],["McGill University",8,"https://www.mcgill.ca"],["Polytechnique Montréal",8,"https://www.polymtl.ca"],["Université de Montréal",8,"https://www.umontreal.ca"],["Université de Sherbrooke",8,"https://www.usherbrooke.ca"],["Université du Québec",8,""],["Université du Québec à Chicoutimi",8,""],["Université du Québec à Montréal",8,""],["Université du Québec à Rimouski",8,""],["Université du Québec à Trois-Rivières",8,""],["Université du Québec en Abitibi-Témiscamingue",8,""],["Université du Québec en Outaouais",8,"http://www.uqo.ca"],["Université Laval",8,"https://www.ulaval.ca"],["Université TÉLUQ",8,"https://www.teluq.ca"],["Campion College",9,""],["First Nations University of Canada",9,""],["Luther College",9,""],["St. Thomas More College",9,""],["University of Regina",9,"https://www.uregina.ca"],["University of Saskatchewan",9,"https://www.usask.ca"],["Yukon University",10,"http://www.yukoncollege.yk.ca"]]}
};
