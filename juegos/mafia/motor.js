/* Motor de «Mafia»: el juego de cartas diseñado por la autora del mazo (sus reglas, ver reglamento).
   La app no resuelve la noche ni la votación: reparte las cartas, muestra a cada uno su rol,
   y a la Jefa le da la mesa para marcar muertes, fantasmas y el final. Lo usa el celu de la Jefa
   (que arma la partida) y se prueba con Node. Sin dependencias. */
(function (raiz) {
  // ---------- roles ----------
  // bando: "pueblo" | "mafia" | "solo". img: archivo en cartas/.
  const ROLES = {
    mafia: {
      nombre: "Mafia", bando: "mafia", img: "mafia",
      carta: "Asesinen a todos.", lema: "que tu pandilla sea la última en morir",
      como: [
        "Sos de la Mafia. Ganan cuando son mayoría en la mesa.",
        "De noche, cuando la Jefa llama a la Mafia, abrís los ojos con tus compañeros. Se ponen de acuerdo con señas y le señalan a la Jefa a quién matan.",
        "Si señalan al Impostor, no muere: pasa a ser de la Mafia.",
        "De día hacete pasar por alguien del Pueblo y votá con cuidado."
      ]
    },
    policia: {
      nombre: "Policía", bando: "pueblo", img: "policia",
      carta: "Salí de noche a patrullar y encontrá a la Mafia.", lema: "cuidá tu identidad, los muertos no hablan",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche, cuando la Jefa llama a la Policía, abrís los ojos (con el otro policía, si hay dos). Se ponen de acuerdo con señas y señalan a alguien.",
        "La Jefa les contesta sí o no: si esa persona es de la Mafia o no. El Impostor no es Mafia.",
        "Ojo: si esa noche la Trabajadora sexual se acostó con un policía, la Jefa les miente.",
        "De día usá lo que sabés sin delatarte: si la Mafia descubre que sos policía, vas primero."
      ]
    },
    medico: {
      nombre: "Médico", bando: "pueblo", img: "medico",
      carta: "Salvá al pueblo de los balazos de la Mafia.", lema: "ojo con la sobredosis",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche, cuando te llama la Jefa, abrís los ojos y señalás a quién salvás de la Mafia esa noche.",
        "Sobredosis: si el Enfermero eligió a la misma persona esa noche, esa persona muere."
      ]
    },
    enfermero: {
      nombre: "Enfermero", bando: "pueblo", img: "enfermero",
      carta: "Salvá al pueblo de las locuras del carnicero.", lema: "ojo con la sobredosis",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche, cuando te llama la Jefa, abrís los ojos y señalás a quién salvás del Carnicero esa noche.",
        "Sobredosis: si el Médico eligió a la misma persona esa noche, esa persona muere."
      ]
    },
    carnicero: {
      nombre: "Carnicero", bando: "pueblo", img: "carnicero",
      carta: "Quitale la posibilidad de hablar o de votar a quien quieras.", lema: "cuidá a tus clientes del pueblo",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche, cuando te llama la Jefa, abrís los ojos, señalás a alguien y le mostrás qué le cortás:",
        "La lengua: al otro día no puede hablar. La mano: al otro día no puede votar.",
        "El Enfermero puede salvar a tu elegido."
      ]
    },
    trabajadora: {
      nombre: "Trabajadora sexual", bando: "pueblo", img: "trabajadora",
      carta: "Dejás sin efecto la habilidad de quien elijas a la noche.", lema: "acordate que sos del pueblo",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche sos la primera en despertarte (después de los Amantes, la primera noche). Señalás con quién te acostás.",
        "Esa persona pierde su habilidad esa noche. Si es la Médium, esa noche no llama a ningún muerto.",
        "Si te acostás con un policía, esa noche la Jefa le miente a la Policía."
      ]
    },
    medium: {
      nombre: "Médium", bando: "pueblo", img: "medium",
      carta: "Comunicate con los muertos durante la noche o invocá uno para que hable en el debate.", lema: "cuidado en quién confiás",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche, cuando te llama la Jefa, abrís los ojos y señalás a un muerto. Ese muerto puede hablar con mímica en la próxima votación.",
        "Un muerto por noche, siempre que estés viva y la Trabajadora sexual no se haya acostado con vos.",
        "Ojo: cada muerto tiene un fantasma. El bondadoso dice la verdad; el travieso miente."
      ]
    },
    amantes: {
      nombre: "Amante", bando: "pueblo", img: "amantes",
      carta: "Intenten llegar juntos hasta el final, si muere uno, mueren los dos.", lema: "y sí, hay amores que matan",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "La primera noche la Jefa despierta a los Amantes solos y se conocen. Tu pareja también aparece acá abajo.",
        "Si muere uno, mueren los dos.",
        "Tienen un chat secreto: mensajes cortos, y no podés mandar otro hasta que te contesten. Sigue abierto hasta el final, aunque mueran."
      ]
    },
    kamikaze: {
      nombre: "Kamikaze", bando: "pueblo", img: "kamikaze",
      carta: "Si morís, elegí a quién llevarte.", lema: "usá bien tu única bala",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche no te despertás.",
        "Cuando morís, de noche o en la votación, elegís a quién te llevás con vos. Siempre."
      ]
    },
    impostor: {
      nombre: "Impostor", bando: "solo", img: "impostor",
      carta: "Tu objetivo es que el pueblo piense que sos mafia. Si te votan, ganás y todos pierden. Si por la noche te mata el mafia, te convertís en uno de ellos.",
      lema: "que empiece el show",
      como: [
        "Jugás solo. Tu objetivo es que el Pueblo piense que sos de la Mafia.",
        "Si el Pueblo te vota, ganás vos y pierden todos.",
        "Si de noche te mata la Mafia, no morís: pasás a ser de la Mafia. Tu carta acá cambia sola.",
        "Si la Policía te señala, la Jefa le dice que no sos Mafia."
      ]
    },
    ladron: {
      nombre: "Ladrón", bando: "pueblo", img: "ladron",
      carta: "Al principio de la partida robá una carta: elegí quién querés ser.", lema: "ojo, estás dejando un personaje afuera",
      como: [
        "Al empezar ves las 2 cartas que sobraron del reparto y elegís una. Pasás a ser ese personaje, con su bando.",
        "Si entre las que sobraron hay una de Mafia, tenés que robar esa: sos de la Mafia y la Mafia no pierde a nadie.",
        "Tu carta de Ladrón y la otra quedan afuera."
      ]
    },
    pueblo: {
      nombre: "Pueblo", bando: "pueblo", img: "pueblo-guitarra",
      carta: "Tu poder yace en la democracia.", lema: "votá con cuidado",
      como: [
        "Sos del Pueblo. Ganás cuando no queda nadie de la Mafia.",
        "De noche no te despertás.",
        "Tu poder es el voto: escuchá, sospechá y votá con cuidado."
      ]
    }
  };
  const FANTASMAS = {
    bondadoso: {
      nombre: "Fantasma bondadoso", img: "fantasma-bondadoso", carta: "Volvé de la muerte y ayudá al pueblo.",
      como: ["Moriste, pero no te fuiste del todo.", "Si la Médium te llama, en la próxima votación podés hablar solo con mímica.", "Sos bondadoso: decí la verdad."]
    },
    travieso: {
      nombre: "Fantasma travieso", img: "fantasma-travieso", carta: "Volvé de la muerte y confundí al pueblo.",
      como: ["Moriste, pero no te fuiste del todo.", "Si la Médium te llama, en la próxima votación podés hablar solo con mímica.", "Sos travieso: mentí."]
    }
  };
  const JEFA = {
    nombre: "La Jefa", img: "jefa", carta: "Dirigí el juego.", lema: "que nada se te escape",
    como: [
      "Dirigís el juego y no jugás un rol. Sos la única que nunca cierra los ojos.",
      "De noche llamás a cada rol en orden. Cada uno te indica a quién mata, salva, cura, corta, acuesta, etc.",
      "A la mañana das el informe con las consecuencias, y marcás acá quién murió.",
      "A cada muerto le asignás un fantasma: el bondadoso dice la verdad, el travieso miente."
    ]
  };

  // ---------- las cartas del mazo (las 19 de ella, sin la Jefa ni los fantasmas) ----------
  const PUEBLOS = ["pueblo-guitarra", "pueblo-pelota", "pueblo-skate", "pueblo-guitarra"];
  const MAZO = [];
  const pon = (rol, n) => { for (let i = 1; i <= n; i++) MAZO.push({ id: rol + i, rol, img: rol === "pueblo" ? PUEBLOS[i - 1] : ROLES[rol].img }); };
  pon("mafia", 3); pon("policia", 2); pon("medico", 1); pon("enfermero", 1); pon("carnicero", 1); pon("trabajadora", 1);
  pon("medium", 1); pon("amantes", 2); pon("kamikaze", 1); pon("impostor", 1); pon("ladron", 1); pon("pueblo", 4);
  const carta = id => MAZO.find(c => c.id === id);

  // ---------- reparto sugerido (tabla del reglamento) ----------
  const MIN_JUG = 4, MAX_JUG = 18;
  function sugerido(n) {
    n = Math.max(MIN_JUG, Math.min(MAX_JUG, n));
    if (n === 4) return ["mafia1", "policia1", "medico1", "pueblo1"];
    let s = ["mafia1", "policia1", "medico1", "pueblo1", "pueblo2"];           // 5
    if (n >= 6) s.push("trabajadora1");                                          // 6
    if (n >= 7) s.push("mafia2");                                                // 7
    if (n >= 8) { s = s.filter(x => x !== "pueblo2"); s.push("amantes1", "amantes2"); } // 8
    if (n >= 9) s.push("medium1");                                               // 9
    if (n >= 10) { s = s.filter(x => x !== "pueblo1"); s.push("carnicero1", "enfermero1"); } // 10
    if (n >= 11) s.push("mafia3");
    if (n >= 12) s.push("kamikaze1");
    if (n >= 13) s.push("impostor1");
    if (n >= 14) s.push("policia2");
    for (let k = 15; k <= n; k++) s.push("pueblo" + (k - 14));                   // 15 a 18
    return s;
  }
  // Con Ladrón: el mazo de un jugador más, más el Ladrón (sobran 2 cartas para que elija).
  const sugeridoConLadron = n => sugerido(Math.min(MAX_JUG, n + 1)).concat("ladron1");
  const cartasNecesarias = (n, sel) => n + (sel.includes("ladron1") ? 2 : 0);

  // ---------- partida ----------
  const mezclar = (a, rnd) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function validar(jugadores, sel) {
    const n = jugadores.length;
    if (n < MIN_JUG) return `Faltan jugadores: mínimo ${MIN_JUG}, sin contar a la Jefa.`;
    if (n > MAX_JUG) return `Son demasiados: máximo ${MAX_JUG}.`;
    const nec = cartasNecesarias(n, sel);
    if (sel.length !== nec) return sel.includes("ladron1")
      ? `Con Ladrón tienen que ser ${nec} cartas (una por jugador y 2 que sobran). Hay ${sel.length}.`
      : `Tienen que ser ${nec} cartas, una por jugador. Hay ${sel.length}.`;
    if (!sel.some(id => carta(id).rol === "mafia")) return "Falta al menos una carta de Mafia.";
    return "";
  }

  function repartir(jugadores, sel, rnd = Math.random) {
    const err = validar(jugadores, sel); if (err) throw new Error(err);
    let cartas = mezclar(sel, rnd);
    if (sel.includes("ladron1")) {
      // Con Ladrón: el Ladrón siempre se reparte y entre las 2 que sobran hay como mucho una Mafia.
      // Si sobra una Mafia, el Ladrón la tiene que robar: así la cantidad de Mafia no disminuye.
      const resto = cartas.filter(x => x !== "ladron1");
      const esM = x => carta(x).rol === "mafia";
      let sobran = null;
      for (let k = 0; k < 200 && !sobran; k++) {
        const m = mezclar(resto, rnd), par = m.slice(0, 2);
        if (par.filter(esM).length <= 1) sobran = par;
      }
      sobran = sobran || resto.filter(x => !esM(x)).slice(0, 2);
      const mano = mezclar(resto.filter(x => !sobran.includes(x)).concat("ladron1"), rnd);
      cartas = mano.concat(sobran);
    }
    const G = {
      seq: 1, fase: "juego", noche: 1, fin: null,
      jug: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, carta: cartas[i], elegida: null, vivo: true, causa: null, fantasma: null, convertido: false })),
      sobran: cartas.slice(jugadores.length),
      chat: [], sel: sel.slice()
    };
    return G;
  }
  const J = (G, id) => G.jug.find(j => j.id === id);
  // carta con la que juega (el Ladrón juega con la que eligió)
  function cartaEfectiva(j) { const c = carta(j.carta); return c.rol === "ladron" && j.elegida ? carta(j.elegida) : c; }
  function rol(j) { return cartaEfectiva(j).rol; }
  function bando(j) {
    if (j.convertido) return "mafia";
    const r = rol(j); return r === "ladron" ? "pueblo" : ROLES[r].bando;
  }
  const esMafia = j => bando(j) === "mafia";
  function pareja(G, j) {
    if (rol(j) !== "amantes") return null;
    return G.jug.find(o => o.id !== j.id && rol(o) === "amantes") || null;
  }
  const ladronPendiente = G => G.jug.find(j => carta(j.carta).rol === "ladron" && !j.elegida) || null;

  // ---------- acciones ----------
  // Jugador: { t:"robar", carta } (Ladrón) | { t:"chat", txt } (Amantes)
  const MAX_MSJ = 80;
  function accionJugador(G, id, a) {
    const j = J(G, id); if (!j || !a) return "No estás en esta partida";
    if (a.t === "robar") {
      if (carta(j.carta).rol !== "ladron") return "No sos el Ladrón";
      if (j.elegida) return "Ya elegiste";
      if (!G.sobran.includes(a.carta)) return "Esa carta no está";
      if (carta(a.carta).rol !== "mafia" && G.sobran.some(x => carta(x).rol === "mafia")) return "Sobró una carta de Mafia: tenés que robar esa";
      j.elegida = a.carta; G.seq++; return "";
    }
    if (a.t === "chat") {
      const p = pareja(G, j); if (!p) return "No tenés con quién chatear";
      if (G.fin) return "La partida terminó";
      const txt = String(a.txt || "").replace(/\s+/g, " ").trim().slice(0, MAX_MSJ);
      if (!txt) return "";
      const mios = G.chat.filter(m => m.de === j.id || m.de === p.id);
      const ult = mios[mios.length - 1];
      if (ult && ult.de === j.id) return "Esperá que te conteste";
      G.chat.push({ de: j.id, a: p.id, txt, t: Date.now() }); G.seq++; return "";
    }
    return "Acción desconocida";
  }
  // Jefa: { t:"muere", id, causa:"noche"|"votacion", fantasma:"bondadoso"|"travieso"|"azar" }
  //       { t:"fantasma", id, fantasma } | { t:"revive", id } | { t:"convierte", id } | { t:"noche", n }
  //       { t:"fin", gana:"pueblo"|"mafia"|"impostor" } | { t:"sigue" } (deshace el fin)
  function accionJefa(G, a, rnd = Math.random) {
    const j = a && a.id ? J(G, a.id) : null;
    const fan = f => f === "azar" ? (rnd() < 0.5 ? "bondadoso" : "travieso") : (FANTASMAS[f] ? f : null);
    const avisos = [];
    switch (a && a.t) {
      case "muere": {
        if (!j) return { err: "No existe ese jugador" };
        j.vivo = false; j.causa = a.causa === "votacion" ? "votacion" : "noche"; j.fantasma = fan(a.fantasma);
        const p = pareja(G, j);
        if (p && p.vivo) { p.vivo = false; p.causa = j.causa; p.fantasma = null; avisos.push(`Murió también ${p.nombre}, su Amante. Asignale un fantasma.`); }
        if (rol(j) === "kamikaze") avisos.push(`${j.nombre} es Kamikaze: elige a quién se lleva. Marcalo también.`);
        if (rol(j) === "impostor" && !j.convertido && j.causa === "votacion") avisos.push(`${j.nombre} era el Impostor y lo votaron: gana el Impostor.`);
        break;
      }
      case "fantasma": if (!j || j.vivo) return { err: "Solo los muertos tienen fantasma" }; j.fantasma = fan(a.fantasma); break;
      case "revive": if (!j) return { err: "No existe ese jugador" }; j.vivo = true; j.causa = null; j.fantasma = null; break;
      case "convierte":
        if (!j || rol(j) !== "impostor") return { err: "Solo el Impostor se convierte" };
        j.convertido = !j.convertido; j.vivo = true; j.causa = null; j.fantasma = null; break;
      case "noche": G.noche = Math.max(1, a.n | 0); break;
      case "fin": if (!["pueblo", "mafia", "impostor"].includes(a.gana)) return { err: "¿Quién gana?" }; G.fin = { gana: a.gana }; break;
      case "sigue": G.fin = null; break;
      default: return { err: "Acción desconocida" };
    }
    G.seq++;
    return { err: "", avisos };
  }

  // ¿Terminó? Solo avisa; la Jefa confirma.
  function finalSugerido(G) {
    if (G.fin || ladronPendiente(G)) return null;
    const vivos = G.jug.filter(j => j.vivo), maf = vivos.filter(esMafia).length, otros = vivos.length - maf;
    const impVotado = G.jug.find(j => !j.vivo && rol(j) === "impostor" && !j.convertido && j.causa === "votacion");
    if (impVotado) return { gana: "impostor", txt: `Votaron a ${impVotado.nombre}, el Impostor: gana el Impostor y pierden todos.` };
    if (maf === 0) return { gana: "pueblo", txt: "No queda nadie de la Mafia: gana el Pueblo." };
    if (maf > otros) return { gana: "mafia", txt: `La Mafia es mayoría (${maf} contra ${otros}): gana la Mafia.` };
    return null;
  }

  // ---------- guion de la noche ----------
  function enJuego(G, r) { return G.jug.filter(j => j.vivo && (r === "mafia" ? esMafia(j) : rol(j) === r && !j.convertido)); }
  function guion(G) {
    const n = G.noche, pasos = [];
    const nombres = l => l.map(j => j.nombre).join(", ");
    pasos.push({ rol: "jefa", titulo: `Noche ${n}`, leer: "Todos cierran los ojos. Se hace de noche en el pueblo.", nota: "" });
    const paso = (r, titulo, leer, nota, plural) => {
      const l = enJuego(G, r); if (!l.length) return;
      pasos.push({ rol: r, titulo, leer, nota, quienes: nombres(l), fin: plural ? "Cierren los ojos." : "Cerrá los ojos." });
    };
    if (n === 1) paso("amantes", "Amantes", "Amantes, abran los ojos y mírense. Ustedes se aman.", "Si muere uno, mueren los dos.", true);
    paso("trabajadora", "Trabajadora sexual", "Trabajadora sexual, abrí los ojos. Señalá con quién te acostás esta noche.", "Esa persona pierde su habilidad esta noche. Si es un policía, esta noche le mentís a la Policía. Si es la Médium, no llama a nadie.");
    paso("policia", "Policía", "Policía, abran los ojos. Pónganse de acuerdo con señas y señalen a alguien.", "Contestá con la cabeza: sí si es de la Mafia, no si no lo es. El Impostor no es Mafia (salvo que ya se haya convertido). Si la Trabajadora se acostó con un policía, mentí.", true);
    paso("mafia", "Mafia", "Mafia, abran los ojos. Pónganse de acuerdo con señas y señalen a quién matan.", "Si señalan al Impostor, no muere: pasa a ser Mafia. Marcalo en la mesa con «Pasa a ser Mafia».", true);
    paso("carnicero", "Carnicero", "Carnicero, abrí los ojos. Señalá a alguien y mostrá qué le cortás: la lengua o la mano.", "Lengua: mañana no habla. Mano: mañana no vota. El Enfermero lo puede salvar.");
    paso("enfermero", "Enfermero", "Enfermero, abrí los ojos. Señalá a quién salvás del Carnicero.", "");
    paso("medico", "Médico", "Médico, abrí los ojos. Señalá a quién salvás de la Mafia.", "Sobredosis: si el Médico y el Enfermero eligieron a la misma persona, esa persona muere.");
    const muertos = G.jug.filter(j => !j.vivo);
    paso("medium", "Médium", "Médium, abrí los ojos. Señalá a qué muerto traés: va a poder hablar con mímica en la próxima votación.",
      muertos.length ? "Un muerto por noche. Si la Trabajadora se acostó con ella, esta noche no trae a nadie." : "Todavía no hay muertos: no puede traer a nadie.");
    pasos.push({ rol: "jefa", titulo: "Amanece", leer: "Todos abren los ojos. Amaneció en el pueblo.", nota: "Contá qué pasó a la noche: quién murió y a quién le cortaron la lengua o la mano. Marcá los muertos en la mesa y asigná su fantasma." });
    pasos.push({ rol: "pueblo", titulo: "Votación", leer: "El pueblo debate y vota a quién echar.", nota: "Si la Médium trajo a un muerto, contesta solo con mímica y según su fantasma. Marcá al votado como muerto en la votación." });
    return pasos;
  }

  // ---------- vistas ----------
  function imgDe(j) { return j.convertido ? "mafia" : cartaEfectiva(j).img; }
  function vistaJugador(G, id) {
    const j = J(G, id); if (!j) return null;
    const c = carta(j.carta), r = rol(j), p = pareja(G, j);
    const v = {
      fase: G.fin ? "fin" : "juego", seq: G.seq,
      yo: {
        rol: j.convertido ? "mafia" : r, img: imgDe(j), nombreRol: j.convertido ? "Mafia" : (r === "pueblo" ? "Pueblo" : ROLES[r].nombre),
        bando: bando(j), convertido: j.convertido, vivo: j.vivo, causa: j.causa,
        fantasma: j.vivo ? null : j.fantasma,
        ladron: c.rol === "ladron" ? { elegida: j.elegida, opciones: j.elegida ? [] : G.sobran.map(x => ({ id: x, rol: carta(x).rol, img: carta(x).img, bloqueada: carta(x).rol !== "mafia" && G.sobran.some(y => carta(y).rol === "mafia") })) } : null,
        pareja: p ? p.nombre : null, sinPareja: r === "amantes" && !p
      },
      chat: null
    };
    if (p) {
      const mios = G.chat.filter(m => m.de === j.id || m.de === p.id);
      v.chat = { msjs: mios.map(m => ({ mio: m.de === j.id, txt: m.txt, t: m.t })), puedo: !G.fin && (!mios.length || mios[mios.length - 1].de !== j.id), max: MAX_MSJ };
    }
    if (G.fin) v.fin = { gana: G.fin.gana, jug: G.jug.map(x => ({ nombre: x.nombre, rol: x.convertido ? "Mafia (era Impostor)" : (rol(x) === "pueblo" ? "Pueblo" : ROLES[rol(x)].nombre) + (carta(x.carta).rol === "ladron" ? " (Ladrón)" : ""), img: imgDe(x), bando: bando(x), vivo: x.vivo })) };
    return v;
  }
  // cartas que no juega nadie: las que sobraron, salvo la que robó el Ladrón (y entonces queda afuera la del Ladrón)
  function afuera(G) {
    const L = G.jug.find(j => carta(j.carta).rol === "ladron" && j.elegida);
    return L ? G.sobran.filter(x => x !== L.elegida).concat(L.carta) : G.sobran.slice();
  }
  function vistaJefa(G) {
    return {
      fase: G.fin ? "fin" : "juego", noche: G.noche, fin: G.fin, sugerido: finalSugerido(G),
      ladronPendiente: (ladronPendiente(G) || {}).nombre || null,
      sobran: afuera(G).map(x => ({ id: x, rol: carta(x).rol, img: carta(x).img })),
      jug: G.jug.map(j => {
        const c = carta(j.carta), r = rol(j);
        return {
          id: j.id, nombre: j.nombre, rol: r, img: imgDe(j),
          nombreRol: j.convertido ? "Mafia (era Impostor)" : (r === "pueblo" ? "Pueblo" : ROLES[r].nombre),
          ladron: c.rol === "ladron", eligiendo: c.rol === "ladron" && !j.elegida,
          bando: bando(j), vivo: j.vivo, causa: j.causa, fantasma: j.fantasma, convertido: j.convertido,
          pareja: (pareja(G, j) || {}).nombre || null
        };
      }),
      guion: guion(G)
    };
  }

  const API = { ROLES, FANTASMAS, JEFA, MAZO, carta, MIN_JUG, MAX_JUG, sugerido, sugeridoConLadron, cartasNecesarias, validar, repartir,
    accionJugador, accionJefa, finalSugerido, guion, vistaJugador, vistaJefa, rol, bando, pareja, MAX_MSJ };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else raiz.Motor = API;
})(typeof window !== "undefined" ? window : globalThis);
