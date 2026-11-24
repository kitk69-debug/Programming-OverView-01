document.addEventListener('DOMContentLoaded', () => {
    const Sound = (() => {
        let ctx = null;
        let enabled = true;
        try { enabled = localStorage.getItem('profileSound') !== 'off'; } catch (e) {}
        function getCtx() {
            if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
            if (ctx.state === 'suspended') ctx.resume();
            return ctx;
        }
        function tone({ freq = 600, endFreq = null, type = 'sine', duration = 0.12, volume = 0.12, delay = 0 }) {
            if (!enabled) return;
            const c = getCtx(); if (!c) return;
            const t = c.currentTime + delay; const osc = c.createOscillator(); const gain = c.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, t);
            if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
            gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + 0.01); gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            osc.connect(gain).connect(c.destination); osc.start(t); osc.stop(t + duration + 0.05);
        }
        return {
            open: () => { tone({freq:380,endFreq:900,duration:.16,volume:.1}); tone({freq:900,endFreq:1500,duration:.14,volume:.07,delay:.1}); },
            close: () => tone({freq:900,endFreq:260,duration:.22,volume:.09}),
            select: on => tone({freq:on?988:660,type:'triangle',duration:.1,volume:.1}),
            swoosh: () => tone({freq:250,endFreq:1400,type:'sawtooth',duration:.18,volume:.035}),
            boop: () => { const p=.8+Math.random()*.6; tone({freq:480*p,endFreq:1100*p,type:'triangle',duration:.12,volume:.14}); tone({freq:1100*p,endFreq:700*p,type:'triangle',duration:.12,volume:.11,delay:.1}); },
            success: () => [784,1175].forEach((f,i)=>tone({freq:f,type:'sine',duration:.16,volume:.09,delay:i*.08})),
            theme: () => [523,659,784,1047].forEach((f,i)=>tone({freq:f,type:'sine',duration:.16,volume:.08,delay:i*.07})),
            isOn: () => enabled,
            toggle: () => { enabled=!enabled; try { localStorage.setItem('profileSound',enabled?'on':'off'); } catch(e){} return enabled; }
        };
    })();

    const toast=document.getElementById('toastNotification'), toastMessage=document.getElementById('toastMessage'); let toastTimeout;
    function showToast(message){ toastMessage.textContent=message; toast.classList.add('show'); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>toast.classList.remove('show'),2600); }

    const THEMES={cyan:'Cyber Cyan',purple:'Neon Purple',matrix:'Matrix Green'}, themeDots=document.querySelectorAll('.theme-dot');
    function applyTheme(name,event){ if(!THEMES[name])name='cyan'; document.documentElement.setAttribute('data-theme',name); themeDots.forEach(d=>d.classList.toggle('active',d.dataset.theme===name)); try{localStorage.setItem('profileTheme',name)}catch(e){} if(event){const flash=document.createElement('div');flash.className='theme-flash';flash.style.left=`${event.clientX}px`;flash.style.top=`${event.clientY}px`;document.body.appendChild(flash);setTimeout(()=>flash.remove(),950);Sound.theme();showToast(`เปลี่ยนธีมเป็น ${THEMES[name]} แล้ว!`);} }
    let savedTheme='cyan'; try{savedTheme=localStorage.getItem('profileTheme')||'cyan'}catch(e){} applyTheme(savedTheme); themeDots.forEach(dot=>dot.addEventListener('click',e=>applyTheme(dot.dataset.theme,e)));

    const soundToggle=document.getElementById('soundToggle');
    function updateSoundIcon(){const on=Sound.isOn();soundToggle.classList.toggle('muted',!on);soundToggle.innerHTML=on?' <i class="fa-solid fa-volume-high"></i> ':'<i class="fa-solid fa-volume-xmark"></i>';}
    if(soundToggle){updateSoundIcon();soundToggle.addEventListener('click',()=>{const on=Sound.toggle();updateSoundIcon();if(on)Sound.success();showToast(on?'เปิดเสียงเอฟเฟกต์แล้ว 🔊':'ปิดเสียงเอฟเฟกต์แล้ว 🔇');});}

    const starField=document.getElementById('starField'); if(starField){for(let i=0;i<80;i++){const star=document.createElement('span'),size=Math.random()*2.5+1;star.className='star';star.style.width=`${size}px`;star.style.height=`${size}px`;star.style.top=`${Math.random()*100}%`;star.style.left=`${Math.random()*100}%`;star.style.animationDuration=`${Math.random()*3+2}s`;star.style.animationDelay=`${Math.random()*5}s`;starField.appendChild(star);}}
    const symbolBox=document.getElementById('floatingSymbols'); if(symbolBox){const symbols=['</>','{ }','AI','01','★','♪','⚡','#','( )','💙'];for(let i=0;i<16;i++){const s=document.createElement('span');s.className='float-symbol';s.textContent=symbols[Math.floor(Math.random()*symbols.length)];s.style.left=`${Math.random()*100}%`;s.style.fontSize=`${Math.random()*14+12}px`;s.style.animationDuration=`${Math.random()*12+14}s`;s.style.animationDelay=`${Math.random()*-26}s`;symbolBox.appendChild(s);}}

    const mascots=document.querySelectorAll('.mascot'); let mouseX=0,mouseY=0,ticking=false;
    window.addEventListener('mousemove',e=>{mouseX=e.clientX/window.innerWidth-.5;mouseY=e.clientY/window.innerHeight-.5;if(!ticking){requestAnimationFrame(()=>{mascots.forEach(m=>{const depth=parseFloat(m.dataset.depth)||15;m.style.transform=`translate(${mouseX*depth}px,${mouseY*depth}px)`});ticking=false});ticking=true;}});
    mascots.forEach(m=>m.addEventListener('click',()=>{Sound.boop();m.classList.remove('jump');void m.offsetWidth;m.classList.add('jump');const old=m.querySelector('.speech-bubble');if(old)old.remove();const messages=(m.dataset.msg||'สวัสดี!').split('|'),bubble=document.createElement('div');bubble.className='speech-bubble';bubble.textContent=messages[Math.floor(Math.random()*messages.length)];m.appendChild(bubble);setTimeout(()=>bubble.remove(),2400);}));

    const isSmall=window.innerWidth<700,reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches,rand=(min,max)=>Math.random()*(max-min)+min;
    const cardStars=document.getElementById('cardStars');if(cardStars){for(let i=0;i<(isSmall?18:32);i++){const star=document.createElement('span'),size=rand(1,2.6);star.className='star';star.style.width=star.style.height=`${size}px`;star.style.top=`${rand(2,52)}%`;star.style.left=`${rand(0,100)}%`;star.style.animationDuration=`${rand(2,5)}s`;star.style.animationDelay=`${rand(0,5)}s`;cardStars.appendChild(star);}}
    const PINE_SVG='<svg viewBox="0 0 60 120" aria-hidden="true"><path d="M30 2 L45 36 H37 L51 64 H41 L57 98 H3 L19 64 H9 L23 36 H15 Z"/><rect x="26" y="96" width="8" height="24"/></svg>';
    function buildPines(box,count,minH,maxH,maxSway){if(!box)return;for(let i=0;i<count;i++){const pine=document.createElement('div');pine.className='pine';pine.innerHTML=PINE_SVG;pine.style.left=`${(i+rand(.05,.95))/count*100}%`;pine.style.height=`${rand(minH,maxH)}%`;pine.style.bottom=`${rand(-3,2)}%`;pine.style.setProperty('--sway',`${rand(maxSway*.6,maxSway)}deg`);pine.style.animationDuration=`${rand(4,7.5)}s`;pine.style.animationDelay=`${rand(-8,0)}s`;box.appendChild(pine);}}
    buildPines(document.getElementById('pinesBack'),isSmall?8:14,18,32,1.6);buildPines(document.getElementById('pinesFront'),isSmall?4:8,30,48,2.4);
    const fireflyBox=document.getElementById('fireflies');if(fireflyBox){for(let i=0;i<(isSmall?12:24);i++){const f=document.createElement('span'),size=rand(3,5.5);f.className='firefly';f.style.left=`${rand(2,98)}%`;f.style.top=`${rand(45,94)}%`;f.style.width=f.style.height=`${size}px`;f.style.setProperty('--dx',`${rand(-30,30)}px`);f.style.setProperty('--dy',`${rand(-40,20)}px`);f.style.setProperty('--d',`${rand(6,13)}s`);f.style.setProperty('--b',`${rand(2,4.5)}s`);f.style.animationDelay=`${rand(-12,0)}s, ${rand(-5,0)}s`;fireflyBox.appendChild(f);}}

    const layers=Array.from(document.querySelectorAll('#cardScene .fx-layer'));let targetX=0,targetY=0,curX=0,curY=0,rafId=null;
    function renderParallax(){curX+=(targetX-curX)*.08;curY+=(targetY-curY)*.08;layers.forEach(l=>{const depth=parseFloat(l.dataset.depth)||10;l.style.transform=`translate3d(${(-curX*depth).toFixed(2)}px,${(-curY*depth*.5).toFixed(2)}px,0)`});const still=Math.abs(targetX-curX)<.001&&Math.abs(targetY-curY)<.001;rafId=still?null:requestAnimationFrame(renderParallax)}
    if(!reduceMotion&&layers.length)window.addEventListener('mousemove',e=>{targetX=e.clientX/window.innerWidth-.5;targetY=e.clientY/window.innerHeight-.5;if(!rafId)rafId=requestAnimationFrame(renderParallax)});

    document.querySelectorAll('.ripple-trigger').forEach(element=>element.addEventListener('click',function(e){const rect=this.getBoundingClientRect(),ripple=document.createElement('span'),size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=`${size}px`;ripple.style.left=`${e.clientX-rect.left-size/2}px`;ripple.style.top=`${e.clientY-rect.top-size/2}px`;ripple.classList.add('ripple-effect');this.appendChild(ripple);setTimeout(()=>ripple.remove(),600);}));
    document.querySelectorAll('.section-header').forEach(header=>header.addEventListener('click',()=>{const targetBody=document.getElementById(header.dataset.target);if(!targetBody)return;const collapsed=header.classList.toggle('collapsed');targetBody.classList.toggle('hidden-body',collapsed);collapsed?Sound.close():Sound.open();}));
    document.querySelectorAll('.hobby-card').forEach(card=>card.addEventListener('click',()=>{const active=card.classList.toggle('active-hobby');Sound.select(active);}));

    const quotesList=[{text:'"เทคโนโลยีที่ดีที่สุด คือเทคโนโลยีที่ทำให้ชีวิตผู้คนง่ายขึ้น และเปิดโอกาสให้จินตนาการกลายเป็นความจริง"',author:'— คติประจำใจในการทำงาน'},{text:'"การเรียนรู้ไม่เคยสิ้นสุด เพราะโลกของเทคโนโลยีหมุนไปข้างหน้าในทุกๆ วินาที"',author:'— แนวคิดการพัฒนาตนเอง'},{text:'"ความซับซ้อนที่ยอดเยี่ยมที่สุด คือความซับซ้อนที่ถูกซ่อนไว้ภายใต้ความเรียบง่าย"',author:'— แรงบันดาลใจด้านการออกแบบ'}];let currentQuoteIndex=0;
    const changeQuoteBtn=document.getElementById('changeQuoteBtn'),quoteText=document.getElementById('quoteText'),quoteAuthor=document.getElementById('quoteAuthor'),quoteCard=document.getElementById('quoteCard');
    if(changeQuoteBtn)changeQuoteBtn.addEventListener('click',()=>{Sound.swoosh();currentQuoteIndex=(currentQuoteIndex+1)%quotesList.length;quoteCard.style.opacity='0';quoteCard.style.transform='translateY(6px)';setTimeout(()=>{quoteText.textContent=quotesList[currentQuoteIndex].text;quoteAuthor.textContent=quotesList[currentQuoteIndex].author;quoteCard.style.opacity='1';quoteCard.style.transform='translateY(0)';},220);});

    const toggleContactBtn=document.getElementById('toggleContactBtn'),contactListWrapper=document.getElementById('contactListWrapper'),contactBtnText=document.getElementById('contactBtnText');
    if(toggleContactBtn&&contactListWrapper)toggleContactBtn.addEventListener('click',()=>{const isOpen=contactListWrapper.classList.toggle('open');toggleContactBtn.classList.toggle('active',isOpen);toggleContactBtn.setAttribute('aria-expanded',isOpen);contactBtnText.textContent=isOpen?'ซ่อนช่องทางการติดต่อ':'แสดงช่องทางการติดต่อ';isOpen?Sound.open():Sound.close();});
    document.querySelectorAll('.contact-card').forEach(card=>card.addEventListener('click',()=>{Sound.success();showToast(`กำลังเปิด ${card.dataset.label||'ช่องทางติดต่อ'}...`);}));
    const profileAvatar=document.getElementById('profileAvatar');if(profileAvatar)profileAvatar.addEventListener('click',()=>{Sound.boop();showToast('ยินดีต้อนรับสู่โปรไฟล์ของฉันครับ!');});
});
