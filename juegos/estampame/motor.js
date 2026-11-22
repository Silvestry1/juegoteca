/* Motor de «Estampame esta»: cada uno dibuja y escribe frases, se reparten mezcladas, cada uno arma una remera
   con un dibujo y una frase ajenos, y las remeras se enfrentan de a dos en un torneo que se vota desde los celus.
   Sin dependencias: lo usa el celu que arma la partida (aplica las reglas) y se prueba con Node.
   Los dibujos viajan aparte como imagen (G.imgs[id]); la vista solo lleva sus ids. */
(function (raiz) {
  const LARGOS = { // dibujos y frases que hace cada uno; tamaño de la mano para armar
    corta: { dib: 1, fra: 2, manoDib: 2, manoFra: 3 },
    normal: { dib: 2, fra: 3, manoDib: 2, manoFra: 3 },
    larga: { dib: 3, fra: 4, manoDib: 3, manoFra: 4 }
  };
  const RITMOS = { // segundos por etapa; null = sin reloj
    tranqui: { dib: null, fra: null, arm: null, voto: null, res: null },
    normal: { dib: 90, fra: 75, arm: 60, voto: 25, res: 9 },
    picante: { dib: 55, fra: 45, arm: 40, voto: 14, res: 7 }
  };
  const VITRINA = 8; // con más remeras que esto, primero se vota en la vitrina y pasan estas al torneo
  const COLORES = ["#f4f1ea", "#1d1d22", "#8d939c", "#d8322f", "#1f4fa8", "#2f8f4e", "#f2c230", "#ff8fb1", "#6a3fb5", "#ff7a1a"];

  const mezclar = (a, rnd) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const azar = (a, rnd) => a[Math.floor(rnd() * a.length)];

  function nueva(cfg, jugadores, opc = {}) {
    const G = {
      cfg: { largo: LARGOS[cfg.largo] ? cfg.largo : "normal", ritmo: RITMOS[cfg.ritmo] ? cfg.ritmo : "normal", consignas: cfg.consignas || "libre", contenido: cfg.contenido || "atp" },
      jug: jugadores.map(j => ({ id: j.id, nombre: j.nombre })),
      puntos: {}, ronda: 0, seq: 0, imgs: {}, n: 0
    };
    G.jug.forEach(j => G.puntos[j.id] = 0);
    arrancarRonda(G, opc);
    return G;
  }
  const L = G => LARGOS[G.cfg.largo];
  const nid = (G, p) => p + (++G.n).toString(36);

  function arrancarRonda(G, opc = {}) {
    const rnd = opc.rnd || Math.random, B = opc.banco || {};
    G.ronda++; G.fase = "dibujo";
    G.dib = []; G.fra = []; G.manos = {}; G.rem = []; G.torneo = null; G.vitrina = null; G.imgs = {};
    G.consignas = {};
    const lista = G.cfg.consignas === "libre" ? null : consignasPara(G, B, rnd);
    G.jug.forEach(j => G.consignas[j.id] = lista ? Array.from({ length: L(G).dib }, () => lista.pop() || "lo que quieras") : null);
    G.seq++;
  }
  function consignasPara(G, B, rnd) {
    const ad = G.cfg.contenido !== "atp", soloAd = G.cfg.contenido === "adultos";
    const pick = (atp, adu) => mezclar([...(soloAd ? [] : atp || []), ...(ad ? adu || [] : [])], rnd);
    if (G.cfg.consignas === "dificil") {
      const q = pick(B.quienes, B.quienesAdultos), h = pick(B.haciendo, B.haciendoAdultos);
      return q.map((x, i) => x + " " + (h[i % Math.max(1, h.length)] || "")).filter(Boolean);
    }
    return pick(B.consignas, B.consignasAdultos);
  }

  const de = (arr, id) => arr.find(x => x.id === id);
  const nombre = (G, id) => (de(G.jug, id) || {}).nombre || "La casa";

  function sumar(G, id, nombreJ) { // alguien que llega con la partida empezada
    if (de(G.jug, id)) return;
    G.jug.push({ id, nombre: nombreJ }); G.puntos[id] = G.puntos[id] || 0;
    G.consignas[id] = null; G.seq++;
  }

  // ---- cuánto le falta a cada uno en la etapa actual ----
  function hechos(G, id) {
    if (G.fase === "dibujo") return G.dib.filter(d => d.de === id).length;
    if (G.fase === "frases") return G.fra.filter(f => f.de === id).length;
    if (G.fase === "armado") return G.rem.some(r => r.de === id) ? 1 : 0;
    return 0;
  }
  function meta(G, id) {
    if (G.fase === "dibujo") return L(G).dib;
    if (G.fase === "frases") return L(G).fra;
    if (G.fase === "armado") return G.manos[id] ? 1 : 0;
    return 0;
  }
  const listo = (G, id) => hechos(G, id) >= meta(G, id);

  function pendientes(G, presentes) { // ids de los presentes que todavía tienen que hacer algo
    const P = presentes || G.jug.map(j => j.id);
    if (G.fase === "duelo") { const d = dueloActual(G); return d && d.estado === "votar" ? elegibles(G, P).filter(id => !(id in d.votos)) : []; }
    if (G.fase === "vitrina") return G.vitrina.estado === "votar" ? P.filter(id => de(G.jug, id) && !(id in G.vitrina.votos)) : [];
    if (G.fase === "podio") return [];
    return P.filter(id => de(G.jug, id) && !listo(G, id));
  }

  // ---- acciones de los jugadores ----
  function accion(G, id, a, opc = {}) {
    if (!a || !de(G.jug, id)) return "No estás en la partida";
    if (a.t === "dib") {
      if (G.fase !== "dibujo") return "Ya se terminó el tiempo de dibujar";
      if (listo(G, id)) return "Ya mandaste todos tus dibujos";
      if (typeof a.img !== "string" || !/^data:image\/(png|webp|jpeg);base64,/.test(a.img) || a.img.length > 400000) return "El dibujo no llegó bien";
      const k = hechos(G, id), d = { id: nid(G, "d"), de: id, consigna: (G.consignas[id] || [])[k] || null };
      G.dib.push(d); G.imgs[d.id] = a.img; G.seq++; return null;
    }
    if (a.t === "fra") {
      if (G.fase !== "frases") return "No es momento de frases";
      if (listo(G, id)) return "Ya mandaste todas tus frases";
      const txt = limpiar(a.txt);
      if (!txt) return "Escribí algo";
      if (G.fra.some(f => f.de === id && f.txt.toLowerCase() === txt.toLowerCase())) return "Esa ya la mandaste";
      G.fra.push({ id: nid(G, "f"), de: id, txt }); G.seq++; return null;
    }
    if (a.t === "rem") {
      if (G.fase !== "armado") return "No es momento de armar";
      const m = G.manos[id]; if (!m) return "No tenés piezas para armar esta vez";
      if (G.rem.some(r => r.de === id)) return "Ya armaste tu remera";
      if (!m.dib.includes(a.dib) || !m.fra.includes(a.fra)) return "Elegí un dibujo y una frase de tu mano";
      G.rem.push({ id: nid(G, "r"), de: id, dib: a.dib, fra: a.fra, color: COLORES.includes(a.color) ? a.color : COLORES[0], pos: a.pos === "arriba" ? "arriba" : "abajo" });
      G.seq++; return null;
    }
    if (a.t === "vitrina") {
      if (G.fase !== "vitrina" || G.vitrina.estado !== "votar") return "La votación ya cerró";
      const r = remDe(G, a.rem); if (!r) return "Esa remera no está";
      if (r.de === id) return "La tuya no la podés votar";
      G.vitrina.votos[id] = r.id; G.seq++; return null;
    }
    if (a.t === "voto") {
      if (G.fase !== "duelo") return "No hay votación";
      const d = dueloActual(G); if (!d || d.estado !== "votar") return "La votación ya cerró";
      if (a.lado !== "a" && a.lado !== "b") return "Votá una de las dos";
      if (!elegibles(G, G.jug.map(j => j.id)).includes(id)) return "No podés votar en un duelo donde está tu remera";
      d.votos[id] = a.lado; G.seq++; return null;
    }
    return "No entiendo esa jugada";
  }
  const limpiar = t => String(t || "").replace(/\s+/g, " ").trim().slice(0, 70);

  // ---- pasar de etapa (lo llama el anfitrión: cuando todos están listos, cuando vence el reloj o con «Seguir sin esperar») ----
  function avanzar(G, opc = {}) {
    const rnd = opc.rnd || Math.random, B = opc.banco || {};
    if (G.fase === "dibujo") { G.fase = "frases"; G.seq++; return; }
    if (G.fase === "frases") { completarFrases(G, B, rnd); repartirManos(G, rnd); G.fase = "armado"; G.seq++; return; }
    if (G.fase === "armado") {
      completarRemeras(G, rnd);
      if (G.rem.length > VITRINA) { G.vitrina = { votos: {}, estado: "votar", orden: mezclar(G.rem.map(r => r.id), rnd) }; G.fase = "vitrina"; G.seq++; return; }
      armarTorneo(G, rnd); G.fase = G.torneo ? "duelo" : "podio"; if (!G.torneo) cerrarPodio(G); G.seq++; return;
    }
    if (G.fase === "vitrina") {
      const V = G.vitrina;
      if (V.estado === "votar") { cerrarVitrina(G, rnd); G.seq++; return; }
      armarTorneo(G, rnd, V.pasan); G.fase = "duelo"; G.seq++; return;
    }
    if (G.fase === "duelo") {
      const d = dueloActual(G);
      if (d.estado === "votar") { cerrarDuelo(G, d, rnd); G.seq++; return; }
      siguienteDuelo(G); G.seq++; return;
    }
  }

  function completarFrases(G, B, rnd) { // si faltan frases, pone de la casa para que alcancen las manos
    const necesarias = G.jug.length * L(G).manoFra;
    if (G.fra.length >= Math.min(necesarias, G.jug.length * L(G).fra)) return;
    const casa = mezclar([...(G.cfg.contenido !== "adultos" ? B.frases || [] : []), ...(G.cfg.contenido !== "atp" ? B.frasesAdultos || [] : [])], rnd);
    while (G.fra.length < necesarias && casa.length) G.fra.push({ id: nid(G, "f"), de: null, txt: casa.pop() });
  }

  // Cada uno recibe dibujos y frases de otros: primero los que nadie recibió, después se repiten.
  function repartirManos(G, rnd) {
    const orden = mezclar(G.jug.map(j => j.id), rnd);
    const dar = (pool, cant, id, usados) => {
      const ajenos = mezclar(pool.filter(x => x.de !== id), rnd);
      const nuevos = ajenos.filter(x => !usados.has(x.id)), viejos = ajenos.filter(x => usados.has(x.id));
      let elegidos = [...nuevos, ...viejos].slice(0, cant);
      if (!elegidos.length) elegidos = mezclar(pool, rnd).slice(0, cant); // solo hay cosas suyas
      elegidos.forEach(x => usados.add(x.id));
      return elegidos.map(x => x.id);
    };
    const uD = new Set(), uF = new Set();
    G.manos = {};
    for (const id of orden) {
      const dib = dar(G.dib, L(G).manoDib, id, uD), fra = dar(G.fra, L(G).manoFra, id, uF);
      if (fra.length) G.manos[id] = { dib, fra };
    }
  }

  function completarRemeras(G, rnd) { // el que no armó a tiempo: se arma sola con lo que tenía
    for (const id of Object.keys(G.manos)) {
      if (G.rem.some(r => r.de === id)) continue;
      const m = G.manos[id];
      G.rem.push({ id: nid(G, "r"), de: id, dib: m.dib.length ? azar(m.dib, rnd) : null, fra: azar(m.fra, rnd), color: azar(COLORES, rnd), pos: rnd() < .5 ? "arriba" : "abajo", sola: true });
    }
  }
  // remeras sin dibujo (nadie dibujó) se aceptan: la frase sola.

  function armarTorneo(G, rnd, ids) {
    ids = ids || G.rem.map(r => r.id);
    if (ids.length < 2) { G.torneo = null; return; }
    G.torneo = { rondas: [], r: 0, i: 0 };
    armarRondaTorneo(G, mezclar(ids, rnd));
  }
  function cerrarVitrina(G, rnd) {
    const V = G.vitrina, cuenta = {};
    G.rem.forEach(r => cuenta[r.id] = 0);
    Object.values(V.votos).forEach(rid => { if (rid in cuenta) cuenta[rid]++; });
    const azarDe = {}; G.rem.forEach(r => azarDe[r.id] = rnd());
    const orden = G.rem.map(r => r.id).sort((a, b) => cuenta[b] - cuenta[a] || azarDe[a] - azarDe[b]);
    V.cuenta = cuenta; V.pasan = orden.slice(0, VITRINA); V.estado = "res";
    G.rem.forEach(r => { const c = creditos(G, r), n = cuenta[r.id]; dar(G, c.armo, n * 50); dar(G, c.dibujo, n * 25); dar(G, c.frase, n * 25); });
  }
  function armarRondaTorneo(G, ids) {
    const T = G.torneo, duelos = [];
    for (let k = 0; k + 1 < ids.length; k += 2) duelos.push({ a: ids[k], b: ids[k + 1], votos: {}, estado: "votar" });
    const libre = ids.length % 2 ? ids[ids.length - 1] : null;
    T.rondas.push({ duelos, libre }); T.r = T.rondas.length - 1; T.i = 0;
  }
  const dueloActual = G => G.torneo && G.torneo.rondas[G.torneo.r] ? G.torneo.rondas[G.torneo.r].duelos[G.torneo.i] : null;
  const remDe = (G, id) => de(G.rem, id);

  function elegibles(G, presentes) {
    const d = dueloActual(G); if (!d) return [];
    const ra = remDe(G, d.a), rb = remDe(G, d.b);
    return presentes.filter(id => de(G.jug, id) && id !== ra.de && id !== rb.de);
  }

  function creditos(G, r) {
    const d = r.dib ? de(G.dib, r.dib) : null, f = de(G.fra, r.fra);
    return { armo: r.de, dibujo: d ? d.de : null, frase: f ? f.de : null };
  }
  function dar(G, id, n) { if (id && id in G.puntos) G.puntos[id] += n; }
  function premiar(G, r, porVoto, extraArmo) {
    const c = creditos(G, r);
    dar(G, c.armo, porVoto * 100 + (extraArmo || 0));
    dar(G, c.dibujo, porVoto * 50 + (extraArmo || 0) / 2);
    dar(G, c.frase, porVoto * 50 + (extraArmo || 0) / 2);
  }

  function cerrarDuelo(G, d, rnd) {
    const va = Object.values(d.votos).filter(v => v === "a").length, vb = Object.values(d.votos).filter(v => v === "b").length;
    d.va = va; d.vb = vb; d.estado = "res";
    d.empate = va === vb;
    d.gana = va > vb ? "a" : vb > va ? "b" : (rnd() < .5 ? "a" : "b");
    premiar(G, remDe(G, d.a), va, d.gana === "a" ? 100 : 0);
    premiar(G, remDe(G, d.b), vb, d.gana === "b" ? 100 : 0);
  }
  function siguienteDuelo(G) {
    const T = G.torneo, R = T.rondas[T.r];
    if (T.i + 1 < R.duelos.length) { T.i++; return; }
    const ganadoras = R.duelos.map(d => d[d.gana]);
    if (R.libre) ganadoras.push(R.libre);
    if (ganadoras.length === 1) { G.campeona = ganadoras[0]; premiar(G, remDe(G, G.campeona), 0, 300); G.fase = "podio"; cerrarPodio(G); return; }
    armarRondaTorneo(G, ganadoras);
  }
  function cerrarPodio(G) { if (!G.campeona && G.rem.length === 1) G.campeona = G.rem[0].id; }

  function otraRonda(G, opc) { G.campeona = null; arrancarRonda(G, opc); }

  // ---- lo que ve cada uno ----
  function remeraVista(G, r, revelar) {
    if (!r) return null;
    const f = de(G.fra, r.fra), d = r.dib ? de(G.dib, r.dib) : null;
    const v = { id: r.id, dib: r.dib, txt: f ? f.txt : "", color: r.color, pos: r.pos };
    if (revelar) { const c = creditos(G, r); v.cred = { armo: nombre(G, c.armo), dibujo: d ? nombre(G, c.dibujo) : null, frase: nombre(G, c.frase), consigna: d && d.consigna }; v.mia = c.armo; }
    return v;
  }
  function vista(G, id, presentes) {
    const P = presentes || G.jug.map(j => j.id);
    const v = {
      fase: G.fase, ronda: G.ronda, cfg: G.cfg, seq: G.seq, yo: id,
      jug: G.jug.map(j => ({ id: j.id, nombre: j.nombre, pts: G.puntos[j.id] || 0, listo: G.fase !== "duelo" && G.fase !== "podio" ? listo(G, j.id) : null, on: P.includes(j.id) })),
      faltan: pendientes(G, P).length, imgs: []
    };
    if (G.fase === "dibujo") { v.meta = meta(G, id); v.hechos = hechos(G, id); v.consigna = (G.consignas[id] || [])[v.hechos] || null; }
    if (G.fase === "frases") { v.meta = meta(G, id); v.hechos = hechos(G, id); v.mias = G.fra.filter(f => f.de === id).map(f => f.txt); }
    if (G.fase === "armado") {
      const m = G.manos[id];
      v.mano = m ? { dib: m.dib, fra: m.fra.map(fid => ({ id: fid, txt: de(G.fra, fid).txt })) } : null;
      const r = G.rem.find(x => x.de === id); v.mia = r ? remeraVista(G, r) : null;
      if (m) v.imgs.push(...m.dib);
      v.colores = COLORES;
    }
    if (G.fase === "duelo") {
      const T = G.torneo, R = T.rondas[T.r], d = dueloActual(G), res = d.estado === "res";
      const quedan = R.duelos.length * 2 + (R.libre ? 1 : 0);
      v.duelo = {
        etapa: quedan === 2 ? "La final" : quedan <= 4 ? "Semifinal" : "Ronda " + (T.r + 1),
        n: T.i + 1, de: R.duelos.length, estado: d.estado,
        a: remeraVista(G, remDe(G, d.a), res), b: remeraVista(G, remDe(G, d.b), res),
        puedo: elegibles(G, G.jug.map(j => j.id)).includes(id), miVoto: d.votos[id] || null,
        votaron: Object.keys(d.votos).length, votantes: elegibles(G, P).length,
        libre: R.libre && T.i === R.duelos.length - 1 ? true : false
      };
      if (res) Object.assign(v.duelo, { va: d.va, vb: d.vb, gana: d.gana, empate: d.empate, quienes: { a: Object.keys(d.votos).filter(k => d.votos[k] === "a").map(k => nombre(G, k)), b: Object.keys(d.votos).filter(k => d.votos[k] === "b").map(k => nombre(G, k)) } });
      [d.a, d.b].forEach(rid => { const r = remDe(G, rid); if (r.dib) v.imgs.push(r.dib); });
    }
    if (G.fase === "vitrina") {
      const V = G.vitrina, res = V.estado === "res";
      v.vitrina = {
        estado: V.estado, cupo: VITRINA, miVoto: V.votos[id] || null,
        votaron: Object.keys(V.votos).length, votantes: P.filter(x => de(G.jug, x)).length,
        rems: V.orden.map(rid => { const r = remDe(G, rid), rv = remeraVista(G, r); rv.mia = r.de === id; if (res) { rv.votos = V.cuenta[rid]; rv.pasa = V.pasan.includes(rid); } return rv; })
      };
      if (res) v.vitrina.rems.sort((a, b) => (b.pasa - a.pasa) || b.votos - a.votos);
      G.rem.forEach(r => { if (r.dib) v.imgs.push(r.dib); });
    }
    if (G.fase === "podio") {
      v.campeona = remeraVista(G, remDe(G, G.campeona), true);
      v.galeria = G.rem.map(r => remeraVista(G, r, true));
      G.rem.forEach(r => { if (r.dib) v.imgs.push(r.dib); });
    }
    return v;
  }

  const Motor = { VITRINA, LARGOS, RITMOS, COLORES, nueva, accion, avanzar, pendientes, vista, otraRonda, sumar, listo, dueloActual, creditos };
  if (typeof module !== "undefined" && module.exports) module.exports = Motor; else raiz.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
