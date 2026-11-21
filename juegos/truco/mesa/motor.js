/* Motor del truco argentino para 2, 4 o 6 jugadores (equipos alternados: asiento par = equipo 0, impar = equipo 1).
   Sin dependencias: lo usa el celu que arma la mesa (es el que reparte y controla las reglas) y se puede probar en Node.
   Reglas: envido / real envido / falta envido, truco / retruco / vale cuatro, flor opcional (contraflor y al resto),
   partida a 15 o a 30 (malas y buenas). */
(function (raiz) {
  const PALOS = ["espada", "basto", "oro", "copa"];
  const NUMS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const MAZO = [];
  for (const p of PALOS) for (const n of NUMS) MAZO.push({ n, p });

  function poder(c) {
    if (c.n === 1 && c.p === "espada") return 14;
    if (c.n === 1 && c.p === "basto") return 13;
    if (c.n === 7 && c.p === "espada") return 12;
    if (c.n === 7 && c.p === "oro") return 11;
    return { 3: 10, 2: 9, 1: 8, 12: 7, 11: 6, 10: 5, 7: 4, 6: 3, 5: 2, 4: 1 }[c.n];
  }
  const valEnv = c => (c.n >= 10 ? 0 : c.n);
  function envido(m) {
    let best = 0;
    for (let i = 0; i < m.length; i++) {
      best = Math.max(best, valEnv(m[i]));
      for (let j = i + 1; j < m.length; j++) if (m[i].p === m[j].p) best = Math.max(best, 20 + valEnv(m[i]) + valEnv(m[j]));
    }
    return best;
  }
  const tieneFlor = m => m.length === 3 && m[0].p === m[1].p && m[1].p === m[2].p;
  const puntosFlor = m => 20 + m.reduce((a, c) => a + valEnv(c), 0);

  const equipo = s => s % 2;
  const otro = t => 1 - t;

  function mezclar(rnd) {
    const a = MAZO.map(c => ({ ...c }));
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function nuevaPartida(cfg) {
    const G = { cfg: { n: cfg.n || 2, meta: cfg.meta || 30, flor: !!cfg.flor }, pts: [0, 0], mano: cfg.mano || 0, nMano: 0, ganador: null, ganadas: cfg.ganadas || [0, 0], seq: 0, h: null };
    repartir(G, cfg.rnd);
    return G;
  }

  function repartir(G, rnd) {
    rnd = rnd || Math.random;
    const n = G.cfg.n, mazo = mezclar(rnd);
    const cartas = [];
    for (let s = 0; s < n; s++) cartas.push([]);
    for (let k = 0; k < 3; k++) for (let i = 0; i < n; i++) cartas[(G.mano + i) % n].push(mazo.pop());
    G.nMano++;
    G.h = {
      cartas, enMano: cartas.map(m => m.map((c, i) => i)), // índices de las cartas que quedan
      bazas: [], turno: G.mano,
      truco: { nivel: 1, quiero: null, pend: null },
      env: { estado: "abierto", cadena: [], por: null, pend: false, res: null },
      flor: { pend: null, hecha: false, cantada: cartas.map(() => false), res: null },
      dichos: [], fin: null
    };
  }

  // ---------- consultas ----------
  const nb = G => G.h.bazas.filter(b => b.gan !== null).length; // bazas terminadas
  function bazaActual(G) {
    const h = G.h, u = h.bazas[h.bazas.length - 1];
    return u && u.gan === null ? u : null;
  }
  const jugoPrimera = (G, s) => !!(G.h.bazas[0] && G.h.bazas[0].jug.some(j => j.s === s));
  const florDe = (G, s) => G.cfg.flor && tieneFlor(G.h.cartas[s]);
  const equipoTieneFlor = (G, t) => G.h.cartas.some((m, s) => equipo(s) === t && florDe(G, s));

  function puedeEnvido(G, s) {
    const h = G.h;
    return h.env.estado === "abierto" && !h.flor.hecha && !h.flor.pend && nb(G) === 0 && !jugoPrimera(G, s) &&
      h.truco.nivel === 1 && !florDe(G, s);
  }
  function puedeFlor(G, s) {
    const h = G.h;
    return florDe(G, s) && !h.flor.cantada[s] && !h.flor.hecha && !h.flor.pend && nb(G) === 0 && !jugoPrimera(G, s) && h.env.estado !== "jugado";
  }
  function subidasEnvido(c) {
    const u = c[c.length - 1], e = c.filter(x => x === "E").length;
    if (u === "E") return e === 1 ? ["E", "R", "F"] : ["R", "F"];
    if (u === "R") return ["F"];
    return [];
  }

  // Quién tiene que actuar: {equipo} si responde un equipo, {asiento} si juega uno
  function espera(G) {
    const h = G.h;
    if (G.ganador !== null || h.fin) return null;
    if (h.flor.pend) return { equipo: otro(equipo(h.flor.pend.por)), que: "flor" };
    if (h.env.pend) return { equipo: otro(equipo(h.env.por)), que: "envido" };
    if (h.truco.pend) return { equipo: otro(equipo(h.truco.pend.por)), que: "truco" };
    return { asiento: h.turno, que: "jugar" };
  }

  // Acciones posibles para el asiento s
  function opciones(G, s) {
    const h = G.h, T = equipo(s), o = [];
    if (G.ganador !== null) return ["otra"];
    if (h.fin) return ["sig"];
    const e = espera(G);
    if (e.que === "flor") {
      if (T === e.equipo) o.push("florAchico", "florContra", "florResto");
      return o;
    }
    if (e.que === "envido") {
      if (T !== e.equipo) return o;
      o.push("qEnv", "nqEnv");
      for (const k of subidasEnvido(h.env.cadena)) o.push("env" + k);
      if (puedeFlor(G, s)) o.push("flor");
      return o;
    }
    if (e.que === "truco") {
      if (T !== e.equipo) return o;
      o.push("qTruco", "nqTruco");
      if (h.truco.pend.nivel < 4) o.push("truco");
      if (puedeEnvido(G, s)) o.push("envE", "envR", "envF");
      if (puedeFlor(G, s)) o.push("flor");
      return o;
    }
    if (s !== h.turno) return o;
    o.push("jugar");
    if (puedeEnvido(G, s)) o.push("envE", "envR", "envF");
    if (puedeFlor(G, s)) o.push("flor");
    if (h.truco.nivel < 4 && (h.truco.quiero === null || h.truco.quiero === T)) o.push("truco");
    o.push("mazo");
    return o;
  }

  // ---------- puntos ----------
  function falta(G, gan) {
    const { meta } = G.cfg;
    if (meta === 30 && G.pts[0] < 15 && G.pts[1] < 15) return meta - G.pts[gan]; // en malas, la falta gana la partida
    return meta - Math.max(G.pts[0], G.pts[1]);
  }
  function sumar(G, t, n, motivo) {
    if (G.ganador !== null || n <= 0) return;
    G.pts[t] = Math.min(G.cfg.meta, G.pts[t] + n);
    (G.h.anotes = G.h.anotes || []).push({ t, n, motivo });
    if (G.pts[t] >= G.cfg.meta) {
      G.ganador = t; G.ganadas[t]++;
      if (!G.h.fin) G.h.fin = { gan: t, pts: n, motivo: motivo + " y ganó la partida" };
    }
  }
  const decir = (G, s, txt) => G.h.dichos.push({ s, txt, k: ++G.seq });

  const NOMBRE_ENV = { E: "Envido", R: "Real envido", F: "Falta envido" };
  const NOMBRE_TRUCO = { 2: "¡Truco!", 3: "¡Quiero retruco!", 4: "¡Quiero vale cuatro!" };

  // ---------- resolución de bazas ----------
  function ganadorMano(G) {
    const res = G.h.bazas.filter(b => b.gan !== null).map(b => b.gan);
    const w = [0, 0]; res.forEach(r => { if (r !== "P") w[r]++; });
    if (w[0] >= 2) return 0;
    if (w[1] >= 2) return 1;
    if (res.length >= 2) {
      if (res[0] === "P" && res[1] !== "P") return res[1];
      if (res[0] !== "P" && res[1] === "P") return res[0];
    }
    if (res.length === 3) {
      if (res[2] === "P") return res[0] !== "P" ? res[0] : res[1] !== "P" ? res[1] : equipo(G.mano);
      return res[2];
    }
    return null;
  }
  function cerrarBaza(G, b) {
    let max = -1; b.jug.forEach(j => max = Math.max(max, poder(G.h.cartas[j.s][j.i])));
    const top = b.jug.filter(j => poder(G.h.cartas[j.s][j.i]) === max);
    const eqs = new Set(top.map(j => equipo(j.s)));
    b.gan = eqs.size > 1 ? "P" : equipo(top[0].s);
    b.top = top[0].s;
    G.h.turno = top[0].s; // después de parda arranca el que empardó primero
  }
  function terminarMano(G, gan, pts, motivo) {
    if (G.h.fin) return;
    G.h.fin = { gan, pts, motivo };
    sumar(G, gan, pts, motivo);
  }

  // ---------- envido ----------
  function resolverEnvido(G, cantoPor) {
    const h = G.h, n = G.cfg.n, decl = [];
    let best = null;
    for (let i = 0; i < n; i++) {
      const s = (G.mano + i) % n, v = envido(h.cartas[s]);
      if (!best) { best = { s, v }; decl.push({ s, v }); continue; }
      if (equipo(s) === equipo(best.s)) continue;
      if (v > best.v) { best = { s, v }; decl.push({ s, v }); } else decl.push({ s, buenas: true });
    }
    return { gan: equipo(best.s), best, decl };
  }
  function valorEnvido(G, cadena, gan) {
    if (cadena[cadena.length - 1] === "F") return falta(G, gan);
    return cadena.reduce((a, k) => a + (k === "E" ? 2 : 3), 0);
  }
  function noQuieroEnvido(cadena) {
    if (cadena.length === 1) return 1;
    return cadena.slice(0, -1).reduce((a, k) => a + (k === "E" ? 2 : 3), 0);
  }

  // ---------- flor ----------
  function florDelEquipo(G, t) {
    let best = null, cuantas = 0;
    G.h.cartas.forEach((m, s) => { if (equipo(s) === t && florDe(G, s)) { cuantas++; const v = puntosFlor(m); if (!best || v > best.v) best = { s, v }; } });
    return { best, cuantas };
  }
  function cantarFlor(G, s) {
    const h = G.h, T = equipo(s);
    G.h.cartas.forEach((m, k) => { if (equipo(k) === T && florDe(G, k)) h.flor.cantada[k] = true; });
    decir(G, s, "¡Flor!");
    h.env.pend = false; h.env.cadena = []; h.env.estado = "cerrado";
    if (equipoTieneFlor(G, otro(T))) { h.flor.pend = { por: s }; return; }
    const { cuantas } = florDelEquipo(G, T);
    h.flor.hecha = true;
    h.flor.res = { gan: T, pts: 3 * cuantas, txt: cuantas > 1 ? cuantas + " flores" : "Flor" };
    sumar(G, T, 3 * cuantas, h.flor.res.txt);
  }
  function responderFlor(G, s, k) {
    const h = G.h, T = equipo(s), canto = equipo(h.flor.pend.por);
    G.h.cartas.forEach((m, x) => { if (equipo(x) === T && florDe(G, x)) h.flor.cantada[x] = true; });
    h.flor.pend = null; h.flor.hecha = true;
    if (k === "achico") {
      decir(G, s, "Con flor me achico");
      h.flor.res = { gan: canto, pts: 4, txt: "Flor (se achicaron)" };
      sumar(G, canto, 4, "Flor");
      return;
    }
    decir(G, s, k === "contra" ? "¡Contraflor!" : "¡Contraflor al resto!");
    const a = florDelEquipo(G, 0).best, b = florDelEquipo(G, 1).best;
    let gan;
    if (a.v !== b.v) gan = a.v > b.v ? 0 : 1;
    else { // empate: gana el más cerca de la mano
      const d = s2 => (s2 - G.mano + G.cfg.n) % G.cfg.n;
      gan = d(a.s) < d(b.s) ? 0 : 1;
    }
    const pts = k === "contra" ? 6 : falta(G, gan);
    h.flor.res = { gan, pts, txt: k === "contra" ? "Contraflor" : "Contraflor al resto", decl: [{ s: a.s, v: a.v }, { s: b.s, v: b.v }] };
    sumar(G, gan, pts, h.flor.res.txt);
  }

  // ---------- aplicar una acción ----------
  // a = {t:"jugar", i} | {t:"envE"|"envR"|"envF"|"qEnv"|"nqEnv"|"flor"|"florAchico"|"florContra"|"florResto"|"truco"|"qTruco"|"nqTruco"|"mazo"|"sig"|"otra"}
  // Devuelve null si salió bien, o un texto con el error.
  function accion(G, s, a, rnd) {
    const ops = opciones(G, s);
    if (!ops.includes(a.t)) return "Ahora no podés hacer eso";
    const h = G.h, T = equipo(s);
    switch (a.t) {
      case "jugar": {
        const pos = h.enMano[s].indexOf(a.i);
        if (pos < 0) return "Esa carta ya la jugaste";
        h.enMano[s].splice(pos, 1);
        let b = bazaActual(G);
        if (!b) { b = { jug: [], lider: s, gan: null }; h.bazas.push(b); }
        b.jug.push({ s, i: a.i });
        if (b.jug.length === G.cfg.n) {
          cerrarBaza(G, b);
          const g = ganadorMano(G);
          if (g !== null) terminarMano(G, g, h.truco.nivel, h.truco.nivel === 1 ? "Mano" : { 2: "Truco", 3: "Retruco", 4: "Vale cuatro" }[h.truco.nivel]);
        } else h.turno = (s + 1) % G.cfg.n;
        return null;
      }
      case "envE": case "envR": case "envF": {
        const k = a.t.slice(3);
        if (h.env.pend && h.env.cadena.length) {
          if (h.env.cadena[h.env.cadena.length - 1] === "E" && k === "E") decir(G, s, "¡Envido envido!");
          else decir(G, s, "¡" + NOMBRE_ENV[k] + "!");
        } else decir(G, s, "¡" + NOMBRE_ENV[k] + "!");
        h.env.cadena.push(k); h.env.por = s; h.env.pend = true;
        return null;
      }
      case "qEnv": {
        decir(G, s, "Quiero");
        const r = resolverEnvido(G);
        const pts = valorEnvido(G, h.env.cadena, r.gan);
        h.env.pend = false; h.env.estado = "jugado";
        h.env.res = { gan: r.gan, pts, decl: r.decl, cadena: h.env.cadena.slice(), querido: true };
        r.decl.forEach(d => decir(G, d.s, d.buenas ? "Son buenas" : String(d.v)));
        sumar(G, r.gan, pts, "Envido");
        return null;
      }
      case "nqEnv": {
        decir(G, s, "No quiero");
        const pts = noQuieroEnvido(h.env.cadena), gan = equipo(h.env.por);
        h.env.pend = false; h.env.estado = "jugado";
        h.env.res = { gan, pts, cadena: h.env.cadena.slice(), querido: false };
        sumar(G, gan, pts, "Envido no querido");
        return null;
      }
      case "flor": cantarFlor(G, s); return null;
      case "florAchico": responderFlor(G, s, "achico"); return null;
      case "florContra": responderFlor(G, s, "contra"); return null;
      case "florResto": responderFlor(G, s, "resto"); return null;
      case "truco": {
        if (h.truco.pend) { h.truco.nivel = h.truco.pend.nivel; h.truco.quiero = T; } // subir es querer
        const nivel = h.truco.nivel + 1;
        h.truco.pend = { nivel, por: s };
        if (h.truco.nivel >= 2 && h.env.estado === "abierto") h.env.estado = "cerrado";
        decir(G, s, NOMBRE_TRUCO[nivel]);
        return null;
      }
      case "qTruco": {
        decir(G, s, "Quiero");
        h.truco.nivel = h.truco.pend.nivel; h.truco.quiero = T; h.truco.pend = null;
        if (h.env.estado === "abierto") h.env.estado = "cerrado";
        return null;
      }
      case "nqTruco": {
        decir(G, s, "No quiero");
        const p = h.truco.pend; h.truco.pend = null;
        terminarMano(G, equipo(p.por), p.nivel - 1, { 2: "Truco", 3: "Retruco", 4: "Vale cuatro" }[p.nivel] + " no querido");
        return null;
      }
      case "mazo": {
        decir(G, s, "Me voy al mazo");
        terminarMano(G, otro(T), h.truco.nivel, "Se fueron al mazo");
        return null;
      }
      case "sig": {
        G.mano = (G.mano + 1) % G.cfg.n;
        repartir(G, rnd);
        return null;
      }
      case "otra": {
        G.pts = [0, 0]; G.ganador = null; G.mano = (G.mano + 1) % G.cfg.n;
        repartir(G, rnd);
        return null;
      }
    }
    return "Acción desconocida";
  }

  // Lo que ve el asiento s: sus cartas, cuántas tienen los demás, y todo lo jugado. Al terminar la mano se ven todas.
  function vista(G, s) {
    const h = G.h, ver = !!h.fin || G.ganador !== null;
    const carta = (k, i) => h.cartas[k][i];
    return {
      cfg: G.cfg, pts: G.pts, mano: G.mano, nMano: G.nMano, ganador: G.ganador, ganadas: G.ganadas, yo: s,
      miMano: s >= 0 ? h.enMano[s].map(i => ({ i, c: carta(s, i) })) : [],
      quedan: h.enMano.map(m => m.length),
      bazas: h.bazas.map(b => ({ gan: b.gan, top: b.top, jug: b.jug.map(j => ({ s: j.s, c: carta(j.s, j.i) })) })),
      turno: h.turno, espera: espera(G),
      truco: { nivel: h.truco.nivel, quiero: h.truco.quiero, pend: h.truco.pend },
      env: { estado: h.env.estado, cadena: h.env.cadena, pend: h.env.pend, por: h.env.por, res: h.env.res },
      flor: { pend: h.flor.pend, res: h.flor.res, hecha: h.flor.hecha },
      dichos: h.dichos.slice(-12), anotes: h.anotes || [], fin: h.fin,
      opciones: s >= 0 ? opciones(G, s) : [],
      misPuntos: s >= 0 ? { envido: envido(h.cartas[s]), flor: florDe(G, s) ? puntosFlor(h.cartas[s]) : null } : null,
      todas: ver ? h.cartas : null,
      faltan: [G.cfg.meta - G.pts[0], G.cfg.meta - G.pts[1]]
    };
  }

  const Motor = { MAZO, poder, envido, tieneFlor, puntosFlor, equipo, nuevaPartida, opciones, accion, vista, espera, ganadorMano, falta };
  if (typeof module !== "undefined" && module.exports) module.exports = Motor; else raiz.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
