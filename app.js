const $=s=>document.querySelector(s);
const modal=$('#modal');
const openModal=(title,text)=>{$('#modalTitle').textContent=title;$('#modalText').textContent=text;modal.classList.remove('hidden');};
$('#profileBtn').onclick=()=>openModal('حساب کاربری مهر فرازان','حساب نمایشی در این نسخه آماده است.');
$('#startBtn').onclick=()=>openModal('شروع کار معلم','معلم پس از خرید اشتراک به داشبورد و ساخت جلسه دسترسی خواهد داشت.');
$('#buyBtn').onclick=()=>openModal('خرید اشتراک','این دکمه فعلاً نمایشی است؛ درگاه پرداخت واقعی در مرحله بک‌اند متصل می‌شود.');
$('#studentBtn').onclick=()=>openModal('ورود دانش‌آموز','دانش‌آموز با لینک یا کد جلسه وارد می‌شود.');
$('#closeModal').onclick=()=>modal.classList.add('hidden');
$('#saveProfile').onclick=()=>{localStorage.setItem('mehrFarazanProfile',JSON.stringify({name:$('#nameInput').value.trim(),email:$('#emailInput').value.trim()}));alert('اطلاعات حساب روی همین مرورگر ذخیره شد.');modal.classList.add('hidden');};
modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden');};

// ---------- تخته سفید و ابزارهای هندسی ----------
const canvas=$('#board'),ctx=canvas.getContext('2d',{alpha:false}),canvasWrap=document.querySelector('.canvas-wrap'),boardTextInput=$('#boardTextInput');
let dpr=Math.max(1,devicePixelRatio||1),drawing=false,locked=true,tool='pen',lastPoint=null,shapeStart=null,textMode=false,textPoint=null,previewImage=null;
const shapeTools=['line','arrow','circle','ellipse','square','rectangle','triangle','rightTriangle','isoscelesTriangle','diamond','parallelogram','trapezoid','pentagon','hexagon','heptagon','octagon','nonagon','decagon','star','semicircle','arc','sector','cross','cube'];
let history=[],future=[],restoring=false;
function snapshot(){return ctx.getImageData(0,0,canvas.width,canvas.height);}
function pushHistory(){if(restoring)return;history.push(snapshot());if(history.length>60)history.shift();future=[];updateHistoryUI();}
function restoreImage(img){if(!img)return;restoring=true;canvas.width=img.width;canvas.height=img.height;dpr=Math.max(1,devicePixelRatio||1);ctx.setTransform(1,0,0,1,0,0);ctx.putImageData(img,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);restoring=false;}
function undo(){if(!history.length)return;future.push(snapshot());restoreImage(history.pop());updateHistoryUI();}
function redo(){if(!future.length)return;history.push(snapshot());restoreImage(future.pop());updateHistoryUI();}
function updateHistoryUI(){$('#undoBoard').disabled=!history.length;$('#redoBoard').disabled=!future.length;}
$('#undoBoard').onclick=()=>{if(!locked)undo();};$('#redoBoard').onclick=()=>{if(!locked)redo();};
function setupCanvasSize(){const r=canvas.getBoundingClientRect();const old=canvas.width&&canvas.height?snapshot():null;dpr=Math.max(1,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);if(old){const c=document.createElement('canvas');c.width=old.width;c.height=old.height;c.getContext('2d').putImageData(old,0,0);ctx.drawImage(c,0,0,r.width,r.height);}updateHistoryUI();}
function getPoint(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function isShapeTool(){return shapeTools.includes(tool);}
function prepareShapePreview(){previewImage=snapshot();}
function restorePreview(){if(previewImage)ctx.putImageData(previewImage,0,0);}
function polygon(cx,cy,rx,ry,n,rotation=-Math.PI/2){ctx.moveTo(cx+rx*Math.cos(rotation),cy+ry*Math.sin(rotation));for(let i=1;i<n;i++){const a=rotation+i*2*Math.PI/n;ctx.lineTo(cx+rx*Math.cos(a),cy+ry*Math.sin(a));}ctx.closePath();}
function drawShape(kind,a,b){const x=a.x,y=a.y,w=b.x-a.x,h=b.y-a.y;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#1479ff';ctx.fillStyle='#1479ff';ctx.lineWidth=4;ctx.beginPath();
if(kind==='line'){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
else if(kind==='arrow'){const ang=Math.atan2(h,w),head=16;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-head*Math.cos(ang-Math.PI/6),b.y-head*Math.sin(ang-Math.PI/6));ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-head*Math.cos(ang+Math.PI/6),b.y-head*Math.sin(ang+Math.PI/6));}
else if(kind==='circle'){const s=Math.min(Math.abs(w),Math.abs(h)),sx=w<0?a.x-s:a.x,sy=h<0?a.y-s:a.y;ctx.arc(sx+s/2,sy+s/2,s/2,0,Math.PI*2);}
else if(kind==='ellipse'){ctx.ellipse(a.x+w/2,a.y+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);}
else if(kind==='square'){const s=Math.max(Math.abs(w),Math.abs(h)),sx=w<0?a.x-s:a.x,sy=h<0?a.y-s:a.y;ctx.rect(sx,sy,s,s);}
else if(kind==='rectangle'){ctx.rect(x,y,w,h);}
else if(kind==='triangle'||kind==='isoscelesTriangle'){ctx.moveTo(x+w/2,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.closePath();}
else if(kind==='rightTriangle'){ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.closePath();}
else if(kind==='diamond'){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();}
else if(kind==='parallelogram'){const off=w*.22;ctx.moveTo(x+off,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-off,y+h);ctx.lineTo(x,y+h);ctx.closePath();}
else if(kind==='trapezoid'){const off=Math.abs(w)*.22;ctx.moveTo(x+off,y);ctx.lineTo(x+w-off,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();}
else if(['pentagon','hexagon','heptagon','octagon','nonagon','decagon'].includes(kind)){const n={pentagon:5,hexagon:6,heptagon:7,octagon:8,nonagon:9,decagon:10}[kind];polygon(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),n);}
else if(kind==='star'){const cx=x+w/2,cy=y+h/2,rx=Math.abs(w/2),ry=Math.abs(h/2),inner=.45;ctx.moveTo(cx,cy-ry);for(let i=1;i<10;i++){const ang=-Math.PI/2+i*Math.PI/5,r=i%2?inner:1;ctx.lineTo(cx+rx*r*Math.cos(ang),cy+ry*r*Math.sin(ang));}ctx.closePath();}
else if(kind==='semicircle'){ctx.arc(x+w/2,y+h,Math.min(Math.abs(w)/2,Math.abs(h)),Math.PI,0);ctx.lineTo(x+w/2,y+h);}
else if(kind==='arc'){ctx.ellipse(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),0,Math.PI,Math.PI*2);}
else if(kind==='sector'){const cx=x+w/2,cy=y+h/2,r=Math.min(Math.abs(w),Math.abs(h))/2;ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-Math.PI/2,0);ctx.closePath();}
else if(kind==='cross'){const t=Math.max(8,Math.min(Math.abs(w),Math.abs(h))*.25),cx=x+w/2,cy=y+h/2;ctx.rect(cx-t/2,y+Math.abs(h)*.1,t,Math.abs(h)*.8);ctx.rect(x+Math.abs(w)*.1,cy-t/2,Math.abs(w)*.8,t);}
else if(kind==='cube'){const ox=w*.22,oy=h*.18;ctx.moveTo(x+ox,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h-oy);ctx.lineTo(x+ox,y+h-oy);ctx.closePath();ctx.moveTo(x+ox,y);ctx.lineTo(x,y+oy);ctx.lineTo(x,y+h);ctx.lineTo(x+ox,y+h-oy);ctx.moveTo(x+w,y);ctx.lineTo(x+w-ox,y+oy);ctx.lineTo(x+w-ox,y+h);ctx.lineTo(x+w,y+h-oy);ctx.moveTo(x,y+oy);ctx.lineTo(x+w-ox,y+oy);}
ctx.stroke();ctx.restore();}
function startDrawing(e){if(locked||textMode)return;e.preventDefault();pushHistory();drawing=true;lastPoint=getPoint(e);canvas.setPointerCapture?.(e.pointerId);if(isShapeTool()){shapeStart=lastPoint;prepareShapePreview();return;}ctx.save();ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';ctx.fillStyle=tool==='eraser'?'#fff':'#1479ff';ctx.beginPath();ctx.arc(lastPoint.x,lastPoint.y,tool==='eraser'?10:2.5,0,Math.PI*2);ctx.fill();ctx.restore();}
function draw(e){if(!drawing||locked||textMode||!lastPoint)return;e.preventDefault();const p=getPoint(e);if(isShapeTool()&&shapeStart){restorePreview();drawShape(tool,shapeStart,p);return;}ctx.save();ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle='#1479ff';ctx.lineWidth=tool==='eraser'?22:4;ctx.beginPath();ctx.moveTo(lastPoint.x,lastPoint.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();lastPoint=p;}
function stopDrawing(e){if(!drawing)return;if(isShapeTool()&&shapeStart){const end=getPoint(e);restorePreview();drawShape(tool,shapeStart,end);}drawing=false;lastPoint=null;shapeStart=null;previewImage=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}updateHistoryUI();}
canvas.addEventListener('pointerdown',startDrawing);canvas.addEventListener('pointermove',draw);canvas.addEventListener('pointerup',stopDrawing);canvas.addEventListener('pointercancel',stopDrawing);
function updateLockUI(){$('#lockBoard').textContent=locked?'🔒 تخته قفل است':'🔓 تخته باز است';$('#lockBoard').classList.toggle('locked',locked);$('#lockOverlay').style.display=locked?'block':'none';$('#boardState').textContent=locked?'فقط معلم می‌تواند روی تخته بنویسد':(textMode?'حالت کیبورد فعال است؛ روی تخته کلیک کنید و تایپ کنید':(isShapeTool()?'شکل انتخاب شده؛ روی تخته بکشید':'تخته برای نوشتن باز است'));updateHistoryUI();}
function closeTextInput(){boardTextInput.classList.add('hidden');boardTextInput.value='';textPoint=null;}
function commitBoardText(){if(!textPoint)return;const value=boardTextInput.value.trim();if(!value){closeTextInput();return;}pushHistory();const r=canvas.getBoundingClientRect(),x=Math.max(8,Math.min(textPoint.x,r.width-8)),y=Math.max(34,Math.min(textPoint.y,r.height-8));ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#1479ff';ctx.font='bold 26px Tahoma,Arial,sans-serif';ctx.textAlign='right';ctx.textBaseline='alphabetic';value.split(/\n/).forEach((line,i)=>ctx.fillText(line,x,y+i*34));ctx.restore();closeTextInput();}
function startTextMode(){if(locked)return;textMode=!textMode;if(textMode){tool='text';document.querySelectorAll('.tool[data-tool]').forEach(i=>i.classList.remove('active'));$('#keyboardTool').classList.add('active');closeTextInput();}else{tool='pen';document.querySelectorAll('.tool[data-tool],#keyboardTool').forEach(i=>i.classList.remove('active'));document.querySelector('.tool[data-tool="pen"]')?.classList.add('active');}updateLockUI();}
$('#lockBoard').onclick=()=>{locked=!locked;if(locked){textMode=false;tool='pen';document.querySelectorAll('.tool[data-tool],#keyboardTool').forEach(i=>i.classList.remove('active'));document.querySelector('.tool[data-tool="pen"]')?.classList.add('active');closeTextInput();}updateLockUI();};
$('#keyboardTool').onclick=startTextMode;
canvas.addEventListener('pointerdown',e=>{if(!textMode||locked)return;e.preventDefault();const p=getPoint(e);textPoint=p;const wr=canvasWrap.getBoundingClientRect(),left=Math.max(8,Math.min(p.x,canvas.clientWidth-300)),top=Math.max(8,Math.min(p.y,canvas.clientHeight-55));boardTextInput.style.left=`${left}px`;boardTextInput.style.top=`${top}px`;boardTextInput.style.maxWidth=`${Math.max(180,wr.width-left-12)}px`;boardTextInput.classList.remove('hidden');boardTextInput.focus();});
boardTextInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();commitBoardText();}else if(e.key==='Escape'){e.preventDefault();closeTextInput();}});boardTextInput.addEventListener('blur',()=>{if(!boardTextInput.value.trim())closeTextInput();});
$('#clearBoard').onclick=()=>{if(locked)return;pushHistory();const r=canvas.getBoundingClientRect();ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);ctx.restore();closeTextInput();};
document.querySelectorAll('.tool[data-tool]').forEach(b=>b.onclick=()=>{if(locked)return;tool=b.dataset.tool;textMode=false;closeTextInput();document.querySelectorAll('.tool[data-tool],#keyboardTool').forEach(i=>i.classList.remove('active'));b.classList.add('active');updateLockUI();});
setupCanvasSize();updateLockUI();window.addEventListener('resize',setupCanvasSize);

// ---------- چت ----------
$('#sendChat').onclick=()=>{const v=$('#chatInput').value.trim();if(!v)return;const row=document.createElement('div'),label=document.createElement('b');label.textContent='شما: ';row.appendChild(label);row.appendChild(document.createTextNode(v));$('#messages').appendChild(row);$('#chatInput').value='';$('#messages').scrollTop=$('#messages').scrollHeight;};
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sendChat').click();});
$('#demoCall').onclick=()=>alert('اتاق آزمایشی آماده است. تماس ویدئویی واقعی در نسخه عملیاتی با WebRTC و سرور جلسه متصل می‌شود.');
const saved=localStorage.getItem('mehrFarazanProfile');if(saved){try{const p=JSON.parse(saved);$('#nameInput').value=p.name||'';$('#emailInput').value=p.email||'';}catch(_){} }
window.addEventListener('DOMContentLoaded',()=>{const boardSample=document.querySelector('.mini-board'),logoPanel=document.querySelector('.logo-panel'),logoImage=logoPanel?.querySelector('img');if(boardSample)boardSample.style.display='none';if(logoPanel){logoPanel.style.height='310px';logoPanel.style.minHeight='310px';logoPanel.style.marginTop='18px';logoPanel.style.background='#fff';logoPanel.style.border='2px solid #e7eef5';logoPanel.style.borderRadius='18px';logoPanel.style.display='flex';logoPanel.style.alignItems='center';logoPanel.style.justifyContent='center';logoPanel.style.overflow='hidden';}if(logoImage){logoImage.style.maxWidth='88%';logoImage.style.maxHeight='88%';logoImage.style.width='auto';logoImage.style.height='auto';logoImage.style.objectFit='contain';}});
