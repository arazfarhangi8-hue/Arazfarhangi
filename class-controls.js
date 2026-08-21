// اصلاحات پایدار کنترل معلم و قفل صدا/تصویر
(function(){
  const $=s=>document.querySelector(s);
  const locks=new Map();
  function myLocked(kind){return !!locks.get(kind);}
  function setTrack(kind,enabled){
    if(!localStream)return;
    const tracks=kind==='audio'?localStream.getAudioTracks():localStream.getVideoTracks();
    tracks.forEach(t=>t.enabled=enabled);
  }
  function getTeacherLocks(){return typeof teacherLocks!=='undefined'?teacherLocks:null;}
  function refreshStudentButtons(){
    if(typeof role==='undefined'||role!=='host')return;
    const box=$('#studentsBottom');if(!box)return;
    const ids=[...connections.keys()].filter(id=>id!==peer?.id);
    box.innerHTML='';
    if(!ids.length){box.innerHTML='<div class="student-chip">هنوز دانش‌آموزی وارد نشده است.</div>';return;}
    const tl=getTeacherLocks();
    ids.forEach((id,i)=>{
      const state=tl?.get(id)||{audio:false,video:false};
      const chip=document.createElement('div');chip.className='student-chip';chip.style.display='flex';chip.style.alignItems='center';chip.style.gap='7px';chip.style.flexWrap='wrap';
      const name=document.createElement('span');name.textContent='دانش‌آموز '+(i+1);chip.appendChild(name);
      const a=document.createElement('button');a.type='button';a.textContent=state.audio?'🔓 باز کردن صدا':'🔒 قفل صدا';a.onclick=()=>teacherLock(id,'audio',!state.audio);chip.appendChild(a);
      const v=document.createElement('button');v.type='button';v.textContent=state.video?'🔓 باز کردن تصویر':'🔒 قفل تصویر';v.onclick=()=>teacherLock(id,'video',!state.video);chip.appendChild(v);
      box.appendChild(chip);
    });
  }
  function teacherLock(id,kind,locked){
    if(typeof role==='undefined'||role!=='host')return;
    const tl=getTeacherLocks();if(!tl)return;
    const s=tl.get(id)||{audio:false,video:false};s[kind]=locked;tl.set(id,s);
    const c=connections.get(id);if(c?.open)c.send({type:'teacherMediaLock',kind,locked});
    refreshStudentButtons();
  }
  window.teacherLock=teacherLock;window.refreshStudentButtons=refreshStudentButtons;

  const oldHandle=window.handleData;
  window.handleData=function(from,m){
    if(m?.type==='teacherMediaLock'){
      locks.set(m.kind,!!m.locked);
      if(m.kind==='audio'){
        setTrack('audio',!m.locked);const b=$('#muteBtn');if(b){b.disabled=!!m.locked;b.textContent=m.locked?'🔒 صدا توسط معلم قفل شده':'بی‌صدا کردن میکروفون';}
      }
      if(m.kind==='video'){
        setTrack('video',!m.locked);const b=$('#camBtn');if(b){b.disabled=!!m.locked;b.textContent=m.locked?'🔒 تصویر توسط معلم قفل شده':'خاموش کردن دوربین';}
      }
      return;
    }
    if(typeof oldHandle==='function')oldHandle(from,m);
  };

  const mediaBtn=$('#mediaBtn');
  if(mediaBtn)mediaBtn.onclick=async function(){
    try{
      if(!localStream)localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      if(myLocked('audio'))setTrack('audio',false);if(myLocked('video'))setTrack('video',false);
      videoCard('local','تصویر من',localStream,true);mediaBtn.textContent='دوربین و میکروفون روشن است';
      connections.forEach((_,id)=>callPeer(id));status('دوربین و میکروفون روشن شد.'+(myLocked('audio')||myLocked('video')?' بعضی دسترسی‌ها توسط معلم قفل است.':''));
    }catch(e){status('اجازه دوربین/میکروفون داده نشد: '+e.message);}
  };
  const mute=$('#muteBtn');if(mute)mute.onclick=function(){if(myLocked('audio'))return;const t=localStream?.getAudioTracks?.()[0];if(!t)return;t.enabled=!t.enabled;mute.textContent=t.enabled?'بی‌صدا کردن میکروفون':'روشن کردن میکروفون';broadcast({type:'mute',muted:!t.enabled});};
  const cam=$('#camBtn');if(cam)cam.onclick=function(){if(myLocked('video'))return;const t=localStream?.getVideoTracks?.()[0];if(!t)return;t.enabled=!t.enabled;cam.textContent=t.enabled?'خاموش کردن دوربین':'روشن کردن دوربین';};
  setInterval(refreshStudentButtons,1000);
})();
