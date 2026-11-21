# Juegoteca

Biblioteca de juegos gratuitos para juntadas, accesible por QR.

- Sitio: https://silvestry1.github.io/juegoteca/
- QR para imprimir: https://silvestry1.github.io/juegoteca/qr.html

## Agregar un juego

Editá `juegos.json` y sumá un bloque así (separado por coma del anterior):

```json
{
  "nombre": "Nombre del juego",
  "tipo": "Dibujar",
  "min": 2,
  "max": 10,
  "edad": "10+",
  "descripcion": "Una o dos líneas de cómo se juega.",
  "url": "https://link-para-jugar",
  "icono": "🎯",
  "colores": ["#ff6b6b", "#ffd93d"],
  "lema": "Frase corta para el frente de la caja"
}
```

`edad` define la calificación de la caja: menos de 13 = ATP, 13 = +13, 16 = +16, 18 = +18. Opcional: `"imagen": "ruta/a/imagen.png"` reemplaza al ícono.

Si no sabés la cantidad de jugadores, poné `null` en `min` o `max`.

## Juegos propios

Viven en `juegos/<nombre>/` y se juegan con un solo celular, sin servidor. En `juegos.json` llevan `"propio": true` (abren en la misma pestaña y muestran la etiqueta "Hecho en casa").

- `juegos/mostralo/`: **Mostralo como puedas**. Dibujo, mímica o tarareo por equipos; las consignas están en el objeto `MAZO` del `index.html`.
- `juegos/dados/`: **Dados**. Dos modos: "Generala · 10.000" (d6 grandes, guardar dados, contador de tiros, detecta jugadas de Generala, suma opcional apagada) y "Rol" (d4 a d100 o caras a elección, modificador, dados fijos, historial, suma opcional prendida). Categoría "Herramientas".
- `juegos/nisetocurra/`: **Ni se te ocurra**. Palabras prohibidas por equipos, con dificultad Normal/Difícil/Brutal (4, 5 o 6 prohibidas), límite de pases por turno (pasar no resta, falta −1) y mazo ATP, +18 o mezcla. Las cartas están en las constantes `ATP` y `ADULTO` del `index.html`, una por línea: `Palabra: prohibida1, ..., prohibida6`.

- `juegos/bingomusical/`: **Bingo musical**. Cartones con títulos de temas (3×3, 4×4 o 5×5 con centro libre). El anfitrión trae una playlist de YouTube/YouTube Music con su propia clave de la YouTube Data API (queda en su celu, no en el repo) o pega/importa la lista (CSV de Exportify o TuneMyMusic para Spotify/TIDAL). La lista viaja en el link (`#p=...`, comprimida) y la ronda en `&r=XXXX` (4 caracteres que codifican tamaño de cartón, cantidad de temas y sorteo), así que no hay servidor. El QR impreso lleva solo la lista: sirve para todas las rondas mientras no cambie la lista, y el jugador escribe el código de ronda. Modo automático: elige cartón y cantidad de temas según jugadores, duración y segundos por tema (E[T] ≈ Σ (1 − C(t,k)/C(N,k))^J). Categoría "Música".

## App instalable y sin conexión

La Juegoteca se puede instalar en el celu (botón **📲 Instalar** en la página). Los juegos de `juegos/` quedan guardados en la primera visita y andan sin internet; los externos muestran "Requiere internet" cuando no hay señal.

Si agregás un juego propio nuevo en `juegos/<nombre>/`:
1. Sumá `"juegos/<nombre>/"` a la lista `PROPIOS` de `sw.js` y subí `VERSION` (por ejemplo `v1` → `v2`).
2. Pegá en su `index.html`, antes de `</body>`:
   `<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("../../sw.js",{scope:"../../"});</script>`

Los cambios a juegos que ya existen llegan solos: la app siempre intenta bajar la versión nueva y usa la guardada solo si no hay señal (o tarda más de 3,5 s).
- `juegos/truco/`: **Anotador de truco**. Nosotros/Ellos con nombres editables, partida a 15 o a 30 (malas y buenas), fósforos de a 5, +1/+2/+3/+4 y −1, deshacer, aviso de ganador y partidas ganadas. Se guarda en `localStorage` (`truco-anotador`) y mantiene la pantalla prendida. Categoría "Herramientas".
  Botón "Pica-pica" (rojo = prendido): al llegar un equipo a 5 se abre solo, encima del marcador (fondo teñido y desenfocado), un marcador propio del pica-pica; al cerrar la ronda pasa al general solo la diferencia. Después de cada redonda, el botón rojo "Terminó la redonda → PICA-PICA" lo vuelve a abrir, hasta que alguien llega a 25.

## Volver al menú y juegos agregados desde el celu

- Cada juego propio carga `inicio.js`, que pone un botón flotante 🎬 abajo a la izquierda para volver al menú (pide confirmación para no cortar una partida). En la página principal, el cartel "Juegoteca" de arriba también lleva al inicio. Un juego propio nuevo tiene que llevar `<script src="../../inicio.js"></script>` antes de `</body>`.
- La caja **+** del catálogo agrega juegos **solo en ese celu**: por link (se guarda en `localStorage` → `juegoteca-locales`) o subiendo los archivos (`.html` más sus `.js`, `.css` e imágenes). Los archivos se unen en un solo HTML (`locales.js` → `empaquetar`), se guardan en IndexedDB y se abren con `jugar.html?id=...` dentro de un iframe aislado.
- Para que un juego agregado por link entre al catálogo de todos: en su caja, **📋 Copiar ficha** y pegar ese bloque en `juegos.json`.

## Cartas propias (juegos de adivinar)

`juegos/comun/cartas-propias.js` agrega el botón **✏️ Agregar o sacar cartas** a Mostralo y Ni se te ocurra: cartas propias (con sus opciones de modo, dificultad y ATP/+18), pausar o borrar, y sacar cartas oficiales. Todo queda en el celu (`localStorage`, clave `cartas-propias.<juego>`).

**Compartir mi lista** arma un texto (`#cartas <juego>`, una carta por línea con campos separados por `|`, y `#sacadas` con las oficiales sacadas) para mandar por WhatsApp. Ese texto se puede pegar en otro celu (**Pegar una lista que te mandaron**) o usar para sumar cartas al mazo oficial del `index.html`.

Para un juego de adivinar nuevo: cargá el script, llamá a `CartasPropias({juego, nombre, campos, clave, resumen, oficiales, validar, alCambiar})` (ver el comentario al principio del archivo) y armá el mazo con `mis.activas()` y `mis.ocultas()`.
