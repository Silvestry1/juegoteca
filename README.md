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
- `juegos/dados/`: **Dados**. Lanzador de dados (d4 a d100 o caras a elección), con modificador, dados fijos e historial guardado en el celular. Categoría "Herramientas".
- `juegos/nisetocurra/`: **Ni se te ocurra**. Palabras prohibidas por equipos, con dificultad Normal/Difícil/Brutal (4, 5 o 6 prohibidas) y mazo ATP, +18 o mezcla. Las cartas están en las constantes `ATP` y `ADULTO` del `index.html`, una por línea: `Palabra: prohibida1, ..., prohibida6`.
