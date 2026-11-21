// Pinta cada caja con dos tonos en diagonal de la paleta del sitio.
// El par sale del nombre del juego, así cada juego conserva sus colores aunque se filtre el estante.
(() => {
  const P = window.PALETA; if (!P) return;
  const h = s => { let n = 7; for (const c of s) n = (n * 31 + c.codePointAt(0)) >>> 0; return n; };
  function pintar() {
    document.querySelectorAll(".frente:not([data-pal])").forEach(f => {
      f.dataset.pal = 1;
      const nom = f.closest(".caja")?.getAttribute("aria-label") || "";
      const [a, b] = P[h(nom) % P.length]; f.style.background = `linear-gradient(160deg,${a},${b})`;
    });
  }
  addEventListener("DOMContentLoaded", () => { pintar(); new MutationObserver(pintar).observe(document.body, { childList: true, subtree: true }); });
})();
