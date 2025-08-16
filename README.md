# 🎓 SPAN1001 Palabrero

## Un Juego de tipo wordle para Estudiantes de Español de la HKU

`SPAN1001 Palabrero` es una versión personalizada del popular juego de palabras Wordle, diseñada específicamente para los estudiantes del curso de español SPAN1001 en la Universidad de Hong Kong (HKU). El objetivo es reforzar el vocabulario aprendido en clase de una manera divertida e interactiva.

Cada día se presenta una nueva palabra extraída directamente del glosario del libro de texto **Aula Internacional Plus 1**, siguiendo el calendario de unidades del curso.

![Inserta aquí una captura de pantalla del juego]

---

## 🕹️ Juega Ahora

¡El juego está disponible online! No necesitas descargar ni instalar nada. Simplemente visita el siguiente enlace para empezar a jugar:

### 👉 [span1001palabrero.pablotorrado.site](https://span1001palabrero.pablotorrado.site)

---

## 🌟 Características

* **Vocabulario Dirigido**: Las palabras están 100% alineadas con el currículo del curso, organizadas por unidades.
* **Calendario Programado**: Las palabras aparecen en fechas específicas para coincidir con el progreso de los estudiantes a lo largo del semestre.
* **Pistas Creativas**: Cada palabra incluye una pista en inglés, diseñada para ser un desafío interesante sin ser demasiado obvia.
* **Sistema de Puntuación**: Incluye un cronómetro y puntos que incentivan una resolución rápida.
* **Seguimiento de Estadísticas**: El juego guarda localmente las partidas jugadas, el porcentaje de victorias y la racha actual.
* **Diseño Responsivo**: Totalmente funcional en ordenadores de escritorio y dispositivos móviles.

---

## 🛠️ Construido con

* **HTML5**: Para la estructura básica del juego.
* **CSS3**: Para los estilos, el diseño responsive y las animaciones.
* **JavaScript (Vanilla)**: Para toda la lógica del juego.

---

## 🎮 Cómo Jugar

1.  El objetivo es adivinar la palabra del día en un máximo de seis intentos.
2.  Introduce una palabra válida y pulsa Enter.
3.  Después de cada intento, el color de las casillas cambiará para mostrar qué tan cerca estás de acertar:
    * 🟩 **Verde**: La letra está en la palabra y en la posición correcta.
    * 🟧 **Naranja**: La letra está en la palabra, pero en la posición incorrecta.
    * ⬛ **Gris oscuro**: La letra no está en la palabra.
4.  ¡Usa estas pistas para adivinar la palabra antes de quedarte sin intentos!

---

## ✍️ Personalización

La principal ventaja de este proyecto es su facilidad de personalización. Todas las palabras del juego se gestionan desde el archivo `palabras.json`.

Para añadir, editar o eliminar palabras, simplemente modifica este archivo. Cada palabra sigue esta estructura:

```json
{
  "date": "YYYY-MM-DD",
  "word": "PALABRA",
  "hint": "Una pista creativa en inglés.",
  "unit": 1
}
