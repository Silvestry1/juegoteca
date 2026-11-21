// Marca botones, campos y paneles para el diseño pixel (tema.css).
// Respeta lo redondo a propósito (bolillas, fichas, interruptores): si es un círculo o una cápsula, no lo toca.
(() => {
  const redondo = el => {
    const cs = getComputedStyle(el), r = parseFloat(cs.borderTopLeftRadius) || 0;
    return cs.borderTopLeftRadius.includes("%") ? parseFloat(cs.borderTopLeftRadius) >= 40 : r >= Math.min(el.offsetWidth, el.offsetHeight) / 2 - 1;
  };
  const card = getComputedStyle(document.documentElement).getPropertyValue("--card").trim();
  let cardRGB = "";
  if (card) { const t = document.createElement("i"); t.style.color = card; document.body.appendChild(t); cardRGB = getComputedStyle(t).color; t.remove(); }
  function marcar() {
    document.querySelectorAll("button:not([data-px]),input:not([type=checkbox]):not([type=radio]):not([type=range]):not([data-px]),select:not([data-px]),textarea:not([data-px])").forEach(el => {
      if (!el.offsetWidth) return;
      el.dataset.px = 1; if (el.id === "jt-inicio" || redondo(el)) return; el.classList.add("px-btn");
    });
    if (!cardRGB) return;
    document.querySelectorAll("body *:not([data-px]):not(script):not(style)").forEach(el => {
      if (!el.offsetWidth) return;
      el.dataset.px = 0;
      const cs = getComputedStyle(el); if (cs.backgroundColor !== cardRGB) return;
      el.dataset.px = 1; if (!redondo(el) && el.offsetWidth > 60) el.classList.add("px-panel");
    });
  }
  let pend = false;
  const pedir = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; marcar(); }); };
  marcar();
  new MutationObserver(pedir).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style"] });
})();
