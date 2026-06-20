function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width;
  const height = rect.height || canvas.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height, dpr };
}

function drawRadarChart(canvas, data, labels, options = {}) {
  if (!canvas || !window.rough) return;
  const { width, height } = setupCanvas(canvas);
  const rc = rough.canvas(canvas);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const count = data.length;
  const max = options.max ?? 10;
  const colors = options.colors || labels.map(() => '#4ecdc4');

  for (let r = 0.2; r <= 1; r += 0.2) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      points.push([
        centerX + Math.cos(angle) * radius * r,
        centerY + Math.sin(angle) * radius * r
      ]);
    }
    rc.polygon(points, { stroke: '#d0d0d0', strokeWidth: 1, roughness: 1.5, bowing: 0.5 });
  }

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    rc.line(centerX, centerY, centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius, {
      stroke: '#d0d0d0', strokeWidth: 1, roughness: 1.2
    });
  }

  const dataPoints = data.map((val, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const r = (val / max) * radius;
    return [centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r];
  });

  rc.polygon(dataPoints, {
    fill: options.fill || 'rgba(78, 205, 196, 0.25)',
    fillStyle: 'solid',
    stroke: options.stroke || '#4ecdc4',
    strokeWidth: 2.5,
    roughness: 2,
    bowing: 1.5
  });

  dataPoints.forEach(([x, y], i) => {
    rc.circle(x, y, 8, { fill: colors[i % colors.length], fillStyle: 'solid', stroke: '#2c2c2c', strokeWidth: 1.5 });
  });

  labels.forEach((label, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const labelR = radius + 22;
    const x = centerX + Math.cos(angle) * labelR;
    const y = centerY + Math.sin(angle) * labelR;
    const ctx = canvas.getContext('2d');
    ctx.font = '700 14px "ZCOOL KuaiLe", Caveat, cursive';
    ctx.fillStyle = '#2c2c2c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  });
}

function drawBarChart(canvas, data, labels, options = {}) {
  if (!canvas || !window.rough) return;
  const { width, height } = setupCanvas(canvas);
  const rc = rough.canvas(canvas);

  const padding = { top: 30, right: 20, bottom: 50, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = options.max ?? Math.max(...data, 10);
  const count = data.length;
  const barGap = 16;
  const barW = (chartW - barGap * (count + 1)) / count;
  const colors = options.colors || labels.map(() => '#4ecdc4');

  rc.line(padding.left, padding.top, padding.left, height - padding.bottom, {
    stroke: '#2c2c2c', strokeWidth: 2, roughness: 1.5
  });
  rc.line(padding.left, height - padding.bottom, width - padding.right, height - padding.bottom, {
    stroke: '#2c2c2c', strokeWidth: 2, roughness: 1.5
  });

  data.forEach((val, i) => {
    const x = padding.left + barGap + i * (barW + barGap);
    const barH = (val / max) * chartH;
    const y = height - padding.bottom - barH;
    const color = colors[i % colors.length];

    rc.rectangle(x, y, barW, barH, {
      fill: color,
      fillStyle: 'solid',
      stroke: '#2c2c2c',
      strokeWidth: 1.5,
      roughness: 2,
      bowing: 1
    });

    const ctx = canvas.getContext('2d');
    ctx.font = '700 14px "ZCOOL KuaiLe", Caveat, cursive';
    ctx.fillStyle = '#2c2c2c';
    ctx.textAlign = 'center';
    ctx.fillText(String(val), x + barW / 2, y - 10);

    ctx.save();
    ctx.translate(x + barW / 2, height - padding.bottom + 18);
    ctx.rotate(-0.25);
    ctx.textAlign = 'right';
    ctx.fillText(labels[i], 0, 0);
    ctx.restore();
  });
}
