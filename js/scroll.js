// Scroll-driven letter-spacing and horizontal stretch
(function () {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  const spacingStart = parseFloat(getComputedStyle(brand).getPropertyValue('--spacing-start')) || 0.5;
  const spacingEnd = parseFloat(getComputedStyle(brand).getPropertyValue('--spacing-end')) || 0.5;
  const stretchStart = parseFloat(getComputedStyle(brand).getPropertyValue('--stretch-start')) || 1.0;
  const stretchEnd = parseFloat(getComputedStyle(brand).getPropertyValue('--stretch-end')) || 1.0;

  let latestScroll = 0;
  let ticking = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function update() {
    ticking = false;
    const maxScroll = Math.max(window.innerHeight * 0.9, 200); // range over ~one viewport
    const t = clamp(latestScroll / maxScroll, 0, 1);

    // spacing: large at top (t=0), small when scrolled down (t=1)
    const spacing = lerp(spacingStart, spacingEnd, t);
    const stretch = lerp(stretchStart, stretchEnd, t);

    brand.style.setProperty('--spacing', String(spacing));
    brand.style.setProperty('--stretch', String(stretch));
  }

  function onScroll() {
    latestScroll = window.scrollY || window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  // set initial values on load
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { latestScroll = window.scrollY; onScroll(); });
})();
