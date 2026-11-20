// Maquetas pixel art: pasa los íconos (emoji) a pixeles grandes y
// copia los dos colores de cada caja a variables CSS (--c1, --c2)
// para que cada variante pinte bandas planas en vez de degradé.
(() => {
  const RES = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--px-res")) || 18;
  const cache = {};
  function emojiPx(txt) {
    if (cache[txt]) return cache[txt];
    const c = document.createElement("canvas");
    c.width = c.height = RES;
    const x = c.getContext("2d");
    x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `${Math.round(RES * 0.82)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    x.fillText(txt, RES / 2, RES / 2 + RES * 0.06);
    // Alfa en todo o nada, para bordes duros
    const d = x.getImageData(0, 0, RES, RES);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
    x.putImageData(d, 0, 0);
    return (cache[txt] = c.toDataURL());
  }
  function tratar(raiz) {
    raiz.querySelectorAll(".ilus > div:not([data-px])").forEach(d => {
      const t = d.textContent.trim(); if (!t) return;
      d.dataset.px = 1;
      d.innerHTML = `<img class="px-ico" alt="" src="${emojiPx(t)}">`;
    });
    raiz.querySelectorAll(".frente:not([data-c])").forEach(f => {
      const m = (f.getAttribute("style") || "").match(/#[0-9a-f]{3,8}/gi);
      f.dataset.c = 1;
      if (m) { f.style.setProperty("--c1", m[0]); f.style.setProperty("--c2", m[1] || m[0]); }
    });
  }
  const obs = new MutationObserver(() => tratar(document));
  addEventListener("DOMContentLoaded", () => {
    tratar(document);
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
