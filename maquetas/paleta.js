// Repinta las cajas con la gama de la variante (dos tonos en diagonal, como siempre)
(() => {
  const P = window.PALETA; if (!P) return;
  function pintar() {
    document.querySelectorAll(".frente").forEach((f, i) => {
      if (f.dataset.pal) return; f.dataset.pal = 1;
      const [a, b] = P[i % P.length]; f.style.background = `linear-gradient(160deg,${a},${b})`;
    });
  }
  addEventListener("DOMContentLoaded", () => { pintar(); new MutationObserver(pintar).observe(document.body, { childList: true, subtree: true }); });
})();
