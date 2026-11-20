// Juegos agregados desde el celu (quedan solo en este dispositivo).
// Datos de cada caja: localStorage "juegoteca-locales". Archivos subidos: IndexedDB "juegoteca" / "archivos".
const Locales = (() => {
  const CLAVE = "juegoteca-locales";
  function lista() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
  }
  function guardarLista(l) { localStorage.setItem(CLAVE, JSON.stringify(l)); }
  function db() {
    return new Promise((ok, mal) => {
      const r = indexedDB.open("juegoteca", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("archivos");
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mal(r.error);
    });
  }
  async function op(modo, fn) {
    const d = await db();
    return new Promise((ok, mal) => {
      const t = d.transaction("archivos", modo);
      const req = fn(t.objectStore("archivos"));
      t.oncomplete = () => ok(req && req.result);
      t.onerror = () => mal(t.error);
    });
  }
  const leerHTML = id => op("readonly", s => s.get(id));
  const guardarHTML = (id, html) => op("readwrite", s => s.put(html, id));
  const borrarHTML = id => op("readwrite", s => s.delete(id));

  async function agregar(juego, html) {
    const id = "loc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (html != null) { await guardarHTML(id, html); juego.url = "jugar.html?id=" + id; juego.propio = true; }
    juego.id = id; juego.local = true;
    const l = lista(); l.push(juego); guardarLista(l);
    return juego;
  }
  async function quitar(id) {
    guardarLista(lista().filter(j => j.id !== id));
    try { await borrarHTML(id); } catch {}
  }

  // Une un HTML con sus JS, CSS e imágenes en un solo archivo, para poder guardarlo y abrirlo sin servidor.
  async function empaquetar(archivos) {
    archivos = [...archivos];
    const htmls = archivos.filter(f => /\.html?$/i.test(f.name));
    if (!htmls.length) throw new Error("Falta el archivo .html del juego.");
    const principal = htmls.find(f => /^index\.html?$/i.test(f.name)) || htmls[0];
    const norm = p => decodeURIComponent(String(p || "").split(/[?#]/)[0]).replace(/^\.?\//, "").toLowerCase();
    const mapa = new Map();
    for (const f of archivos) {
      const rel = norm(f.webkitRelativePath ? f.webkitRelativePath.split("/").slice(1).join("/") : f.name);
      mapa.set(rel, f); mapa.set(norm(f.name), f);
    }
    const buscar = ref => {
      if (!ref || /^(https?:|data:|blob:|\/\/|#|mailto:|javascript:)/i.test(ref)) return null;
      const n = norm(ref); return mapa.get(n) || mapa.get(n.split("/").pop()) || null;
    };
    const texto = f => f.text();
    const dataURL = f => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(f); });
    async function cssConRecursos(css) {
      const refs = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map(m => m[1]);
      for (const ref of new Set(refs)) { const f = buscar(ref); if (f) css = css.split(ref).join(await dataURL(f)); }
      return css;
    }
    const doc = new DOMParser().parseFromString(await texto(principal), "text/html");
    for (const s of doc.querySelectorAll("script[src]")) {
      const f = buscar(s.getAttribute("src")); if (!f) continue;
      s.removeAttribute("src"); s.textContent = (await texto(f)).replace(/<\/script/gi, "<\\/script");
    }
    for (const l of doc.querySelectorAll('link[rel~="stylesheet"][href]')) {
      const f = buscar(l.getAttribute("href")); if (!f) continue;
      const st = doc.createElement("style"); st.textContent = await cssConRecursos(await texto(f)); l.replaceWith(st);
    }
    for (const st of doc.querySelectorAll("style")) st.textContent = await cssConRecursos(st.textContent);
    for (const el of doc.querySelectorAll("[src],[href],[poster]")) {
      for (const at of ["src", "href", "poster"]) {
        if (!el.hasAttribute(at) || (el.tagName === "A" && at === "href")) continue;
        const f = buscar(el.getAttribute(at)); if (f) el.setAttribute(at, await dataURL(f));
      }
    }
    const titulo = (doc.title || principal.name.replace(/\.html?$/i, "")).trim();
    return { html: "<!doctype html>\n" + doc.documentElement.outerHTML, titulo };
  }
  return { lista, agregar, quitar, leerHTML, empaquetar };
})();
