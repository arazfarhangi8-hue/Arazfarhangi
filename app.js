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

// ---------- تخته سفید واقعی ----------
const canvas = $('#board');
const ctx = canvas.getContext('2d', { alpha: false });
let dpr = Math.max(1, window.devicePixelRatio || 1);
let drawing = false;
let locked = true;
let tool = 'pen';
let lastPoint = null;

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
  if (locked) return;
  e.preventDefault();
  drawing = true;
  lastPoint = getPoint(e);
  canvas.setPointerCapture?.(e.pointerId);
  ctx.save();
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.fillStyle = tool === 'eraser' ? '#fff' : '#1479ff';
  ctx.beginPath();
  ctx.arc(lastPoint.x, lastPoint.y, tool === 'eraser' ? 10 : 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw(e) {
  if (!drawing || locked || !lastPoint) return;
  e.preventDefault();
  const point = getPoint(e);
  ctx.save();
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = '#1479ff';
  ctx.lineWidth = tool === 'eraser' ? 22 : 4;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.restore();
  lastPoint = point;
}

function stopDrawing(e) {
  if (!drawing) return;
  drawing = false;
  lastPoint = null;
  try { canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
}

canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);

function updateLockUI() {
  $('#lockBoard').textContent = locked ? '🔒 تخته قفل است' : '🔓 تخته باز است';
  $('#lockBoard').classList.toggle('locked', locked);
  $('#lockOverlay').style.display = locked ? 'block' : 'none';
  $('#boardState').textContent = locked ? 'فقط معلم می‌تواند روی تخته بنویسد' : 'تخته برای نوشتن باز است';
}

$('#lockBoard').onclick = () => {
  locked = !locked;
  updateLockUI();
};

$('#clearBoard').onclick = () => {
  const rect = canvas.getBoundingClientRect();
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.restore();
};

document.querySelectorAll('.tool[data-tool]').forEach((button) => {
  button.onclick = () => {
    tool = button.dataset.tool;
    document.querySelectorAll('.tool[data-tool]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  };
});

setupCanvasSize();
updateLockUI();
window.addEventListener('resize', setupCanvasSize);

// ---------- چت ----------
$('#sendChat').onclick = () => {
  const value = $('#chatInput').value.trim();
  if (!value) return;
  const row = document.createElement('div');
  const label = document.createElement('b');
  label.textContent = 'شما: ';
  row.appendChild(label);
  row.appendChild(document.createTextNode(value));
  $('#messages').appendChild(row);
  $('#chatInput').value = '';
  $('#messages').scrollTop = $('#messages').scrollHeight;
};
$('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#sendChat').click(); });
$('#demoCall').onclick = () => alert('اتاق آزمایشی آماده است. تماس ویدئویی واقعی در نسخه عملیاتی با WebRTC و سرور جلسه متصل می‌شود.');

const saved = localStorage.getItem('mehrFarazanProfile');
if (saved) {
  try {
    const p = JSON.parse(saved);
    $('#nameInput').value = p.name || '';
    $('#emailInput').value = p.email || '';
  } catch (_) {}
}
