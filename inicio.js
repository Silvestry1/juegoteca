// Botón flotante con el logo para volver al menú de la Juegoteca.
// Se incluye en cada juego propio con: <script src="../../inicio.js"></script>
(() => {
  const raiz = new URL("./", document.currentScript.src).href;
  const css = document.createElement("style");
  css.textContent = `
  #jt-inicio{position:fixed;z-index:2147483000;left:calc(8px + env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom));
    width:40px;height:40px;border-radius:50%;border:2px solid #ff7a1a;background:rgba(10,15,28,.82);color:#ff7a1a;
    font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;
    box-shadow:0 0 10px #ff7a1a55,0 3px 8px #0008;-webkit-tap-highlight-color:transparent;opacity:.75}
  #jt-inicio:active{transform:scale(.92)}
  @media print{#jt-inicio{display:none}}`;
  document.head.appendChild(css);
  // Diseño pixel de los juegos de la casa (cada juego conserva sus colores)
  if (/\/juegos\//.test(location.pathname)) {
    const t = document.createElement("link"); t.rel = "stylesheet"; t.href = raiz + "juegos/comun/tema.css";
    document.head.appendChild(t);
    const f = document.createElement("link"); f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&display=swap";
    document.head.appendChild(f);
    const j = document.createElement("script"); j.src = raiz + "juegos/comun/tema.js"; j.defer = true;
    const pon = () => document.body.appendChild(j);
    document.body ? pon() : addEventListener("DOMContentLoaded", pon);
  }
  const b = document.createElement("button");
  b.id = "jt-inicio";
  b.type = "button";
  b.title = "Volver al menú de la Juegoteca";
  b.setAttribute("aria-label", "Volver al menú de la Juegoteca");
  b.textContent = "🎬";
  b.addEventListener("click", () => {
    if (confirm("¿Volver al menú de la Juegoteca?")) location.href = raiz;
  });
  const poner = () => document.body.appendChild(b);
  document.body ? poner() : addEventListener("DOMContentLoaded", poner);
})();
