// Ambient background: small, widely-spaced dots drifting diagonally. Theme-aware, GPU-cheap.
(function () {
  function init() {
    if (document.getElementById('bg-dots')) return;
    const c = document.createElement('canvas');
    c.id = 'bg-dots';
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none';
    document.body.prepend(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, dots = [];
    function size() {
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    }
    function make() {
      const n = Math.round((innerWidth * innerHeight) / 36000); // widely spaced
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.3 + 0.7) * dpr,
        s: (Math.random() * 0.2 + 0.07) * dpr,
        o: Math.random() * 0.4 + 0.18
      }));
    }
    size(); make();
    addEventListener('resize', () => { size(); make(); });
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.dataset.theme === 'dark';
      const base = dark ? '208,208,218,' : '70,70,82,';
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 7);
        ctx.fillStyle = 'rgba(' + base + (d.o * (dark ? 0.5 : 0.4)) + ')';
        ctx.fill();
        if (!still) {
          d.x += d.s; d.y -= d.s; // slow diagonal drift, up-right
          if (d.x > W + 8) d.x = -8;
          if (d.y < -8) d.y = H + 8;
        }
      }
      requestAnimationFrame(frame);
    })();
  }
  if (document.body) init(); else addEventListener('DOMContentLoaded', init);
})();
