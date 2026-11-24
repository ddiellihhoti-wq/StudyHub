/* StudyHub demo — plain JS, data saved in localStorage. Languages: Shqip (sq) / English (en) */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const midnight = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const addDays = n => { const d = midnight(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const daysLeft = iso => Math.round((new Date(iso + 'T00:00') - midnight()) / 864e5);
const localInput = ms => new Date(ms - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
const hue = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const toMin = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
const fromMin = n => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

/* ---------- translations (key = English text) ---------- */
const SUGGEST = [['Math','Matematikë'],['English','Anglisht'],['Albanian','Gjuhë shqipe'],['Science','Shkenca'],['History','Histori'],['Geography','Gjeografi'],
  ['Art','Art'],['PE','Edukim fizik'],['Music','Muzikë'],['Computer Science','Informatikë'],['Biology','Biologji'],['Chemistry','Kimi'],['Physics','Fizikë']];
const SQ = {
  /* navigation & chrome */
  'Home':'Kryefaqja','My Day':'Dita ime','Timer':'Kohëmatësi','Exams':'Provimet','History':'Historia','Homework':'Detyrat e shtëpisë','Quiz':'Kuizi',
  'Overview':'Pasqyra','Assignments':'Detyrat e dhëna','Grading':'Vlerësimi','Gradebook':'Regjistri i notave','Auto Emails':'Email-et automatike',
  'Class portal':'Portali i klasës','Student':'Nxënësi','Teacher':'Mësuesi','Dark mode':'Modaliteti i errët','Light mode':'Modaliteti i çelët',
  'Sign out':'Dil','Signed in as Teacher':'I identifikuar si mësues','Alex · Student':'Alex · Nxënës','Close':'Mbyll','Cancel':'Anulo','Save':'Ruaj','Remove':'Hiq','Delete':'Fshi','Open':'Hap','View':'Shiko','Add':'Shto','Set':'Vendos','Subject':'Lënda','Title':'Titulli','Date':'Data',
  /* login */
  'Teacher sign-in':'Hyrja e mësuesit','Enter the teacher password to continue.':'Shkruaj fjalëkalimin e mësuesit për të vazhduar.','Password':'Fjalëkalimi','Sign in':'Hyr',
  'Wrong password.':'Fjalëkalim i gabuar.','Too many tries. Wait {0} seconds.':'Shumë përpjekje. Prit {0} sekonda.','Signed in as teacher':'U identifikove si mësues','Signed out':'U ç’identifikove',
  'Current password is wrong':'Fjalëkalimi aktual është i gabuar','New password needs at least 6 characters':'Fjalëkalimi i ri duhet të ketë të paktën 6 shkronja','Password changed':'Fjalëkalimi u ndryshua',
  /* home */
  'Good morning':'Mirëmëngjes','Good afternoon':'Mirëdita','Good evening':'Mirëmbrëma',
  'Your next exam, {0}, is {1}.':'Provimi yt i radhës, {0}, është {1}.','No upcoming exams — nice!':'Nuk ka provime të afërta — bukur!',
  'homework to do':'detyra për t’u bërë','focus sessions ({0} min)':'seanca përqendrimi ({0} min)','average grade':'nota mesatare','Exam: {0}':'Provim: {0}',
  'Passed':'Ka kaluar','Today!':'Sot!','Tomorrow':'Nesër','in {0} days':'pas {0} ditësh','days left':'ditë të mbetura',
  'Today’s classes':'Orët e sotme','Nothing planned today. Pick your subjects in “My Day” to build your schedule.':'Nuk ke asgjë të planifikuar sot. Zgjidh lëndët te “Dita ime” për të ndërtuar orarin.',
  'Lunch break':'Pushimi i drekës',
  /* timetable */
  'My School Day':'Dita ime shkollore','Choose the subjects you actually have, then fill in your week. A lunch break is added automatically after every 2 lessons.':'Zgjidh lëndët që ke në të vërtetë, pastaj plotëso javën. Pas çdo 2 orësh mësimi shtohet automatikisht pushimi i drekës.',
  'My subjects':'Lëndët e mia','None yet — add your first subject below.':'Ende asnjë — shto lëndën e parë më poshtë.','Add a subject (e.g. Chemistry)':'Shto një lëndë (p.sh. Kimi)','Quick add:':'Shtim i shpejtë:',
  'My week':'Java ime','{0} slots filled':'{0} vende të plotësuara','Clear week':'Pastro javën','Remove {0}':'Hiq {0}','Free period':'Orë e lirë','Mon':'Hën','Tue':'Mar','Wed':'Mër','Thu':'Enj','Fri':'Pre',
  'Type a subject name':'Shkruaj emrin e lëndës','{0} is already in your list':'{0} është tashmë në listë','Period {0} start time':'Ora e fillimit të orës {0}','{0} period {1}':'{0}, ora {1}',
  /* timer */
  'Study Timer':'Kohëmatësi i studimit','{0} mode':'Modaliteti: {0}','Focus':'Përqendrim','Break':'Pushim','Start':'Fillo','Pause':'Pusho','Reset':'Rivendos','Presets':'Të gatshme','{0} min {1}':'{0} min {1}',
  'Custom minutes':'Minuta të personalizuara','Completed today: {0} sessions · {1} min':'Të përfunduara sot: {0} seanca · {1} min','{0} finished!':'{0} përfundoi!','Enter 1–180 minutes':'Shkruaj 1–180 minuta',
  /* exams */
  'Exam Countdown':'Numërimi mbrapsht për provimet','Chapter 5 test':'Testi i kapitullit 5','Add exam':'Shto provim','Upcoming':'Të ardhshme','No exams yet.':'Ende pa provime.',
  'Add a title and a date':'Shto një titull dhe një datë','Exam added':'Provimi u shtua','General':'Të përgjithshme','Algebra test':'Testi i algjebrës','World War II exam':'Provimi i Luftës II Botërore',
  /* history */
  'History Scroller':'Udhëtimi në histori','Scroll through time — click an event for details.':'Lëviz përmes kohës — kliko mbi një ngjarje për detaje.',
  'The highest grade is {0}':'Nota më e lartë është {0}','Notifications':'Njoftimet','Mark all as read':'Shëno të gjitha si të lexuara','No notifications yet.':'Ende pa njoftime.','Sound on':'Zëri i ndezur','Sound off':'Zëri i fikur',
  'Enable desktop alerts':'Aktivizo njoftimet në desktop','Desktop alerts are on':'Njoftimet në desktop janë aktive','Your browser blocked notifications.':'Shfletuesi bllokoi njoftimet.',
  '{0} handed in “{1}”':'{0} dorëzoi “{1}”','{0} finished the quiz “{1}” — {2}%':'{0} përfundoi kuizin “{1}” — {2}%','You have {0} unread notifications':'Ke {0} njoftime të palexuara',
  'just now':'tani','{0} min ago':'para {0} min','{0} h ago':'para {0} orësh',
  'You forgot your homework!':'Harrove detyrat e shtëpisë!','1 assignment is overdue.':'1 detyrë është me vonesë.','{0} assignments are overdue.':'{0} detyra janë me vonesë.',
  '1 assignment is overdue:':'1 detyrë është me vonesë:','{0} assignments are overdue:':'{0} detyra janë me vonesë:','1 day late':'1 ditë vonesë','{0} days late':'{0} ditë vonesë',
  'Do it now':'Bëje tani','Remind me later':'Më kujto më vonë','Overdue':'Me vonesë','Due soon:':'Afati i afërt:','due today':'afati sot','due tomorrow':'afati nesër',
  'Your teacher is waiting for this work. Hand it in as soon as you can.':'Mësuesi po pret këtë punë. Dorëzoje sa më shpejt.',
  'Typed without ë/ç, like everyday messages — more human.':'Shkruar pa ë/ç, si në mesazhet e përditshme — më njerëzore.','Use | for alternatives in other languages, e.g. alliance|aleanca.':'Përdor | për alternativa në gjuhë të tjera, p.sh. alliance|aleanca.',
  'Study Plan':'Plani i studimit','Spread your revision over the days before each exam. Tick a day when you have done it.':'Shpërndaje përsëritjen në ditët para çdo provimi. Shëno një ditë kur e ke bërë.',
  'Plan revision':'Planifiko përsëritjen','Minutes per day':'Minuta në ditë','Create plan':'Krijo planin','Delete plan':'Fshi planin','Plan created: {0} study days':'Plani u krijua: {0} ditë studimi',
  '{0} of {1} days done':'{0} nga {1} ditë të përfunduara','Start timer':'Nis kohëmatësin','Today':'Sot','No plan yet':'Ende pa plan','No exams to plan yet. Add one on the Exams page.':'Ende pa provime për të planifikuar. Shto një te faqja Provimet.',
  'Today’s revision':'Përsëritja e sotme','{0} min':'{0} min','Open plan':'Hap planin','Done':'Bërë','Plan your revision day by day':'Planifiko përsëritjen ditë pas dite',
  'day streak':'ditë radhazi','Best: {0}':'Rekordi: {0}','Badges':'Distinktivët','Badge unlocked: {0}':'Distinktiv i ri: {0}','{0} of {1} badges earned':'{0} nga {1} distinktivë të fituar','Be active every day to build your streak.':'Ji aktiv çdo ditë për të ndërtuar serinë.',
  'Quizzes':'Kuizet','Quizzes from your teacher. Pick one to start — it is graded instantly.':'Kuize nga mësuesi yt. Zgjidh një për të nisur — vlerësohet menjëherë.','Review':'Shiko','{0} questions':'{0} pyetje','All quizzes':'Të gjitha kuizet',
  'No quizzes yet.':'Ende pa kuize.','Closed':'E mbyllur','Open to students':'E hapur për nxënësit','Close quiz':'Mbyll kuizin','Open quiz':'Hap kuizin',
  'Create a quiz and publish it — it is graded automatically and shows up in the Gradebook.':'Krijo një kuiz dhe publikoje — vlerësohet automatikisht dhe shfaqet në Regjistrin e notave.','Create a quiz':'Krijo një kuiz',
  'Quiz title':'Titulli i kuizit','Questions':'Pyetjet','Write one block per question. The first line is the question, then the options — put * before the correct one. Leave a blank line between questions.':'Shkruaj një bllok për çdo pyetje. Rreshti i parë është pyetja, pastaj opsionet — vendos * para atij të saktë. Lër një rresht bosh mes pyetjeve.',
  'Publish quiz':'Publiko kuizin','Load an example':'Ngarko një shembull','Your quizzes':'Kuizet e tua','taken by {0}':'zgjidhur nga {0}','Nobody has taken it yet.':'Askush nuk e ka zgjidhur ende.',
  'Quiz needs a title and at least one question.':'Kuizi ka nevojë për një titull dhe të paktën një pyetje.','Question {0} needs 2–6 options and exactly one * correct answer.':'Pyetja {0} duhet të ketë 2–6 opsione dhe saktësisht një përgjigje të saktë me *.',
  'Quiz published — students can see it now':'Kuizi u publikua — nxënësit e shohin tani','New quiz: {0}':'Kuiz i ri: {0}','Mixed quick exam':'Provim i shpejtë i përzier','Albanian history basics':'Bazat e historisë shqiptare',
  'Log in':'Hyr','Create account':'Krijo llogari','Log out':'Dil','Guest · Limited access':'Mysafir · Qasje e kufizuar','Hello, guest':'Përshëndetje, mysafir',
  'You’re browsing as a guest':'Po shfleton si mysafir','Guests can use the Home page, the Study Timer and the History Scroller. Log in to unlock My Day, Exams, Homework and the Quiz — and to save your progress.':'Mysafirët mund të përdorin Kryefaqen, Kohëmatësin dhe Udhëtimin në histori. Hyr për të hapur Ditën time, Provimet, Detyrat dhe Kuizin — dhe për të ruajtur përparimin.',
  'Demo account: alex / student':'Llogari demo: alex / student','Free for everyone':'Falas për të gjithë','Needs an account':'Kërkon llogari','Sign in to unlock this':'Hyr për ta hapur këtë',
  '{0} is only available to signed-in students.':'{0} është i disponueshëm vetëm për nxënësit e identifikuar.','Build your own school day':'Ndërto ditën tënde shkollore','Count down to your exams':'Numëro ditët deri te provimet',
  'Hand in work and see your grades':'Dorëzo punët dhe shiko notat','Take the auto-graded quiz':'Zgjidh kuizin e vlerësuar automatikisht','Log in to save your study sessions.':'Hyr për të ruajtur seancat e tua të studimit.',
  'Profile':'Profili','My profile':'Profili im','Username':'Emri i përdoruesit','Display name':'Emri i shfaqur','Class':'Klasa','Class (e.g. 10A)':'Klasa (p.sh. 10A)','Avatar color':'Ngjyra e avatarit','Save profile':'Ruaj profilin','Profile saved':'Profili u ruajt',
  'Change password':'Ndrysho fjalëkalimin','Danger zone':'Zona e rrezikut','Delete my account':'Fshi llogarinë time','This permanently deletes your account and your saved data.':'Kjo fshin përgjithmonë llogarinë dhe të dhënat e ruajtura.',
  'This permanently deletes your account and your saved data. Continue?':'Kjo fshin përgjithmonë llogarinë dhe të dhënat e ruajtura. Të vazhdojmë?','Account deleted':'Llogaria u fshi',
  'No account yet?':'Nuk ke llogari?','Already have an account?':'Ke tashmë një llogari?','Welcome back, {0}':'Mirë se u ktheve, {0}','Account created — welcome, {0}!':'Llogaria u krijua — mirë se vjen, {0}!',
  'Email address':'Adresa e emailit','Enter a valid email address.':'Shkruaj një adresë emaili të vlefshme.',
  'Wrong email or password.':'Emaili ose fjalëkalimi është i gabuar.','Enter your password.':'Shkruaj fjalëkalimin.',
  'An account already uses this email address.':'Kjo adresë emaili është tashmë në përdorim.',
  'Too many attempts. Try again later.':'Shumë përpjekje. Provo përsëri më vonë.',
  'Check your internet connection and try again.':'Kontrollo lidhjen me internetin dhe provo përsëri.',
  'Sign out and sign in again before deleting your account.':'Dil dhe hyr përsëri para se të fshish llogarinë.',
  'Firebase Authentication is unavailable. Try again later.':'Identifikimi me Firebase nuk është i disponueshëm. Provo përsëri më vonë.',
  'Open Alex demo account':'Hyr në llogarinë demo të Alex',
  'Enter your name.':'Shkruaj emrin tënd.','That name is already used by another student.':'Ky emër përdoret tashmë nga një nxënës tjetër.','Password needs at least 6 characters.':'Fjalëkalimi duhet të ketë të paktën 6 shkronja.',
  'Key facts':'Fakte kyçe','Read more on Wikipedia':'Lexo më shumë në Wikipedia','Images load from Wikipedia and need an internet connection.':'Fotot ngarkohen nga Wikipedia dhe kërkojnë internet.',
  'Previous':'Para','Next':'Pas','Click for the full story':'Kliko për historinë e plotë',
  'All':'Të gjitha','Ancient':'Antike','Medieval':'Mesjetë','Early Modern':'Koha e Re e Hershme','Modern':'Moderne','{0} BCE':'{0} p.e.s.',
  /* homework & quiz */
  'To do':'Për t’u bërë','Submitted':'Dorëzuar','Graded: {0}':'Vlerësuar: {0}','Overdue — was due':'Me vonesë — afati ishte','Due':'Afati','Submit work':'Dorëzo punën',
  'Your answer':'Përgjigjja jote','Type your work here…':'Shkruaj punën tënde këtu…','Hand in':'Dorëzo','Write something first':'Shkruaj diçka fillimisht','Handed in — your teacher will grade it':'U dorëzua — mësuesi do ta vlerësojë',
  'Essay: Causes of WWI':'Ese: Shkaqet e Luftës I Botërore','Write about 150 words on why WWI started.':'Shkruaj rreth 150 fjalë pse filloi Lufta I Botërore.','Worksheet 4':'Fletë pune 4','Complete questions 1-10.':'Plotëso pyetjet 1-10.',
  'Book review':'Recension libri','Review the book you are reading.':'Shkruaj një recension për librin që po lexon.','See your teacher for details.':'Pyet mësuesin për detaje.',
  'Quick Exam':'Provim i shpejtë','Multiple choice — graded instantly.':'Zgjedhje të shumëfishta — vlerësohet menjëherë.','Score: {0}%':'Rezultati: {0}%','Great job!':'Punë e shkëlqyer!','Keep practising!':'Vazhdo të praktikosh!',
  '(correct)':'(e saktë)','Retake':'Provo përsëri','Submit exam':'Dërgo provimin','Answer every question first':'Përgjigju fillimisht të gjitha pyetjeve','Auto-graded: {0}%':'Vlerësuar automatikisht: {0}%',
  /* teacher overview */
  'Teacher dashboard':'Paneli i mësuesit','{0} submission waiting for a grade, {1} flagged by the AI check.':'{0} dorëzim po pret notën, {1} i shënuar nga kontrolli i AI.','{0} submissions waiting for a grade, {1} flagged by the AI check.':'{0} dorëzime po presin notën, {1} të shënuara nga kontrolli i AI.',
  'submissions':'dorëzime','waiting for a grade':'në pritje të notës','flagged as likely AI':'të shënuara si mundësisht AI','emails scheduled':'email-e të planifikuara',
  'Needs attention':'Kërkon vëmendje','Flagged as likely AI':'Shënuar si mundësisht AI','Waiting for a grade':'Në pritje të notës','All caught up.':'Gjithçka është në rregull.',
  'Average by assignment':'Mesatarja sipas detyrës','No assignments.':'Pa detyra.','Grade distribution':'Shpërndarja e notave','Below 50':'Nën 50','Account':'Llogaria',
  'Change teacher password':'Ndrysho fjalëkalimin e mësuesit','Current password':'Fjalëkalimi aktual','New password':'Fjalëkalimi i ri','Update password':'Përditëso fjalëkalimin',
  /* assignments */
  'Anything you create here appears on the student Homework page. The key points are what auto-grade looks for.':'Çdo gjë që krijon këtu shfaqet te faqja e detyrave të nxënësve. Pikat kyçe janë ato që kërkon vlerësimi automatik.',
  'Due date':'Afati','Instructions':'Udhëzime','What should students do?':'Çfarë duhet të bëjnë nxënësit?','Key points to look for (comma separated)':'Pikat kyçe për t’u kërkuar (të ndara me presje)',
  'Create assignment':'Krijo detyrë','Current assignments':'Detyrat aktuale','due {0}':'afati {0}','Key points: {0} · {1} submitted, {2} graded':'Pikat kyçe: {0} · {1} të dorëzuara, {2} të vlerësuara','none':'asnjë',
  'Email the class':'Dërgo email klasës','No assignments yet.':'Ende pa detyra.','Add a title and a due date':'Shto një titull dhe një afat','Assignment created — students can see it now':'Detyra u krijua — nxënësit e shohin tani',
  'New assignment: {0}':'Detyrë e re: {0}','Email will send in 10 seconds':'Email-i do të dërgohet pas 10 sekondash',
  /* grading */
  'Grading & AI check':'Vlerësimi dhe kontrolli i AI','1. Pick what to grade':'1. Zgjidh çfarë do të vlerësosh','Assignment':'Detyra','All assignments':'Të gjitha detyrat','Show':'Shfaq',
  'Needs grading':'Duhet vlerësuar','Everything':'Të gjitha','Already graded':'Të vlerësuara tashmë','Tick the submissions you want to work on. Nothing is graded until you press Save.':'Shëno dorëzimet me të cilat dëshiron të punosh. Asgjë nuk vlerësohet derisa të shtypësh Ruaj.',
  'Select all shown':'Zgjidh të gjitha të shfaqurat','Clear':'Pastro','{0} selected':'{0} të zgjedhura','Scan AI':'Skano për AI','Auto-grade':'Vlerëso automatikisht','Save selected':'Ruaj të zgjedhurat',
  'Grade':'Nota','Feedback':'Koment','Nothing matches this filter.':'Asgjë nuk përputhet me këtë filtër.','AI scores are only a signal — they can be wrong. Always review before penalising a student.':'Rezultatet e AI janë vetëm sinjal — mund të jenë të gabuara. Kontrolloji gjithmonë para se të ndëshkosh një nxënës.',
  'AI detector settings':'Cilësimet e detektorit të AI','Uses a free built-in estimate by default. Paste a {0} API key to use their detector instead (the key stays in this browser).':'Si parazgjedhje përdor një vlerësim falas të brendshëm. Ngjit një çelës API të {0} për të përdorur detektorin e tyre (çelësi mbetet në këtë shfletues).',
  'The built-in estimate is tuned for English text.':'Vlerësimi i brendshëm është i përshtatur për tekst në anglisht.','Sapling API key (optional)':'Çelësi API i Sapling (opsional)',
  'not scanned':'pa skanuar','too short':'shumë i shkurtër','Likely human':'Mundësisht njeri','Uncertain':'E pasigurt','Likely AI':'Mundësisht AI',
  'Built-in estimate':'Vlerësim i brendshëm','Sapling API':'API i Sapling','{0}’s work':'Puna e {0}','Not scanned yet.':'Ende pa skanuar.',
  'Too short (under 25 words) to judge.':'Shumë i shkurtër (nën 25 fjalë) për t’u gjykuar.','Very even sentence lengths (low burstiness).':'Fjali me gjatësi shumë të njëtrajtshme (variacion i ulët).',
  'Fairly even sentence lengths.':'Fjali me gjatësi mjaft të njëtrajtshme.','Stock “AI-style” phrases: {0}.':'Fraza tipike “të stilit AI”: {0}.','No contractions in a long text.':'Asnjë shkurtim në një tekst të gjatë.',
  'No first-person voice.':'Pa zë në vetën e parë.','Casual typing habits (missing capitals / slang) — more human.':'Shkrim i përditshëm (pa shkronja të mëdha / zhargon) — më njerëzor.','No strong signals either way.':'Asnjë sinjal i fortë në asnjë drejtim.',
  'Score from the Sapling AI detector API.':'Rezultati vjen nga API i detektorit të AI Sapling.','Sapling API unavailable — used the built-in estimate instead.':'API i Sapling nuk është i disponueshëm — u përdor vlerësimi i brendshëm.',
  'Key saved — using Sapling':'Çelësi u ruajt — po përdoret Sapling','Key removed — using built-in estimate':'Çelësi u hoq — po përdoret vlerësimi i brendshëm',
  'Tick at least one submission first':'Shëno të paktën një dorëzim fillimisht','Scanning {0}…':'Duke skanuar {0}…','Suggested grades filled in for {0} — review, then press Save selected':'Notat e sugjeruara u plotësuan për {0} — kontrollo, pastaj shtyp Ruaj të zgjedhurat',
  'Enter or auto-fill some grades first':'Shkruaj ose plotëso automatikisht disa nota fillimisht','Saved {0} grade(s) and emailed the students':'U ruajtën {0} nota dhe nxënësit u njoftuan me email','Enter a grade from 0 to 100':'Shkruaj një notë nga 0 deri në 100',
  'Saved — emailed {0} automatically':'U ruajt — {0} u njoftua automatikisht me email','{0} words. ':'{0} fjalë. ','Covered {0}/{1} key points':'Përfshiu {0}/{1} pika kyçe','Strong work.':'Punë e fortë.',
  'Good, but add more detail.':'Mirë, por shto më shumë detaje.','Needs more depth and structure.':'Duhet më shumë thellësi dhe strukturë.',' Flagged by the AI check — please review.':' E shënuar nga kontrolli i AI — ju lutem kontrolloni.',
  'Your grade is ready':'Nota jote është gati','You got {0}/100. {1}':'Ke marrë {0}/100. {1}',
  /* gradebook */
  'Every student, every assignment, in one place.':'Çdo nxënës, çdo detyrë, në një vend.','Download CSV':'Shkarko CSV','Average':'Mesatarja','Class average':'Mesatarja e klasës','Missing':'Mungon',
  /* emails */
  'Automatic emails':'Email-et automatike','Demo mode: nothing leaves your browser — emails “send” into the log below when their time arrives.':'Modaliteti demo: asgjë nuk del nga shfletuesi — email-et “dërgohen” në regjistrin më poshtë kur vjen koha.',
  'To':'Për','All students':'Të gjithë nxënësit','Class 10A':'Klasa 10A','Parents':'Prindërit','Send at':'Dërgo më','Email subject':'Subjekti','Message':'Mesazhi','Write your message…':'Shkruaj mesazhin…',
  'Schedule':'Planifiko','Demo: send in 10s':'Demo: dërgo pas 10 sekondash','Exam reminders':'Kujtesa për provimet','Remind class 1 day before':'Kujto klasën 1 ditë më parë','No exams.':'Pa provime.',
  'Mail log':'Regjistri i email-eve','Sent':'Dërguar','Scheduled':'Planifikuar','To: {0} · sent {1}':'Për: {0} · dërguar më {1}','To: {0} · sends {1}':'Për: {0} · do të dërgohet më {1}',
  'Add a subject and a send time':'Shto një subjekt dhe një kohë dërgimi','Will send in 10 seconds…':'Do të dërgohet pas 10 sekondash…','That date has passed — sending in 10s':'Ajo datë ka kaluar — po dërgohet pas 10 sekondash',
  'Reminder scheduled for the day before':'Kujtesa u planifikua për një ditë më parë','Reminder: {0} tomorrow':'Kujtesë: {0} nesër','Good luck on your {0} exam tomorrow!':'Fat të mbarë në provimin e {0} nesër!',
  'Sent to {0}: “{1}”':'Dërguar te {0}: “{1}”','Demo email':'Email demo','This was sent automatically.':'Ky u dërgua automatikisht.',
  'Welcome back!':'Mirë se u ktheve!','New term starts today.':'Tremujori i ri fillon sot.','Homework reminder':'Kujtesë për detyrat','Don’t forget the WWI essay.':'Mos harro esenë për Luftën I Botërore.'
};
SUGGEST.forEach(([e, a]) => { SQ[e] = a; });
let LANG = 'sq';
const t = (k, ...a) => String((LANG === 'sq' && SQ[k] !== undefined ? SQ[k] : k)).replace(/\{(\d)\}/g, (_, i) => a[i] ?? '');
const tx = s => (LANG === 'sq' && SQ[s] !== undefined ? SQ[s] : s);   /* for stored data, no placeholders */
const fmt = ms => new Date(ms).toLocaleString(LANG === 'sq' ? 'sq-AL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/* ---------- state ---------- */
const KEY = 'studyhub.demo.v6';
const DEFAULT_TIMES = ['08:00', '09:00', '10:20', '11:20', '12:40', '13:40'];
const COLORS = ['#2d5a4a', '#b9791f', '#3b5b8c', '#8a3b4f', '#6b4c8a', '#4a4a4a'];
const HUMAN = "i think the war started because of alot of things. the main one was the assassination of franz ferdinand but it wasnt just that, countries had alliances so when one got attacked everyone got dragged in. also germany and britain were competing for who had the bigger navy which made everyone nervous. honestly i dont think it was inevitable tho";
const BOTTY = "The outbreak of World War I was a multifaceted event rooted in several interconnected factors. Furthermore, the system of alliances played a pivotal role in escalating a regional conflict into a global one. Moreover, militarism and nationalism created a landscape in which tensions were consistently heightened. Additionally, the assassination of Archduke Franz Ferdinand served as a testament to the fragility of the international order. In conclusion, it is important to note that these causes collectively underscore the complexity of the conflict.";
/* the sample essays and comments are shown in the language of the page (student-typed text is never translated) */
Object.assign(SQ, {
  [HUMAN]: 'mendoj qe lufta filloi per shume arsye. arsyeja kryesore ishte vrasja e franc ferdinandit por nuk ishte vetem kjo, vendet kishin aleanca dhe kur sulmohej njeri tjetrat futeshin ne lufte. gjermania dhe britania po garonin edhe per anijet luftarake dhe kjo i bente te gjithe te frikesuar. sinqerisht nuk mendoj se ishte e pashmangshme',
  [BOTTY]: 'Shpërthimi i Luftës së Parë Botërore ishte një ngjarje shumëdimensionale e rrënjosur në disa faktorë të ndërthurur. Për më tepër, sistemi i aleancave luajti një rol thelbësor në kthimin e një konflikti rajonal në një konflikt global. Gjithashtu, militarizmi dhe nacionalizmi krijuan një klimë ku tensionet rriteshin vazhdimisht. Përveç kësaj, vrasja e Arkdukës Franc Ferdinand shërbeu si dëshmi e brishtësisë së rendit ndërkombëtar. Si përfundim, është e rëndësishme të theksohet se këto shkaqe së bashku nënvizojnë kompleksitetin e konfliktit.',
  'A fun read with a strong main character. The ending surprised me and I liked how the author kept the pace up.': 'Një lexim i këndshëm me një personazh kryesor të fortë. Fundi më befasoi dhe më pëlqeu si autori e mbajti ritmin.',
  'The war began after the assassination of Franz Ferdinand. Alliances between countries pulled more nations in, and nationalism made people eager to fight.': 'Lufta filloi pas vrasjes së Franc Ferdinandit. Aleancat mes vendeve përfshinë më shumë kombe, dhe nacionalizmi i bëri njerëzit të etur për të luftuar.',
  'Several causes combined: militarism, alliances, imperialism and nationalism. The assassination of Archduke Ferdinand was the spark that set it all off.': 'Disa shkaqe u bashkuan: militarizmi, aleancat, imperializmi dhe nacionalizmi. Vrasja e Arkdukës Ferdinand ishte shkëndija që ndezi gjithçka.',
  'I enjoyed the book, especially the friendship between the two main characters and how it changed over time.': 'Libri më pëlqeu, sidomos miqësia mes dy personazheve kryesore dhe si ndryshoi me kohën.',
  'It was ok. The plot was slow at the start but got better near the end.': 'Ishte në rregull. Ngjarja ishte e ngadaltë në fillim por u përmirësua afër fundit.',
  'Answers 1-10 done.': 'Përgjigjet 1-10 u bënë.', 'Answers 1-10 done, question 7 was hard.': 'Përgjigjet 1-10 u bënë, pyetja 7 ishte e vështirë.',
  'Great voice, add a few more quotes next time!': 'Stil i mirë, shto disa citate të tjera herës tjetër!', 'Good start, needs more on militarism.': 'Fillim i mirë, duhet më shumë për militarizmin.',
  'Excellent range of causes.': 'Gamë e shkëlqyer shkaqesh.', 'Nice personal take.': 'Pikëpamje e bukur personale.', 'Say more about why.': 'Thuaj më shumë pse.',
  'Perfect.': 'Perfekt.', 'Check question 7 again.': 'Kontrollo pyetjen 7 përsëri.'
});
const def = () => ({
  theme: 'light', lang: 'sq', role: 'student', pwHash: '', page: 'home', apiKey: '', me: null, teacherName: '', notifs: [], sound: true,
  accounts: [{ id: 1, user: 'alex', name: 'Alex', klass: '10A', color: COLORS[0], pwHash: '', data: null }],
  /* working copy of the signed-in student's own data (saved back into their account) */
  sessions: 0, minutes: 0, qres: {}, streak: { last: '', count: 0, best: 0 }, badges: {}, plan: {}, subjects: [], times: [...DEFAULT_TIMES], tt: {},
  /* quizzes are shared: the teacher creates them, every student sees the open ones */
  quizzes: [
    { id: 1, title: 'Mixed quick exam', subject: 'History', open: true, questions: [
      { q: ['In what year did the Berlin Wall fall?', 'Në cilin vit ra Muri i Berlinit?'], o: ['1961', '1989', '1991', '1975'], a: 1 },
      { q: ['Who sailed to the Americas in 1492?', 'Kush lundroi drejt Amerikës në vitin 1492?'], o: ['Magellan', 'Cook', 'Columbus', 'Drake'], os: ['Magelani', 'Kuku', 'Kolombi', 'Drejku'], a: 2 },
      { q: ['Solve: 2x + 6 = 14', 'Zgjidh: 2x + 6 = 14'], o: ['x = 3', 'x = 4', 'x = 5', 'x = 10'], a: 1 },
      { q: ['Which 1215 document limited the king’s power?', 'Cili dokument i vitit 1215 kufizoi pushtetin e mbretit?'], o: ['Magna Carta', 'Domesday Book', 'Bill of Rights', 'Treaty of Paris'], os: ['Magna Carta', 'Libri Domesday', 'Karta e të Drejtave', 'Traktati i Parisit'], a: 0 }] },
    { id: 2, title: 'Albanian history basics', subject: 'History', open: true, questions: [
      { q: ['Who led the Albanian resistance in the 1400s?', 'Kush udhëhoqi rezistencën shqiptare në shekullin XV?'], o: ['Ismail Qemali', 'Skanderbeg', 'Ali Pasha', 'Ahmet Zogu'], os: ['Ismail Qemali', 'Skënderbeu', 'Ali Pasha', 'Ahmet Zogu'], a: 1 },
      { q: ['In which city was independence declared in 1912?', 'Në cilin qytet u shpall pavarësia në vitin 1912?'], o: ['Tirana', 'Vlorë', 'Shkodër', 'Durrës'], os: ['Tirana', 'Vlora', 'Shkodra', 'Durrësi'], a: 1 },
      { q: ['On which date is Independence Day celebrated?', 'Në cilën datë festohet Dita e Pavarësisë?'], o: ['28 November', '29 November', '1 May', '11 January'], os: ['28 nëntor', '29 nëntor', '1 maji', '11 janari'], a: 0 }] }],
  exams: [
    { id: 1, subject: 'Math', title: 'Algebra test', date: addDays(5) },
    { id: 2, subject: 'History', title: 'World War II exam', date: addDays(12) }],
  hw: [
    { id: 1, subject: 'History', title: 'Essay: Causes of WWI', due: addDays(3), desc: 'Write about 150 words on why WWI started.',
      kw: ['alliance|aleanca', 'assassination|vrasja', 'nationalism|nacionalizmi', 'militarism|militarizmi', 'imperialism|imperializmi', 'ferdinand|ferdinandi'] },
    { id: 2, subject: 'Math', title: 'Worksheet 4', due: addDays(-1), desc: 'Complete questions 1-10.', kw: [] },
    { id: 3, subject: 'English', title: 'Book review', due: addDays(7), desc: 'Review the book you are reading.', kw: [] }],
  subs: [
    { id: 1, hw: 1, student: 'Mia', text: HUMAN, grade: null, fb: '', ai: null },
    { id: 2, hw: 1, student: 'Leo', text: BOTTY, grade: null, fb: '', ai: null },
    { id: 3, hw: 3, student: 'Alex', text: 'A fun read with a strong main character. The ending surprised me and I liked how the author kept the pace up.', grade: 88, fb: 'Great voice, add a few more quotes next time!', ai: null },
    { id: 4, hw: 1, student: 'Sam', text: 'The war began after the assassination of Franz Ferdinand. Alliances between countries pulled more nations in, and nationalism made people eager to fight.', grade: 74, fb: 'Good start, needs more on militarism.', ai: null },
    { id: 5, hw: 1, student: 'Nora', text: 'Several causes combined: militarism, alliances, imperialism and nationalism. The assassination of Archduke Ferdinand was the spark that set it all off.', grade: 91, fb: 'Excellent range of causes.', ai: null },
    { id: 6, hw: 3, student: 'Mia', text: 'I enjoyed the book, especially the friendship between the two main characters and how it changed over time.', grade: 80, fb: 'Nice personal take.', ai: null },
    { id: 7, hw: 3, student: 'Leo', text: 'It was ok. The plot was slow at the start but got better near the end.', grade: 65, fb: 'Say more about why.', ai: null },
    { id: 8, hw: 2, student: 'Mia', text: 'Answers 1-10 done.', grade: 95, fb: 'Perfect.', ai: null },
    { id: 9, hw: 2, student: 'Sam', text: 'Answers 1-10 done, question 7 was hard.', grade: 70, fb: 'Check question 7 again.', ai: null }],
  mails: [
    { id: 1, to: 'All students', subject: 'Welcome back!', body: 'New term starts today.', at: Date.now() - 864e5, sent: true },
    { id: 2, to: 'All students', subject: 'Homework reminder', body: 'Don’t forget the WWI essay.', at: Date.now() + 36e5, sent: false }]
});
/* teacher password: stored as a hash (demo-level protection only — it all runs in the browser) */
const hashPw = str => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i);
  h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16); };
/* Keep teacher sign-in through reloads in the current tab. */
const TEACHER_SESSION_KEY = 'studyhub.teacher-session';
let teacherAuthed = false;
try { teacherAuthed = sessionStorage.getItem(TEACHER_SESSION_KEY) === '1'; } catch {}
const isAuthed = () => teacherAuthed;
const setAuthed = v => {
  teacherAuthed = !!v;
  try {
    if (teacherAuthed) sessionStorage.setItem(TEACHER_SESSION_KEY, '1');
    else sessionStorage.removeItem(TEACHER_SESSION_KEY);
  } catch {}
};
let fails = 0, lockUntil = 0;
let S;
try { S = Object.assign(def(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = def(); }
if (!S.pwHash) S.pwHash = hashPw('chalkboard');
const USERFIELDS = ['subjects', 'times', 'tt', 'sessions', 'minutes', 'qres', 'streak', 'badges', 'plan'];
const blankUser = () => ({ subjects: [], times: [...DEFAULT_TIMES], tt: {}, sessions: 0, minutes: 0, qres: {}, streak: { last: '', count: 0, best: 0 }, badges: {}, plan: {} });
S.accounts.forEach(a => { if (!a.pwHash && a.user === 'alex') a.pwHash = hashPw('student'); if (!a.data) a.data = blankUser(); });
const me = () => S.accounts.find(a => a.id === S.me) || null;
const myName = () => (me() || { name: 'Guest' }).name;
const loadUser = a => { const d = a ? a.data : blankUser(); USERFIELDS.forEach(k => { S[k] = d[k]; }); };
const flushUser = () => { const a = me(); if (a) USERFIELDS.forEach(k => { a.data[k] = S[k]; }); };
S.me = null;
loadUser(null);
LANG = S.lang === 'en' ? 'en' : 'sq';
let syncing = false;   /* true while applying another tab's changes, so we never write them straight back */
const save = () => {
  if (syncing) return;
  flushUser();
  try { const o = { ...S }; USERFIELDS.forEach(k => delete o[k]); localStorage.setItem(KEY, JSON.stringify(o)); } catch {}
};
const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

/* ---------- ui helpers ---------- */
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 4000);
}
function modal(html, wide) {
  const m = $('#modal'); m.innerHTML = `<div class="mbox${wide ? ' wide' : ''}">${html}<p style="margin-top:1rem"><button class="btn ghost sm" data-act="close">${t('Close')}</button></p></div>`;
  m.hidden = false; m.scrollTop = 0;
}
function loginModal(msg = '') {
  const m = $('#modal');
  m.innerHTML = `<div class="mbox login"><h2>${t('Teacher sign-in')}</h2><p class="muted">${t('Enter the teacher password to continue.')}</p>
    <label for="pw">${t('Password')}</label><input id="pw" type="password" autocomplete="current-password"><div class="err">${esc(msg)}</div>
    <p style="margin-top:.8rem"><button class="btn" data-act="dologin">${t('Sign in')}</button> <button class="btn ghost" data-act="close">${t('Cancel')}</button></p></div>`;
  m.hidden = false; setTimeout(() => $('#pw') && $('#pw').focus(), 0);
}
function closeModal() {
  const m = $('#modal');
  if (String(m.innerHTML).includes('mbox danger')) bigDismissed = true;   /* closing the big warning = “remind me later” */
  m.hidden = true;
}
function confetti() {
  const c = $('#confetti'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const P = Array.from({ length: 150 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 15,
    vy: Math.random() * -12 - 4, r: Math.random() * 6 + 3, c: `hsl(${Math.random() * 360} 90% 60%)` }));
  let f = 0;
  (function go() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => { p.vy += .3; p.x += p.vx; p.y += p.vy; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.r, p.r * 1.6); });
    if (++f < 140) requestAnimationFrame(go); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- AI detection ---------- */
/* text helpers: accent-insensitive so “ë/ç” and “e/c” compare equal; works for Albanian and English */
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const kwLabel = k => { const p = String(k).split('|'); return (LANG === 'sq' && p[1]) ? p[1] : p[0]; };
const STOCK_EN = ['furthermore', 'moreover', 'in conclusion', 'it is important to note', 'delve', 'tapestry', 'testament', 'plays a crucial role',
  'multifaceted', 'landscape', 'underscore', 'pivotal', 'additionally', 'significant impact', 'in summary', 'it is worth noting', 'realm', 'interconnected'];
/* typical “polished AI” Albanian phrases, written without accents (matched on accent-stripped text) */
const STOCK_SQ = ['për më tepër', 'në përfundim', 'si përfundim', 'në përmbledhje', 'është e rëndësishme të theksohet', 'është e rëndësishme të vihet re', 'duhet theksuar',
  'rol thelbësor', 'rol kyç', 'shumëdimensional', 'në dritën e', 'përveç kësaj', 'ndërthur', 'kompleksitetin e', 'pikë kthese', 'në mënyrë të pandashme', 'në mënyrë domethënëse', 'kontribut të rëndësishëm'];
function heuristic(text) {
  const low = norm(text), words = low.match(/[a-z']+/g) || [];
  if (words.length < 25) return { score: null, reasons: [['Too short (under 25 words) to judge.']], src: 'Built-in estimate' };
  const sq = /[ëç]/i.test(text) || (low.match(/\b(dhe|eshte|nje|nga|nuk|ishte|jane|per|qe)\b/g) || []).length >= 3;
  const lens = text.split(/(?<=[.!?])\s+/).map(s => s.trim().split(/\s+/).length).filter(n => n > 2);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const cv = mean ? sd / mean : 1;
  let score = 20; const why = [];
  if (lens.length >= 3 && cv < .35) { score += 25; why.push(['Very even sentence lengths (low burstiness).']); }
  else if (lens.length >= 3 && cv < .5) { score += 10; why.push(['Fairly even sentence lengths.']); }
  const hits = (sq ? STOCK_SQ : STOCK_EN).filter(p => low.includes(norm(p)));
  if (hits.length) { score += Math.min(45, hits.length * 11); why.push(['Stock “AI-style” phrases: {0}.', hits.slice(0, 5).join(', ')]); }
  if (!sq && words.length > 60 && !/[a-z]'[a-z]/i.test(text)) { score += 8; why.push(['No contractions in a long text.']); }
  const firstPerson = sq ? /\b(une|mua|im|ime|mendoj|besoj|ndjej|pelqeu)\b/.test(low) : /\b(i|my|me)\b/i.test(text);
  if (!firstPerson && words.length > 60) { score += 7; why.push(['No first-person voice.']); }
  const casualEn = /\b(dont|wasnt|alot|u|im|cant|tho|gonna)\b/.test(low);
  const noDiacritics = sq && !/[ëç]/i.test(text) && /\b(eshte|nje|shume|cfare|per|qe)\b/.test(low);
  const lowerStarts = /(^|[.!?]\s+)\p{Ll}/u.test(text);
  if (noDiacritics) { score -= 25; why.push(['Typed without ë/ç, like everyday messages — more human.']); }
  else if (casualEn || lowerStarts) { score -= 25; why.push(['Casual typing habits (missing capitals / slang) — more human.']); }
  if (!why.length) why.push(['No strong signals either way.']);
  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons: why, src: 'Built-in estimate' };
}
async function detect(text) {
  if (S.apiKey) {
    try {
      const r = await fetch('https://api.sapling.ai/api/v1/aidetect', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: S.apiKey, text }) });
      const j = await r.json();
      if (typeof j.score === 'number') return { score: Math.round(j.score * 100), reasons: [['Score from the Sapling AI detector API.']], src: 'Sapling API' };
      throw new Error('bad response');
    } catch { toast(t('Sapling API unavailable — used the built-in estimate instead.')); }
  }
  return heuristic(text);
}
function aiBadge(ai) {
  if (!ai) return `<span class="b todo">${t('not scanned')}</span>`;
  if (ai.score == null) return `<span class="b todo">${t('too short')}</span>`;
  const cls = ai.score < 35 ? 'gr' : ai.score < 65 ? 'todo' : 'bad';
  const lbl = ai.score < 35 ? 'Likely human' : ai.score < 65 ? 'Uncertain' : 'Likely AI';
  return `<span class="b ${cls}">AI ${ai.score}% · ${t(lbl)}</span>`;
}
function autoGrade(sub) {
  const hw = S.hw.find(h => h.id === sub.hw) || { kw: [] };
  const text = tx(sub.text), low = norm(text);
  const words = (text.match(/\S+/g) || []).length, sents = (text.match(/[.!?]/g) || []).length;
  /* a key point can list alternatives in several languages: “alliance|aleanca”; we match on the word stem so “aleancat” still counts */
  const hit = k => k.split('|').some(v => { v = norm(v.trim()); return v && low.includes(v.slice(0, Math.max(4, v.length - 2))); });
  const found = hw.kw.filter(hit);
  const lenPts = Math.min(1, words / 120) * 50;
  const kwPts = hw.kw.length ? (found.length / hw.kw.length) * 40 : 30;
  const structPts = sents >= 4 ? 10 : sents * 2.5;
  const grade = Math.round(Math.min(100, lenPts + kwPts + structPts));
  let fb = t('{0} words. ', words);
  if (hw.kw.length) fb += t('Covered {0}/{1} key points', found.length, hw.kw.length) + (found.length ? ' (' + found.map(kwLabel).join(', ') + ')' : '') + '. ';
  fb += t(grade >= 80 ? 'Strong work.' : grade >= 60 ? 'Good, but add more detail.' : 'Needs more depth and structure.');
  if (sub.ai && sub.ai.score >= 65) fb += t(' Flagged by the AI check — please review.');
  return { grade, fb };
}

/* ---------- data ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LESSONS_PER_BREAK = 2, BREAK_LEN = 20, LESSON_LEN = 60;   /* lunch break after every 2 lessons (2 hours) */
const CATS = ['Ancient', 'Medieval', 'Early Modern', 'Modern'];
const EV = [
  { y: -2560, wiki: 'Great_Pyramid_of_Giza',
    en: { t: 'Great Pyramid of Giza built', d: 'Pharaoh Khufu’s tomb is completed — the tallest structure on Earth for nearly 4,000 years.',
      p: ['Around 2560 BCE, during Egypt’s Fourth Dynasty, workers finished the Great Pyramid as the tomb of Pharaoh Khufu. It rose to about 146 metres and was built from roughly 2.3 million stone blocks, many hauled from quarries along the Nile.',
          'For a long time people believed slaves built it. Archaeologists have since found the workers’ town nearby, with bakeries and housing, showing that organised crews of paid Egyptian labourers did the work over about twenty years. It stayed the tallest man-made structure in the world until the 1300s CE.'],
      f: ['Where: Giza, Egypt', 'Key people: Pharaoh Khufu; his vizier Hemiunu, thought to be the architect', 'Why it matters: it shows how advanced Egyptian engineering, mathematics and state organisation already were'] },
    sq: { t: 'Piramida e Madhe e Gizës u ndërtua', d: 'Varri i faraonit Khufu përfundon dhe mbetet struktura më e lartë në Tokë për gati 4000 vjet.',
      p: ['Rreth vitit 2560 p.e.s., gjatë Dinastisë së Katërt të Egjiptit, punëtorët përfunduan Piramidën e Madhe si varr për faraonin Khufu. Ajo arrinte rreth 146 metra lartësi dhe u ndërtua me afërsisht 2,3 milionë blloqe guri, shumë prej të cilëve u sollën nga guroret përgjatë Nilit.',
          'Për një kohë të gjatë njerëzit mendonin se e kishin ndërtuar skllevërit. Arkeologët kanë gjetur më pas qytezën e punëtorëve aty pranë, me furra buke dhe banesa, që tregon se punën për rreth njëzet vjet e kryen ekipe të organizuara punëtorësh egjiptianë të paguar. Ajo mbeti struktura më e lartë e ndërtuar nga njeriu deri në vitet 1300 të e.sonë.'],
      f: ['Ku: Giza, Egjipt', 'Figurat kryesore: faraoni Khufu; vezirri i tij Hemiunu, që mendohet të ketë qenë arkitekti', 'Pse ka rëndësi: tregon sa të përparuara ishin tashmë inxhinieria, matematika dhe organizimi i shtetit egjiptian'] } },
  { y: -776, wiki: 'Ancient_Olympic_Games',
    en: { t: 'First Olympic Games', d: 'Greek city-states gather at Olympia for athletic competition in honour of Zeus.',
      p: ['According to tradition, the first recorded Olympic Games were held in 776 BCE at Olympia, a sacred site in the western Peloponnese. They honoured Zeus, and at first the only event was a single sprint of about 192 metres, the stadion.',
          'Every four years a sacred truce was declared so athletes and spectators could travel safely, even between city-states at war. More events were added over time, including wrestling, chariot racing and the pentathlon. The Games continued for over a thousand years, until about 393 CE, and were revived in Athens in 1896.'],
      f: ['Where: Olympia, Greece', 'Key people: the athletes of the Greek city-states; the traditional first champion, Koroibos of Elis', 'Why it matters: the idea of peaceful competition between nations still lives in the modern Olympics'] },
    sq: { t: 'Lojërat e para Olimpike', d: 'Qytet-shtetet greke mblidhen në Olimpia për garat atletike në nder të Zeusit.',
      p: ['Sipas traditës, Lojërat e para Olimpike të regjistruara u zhvilluan në vitin 776 p.e.s. në Olimpia, një vend i shenjtë në Peloponezin perëndimor. Ato nderonin Zeusin dhe në fillim e vetmja garë ishte një vrapim i shkurtër prej rreth 192 metrash, i quajtur stadion.',
          'Çdo katër vjet shpallej një armëpushim i shenjtë, që atletët dhe shikuesit të udhëtonin të sigurt, edhe mes qytet-shteteve në luftë. Me kohë u shtuan gara të tjera, si mundja, garat me qerre dhe pentathloni. Lojërat vazhduan për mbi një mijë vjet, deri rreth vitit 393 të e.sonë, dhe u ringjallën në Athinë në vitin 1896.'],
      f: ['Ku: Olimpia, Greqi', 'Figurat kryesore: atletët e qytet-shteteve greke; kampioni i parë sipas traditës, Koroibosi i Elidës', 'Pse ka rëndësi: ideja e garës paqësore mes kombeve jeton ende në Lojërat Olimpike moderne'] } },
  { y: -509, wiki: 'Capitoline_Brutus',
    en: { t: 'Roman Republic founded', d: 'Rome expels its last king and begins a republic run by elected officials.',
      p: ['Roman tradition says that in 509 BCE the Romans drove out their last king, Tarquin the Proud, after years of resentment at royal rule. Leaders such as Lucius Junius Brutus were remembered as the heroes of the change.',
          'In place of a king, Rome chose two consuls every year, who shared power and could check each other, with the Senate advising them. This system of shared, time-limited power influenced many later governments. The Republic lasted almost 500 years, until Augustus became the first emperor in 27 BCE.'],
      f: ['Where: Rome, Italy', 'Key people: Lucius Junius Brutus; Tarquin the Proud, the last king', 'Why it matters: it is an early model of elected officials and shared power, ideas later used in modern republics'] },
    sq: { t: 'Themelimi i Republikës Romake', d: 'Roma dëbon mbretin e fundit dhe krijon një republikë të drejtuar nga zyrtarë të zgjedhur.',
      p: ['Sipas traditës romake, në vitin 509 p.e.s. romakët dëbuan mbretin e tyre të fundit, Tarkuinin Krenar, pas vitesh pakënaqësie ndaj sundimit mbretëror. Udhëheqës si Lucius Junius Brutus u kujtuan si heronjtë e ndryshimit.',
          'Në vend të një mbreti, Roma zgjidhte çdo vit dy konsuj, që ndanin pushtetin dhe mund ta frenonin njëri-tjetrin, ndërsa Senati i këshillonte. Ky sistem pushteti të ndarë dhe të kufizuar në kohë ndikoi shumë qeveri të mëvonshme. Republika zgjati gati 500 vjet, deri kur Augusti u bë perandori i parë në vitin 27 p.e.s.'],
      f: ['Ku: Romë, Itali', 'Figurat kryesore: Lucius Junius Brutus; Tarkuini Krenar, mbreti i fundit', 'Pse ka rëndësi: është një model i hershëm i zyrtarëve të zgjedhur dhe i pushtetit të ndarë, ide që u përdorën më vonë nga republikat moderne'] } },
  { y: 476, wiki: 'Romulus_Augustulus',
    en: { t: 'Fall of Western Rome', d: 'The last Western Roman emperor is deposed, traditionally marking the start of the Middle Ages.',
      p: ['On 4 September 476 CE, the Germanic general Odoacer removed the teenage emperor Romulus Augustulus from power. Odoacer did not name a new emperor in the West; he sent the imperial regalia to Constantinople and ruled Italy himself.',
          'Rome had been weakened for decades by civil wars, economic trouble and pressure from migrating peoples. Historians now see the end of the Western Empire as a slow transformation rather than a sudden collapse, but 476 is the date traditionally used for the start of the Middle Ages. The Eastern, or Byzantine, Empire carried on for almost another thousand years, until 1453.'],
      f: ['Where: Ravenna, Italy', 'Key people: Odoacer; Romulus Augustulus, the last Western emperor', 'Why it matters: it marks the shift from the ancient world to medieval Europe'] },
    sq: { t: 'Rënia e Perandorisë Romake Perëndimore', d: 'Perandori i fundit romak perëndimor rrëzohet, duke shënuar zakonisht fillimin e Mesjetës.',
      p: ['Më 4 shtator 476 të e.sonë, gjenerali gjermanik Odoakri e hoqi nga froni perandorin e ri Romulus Augustulin. Odoakri nuk emëroi perandor të ri në Perëndim; i dërgoi shenjat perandorake në Kostandinopojë dhe e qeverisi vetë Italinë.',
          'Roma ishte dobësuar për dekada me luftëra civile, vështirësi ekonomike dhe trysni nga popujt që migronin. Sot historianët e shohin fundin e Perandorisë Perëndimore si një ndryshim të ngadaltë dhe jo si një shembje të menjëhershme, por viti 476 përdoret tradicionalisht si fillimi i Mesjetës. Perandoria Lindore, ose Bizantine, vazhdoi edhe gati një mijë vjet, deri në vitin 1453.'],
      f: ['Ku: Ravena, Itali', 'Figurat kryesore: Odoakri; Romulus Augustuli, perandori i fundit perëndimor', 'Pse ka rëndësi: shënon kalimin nga bota antike në Evropën mesjetare'] } },
  { y: 1066, wiki: 'Battle_of_Hastings',
    en: { t: 'Norman Conquest', d: 'William of Normandy wins the Battle of Hastings and becomes King of England.',
      p: ['In January 1066 the English king Edward the Confessor died without an heir. Harold Godwinson was crowned, but William, Duke of Normandy, claimed that Edward had promised him the throne. On 14 October William’s army defeated Harold’s at the Battle of Hastings, and Harold was killed.',
          'William was crowned king on Christmas Day 1066 and replaced much of the English nobility with Normans. He ordered the Domesday Book in 1086, a huge survey of land and property. Thousands of French words entered English, which is one reason English often has two words for similar things, like “cow” and “beef”. The story is told in the Bayeux Tapestry.'],
      f: ['Where: Hastings, southern England', 'Key people: William the Conqueror; King Harold II', 'Why it matters: it changed the English language, law, land ownership and ruling class for centuries'] },
    sq: { t: 'Pushtimi norman', d: 'Uilliam i Normandisë fiton Betejën e Hastingsit dhe bëhet mbret i Anglisë.',
      p: ['Në janar të vitit 1066 mbreti anglez Eduardi Rrëfimtari vdiq pa trashëgimtar. Haroldi, biri i Godvinit, u kurorëzua, por Uilliami, Duka i Normandisë, pretendonte se Eduardi i kishte premtuar fronin. Më 14 tetor ushtria e Uilliamit mundi atë të Haroldit në Betejën e Hastingsit, dhe Haroldi u vra.',
          'Uilliami u kurorëzua mbret ditën e Krishtlindjeve të vitit 1066 dhe e zëvendësoi pjesën më të madhe të fisnikërisë angleze me normanë. Në vitin 1086 urdhëroi Librin Domesday, një regjistrim i madh i tokave dhe pronave. Mijëra fjalë franceze hynë në anglisht, prandaj anglishtja shpesh ka dy fjalë për gjëra të ngjashme, si “cow” (lopë) dhe “beef” (mish gjedhi). Historia tregohet në Tapicerinë e Bajeut.'],
      f: ['Ku: Hastings, Anglia jugore', 'Figurat kryesore: Uilliami Pushtuesi; mbreti Harold II', 'Pse ka rëndësi: ndryshoi gjuhën, ligjin, pronësinë e tokës dhe klasën sunduese angleze për shekuj'] } },
  { y: 1215, wiki: 'Magna_Carta',
    en: { t: 'Magna Carta signed', d: 'King John accepts limits on royal power, a milestone for the rule of law.',
      p: ['By 1215 King John of England had angered his barons with heavy taxes, costly failed wars and arbitrary punishments. Rebel barons took London, and on 15 June at Runnymede, by the River Thames, John agreed to a charter of rights and sealed it.',
          'Magna Carta (“Great Charter”) said the king was not above the law. One famous clause promised that no free man could be imprisoned or punished except by the lawful judgment of his equals or by the law of the land. The Pope annulled it within a few months and civil war followed, but it was reissued after John died and became a symbol of limits on power, later inspiring documents like the US Constitution.'],
      f: ['Where: Runnymede, near London', 'Key people: King John; the rebel barons; Archbishop Stephen Langton', 'Why it matters: it planted the idea that even rulers must obey the law'] },
    sq: { t: 'Nënshkrimi i Magna Carta-s', d: 'Mbreti Gjon pranon kufizime të pushtetit mbretëror, një moment i rëndësishëm për shtetin e së drejtës.',
      p: ['Deri në vitin 1215 mbreti Gjon i Anglisë i kishte zemëruar baronët me taksa të rënda, luftëra të kushtueshme e të dështuara dhe ndëshkime arbitrare. Baronët kryengritës pushtuan Londrën dhe më 15 qershor në Runnymede, buzë lumit Tamiz, Gjoni pranoi një kartë të drejtash dhe e vulosi.',
          'Magna Carta (“Karta e Madhe”) thoshte se mbreti nuk qëndron mbi ligjin. Një nen i njohur premtonte se asnjë njeri i lirë nuk mund të burgosej ose ndëshkohej pa gjykimin e ligjshëm të të barabartëve të tij ose pa ligjin e vendit. Papa e anuloi brenda disa muajsh dhe pasoi lufta civile, por pas vdekjes së Gjonit ajo u rishpall dhe u bë simbol i kufizimit të pushtetit, duke frymëzuar më vonë dokumente si Kushtetuta e SHBA-së.'],
      f: ['Ku: Runnymede, pranë Londrës', 'Figurat kryesore: mbreti Gjon; baronët kryengritës; kryepeshkopi Stephen Langton', 'Pse ka rëndësi: hodhi idenë se edhe sunduesit duhet t’i bindën ligjit'] } },
  { y: 1440, wiki: 'Printing_press',
    en: { t: 'Printing press invented', d: 'Gutenberg’s movable-type press spreads books and ideas across Europe.',
      p: ['Around 1440 the goldsmith Johannes Gutenberg of Mainz, Germany, developed a printing system with movable metal letters, an oil-based ink and a press adapted from wine and olive presses. Letters could be rearranged and reused to print any text.',
          'Before this, books were copied by hand and were extremely expensive. Gutenberg’s Bible, printed around 1455, was one of the first major books made this way. Within fifty years printers worked in hundreds of European towns and millions of books were in circulation, spreading ideas about science, religion and politics far faster than before.'],
      f: ['Where: Mainz, Germany', 'Key people: Johannes Gutenberg; his partner Johann Fust', 'Why it matters: cheap books helped spark the Renaissance, the Reformation and the Scientific Revolution'] },
    sq: { t: 'Shpikja e shtypshkronjës', d: 'Shtypshkronja me shkronja të lëvizshme e Gutenbergut përhap librat dhe idetë në të gjithë Evropën.',
      p: ['Rreth vitit 1440 mjeshtri i metaleve të çmuara Johannes Gutenberg nga Mainzi i Gjermanisë zhvilloi një sistem shtypjeje me shkronja metalike të lëvizshme, bojë me bazë vaji dhe një presë të përshtatur nga preset e verës dhe të vajit të ullirit. Shkronjat mund të riorganizoheshin dhe të ripërdoreshin për të shtypur çdo tekst.',
          'Para kësaj, librat kopjoheshin me dorë dhe kushtonin shumë. Bibla e Gutenbergut, shtypur rreth vitit 1455, ishte një nga librat e parë të mëdhenj të bërë kështu. Brenda pesëdhjetë vjetësh shtypshkronjat vepronin në qindra qytete evropiane dhe miliona libra qarkullonin, duke përhapur idetë për shkencën, fenë dhe politikën shumë më shpejt se më parë.'],
      f: ['Ku: Mainz, Gjermani', 'Figurat kryesore: Johannes Gutenberg; partneri i tij Johann Fust', 'Pse ka rëndësi: librat e lirë ndihmuan të ndizeshin Rilindja, Reformimi dhe Revolucioni Shkencor'] } },
  { y: 1443, wiki: 'Skanderbeg',
    en: { t: 'Skanderbeg raises the banner of rebellion', d: 'Gjergj Kastrioti Skanderbeg leaves the Ottoman army, takes Krujë and begins leading the Albanian resistance.',
      p: ['Gjergj Kastrioti was taken from his Albanian family as a boy and raised at the Ottoman court, where he became a skilled commander known as Iskander Bey. In November 1443, during an Ottoman campaign in the Balkans, he left the army with a few hundred Albanian horsemen and returned to Albania.',
          'Tradition says he took the fortress of Krujë on 28 November 1443 with the help of a forged letter and raised the red flag with the black double-headed eagle. In March 1444 Albanian princes met in Lezhë and formed a league under his leadership. For about 25 years, until his death in 1468, he defeated or held off several large Ottoman armies. Popes praised him as a “Champion of Christ”, and in Albania he is the national hero.'],
      f: ['Where: Krujë and Lezhë, Albania', 'Key people: Gjergj Kastrioti Skanderbeg; Sultans Murad II and Mehmed II, his opponents', 'Why it matters: his resistance became the symbol of Albanian identity, courage and unity'] },
    sq: { t: 'Skënderbeu ngre flamurin e kryengritjes', d: 'Gjergj Kastrioti Skënderbeu braktis ushtrinë osmane, merr Krujën dhe fillon të udhëheqë rezistencën shqiptare.',
      p: ['Gjergj Kastrioti u mor fëmijë nga familja e tij shqiptare dhe u rrit në oborrin osman, ku u bë komandant i aftë i njohur si Iskander Bej. Në nëntor të vitit 1443, gjatë një fushate osmane në Ballkan, ai e braktisi ushtrinë me disa qindra kalorës shqiptarë dhe u kthye në Shqipëri.',
          'Tradita thotë se ai e mori kalanë e Krujës më 28 nëntor 1443 me ndihmën e një letre të falsifikuar dhe ngriti flamurin e kuq me shqiponjën e zezë dykrenare. Në mars të vitit 1444 princat shqiptarë u mblodhën në Lezhë dhe krijuan një lidhje nën udhëheqjen e tij. Për rreth 25 vjet, deri në vdekjen e tij në vitin 1468, ai mundi ose frenoi disa ushtri të mëdha osmane. Papët e lavdëruan si “Kampion i Krishtit”, dhe në Shqipëri ai është heroi kombëtar.'],
      f: ['Ku: Krujë dhe Lezhë, Shqipëri', 'Figurat kryesore: Gjergj Kastrioti Skënderbeu; sulltanët Murati II dhe Mehmedi II, kundërshtarët e tij', 'Pse ka rëndësi: rezistenca e tij u bë simbol i identitetit, guximit dhe unitetit shqiptar'] } },
  { y: 1492, wiki: 'Christopher_Columbus',
    en: { t: 'Columbus reaches the Americas', d: 'Christopher Columbus’s first voyage opens lasting contact between Europe and the Americas.',
      p: ['On 12 October 1492, after about two months at sea, Christopher Columbus and his crew of three ships — the Santa María, the Pinta and the Niña — sighted land in the Bahamas. He had sailed from Spain, funded by Queen Isabella I and King Ferdinand II, hoping to find a western sea route to Asia.',
          'Columbus believed he had reached the edge of Asia, but he had arrived in lands already home to millions of Indigenous people. His voyages began lasting contact between Europe and the Americas. This brought new crops and animals across the Atlantic — the Columbian Exchange — but also devastating disease, conquest and slavery for Indigenous peoples. Historians today discuss his legacy critically.'],
      f: ['Where: the Bahamas, Caribbean', 'Key people: Christopher Columbus; Queen Isabella I and King Ferdinand II of Spain', 'Why it matters: it started continuous contact between the Old and New Worlds, with huge consequences for both'] },
    sq: { t: 'Kolombi arrin në Amerikë', d: 'Udhëtimi i parë i Kristofor Kolombit hap kontaktin e qëndrueshëm mes Evropës dhe Amerikës.',
      p: ['Më 12 tetor 1492, pas rreth dy muajsh në det, Kristofor Kolombi dhe ekuipazhi i tij me tri anije — Santa María, Pinta dhe Niña — pikasën tokën në Bahama. Ai kishte lundruar nga Spanja, i financuar nga mbretëresha Izabela I dhe mbreti Ferdinandi II, duke shpresuar të gjente një rrugë detare perëndimore drejt Azisë.',
          'Kolombi besonte se kishte arritur buzë Azisë, por kishte mbërritur në toka ku jetonin tashmë miliona banorë vendas. Udhëtimet e tij nisën kontaktin e qëndrueshëm mes Evropës dhe Amerikës. Kjo solli kultura bujqësore dhe kafshë të reja përtej Atlantikut — Shkëmbimi Kolumbian — por edhe sëmundje shkatërruese, pushtim dhe skllavëri për popujt vendas. Sot historianët e diskutojnë trashëgiminë e tij në mënyrë kritike.'],
      f: ['Ku: Bahama, Karaibe', 'Figurat kryesore: Kristofor Kolombi; mbretëresha Izabela I dhe mbreti Ferdinandi II i Spanjës', 'Pse ka rëndësi: nisi kontaktin e vazhdueshëm mes Botës së Vjetër dhe të Re, me pasoja të mëdha për të dyja'] } },
  { y: 1517, wiki: 'Ninety-five_Theses',
    en: { t: 'The Reformation begins', d: 'Martin Luther publishes his Ninety-five Theses, splitting Western Christianity.',
      p: ['On 31 October 1517 the German monk and professor Martin Luther sent his Ninety-five Theses to church leaders in Wittenberg. They criticised the sale of indulgences — certificates that people paid for in the belief that they reduced punishment for sins. A popular story says he nailed them to the church door; historians are unsure.',
          'Thanks to the printing press, copies spread across Germany within weeks. Luther refused to take back his views at the Diet of Worms in 1521 and later translated the Bible into German so ordinary people could read it. The movement split Western Christianity into Catholic and Protestant churches and led to wars, new states and changes in education and politics.'],
      f: ['Where: Wittenberg, Germany', 'Key people: Martin Luther; Pope Leo X; Emperor Charles V', 'Why it matters: it broke the unity of Western Christianity and reshaped European politics and culture'] },
    sq: { t: 'Fillon Reformimi', d: 'Martin Luteri boton 95 tezat e tij, duke ndarë krishterimin perëndimor.',
      p: ['Më 31 tetor 1517 murgu dhe profesori gjerman Martin Luteri dërgoi 95 tezat e tij te udhëheqësit e kishës në Vitenberg. Ato kritikonin shitjen e indulgjencave — certifikata që njerëzit i paguanin duke besuar se pakësonin ndëshkimin për mëkatet. Një histori e njohur thotë se i gozhdoi në derën e kishës; historianët nuk janë të sigurt.',
          'Falë shtypshkronjës, kopje u përhapën në të gjithë Gjermaninë brenda javësh. Luteri refuzoi të tërhiqej nga pikëpamjet e tij në Dietën e Vormsit në vitin 1521 dhe më vonë e përktheu Biblën në gjermanisht që njerëzit e thjeshtë ta lexonin. Lëvizja e ndau krishterimin perëndimor në kisha katolike dhe protestante dhe solli luftëra, shtete të reja dhe ndryshime në arsim e politikë.'],
      f: ['Ku: Vitenberg, Gjermani', 'Figurat kryesore: Martin Luteri; Papa Leoni X; perandori Karli V', 'Pse ka rëndësi: theu unitetin e krishterimit perëndimor dhe ndryshoi politikën e kulturën evropiane'] } },
  { y: 1789, wiki: 'French_Revolution',
    en: { t: 'French Revolution', d: 'The storming of the Bastille starts a revolution that ends the monarchy in France.',
      p: ['In the summer of 1789 France was deep in debt, bread was expensive and ordinary people had little say under King Louis XVI. On 14 July a Paris crowd stormed the Bastille, a royal fortress and prison, searching for weapons and gunpowder. It held only seven prisoners, but it was a hated symbol of royal power.',
          'In August the new National Assembly adopted the Declaration of the Rights of Man and of the Citizen, proclaiming liberty and equality before the law. The monarchy was abolished in 1792 and Louis XVI was executed in 1793. The Revolution then turned violent, and in 1799 Napoleon Bonaparte took power. Its ideas — “Liberty, Equality, Fraternity” — spread across Europe and the world.'],
      f: ['Where: Paris, France', 'Key people: Louis XVI; Maximilien Robespierre; Napoleon Bonaparte', 'Why it matters: it ended absolute monarchy in France and spread ideas of citizens’ rights'] },
    sq: { t: 'Revolucioni Francez', d: 'Sulmi mbi Bastijen nis një revolucion që i jep fund monarkisë në Francë.',
      p: ['Në verën e vitit 1789 Franca ishte thellë në borxhe, buka ishte e shtrenjtë dhe njerëzit e thjeshtë kishin pak zë nën mbretin Luigji XVI. Më 14 korrik një turmë në Paris sulmoi Bastijen, një kala dhe burg mbretëror, duke kërkuar armë dhe barut. Aty kishte vetëm shtatë të burgosur, por ishte simbol i urryer i pushtetit mbretëror.',
          'Në gusht Asambleja e re Kombëtare miratoi Deklaratën e të Drejtave të Njeriut dhe të Qytetarit, që shpallte lirinë dhe barazinë para ligjit. Monarkia u shfuqizua në vitin 1792 dhe Luigji XVI u ekzekutua në vitin 1793. Pastaj Revolucioni u bë i dhunshëm dhe në vitin 1799 pushtetin e mori Napoleon Bonaparti. Idetë e tij — “Liri, Barazi, Vëllazëri” — u përhapën në Evropë dhe në botë.'],
      f: ['Ku: Paris, Francë', 'Figurat kryesore: Luigji XVI; Maximilien Robespierre; Napoleon Bonaparti', 'Pse ka rëndësi: i dha fund monarkisë absolute në Francë dhe përhapi idetë për të drejtat e qytetarëve'] } },
  { y: 1903, wiki: 'Wright_Flyer',
    en: { t: 'First powered flight', d: 'The Wright brothers fly at Kitty Hawk for 12 seconds.',
      p: ['On 17 December 1903, on the windy sand dunes of Kitty Hawk, North Carolina, Orville Wright made the first controlled, powered flight in a heavier-than-air machine. The Wright Flyer stayed in the air for 12 seconds and covered about 37 metres.',
          'Brothers Orville and Wilbur ran a bicycle shop in Ohio. They studied birds, built a wind tunnel and invented a way to steer by twisting the wings. Later the same day Wilbur flew for 59 seconds and about 260 metres. Within a few decades aeroplanes were used in wars, mail delivery and passenger travel, shrinking the world.'],
      f: ['Where: Kitty Hawk, North Carolina, USA', 'Key people: Orville and Wilbur Wright', 'Why it matters: it began the age of aviation and changed travel, trade and war'] },
    sq: { t: 'Fluturimi i parë me motor', d: 'Vëllezërit Rajt fluturojnë në Kitty Hawk për 12 sekonda.',
      p: ['Më 17 dhjetor 1903, në dunat e erërave të Kitty Hawk, Karolina e Veriut, Orvil Rajt realizoi fluturimin e parë të kontrolluar me motor në një makinë më të rëndë se ajri. “Wright Flyer” qëndroi në ajër 12 sekonda dhe përshkoi rreth 37 metra.',
          'Vëllezërit Orvil dhe Uilbur kishin një dyqan biçikletash në Ohajo. Ata studiuan zogjtë, ndërtuan një tunel ere dhe shpikën një mënyrë për ta drejtuar avionin duke përdredhur krahët. Më vonë po atë ditë Uilburi fluturoi 59 sekonda dhe rreth 260 metra. Brenda disa dekadash avionët u përdorën në luftëra, për postën dhe për udhëtarët, duke e bërë botën më të vogël.'],
      f: ['Ku: Kitty Hawk, Karolina e Veriut, SHBA', 'Figurat kryesore: Orvil dhe Uilbur Rajt', 'Pse ka rëndësi: nisi epokën e aviacionit dhe ndryshoi udhëtimin, tregtinë dhe luftën'] } },
  { y: 1912, wiki: 'Albanian_Declaration_of_Independence',
    en: { t: 'Albania declares independence', d: 'On 28 November, Ismail Qemali raises the flag in Vlorë and proclaims Albania’s independence from the Ottoman Empire.',
      p: ['For more than 400 years Albania had been part of the Ottoman Empire. In 1912, with the Balkan Wars starting and neighbouring countries ready to divide Albanian lands, Albanian leaders gathered in the port city of Vlorë. On 28 November, Ismail Qemali raised the red-and-black flag and proclaimed the independence of Albania.',
          'A provisional government was formed under Qemali. In 1913 the Great Powers recognised an independent Albania at the Conference of London, but they drew its borders so that many Albanians were left outside the new state. 28 November is still celebrated every year as Independence Day, and the double-headed eagle flag is remembered as the “Flag of Vlorë”.'],
      f: ['Where: Vlorë, Albania', 'Key people: Ismail Qemali, who led the first government; delegates from across the Albanian lands', 'Why it matters: it created the modern Albanian state and is celebrated as Independence Day on 28 November'] },
    sq: { t: 'Shqipëria shpall pavarësinë', d: 'Më 28 Nëntor, Ismail Qemali ngre flamurin në Vlorë dhe shpall pavarësinë e Shqipërisë nga Perandoria Osmane.',
      p: ['Për më shumë se 400 vjet Shqipëria kishte qenë pjesë e Perandorisë Osmane. Në vitin 1912, kur nisën Luftërat Ballkanike dhe shtetet fqinje po përgatiteshin të ndanin trojet shqiptare, udhëheqësit shqiptarë u mblodhën në qytetin port të Vlorës. Më 28 nëntor Ismail Qemali ngriti flamurin kuq e zi dhe shpalli pavarësinë e Shqipërisë.',
          'Nën drejtimin e Qemalit u krijua një qeveri e përkohshme. Në vitin 1913 Fuqitë e Mëdha e njohën Shqipërinë e pavarur në Konferencën e Londrës, por i vizatuan kufijtë në mënyrë që shumë shqiptarë mbetën jashtë shtetit të ri. Më 28 nëntor festohet ende çdo vit si Dita e Pavarësisë dhe flamuri me shqiponjën dykrenare kujtohet si “Flamuri i Vlorës”.'],
      f: ['Ku: Vlorë, Shqipëri', 'Figurat kryesore: Ismail Qemali, që udhëhoqi qeverinë e parë; delegatë nga trojet shqiptare', 'Pse ka rëndësi: krijoi shtetin modern shqiptar dhe festohet si Dita e Pavarësisë më 28 nëntor'] } },
  { y: 1914, wiki: 'World_War_I',
    en: { t: 'World War I begins', d: 'The assassination of Archduke Franz Ferdinand triggers a chain of alliances and war.',
      p: ['On 28 June 1914 the Bosnian Serb Gavrilo Princip shot Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, in Sarajevo. Austria-Hungary blamed Serbia and declared war on 28 July. Because Europe was split into alliances, other countries were quickly pulled in: Russia, Germany, France and Britain.',
          'The war ground into trench warfare on the Western Front, with new weapons such as machine guns, poison gas and tanks. It ended on 11 November 1918 after roughly 10 million soldiers had died. The peace treaties redrew the map of Europe, ended four empires and left resentments that helped cause World War II.'],
      f: ['Where: Sarajevo, then across Europe, Africa and the Middle East', 'Key people: Gavrilo Princip; Archduke Franz Ferdinand; Kaiser Wilhelm II', 'Why it matters: it was the first global industrial war and reshaped borders, empires and societies'] },
    sq: { t: 'Fillon Lufta I Botërore', d: 'Vrasja e Arkdukës Franc Ferdinand shkakton një zinxhir aleancash dhe luftë.',
      p: ['Më 28 qershor 1914 serbi boshnjak Gavrilo Princip qëlloi në Sarajevë Arkdukën Franc Ferdinand, trashëgimtarin e fronit austro-hungarez. Austro-Hungaria fajësoi Serbinë dhe i shpalli luftë më 28 korrik. Meqë Evropa ishte ndarë në aleanca, vende të tjera u përfshinë shpejt: Rusia, Gjermania, Franca dhe Britania.',
          'Lufta u kthye në luftë llogoresh në Frontin Perëndimor, me armë të reja si mitralozët, gazi helmues dhe tanket. Mbaroi më 11 nëntor 1918, pasi kishin vdekur rreth 10 milionë ushtarë. Traktatet e paqes e rivizatuan hartën e Evropës, i dhanë fund katër perandorive dhe lanë mëri që ndihmuan të shpërthente Lufta e Dytë Botërore.'],
      f: ['Ku: Sarajevë, pastaj në Evropë, Afrikë dhe Lindjen e Mesme', 'Figurat kryesore: Gavrilo Princip; Arkduka Franc Ferdinand; kajzeri Vilhelm II', 'Pse ka rëndësi: ishte lufta e parë industriale botërore dhe ndryshoi kufijtë, perandoritë dhe shoqëritë'] } },
  { y: 1939, wiki: 'World_War_II',
    en: { t: 'World War II begins', d: 'Germany invades Poland; Britain and France declare war.',
      p: ['On 1 September 1939 Nazi Germany invaded Poland. Britain and France had promised to defend Poland and declared war on 3 September. Over the next six years the war spread across Europe, Africa, Asia and the oceans, with the Allies, including Britain, the Soviet Union and the USA, fighting the Axis powers of Germany, Italy and Japan.',
          'It was the deadliest conflict in history, with an estimated 70 to 85 million deaths, including six million Jews murdered in the Holocaust. Albania was invaded by Italy on 7 April 1939 and later occupied by Germany; Albanian partisans fought back and the country was liberated on 29 November 1944. The war ended in 1945 and led to the United Nations and the Cold War.'],
      f: ['Where: began in Poland; fought worldwide', 'Key people: Adolf Hitler; Winston Churchill; Franklin D. Roosevelt; Joseph Stalin', 'Why it matters: it reshaped world politics, led to the UN and showed the cost of hatred and dictatorship'] },
    sq: { t: 'Fillon Lufta II Botërore', d: 'Gjermania pushton Poloninë; Britania dhe Franca shpallin luftë.',
      p: ['Më 1 shtator 1939 Gjermania naziste pushtoi Poloninë. Britania dhe Franca kishin premtuar ta mbronin Poloninë dhe i shpallën luftë më 3 shtator. Gjatë gjashtë viteve të ardhshme lufta u përhap në Evropë, Afrikë, Azi dhe oqeane, me Aleatët, përfshirë Britaninë, Bashkimin Sovjetik dhe SHBA-në, kundër fuqive të Boshtit: Gjermanisë, Italisë dhe Japonisë.',
          'Ishte konflikti më vdekjeprurës në histori, me një vlerësim prej 70 deri në 85 milionë të vdekur, përfshirë gjashtë milionë çifutë të vrarë në Holokaust. Shqipëria u pushtua nga Italia më 7 prill 1939 dhe më vonë u pushtua nga Gjermania; partizanët shqiptarë luftuan dhe vendi u çlirua më 29 nëntor 1944. Lufta mbaroi në vitin 1945 dhe çoi te Kombet e Bashkuara dhe Lufta e Ftohtë.'],
      f: ['Ku: nisi në Poloni; u zhvillua në mbarë botën', 'Figurat kryesore: Adolf Hitleri; Uinston Çërçilli; Franklin D. Ruzvelti; Josif Stalini', 'Pse ka rëndësi: ndryshoi politikën botërore, çoi te OKB-ja dhe tregoi çmimin e urrejtjes dhe të diktaturës'] } },
  { y: 1969, wiki: 'Apollo_11',
    en: { t: 'Moon landing', d: 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin walk on the Moon.',
      p: ['On 16 July 1969 a Saturn V rocket launched Apollo 11 from Florida with Neil Armstrong, Buzz Aldrin and Michael Collins. On 20 July the lunar module “Eagle” landed in the Sea of Tranquility while Collins orbited above in the command module.',
          'Armstrong stepped onto the surface and said, “That’s one small step for man, one giant leap for mankind.” He and Aldrin spent about two and a half hours outside, collecting around 21 kilograms of rock and soil, and planting a flag. An estimated 600 million people watched on television. The mission fulfilled President Kennedy’s 1961 goal of landing a person on the Moon before the decade ended.'],
      f: ['Where: the Sea of Tranquility, the Moon (launched from Florida, USA)', 'Key people: Neil Armstrong, Buzz Aldrin, Michael Collins', 'Why it matters: the first time humans set foot on another world, a peak of the Space Race'] },
    sq: { t: 'Zbarkimi në Hënë', d: 'Astronautët e Apollo 11, Nil Armstrong dhe Baz Oldrin, ecin në Hënë.',
      p: ['Më 16 korrik 1969 një raketë Saturn V e lëshoi Apollo 11 nga Florida me Nil Armstrongun, Baz Oldrinin dhe Majkëll Kolinsin. Më 20 korrik moduli hënor “Eagle” zbarkoi në Detin e Qetësisë, ndërsa Kolinsi qarkullonte sipër në modulin komandues.',
          'Armstrongu hapi mbi sipërfaqe dhe tha: “Ky është një hap i vogël për njeriun, një hov gjigant për njerëzimin.” Ai dhe Oldrini kaluan rreth dy orë e gjysmë jashtë, duke mbledhur rreth 21 kilogramë shkëmbinj dhe tokë dhe duke ngulur një flamur. Rreth 600 milionë njerëz e ndoqën në televizor. Misioni përmbushi objektivin e Presidentit Kenedi të vitit 1961: të ulej një njeri në Hënë para fundit të dekadës.'],
      f: ['Ku: Deti i Qetësisë, në Hënë (nisja nga Florida, SHBA)', 'Figurat kryesore: Nil Armstrongu, Baz Oldrini, Majkëll Kolinsi', 'Pse ka rëndësi: hera e parë që njerëzit shkelën në një botë tjetër, kulmi i Garës Hapësinore'] } },
  { y: 1989, wiki: 'Berlin_Wall',
    en: { t: 'Berlin Wall falls', d: 'East and West Berliners cross freely, a symbol of the end of the Cold War.',
      p: ['The Berlin Wall was built by East Germany in August 1961 to stop its citizens fleeing to the West. For 28 years it split Berlin with concrete, barbed wire and guard towers, and about 155 kilometres of barrier surrounded West Berlin. Families and friends were cut off from one another.',
          'In 1989 communist governments across Eastern Europe were weakening under peaceful protests. On 9 November an East German official announced by mistake that the borders were open “immediately”. Thousands rushed to the checkpoints, the guards let them through, and people began to dismantle the Wall. Germany was reunified on 3 October 1990, and the Soviet Union collapsed in 1991.'],
      f: ['Where: Berlin, Germany', 'Key people: ordinary Berliners; East German official Günter Schabowski', 'Why it matters: it became the symbol of the end of the Cold War and of a divided Europe'] },
    sq: { t: 'Bie Muri i Berlinit', d: 'Berlinasit lindorë dhe perëndimorë kalojnë lirisht, simbol i fundit të Luftës së Ftohtë.',
      p: ['Muri i Berlinit u ndërtua nga Gjermania Lindore në gusht të vitit 1961 për t’i ndaluar qytetarët e saj të ikin në Perëndim. Për 28 vjet ai e ndau Berlinin me beton, tela me gjemba dhe kulla roje, dhe rreth 155 kilometra pengesë rrethonte Berlinin Perëndimor. Familje e miq u ndanë nga njëri-tjetri.',
          'Në vitin 1989 qeveritë komuniste në Evropën Lindore po dobësoheshin nën protesta paqësore. Më 9 nëntor një zyrtar i Gjermanisë Lindore njoftoi gabimisht se kufijtë ishin të hapur “menjëherë”. Mijëra njerëz vrapuan te pikat e kalimit, rojet i lanë të kalonin dhe njerëzit nisën ta shembin Murin. Gjermania u ribashkua më 3 tetor 1990 dhe Bashkimi Sovjetik u shpërbë në vitin 1991.'],
      f: ['Ku: Berlin, Gjermani', 'Figurat kryesore: berlinasit e thjeshtë; zyrtari gjerman lindor Günter Schabowski', 'Pse ka rëndësi: u bë simboli i fundit të Luftës së Ftohtë dhe i një Evrope të ndarë'] } },
  { y: 1991, wiki: 'Tim_Berners-Lee',
    en: { t: 'World Wide Web goes public', d: 'Tim Berners-Lee opens the web to the world.',
      p: ['In 1989 the British scientist Tim Berners-Lee, working at CERN in Switzerland, proposed a system for sharing documents between computers using links. He built the first web browser, server and website, and in August 1991 the first website was made available to people outside CERN.',
          'The web is not the same as the internet: the internet is the network of connected computers, while the web is a way of using it with pages and links. In 1993 CERN made the web software free for everyone to use, which helped it grow quickly. Today billions of people use it to learn, work, shop and share ideas.'],
      f: ['Where: CERN, near Geneva, Switzerland', 'Key people: Tim Berners-Lee; Robert Cailliau', 'Why it matters: it made the internet easy to use and changed how people learn, work and communicate'] },
    sq: { t: 'Uebi bëhet publik', d: 'Tim Berners-Li ia hap uebin botës.',
      p: ['Në vitin 1989 shkencëtari britanik Tim Berners-Li, që punonte në CERN në Zvicër, propozoi një sistem për ndarjen e dokumenteve mes kompjuterëve me anë lidhjesh. Ai ndërtoi shfletuesin, serverin dhe faqen e parë të internetit, dhe në gusht të vitit 1991 faqja e parë u bë e arritshme edhe për njerëzit jashtë CERN-it.',
          'Uebi nuk është e njëjta gjë me internetin: interneti është rrjeti i kompjuterëve të lidhur, ndërsa uebi është një mënyrë për ta përdorur me faqe dhe lidhje. Në vitin 1993 CERN-i e bëri programin e uebit falas për të gjithë, gjë që ndihmoi rritjen e shpejtë. Sot miliarda njerëz e përdorin për të mësuar, punuar, blerë dhe ndarë ide.'],
      f: ['Ku: CERN, afër Gjenevës, Zvicër', 'Figurat kryesore: Tim Berners-Li; Robert Cailliau', 'Pse ka rëndësi: e bëri internetin të lehtë për t’u përdorur dhe ndryshoi mënyrën si mësojmë, punojmë e komunikojmë'] } }];
const evText = e => e[LANG] || e.en;   /* { t: title, d: short text, p: paragraphs, f: key facts } */
const cat = y => y < 476 ? 'Ancient' : y < 1492 ? 'Medieval' : y < 1789 ? 'Early Modern' : 'Modern';
const yr = y => y < 0 ? t('{0} BCE', -y) : `${y}`;
/* ---------- history images: loaded from Wikipedia at runtime, cached, with a text placeholder if offline ---------- */
const IMG = (() => { try { return JSON.parse(localStorage.getItem('studyhub.img.v1') || '{}'); } catch { return {}; } })();
const okImg = u => /^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(u || '');
async function wikiImg(w) {
  if (IMG[w]) return IMG[w];
  try {
    const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(w));
    if (!r.ok) return null;
    const j = await r.json(), src = j.thumbnail && j.thumbnail.source;
    if (!okImg(src)) return null;
    IMG[w] = { src: src.replace(/\?.*$/, '') };
    try { localStorage.setItem('studyhub.img.v1', JSON.stringify(IMG)); } catch {}
    return IMG[w];
  } catch { return null; }
}
function loadImages(root) {
  (root || document).querySelectorAll('[data-wiki]').forEach(async el => {
    const d = await wikiImg(el.dataset.wiki); if (!d || !el.isConnected) return;
    const img = new Image(); img.alt = el.dataset.alt || ''; img.decoding = 'async';
    img.onerror = () => { if (img.src !== d.src) img.src = d.src; };
    img.onload = () => el.classList.add('has');
    img.src = el.dataset.big ? d.src.replace(/\/\d+px-/, '/960px-') : d.src;
    el.appendChild(img);
  });
}

/* ---------- timer (lives outside render so it keeps running) ---------- */
const T = { total: 1500, left: 1500, mode: 'Focus', run: false, iv: null };
function setTimer(min, mode) { clearInterval(T.iv); Object.assign(T, { total: min * 60, left: min * 60, mode, run: false }); render(); }
function tick() {
  T.left--;
  const el = $('#t-time'), r = $('#t-ring');
  if (el) el.textContent = mmss(T.left);
  if (r) r.style.setProperty('--p', 100 - (T.left / T.total) * 100);
  if (T.left <= 0) {
    clearInterval(T.iv); T.run = false;
    if (T.mode === 'Focus') { if (me()) { S.sessions++; S.minutes += Math.round(T.total / 60); touchStreak(); checkBadges(); save(); } else toast(t('Log in to save your study sessions.')); }
    toast(t('{0} finished!', t(T.mode))); confetti(); render();
  }
}

/* ---------- helpers for views ---------- */
const STU = [['home', 'Home'], ['timetable', 'My Day'], ['timer', 'Timer'], ['exams', 'Exams'], ['plan', 'Study Plan'], ['history', 'History'], ['homework', 'Homework'], ['quiz', 'Quiz'], ['profile', 'Profile']];
const TCH = [['thome', 'Overview'], ['assign', 'Assignments'], ['quizzes', 'Quizzes'], ['grading', 'Grading'], ['gradebook', 'Gradebook'], ['emails', 'Auto Emails']];
const roster = () => [...new Set([...S.accounts.map(a => a.name), 'Mia', 'Leo', 'Sam', 'Nora'])];
const LOCKED = ['timetable', 'exams', 'plan', 'homework', 'quiz'];
const LOCK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const initial = n => ([...String(n).trim()][0] || '?').toUpperCase();
let HF = 'All';
const G = { sel: new Set(), hw: 'all', st: 'need' };
const gList = () => S.subs.filter(s => (G.hw === 'all' || s.hw == G.hw) &&
  (G.st === 'all' || (G.st === 'need' ? s.grade == null : G.st === 'done' ? s.grade != null : !!(s.ai && s.ai.score >= 65))));
const picked = () => gList().filter(s => G.sel.has(s.id));
const avgOf = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
const subjList = () => `<datalist id="subjlist">${[...new Set([...S.subjects, ...SUGGEST.map(x => x[0])])].map(s => `<option value="${esc(s)}" label="${esc(tx(s))}">`).join('')}</datalist>`;
const gradeRows = () => { flushUser(); return roster().map(n => {
  const cells = S.hw.map(h => S.subs.find(s => s.hw === h.id && s.student === n)), acc = S.accounts.find(a => a.name === n);
  const qcells = S.quizzes.map(z => acc && acc.data.qres[z.id] ? acc.data.qres[z.id].score : null);
  const all = [...cells.filter(c => c && c.grade != null).map(c => c.grade), ...qcells.filter(x => x != null)];
  return { n, cells, qcells, avg: avgOf(all) };
}); };
const mySub = id => S.subs.find(s => s.hw === id && s.student === myName());
const nextExam = () => S.exams.filter(e => daysLeft(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
const examWhen = n => n < 0 ? t('Passed') : n === 0 ? t('Today!') : n === 1 ? t('Tomorrow') : t('in {0} days', n);
/* start–end of the lunch break that follows lesson index p */
const breakRange = p => { const s = toMin(S.times[p]); return s == null ? '' : `${fromMin(s + LESSON_LEN)}–${fromMin(s + LESSON_LEN + BREAK_LEN)}`; };
const hasBreakAfter = p => (p + 1) % LESSONS_PER_BREAK === 0 && p < S.times.length - 1;
/* a grade is a whole number from 0 to 100 — typing more is stopped at 100 */
const MAX_GRADE = 100;
function clampGrade(el) {
  const raw = String(el.value);
  if (raw === '' || raw === '-') { if (raw === '-') el.value = ''; return false; }
  const n = Math.round(+raw);
  if (isNaN(n)) { el.value = ''; return false; }
  const c = Math.max(0, Math.min(MAX_GRADE, n));
  if (String(c) !== raw) { el.value = c; if (n > MAX_GRADE) toast(t('The highest grade is {0}', MAX_GRADE)); return true; }
  return false;
}
function saveGrade(s) {
  const g = V('g' + s.id);
  if (g === '' || isNaN(+g) || +g < 0 || +g > MAX_GRADE) return false;
  s.grade = Math.round(+g); s.fb = V('f' + s.id);
  S.mails.push({ id: nextId(), to: s.student, subject: t('Your grade is ready'), body: t('You got {0}/100. {1}', s.grade, s.fb), at: Date.now(), sent: true });
  return true;
}

/* ---------- streaks, badges, study plans, quizzes ---------- */
const todayStr = () => addDays(0);
const STAR_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
function curStreak() { const st = S.streak; return st.last === todayStr() || st.last === addDays(-1) ? st.count : 0; }
function touchStreak() {
  if (!me()) return;
  const st = S.streak, td = todayStr();
  if (st.last === td) return;
  st.count = st.last === addDays(-1) ? st.count + 1 : 1;
  st.best = Math.max(st.best, st.count); st.last = td;
}
const myWork = () => S.subs.filter(s => s.student === myName());
const BADGES = [
  { id: 'first_focus', en: ['First focus session', 'Finish one timer session.'], sq: ['Seanca e parë përqendrimi', 'Përfundo një seancë me kohëmatësin.'], ok: () => S.sessions >= 1 },
  { id: 'focus10', en: ['10 focus sessions', 'Finish ten focus sessions.'], sq: ['10 seanca përqendrimi', 'Përfundo dhjetë seanca përqendrimi.'], ok: () => S.sessions >= 10 },
  { id: 'hours5', en: ['5 hours of study', 'Study for 300 minutes in total.'], sq: ['5 orë studimi', 'Studio gjithsej 300 minuta.'], ok: () => S.minutes >= 300 },
  { id: 'streak3', en: ['3-day streak', 'Be active three days in a row.'], sq: ['Seri 3 ditësh', 'Ji aktiv tre ditë radhazi.'], ok: () => S.streak.best >= 3 },
  { id: 'streak7', en: ['7-day streak', 'Be active seven days in a row.'], sq: ['Seri 7 ditësh', 'Ji aktiv shtatë ditë radhazi.'], ok: () => S.streak.best >= 7 },
  { id: 'planner', en: ['Planner', 'Create a revision plan for an exam.'], sq: ['Planifikuesi', 'Krijo një plan përsëritjeje për një provim.'], ok: () => Object.keys(S.plan).length >= 1 },
  { id: 'exam_ready', en: ['Exam ready', 'Complete every day of a revision plan.'], sq: ['Gati për provim', 'Përfundo çdo ditë të një plani përsëritjeje.'], ok: () => Object.values(S.plan).some(p => p.days.length && p.days.every(d => d.done)) },
  { id: 'first_quiz', en: ['Quiz taker', 'Take your first quiz.'], sq: ['Zgjidhës kuizesh', 'Zgjidh kuizin e parë.'], ok: () => Object.keys(S.qres).length >= 1 },
  { id: 'quiz_ace', en: ['Quiz ace', 'Score 90% or more on a quiz.'], sq: ['Ace i kuizeve', 'Merr 90% ose më shumë në një kuiz.'], ok: () => Object.values(S.qres).some(r => r.score >= 90) },
  { id: 'handed_in', en: ['Handed in', 'Hand in your first assignment.'], sq: ['Dorëzuesi', 'Dorëzo detyrën e parë.'], ok: () => myWork().length >= 1 },
  { id: 'top_grade', en: ['Top grade', 'Get 90 or more on an assignment.'], sq: ['Nota e lartë', 'Merr 90 ose më shumë në një detyrë.'], ok: () => myWork().some(s => s.grade != null && s.grade >= 90) }
];
function checkBadges(silent) {
  if (!me()) return;
  BADGES.forEach(b => {
    if (S.badges[b.id] || !b.ok()) return;
    S.badges[b.id] = todayStr();
    if (!silent) { toast(t('Badge unlocked: {0}', (b[LANG] || b.en)[0])); confetti(); }
  });
}
function badgesHtml() {
  const earned = BADGES.filter(b => S.badges[b.id]).length;
  return `<h2>${t('Badges')}</h2><div class="card"><div class="row"><span class="stat"><b>${curStreak()}</b>${t('day streak')}</span><span class="muted">${t('Best: {0}', S.streak.best)} · ${t('{0} of {1} badges earned', earned, BADGES.length)}</span></div>
    <p class="muted" style="font-size:.88rem;margin:.5rem 0 1rem">${t('Be active every day to build your streak.')}</p>
    <div class="badges">${BADGES.map(b => { const x = b[LANG] || b.en;
      return `<div class="badge ${S.badges[b.id] ? 'on' : ''}"><span class="medal">${STAR_SVG}</span><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div>`; }).join('')}</div></div>`;
}

/* study plans: S.plan[examId] = { mins, days: [{ date, mins, done }] } */
function makePlan(exam, mins) {
  const dl = daysLeft(exam.date), n = Math.max(1, Math.min(21, dl)), off = Math.max(0, dl - n);
  return { mins, days: Array.from({ length: n }, (_, i) => ({ date: addDays(off + i), mins, done: false })) };
}
const planPct = p => Math.round(p.days.filter(d => d.done).length / p.days.length * 100);
function planBtn(e, n) {
  if (n < 0) return '';
  return S.plan[e.id]
    ? `<p style="margin-top:.6rem"><button class="btn ghost sm" data-act="go" data-p="plan">${t('Open plan')}</button></p>`
    : `<p style="margin-top:.6rem"><button class="btn sm" data-act="planmodal" data-id="${e.id}">${t('Plan revision')}</button></p>`;
}
function todayRevisionHtml() {
  const td = todayStr();
  const items = S.exams.filter(e => S.plan[e.id]).map(e => ({ e, d: S.plan[e.id].days.find(x => x.date === td) })).filter(x => x.d);
  if (!items.length) return '';
  return `<h2>${t('Today’s revision')}</h2><div class="card list">${items.map(({ e, d }) => `<div class="row"><span><span class="tag" style="--h:${hue(e.subject)}">${esc(tx(e.subject))}</span> ${esc(tx(e.title))} · ${t('{0} min', d.mins)}</span>
    <span>${d.done ? `<span class="b gr">${t('Done')}</span>` : `<button class="btn sm" data-act="plantimer" data-m="${d.mins}">${t('Start timer')}</button>`}</span></div>`).join('')}</div>`;
}

/* quizzes: S.quizzes (shared), S.qres[quizId] = { ans, score } (per student) */
let QSEL = null;
const qi = () => LANG === 'sq' ? 1 : 0;
const qText = q => esc(Array.isArray(q.q) ? q.q[qi()] : q.q);
const qOpts = q => ((qi() && q.os) ? q.os : q.o).map(esc);
const QUIZ_EXAMPLE = 'What is 7 × 8?\n54\n*56\n58\n64\n\nWhat is the capital of Albania?\n*Tirana\nDurrës\nShkodër';
function parseQuiz(text) {
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/).map(b => b.split('\n').map(l => l.trim()).filter(Boolean)).filter(b => b.length);
  const qs = [];
  for (let i = 0; i < blocks.length; i++) {
    const [q, ...opts] = blocks[i], correct = opts.map((o, j) => o.startsWith('*') ? j : -1).filter(j => j >= 0);
    if (opts.length < 2 || opts.length > 6 || correct.length !== 1) return { error: i + 1 };
    qs.push({ q, o: opts.map(o => o.replace(/^\*\s*/, '')), a: correct[0] });
  }
  return { qs };
}

/* ---------- alerts: Discord-style pop-ups for the teacher, a big warning for students who forgot homework ---------- */
const WARN_SVG = '<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v5M12 18v.4"/></svg>';
const BELL_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
let NP_OPEN = false, bigDismissed = false, actx = null;
const unread = () => S.notifs.filter(n => !n.read).length;
function pushNotif(n) { S.notifs.unshift({ id: nextId(), at: Date.now(), read: false, ...n }); if (S.notifs.length > 50) S.notifs.length = 50; }
function pingSound(kind) {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const alarm = kind === 'alarm', notes = alarm ? [[740, 0], [587, .2], [740, .4], [587, .6]] : [[880, 0], [1320, .11]];
    notes.forEach(([freq, at]) => {
      const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + at;
      o.type = alarm ? 'square' : 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(alarm ? .1 : .2, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + .17);
      o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + .19);
    });
  } catch {}
}
function notifText(n) {
  return n.kind === 'hw' ? t('{0} handed in “{1}”', n.student, tx(n.title))
    : n.kind === 'quiz' ? t('{0} finished the quiz “{1}” — {2}%', n.student, tx(n.title), n.score)
    : t('You have {0} unread notifications', n.count);
}
const timeAgo = ms => { const m = Math.round((Date.now() - ms) / 6e4); return m < 1 ? t('just now') : m < 60 ? t('{0} min ago', m) : m < 1440 ? t('{0} h ago', Math.round(m / 60)) : fmt(ms); };
function avatarFor(name) {
  const a = S.accounts.find(x => x.name === name);
  return `<span class="avatar" style="--c:${a ? a.color : COLORS[hue(name) % COLORS.length]}">${esc(initial(name))}</span>`;
}
function showAlert(n) {
  const box = $('#alerts'); if (!box) return;
  const el = document.createElement('div'); el.className = 'dalert'; el.dataset.nid = n.id;
  el.innerHTML = `${n.kind === 'summary' ? '<span class="avatar app">S</span>' : avatarFor(n.student)}
    <div class="dbody" data-act="alertopen" data-id="${n.id}"><div class="dtop"><span>StudyHub</span><span>${t('just now')}</span></div><b>${n.kind === 'summary' ? 'StudyHub' : esc(n.student)}</b><p>${esc(notifText(n))}</p></div>
    <button class="dx" data-act="alertclose" data-id="${n.id}" aria-label="${t('Close')}">×</button><i class="dbar"></i>`;
  box.appendChild(el); pingSound('ping');
  setTimeout(() => el.remove(), 9000);
  try { if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) new Notification('StudyHub', { body: notifText(n) }); } catch {}
}
function announceUnread() { const n = unread(); if (n) showAlert({ id: nextId(), kind: 'summary', count: n }); }
const bellHtml = () => `<button class="bell" data-act="bell" aria-label="${t('Notifications')}">${BELL_SVG}${unread() ? `<span class="bdg">${Math.min(unread(), 99)}</span>` : ''}</button>`;
function notifPanel() {
  return `<div class="npanel" role="dialog" aria-label="${t('Notifications')}"><div class="nhead"><b>${t('Notifications')}</b><button class="linkbtn" data-act="readall">${t('Mark all as read')}</button></div>
    <div class="nlist">${S.notifs.slice(0, 15).map(n => `<button class="nitem ${n.read ? '' : 'unread'}" data-act="notifopen" data-id="${n.id}">${avatarFor(n.student)}<span class="ntxt">${esc(notifText(n))}<small>${timeAgo(n.at)}</small></span>${n.read ? '' : '<i class="udot"></i>'}</button>`).join('')
      || `<p class="muted" style="padding:1rem">${t('No notifications yet.')}</p>`}</div>
    <div class="nfoot"><button class="linkbtn" data-act="sound">${t(S.sound ? 'Sound on' : 'Sound off')}</button><button class="linkbtn" data-act="desktop">${t('Enable desktop alerts')}</button></div></div>`;
}
/* another browser tab changed the shared data (e.g. a student handed something in): merge it and alert the teacher live */
function applyExternal(raw) {
  let n; try { n = JSON.parse(raw); } catch { return; }
  const seen = new Set(S.notifs.map(x => x.id));
  ['accounts', 'subs', 'mails', 'hw', 'exams', 'quizzes', 'notifs', 'teacherName', 'pwHash'].forEach(k => { if (n[k] !== undefined) S[k] = n[k]; });
  S.accounts.forEach(a => { if (!a.data) a.data = blankUser(); });
  if (S.me && !me()) S.me = null;
  loadUser(me());
  const fresh = S.notifs.filter(x => !seen.has(x.id) && !x.read);
  syncing = true; try { render(); } finally { syncing = false; }
  if (S.role === 'teacher' && isAuthed()) fresh.forEach(showAlert);
}

/* student side: homework that was forgotten */
const overdue = () => {
  const account = me();
  if (!account) return [];
  return S.hw.filter(h => (!account.createdOn || h.due >= account.createdOn) && !mySub(h.id) && daysLeft(h.due) < 0);
};
const dueSoon = () => me() ? S.hw.filter(h => !mySub(h.id) && daysLeft(h.due) >= 0 && daysLeft(h.due) <= 1) : [];
const lateText = h => { const n = -daysLeft(h.due); return t(n === 1 ? '1 day late' : '{0} days late', n); };
function bigAlert() {
  const od = overdue(); if (!od.length || bigDismissed || S.role !== 'student') return;
  const m = $('#modal');
  m.innerHTML = `<div class="mbox danger" role="alertdialog" aria-live="assertive"><div class="wico">${WARN_SVG}</div>
    <h1>${t('You forgot your homework!')}</h1><p class="lead">${t(od.length === 1 ? '1 assignment is overdue.' : '{0} assignments are overdue.', od.length)}</p>
    <div class="odlist">${od.map(h => `<div class="odrow"><span><span class="tag" style="--h:${hue(h.subject)}">${esc(tx(h.subject))}</span> <b>${esc(tx(h.title))}</b></span><span class="b bad big">${lateText(h)}</span></div>`).join('')}</div>
    <p class="muted" style="margin-bottom:1rem">${t('Your teacher is waiting for this work. Hand it in as soon as you can.')}</p>
    <p><button class="btn big" data-act="bigdo" data-id="${od[0].id}">${t('Do it now')}</button> <button class="btn ghost" data-act="bigclose">${t('Remind me later')}</button></p></div>`;
  m.hidden = false; pingSound('alarm');
}
function bannerHtml() {
  if (S.role !== 'student' || !me()) return '';
  const od = overdue();
  if (od.length) return `<div class="banner danger" role="alert"><span class="bicon">${WARN_SVG}</span><span><b>${t(od.length === 1 ? '1 assignment is overdue:' : '{0} assignments are overdue:', od.length)}</b> ${od.map(h => esc(tx(h.title)) + ' (' + lateText(h) + ')').join(' · ')}</span>
    <button class="btn sm" data-act="bigdo" data-id="${od[0].id}">${t('Do it now')}</button></div>`;
  const ds = dueSoon();
  return ds.length ? `<div class="banner warn" role="status"><span><b>${t('Due soon:')}</b> ${ds.map(h => esc(tx(h.title)) + ' (' + t(daysLeft(h.due) === 0 ? 'due today' : 'due tomorrow') + ')').join(' · ')}</span>
    <button class="btn ghost sm" data-act="go" data-p="homework">${t('Open')}</button></div>` : '';
}

/* ---------- guest / locked / profile ---------- */
const FEATURE_DESC = { timetable: 'Build your own school day', exams: 'Count down to your exams', homework: 'Hand in work and see your grades', quiz: 'Take the auto-graded quiz', plan: 'Plan your revision day by day' };
function guestHome() {
  const free = [['timer', 'Timer'], ['history', 'History']];
  return `<div class="hero"><h1>${t('Hello, guest')}</h1><p>${t('You’re browsing as a guest')}</p></div>
  <div class="card"><p>${t('Guests can use the Home page, the Study Timer and the History Scroller. Log in to unlock My Day, Exams, Homework and the Quiz — and to save your progress.')}</p>
    <p style="margin-top:.9rem"><button class="btn" data-act="slogin">${t('Log in')}</button> <button class="btn ghost" data-act="ssignup">${t('Create account')}</button></p>
    <p class="muted" style="margin-top:.7rem;font-size:.85rem">${t('Demo account: alex / student')}</p></div>
  <div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:1rem">
    <div class="card"><h3>${t('Free for everyone')}</h3><div class="list">${free.map(([k, l]) => `<div class="row"><span>${t(l)}</span><button class="btn ghost sm" data-act="go" data-p="${k}">${t('Open')}</button></div>`).join('')}</div></div>
    <div class="card"><h3>${t('Needs an account')}</h3><div class="list">${LOCKED.map(k => `<div class="row"><span>${LOCK_SVG} <b>${t(STU.find(p => p[0] === k)[1])}</b><br><small class="muted">${t(FEATURE_DESC[k])}</small></span></div>`).join('')}</div></div>
  </div>`;
}
function lockedView(page) {
  const label = STU.find(p => p[0] === page)[1];
  return `<div class="card locked"><div class="lockico">${LOCK_SVG}</div><h2>${t('Sign in to unlock this')}</h2>
    <p>${t('{0} is only available to signed-in students.', t(label))}</p><p class="muted">${t(FEATURE_DESC[page])}</p>
    <p style="margin-top:1rem"><button class="btn" data-act="slogin">${t('Log in')}</button> <button class="btn ghost" data-act="ssignup">${t('Create account')}</button></p>
    <p class="muted" style="margin-top:.7rem;font-size:.85rem">${t('Demo account: alex / student')}</p></div>`;
}

/* ---------- views ---------- */
const VIEWS = {
  home() {
    if (!me()) return guestHome();
    const h = new Date().getHours(), di = new Date().getDay() - 1;
    const hi = t(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
    const rows = [];
    if (di >= 0 && di < 5) {
      const lastIdx = Math.max(-1, ...S.times.map((_, i) => S.tt[`${di}-${i}`] ? i : -1));
      S.times.forEach((tm, i) => {
        if (S.tt[`${di}-${i}`]) rows.push({ tm, s: S.tt[`${di}-${i}`] });
        if (hasBreakAfter(i) && rows.length && i < lastIdx) rows.push({ tm: breakRange(i), b: true });
      });
    }
    const ne = nextExam(), gr = S.subs.filter(s => s.student === myName() && s.grade != null).map(s => s.grade);
    const avg = gr.length ? Math.round(gr.reduce((a, b) => a + b, 0) / gr.length) : '–';
    const todo = S.hw.filter(x => !mySub(x.id)).length;
    return `<div class="hero"><h1>${hi}, ${esc(myName())}</h1><p>${ne ? t('Your next exam, {0}, is {1}.', `<b>${esc(tx(ne.title))}</b>`, examWhen(daysLeft(ne.date))) : t('No upcoming exams — nice!')}</p></div>
    <div class="grid">
      <div class="card stat"><b>${todo}</b>${t('homework to do')}</div>
      <div class="card stat"><b>${S.sessions}</b>${t('focus sessions ({0} min)', S.minutes)}</div>
      <div class="card stat"><b>${avg}</b>${t('average grade')}</div>
      <div class="card stat"><b>${curStreak()}</b>${t('day streak')}<small class="muted" style="display:block">${t('Best: {0}', S.streak.best)}</small></div>
      ${ne ? `<div class="card row"><div><h3>${t('Exam: {0}', esc(tx(ne.subject)))}</h3><p class="muted">${esc(tx(ne.title))}</p></div>
        <div class="ring" style="--p:${Math.max(4, 100 - daysLeft(ne.date) * 3)}"><div>${Math.max(0, daysLeft(ne.date))}</div></div></div>` : ''}
    </div>
    ${todayRevisionHtml()}
    <h2>${t('Today’s classes')}</h2>
    <div class="card list">${rows.length ? rows.map(r => r.b
      ? `<div class="row brk-row"><span>${t('Lunch break')}</span><span>${r.tm}</span></div>`
      : `<div class="row"><span class="tag" style="--h:${hue(r.s)}">${esc(tx(r.s))}</span><span class="muted">${r.tm}</span></div>`).join('')
      : `<p class="muted">${t('Nothing planned today. Pick your subjects in “My Day” to build your schedule.')}</p>`}</div>`;
  },
  profile() {
    const a = me();
    return `<h1>${t('My profile')}</h1>
    <div class="card"><div class="row" style="justify-content:flex-start;gap:1rem"><span class="avatar big" id="av-prev" style="--c:${a.color}">${esc(initial(a.name))}</span>
      <div><h3>${esc(a.name)}</h3><p class="muted">${a.firebaseUid ? '' : '@'}${esc(a.user)}${a.klass ? ' · ' + t('Class') + ' ' + esc(a.klass) : ''}</p></div></div>
      <div class="cols"><div><label>${t('Display name')}</label><input id="pf-name" value="${esc(a.name)}" maxlength="30"></div>
      <div><label>${t('Class (e.g. 10A)')}</label><input id="pf-class" value="${esc(a.klass || '')}" maxlength="10"></div></div>
      <label>${t('Avatar color')}</label><div class="swatches">${COLORS.map(c => `<button class="sw ${c === a.color ? 'on' : ''}" data-act="swatch" data-c="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div>
      <p style="margin-top:.9rem"><button class="btn" data-act="saveprofile">${t('Save profile')}</button></p></div>
    ${badgesHtml()}
    <h2>${t('Change password')}</h2><div class="card"><div class="cols"><div><label>${t('Current password')}</label><input id="pf-old" type="password" autocomplete="current-password"></div>
      <div><label>${t('New password')}</label><input id="pf-new" type="password" autocomplete="new-password"></div></div>
      <p style="margin-top:.8rem"><button class="btn sm" data-act="chspw">${t('Update password')}</button></p></div>
    <h2>${t('Danger zone')}</h2><div class="card row"><span class="muted">${t('This permanently deletes your account and your saved data.')}</span><button class="btn ghost" data-act="delacct">${t('Delete my account')}</button></div>`;
  },
  timetable() {
    const opts = v => `<option value="">–</option>${S.subjects.map(s => `<option value="${esc(s)}" ${s === v ? 'selected' : ''}>${esc(tx(s))}</option>`).join('')}<option value="Free period" ${v === 'Free period' ? 'selected' : ''}>${t('Free period')}</option>`;
    const quick = SUGGEST.filter(([e]) => !S.subjects.includes(e));
    const body = S.times.map((tm, p) => `<tr><td class="time"><input type="time" data-time="${p}" value="${tm}" aria-label="${t('Period {0} start time', p + 1)}"></td>${DAYS.map((d, di) => {
      const v = S.tt[`${di}-${p}`] || '';
      return `<td><select data-tt="${di}-${p}" class="${v ? 'filled' : ''}" style="--h:${hue(v)}" ${S.subjects.length ? '' : 'disabled'} aria-label="${t('{0} period {1}', t(d), p + 1)}">${opts(v)}</select></td>`;
    }).join('')}</tr>${hasBreakAfter(p) ? `<tr class="brk"><td class="time">${breakRange(p)}</td><td colspan="${DAYS.length}">${t('Lunch break')}</td></tr>` : ''}`).join('');
    return `<h1>${t('My School Day')}</h1><p class="muted" style="margin-bottom:1rem">${t('Choose the subjects you actually have, then fill in your week. A lunch break is added automatically after every 2 lessons.')}</p>
    <div class="card"><h3>${t('My subjects')}</h3>
      <p style="margin:.6rem 0">${S.subjects.length ? S.subjects.map(s => `<span class="tag chip" style="--h:${hue(s)}">${esc(tx(s))}<button data-act="rmsub" data-s="${esc(s)}" aria-label="${t('Remove {0}', esc(tx(s)))}">×</button></span>`).join(' ') : `<span class="muted">${t('None yet — add your first subject below.')}</span>`}</p>
      <div class="row"><input id="sub-new" placeholder="${t('Add a subject (e.g. Chemistry)')}" style="flex:1;min-width:180px"><button class="btn sm" data-act="addsub">${t('Add')}</button></div>
      ${quick.length ? `<p class="muted" style="margin:.8rem 0 .4rem;font-size:.85rem">${t('Quick add:')}</p><div class="filters">${quick.map(([e, a]) => `<button class="btn ghost sm" data-act="addsub" data-s="${e}">+ ${LANG === 'sq' ? a : e}</button>`).join('')}</div>` : ''}</div>
    <h2>${t('My week')}</h2>
    <div class="card" style="overflow:auto"><table class="tt"><tr><th></th>${DAYS.map(d => `<th>${t(d)}</th>`).join('')}</tr>${body}</table>
    <p style="margin-top:.6rem" class="row"><span class="muted">${t('{0} slots filled', Object.keys(S.tt).length)}</span><button class="btn ghost sm" data-act="cleartt">${t('Clear week')}</button></p></div>`;
  },
  timer() {
    const pre = [[25, 'Focus'], [45, 'Focus'], [5, 'Break'], [15, 'Break']];
    return `<div class="timer"><h1>${t('Study Timer')}</h1><p class="muted">${t('{0} mode', t(T.mode))}</p>
    <div class="tring" id="t-ring" style="--p:${100 - (T.left / T.total) * 100}"><div id="t-time">${mmss(T.left)}</div></div>
    <p><button class="btn" data-act="tstart">${t(T.run ? 'Pause' : 'Start')}</button> <button class="btn ghost" data-act="treset">${t('Reset')}</button></p>
    <h2>${t('Presets')}</h2><div class="filters" style="justify-content:center">${pre.map(([m, md]) => `<button class="btn ghost sm" data-act="preset" data-m="${m}" data-md="${md}">${t('{0} min {1}', m, t(md))}</button>`).join('')}</div>
    <div class="row" style="justify-content:center"><input id="cmin" type="number" min="1" max="180" placeholder="${t('Custom minutes')}" style="width:170px"><button class="btn sm" data-act="custom">${t('Set')}</button></div>
    <p class="muted" style="margin-top:1rem">${me() ? t('Completed today: {0} sessions · {1} min', S.sessions, S.minutes) : t('Log in to save your study sessions.')}</p></div>`;
  },
  exams() {
    const list = [...S.exams].sort((a, b) => a.date.localeCompare(b.date));
    return `<h1>${t('Exam Countdown')}</h1>
    <div class="card"><div class="cols"><div><label>${t('Subject')}</label><input id="e-sub" list="subjlist" placeholder="${esc(tx('Math'))}">${subjList()}</div>
    <div><label>${t('Title')}</label><input id="e-title" placeholder="${t('Chapter 5 test')}"></div><div><label>${t('Date')}</label><input id="e-date" type="date"></div></div>
    <p style="margin-top:.8rem"><button class="btn" data-act="addexam">${t('Add exam')}</button></p></div>
    <h2>${t('Upcoming')}</h2><div class="grid">${list.map(e => { const n = daysLeft(e.date), near = n >= 0 && n <= 3;
      return `<div class="card ${near ? 'hw late' : ''}"><div class="row"><span class="tag" style="--h:${hue(e.subject)}">${esc(tx(e.subject))}</span>
      <button class="btn ghost sm" data-act="delexam" data-id="${e.id}">${t('Remove')}</button></div><h3>${esc(tx(e.title))}</h3>
      <div class="stat"><b>${n < 0 ? '–' : n}</b></div><p class="${near ? 'red' : 'muted'}">${n < 0 ? t('Passed') : n === 0 ? t('Today!') : t('days left')} · ${e.date}</p>${planBtn(e, n)}</div>`; }).join('') || `<p class="muted">${t('No exams yet.')}</p>`}</div>`;
  },
  history() {
    const list = EV.filter(e => HF === 'All' || cat(e.y) === HF);
    return `<h1>${t('History Scroller')}</h1><p class="muted">${t('Scroll through time — click an event for details.')}</p>
    <div class="filters">${['All', ...CATS].map(c => `<button class="btn ghost sm ${HF === c ? 'on' : ''}" data-act="hf" data-c="${c}">${t(c)}</button>`).join('')}</div>
    <div class="tl"><div class="tl-line"><i></i></div>${list.map((e, i) => `<div class="ev ${i % 2 ? 'r' : 'l'}" data-y="${e.y}"><span class="dot"></span>
      <div class="card" data-act="ev" data-i="${EV.indexOf(e)}" tabindex="0"><div class="ev-img" data-wiki="${e.wiki}" data-alt="${esc(evText(e).t)}"><span>${yr(e.y)}</span></div>
      <div class="yr">${yr(e.y)}</div><h3>${evText(e).t}</h3><p class="sd">${evText(e).d}</p><small>${t(cat(e.y))} · ${t('Click for the full story')}</small></div></div>`).join('')}</div>`;
  },
  homework() {
    return `<h1>${t('Homework')}</h1>${S.hw.map(h => { const s = mySub(h.id), late = !s && daysLeft(h.due) < 0;
      const badge = !s ? (late ? `<span class="b bad big">${t('Overdue')} · ${lateText(h)}</span>` : `<span class="b todo">${t('To do')}</span>`) : s.grade == null ? `<span class="b sub">${t('Submitted')}</span>` : `<span class="b gr">${t('Graded: {0}', s.grade)}</span>`;
      return `<div class="card hw ${late ? 'late' : ''}"><div class="row"><span><span class="tag" style="--h:${hue(h.subject)}">${esc(tx(h.subject))}</span> <b>${esc(tx(h.title))}</b></span>${badge}</div>
      <p class="muted">${esc(tx(h.desc))}</p><p class="${late ? 'red' : 'muted'}">${late ? t('Overdue — was due') : t('Due')} ${h.due}</p>
      ${s && s.grade != null ? `<div class="fb">${esc(tx(s.fb))}</div>` : ''}
      ${!s ? `<p style="margin-top:.6rem"><button class="btn sm" data-act="submit" data-id="${h.id}">${t('Submit work')}</button></p>` : ''}</div>`; }).join('')}`;
  },
  plan() {
    const td = todayStr();
    const withPlan = S.exams.filter(e => S.plan[e.id] && daysLeft(e.date) >= 0), without = S.exams.filter(e => !S.plan[e.id] && daysLeft(e.date) >= 0);
    return `<h1>${t('Study Plan')}</h1><p class="muted" style="margin-bottom:1rem">${t('Spread your revision over the days before each exam. Tick a day when you have done it.')}</p>
    ${withPlan.map(e => { const p = S.plan[e.id], done = p.days.filter(d => d.done).length;
      return `<div class="card hw"><div class="row"><span><span class="tag" style="--h:${hue(e.subject)}">${esc(tx(e.subject))}</span> <b>${esc(tx(e.title))}</b></span><span class="muted">${examWhen(daysLeft(e.date))}</span></div>
      <div class="row" style="margin:.6rem 0 .3rem"><span class="muted">${t('{0} of {1} days done', done, p.days.length)}</span><b>${planPct(p)}%</b></div><div class="hbar"><i style="width:${planPct(p)}%"></i></div>
      <div class="days">${p.days.map(d => `<label class="day ${d.done ? 'done' : ''} ${d.date === td ? 'today' : ''}"><input type="checkbox" data-pday="${e.id}|${d.date}" ${d.done ? 'checked' : ''}>
        <span>${d.date === td ? t('Today') : d.date.slice(5)}</span><small>${t('{0} min', d.mins)}</small></label>`).join('')}</div>
      <p style="margin-top:.7rem"><button class="btn sm" data-act="plantimer" data-m="${p.mins}">${t('Start timer')}</button> <button class="btn ghost sm" data-act="delplan" data-id="${e.id}">${t('Delete plan')}</button></p></div>`; }).join('')}
    ${without.length ? `<h2>${t('No plan yet')}</h2><div class="card list">${without.map(e => `<div class="row"><span>${esc(tx(e.title))} <span class="muted">· ${examWhen(daysLeft(e.date))}</span></span>
      <button class="btn sm" data-act="planmodal" data-id="${e.id}">${t('Plan revision')}</button></div>`).join('')}</div>` : ''}
    ${!withPlan.length && !without.length ? `<p class="muted">${t('No exams to plan yet. Add one on the Exams page.')}</p>` : ''}`;
  },
  quiz() {
    const z = S.quizzes.find(x => x.id === QSEL);
    if (!z) {
      const open = S.quizzes.filter(x => x.open);
      return `<h1>${t('Quizzes')}</h1><p class="muted" style="margin-bottom:1rem">${t('Quizzes from your teacher. Pick one to start — it is graded instantly.')}</p>
      ${open.map(x => { const r = S.qres[x.id];
        return `<div class="card hw"><div class="row"><span><span class="tag" style="--h:${hue(x.subject)}">${esc(tx(x.subject))}</span> <b>${esc(tx(x.title))}</b></span>${r ? `<span class="b ${r.score >= 70 ? 'gr' : 'todo'}">${t('Score: {0}%', r.score)}</span>` : ''}</div>
        <p class="muted">${t('{0} questions', x.questions.length)}</p>
        <p style="margin-top:.6rem"><button class="btn sm" data-act="qstart" data-id="${x.id}">${t(r ? 'Review' : 'Start')}</button> ${r ? `<button class="btn ghost sm" data-act="retake" data-id="${x.id}">${t('Retake')}</button>` : ''}</p></div>`; }).join('') || `<p class="muted">${t('No quizzes yet.')}</p>`}`;
    }
    const done = S.qres[z.id];
    return `<p><button class="btn ghost sm" data-act="qback">← ${t('All quizzes')}</button></p><h1 style="margin-top:.8rem">${esc(tx(z.title))}</h1>
    ${done ? `<div class="hero"><h1>${t('Score: {0}%', done.score)}</h1><p>${t(done.score >= 75 ? 'Great job!' : 'Keep practising!')}</p></div>` : `<p class="muted" style="margin-bottom:1rem">${t('Multiple choice — graded instantly.')}</p>`}
    ${z.questions.map((q, i) => `<div class="card q ${done ? (done.ans[i] === q.a ? 'ok' : 'no') : ''}"><b>${i + 1}. ${qText(q)}</b>
      ${qOpts(q).map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}" ${done && done.ans[i] === j ? 'checked' : ''} ${done ? 'disabled' : ''}> ${o}${done && j === q.a ? ' ' + t('(correct)') : ''}</label>`).join('')}</div>`).join('')}
    <p>${done ? `<button class="btn ghost" data-act="retake" data-id="${z.id}">${t('Retake')}</button>` : `<button class="btn" data-act="grade">${t('Submit exam')}</button>`}</p>`;
  },

  /* ----- teacher ----- */
  thome() {
    const graded = S.subs.filter(s => s.grade != null).map(s => s.grade);
    flushUser(); S.accounts.forEach(a => Object.values(a.data.qres || {}).forEach(r => graded.push(r.score)));
    const bk = [t('Below 50'), '50–69', '70–89', '90+'], cnt = [0, 0, 0, 0];
    graded.forEach(g => cnt[g < 50 ? 0 : g < 70 ? 1 : g < 90 ? 2 : 3]++);
    const max = Math.max(1, ...cnt);
    const flagged = S.subs.filter(s => s.ai && s.ai.score >= 65), waiting = S.subs.filter(s => s.grade == null);
    const title = id => tx((S.hw.find(h => h.id === id) || { title: '?' }).title);
    const attention = [
      ...flagged.filter(s => s.grade == null).map(s => ({ s, why: 'Flagged as likely AI', cls: 'bad' })),
      ...waiting.filter(s => !(s.ai && s.ai.score >= 65)).map(s => ({ s, why: 'Waiting for a grade', cls: 'todo' }))].slice(0, 6);
    const perHw = S.hw.map(h => ({ h, avg: avgOf(S.subs.filter(s => s.hw === h.id && s.grade != null).map(s => s.grade)) }));
    return `<div class="hero"><h1>${t('Teacher dashboard')}</h1><p>${t(waiting.length === 1 ? '{0} submission waiting for a grade, {1} flagged by the AI check.' : '{0} submissions waiting for a grade, {1} flagged by the AI check.', waiting.length, flagged.length)}</p></div>
    <div class="grid"><div class="card stat"><b>${S.subs.length}</b>${t('submissions')}</div><div class="card stat"><b>${waiting.length}</b>${t('waiting for a grade')}</div>
    <div class="card stat"><b>${flagged.length}</b>${t('flagged as likely AI')}</div><div class="card stat"><b>${S.mails.filter(m => !m.sent).length}</b>${t('emails scheduled')}</div></div>
    <div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));margin-top:1rem">
      <div class="card"><h3>${t('Needs attention')}</h3><div class="list">${attention.length ? attention.map(a => `<div class="row"><span><b>${esc(a.s.student)}</b> <span class="muted">· ${esc(title(a.s.hw))}</span></span>
        <span><span class="b ${a.cls}">${t(a.why)}</span> <button class="btn ghost sm" data-act="gograde" data-id="${a.s.id}">${t('Open')}</button></span></div>`).join('') : `<p class="muted">${t('All caught up.')}</p>`}</div></div>
      <div class="card"><h3>${t('Average by assignment')}</h3>${perHw.map(p => `<div style="margin:.7rem 0"><div class="row"><span>${esc(tx(p.h.title))}</span><b>${p.avg ?? '–'}</b></div><div class="hbar"><i style="width:${p.avg || 0}%"></i></div></div>`).join('') || `<p class="muted">${t('No assignments.')}</p>`}</div>
    </div>
    <h2>${t('Grade distribution')}</h2><div class="card"><div class="chart">${cnt.map((n, i) => `<div class="col"><small>${n}</small><div class="bar" style="height:${(n / max) * 100}%"></div><small class="muted">${bk[i]}</small></div>`).join('')}</div></div>
    <h2>${t('Account')}</h2><div class="card"><h3>${t('Display name')}</h3><div class="row" style="margin:.4rem 0 1.2rem"><input id="t-name" value="${esc(S.teacherName)}" placeholder="${t('Teacher')}" maxlength="30" style="flex:1;min-width:200px"><button class="btn sm" data-act="tname">${t('Save')}</button></div><h3>${t('Change teacher password')}</h3><div class="cols"><div><label>${t('Current password')}</label><input id="pw-old" type="password"></div>
    <div><label>${t('New password')}</label><input id="pw-new" type="password"></div></div><p style="margin-top:.8rem"><button class="btn sm" data-act="chpw">${t('Update password')}</button></p></div>`;
  },
  assign() {
    return `<h1>${t('Assignments')}</h1><p class="muted" style="margin-bottom:1rem">${t('Anything you create here appears on the student Homework page. The key points are what auto-grade looks for.')}</p>
    <div class="card"><div class="cols"><div><label>${t('Subject')}</label><input id="a-sub" list="subjlist" placeholder="${esc(tx('History'))}"></div>
    <div><label>${t('Title')}</label><input id="a-title"></div><div><label>${t('Due date')}</label><input id="a-due" type="date" value="${addDays(7)}"></div></div>
    <label>${t('Instructions')}</label><textarea id="a-desc" placeholder="${t('What should students do?')}"></textarea>
    <label>${t('Key points to look for (comma separated)')}</label><input id="a-kw" placeholder="treaty, alliance|aleanca, nationalism|nacionalizmi"><small class="muted" style="display:block;margin-top:.3rem">${t('Use | for alternatives in other languages, e.g. alliance|aleanca.')}</small>${subjList()}
    <p style="margin-top:.8rem"><button class="btn" data-act="addhw">${t('Create assignment')}</button></p></div>
    <h2>${t('Current assignments')}</h2>${S.hw.map(h => { const subs = S.subs.filter(s => s.hw === h.id), done = subs.filter(s => s.grade != null).length;
      return `<div class="card hw"><div class="row"><span><span class="tag" style="--h:${hue(h.subject)}">${esc(tx(h.subject))}</span> <b>${esc(tx(h.title))}</b></span><span class="muted">${t('due {0}', h.due)}</span></div>
      <p class="muted">${esc(tx(h.desc))}</p><p class="muted" style="font-size:.85rem">${t('Key points: {0} · {1} submitted, {2} graded', h.kw.length ? h.kw.map(k => esc(kwLabel(k))).join(', ') : t('none'), subs.length, done)}</p>
      <p style="margin-top:.5rem"><button class="btn ghost sm" data-act="announce" data-id="${h.id}">${t('Email the class')}</button> <button class="btn ghost sm" data-act="delhw" data-id="${h.id}">${t('Delete')}</button></p></div>`; }).join('') || `<p class="muted">${t('No assignments yet.')}</p>`}`;
  },
  grading() {
    const list = gList(), n = list.filter(s => G.sel.has(s.id)).length;
    return `<h1>${t('Grading & AI check')}</h1>
    <div class="card"><h3>${t('1. Pick what to grade')}</h3>
      <div class="cols"><div><label>${t('Assignment')}</label><select data-gf="hw"><option value="all">${t('All assignments')}</option>${S.hw.map(h => `<option value="${h.id}" ${G.hw == h.id ? 'selected' : ''}>${esc(tx(h.title))}</option>`).join('')}</select></div>
      <div><label>${t('Show')}</label><select data-gf="st">${[['need', 'Needs grading'], ['all', 'Everything'], ['done', 'Already graded'], ['flag', 'Flagged as likely AI']].map(([v, l]) => `<option value="${v}" ${G.st === v ? 'selected' : ''}>${t(l)}</option>`).join('')}</select></div></div>
      <p class="muted" style="margin-top:.7rem;font-size:.9rem">${t('Tick the submissions you want to work on. Nothing is graded until you press Save.')}</p></div>
    <div class="card" style="margin-top:1rem"><div class="row" style="padding-bottom:.7rem;border-bottom:1px solid var(--line)">
      <span><button class="btn ghost sm" data-act="selall">${t('Select all shown')}</button> <button class="btn ghost sm" data-act="selnone">${t('Clear')}</button> <span id="selcount" class="muted">${t('{0} selected', n)}</span></span>
      <span><button class="btn ghost sm" data-act="scansel">${t('Scan AI')}</button> <button class="btn ghost sm" data-act="autosel">${t('Auto-grade')}</button> <button class="btn sm" data-act="savesel">${t('Save selected')}</button></span></div>
      ${list.map(s => { const h = S.hw.find(x => x.id === s.hw) || { title: '?', subject: '' };
        return `<div class="grow"><input type="checkbox" data-sel="${s.id}" ${G.sel.has(s.id) ? 'checked' : ''} aria-label="${esc(s.student)}">
        <div><b>${esc(s.student)}</b> <span class="tag" style="--h:${hue(h.subject)}">${esc(tx(h.title))}</span>
        <div><small class="muted">${esc(tx(s.text).slice(0, 80))}…</small></div><div style="margin-top:.3rem">${aiBadge(s.ai)} <button class="btn ghost sm" data-act="view" data-id="${s.id}">${t('View')}</button></div></div>
        <input id="g${s.id}" data-grade="1" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="0-100" value="${s.grade ?? ''}" aria-label="${t('Grade')}"><input id="f${s.id}" placeholder="${t('Feedback')}" value="${esc(tx(s.fb))}" aria-label="${t('Feedback')}">
        <button class="btn ghost sm" data-act="gsave" data-id="${s.id}">${t('Save')}</button></div>`; }).join('') || `<p class="muted" style="padding-top:.8rem">${t('Nothing matches this filter.')}</p>`}</div>
    <p class="muted" style="margin:1rem 0">${t('AI scores are only a signal — they can be wrong. Always review before penalising a student.')}</p>
    <details class="card"><summary style="cursor:pointer;font-weight:600">${t('AI detector settings')}</summary>
      <p class="muted" style="margin-top:.6rem">${t('Uses a free built-in estimate by default. Paste a {0} API key to use their detector instead (the key stays in this browser).', '<a href="https://sapling.ai" target="_blank" rel="noopener">Sapling</a>')} ${t('The built-in estimate is tuned for English text.')}</p>
      <div class="row" style="margin-top:.6rem"><input id="apikey" type="password" placeholder="${t('Sapling API key (optional)')}" value="${esc(S.apiKey)}" style="flex:1"><button class="btn sm" data-act="savekey">${t('Save')}</button></div></details>`;
  },
  gradebook() {
    const rows = gradeRows();
    const gs = S.subs.filter(s => s.grade != null).map(s => s.grade), qAll = S.accounts.flatMap(a => Object.values(a.data.qres || {}).map(r => r.score));
    const qScores = z => S.accounts.map(a => a.data.qres && a.data.qres[z.id]).filter(Boolean).map(r => r.score);
    const pill = g => `<span class="b ${g >= 70 ? 'gr' : g >= 50 ? 'todo' : 'bad'}">${g}</span>`;
    return `<h1>${t('Gradebook')}</h1><div class="row" style="margin-bottom:1rem"><p class="muted">${t('Every student, every assignment, in one place.')}</p><button class="btn ghost sm" data-act="csv">${t('Download CSV')}</button></div>
    <div class="card" style="overflow:auto"><table class="gb"><tr><th>${t('Student')}</th>${S.hw.map(h => `<th title="${esc(tx(h.title))}">${esc(tx(h.subject))}<small>${esc(tx(h.title).slice(0, 22))}</small></th>`).join('')}${S.quizzes.map(z => `<th title="${esc(tx(z.title))}">${t('Quiz')}<small>${esc(tx(z.title).slice(0, 22))}</small></th>`).join('')}<th>${t('Average')}</th></tr>
    ${rows.map(r => `<tr><td><b>${esc(r.n)}</b></td>${r.cells.map((c, i) => `<td>${c ? (c.grade != null ? pill(c.grade) : `<span class="b sub">${t('Submitted')}</span>`)
      : (daysLeft(S.hw[i].due) < 0 ? `<span class="red">${t('Missing')}</span>` : '<span class="muted">–</span>')}</td>`).join('')}${r.qcells.map(q => `<td>${q != null ? pill(q) : '<span class="muted">–</span>'}</td>`).join('')}<td><b>${r.avg ?? '–'}</b></td></tr>`).join('')}
    <tr class="foot"><td>${t('Class average')}</td>${S.hw.map(h => `<td>${avgOf(S.subs.filter(s => s.hw === h.id && s.grade != null).map(s => s.grade)) ?? '–'}</td>`).join('')}${S.quizzes.map(z => `<td>${avgOf(qScores(z)) ?? '–'}</td>`).join('')}<td>${avgOf([...gs, ...qAll]) ?? '–'}</td></tr></table></div>`;
  },
  quizzes() {
    flushUser();
    const stats = z => { const sc = S.accounts.map(a => a.data.qres && a.data.qres[z.id]).filter(Boolean).map(r => r.score); return { n: sc.length, avg: avgOf(sc) }; };
    return `<h1>${t('Quizzes')}</h1><p class="muted" style="margin-bottom:1rem">${t('Create a quiz and publish it — it is graded automatically and shows up in the Gradebook.')}</p>
    <div class="card"><h3>${t('Create a quiz')}</h3><div class="cols"><div><label>${t('Quiz title')}</label><input id="q-title" maxlength="60"></div><div><label>${t('Subject')}</label><input id="q-sub" list="subjlist"></div></div>
      <label>${t('Questions')}</label><textarea id="q-body" style="min-height:200px;font-family:monospace" placeholder="${esc(QUIZ_EXAMPLE)}"></textarea>
      <p class="muted" style="font-size:.85rem;margin-top:.4rem">${t('Write one block per question. The first line is the question, then the options — put * before the correct one. Leave a blank line between questions.')}</p>
      <p style="margin-top:.8rem"><button class="btn" data-act="mkquiz">${t('Publish quiz')}</button> <button class="btn ghost" data-act="loadex">${t('Load an example')}</button></p>${subjList()}</div>
    <h2>${t('Your quizzes')}</h2>${S.quizzes.map(z => { const st = stats(z);
      return `<div class="card hw"><div class="row"><span><span class="tag" style="--h:${hue(z.subject)}">${esc(tx(z.subject))}</span> <b>${esc(tx(z.title))}</b></span><span class="b ${z.open ? 'gr' : 'todo'}">${t(z.open ? 'Open to students' : 'Closed')}</span></div>
      <p class="muted">${t('{0} questions', z.questions.length)} · ${st.n ? t('taken by {0}', st.n) + ' · ' + t('Average') + ': ' + st.avg + '%' : t('Nobody has taken it yet.')}</p>
      <p style="margin-top:.6rem"><button class="btn ghost sm" data-act="toggleq" data-id="${z.id}">${t(z.open ? 'Close quiz' : 'Open quiz')}</button> <button class="btn ghost sm" data-act="announceq" data-id="${z.id}">${t('Email the class')}</button> <button class="btn ghost sm" data-act="delquiz" data-id="${z.id}">${t('Delete')}</button></p></div>`; }).join('') || `<p class="muted">${t('No quizzes yet.')}</p>`}`;
  },
  emails() {
    const list = [...S.mails].sort((a, b) => a.sent - b.sent || a.at - b.at);
    return `<h1>${t('Automatic emails')}</h1><p class="muted" style="margin-bottom:1rem">${t('Demo mode: nothing leaves your browser — emails “send” into the log below when their time arrives.')}</p>
    <div class="card"><div class="cols"><div><label>${t('To')}</label><select id="m-to">${['All students', 'Class 10A', 'Parents'].map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
    <div><label>${t('Send at')}</label><input id="m-at" type="datetime-local" value="${localInput(Date.now() + 36e5)}"></div></div>
    <label>${t('Email subject')}</label><input id="m-sub"><label>${t('Message')}</label><textarea id="m-body" placeholder="${t('Write your message…')}"></textarea>
    <p style="margin-top:.8rem" class="row"><span><button class="btn" data-act="schedule">${t('Schedule')}</button> <button class="btn ghost" data-act="demo">${t('Demo: send in 10s')}</button></span></p></div>
    <h2>${t('Exam reminders')}</h2><div class="card list">${S.exams.map(e => `<div class="row"><span>${esc(tx(e.title))} <span class="muted">· ${e.date}</span></span>
      <button class="btn ghost sm" data-act="remind" data-id="${e.id}">${t('Remind class 1 day before')}</button></div>`).join('') || `<p class="muted">${t('No exams.')}</p>`}</div>
    <h2>${t('Mail log')}</h2>${list.map(m => `<div class="card mail"><div class="row"><b>${esc(tx(m.subject))}</b><span class="b ${m.sent ? 'gr' : 'todo'}">${t(m.sent ? 'Sent' : 'Scheduled')}</span></div>
      <small>${t(m.sent ? 'To: {0} · sent {1}' : 'To: {0} · sends {1}', esc(tx(m.to)), fmt(m.at))}</small><p>${esc(tx(m.body))}</p></div>`).join('')}`;
  }
};

/* ---------- render ---------- */
let observer;
function render() {
  if (S.role === 'teacher' && !isAuthed()) S.role = 'student';
  document.body.dataset.theme = S.theme;
  document.documentElement.lang = LANG;
  document.title = (S.role === 'teacher' && unread()) ? `(${unread()}) StudyHub` : 'StudyHub';
  const pages = S.role === 'student' ? STU.filter(p => p[0] !== 'profile' || me()) : TCH;
  if (!pages.some(p => p[0] === S.page)) S.page = pages[0][0];
  const a = me(), guest = S.role === 'student' && !a;
  const who = S.role === 'teacher'
    ? `<span>${S.teacherName ? esc(S.teacherName) + ' · ' + t('Teacher') : t('Signed in as Teacher')}</span><button class="btn sm" data-act="logout">${t('Sign out')}</button>`
    : a ? `<button class="who-btn" data-act="go" data-p="profile"><span class="avatar" style="--c:${a.color}">${esc(initial(a.name))}</span><span class="wn">${esc(a.name)}<small>${a.klass ? t('Class') + ' ' + esc(a.klass) : (a.firebaseUid ? '' : '@') + esc(a.user)}</small></span></button><button class="btn sm" data-act="slogout">${t('Log out')}</button>`
    : `<span>${t('Guest · Limited access')}</span><button class="btn sm" data-act="slogin">${t('Log in')}</button>`;
  const content = guest && LOCKED.includes(S.page) ? lockedView(S.page) : VIEWS[S.page]();
  const bell = S.role === 'teacher' ? bellHtml() : '', panel = S.role === 'teacher' && NP_OPEN ? notifPanel() : '';
  $('#app').innerHTML = `<aside class="side"><div class="logo">StudyHub<small>${t('Class portal')}</small></div>
    ${pages.map(([k, l]) => `<button class="nav ${S.page === k ? 'on' : ''}" data-act="go" data-p="${k}">${t(l)}${guest && LOCKED.includes(k) ? LOCK_SVG : ''}</button>`).join('')}
    <div class="who">${who}</div></aside>
    <main class="main"><div class="top">${bell}
    <div class="seg" role="group" aria-label="Language"><button class="${LANG === 'sq' ? 'on' : ''}" data-act="lang" data-l="sq">Shqip</button><button class="${LANG === 'en' ? 'on' : ''}" data-act="lang" data-l="en">English</button></div>
    <div class="seg"><button class="${S.role === 'student' ? 'on' : ''}" data-act="role" data-r="student">${t('Student')}</button>
    <button class="${S.role === 'teacher' ? 'on' : ''}" data-act="role" data-r="teacher">${t('Teacher')}</button></div>
    ${guest ? `<button class="btn ghost sm" data-act="slogin">${t('Log in')}</button><button class="btn sm" data-act="ssignup">${t('Create account')}</button>` : ''}
    <button class="btn ghost sm" data-act="theme">${t(S.theme === 'dark' ? 'Light mode' : 'Dark mode')}</button></div>
    ${panel}${bannerHtml()}<div class="page">${content}</div></main>`;
  if (observer) observer.disconnect();
  if (S.page === 'history') {
    observer = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
    document.querySelectorAll('.ev').forEach(e => observer.observe(e));
    loadImages();
  }
  save(); onScroll();
}
function onScroll() {
  const h = document.documentElement, yb = $('#yb');
  $('#bar').style.width = (scrollY / ((h.scrollHeight - innerHeight) || 1)) * 100 + '%';
  const tl = $('.tl');
  if (tl && S.page === 'history') {
    const r = tl.getBoundingClientRect();
    tl.querySelector('.tl-line i').style.height = Math.max(0, Math.min(1, (innerHeight / 2 - r.top) / r.height)) * 100 + '%';
    let best = null, bd = 1e9;
    tl.querySelectorAll('.ev').forEach(e => { const b = e.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = e; } });
    if (best && r.top < innerHeight / 2 && r.bottom > innerHeight / 2) { yb.textContent = yr(+best.dataset.y); yb.classList.add('show'); return; }
  }
  yb.classList.remove('show');
}

/* ---------- actions ---------- */
function scheduleMail(m) { S.mails.push({ id: nextId(), sent: false, ...m }); render(); }
async function scanSub(s) { s.ai = await detect(tx(s.text)); }
const V = id => ($('#' + id) || {}).value || '';

function studentAuthModal(mode, msg = '') {
  const m = $('#modal'), login = mode === 'login';
  m.innerHTML = `<div class="mbox login"><h2>${t(login ? 'Log in' : 'Create account')}</h2>
    <label for="${login ? 'su-user' : 'sn-user'}">${t('Email address')}</label><input id="${login ? 'su-user' : 'sn-user'}" type="email" autocomplete="username">
    ${login ? '' : `<label for="sn-name">${t('Display name')}</label><input id="sn-name" maxlength="30">`}
    <label for="${login ? 'su-pass' : 'sn-pass'}">${t('Password')}</label><input id="${login ? 'su-pass' : 'sn-pass'}" type="password" autocomplete="${login ? 'current-password' : 'new-password'}">
    <div class="err">${esc(msg)}</div>
    <p style="margin-top:.8rem"><button class="btn" data-act="${login ? 'dosl' : 'dosu'}">${t(login ? 'Log in' : 'Create account')}</button> <button class="btn ghost" data-act="close">${t('Cancel')}</button></p>
    <p class="muted" style="margin-top:.9rem;font-size:.88rem">${login ? t('No account yet?') : t('Already have an account?')}
      <button class="linkbtn" data-act="${login ? 'ssignup' : 'slogin'}">${t(login ? 'Create account' : 'Log in')}</button></p>
    ${login && S.accounts.some(a => a.user === 'alex' && !a.firebaseUid) ? `<p class="muted" style="margin-top:.6rem;font-size:.82rem">${t('Demo account: alex / student')} <button class="linkbtn" data-act="demoalex">${t('Open Alex demo account')}</button></p>` : ''}</div>`;
  m.hidden = false; setTimeout(() => { const i = $(login ? '#su-user' : '#sn-user'); if (i) i.focus(); }, 0);
}
function loginAs(a) { flushUser(); S.me = a.id; loadUser(a); checkBadges(true); closeModal(); bigDismissed = false; render(); bigAlert(); }
let pickedColor = null;
const nameTaken = (name, selfId) => [...S.accounts.filter(a => a.id !== selfId).map(a => a.name), 'Mia', 'Leo', 'Sam', 'Nora'].some(n => n.toLowerCase() === name.toLowerCase());

let authBusy = false;
function firebaseStudent(user, displayName) {
  let account = S.accounts.find(a => a.firebaseUid === user.uid);
  if (account) return account;
  const base = (displayName || user.displayName || t('Student')).slice(0, 30);
  let name = base;
  for (let n = 2; nameTaken(name); n++) name = `${base} (${n})`;
  account = { id: user.uid, firebaseUid: user.uid, user: user.email, name, klass: '',
    color: COLORS[S.accounts.length % COLORS.length], createdOn: todayStr(), data: blankUser() };
  S.accounts.push(account);
  return account;
}
function clearStudentSession() {
  flushUser(); S.me = null; loadUser(null); S.page = 'home'; render();
}
function authError(error) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account already uses this email address.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong email or password.',
    'auth/user-not-found': 'Wrong email or password.',
    'auth/weak-password': 'Password needs at least 6 characters.',
    'auth/requires-recent-login': 'Sign out and sign in again before deleting your account.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Check your internet connection and try again.'
  };
  return t(messages[error.code] || 'Firebase Authentication is unavailable. Try again later.');
}
async function withStudentAuth(operation, reportError = toast) {
  if (authBusy) return;
  authBusy = true;
  try {
    const connection = await window.studyHubAuth;
    if (!connection) throw new Error('Firebase SDK unavailable');
    await operation(connection);
  } catch (error) {
    reportError(authError(error));
  } finally {
    authBusy = false;
  }
}
function submitStudentAuth(mode) {
  const signup = mode === 'signup';
  const prefix = signup ? 'sn' : 'su';
  const emailField = $(`#${prefix}-user`);
  if (!emailField) return;
  const email = emailField.value.trim(), password = V(`${prefix}-pass`), name = V('sn-name').trim();
  const errorBox = $('#modal .err');
  const fail = msg => { errorBox.textContent = msg; };
  if (!email || !emailField.validity.valid) return fail(t('Enter a valid email address.'));
  if (!password) return fail(t('Enter your password.'));
  if (signup && !name) return fail(t('Enter your name.'));
  if (signup && nameTaken(name)) return fail(t('That name is already used by another student.'));
  if (signup && password.length < 6) return fail(t('Password needs at least 6 characters.'));
  errorBox.textContent = '';
  return withStudentAuth(async ({ auth, api }) => {
    const credential = signup
      ? await api.createUserWithEmailAndPassword(auth, email, password)
      : await api.signInWithEmailAndPassword(auth, email, password);
    if (signup) {
      try { await api.updateProfile(credential.user, { displayName: name }); }
      catch (error) { console.warn('Could not save Firebase display name', error); }
    }
    const account = firebaseStudent(credential.user, signup ? name : '');
    loginAs(account);
    toast(t(signup ? 'Account created — welcome, {0}!' : 'Welcome back, {0}', account.name));
  }, fail);
}

const ACT = {
  bell: () => { NP_OPEN = !NP_OPEN; render(); },
  readall: () => { S.notifs.forEach(n => { n.read = true; }); render(); },
  notifopen: d => {
    const n = S.notifs.find(x => x.id == d.id); if (!n) return;
    n.read = true; NP_OPEN = false;
    if (n.kind === 'hw') { G.hw = 'all'; G.st = 'all'; G.sel = new Set([n.subId]); S.page = 'grading'; } else S.page = 'gradebook';
    scrollTo(0, 0); render();
  },
  alertopen: d => { const n = S.notifs.find(x => x.id == d.id); ACT.alertclose(d); if (n) ACT.notifopen(d); else { NP_OPEN = true; render(); } },
  alertclose: d => { const el = document.querySelector(`.dalert[data-nid="${d.id}"]`); if (el) el.remove(); },
  sound: () => { S.sound = !S.sound; if (S.sound) pingSound('ping'); render(); },
  desktop: async () => {
    try { const p = await Notification.requestPermission(); toast(t(p === 'granted' ? 'Desktop alerts are on' : 'Your browser blocked notifications.')); }
    catch { toast(t('Your browser blocked notifications.')); }
  },
  bigdo: d => { closeModal(); bigDismissed = true; S.page = 'homework'; render(); ACT.submit({ id: d.id }); },
  bigclose: () => closeModal(),
  slogin: () => studentAuthModal('login'),
  ssignup: () => studentAuthModal('signup'),
  dosl: () => submitStudentAuth('login'),
  dosu: () => submitStudentAuth('signup'),
  demoalex: () => {
    const alex = S.accounts.find(a => a.user === 'alex' && !a.firebaseUid);
    if (!alex || authBusy || me()) return;
    if (hashPw(V('su-pass')) !== alex.pwHash) {
      $('#modal .err').textContent = t('Wrong password.');
      return;
    }
    loginAs(alex);
  },
  slogout: () => {
    const finish = () => { clearStudentSession(); toast(t('Signed out')); };
    if (!me()?.firebaseUid) return finish();
    return withStudentAuth(async ({ auth, api }) => { await api.signOut(auth); finish(); });
  },
  swatch: d => {
    pickedColor = d.c;
    document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', b.dataset.c === d.c));
    const av = $('#av-prev'); if (av) av.style.setProperty('--c', d.c);
  },
  saveprofile: () => {
    const a = me(), name = V('pf-name').trim();
    if (!name) return toast(t('Enter your name.'));
    if (nameTaken(name, a.id)) return toast(t('That name is already used by another student.'));
    if (name !== a.name) { S.subs.forEach(s => { if (s.student === a.name) s.student = name; }); S.mails.forEach(m => { if (m.to === a.name) m.to = name; }); }
    a.name = name; a.klass = V('pf-class').trim(); a.color = pickedColor || a.color; pickedColor = null;
    toast(t('Profile saved')); render();
  },
  chspw: () => {
    const a = me();
    const oldPassword = V('pf-old'), newPassword = V('pf-new');
    if (a.firebaseUid) {
      if (newPassword.length < 6) return toast(t('New password needs at least 6 characters'));
      return withStudentAuth(async ({ auth, api }) => {
        const user = auth.currentUser;
        if (user?.uid !== a.firebaseUid) throw new Error('Missing Firebase session');
        await api.reauthenticateWithCredential(user, api.EmailAuthProvider.credential(user.email, oldPassword));
        await api.updatePassword(user, newPassword);
        toast(t('Password changed')); render();
      });
    }
    if (hashPw(V('pf-old')) !== a.pwHash) return toast(t('Current password is wrong'));
    if (V('pf-new').length < 6) return toast(t('New password needs at least 6 characters'));
    a.pwHash = hashPw(V('pf-new')); toast(t('Password changed')); render();
  },
  delacct: () => {
    const a = me(); if (!a || !confirm(t('This permanently deletes your account and your saved data. Continue?'))) return;
    const finish = () => {
      S.subs = S.subs.filter(s => s.student !== a.name);
      S.accounts = S.accounts.filter(x => x.id !== a.id);
      clearStudentSession(); toast(t('Account deleted'));
    };
    if (!a.firebaseUid) return finish();
    return withStudentAuth(async ({ auth, api }) => {
      const user = auth.currentUser;
      if (user?.uid !== a.firebaseUid) throw new Error('Missing Firebase session');
      await api.deleteUser(user);
      finish();
    });
  },
  tname: () => { S.teacherName = V('t-name').trim().slice(0, 30); toast(t('Profile saved')); render(); },
  close: closeModal,
  go: d => { S.page = d.p; scrollTo(0, 0); render(); },
  lang: d => { LANG = d.l === 'en' ? 'en' : 'sq'; S.lang = LANG; render(); },
  role: d => { if (d.r === 'teacher' && !isAuthed()) return loginModal(); S.role = d.r; S.page = ''; render(); if (d.r === 'student') bigAlert(); },
  dologin: () => {
    if (Date.now() < lockUntil) return loginModal(t('Too many tries. Wait {0} seconds.', Math.ceil((lockUntil - Date.now()) / 1000)));
    if (hashPw(V('pw')) === S.pwHash) { fails = 0; setAuthed(true); S.role = 'teacher'; S.page = ''; closeModal(); toast(t('Signed in as teacher')); render(); announceUnread(); }
    else { if (++fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; } loginModal(t('Wrong password.')); }
  },
  logout: () => { setAuthed(false); S.role = 'student'; S.page = ''; toast(t('Signed out')); render(); },
  chpw: () => {
    if (hashPw(V('pw-old')) !== S.pwHash) return toast(t('Current password is wrong'));
    if (V('pw-new').length < 6) return toast(t('New password needs at least 6 characters'));
    S.pwHash = hashPw(V('pw-new')); toast(t('Password changed')); render();
  },
  theme: () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; render(); },
  tstart: () => { if (T.run) { clearInterval(T.iv); T.run = false; } else { T.run = true; T.iv = setInterval(tick, 1000); } render(); },
  treset: () => setTimer(T.total / 60, T.mode),
  preset: d => setTimer(+d.m, d.md),
  custom: () => { const m = +V('cmin'); if (m > 0 && m <= 180) setTimer(m, 'Focus'); else toast(t('Enter 1–180 minutes')); },
  addsub: d => {
    const name = (d.s || V('sub-new')).trim().slice(0, 30); if (!name) return toast(t('Type a subject name'));
    if (S.subjects.some(x => x.toLowerCase() === name.toLowerCase())) return toast(t('{0} is already in your list', tx(name)));
    S.subjects.push(name); render();
  },
  rmsub: d => { S.subjects = S.subjects.filter(x => x !== d.s); Object.keys(S.tt).forEach(k => { if (S.tt[k] === d.s) delete S.tt[k]; }); render(); },
  cleartt: () => { S.tt = {}; render(); },
  addexam: () => {
    if (!V('e-title') || !V('e-date')) return toast(t('Add a title and a date'));
    S.exams.push({ id: nextId(), subject: V('e-sub') || 'General', title: V('e-title'), date: V('e-date') }); toast(t('Exam added')); render();
  },
  delexam: d => { S.exams = S.exams.filter(e => e.id != d.id); delete S.plan[d.id]; render(); },
  hf: d => { HF = d.c; render(); },
  ev: d => {
    const i = +d.i, e = EV[i], x = evText(e);
    modal(`<div class="ev-fig" data-wiki="${e.wiki}" data-big="1" data-alt="${esc(x.t)}"><span>${yr(e.y)}</span></div>
      <h2 style="margin-top:1rem">${x.t}</h2><p class="muted">${yr(e.y)} · ${t(cat(e.y))}</p>
      ${x.p.map(p => `<p style="margin:.7rem 0">${p}</p>`).join('')}
      <h3 style="margin-top:1.1rem">${t('Key facts')}</h3><ul class="facts">${x.f.map(f => `<li>${f}</li>`).join('')}</ul>
      <p class="muted" style="font-size:.82rem;margin-top:.9rem"><a href="https://en.wikipedia.org/wiki/${e.wiki}" target="_blank" rel="noopener">${t('Read more on Wikipedia')}</a> · ${t('Images load from Wikipedia and need an internet connection.')}</p>
      <div class="row" style="margin-top:.9rem"><button class="btn ghost sm" data-act="ev" data-i="${i - 1}" ${i ? '' : 'disabled'}>← ${t('Previous')}</button>
      <span class="muted">${i + 1} / ${EV.length}</span><button class="btn ghost sm" data-act="ev" data-i="${i + 1}" ${i < EV.length - 1 ? '' : 'disabled'}>${t('Next')} →</button></div>`, true);
    loadImages($('#modal'));
  },
  submit: d => { const h = S.hw.find(x => x.id == d.id);
    modal(`<h2>${esc(tx(h.title))}</h2><p class="muted">${esc(tx(h.desc))}</p><label>${t('Your answer')}</label><textarea id="sub-text" style="min-height:160px" placeholder="${t('Type your work here…')}"></textarea>
    <p style="margin-top:.8rem"><button class="btn" data-act="dosub" data-id="${h.id}">${t('Hand in')}</button></p>`); },
  dosub: d => {
    const text = V('sub-text').trim(); if (!text) return toast(t('Write something first'));
    const hw = S.hw.find(x => x.id == d.id), sub = { id: nextId(), hw: +d.id, student: myName(), text, grade: null, fb: '', ai: heuristic(text) };
    S.subs.push(sub); pushNotif({ kind: 'hw', student: sub.student, title: hw.title, subId: sub.id });
    closeModal(); touchStreak(); toast(t('Handed in — your teacher will grade it')); confetti(); checkBadges(); render();
  },
  qstart: d => { QSEL = +d.id; scrollTo(0, 0); render(); },
  qback: () => { QSEL = null; render(); },
  grade: () => {
    const z = S.quizzes.find(x => x.id === QSEL); if (!z) return;
    const ans = z.questions.map((_, i) => { const c = document.querySelector(`input[name=q${i}]:checked`); return c ? +c.value : -1; });
    if (ans.includes(-1)) return toast(t('Answer every question first'));
    const score = Math.round(ans.filter((a, i) => a === z.questions[i].a).length / z.questions.length * 100);
    S.qres[z.id] = { ans, score }; pushNotif({ kind: 'quiz', student: myName(), title: z.title, score }); touchStreak(); if (score >= 75) confetti(); toast(t('Auto-graded: {0}%', score)); checkBadges(); render();
  },
  retake: d => { delete S.qres[+d.id]; QSEL = +d.id; render(); },
  planmodal: d => {
    const e = S.exams.find(x => x.id == d.id);
    modal(`<h2>${t('Plan revision')}</h2><p class="muted">${esc(tx(e.title))} · ${examWhen(daysLeft(e.date))}</p><label>${t('Minutes per day')}</label>
      <select id="pl-mins">${[20, 30, 45, 60, 90].map(m => `<option ${m === 45 ? 'selected' : ''}>${m}</option>`).join('')}</select>
      <p style="margin-top:.8rem"><button class="btn" data-act="mkplan" data-id="${e.id}">${t('Create plan')}</button></p>`);
  },
  mkplan: d => {
    const e = S.exams.find(x => x.id == d.id); S.plan[e.id] = makePlan(e, +V('pl-mins') || 45);
    closeModal(); touchStreak(); toast(t('Plan created: {0} study days', S.plan[e.id].days.length)); checkBadges(); S.page = 'plan'; render();
  },
  delplan: d => { delete S.plan[d.id]; render(); },
  plantimer: d => { S.page = 'timer'; setTimer(+d.m || 25, 'Focus'); },
  loadex: () => { $('#q-body').value = QUIZ_EXAMPLE; if (!V('q-title')) $('#q-title').value = 'Quick check'; },
  mkquiz: () => {
    const title = V('q-title').trim(), r = parseQuiz(V('q-body'));
    if (r.error) return toast(t('Question {0} needs 2–6 options and exactly one * correct answer.', r.error));
    if (!title || !r.qs.length) return toast(t('Quiz needs a title and at least one question.'));
    S.quizzes.push({ id: nextId(), title, subject: V('q-sub').trim() || 'General', open: true, questions: r.qs });
    toast(t('Quiz published — students can see it now')); render();
  },
  toggleq: d => { const z = S.quizzes.find(x => x.id == d.id); z.open = !z.open; render(); },
  delquiz: d => { flushUser(); S.quizzes = S.quizzes.filter(z => z.id != d.id); S.accounts.forEach(a => { delete a.data.qres[d.id]; }); loadUser(me()); if (QSEL == d.id) QSEL = null; render(); },
  announceq: d => {
    const z = S.quizzes.find(x => x.id == d.id);
    scheduleMail({ to: 'All students', subject: t('New quiz: {0}', tx(z.title)), body: t('{0} questions', z.questions.length), at: Date.now() + 1e4 });
    toast(t('Email will send in 10 seconds'));
  },
  savekey: () => { S.apiKey = V('apikey').trim(); toast(t(S.apiKey ? 'Key saved — using Sapling' : 'Key removed — using built-in estimate')); render(); },
  view: d => { const s = S.subs.find(x => x.id == d.id);
    modal(`<h2>${t('{0}’s work', esc(s.student))}</h2><p>${aiBadge(s.ai)} <span class="muted">${s.ai ? esc(t(s.ai.src)) : ''}</span></p>
      <div class="card" style="margin:.8rem 0">${esc(tx(s.text))}</div>${s.ai ? `<ul style="padding-left:1.2rem">${s.ai.reasons.map(r => `<li>${esc(t(r[0], r[1]))}</li>`).join('')}</ul>` : `<p class="muted">${t('Not scanned yet.')}</p>`}`); },
  selall: () => { gList().forEach(s => G.sel.add(s.id)); render(); },
  selnone: () => { G.sel.clear(); render(); },
  gograde: d => { G.hw = 'all'; G.st = 'all'; G.sel = new Set([+d.id]); S.page = 'grading'; scrollTo(0, 0); render(); },
  scansel: async () => {
    const p = picked(); if (!p.length) return toast(t('Tick at least one submission first'));
    toast(t('Scanning {0}…', p.length)); for (const s of p) await scanSub(s); render();
  },
  autosel: () => {
    const p = picked(); if (!p.length) return toast(t('Tick at least one submission first'));
    p.forEach(s => { if (!s.ai) s.ai = heuristic(tx(s.text)); const r = autoGrade(s); $('#g' + s.id).value = r.grade; $('#f' + s.id).value = r.fb; });
    toast(t('Suggested grades filled in for {0} — review, then press Save selected', p.length));
  },
  savesel: () => {
    const p = picked(); if (!p.length) return toast(t('Tick at least one submission first'));
    const n = p.filter(saveGrade).length; if (!n) return toast(t('Enter or auto-fill some grades first'));
    G.sel.clear(); toast(t('Saved {0} grade(s) and emailed the students', n)); render();
  },
  gsave: d => {
    const s = S.subs.find(x => x.id == d.id);
    if (!saveGrade(s)) return toast(t('Enter a grade from 0 to 100'));
    toast(t('Saved — emailed {0} automatically', s.student)); render();
  },
  addhw: () => {
    if (!V('a-title').trim() || !V('a-due')) return toast(t('Add a title and a due date'));
    S.hw.push({ id: nextId(), subject: V('a-sub').trim() || 'General', title: V('a-title').trim(), due: V('a-due'), desc: V('a-desc').trim() || 'See your teacher for details.',
      kw: V('a-kw').split(',').map(k => k.trim().toLowerCase()).filter(Boolean) });
    toast(t('Assignment created — students can see it now')); render();
  },
  delhw: d => { S.hw = S.hw.filter(h => h.id != d.id); S.subs = S.subs.filter(s => s.hw != d.id); render(); },
  announce: d => {
    const h = S.hw.find(x => x.id == d.id);
    scheduleMail({ to: 'All students', subject: t('New assignment: {0}', tx(h.title)), body: `${tx(h.desc)} ${t('Due')} ${h.due}.`, at: Date.now() + 1e4 });
    toast(t('Email will send in 10 seconds'));
  },
  csv: () => {
    const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [[t('Student'), ...S.hw.map(h => tx(h.title)), ...S.quizzes.map(z => t('Quiz') + ': ' + tx(z.title)), t('Average')],
      ...gradeRows().map(r => [r.n, ...r.cells.map(c => c && c.grade != null ? c.grade : ''), ...r.qcells.map(x => x ?? ''), r.avg ?? ''])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + lines.map(l => l.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'gradebook.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  schedule: () => {
    const at = new Date(V('m-at')).getTime();
    if (!V('m-sub') || isNaN(at)) return toast(t('Add a subject and a send time'));
    scheduleMail({ to: V('m-to'), subject: V('m-sub'), body: V('m-body'), at }); toast(t('Scheduled'));
  },
  demo: () => { scheduleMail({ to: V('m-to') || 'All students', subject: V('m-sub') || t('Demo email'), body: V('m-body') || t('This was sent automatically.'), at: Date.now() + 1e4 }); toast(t('Will send in 10 seconds…')); },
  remind: d => {
    const e = S.exams.find(x => x.id == d.id); const when = new Date(e.date + 'T08:00').getTime() - 864e5;
    scheduleMail({ to: 'All students', subject: t('Reminder: {0} tomorrow', tx(e.title)), body: t('Good luck on your {0} exam tomorrow!', tx(e.subject)), at: when > Date.now() ? when : Date.now() + 1e4 });
    toast(t(when > Date.now() ? 'Reminder scheduled for the day before' : 'That date has passed — sending in 10s'));
  }
};

document.addEventListener('click', e => {
  if (e.target.id === 'modal') return closeModal();
  const el = e.target.closest('[data-act]');
  if (NP_OPEN && !e.target.closest('.npanel') && !(el && el.dataset.act === 'bell')) { NP_OPEN = false; if (!el) render(); }
  if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el.dataset);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'pw') ACT.dologin();
  if (e.key === 'Enter' && e.target.id === 'sub-new') ACT.addsub({});
  if (e.key === 'Enter' && e.target.id === 'su-pass') ACT.dosl();
  if (e.key === 'Enter' && ['sn-pass', 'sn-name', 'sn-user'].includes(e.target.id)) ACT.dosu();
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('card') && e.target.dataset.act === 'ev') ACT.ev(e.target.dataset);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.grade !== undefined) { clampGrade(el); return; }
  if (el.dataset.tt !== undefined) {
    const v = el.value.trim(); if (v) S.tt[el.dataset.tt] = v; else delete S.tt[el.dataset.tt];
    el.classList.toggle('filled', !!v); el.style.setProperty('--h', hue(v)); save();
  } else if (el.dataset.time !== undefined) { S.times[+el.dataset.time] = el.value; save(); }
  else if (el.dataset.sel !== undefined) {
    if (el.checked) G.sel.add(+el.dataset.sel); else G.sel.delete(+el.dataset.sel);
    const c = $('#selcount'); if (c) c.textContent = t('{0} selected', gList().filter(s => G.sel.has(s.id)).length);
  } else if (el.dataset.gf) { G[el.dataset.gf] = el.value; render(); }
  else if (el.dataset.pday) {
    const [id, date] = el.dataset.pday.split('|'), day = ((S.plan[id] || {}).days || []).find(x => x.date === date);
    if (day) { day.done = el.checked; if (el.checked) { touchStreak(); checkBadges(); } render(); }
  }
});
document.addEventListener('change', e => { if (e.target.dataset.time !== undefined && e.target.value) render(); });
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);

/* scheduled emails: check every 3 seconds */
setInterval(() => {
  const due = S.mails.filter(m => !m.sent && m.at <= Date.now());
  if (!due.length) return;
  due.forEach(m => { m.sent = true; toast(t('Sent to {0}: “{1}”', tx(m.to), tx(m.subject))); });
  save(); if (S.page === 'emails') render();
}, 3000);

document.body.insertAdjacentHTML('beforeend', '<div id="yb"></div><div id="alerts" aria-live="polite"></div>');
addEventListener('storage', e => { if (e.key === KEY && e.newValue) applyExternal(e.newValue); });
render();
bigAlert();
window.studyHubAuth?.then(connection => {
  if (!connection) return;
  const { auth, api } = connection;
  api.onAuthStateChanged(auth, user => {
    if (authBusy) return;
    if (user && me()?.firebaseUid !== user.uid) loginAs(firebaseStudent(user));
    if (!user && me()?.firebaseUid) clearStudentSession();
  });
});
})();
