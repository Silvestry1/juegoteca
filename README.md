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
  "url": "https://link-para-jugar"
}
```

Si no sabés la cantidad de jugadores, poné `null` en `min` o `max`.
