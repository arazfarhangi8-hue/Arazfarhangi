const $=s=>document.querySelector(s);
var peer=null,role='',localStream=null,roomId='',connections=new Map(),calls=new Map();
const status=t=>$('#status').textContent=t;
const connState=t=>$('#connectionState').textContent=t;
function countStudents(){const connected=[...connections.keys()].filter(id=>id!==peer?.id);const n=role==='host'?connected.length:Math.max(0,connected.length-1);const sc=$('#studentCount');if(sc)sc.textContent=`تعداد دانش‌آموزان: ${n}`;const sb=$('#studentCountBottom');if(sb)sb.textContent=`تعداد دانش‌آموزان: ${n}`;const cb=$('#connectionInfo');if(cb)cb.textContent=`اعضای متصل: ${role==='host'?n+1:n+1}`;renderStudentControls();}
function log(t,remote=false){const d=document.createElement('div');d.className='msg';d.textContent=(remote?'طرف مقابل: ':'شما: ')+t;$('#messages').appendChild(d);$('#messages').scrollTop=$('#messages').scrollHeight;}
function codeCopy(){const code=$('#myCode').textContent.trim();if(!code||code==='—')return status('ابتدا اتاق را بساز.');navigator.clipboard?.writeText(code).then(()=>status('کد اتاق کپی شد ✅')).catch(()=>{const ta=document.createElement('textarea');ta.value=code;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();status('کد اتاق کپی شد ✅');});}
$('#copyCodeBtn').onclick=codeCopy;
function videoCard(id,label,stream,muted=false){let c=document.getElementById('video-'+CSS.escape(id));if(!c){c=document.createElement('div');c.className='video-card';c.id='video-'+id;c.innerHTML='<video autoplay playsinline></video><span class="video-label"></span>';$('#videos').appendChild(c);}const v=c.querySelector('video');v.srcObject=stream;v.muted=muted;v.play().catch(()=>{});c.querySelector('.video-label').textContent=label;}
function removeVideo(id){document.getElementById('video-'+CSS.escape(id))?.remove();}
function broadcast(m,except=null){connections.forEach((x,id)=>{if(id!==except&&x.open)try{x.send(m)}catch(_){}});}
function setupConn(c){connections.set(c.peer,c);c.on('open',()=>{connState('متصل ✅');status('عضو جدید به کلاس وصل شد.');countStudents();c.send({type:'hello',from:peer.id,known:[...connections.keys()]});if(boardActions.length)c.send({type:'boardState',actions:boardActions,redo:redoActions});if(localStream)callPeer(c.peer);broadcast({type:'member',id:c.peer},c.peer);});c.on('data',m=>handleData(c.peer,m));c.on('close',()=>{connections.delete(c.peer);const call=calls.get(c.peer);try{call?.close()}catch(_){}calls.delete(c.peer);removeVideo(c.peer);countStudents();status('یکی از اعضا خارج شد.');});c.on('error',e=>status('خطای اتصال: '+(e?.message||e)));countStudents();}
function connectTo(id){if(!id||id===peer?.id||connections.has(id))return;setupConn(peer.connect(id,{reliable:true,serialization:'json'}));}
function handleData(from,m){if(!m)return;if(m.type==='chat')log(m.text,true);if(m.type==='hello'){(m.known||[]).forEach(id=>{if(id!==peer.id)connectTo(id)});if(localStream)callPeer(from);}if(m.type==='member'&&m.id!==peer.id)connectTo(m.id);if(m.type==='boardState'){boardActions=m.actions||[];redoActions=m.redo||[];renderBoard();}if(m.type==='mute')updateRemoteLabel(from,m.muted);if(m.type==='teacherMediaLock')applyTeacherMediaLock(m.kind,!!m.locked);}
function updateRemoteLabel(id,muted){const c=document.getElementById('video-'+CSS.escape(id));if(c)c.querySelector('.video-label').textContent=(muted?'🔇 ':'')+'تصویر '+id;}
function callPeer(id){if(!localStream||!peer||id===peer.id||calls.has(id))return;const call=peer.call(id,localStream);calls.set(id,call);call.on('stream',s=>videoCard(id,'تصویر '+id,s));call.on('close',()=>{calls.delete(id);removeVideo(id)});call.on('error',()=>calls.delete(id));}
function answerCall(call){call.answer(localStream||undefined);calls.set(call.peer,call);call.on('stream',s=>videoCard(call.peer,'تصویر '+call.peer,s));call.on('close',()=>{calls.delete(call.peer);removeVideo(call.peer)});}
async function media(){try{if(!localStream)localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});videoCard('local','تصویر من',localStream,true);$('#mediaBtn').textContent='دوربین و میکروفون روشن است';connections.forEach((_,id)=>callPeer(id));status('دوربین و میکروفون روشن شد.');}catch(e){status('اجازه دوربین/میکروفون داده نشد: '+e.message);}}
$('#mediaBtn').onclick=media;
$('#muteBtn').onclick=()=>{if(window.__mediaLockAudio)return;const t=localStream?.getAudioTracks?.()[0];if(!t)return;t.enabled=!t.enabled;$('#muteBtn').textContent=t.enabled?'بی‌صدا کردن میکروفون':'روشن کردن میکروفون';broadcast({type:'mute',muted:!t.enabled});};
$('#camBtn').onclick=()=>{if(window.__mediaLockVideo)return;const t=localStream?.getVideoTracks?.()[0];if(!t)return;t.enabled=!t.enabled;$('#camBtn').textContent=t.enabled?'خاموش کردن دوربین':'روشن کردن دوربین';};
$('#sendBtn').onclick=()=>{const v=$('#chatInput').value.trim();if(!v)return;log(v);broadcast({type:'chat',text:v});$('#chatInput').value='';};$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sendBtn').click();});
function makePeer(id){if(peer)peer.destroy();peer=new Peer(id);peer.on('open',()=>{$('#myCode').textContent=id||roomId;roomId=id||roomId;});peer.on('connection',setupConn);peer.on('call',answerCall);peer.on('error',e=>status('خطای اتاق: '+e.type));}
$('#createBtn').onclick=()=>{role='host';const saved=localStorage.getItem('mehrFarazanRoomId')||('mehr-'+Math.random().toString(36).slice(2,8));localStorage.setItem('mehrFarazanRoomId',saved);makePeer(saved);status('اتاق آماده است؛ کد را برای همهٔ دانش‌آموزان بفرست.');connState('در انتظار دانش‌آموزان…');};
$('#joinBtn').onclick=()=>{const id=$('#roomInput').value.trim();if(!id)return status('کد اتاق را وارد کن.');role='guest';makePeer();peer.on('open',()=>{roomId=id;$('#myCode').textContent=id;connectTo(id);status('در حال ورود به کلاس…');connState('در حال اتصال…');});};

const canvas=$('#board'),ctx=canvas.getContext('2d'),color=$('#color'),size=$('#size');let boardActions=[],redoActions=[],tool='pen',drawing=false,start=null;
function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);renderBoard();}resize();window.addEventListener('resize',resize);
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function polygon(cx,cy,rx,ry,n,rot=-Math.PI/2){ctx.moveTo(cx+rx*Math.cos(rot),cy+ry*Math.sin(rot));for(let i=1;i<n;i++){const a=rot+i*2*Math.PI/n;ctx.lineTo(cx+rx*Math.cos(a),cy+ry*Math.sin(a));}ctx.closePath();}
function drawShape(a){const{x,y,w,h}=a;ctx.beginPath();if(a.kind==='line'){ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);}else if(a.kind==='arrow'){const ang=Math.atan2(h,w),hd=14;ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y+h);ctx.lineTo(x+w-hd*Math.cos(ang-Math.PI/6),y+h-hd*Math.sin(ang-Math.PI/6));ctx.moveTo(x+w,y+h);ctx.lineTo(x+w-hd*Math.cos(ang+Math.PI/6),y+h-hd*Math.sin(ang+Math.PI/6));}else if(a.kind==='circle'){ctx.arc(x+w/2,y+h/2,Math.min(Math.abs(w),Math.abs(h))/2,0,Math.PI*2);}else if(a.kind==='ellipse'){ctx.ellipse(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);}else if(a.kind==='square'){const s=Math.max(Math.abs(w),Math.abs(h)),sx=w<0?x-s:x,sy=h<0?y-s:y;ctx.rect(sx,sy,s,s);}else if(a.kind==='rectangle'){ctx.rect(x,y,w,h);}else if(a.kind==='triangle'||a.kind==='isoscelesTriangle'){ctx.moveTo(x+w/2,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.closePath();}else if(a.kind==='rightTriangle'){ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.closePath();}else if(a.kind==='diamond'){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();}else if(a.kind==='parallelogram'){const off=w*.22;ctx.moveTo(x+off,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-off,y+h);ctx.lineTo(x,y+h);ctx.closePath();}else if(a.kind==='trapezoid'){const off=Math.abs(w)*.22;ctx.moveTo(x+off,y);ctx.lineTo(x+w-off,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();}else if(['pentagon','hexagon','heptagon','octagon','nonagon','decagon'].includes(a.kind)){const n={pentagon:5,hexagon:6,heptagon:7,octagon:8,nonagon:9,decagon:10}[a.kind];polygon(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),n);}else if(a.kind==='star'){const cx=x+w/2,cy=y+h/2,rx=Math.abs(w/2),ry=Math.abs(h/2),inner=.45;ctx.moveTo(cx,cy-ry);for(let i=1;i<10;i++){const ang=-Math.PI/2+i*Math.PI/5,r=i%2?inner:1;ctx.lineTo(cx+rx*r*Math.cos(ang),cy+ry*r*Math.sin(ang));}ctx.closePath();}else if(a.kind==='semicircle'){ctx.arc(x+w/2,y+h,Math.min(Math.abs(w)/2,Math.abs(h)),Math.PI,0);ctx.lineTo(x+w/2,y+h);}else if(a.kind==='arc'){ctx.ellipse(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),0,Math.PI,Math.PI*2);}else if(a.kind==='sector'){const cx=x+w/2,cy=y+h/2,r=Math.min(Math.abs(w),Math.abs(h))/2;ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-Math.PI/2,0);ctx.closePath();}else if(a.kind==='cross'){const t=Math.max(8,Math.min(Math.abs(w),Math.abs(h))*.25),cx=x+w/2,cy=y+h/2;ctx.rect(cx-t/2,y+Math.abs(h)*.1,t,Math.abs(h)*.8);ctx.rect(x+Math.abs(w)*.1,cy-t/2,Math.abs(w)*.8,t);}else if(a.kind==='cube'){const ox=w*.22,oy=h*.18;ctx.moveTo(x+ox,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h-oy);ctx.lineTo(x+ox,y+h-oy);ctx.closePath();ctx.moveTo(x+ox,y);ctx.lineTo(x,y+oy);ctx.lineTo(x,y+h);ctx.lineTo(x+ox,y+h-oy);ctx.moveTo(x+w,y);ctx.lineTo(x+w-ox,y+oy);ctx.lineTo(x+w-ox,y+h);ctx.lineTo(x+w,y+h-oy);ctx.moveTo(x,y+oy);ctx.lineTo(x+w-ox,y+oy);}}
function drawAction(a){ctx.save();ctx.setTransform(devicePixelRatio||1,0,0,devicePixelRatio||1,0,0);ctx.globalCompositeOperation='source-over';ctx.strokeStyle=a.color;ctx.lineWidth=a.size;ctx.lineCap='round';ctx.lineJoin='round';drawShape(a);ctx.stroke();ctx.restore();}
function renderBoard(){const d=devicePixelRatio||1,r=canvas.getBoundingClientRect();ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);boardActions.forEach(drawAction);}
function broadcastBoard(){broadcast({type:'boardState',actions:boardActions,redo:redoActions});}
function commit(a){boardActions.push(a);redoActions=[];renderBoard();broadcastBoard();}
canvas.addEventListener('pointerdown',e=>{drawing=true;start=point(e);canvas.setPointerCapture?.(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drawing||!start)return;const p=point(e);if(tool==='pen'||tool==='eraser'){commit({kind:'line',x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y,color:tool==='eraser'?'#fff':color.value,size:Number(size.value)});start=p;return;}renderBoard();drawAction({kind:tool,x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y,color:color.value,size:Number(size.value)});});
canvas.addEventListener('pointerup',e=>{if(!drawing||!start)return;const p=point(e);if(tool!=='pen'&&tool!=='eraser')commit({kind:tool,x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y,color:color.value,size:Number(size.value)});drawing=false;start=null;try{canvas.releasePointerCapture?.(e.pointerId)}catch(_){}renderBoard();});canvas.addEventListener('pointercancel',()=>{drawing=false;start=null;renderBoard();});
document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll('.tool-btn[data-tool]').forEach(x=>x.classList.remove('active'));b.classList.add('active');});
$('#clearBtn').onclick=()=>{boardActions=[];redoActions=[];renderBoard();broadcastBoard();};
$('#undoBtn').onclick=()=>{if(!boardActions.length)return;redoActions.push(boardActions.pop());renderBoard();broadcastBoard();};
$('#redoBtn').onclick=()=>{if(!redoActions.length)return;boardActions.push(redoActions.pop());renderBoard();broadcastBoard();};

// ===== کنترل معلم برای قفل صدا و تصویر هر دانش‌آموز =====
const teacherLocks=new Map();
function studentDisplayName(id){const n=[...connections.keys()].indexOf(id)+1;return `دانش‌آموز ${Math.max(1,n)}`;}
function renderStudentControls(){
  const bottom=$('#studentsBottom');
  if(!bottom)return;
  bottom.innerHTML='';
  const ids=[...connections.keys()].filter(id=>id!==peer?.id);
  if(!ids.length){bottom.innerHTML='<div class="student-chip">هنوز دانش‌آموزی وارد نشده است.</div>';return;}
  ids.forEach(id=>{
    const state=teacherLocks.get(id)||{audio:false,video:false};
    const chip=document.createElement('div');chip.className='student-chip';chip.style.display='flex';chip.style.alignItems='center';chip.style.gap='7px';
    const name=document.createElement('span');name.textContent=studentDisplayName(id);chip.appendChild(name);
    if(role==='host'){
      const ab=document.createElement('button');ab.type='button';ab.textContent=state.audio?'🔓 باز کردن صدا':'🔒 قفل صدا';ab.onclick=()=>setTeacherLock(id,'audio',!state.audio);chip.appendChild(ab);
      const vb=document.createElement('button');vb.type='button';vb.textContent=state.video?'🔓 باز کردن تصویر':'🔒 قفل تصویر';vb.onclick=()=>setTeacherLock(id,'video',!state.video);chip.appendChild(vb);
    }
    bottom.appendChild(chip);
  });
}
function setTeacherLock(id,kind,locked){
  if(role!=='host')return;
  const s=teacherLocks.get(id)||{audio:false,video:false};s[kind]=locked;teacherLocks.set(id,s);
  const c=connections.get(id);if(c?.open)c.send({type:'teacherMediaLock',kind,locked});
  renderStudentControls();
  status(`${studentDisplayName(id)}: ${kind==='audio'?(locked?'صدا قفل شد 🔒':'قفل صدا باز شد 🔓'):(locked?'تصویر قفل شد 🔒':'قفل تصویر باز شد 🔓')}`);
}
function applyTeacherMediaLock(kind,locked){
  if(kind==='audio')window.__mediaLockAudio=locked;
  if(kind==='video')window.__mediaLockVideo=locked;
  if(!localStream)return;
  const track=kind==='audio'?localStream.getAudioTracks?.()[0]:localStream.getVideoTracks?.()[0];
  if(track)track.enabled=!locked;
  const b=kind==='audio'?$('#muteBtn'):$('#camBtn');
  if(b){b.disabled=locked;b.textContent=locked?(kind==='audio'?'🔒 صدا توسط معلم قفل است':'🔒 تصویر توسط معلم قفل است'):(kind==='audio'?'بی‌صدا کردن میکروفون':'خاموش کردن دوربین');}
  status(locked?(kind==='audio'?'معلم صدای شما را قفل کرد.':'معلم تصویر شما را قفل کرد.'):(kind==='audio'?'قفل صدای شما باز شد.':'قفل تصویر شما باز شد.'));
}
function teacherControlDataHook(c){
  if(c.__teacherControlBound)return;c.__teacherControlBound=true;
  c.on('data',m=>{if(m?.type==='teacherMediaLock')applyTeacherMediaLock(m.kind,!!m.locked);});
}
setInterval(()=>{connections.forEach(c=>teacherControlDataHook(c));if(role==='host')renderStudentControls();},700);

// کنترل‌های معلم فقط در بخش دانش‌آموزان نمایش داده می‌شوند؛ خود دانش‌آموز همچنان کنترل عادی خودش را دارد مگر اینکه قفل شده باشد.
