(()=>{
  const eraserBtn=document.querySelector('[data-tool="eraser"]');
  const canvas=document.querySelector('#board');
  const ctx=canvas?.getContext('2d');
  if(!eraserBtn||!canvas||!ctx)return;

  const presets=[
    {label:'خیلی کوچک',value:8},
    {label:'کوچک',value:16},
    {label:'متوسط',value:28},
    {label:'بزرگ',value:45},
    {label:'خیلی بزرگ',value:65}
  ];
  let eraserSize=28;
  let pendingSize=28;
  let erasing=false;
  let lastPoint=null;

  const wrap=document.createElement('div');
  wrap.className='eraser-size-wrap';
  wrap.innerHTML='<button type="button" id="eraserSizeBtn" class="eraser-size-btn">📏 اندازه پاک‌کن</button>';
  eraserBtn.insertAdjacentElement('afterend',wrap);

  const modal=document.createElement('div');
  modal.id='eraserSizeModal';
  modal.className='eraser-size-modal hidden';
  modal.innerHTML=`
    <div class="eraser-size-card">
      <button type="button" id="closeEraserSize" class="close">×</button>
      <h3>اندازه پاک‌کن</h3>
      <div id="eraserSizeDegree" class="eraser-size-degree">درجه: 28</div>

      <div id="eraserPresetButtons" class="eraser-preset-buttons"></div>

      <input id="eraserSizeRange" type="range" min="5" max="80" value="28" step="1">
      <div class="eraser-range-ends"><span>کوچک‌تر</span><span>بزرگ‌تر</span></div>

      <div id="eraserSizeSelected" class="eraser-size-selected">اندازه دلخواه: 28 پیکسل</div>
      <button type="button" id="saveEraserSize" class="primary">اعمال اندازه</button>
    </div>`;
  document.body.appendChild(modal);

  const range=modal.querySelector('#eraserSizeRange');
  const degree=modal.querySelector('#eraserSizeDegree');
  const selected=modal.querySelector('#eraserSizeSelected');
  const presetBox=modal.querySelector('#eraserPresetButtons');

  function updateDisplay(){
    degree.textContent=`درجه: ${pendingSize}`;
    const matched=presets.find(p=>p.value===pendingSize);
    selected.textContent=matched?`اندازه انتخاب‌شده: ${matched.label} (${pendingSize} پیکسل)`:`اندازه دلخواه: ${pendingSize} پیکسل`;
    presetBox.querySelectorAll('button').forEach(btn=>btn.classList.toggle('selected',Number(btn.dataset.size)===pendingSize));
  }

  presets.forEach(p=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='eraser-preset';
    btn.dataset.size=p.value;
    btn.textContent=p.label;
    btn.onclick=()=>{
      pendingSize=p.value;
      range.value=String(p.value);
      updateDisplay();
    };
    presetBox.appendChild(btn);
  });

  range.oninput=()=>{
    pendingSize=Number(range.value);
    updateDisplay();
  };

  const open=()=>{
    pendingSize=eraserSize;
    range.value=String(eraserSize);
    updateDisplay();
    modal.classList.remove('hidden');
  };
  const close=()=>modal.classList.add('hidden');

  document.querySelector('#eraserSizeBtn').onclick=open;
  modal.querySelector('#closeEraserSize').onclick=close;
  modal.querySelector('#saveEraserSize').onclick=()=>{
    eraserSize=pendingSize;
    close();
    updateCursor();
  };
  modal.addEventListener('click',e=>{if(e.target===modal)close();});

  const isEraserActive=()=>!!document.querySelector('.tool[data-tool="eraser"].active');
  const isUnlocked=()=>{const b=document.querySelector('#lockBoard');return !!b&&!b.classList.contains('locked');};
  const getPoint=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};

  function updateCursor(){
    const s=Math.max(8,Math.min(70,eraserSize));
    canvas.style.cursor=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${s+8}' height='${s+8}'%3E%3Ccircle cx='${(s+8)/2}' cy='${(s+8)/2}' r='${s/2}' fill='white' fill-opacity='.12' stroke='%23607386' stroke-width='2'/%3E%3C/svg%3E") ${(s+8)/2} ${(s+8)/2}, auto`;
  }

  function beginErase(e){
    if(!isEraserActive()||!isUnlocked())return;
    e.preventDefault();
    e.stopImmediatePropagation();
    erasing=true;
    lastPoint=getPoint(e);
    canvas.setPointerCapture?.(e.pointerId);

    // پاک‌کن همیشه سفیدِ خودِ تخته است، نه رنگ انتخاب‌شده برای قلم.
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.arc(lastPoint.x,lastPoint.y,eraserSize/2,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function moveErase(e){
    if(!erasing)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const p=getPoint(e);
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle='#ffffff';
    ctx.lineWidth=eraserSize;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.x,lastPoint.y);
    ctx.lineTo(p.x,p.y);
    ctx.stroke();
    ctx.restore();
    lastPoint=p;
  }

  function endErase(e){
    if(!erasing)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    erasing=false;
    lastPoint=null;
    try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}
  }

  canvas.addEventListener('pointerdown',beginErase,true);
  canvas.addEventListener('pointermove',moveErase,true);
  canvas.addEventListener('pointerup',endErase,true);
  canvas.addEventListener('pointercancel',endErase,true);

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-tool="eraser"]')){
      setTimeout(()=>{if(isEraserActive())updateCursor();},0);
    }
  });

  const style=document.createElement('style');
  style.textContent=`
    .eraser-size-wrap{margin:0 0 6px}
    .eraser-size-btn{width:100%;font-family:inherit;border:1px solid var(--line);border-radius:11px;padding:8px 10px;background:#fff;color:var(--ink);cursor:pointer}
    .eraser-size-btn:hover{background:#f7fbff}
    .eraser-size-modal{position:fixed;inset:0;background:rgba(12,35,56,.46);display:grid;place-items:center;z-index:50;padding:20px}
    .eraser-size-modal.hidden{display:none}
    .eraser-size-card{position:relative;width:min(480px,100%);background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);border-radius:22px;padding:28px}
    .eraser-size-card h3{margin:0 0 10px;font-size:23px}
    .eraser-size-degree{text-align:center;color:var(--primary);font-weight:900;font-size:16px;margin-bottom:16px}
    .eraser-preset-buttons{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:18px}
    .eraser-preset{font-family:inherit;border:1px solid var(--line);border-radius:10px;padding:9px 5px;background:#fff;color:var(--ink);cursor:pointer;font-size:11px;font-weight:800}
    .eraser-preset:hover{background:#f7fbff}
    .eraser-preset.selected{border-color:var(--primary);background:#eff7ff;color:var(--primary)}
    #eraserSizeRange{width:100%;accent-color:var(--primary);cursor:pointer}
    .eraser-range-ends{display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-top:4px}
    .eraser-size-selected{text-align:center;font-weight:800;color:var(--ink);margin:16px 0}
    #saveEraserSize{width:100%}
    @media(max-width:620px){.eraser-preset-buttons{grid-template-columns:1fr 1fr}.eraser-preset:last-child{grid-column:1/-1}}
  `;
  document.head.appendChild(style);
})();
