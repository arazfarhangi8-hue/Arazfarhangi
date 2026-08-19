const $=s=>document.querySelector(s);

const modal=$('#modal');
const openModal=(title,text)=>{ $('#modalTitle').textContent=title; $('#modalText').textContent=text; modal.classList.remove('hidden'); };
$('#profileBtn').onclick=()=>openModal('حساب کاربری مهر فرازان','حساب اولیه مدیریتی در این نمونه با اطلاعات واردشده نمایش داده می‌شود. برای استفاده واقعی، احراز هویت امن و پایگاه داده باید به پروژه متصل شود.');
$('#startBtn').onclick=()=>openModal('شروع کار معلم','برای شروع نسخه عملیاتی، معلم پس از خرید اشتراک به داشبورد و ساخت جلسه دسترسی خواهد داشت.');
$('#buyBtn').onclick=()=>openModal('خرید اشتراک','این دکمه فعلاً نمایشی است؛ اتصال درگاه پرداخت واقعی باید در بک‌اند انجام شود.');
$('#studentBtn').onclick=()=>openModal('ورود دانش‌آموز','دانش‌آموز با لینک یا کد جلسه وارد می‌شود و برای اشتراک پلتفرم هزینه جداگانه نمی‌پردازد.');
$('#closeModal').onclick=()=>modal.classList.add('hidden');
$('#saveProfile').onclick=()=>{localStorage.setItem('mehrFarazanProfile',JSON.stringify({name:$('#nameInput').value,email:$('#emailInput').value}));alert('اطلاعات حساب روی همین مرورگر ذخیره شد.');modal.classList.add('hidden');};
modal.onclick=e=>{if(e.target===modal) modal.classList.add('hidden');};

const canvas=$('#board');
const ctx=canvas.getContext('2d');
let dpr=window.devicePixelRatio||1, drawing=false, lastX=0,lastY=0, locked=true, tool='pen';
function resizeCanvas(){const r=canvas.getBoundingClientRect(); canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.max(1,Math.floor(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#1479ff';}
resizeCanvas();window.addEventListener('resize',resizeCanvas);
function pos(e){const r=canvas.getBoundingClientRect();const x=e.touches?e.touches[0].clientX:e.clientX;const y=e.touches?e.touches[0].clientY:e.clientY;return{x:x-r.left,y:y-r.top};}
function start(e){if(locked)return;drawing=true;const p=pos(e);lastX=p.x;lastY=p.y;}
function move(e){if(!drawing||locked)return;e.preventDefault();const p=pos(e);ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';ctx.lineWidth=tool==='eraser'?18:3;ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;}
function end(){drawing=false;ctx.globalCompositeOperation='source-over';}
canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);canvas.addEventListener('touchstart',start,{passive:true});canvas.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);

$('#lockBoard').onclick=()=>{locked=!locked;$('#lockBoard').textContent=locked?'🔒 تخته قفل است':'🔓 تخته باز است';$('#lockBoard').classList.toggle('locked',locked);$('#lockOverlay').style.display=locked?'block':'none';$('#boardState').textContent=locked?'فقط معلم می‌تواند روی تخته بنویسد':'تخته برای نوشتن باز است';};
$('#clearBoard').onclick=()=>{ctx.clearRect(0,0,canvas.width/dpr,canvas.height/dpr);};
document.querySelectorAll('.tool[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.remove('active'));b.classList.add('active');});
$('#sendChat').onclick=()=>{const v=$('#chatInput').value.trim();if(!v)return;const row=document.createElement('div');row.innerHTML='<b>شما:</b> '+v.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));$('#messages').appendChild(row);$('#chatInput').value='';$('#messages').scrollTop=$('#messages').scrollHeight;};
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sendChat').click();});
$('#demoCall').onclick=()=>alert('اتاق آزمایشی آماده است. تماس واقعی ویدئویی در نسخه عملیاتی با سرویس WebRTC/سرور جلسه متصل می‌شود.');

const saved=localStorage.getItem('mehrFarazanProfile');if(saved){try{const p=JSON.parse(saved);$('#nameInput').value=p.name||'';$('#emailInput').value=p.email||'';}catch{}}
