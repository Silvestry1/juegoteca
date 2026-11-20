/* Cartas propias: módulo común para los juegos de adivinar de la Juegoteca.
   Permite agregar cartas, pausarlas o borrarlas, sacar cartas del mazo oficial
   y exportar todo como texto para sumarlo después al mazo oficial.
   Todo queda en el celu (localStorage), no hay servidor.

   Uso:
     const mis = CartasPropias({
       juego: "mostralo",                 // clave de guardado
       nombre: "Mostralo como puedas",    // para el texto exportado
       campos: [ {k, t, tipo:"opciones"|"texto", ops:[[valor,etiqueta]], req, max, ph, ayuda} ],
       clave: carta => "id único",        // para no repetir cartas
       resumen: carta => "texto corto",   // cómo se ve en la lista
       oficiales: () => [{id, txt}],      // mazo oficial, para buscar y sacar cartas
       validar: carta => "error" | null,  // opcional
       alCambiar: () => {}                // se llama cada vez que cambia algo
     });
     mis.activas()    → cartas propias que están en el mazo
     mis.ocultas()    → Set con los id de cartas oficiales sacadas
     mis.ocultar(id)  → saca una carta oficial
     mis.abrir()      → abre el panel
     mis.contar()     → {propias, activas, ocultas}
*/
(function () {
  const CSS = `
.cp-fondo{position:fixed;inset:0;z-index:50;background:var(--bg,#14110f);overflow:auto;display:none}
.cp-fondo.on{display:block}
.cp-hoja{max-width:560px;margin:0 auto;padding:16px 16px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:14px;color:var(--txt,#fff)}
.cp-tope{display:flex;align-items:center;gap:10px}
.cp-tope h2{flex:1;margin:0;font-size:1.3rem;text-align:left}
.cp-caja{background:var(--card,#251f1b);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cp-caja h3{margin:0;font-size:.85rem;text-transform:uppercase;letter-spacing:1px;color:var(--sub,#ccc)}
.cp-et{font-size:.85rem;color:var(--sub,#ccc);margin-bottom:-4px}
.cp-chips{display:flex;flex-wrap:wrap;gap:6px}
.cp-chips button{flex:1;min-width:70px;padding:9px 8px}
.cp-hoja input[type=text],.cp-hoja textarea{width:100%;padding:10px;border-radius:10px;border:2px solid #ffffff22;background:#00000033;color:var(--txt,#fff);font:inherit;font-size:1rem}
.cp-hoja textarea{min-height:110px;resize:vertical;font-size:.85rem}
.cp-err{color:#ff6b6b;font-size:.9rem;min-height:1.1em}
.cp-ok{color:#3ddc84}
.cp-lista{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow:auto}
.cp-it{display:flex;align-items:center;gap:6px;background:#00000033;border-radius:10px;padding:6px 6px 6px 12px}
.cp-it.pausa{opacity:.5}
.cp-it .cp-t{flex:1;overflow-wrap:anywhere;font-size:.95rem}
.cp-it .cp-t small{display:block;color:var(--sub,#ccc);font-size:.78rem}
.cp-it button{padding:7px 10px;background:#ffffff12;flex:none}
.cp-nota{font-size:.85rem;color:var(--sub,#ccc);margin:0;line-height:1.4}
.cp-fila{display:flex;gap:8px;flex-wrap:wrap}
.cp-fila button{flex:1}
`;
  function estilo() {
    if (document.getElementById("cp-css")) return;
    const s = document.createElement("style"); s.id = "cp-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const limpio = s => String(s ?? "").replace(/[|\n\r]/g, " ").replace(/\s+/g, " ").trim();
  const norm = s => limpio(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const hoy = () => new Date().toISOString().slice(0, 10);

  window.CartasPropias = function (cfg) {
    estilo();
    const KEY = "cartas-propias." + cfg.juego;
    let D = { propias: [], ocultas: [] };
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.propias)) D = { propias: d.propias, ocultas: Array.isArray(d.ocultas) ? d.ocultas : [] }; } catch (e) {}
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} };
    const cambio = () => { guardar(); pintar(); cfg.alCambiar && cfg.alCambiar(); };

    // valores por defecto del formulario: primera opción de cada campo
    const nuevoBorrador = () => { const b = {}; cfg.campos.forEach(c => b[c.k] = c.tipo === "opciones" ? c.ops[0][0] : ""); return b; };
    let borrador = nuevoBorrador();

    /* ----- panel ----- */
    const fondo = document.createElement("div"); fondo.className = "cp-fondo";
    fondo.innerHTML = `<div class="cp-hoja">
      <div class="cp-tope"><h2>✏️ Mis cartas</h2><button class="cp-cerrar">Listo</button></div>
      <p class="cp-nota">Lo que agregás o sacás queda guardado en este celu y entra en el mazo de las próximas partidas.</p>
      <div class="cp-caja"><h3>Agregar una carta</h3><div class="cp-form" style="display:flex;flex-direction:column;gap:10px"></div>
        <div class="cp-err"></div><button class="cp-agregar on">＋ Agregar al mazo</button></div>
      <div class="cp-caja"><h3>Mis cartas (<span class="cp-n">0</span>)</h3>
        <p class="cp-nota">👁 la pausa sin borrarla. ✕ la borra.</p><div class="cp-lista cp-mias"></div></div>
      <div class="cp-caja"><h3>Sacar cartas del mazo oficial</h3>
        <input type="text" class="cp-buscar" placeholder="Buscá una carta para sacarla" enterkeyhint="search">
        <div class="cp-lista cp-res"></div>
        <div class="cp-et">Sacadas (<span class="cp-no">0</span>)</div><div class="cp-lista cp-sacadas"></div></div>
      <div class="cp-caja"><h3>Para el mazo oficial</h3>
        <p class="cp-nota">Las cartas no viajan solas: mandá la lista por WhatsApp o donde quieras. Lleva tus cartas y las oficiales que sacaste, en un formato que se puede pegar en otro celu o sumar al juego.</p>
        <div class="cp-fila"><button class="cp-compartir on">📤 Compartir mi lista</button><button class="cp-copiar">📋 Copiar</button></div>
        <div class="cp-err cp-msg"></div>
        <textarea class="cp-texto" readonly style="display:none"></textarea></div>
      <div class="cp-caja"><h3>Pegar una lista que te mandaron</h3>
        <textarea class="cp-pegar" placeholder="Pegá acá el texto de «Compartir mi lista»"></textarea>
        <label class="cp-nota" style="display:flex;gap:8px;align-items:center"><input type="checkbox" class="cp-conocultas" style="width:20px;height:20px"> Sacar también las cartas oficiales que esa lista saca</label>
        <button class="cp-importar">Sumar estas cartas</button><div class="cp-err cp-msg2"></div></div>
    </div>`;
    document.body.appendChild(fondo);
    const q = s => fondo.querySelector(s);

    function pintarForm() {
      q(".cp-form").innerHTML = cfg.campos.map(c => {
        const et = `<div class="cp-et">${esc(c.t)}${c.req ? "" : " (opcional)"}</div>`;
        if (c.tipo === "opciones") return et + `<div class="cp-chips" data-k="${c.k}">` +
          c.ops.map(o => `<button data-v="${esc(o[0])}" class="${borrador[c.k] === o[0] ? "on" : ""}">${esc(o[1])}</button>`).join("") + `</div>`;
        return et + `<input type="text" data-k="${c.k}" maxlength="${c.max || 40}" placeholder="${esc(c.ph || "")}" value="${esc(borrador[c.k])}">` +
          (c.ayuda ? `<p class="cp-nota">${esc(c.ayuda)}</p>` : "");
      }).join("");
    }
    q(".cp-form").addEventListener("click", e => {
      const b = e.target.closest(".cp-chips button"); if (!b) return;
      const k = b.parentNode.dataset.k; borrador[k] = b.dataset.v;
      b.parentNode.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    });
    q(".cp-form").addEventListener("input", e => { const k = e.target.dataset.k; if (k) borrador[k] = e.target.value; });

    const etiqueta = (c, v) => { const o = c.ops.find(o => o[0] === v); return o ? o[1].replace(/^[^\p{L}\d+]+/u, "").trim() : v; };
    const idsOficiales = () => new Set(cfg.oficiales().map(o => norm(o.id)));

    function revisar(carta, exceptoIdx) {
      for (const c of cfg.campos) {
        if (c.tipo === "opciones" && !c.ops.some(o => o[0] === carta[c.k])) return "Falta elegir " + c.t.toLowerCase() + ".";
        if (c.tipo === "texto") { carta[c.k] = limpio(carta[c.k]).slice(0, c.max || 40); if (c.req && !carta[c.k]) return "Falta completar «" + c.t + "»."; }
      }
      const err = cfg.validar && cfg.validar(carta); if (err) return err;
      const id = norm(cfg.clave(carta));
      if (idsOficiales().has(id)) return "Esa carta ya está en el mazo oficial.";
      if (D.propias.some((p, i) => i !== exceptoIdx && norm(cfg.clave(p)) === id)) return "Esa carta ya la agregaste.";
      return null;
    }
    q(".cp-agregar").onclick = () => {
      const carta = Object.assign({}, borrador);
      const err = revisar(carta);
      if (err) { q(".cp-err").textContent = err; q(".cp-err").classList.remove("cp-ok"); return; }
      carta.fecha = hoy(); carta.activa = true;
      D.propias.unshift(carta);
      // se mantienen las opciones elegidas, se vacían los textos
      cfg.campos.forEach(c => { if (c.tipo === "texto") borrador[c.k] = ""; });
      pintarForm(); cambio();
      q(".cp-err").textContent = "Agregada: " + cfg.resumen(carta); q(".cp-err").classList.add("cp-ok");
      const pri = q(".cp-form input[data-k]"); pri && pri.focus();
    };

    function pintar() {
      q(".cp-n").textContent = D.propias.length;
      q(".cp-mias").innerHTML = D.propias.length ? D.propias.map((p, i) =>
        `<div class="cp-it ${p.activa ? "" : "pausa"}"><span class="cp-t">${esc(cfg.resumen(p))}<small>${esc(detalle(p))}</small></span>
         <button data-p="${i}" aria-label="${p.activa ? "Pausar" : "Volver a poner"}">${p.activa ? "👁" : "🙈"}</button><button data-b="${i}" aria-label="Borrar">✕</button></div>`).join("")
        : `<p class="cp-nota">Todavía no agregaste ninguna.</p>`;
      const ofi = cfg.oficiales(), porId = new Map(ofi.map(o => [norm(o.id), o]));
      q(".cp-no").textContent = D.ocultas.length;
      q(".cp-sacadas").innerHTML = D.ocultas.map((id, i) => {
        const o = porId.get(norm(id));
        return `<div class="cp-it"><span class="cp-t">${esc(o ? o.txt : id)}</span><button data-v="${i}">Volver a poner</button></div>`;
      }).join("") || `<p class="cp-nota">Ninguna.</p>`;
      buscar();
    }
    function detalle(p) {
      return cfg.campos.filter(c => c.tipo === "opciones").map(c => etiqueta(c, p[c.k])).join(" · ") + (p.activa ? "" : " · pausada");
    }
    q(".cp-mias").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.p != null) { const p = D.propias[+b.dataset.p]; p.activa = !p.activa; cambio(); }
      else if (b.dataset.b != null) {
        const i = +b.dataset.b;
        if (b.dataset.seguro) { D.propias.splice(i, 1); cambio(); }
        else { b.dataset.seguro = 1; b.textContent = "¿Borrar?"; setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = "✕"; } }, 3000); }
      }
    });
    function buscar() {
      const t = norm(q(".cp-buscar").value), r = q(".cp-res");
      if (t.length < 2) { r.innerHTML = ""; return; }
      const oc = new Set(D.ocultas.map(norm));
      const hall = cfg.oficiales().filter(o => !oc.has(norm(o.id)) && norm(o.txt).includes(t)).slice(0, 15);
      r.innerHTML = hall.length ? hall.map(o => `<div class="cp-it"><span class="cp-t">${esc(o.txt)}</span><button data-id="${esc(o.id)}">Sacar</button></div>`).join("")
        : `<p class="cp-nota">No hay cartas oficiales con eso.</p>`;
    }
    q(".cp-buscar").addEventListener("input", buscar);
    q(".cp-res").addEventListener("click", e => { const b = e.target.closest("button"); if (b) api.ocultar(b.dataset.id); });
    q(".cp-sacadas").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { D.ocultas.splice(+b.dataset.v, 1); cambio(); } });

    /* ----- exportar / importar ----- */
    function texto() {
      const l = ["Juegoteca · " + cfg.nombre + " · mis cartas · " + hoy(), "#cartas " + cfg.juego,
        "# " + cfg.campos.map(c => c.t).join(" | ")];
      D.propias.forEach(p => l.push(cfg.campos.map(c => c.tipo === "opciones" ? etiqueta(c, p[c.k]) : (p[c.k] || "")).join(" | ") + (p.activa ? "" : " | (pausada)")));
      if (D.ocultas.length) { l.push("#sacadas"); D.ocultas.forEach(id => l.push(id)); }
      return l.join("\n");
    }
    function mostrarTexto(msg) {
      const ta = q(".cp-texto"); ta.style.display = "block"; ta.value = texto();
      q(".cp-msg").textContent = msg || ""; q(".cp-msg").classList.toggle("cp-ok", !!msg);
      return ta;
    }
    async function copiar() {
      const ta = mostrarTexto();
      try { await navigator.clipboard.writeText(ta.value); q(".cp-msg").textContent = "Copiado. Pegalo en WhatsApp o donde quieras."; q(".cp-msg").classList.add("cp-ok"); }
      catch (e) { ta.focus(); ta.select(); q(".cp-msg").textContent = "Mantené apretado el texto y copialo."; q(".cp-msg").classList.remove("cp-ok"); }
    }
    q(".cp-copiar").onclick = copiar;
    q(".cp-compartir").onclick = async () => {
      if (!D.propias.length && !D.ocultas.length) { q(".cp-msg").textContent = "No hay nada para mandar todavía."; q(".cp-msg").classList.remove("cp-ok"); return; }
      const t = texto();
      if (navigator.share) { try { await navigator.share({ title: "Mis cartas · " + cfg.nombre, text: t }); mostrarTexto(); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      copiar();
    };
    q(".cp-importar").onclick = () => {
      const lineas = q(".cp-pegar").value.split(/\r?\n/).map(s => s.trim());
      const msg = q(".cp-msg2"); msg.classList.remove("cp-ok");
      const ini = lineas.findIndex(s => s.startsWith("#cartas"));
      if (ini < 0) { msg.textContent = "No encuentro la lista. Pegá el texto completo, desde «Juegoteca»."; return; }
      const de = lineas[ini].split(/\s+/)[1];
      if (de && de !== cfg.juego) { msg.textContent = "Esa lista es de otro juego."; return; }
      let sec = "cartas", sum = 0, rep = 0, sac = 0;
      const conOcultas = q(".cp-conocultas").checked;
      for (const s of lineas.slice(ini + 1)) {
        if (!s || s.startsWith("# ")) continue;
        if (s === "#sacadas") { sec = "sacadas"; continue; }
        if (sec === "sacadas") { if (conOcultas && !D.ocultas.some(x => norm(x) === norm(s))) { D.ocultas.push(s); sac++; } continue; }
        const v = s.split("|").map(x => x.trim()), carta = {};
        cfg.campos.forEach((c, i) => {
          const x = v[i] || "";
          if (c.tipo === "opciones") { const o = c.ops.find(o => norm(o[0]) === norm(x) || norm(etiqueta(c, o[0])) === norm(x)); carta[c.k] = o ? o[0] : null; }
          else carta[c.k] = x;
        });
        if (revisar(carta)) { rep++; continue; }
        carta.fecha = hoy(); carta.activa = true; D.propias.push(carta); sum++;
      }
      cambio();
      msg.textContent = "Sumadas: " + sum + (rep ? " · salteadas (repetidas o incompletas): " + rep : "") + (sac ? " · oficiales sacadas: " + sac : "");
      msg.classList.toggle("cp-ok", sum > 0 || sac > 0);
      if (sum || sac) q(".cp-pegar").value = "";
    };

    q(".cp-cerrar").onclick = () => { fondo.classList.remove("on"); document.body.style.overflow = ""; };

    const api = {
      activas: () => D.propias.filter(p => p.activa),
      ocultas: () => new Set(D.ocultas.map(norm)),
      oculta: id => D.ocultas.some(x => norm(x) === norm(id)),
      ocultar: id => { if (!api.oculta(id)) { D.ocultas.push(id); cambio(); } },
      contar: () => ({ propias: D.propias.length, activas: api.activas().length, ocultas: D.ocultas.length }),
      abrir: () => { pintarForm(); pintar(); q(".cp-err").textContent = ""; fondo.classList.add("on"); fondo.scrollTop = 0; document.body.style.overflow = "hidden"; },
      norm
    };
    return api;
  };
})();
