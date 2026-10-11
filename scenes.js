/* Scroll behaviour: reveals, header state, and the pinned question scene. */
(() => {
  const bar = document.querySelector('.bar');
  const scene = document.querySelector('[data-scene]');
  const slides = [...scene.querySelectorAll('.slide')];
  const rail = [...scene.querySelectorAll('.rail span')];

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  let queued = false;
  const update = () => {
    queued = false;
    bar.classList.toggle('solid', scrollY > 40);
    document.body.classList.toggle('past', scrollY > innerHeight * 0.6);
    const r = scene.getBoundingClientRect();
    const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    const i = Math.floor(p * slides.length);
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    rail.forEach((s, k) => s.classList.toggle('on', k === i));
    if (window.themisNet) themisNet.energy = 1 + (r.top < innerHeight && r.bottom > 0 ? i * 0.6 : 0);
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();
