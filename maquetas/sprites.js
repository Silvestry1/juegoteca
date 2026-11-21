// Objetos en pixel art dibujados a mano en un lienzo chico y agrandados sin suavizar.
// Arma la escena de fondo según <html data-escena="...">.
(() => {
  const K = "#16121f";
  function lienzo(w, h, dib) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    const r = (X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); };
    dib(r, x); return { url: c.toDataURL(), w, h };
  }
  const S = {};
  S.tele = (pant = "#5ff3ff") => lienzo(32, 29, r => {
    for (let i = 0; i < 6; i++) { r(15 - i, 5 - i, 1, 1, K); r(17 + i, 5 - i, 1, 1, K); }
    r(9, 0, 2, 1, "#e04848"); r(22, 0, 2, 1, "#e04848"); r(15, 5, 3, 2, K);
    r(1, 7, 30, 20, K); r(0, 8, 32, 18, K);
    r(1, 8, 30, 18, "#8d93a0"); r(2, 8, 28, 1, "#c3c8d2"); r(1, 9, 1, 16, "#b0b6c0"); r(1, 25, 30, 1, "#5c616d"); r(30, 9, 1, 16, "#6c717d");
    r(3, 10, 20, 14, "#262931"); r(4, 11, 18, 12, pant);
    for (let y = 12; y < 23; y += 2) r(4, y, 18, 1, "#00000022");
    r(5, 12, 4, 1, "#ffffffaa"); r(5, 13, 1, 3, "#ffffffaa"); r(19, 21, 2, 1, "#ffffff55");
    r(25, 11, 4, 4, "#3a3d46"); r(26, 12, 2, 2, "#d5dae2"); r(25, 16, 4, 4, "#3a3d46"); r(26, 17, 2, 2, "#d5dae2");
    for (let y = 21; y < 25; y += 2) r(25, y, 4, 1, "#4a4e58");
    r(28, 9, 1, 1, "#7cff6b");
    r(4, 26, 4, 3, K); r(24, 26, 4, 3, K);
  });
  S.vhs = (col = "#ff5ec4") => lienzo(24, 14, r => {
    r(0, 0, 24, 14, K); r(1, 1, 22, 12, "#2c2a33"); r(1, 1, 22, 1, "#47444f");
    r(3, 2, 18, 5, "#f2efe6"); r(3, 2, 18, 1, col); r(5, 4, 10, 1, "#9a96a4"); r(5, 5, 6, 1, "#c3bfcc");
    r(4, 8, 6, 4, "#0b0a0f"); r(14, 8, 6, 4, "#0b0a0f"); r(6, 9, 2, 2, "#e9e9e9"); r(16, 9, 2, 2, "#e9e9e9"); r(10, 9, 4, 2, "#4a3326");
  });
  S.pilaVhs = (cols = ["#ff5ec4", "#5ff3ff", "#ffd84a", "#7cff6b"]) => lienzo(30, cols.length * 6, r => {
    cols.forEach((c, i) => { const y = i * 6, dx = i % 2 ? 1 : 0;
      r(dx, y, 28, 6, K); r(dx + 1, y + 1, 26, 4, "#2c2a33"); r(dx + 5, y + 1, 16, 4, "#f2efe6"); r(dx + 5, y + 2, 16, 1, c); r(dx + 7, y + 3, 8, 1, "#9a96a4"); });
  });
  S.consola = () => lienzo(30, 12, r => {
    r(1, 1, 28, 11, K); r(0, 2, 30, 9, K); r(1, 2, 28, 9, "#dcd7cf"); r(1, 2, 28, 1, "#f3efe8"); r(1, 10, 28, 1, "#a7a29a");
    r(5, 4, 18, 2, "#4a4852"); r(5, 4, 18, 1, "#2a2830");
    r(3, 8, 4, 1, "#e04848"); r(9, 8, 4, 1, "#6c6a72");
    for (let x = 18; x < 28; x += 2) r(x, 7, 1, 3, "#a7a29a");
  });
  S.control = () => lienzo(20, 11, r => {
    r(2, 0, 16, 9, K); r(0, 2, 20, 7, K); r(1, 3, 6, 7, K); r(13, 3, 6, 7, K);
    r(2, 1, 16, 7, "#4b4a5a"); r(1, 3, 18, 5, "#4b4a5a"); r(2, 1, 16, 1, "#6d6c80");
    r(3, 4, 5, 1, "#16121f"); r(5, 2, 1, 5, "#16121f");
    r(14, 3, 2, 2, "#ff5e7a"); r(16, 5, 2, 2, "#5ff3ff"); r(9, 5, 2, 1, "#8a899a");
  });
  S.celu = () => lienzo(12, 23, r => {
    r(1, 0, 10, 10, K); r(0, 1, 12, 8, K); r(1, 1, 10, 8, "#a9bcd2"); r(1, 1, 10, 1, "#d7e2ee");
    r(3, 2, 6, 5, "#0f2a22"); r(3, 2, 6, 5, "#8ff0c0"); r(4, 3, 3, 1, "#2f6e55"); r(4, 5, 4, 1, "#2f6e55");
    r(2, 10, 8, 1, "#555a66");
    r(1, 11, 10, 12, K); r(0, 12, 12, 10, K); r(1, 12, 10, 10, "#c9d4e0"); r(1, 21, 10, 1, "#8e9aa8");
    r(5, 13, 2, 1, "#5ff3ff");
    for (let f = 0; f < 3; f++) for (let c = 0; c < 3; c++) r(2 + c * 3, 15 + f * 2, 2, 1, "#4b5563");
  });
  S.planta = () => lienzo(18, 24, r => {
    const v = "#2f9e44", v2 = "#56c46a", v3 = "#1e6b2e";
    r(8, 0, 2, 4, v2); r(4, 2, 3, 2, v); r(3, 4, 3, 3, v); r(11, 2, 3, 2, v); r(12, 4, 3, 3, v);
    r(6, 4, 6, 4, v2); r(1, 7, 6, 3, v); r(11, 7, 6, 3, v); r(5, 8, 8, 5, v); r(7, 9, 1, 5, v3); r(10, 9, 1, 5, v3);
    r(2, 8, 2, 1, v2); r(14, 8, 2, 1, v2);
    r(3, 13, 12, 3, K); r(4, 14, 10, 1, "#c96a3a"); r(4, 16, 10, 8, K); r(5, 16, 8, 7, "#b8582c"); r(5, 16, 2, 7, "#d77d4d");
  });
  S.lava = () => lienzo(12, 26, r => {
    r(4, 0, 4, 2, "#9aa0aa"); r(3, 2, 6, 1, K);
    for (let y = 3; y < 17; y++) { const a = Math.floor((y - 3) / 4); r(3 - Math.min(a, 2), y, 6 + 2 * Math.min(a, 2), 1, "#ff9bd6"); }
    r(5, 5, 2, 2, "#ff3fa3"); r(3, 10, 3, 3, "#ff3fa3"); r(6, 13, 4, 3, "#ff3fa3"); r(5, 8, 1, 6, "#ffffff66");
    r(1, 17, 10, 1, K); r(2, 18, 8, 6, "#9aa0aa"); r(2, 18, 2, 6, "#c7ccd4"); r(1, 24, 10, 2, "#6b707a");
  });
  S.ventana = () => lienzo(40, 32, r => {
    r(0, 0, 40, 32, "#5a4636"); r(2, 2, 36, 28, "#0f1440"); r(2, 22, 36, 8, "#1a1f55");
    r(28, 5, 4, 4, "#fff6c8"); r(29, 4, 2, 6, "#fff6c8"); r(27, 6, 6, 2, "#fff6c8"); r(30, 5, 2, 2, "#0f1440");
    [[3, 14, 7, 16], [11, 18, 6, 12], [18, 11, 8, 19], [27, 16, 5, 14], [33, 20, 5, 10]].forEach(([x, y, w, h]) => {
      r(x, y, w, h, "#06081e"); for (let yy = y + 2; yy < 30; yy += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if ((xx * 7 + yy * 3) % 5 < 2) r(xx, yy, 1, 1, "#ffd84a"); });
    r(6, 5, 1, 1, "#fff"); r(14, 3, 1, 1, "#fff"); r(22, 7, 1, 1, "#fff");
    r(19, 2, 2, 28, "#5a4636"); r(2, 15, 36, 2, "#5a4636"); r(0, 30, 40, 2, "#3d2f24");
  });
  S.cd = () => lienzo(16, 16, (r, x) => {
    const cols = ["#ff9bd6", "#ffd84a", "#9bffcf", "#7cc8ff", "#c49bff"];
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const dx = i - 7.5, dy = j - 7.5, d = Math.hypot(dx, dy);
      if (d > 7.6) continue; if (d < 1.6) continue;
      if (d > 6.7) { r(i, j, 1, 1, "#8a8f9a"); continue; }
      if (d < 3) { r(i, j, 1, 1, "#d9dde4"); continue; }
      const a = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI); r(i, j, 1, 1, cols[Math.floor(a * 10) % 5]);
    }
    r(4, 3, 2, 1, "#fff"); r(3, 4, 1, 2, "#fff");
  });
  S.nube = () => lienzo(26, 11, r => {
    const b = "#ffffff", s = "#dbeefd";
    r(6, 2, 7, 3, b); r(13, 0, 7, 5, b); r(3, 4, 21, 5, b); r(1, 6, 25, 3, b); r(2, 9, 22, 2, s); r(14, 1, 3, 1, "#fff");
  });
  S.brillo = (c = "#ffffff") => lienzo(7, 7, r => { r(3, 0, 1, 7, c); r(0, 3, 7, 1, c); r(2, 2, 3, 3, c); });
  S.cassette = () => lienzo(22, 14, r => {
    r(0, 0, 22, 14, K); r(1, 1, 20, 12, "#e85d9a"); r(1, 1, 20, 1, "#ff9bc4");
    r(3, 2, 16, 6, "#fdf3e1"); r(3, 3, 16, 1, "#5ff3ff"); r(5, 5, 4, 2, K); r(13, 5, 4, 2, K); r(6, 5, 2, 2, "#fff"); r(14, 5, 2, 2, "#fff");
    r(6, 10, 10, 3, "#b8407a"); r(7, 11, 1, 1, K); r(14, 11, 1, 1, K);
  });
  S.tablon = () => lienzo(16, 6, r => { r(0, 0, 16, 6, "#8a5a2b"); r(0, 0, 16, 1, "#c08850"); r(0, 5, 16, 1, "#4d2f14"); r(5, 2, 4, 1, "#6e4520"); r(11, 3, 3, 1, "#a26a35"); });
  S.icono = () => S.tele("#ffd84a");
  window.Sprites = S;

  const ESC = {
    living: [
      ["ventana", [], 4, "6%", "12%"],
      ["lava", [], 4, "84%", "15%"],
      ["pilaVhs", [], 4, "64%", "44%"],
      ["planta", [], 5, "84%", "74%"],
      ["tele", ["#5ff3ff"], 4, "3%", "73%"],
      ["consola", [], 3, "38%", "88%"],
      ["control", [], 3, "60%", "90%"],
      ["celu", [], 3, "10%", "47%"],
    ],
    aqua: [
      ["nube", [], 5, "-8%", "6%"], ["nube", [], 4, "62%", "20%"], ["nube", [], 6, "30%", "62%"], ["nube", [], 4, "-6%", "84%"],
      ["cd", [], 5, "76%", "4%"], ["celu", [], 4, "4%", "36%"], ["vhs", ["#5ff3ff"], 4, "68%", "48%"], ["control", [], 4, "8%", "68%"],
      ["lava", [], 4, "84%", "74%"], ["cassette", [], 4, "48%", "86%"],
      ["brillo", [], 3, "40%", "8%"], ["brillo", [], 2, "88%", "38%"], ["brillo", [], 3, "26%", "50%"], ["brillo", [], 2, "60%", "76%"],
    ],
    stickers: [
      ["tele", ["#ff9bd6"], 4, "58%", "4%", -8], ["cd", [], 5, "2%", "14%", 0], ["vhs", ["#7cff6b"], 4, "64%", "34%", 10],
      ["celu", [], 4, "6%", "44%", -12], ["cassette", [], 4, "40%", "58%", 6], ["control", [], 4, "70%", "68%", -10],
      ["lava", [], 4, "4%", "76%", 8], ["planta", [], 4, "84%", "86%", 0], ["consola", [], 3, "30%", "90%", -4],
      ["brillo", [], 3, "44%", "20%"], ["brillo", ["#fff6a8"], 3, "86%", "56%"], ["brillo", [], 2, "24%", "36%"],
    ],
  };
  // Diorama de arriba: objetos nítidos, en px sobre un ancho de 390
  const HERO = {
    living: { alto: 240, piso: 206, items: [
      ["ventana", [], 4, 196, 8], ["tablon", [], 0, 150, 150, 0, 160], ["pilaVhs", [], 3, 160, 78], ["celu", [], 2, 262, 104],
      ["lava", [], 3, 300, 72], ["tele", ["#5ff3ff"], 4, 14, 90], ["consola", [], 3, 150, 170], ["control", [], 3, 250, 173], ["planta", [], 3, 326, 134] ] },
    aqua: { alto: 240, items: [
      ["nube", [], 5, -20, 16], ["nube", [], 4, 262, 128], ["nube", [], 3, 120, 196], ["cd", [], 5, 286, 12], ["celu", [], 4, 36, 104, -10],
      ["vhs", ["#ff5ec4"], 4, 142, 46, 6], ["control", [], 4, 206, 150, -6], ["cassette", [], 3, 140, 136, 4],
      ["brillo", [], 3, 250, 40], ["brillo", [], 2, 110, 30], ["brillo", [], 3, 96, 190], ["brillo", [], 2, 340, 110] ] },
    stickers: { alto: 240, items: [
      ["tele", ["#ff9bd6"], 4, 18, 18, -6], ["cd", [], 5, 292, 10], ["vhs", ["#7cff6b"], 4, 166, 28, 8], ["celu", [], 4, 316, 118, 12],
      ["cassette", [], 4, 150, 132, -5], ["control", [], 3, 30, 168, 6], ["lava", [], 3, 254, 128, -8],
      ["brillo", [], 3, 140, 18], ["brillo", ["#fff6a8"], 3, 280, 96], ["brillo", [], 2, 118, 120] ] },
  };
  function sprite(n, a, esc, rot, ancho) {
    if (n === "tablon") { const d = document.createElement("div"); d.className = "obj obj-tablon"; Object.assign(d.style, { width: ancho + "px", height: "18px", background: `url(${S.tablon().url}) 0 0/48px 18px repeat-x`, imageRendering: "pixelated" }); return d; }
    const s = S[n](...a); const i = new Image(); i.src = s.url; i.className = "obj obj-" + n;
    Object.assign(i.style, { width: s.w * esc + "px", height: s.h * esc + "px", transform: rot ? `rotate(${rot}deg)` : "" });
    return i;
  }
  function armarHero(tipo) {
    const h = HERO[tipo]; if (!h) return;
    const z = document.createElement("div"); z.className = "hero"; z.setAttribute("aria-hidden", "true"); z.style.height = h.alto + "px";
    const in_ = document.createElement("div"); in_.className = "hero-in"; z.appendChild(in_);
    if (h.piso) { const f = document.createElement("div"); f.className = "piso"; f.style.top = h.piso + "px"; in_.appendChild(f); }
    h.items.forEach(([n, a, esc, l, t, rot, ancho]) => { const o = sprite(n, a, esc, rot, ancho); o.style.left = l + "px"; o.style.top = t + "px"; in_.appendChild(o); });
    document.body.prepend(z);
  }
  function armar() {
    const tipo = document.documentElement.dataset.escena; if (!tipo) return;
    const e = document.createElement("div"); e.className = "escena"; e.setAttribute("aria-hidden", "true");
    ESC[tipo].forEach(([n, a, esc, l, t, rot]) => {
      const s = S[n](...a); const i = new Image(); i.src = s.url; i.className = "obj obj-" + n;
      Object.assign(i.style, { left: l, top: t, width: s.w * esc + "px", height: s.h * esc + "px", transform: rot ? `rotate(${rot}deg)` : "" });
      e.appendChild(i);
    });
    document.body.prepend(e);
    armarHero(tipo);
    const t = S.tablon().url; document.documentElement.style.setProperty("--tablon", `url(${t})`);
    document.querySelectorAll(".logo-tele").forEach(i => i.src = S.icono().url);
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", armar) : armar();
})();
