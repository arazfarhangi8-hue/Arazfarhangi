// اصلاح ارتباط تصویر، صدا، شمارش و ظرفیت کلاس
(function(){
  const BASE_STUDENTS=30;
  const EXTENDED_STUDENTS=40;
  let maxStudents=BASE_STUDENTS;
  let capacityRequest=false;
  let capacityRequestTimer=null;

  function studentIds(){
    if(typeof connections==='undefined') return [];
    return [...connections.keys()].filter(function(id){return typeof peer==='undefined'||id!==peer?.id;});
  }
  function playRemoteVideos(){
    document.querySelectorAll('#videos video').forEach(function(v){if(v.id!=='local-video')v.muted=false;v.autoplay=true;v.playsInline=true;v.play().catch(function(){});});
  }
  function updateCount(){
    if(typeof role==='undefined'||role!=='host')return;
    const n=studentIds().length;
    const text='تعداد دانش‌آموزان: '+Math.min(n,maxStudents);
    document.querySelectorAll('#studentCount,#studentCountBottom').forEach(function(el){el.textContent=text;});
    updateCapacityButton(n);
  }
  function sendToStudents(msg){if(typeof connections==='undefined')return;connections.forEach(function(c){if(c&&c.open)try{c.send(msg);}catch(e){}});}
  function updateCapacityButton(n){
    if(typeof role==='undefined'||role!=='host')return;
    let b=document.getElementById('extendStudentsBtn');
    if(!b){b=document.createElement('button');b.id='extendStudentsBtn';b.className='btn primary';b.style.margin='8px';const target=document.querySelector('#studentsBottom')||document.querySelector('#studentCountBottom')?.parentElement;if(target)target.appendChild(b);}
    if(maxStudents===BASE_STUDENTS&&n>=BASE_STUDENTS&&!capacityRequest){
      b.hidden=false;b.textContent='👥 تا ۴۰ دانش‌آموز';
      b.onclick=function(){
        if(capacityRequest)return;
        capacityRequest=true;b.textContent='❌ لغو افزایش ظرفیت';
        sendToStudents({type:'capacityPending',from:30,to:40});
      };
    }else if(capacityRequest){b.hidden=false;b.textContent='❌ لغو افزایش ظرفیت';b.onclick=cancelCapacity;}
    else b.hidden=true;
  }
  function approveCapacity(){
    if(typeof role==='undefined'||role!=='host')return;
    maxStudents=EXTENDED_STUDENTS;capacityRequest=false;clearTimeout(capacityRequestTimer);capacityRequestTimer=null;
    sendToStudents({type:'capacityApproved',max:EXTENDED_STUDENTS});
    const b=document.getElementById('extendStudentsBtn');if(b)b.hidden=true;updateCount();
  }
  function cancelCapacity(){
    if(typeof role==='undefined'||role!=='host')return;
    capacityRequest=false;clearTimeout(capacityRequestTimer);capacityRequestTimer=null;
    sendToStudents({type:'capacityCancelled'});updateCount();
  }
  function showCapacityPending(){
    capacityRequest=true;
    let box=document.getElementById('capacityOverlay');
    if(!box){box=document.createElement('div');box.id='capacityOverlay';box.style.cssText='position:fixed;inset:0;background:rgba(255,255,255,.94);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;';box.innerHTML='<div class="capacity-spinner" style="width:58px;height:58px;border:7px solid #ddd;border-top-color:#2563eb;border-radius:50%;animation:capacitySpin 1s linear infinite"></div><h2>⏳ در انتظار تأیید معلم...</h2><p>درخواست افزایش ظرفیت تا ۴۰ دانش‌آموز ارسال شده است.</p><button id="cancelCapacityStudent" class="btn">لغو درخواست</button><style>@keyframes capacitySpin{to{transform:rotate(360deg)}}</style>';document.body.appendChild(box);$('#cancelCapacityStudent')?.addEventListener('click',function(){capacityRequest=false;box.remove();if(typeof broadcast==='function')broadcast({type:'capacityStudentCancelled'});});}
  }
  function closeCapacityOverlay(message){const box=document.getElementById('capacityOverlay');if(box)box.remove();capacityRequest=false;if(message)typeof status==='function'&&status(message);}
  function handleCapacityMessage(m){
    if(!m)return;
    if(m.type==='capacityPending'&&typeof role!=='undefined'&&role==='guest')showCapacityPending();
    if(m.type==='capacityApproved'&&typeof role!=='undefined'&&role==='guest')closeCapacityOverlay('✅ ظرفیت کلاس تا ۴۰ دانش‌آموز افزایش یافت.');
    if(m.type==='capacityCancelled'&&typeof role!=='undefined'&&role==='guest')closeCapacityOverlay('❌ درخواست افزایش ظرفیت لغو شد.');
    if(m.type==='capacityStudentCancelled'&&typeof role!=='undefined'&&role==='host')cancelCapacity();
  }
  if(typeof window.handleData==='function'){const oldHandleData=window.handleData;window.handleData=function(from,m){handleCapacityMessage(m);return oldHandleData(from,m);};}
  function guardCapacity(){
    if(typeof role==='undefined'||role!=='host')return;
    connections.forEach(function(c,id){if(studentIds().length>maxStudents&&c&&c.open){try{c.send({type:'roomFull',message:'ظرفیت کلاس تکمیل است.'});}catch(e){}try{c.close();}catch(e){}}});
  }
  function ensureCalls(){if(typeof localStream==='undefined'||!localStream||typeof connections==='undefined'||typeof callPeer!=='function')return;connections.forEach(function(c,id){if(c&&c.open&&id!==peer?.id&&!calls.has(id))callPeer(id);});playRemoteVideos();}
  document.addEventListener('click',playRemoteVideos);document.addEventListener('touchstart',playRemoteVideos,{passive:true});
  setInterval(function(){updateCount();ensureCalls();guardCapacity();},700);
})();
