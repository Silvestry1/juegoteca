// Service worker de la Juegoteca.
// Al agregar un juego propio nuevo, sumá su carpeta a PROPIOS y subí VERSION.
const VERSION = "v1";
const CACHE = "juegoteca-" + VERSION;
const PROPIOS = [
  "./",
  "index.html",
  "juegos.json",
  "manifest.webmanifest",
  "qr-juegoteca.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "juegos/mostralo/",
  "juegos/nisetocurra/",
  "juegos/dados/",
  "juegos/ruleta/",
  "juegos/bingo/"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PROPIOS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("juegoteca-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (con tope de espera) para que los cambios lleguen solos;
// si no hay internet o tarda, sale lo guardado.
const ESPERA_MS = 3500;
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // juegos externos: que vayan directo a internet
  e.respondWith(redPrimero(e, req));
});

async function redPrimero(e, req) {
  const cache = await caches.open(CACHE);
  const clave = new Request(req.url.split("#")[0].split("?")[0]); // ?adultos=1 y similares usan la misma página
  const red = fetch(req.url, { cache: "no-cache" }).then(r => {
    if (r && r.ok && r.type === "basic") cache.put(clave, r.clone());
    return r;
  });
  e.waitUntil(red.catch(() => {}));
  const guardado = await cache.match(clave);
  if (!guardado) return red.catch(async () => (await cache.match("./")) || Response.error());
  const tope = new Promise(res => setTimeout(() => res(guardado), ESPERA_MS));
  return Promise.race([red.catch(() => guardado), tope]);
}
