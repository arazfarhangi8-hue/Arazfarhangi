// رنگ قلم و شکل‌ها + پاک‌کن کاملاً مستقل از رنگ انتخابی
(() => {
  const canvas = document.getElementById('board');
  const color = document.getElementById('boardColor');
  if (!canvas || !color) return;

  const ctx = canvas.getContext('2d');
  const white = '#ffffff';
  const isEraserActive = () => !!document.querySelector('[data-tool="eraser"].active');

  const originalStroke = ctx.stroke.bind(ctx);
  ctx.stroke = function (...args) {
    const oldComposite = this.globalCompositeOperation;
    const oldStroke = this.strokeStyle;
    if (isEraserActive()) {
      this.globalCompositeOperation = 'source-over';
      this.strokeStyle = white;
    } else {
      this.strokeStyle = color.value || '#1479ff';
    }
    const result = originalStroke(...args);
    this.strokeStyle = oldStroke;
    this.globalCompositeOperation = oldComposite;
    return result;
  };

  const originalFill = ctx.fill.bind(ctx);
  ctx.fill = function (...args) {
    const oldComposite = this.globalCompositeOperation;
    const oldFill = this.fillStyle;
    if (isEraserActive()) {
      this.globalCompositeOperation = 'source-over';
      this.fillStyle = white;
    } else {
      this.fillStyle = color.value || '#1479ff';
    }
    const result = originalFill(...args);
    this.fillStyle = oldFill;
    this.globalCompositeOperation = oldComposite;
    return result;
  };

  const originalFillText = ctx.fillText.bind(ctx);
  ctx.fillText = function (...args) {
    const oldFill = this.fillStyle;
    this.fillStyle = color.value || '#1479ff';
    const result = originalFillText(...args);
    this.fillStyle = oldFill;
    return result;
  };

  const paintWhite = () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const isBlank = () => {
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) return false;
      }
    } catch (_) {}
    return true;
  };

  if (isBlank()) paintWhite();
  color.addEventListener('input', () => {
    if (!isEraserActive()) {
      ctx.strokeStyle = color.value;
      ctx.fillStyle = color.value;
    }
  });
})();
