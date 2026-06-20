function sketchBorder(element, options = {}) {
  if (!element || !window.rough) return;

  const existing = element.querySelector('svg.rough-border');
  if (existing) existing.remove();

  const rect = element.getBoundingClientRect();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'rough-border');
  svg.setAttribute('width', rect.width);
  svg.setAttribute('height', rect.height);
  svg.style.width = rect.width + 'px';
  svg.style.height = rect.height + 'px';

  const rc = rough.svg(svg);
  const padding = options.padding ?? 4;
  const node = rc.rectangle(
    padding,
    padding,
    rect.width - padding * 2,
    rect.height - padding * 2,
    {
      roughness: 2.2,
      bowing: 1.4,
      stroke: options.stroke || '#2c2c2c',
      strokeWidth: options.strokeWidth ?? 2,
      fill: options.fill || 'transparent',
      fillStyle: options.fillStyle || 'hachure',
      fillWeight: options.fillWeight ?? 0.5,
      hachureGap: options.hachureGap ?? 6,
      ...options
    }
  );

  svg.appendChild(node);
  element.appendChild(svg);
}

function drawOptionCircle(element, options = {}) {
  if (!element || !window.rough) return null;

  const existing = element.querySelector('svg.option-circle');
  if (existing) existing.remove();

  const rect = element.getBoundingClientRect();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'option-circle');
  svg.setAttribute('width', rect.width);
  svg.setAttribute('height', rect.height);

  const rc = rough.svg(svg);
  const margin = options.margin ?? 8;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const rx = rect.width / 2 - margin;
  const ry = rect.height / 2 - margin;
  const node = rc.ellipse(cx, cy, rx * 2, ry * 2, {
    roughness: 2.5,
    bowing: 1.8,
    stroke: options.stroke || '#ff6b6b',
    strokeWidth: options.strokeWidth ?? 2.5,
    fill: 'rgba(255, 107, 107, 0.08)',
    fillStyle: 'solid',
    ...options
  });

  svg.appendChild(node);
  element.appendChild(svg);
  return svg;
}

function clearOptionCircle(element) {
  const existing = element.querySelector('svg.option-circle');
  if (existing) existing.remove();
}

function drawProgress(canvas, progress, options = {}) {
  if (!canvas || !window.rough) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const rc = rough.canvas(canvas);
  const margin = 2;

  rc.line(margin, height / 2, width - margin, height / 2, {
    roughness: 1.5,
    bowing: 1,
    stroke: '#d0d0d0',
    strokeWidth: 4,
    ...options.track
  });

  const endX = margin + (width - margin * 2) * Math.max(0, Math.min(1, progress));
  if (progress > 0) {
    rc.line(margin, height / 2, endX, height / 2, {
      roughness: 2,
      bowing: 1.5,
      stroke: options.stroke || '#ff6b6b',
      strokeWidth: 6,
      ...options.bar
    });
  }
}

function sketchAllBorders() {
  document.querySelectorAll('.sketch-border').forEach((el) => {
    sketchBorder(el, { fill: '#ffffff', fillStyle: 'solid', roughness: 1.8 });
  });
}

function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

window.addEventListener('resize', debounce(() => {
  sketchAllBorders();
}));
