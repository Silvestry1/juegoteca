/* Textos de «Estampame esta». Consignas para dibujar, combinaciones para el modo difícil y frases de la casa
   (se usan como ideas con el dado y para completar si alguien no escribió). Uno por línea. */
(function (raiz) {
  const L = s => s.split("\n").map(x => x.trim()).filter(Boolean);
  const Banco = {
    consignas: L(`
      Un carpincho de vacaciones
      Tu animal favorito enojado
      Un mate con cara
      Un asado que salió mal
      Un colectivo volando
      La abuela haciendo ñoquis
      Un perro con campera
      Un superhéroe de barrio
      Una medialuna gigante
      Un dinosaurio en el súper
      El Obelisco con sombrero
      Un pingüino en la playa
      Un robot cebando mate
      Una vaca astronauta
      Un gato DJ
      Tu cara a la mañana
      Una pizza con piernas
      Un fantasma tímido
      Un caracol apurado
      El mejor gol de la historia
      Un alfajor con anteojos
      Un tiburón vegetariano
      Una planta que habla
      Un perro paseando a su dueño
      La heladera vacía
      Un rayo con bronca
      Un sol con resaca
      Un ovni en el campo
      Una milanesa del tamaño de un plato
      Un pájaro con auriculares
      Una tormenta en un vaso
      Un mono jugando al truco
      Un hornero albañil
      Un vampiro en la pileta
      Un bebé con bigote
      Una nube llorando
      Una tortuga en patineta
      Una sirena en la Costanera
      El mozo más lento del mundo
      Una oveja haciendo yoga
    `),
    consignasAdultos: L(`
      Tu ex en el casamiento de un amigo
      La cara de tu suegra en el asado
      Un domingo de resaca
      La previa que se fue de mambo
      Una cita de aplicación que salió para el orto
      Lo que pasa en el baño del boliche
      Un chongo de gimnasio
      Tu jefe en el after
      Lo último que hiciste borracho
      El que se clavó el último fernet
      Una despedida de soltera desbordada
      El vecino que escucha todo
      La cama después del sábado
      Un trío de verduras
      Un garrón de cumpleaños
      Una pareja peleando en el súper
      El que manda audios de 8 minutos
      La tanga en la soga
      Un mensaje que no tenías que mandar
      Un telo con temática rara
      El que vuelve a las seis de la mañana
      Una suegra en bikini
      El cuñado que sabe de todo
      Un chape en el ascensor
      La cara de culo del lunes
      Tu plan del viernes a la noche
    `),
    // modo difícil: «quién» + «haciendo qué»
    quienes: L(`
      Un carpincho
      Tu abuela
      Un robot
      Un pingüino
      Un gaucho
      Una medialuna
      Un dinosaurio
      Un colectivero
      Un ñandú
      Una vaca
      Un fantasma
      Un mozo
      Un superhéroe jubilado
      Un tero
      Un astronauta
    `),
    haciendo: L(`
      haciendo un asado en la Luna
      tocando la guitarra arriba de un caballo
      en patineta por la 9 de Julio
      cebando mate en una tormenta
      jugando al truco con un pulpo
      escapando de una milanesa gigante
      bailando cumbia en el techo
      atendiendo un kiosco a la madrugada
      pescando en una pileta de lona
      dando clases de yoga a unas gallinas
      manejando un colectivo con globos
      sacándose una selfie con un ovni
      haciendo la fila del banco con un sapo
      vendiendo churros en la playa
    `),
    quienesAdultos: L(`
      Tu ex
      Tu suegra
      El cuñado
      Un chongo
      Tu jefe
      La vecina chusma
      Un patovica
      Una despedida de soltero
    `),
    haciendoAdultos: L(`
      en el after de la oficina
      volviendo del boliche a las siete
      escondido abajo de la cama
      mandando nudes por error
      en un telo con espejos
      con resaca en un bautismo
      chapando en el ascensor
      bailando arriba de la barra
    `),
    frases: L(`
      Hecho en el conurbano
      Pedí permiso a mi vieja
      Soy de los que vuelven
      Todo bien, nada bien
      Me cebo solo
      Ni idea, pero con onda
      Campeón de la siesta
      Llego tarde pero llego
      Esto lo pagó el aguinaldo
      No soy vago, ahorro energía
      Mamá, mirá
      Hoy no se fía, mañana sí
      Profesional del asado ajeno
      La dieta empieza el lunes
      Sobreviví a la reunión de padres
      Fui al súper y volví con esto
      El perro me eligió
      Tengo un amigo que tiene un amigo
      Mi abuela tenía razón
      En casa se come a las diez
      Esto es lo que hay
      Atendido por sus dueños
      El último que apague la luz
      Barrio, mate y facturas
      Nací para la sobremesa
      No me pidas que madrugue
      Cuidado: chiste malo
      Que lo pague el Estado
      Aguante el bondi
      Lo vi en un video
      Ni ahí
      Cero estrés, mucha birome
      Equipo de la merienda
      Por ahora todo tranqui
      Cuidado con el perro (es buenito)
    `),
    frasesAdultos: L(`
      Hoy no, me duele la cabeza
      El fernet no se mezcla solo
      Vuelvo a las seis, no me esperen
      Soltero pero ocupado
      Mi ex me extraña
      Recién salido de la previa
      Lo que pasa en el telo queda en el telo
      Garché más en sueños
      Mal de amores, bien de vino
      Tengo novio (imaginario)
      Me clavé el visto
      Bajo la lupa de mi suegra
      Ni casado ni muerto
      El chongo de la semana
      Resaca nivel domingo
      Divorciado y feliz
      No es tóxico, es intenso
      A esta hora todo vale
      Me porto mal los sábados
      Mi cama, mis reglas
      Busco suegra que no opine
      Le escribí borracho
      Vengo del after
      Tinder me tiene bloqueado
      Me casé por el catering
      Infiel al gimnasio
      Siempre listo, nunca dispuesto
      Hoy se sale, mañana se llora
      Yo no fui, fue el vino
      Mirame y no me toques
    `)
  };
  if (typeof module !== "undefined" && module.exports) module.exports = Banco; else raiz.Banco = Banco;
})(typeof window !== "undefined" ? window : globalThis);
