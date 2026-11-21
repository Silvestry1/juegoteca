// Pasa la portada actual a 8 bits: íconos en pixeles, rayas de luz escalonadas y repisa de madera pixel.
(() => {
  const css = getComputedStyle(document.documentElement);
  const RES = parseInt(css.getPropertyValue("--px-res")) || 20;
  const cache = {};
  function emojiPx(txt, res = RES) {
    const k = txt + res; if (cache[k]) return cache[k];
    const c = document.createElement("canvas"); c.width = c.height = res;
    const x = c.getContext("2d"); x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `${Math.round(res * 0.84)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    x.fillText(txt, res / 2, res / 2 + res * 0.06);
    const d = x.getImageData(0, 0, res, res);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
    x.putImageData(d, 0, 0);
    return (cache[k] = c.toDataURL());
  }
  function patron(w, h, f) { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); f((X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); }); return `url(${c.toDataURL()})`; }
  const R = document.documentElement.style;
  // rayas diagonales escalonadas (mismo dibujo que las actuales, en pixeles)
  R.setProperty("--rayas", patron(12, 12, r => { for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if (((x + y) % 12) < 5) r(x, y, 1, 1, "rgba(255,255,255,.13)"); }));
  R.setProperty("--tablon", patron(16, 6, r => { r(0, 0, 16, 6, "#3a2716"); r(0, 0, 16, 1, "#5e4027"); r(0, 5, 16, 1, "#1e130a"); r(4, 2, 4, 1, "#2c1d10"); r(11, 3, 3, 1, "#4a321c"); }));
  function tratar(raiz) {
    raiz.querySelectorAll(".ilus > div:not([data-px])").forEach(d => {
      const t = d.textContent.trim(); if (!t) return; d.dataset.px = 1;
      d.innerHTML = `<img class="px-ico" alt="" src="${emojiPx(t)}">`;
    });
    raiz.querySelectorAll(".px-emo:not([data-px])").forEach(s => {
      const t = s.textContent.trim(); s.dataset.px = 1;
      s.innerHTML = `<img alt="" src="${emojiPx(t, 14)}">`;
    });
  }
  addEventListener("DOMContentLoaded", () => {
    tratar(document);
    new MutationObserver(() => tratar(document)).observe(document.body, { childList: true, subtree: true });
  });
})();
