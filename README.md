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
- `juegos/nisetocurra/`: **Ni se te ocurra**. Palabras prohibidas por equipos, con dificultad Normal/Difícil/Brutal (4, 5 o 6 prohibidas) y mazo ATP, +18 o mezcla. Las cartas están en las constantes `ATP` y `ADULTO` del `index.html`, una por línea: `Palabra: prohibida1, ..., prohibida6`.

## App instalable y sin conexión

La Juegoteca se puede instalar en el celu (botón **📲 Instalar** en la página). Los juegos de `juegos/` quedan guardados en la primera visita y andan sin internet; los externos muestran "Requiere internet" cuando no hay señal.

Si agregás un juego propio nuevo en `juegos/<nombre>/`:
1. Sumá `"juegos/<nombre>/"` a la lista `PROPIOS` de `sw.js` y subí `VERSION` (por ejemplo `v1` → `v2`).
2. Pegá en su `index.html`, antes de `</body>`:
   `<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("../../sw.js",{scope:"../../"});</script>`

Los cambios a juegos que ya existen llegan solos: la app siempre intenta bajar la versión nueva y usa la guardada solo si no hay señal (o tarda más de 3,5 s).
- `juegos/truco/`: **Anotador de truco**. Nosotros/Ellos con nombres editables, partida a 15 o a 30 (malas y buenas), fósforos de a 5, +1/+2/+3/+4 y −1, deshacer, aviso de ganador y partidas ganadas. Se guarda en `localStorage` (`truco-anotador`) y mantiene la pantalla prendida. Categoría "Herramientas".
