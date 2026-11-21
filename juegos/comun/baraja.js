/* Baraja española de 40 cartas, dibujada a mano en SVG (diseño propio de la Juegoteca).
   Uso:
     Baraja.carta({n:7, p:"espada"})  → string <svg> de la carta
     Baraja.dorso()                    → string <svg> del dorso
   Palos: "espada", "basto", "oro", "copa". Números: 1 a 7, 10 (sota), 11 (caballo), 12 (rey).
   Las cortes del marco siguen la costumbre: oro sin corte, copa 1, espada 2, basto 3. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const COLOR = { oro: "#b8860b", copa: "#b3262c", espada: "#2763a8", basto: "#3f7a2a" };
  const ROPA = { oro: "#c0392b", copa: "#2e6fb3", espada: "#7d3c98", basto: "#2e8b57" };
  const CORTES = { oro: 0, copa: 1, espada: 2, basto: 3 };
  const ORO = "#f2b705", FONDO = "#fbf5e6";

  const DEFS = `
<symbol id="bj-oro" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="17" fill="${ORO}" stroke="#8a5a00" stroke-width="2"/>
  <circle cx="20" cy="20" r="11.5" fill="#ffd34d" stroke="#8a5a00" stroke-width="1.4"/>
  <g stroke="#8a5a00" stroke-width="1.6" stroke-linecap="round">
    <path d="M20 5.5v3M20 31.5v3M5.5 20h3M31.5 20h3M9.7 9.7l2.1 2.1M28.2 28.2l2.1 2.1M30.3 9.7l-2.1 2.1M11.8 28.2l-2.1 2.1"/>
  </g>
  <circle cx="20" cy="20" r="4" fill="#d18f00" stroke="#8a5a00" stroke-width="1.2"/>
</symbol>
<symbol id="bj-copa" viewBox="0 0 40 40">
  <path d="M7 7.5H33Q33.5 23 20 26Q6.5 23 7 7.5Z" fill="#c1272d" stroke="#5e0d12" stroke-width="1.6"/>
  <path d="M11 11Q12 20 20 22.5" fill="none" stroke="#ff8a8a" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="20" cy="7.5" rx="13" ry="3" fill="${ORO}" stroke="#8a5a00" stroke-width="1.3"/>
  <rect x="17.6" y="25.5" width="4.8" height="6.5" fill="${ORO}" stroke="#8a5a00" stroke-width="1.2"/>
  <ellipse cx="20" cy="34" rx="9.5" ry="3.2" fill="${ORO}" stroke="#8a5a00" stroke-width="1.3"/>
</symbol>
<symbol id="bj-espada" viewBox="0 0 40 40">
  <path d="M20 1.5L23.2 7.5V26.5H16.8V7.5Z" fill="#c9d6e3" stroke="#2b3d52" stroke-width="1.4"/>
  <path d="M20 5V25" stroke="#7f93a8" stroke-width="1.2"/>
  <rect x="9" y="26" width="22" height="3.6" rx="1.8" fill="${ORO}" stroke="#8a5a00" stroke-width="1.2"/>
  <rect x="18.2" y="29.4" width="3.6" height="6.4" fill="#2763a8" stroke="#16365e" stroke-width="1"/>
  <circle cx="20" cy="37.4" r="2.3" fill="${ORO}" stroke="#8a5a00" stroke-width="1"/>
</symbol>
<symbol id="bj-basto" viewBox="0 0 40 40">
  <path d="M15.5 38.5Q15 26 12 13Q10.5 4.5 20 2.5Q29.5 4.5 28 13Q25 26 24.5 38.5Z" fill="#9a6a3a" stroke="#3e2914" stroke-width="1.6"/>
  <path d="M17 9Q16.5 6 20 5" fill="none" stroke="#d6a36b" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="14.6" cy="15" r="2" fill="#5c3b1c"/><circle cx="25.2" cy="19" r="2" fill="#5c3b1c"/>
  <circle cx="17" cy="27" r="1.7" fill="#5c3b1c"/><circle cx="23" cy="32" r="1.5" fill="#5c3b1c"/>
  <path d="M26.5 11Q33 7 35 10Q31 14 26.5 12Z" fill="#4caf50" stroke="#1f5e22" stroke-width="1"/>
</symbol>
<pattern id="bj-trama" width="10" height="10" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="#7b1e24"/>
  <path d="M5 0L10 5L5 10L0 5Z" fill="none" stroke="#a8434a" stroke-width="1.2"/>
  <circle cx="5" cy="5" r="1.1" fill="#e8b04b"/>
</pattern>`;

  function instalar() {
    if (document.getElementById("bj-defs")) return;
    const s = document.createElementNS(NS, "svg");
    s.id = "bj-defs";
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    s.innerHTML = "<defs>" + DEFS + "</defs>";
    (document.body || document.documentElement).prepend(s);
  }

  const uso = (p, x, y, t, rot) =>
    `<use href="#bj-${p}" x="${x - t / 2}" y="${y - t / 2}" width="${t}" height="${t}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}/>`;

  const PIPS = {
    2: [[50, 44], [50, 106]],
    3: [[50, 38], [50, 75], [50, 112]],
    4: [[32, 44], [68, 44], [32, 106], [68, 106]],
    5: [[32, 42], [68, 42], [50, 75], [32, 108], [68, 108]],
    6: [[32, 40], [68, 40], [32, 75], [68, 75], [32, 110], [68, 110]],
    7: [[32, 36], [68, 36], [50, 56], [32, 78], [68, 78], [32, 112], [68, 112]]
  };

  function marco(p) {
    const c = COLOR[p];
    let s = `<rect x="7" y="7" width="86" height="136" rx="4" fill="none" stroke="${c}" stroke-width="1.8"/>`;
    const n = CORTES[p];
    for (let i = 0; i < n; i++) {
      const x = 50 + (i - (n - 1) / 2) * 12;
      s += `<rect x="${x - 3}" y="5" width="6" height="4" fill="${FONDO}"/><rect x="${x - 3}" y="141" width="6" height="4" fill="${FONDO}"/>`;
    }
    return s;
  }

  function indice(n, p) {
    const c = COLOR[p];
    const t = `font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="15" fill="${c}"`;
    return `<text x="13" y="23" ${t} text-anchor="middle">${n}</text>` +
      `<text x="87" y="137" ${t} text-anchor="middle" transform="rotate(180 87 132)">${n}</text>`;
  }

  function figura(n, p) {
    const ropa = ROPA[p], c = COLOR[p];
    let s = `<rect x="17" y="27" width="66" height="96" rx="3" fill="#f3e4c2" stroke="${c}" stroke-width="1.2"/>`;
    const piel = "#f1c27d";
    if (n === 10) { // sota: de pie, gorro, sostiene el palo
      s += `<path d="M37 62Q50 56 63 62L68 120H32Z" fill="${ropa}" stroke="#222" stroke-width="1.2"/>
        <path d="M32 120H68" stroke="${ORO}" stroke-width="3"/>
        <path d="M44 66L50 84L56 66" fill="none" stroke="${ORO}" stroke-width="2"/>
        <circle cx="50" cy="49" r="9" fill="${piel}" stroke="#222" stroke-width="1.2"/>
        <path d="M40 45Q41 35 50 35Q60 35 60 45Q50 40 40 45Z" fill="#3a2a1a"/>
        <path d="M39 42Q50 30 62 41L66 38" fill="none" stroke="${ropa}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="46.5" cy="49" r="1.1" fill="#222"/><circle cx="53.5" cy="49" r="1.1" fill="#222"/>
        <path d="M47 53.5Q50 55.5 53 53.5" fill="none" stroke="#8a4b2a" stroke-width="1"/>` +
        uso(p, 60, 84, 24);
    } else if (n === 11) { // caballo: jinete sobre el caballo
      s += `<ellipse cx="48" cy="98" rx="22" ry="11" fill="#8b5a2b" stroke="#2b1a0b" stroke-width="1.2"/>
        <path d="M62 96L68 74L75 67L83 75L81 80L73 79L71 97Z" fill="#8b5a2b" stroke="#2b1a0b" stroke-width="1.2"/>
        <path d="M71 68L73 61L76 67Z" fill="#8b5a2b" stroke="#2b1a0b" stroke-width="1"/>
        <path d="M68 74Q66 68 72 66" fill="none" stroke="#2b1a0b" stroke-width="2.4"/>
        <circle cx="77" cy="72" r="1" fill="#111"/>
        <path d="M27 95Q19 102 22 115" fill="none" stroke="#2b1a0b" stroke-width="3" stroke-linecap="round"/>
        <g fill="#7a4d24" stroke="#2b1a0b" stroke-width="1"><rect x="31" y="105" width="4" height="15"/><rect x="39" y="106" width="4" height="14"/><rect x="55" y="106" width="4" height="14"/><rect x="63" y="104" width="4" height="16"/></g>
        <path d="M41 90L43 64Q48 61 54 64L56 90Z" fill="${ropa}" stroke="#222" stroke-width="1.2"/>
        <path d="M43 92L37 101" stroke="${ropa}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="48.5" cy="55" r="7.5" fill="${piel}" stroke="#222" stroke-width="1.2"/>
        <path d="M40 52Q48 42 57 52Z" fill="${ropa}" stroke="#222" stroke-width="1"/>
        <circle cx="46" cy="55.5" r="1" fill="#222"/><circle cx="51" cy="55.5" r="1" fill="#222"/>` +
        uso(p, 33, 70, 20, p === "espada" || p === "basto" ? -25 : 0);
    } else { // rey: corona y barba
      s += `<path d="M34 64Q50 57 66 64L70 120H30Z" fill="${ropa}" stroke="#222" stroke-width="1.2"/>
        <path d="M30 120H70M50 62V120" stroke="${ORO}" stroke-width="3"/>
        <path d="M34 64Q30 92 30 120" fill="none" stroke="#f3e4c2" stroke-width="4" opacity=".8"/>
        <circle cx="50" cy="48" r="9.5" fill="${piel}" stroke="#222" stroke-width="1.2"/>
        <path d="M41 51Q50 68 59 51Q50 56 41 51Z" fill="#d9d4c7" stroke="#555" stroke-width="1"/>
        <path d="M40.5 41V31L45 35.5L50 28.5L55 35.5L59.5 31V41Z" fill="${ORO}" stroke="#8a5a00" stroke-width="1.2"/>
        <circle cx="50" cy="34" r="1.4" fill="#c1272d"/>
        <circle cx="46.5" cy="47" r="1.1" fill="#222"/><circle cx="53.5" cy="47" r="1.1" fill="#222"/>` +
        uso(p, 61, 86, 24);
    }
    return s;
  }

  function cuerpo(n, p) {
    if (n >= 10) return figura(n, p);
    if (n === 1) {
      const ancho = p === "espada" || p === "basto";
      const t = ancho ? 82 : 62;
      let s = "";
      if (ancho) s += `<ellipse cx="50" cy="75" rx="30" ry="44" fill="${COLOR[p]}" opacity=".09"/>`;
      if (p === "oro") s += `<circle cx="50" cy="75" r="36" fill="none" stroke="${COLOR[p]}" stroke-width="1" stroke-dasharray="2 3"/>`;
      return s + uso(p, 50, 75, t);
    }
    return PIPS[n].map(([x, y]) => uso(p, x, y, n <= 3 ? 30 : 25)).join("");
  }

  function carta(c, extra) {
    instalar();
    return `<svg viewBox="0 0 100 150" class="bj-carta${extra ? " " + extra : ""}" role="img" aria-label="${nombre(c)}">
<rect x="1" y="1" width="98" height="148" rx="9" fill="${FONDO}" stroke="#7a6a4f" stroke-width="1.5"/>
${marco(c.p)}${indice(c.n, c.p)}${cuerpo(c.n, c.p)}</svg>`;
  }

  function dorso(extra) {
    instalar();
    return `<svg viewBox="0 0 100 150" class="bj-carta bj-dorso${extra ? " " + extra : ""}" aria-hidden="true">
<rect x="1" y="1" width="98" height="148" rx="9" fill="#f6efe0" stroke="#7a6a4f" stroke-width="1.5"/>
<rect x="7" y="7" width="86" height="136" rx="5" fill="url(#bj-trama)" stroke="#4a0f13" stroke-width="1.5"/>
<circle cx="50" cy="75" r="17" fill="#7b1e24" stroke="#e8b04b" stroke-width="2.5"/>
<path d="M50 62L54 71L63 72L56 78L58 87L50 82L42 87L44 78L37 72L46 71Z" fill="#e8b04b"/></svg>`;
  }

  const NOMBRE_N = { 1: "Ancho", 10: "Sota", 11: "Caballo", 12: "Rey" };
  const PLURAL = { oro: "oro", copa: "copa", espada: "espada", basto: "basto" };
  function nombre(c) {
    const fig = { 10: "Sota", 11: "Caballo", 12: "Rey" }[c.n];
    return (fig || c.n) + " de " + PLURAL[c.p];
  }

  window.Baraja = { carta, dorso, nombre, instalar, COLOR };
})();
