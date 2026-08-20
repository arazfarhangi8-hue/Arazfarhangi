const $ = (s) => document.querySelector(s);

// ---------- حساب کاربری ----------
const modal = $('#modal');
const openModal = (title, text) => {
  $('#modalTitle').textContent = title;
  $('#modalText').textContent = text;
  modal.classList.remove('hidden');
};
$('#profileBtn').onclick = () => openModal('حساب کاربری مهر فرازان', 'حساب نمایشی در این نسخه آماده است. احراز هویت واقعی در مرحله بک‌اند اضافه می‌شود.');
$('#startBtn').onclick = () => openModal('شروع کار معلم', 'معلم پس از خرید اشتراک به داشبورد و ساخت جلسه دسترسی خواهد داشت.');
$('#buyBtn').onclick = () => openModal('خرید اشتراک', 'این دکمه فعلاً نمایشی است؛ درگاه پرداخت واقعی در مرحله بک‌اند متصل می‌شود.');
$('#studentBtn').onclick = () => openModal('ورود دانش‌آموز', 'دانش‌آموز با لینک یا کد جلسه وارد می‌شود و برای اشتراک پلتفرم هزینه جداگانه نمی‌پردازد.');
$('#closeModal').onclick = () => modal.classList.add('hidden');
$('#saveProfile').onclick = () => {
  localStorage.setItem('mehrFarazanProfile', JSON.stringify({
    name: $('#nameInput').value.trim(),
    email: $('#emailInput').value.trim()
  }));
  alert('اطلاعات حساب روی همین مرورگر ذخیره شد.');
  modal.classList.add('hidden');
};
modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

// ---------- تخته سفید ----------
const canvas = $('#board');
const ctx = canvas.getContext('2d', { alpha: false });
const canvasWrap = document.querySelector('.canvas-wrap');
const boardTextInput = $('#boardTextInput');
let dpr = Math.max(1, window.devicePixelRatio || 1);
let drawing = false;
let locked = true;
let tool = 'pen';
let lastPoint = null;
let textMode = false;
let textPoint = null;

function setupCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  const old = canvas.width && canvas.height ? canvas.toDataURL() : null;
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  if (old) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = old;
  }
}
function getPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function startDrawing(e) {
  if (locked || textMode) return;
  e.preventDefault(); drawing = true; lastPoint = getPoint(e); canvas.setPointerCapture?.(e.pointerId);
  ctx.save(); ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.fillStyle = tool === 'eraser' ? '#fff' : '#1479ff'; ctx.beginPath();
  ctx.arc(lastPoint.x, lastPoint.y, tool === 'eraser' ? 10 : 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function draw(e) {
  if (!drawing || locked || textMode || !lastPoint) return;
  e.preventDefault(); const point = getPoint(e); ctx.save();
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = '#1479ff'; ctx.lineWidth = tool === 'eraser' ? 22 : 4; ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y); ctx.lineTo(point.x, point.y); ctx.stroke(); ctx.restore(); lastPoint = point;
}
function stopDrawing(e) { if (!drawing) return; drawing = false; lastPoint = null; try { canvas.releasePointerCapture?.(e.pointerId); } catch (_) {} }
canvas.addEventListener('pointerdown', startDrawing); canvas.addEventListener('pointermove', draw); canvas.addEventListener('pointerup', stopDrawing); canvas.addEventListener('pointercancel', stopDrawing);
function updateLockUI() {
  $('#lockBoard').textContent = locked ? '🔒 تخته قفل است' : '🔓 تخته باز است';
  $('#lockBoard').classList.toggle('locked', locked); $('#lockOverlay').style.display = locked ? 'block' : 'none';
  $('#boardState').textContent = locked ? 'فقط معلم می‌تواند روی تخته بنویسد' : (textMode ? 'حالت کیبورد فعال است؛ روی تخته کلیک کنید و تایپ کنید' : 'تخته برای نوشتن باز است');
}
function closeTextInput() { boardTextInput.classList.add('hidden'); boardTextInput.value = ''; textPoint = null; }
function commitBoardText() {
  if (!textPoint) return; const value = boardTextInput.value.trim(); if (!value) { closeTextInput(); return; }
  const rect = canvas.getBoundingClientRect(); const x = Math.max(8, Math.min(textPoint.x, rect.width - 8)); const y = Math.max(34, Math.min(textPoint.y, rect.height - 8));
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#1479ff';
  ctx.font = 'bold 26px Tahoma, Arial, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  value.split(/\n/).forEach((line, index) => ctx.fillText(line, x, y + index * 34)); ctx.restore(); closeTextInput();
}
function startTextMode() {
  if (locked) return; textMode = !textMode;
  if (textMode) { tool = 'text'; document.querySelectorAll('.tool[data-tool]').forEach((item) => item.classList.remove('active')); $('#keyboardTool').classList.add('active'); boardTextInput.classList.add('hidden'); boardTextInput.value = ''; }
  else { tool = 'pen'; document.querySelectorAll('.tool[data-tool]').forEach((item) => item.classList.remove('active')); document.querySelector('.tool[data-tool="pen"]')?.classList.add('active'); closeTextInput(); }
  updateLockUI();
}
$('#lockBoard').onclick = () => { locked = !locked; if (locked) { textMode = false; tool = 'pen'; document.querySelectorAll('.tool[data-tool]').forEach((item) => item.classList.remove('active')); document.querySelector('.tool[data-tool="pen"]')?.classList.add('active'); closeTextInput(); } updateLockUI(); };
$('#keyboardTool').onclick = startTextMode;
canvas.addEventListener('pointerdown', (e) => {
  if (!textMode || locked) return; e.preventDefault(); const p = getPoint(e); textPoint = p; const wrapRect = canvasWrap.getBoundingClientRect();
  const inputLeft = Math.max(8, Math.min(p.x, canvas.clientWidth - 300)); const inputTop = Math.max(8, Math.min(p.y, canvas.clientHeight - 55));
  boardTextInput.style.left = `${inputLeft}px`; boardTextInput.style.top = `${inputTop}px`; boardTextInput.style.maxWidth = `${Math.max(180, wrapRect.width - inputLeft - 12)}px`; boardTextInput.classList.remove('hidden'); boardTextInput.focus();
});
boardTextInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitBoardText(); } else if (e.key === 'Escape') { e.preventDefault(); closeTextInput(); } });
boardTextInput.addEventListener('blur', () => { if (!boardTextInput.value.trim()) closeTextInput(); });
$('#clearBoard').onclick = () => { const rect = canvas.getBoundingClientRect(); ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, rect.width, rect.height); ctx.restore(); closeTextInput(); };
document.querySelectorAll('.tool[data-tool]').forEach((button) => { button.onclick = () => { if (locked) return; tool = button.dataset.tool; textMode = false; closeTextInput(); document.querySelectorAll('.tool[data-tool], #keyboardTool').forEach((item) => item.classList.remove('active')); button.classList.add('active'); updateLockUI(); }; });
setupCanvasSize(); updateLockUI(); window.addEventListener('resize', setupCanvasSize);

// ---------- چت ----------
$('#sendChat').onclick = () => { const value = $('#chatInput').value.trim(); if (!value) return; const row = document.createElement('div'); const label = document.createElement('b'); label.textContent = 'شما: '; row.appendChild(label); row.appendChild(document.createTextNode(value)); $('#messages').appendChild(row); $('#chatInput').value = ''; $('#messages').scrollTop = $('#messages').scrollHeight; };
$('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#sendChat').click(); });
$('#demoCall').onclick = () => alert('اتاق آزمایشی آماده است. تماس ویدئویی واقعی در نسخه عملیاتی با WebRTC و سرور جلسه متصل می‌شود.');
const saved = localStorage.getItem('mehrFarazanProfile');
if (saved) { try { const p = JSON.parse(saved); $('#nameInput').value = p.name || ''; $('#emailInput').value = p.email || ''; } catch (_) {} }

// ---------- نمایش لوگو به‌جای نمونه ضرب ----------
window.addEventListener('DOMContentLoaded', () => {
  const boardSample = document.querySelector('.mini-board');
  const logoPanel = document.querySelector('.logo-panel');
  const logoImage = logoPanel?.querySelector('img');
  if (boardSample) boardSample.style.display = 'none';
  if (logoPanel) {
    logoPanel.style.height = '310px';
    logoPanel.style.minHeight = '310px';
    logoPanel.style.marginTop = '18px';
    logoPanel.style.marginBottom = '0';
    logoPanel.style.background = '#fff';
    logoPanel.style.border = '2px solid #e7eef5';
    logoPanel.style.borderRadius = '18px';
    logoPanel.style.display = 'flex';
    logoPanel.style.alignItems = 'center';
    logoPanel.style.justifyContent = 'center';
    logoPanel.style.overflow = 'hidden';
  }
  if (logoImage) {
    logoImage.style.maxWidth = '88%';
    logoImage.style.maxHeight = '88%';
    logoImage.style.width = 'auto';
    logoImage.style.height = 'auto';
    logoImage.style.objectFit = 'contain';
  }
});
