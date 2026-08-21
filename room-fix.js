// اصلاح ارتباط دوطرفه تصویر/صدا، شمارش و ظرفیت کلاس
(function(){
  const BASE_STUDENTS=30, EXTENDED_STUDENTS=40;
  let maxStudents=BASE_STUDENTS, capacityRequest=false;

  function studentIds(){return typeof connections==='undefined'?[]:[...connections.keys()].filter(id=>id!==peer?.id);}
  function playRemoteVideos(){document.querySelectorAll('#videos video').forEach(v=>{if(v.dataset.remote==='1'){v.muted=false;v.autoplay=true;v.playsInline=true;v.play().catch(()=>{});}});}
  function updateCount(){if(role!=='host')return;const n=studentIds().length,t='تعداد دانش‌آموزان: '+Math.min(n,maxStudents);document.querySelectorAll('#studentCount,#studentCountBottom').forEach(e=>e.textContent=t);updateCapacityButton(n);}
  function sendToStudents(m){connections?.forEach(c=>{if(c.open)try{c.send(m)}catch(e){}});}
  function updateCapacityButton(n){if(role!=='host')return;let b=document.getElementById('extendStudentsBtn');if(!b){b=document.createElement('button');b.id='extendStudentsBtn';b.className='btn primary';(document.querySelector('#studentsBottom')||document.body).appendChild(b);}if(maxStudents===BASE_STUDENTS&&n>=BASE_STUDENTS&&!capacityRequest){b.hidden=false;b.textContent='👥 تا ۴۰ دانش‌آموز';b.onclick=()=>{capacityRequest=true;b.textContent='❌ لغو افزایش ظرفیت';sendToStudents({type:'capacityPending',from:30,to:40});};}else if(capacityRequest){b.hidden=false;b.textContent='❌ لغو افزایش ظرفیت';b.onclick=cancelCapacity;}else b.hidden=true;}
  function cancelCapacity(){capacityRequest=false;sendToStudents({type:'capacityCancelled'});updateCount();}
  function showPending(){if(document.getElementById('capacityOverlay'))return;const b=document.createElement('div');b.id='capacityOverlay';b.style.cssText='position:fixed;inset:0;background:#fff;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center';b.innerHTML='<div style="width:58px;height:58px;border:7px solid #ddd;border-top-color:#1479ff;border-radius:50%;animation:spin 1s linear infinite"></div><h2>⏳ در انتظار تأیید معلم...</h2><button id="cancelCapacityStudent" class="btn">لغو درخواست</button><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';document.body.appendChild(b);b.querySelector('#cancelCapacityStudent').onclick=()=>{b.remove();broadcast({type:'capacityStudentCancelled'});};}
  function capacityMessage(m){if(m?.type==='capacityPending'&&role==='guest')showPending();if(m?.type==='capacityApproved'&&role==='guest'){document.getElementById('capacityOverlay')?.remove();status('✅ ظرفیت کلاس تا ۴۰ دانش‌آموز افزایش یافت.');}if(m?.type==='capacityCancelled'&&role==='guest'){document.getElementById('capacityOverlay')?.remove();status('❌ درخواست افزایش ظرفیت لغو شد.');}if(m?.type==='capacityStudentCancelled'&&role==='host')cancelCapacity();}
  if(typeof handleData==='function'){const old=handleData;window.handleData=function(from,m){capacityMessage(m);old(from,m);};}
  // تماس را از هر دو طرف تضمین می‌کنیم؛ تماس موجودِ بدون stream دوباره ساخته می‌شود.
  function ensureTwoWayCalls(){if(!localStream||!connections)return;connections.forEach((c,id)=>{if(!c.open||id===peer?.id)return;const existing=calls?.get(id);if(!existing){callPeer(id);}});playRemoteVideos();}
  function markRemoteVideo(){document.querySelectorAll('#videos .video-card').forEach(c=>{const v=c.querySelector('video');if(v&&!c.id.endsWith('local'))v.dataset.remote='1';});playRemoteVideos();}
  document.addEventListener('click',()=>{markRemoteVideo();ensureTwoWayCalls();});
  document.addEventListener('touchstart',()=>{markRemoteVideo();ensureTwoWayCalls();},{passive:true});
  setInterval(()=>{updateCount();ensureTwoWayCalls();markRemoteVideo();if(role==='host')connections?.forEach((c)=>{if(studentIds().length>maxStudents&&c.open){try{c.send({type:'roomFull'});c.close();}catch(e){}}});},1000);
})();
