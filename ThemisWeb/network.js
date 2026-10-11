/* Neural field: drifting nodes, faint synapses, and signals that fire and propagate. */
(() => {
  const cv = document.getElementById('net'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const R = 150, S = window.themisNet = { energy: 1 };
  let W, H, nodes = [], sigs = [], raf, mouse = { x: 0, y: 0, on: false };

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(36, (W * H) / 17000)));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: reduce ? 0 : (Math.random() - 0.5) * 0.18, vy: reduce ? 0 : (Math.random() - 0.5) * 0.18, f: 0
    }));
    sigs = [];
    if (reduce) frame();
  };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const spawn = (a, from) => {
    const o = nodes.filter(b => b !== a && b !== from && dist(a, b) < R);
    if (o.length) sigs.push({ a, b: o[(Math.random() * o.length) | 0], t: 0 });
  };

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.f *= 0.94;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < R) {
          ctx.strokeStyle = `rgba(228,225,216,${(1 - d / R) * 0.13})`;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = `rgba(228,225,216,${0.28 + n.f * 0.6})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.6 + n.f * 2.4, 0, 6.283); ctx.fill();
    }
    if (mouse.on) {
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d < R * 1.3) {
          ctx.strokeStyle = `rgba(194,127,90,${(1 - d / (R * 1.3)) * 0.5})`;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    }
    if (!reduce) {
      if (sigs.length < 14 * S.energy && Math.random() < 0.04 * S.energy) spawn(nodes[(Math.random() * nodes.length) | 0]);
      for (let i = sigs.length - 1; i >= 0; i--) {
        const s = sigs[i]; s.t += 0.02;
        const k = Math.min(1, s.t), k0 = Math.max(0, k - 0.2);
        const px = v => s.a.x + (s.b.x - s.a.x) * v, py = v => s.a.y + (s.b.y - s.a.y) * v;
        ctx.strokeStyle = 'rgba(194,127,90,.9)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px(k0), py(k0)); ctx.lineTo(px(k), py(k)); ctx.stroke();
        if (k >= 1) { s.b.f = 1; if (Math.random() < 0.65) spawn(s.b, s.a); sigs.splice(i, 1); }
      }
      ctx.lineWidth = 1;
      if (!document.hidden) raf = requestAnimationFrame(frame);
    }
  }

  addEventListener('resize', size);
  addEventListener('pointermove', e => { mouse = { x: e.clientX, y: e.clientY, on: true }; });
  document.addEventListener('pointerleave', () => { mouse.on = false; });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduce) { cancelAnimationFrame(raf); frame(); } });
  size();
  if (!reduce) frame();
})();
