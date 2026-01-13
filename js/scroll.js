// Scroll-driven letter-spacing and horizontal stretch
(function () {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  // --- initial load: start scrolled down then smoothly scroll up to top ---
  // Adjust `initialScrollFraction` to change how far down the page starts (0.0 - 1.0)
  // Set `initialDelayMs` to change how long the page stays at the start position
  const initialScrollFraction = 0.45; // fraction of viewport height to start at
  const initialDelayMs = 50; // fallback delay (ms) before smoothly scrolling to top
  const initialScrollDurationMs = 1500; // duration of the smooth scroll (ms) — edit this to change speed

  // prefer script-controlled scroll restoration so we get consistent behavior
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}

  // small performant custom smooth-scroller using rAF so duration is controllable
  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    if (distance === 0 || duration <= 0) {
      window.scrollTo(0, targetY);
      return;
    }
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(1, elapsed / duration);
      const y = Math.round(startY + distance * ease(t));
      window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runInitialScroll() {
    try {
      const maxStart = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const startY = Math.min(window.innerHeight * initialScrollFraction, maxStart);
      // jump to start position immediately, update visuals, then smooth-scroll up
      window.scrollTo(0, startY);
      latestScroll = startY;
      // ensure CSS/visuals reflect scrolled state, then start smooth scroll next frame
      window.requestAnimationFrame(() => {
        update();
        // start smooth scroll on next frame to avoid visible buffering
        window.requestAnimationFrame(() => {
          // start our custom smooth scroll (fallback tiny delay for some browsers)
          window.setTimeout(() => {
            smoothScrollTo(0, initialScrollDurationMs);
          }, initialDelayMs);
        });
      });
    } catch (e) {
      // ignore on environments that restrict scroll
    }
  }
  // Run on load (DOMContentLoaded or immediate if already loaded)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInitialScroll();
  } else {
    window.addEventListener('DOMContentLoaded', runInitialScroll, { once: true });
  }


  const spacingStart = parseFloat(getComputedStyle(brand).getPropertyValue('--spacing-start')) || 0.28;
  const spacingEnd = parseFloat(getComputedStyle(brand).getPropertyValue('--spacing-end')) || 0.02;
  const stretchStart = parseFloat(getComputedStyle(brand).getPropertyValue('--stretch-start')) || 1.15;
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

    // reveal panorama image once user has scrolled past a fraction of the hero
    try {
      const revealThreshold = Math.max(window.innerHeight * 0.6, 120);
      if (latestScroll > revealThreshold) {
        document.body.classList.add('reveal-panorama');
      } else {
        document.body.classList.remove('reveal-panorama');
      }
    } catch (e) {
      // ignore
    }
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

  // start initial scroll now that listeners and update are registered
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInitialScroll();
  } else {
    window.addEventListener('DOMContentLoaded', runInitialScroll, { once: true });
  }

  // ------------------ background audio autoplay with fallback ------------------
  (function () {
    const audio = document.getElementById('bg-audio');
    if (!audio) return;

    // start muted to increase chance of autoplay, then unmute if possible
    audio.muted = true;
    audio.volume = 0.9;

    const tryPlay = () => audio.play().then(() => {
      // attempt to unmute after playback started
      try { audio.muted = false; } catch (e) {}
    }).catch(() => {
      // autoplay blocked — show fallback play button
      showPlayButton();
    });

    function showPlayButton() {
      if (document.querySelector('.audio-play-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'audio-play-btn';
      btn.setAttribute('aria-label', 'Play background music');
      btn.textContent = 'Play Music';
      btn.addEventListener('click', () => {
        audio.play().then(() => { audio.muted = false; btn.remove(); }).catch(() => {});
      });
      document.body.appendChild(btn);
    }

    // prefer script-controlled scroll restoration
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}

    if (document.readyState === 'complete' || document.readyState === 'interactive') tryPlay();
    else window.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  })();
})();
