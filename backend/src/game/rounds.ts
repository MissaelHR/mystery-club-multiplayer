import { RoundDefinition } from "../../../shared/game";

export const rounds: RoundDefinition[] = [
  {
    id: "round-1",
    type: "clue-selection",
    title: "El salón del farol",
    storyText:
      "Un farol de latón ha desaparecido de la Mansión Moonquill. El cuidador encontró cuatro objetos cerca del estante vacío.",
    prompt: "¿Qué pista sugiere con más fuerza que el farol fue movido por la puerta del jardín?",
    inputLabel: "Selecciona la mejor pista",
    answerKind: "single-choice",
    options: [
      "Un trozo de mapa rasgado cubierto de musgo pálido",
      "Una cuchara de plata escondida bajo una cortina",
      "Una cuerda de violín enrollada en la pata de una silla",
      "La marca de una taza sobre el escritorio de la biblioteca",
    ],
    answer: "Un trozo de mapa rasgado cubierto de musgo pálido",
    explanation:
      "El musgo pálido conecta la pista con la húmeda puerta del jardín, así que es la señal más clara del recorrido.",
    timeLimitSec: 25,
  },
  {
    id: "round-2",
    type: "code-deciphering",
    title: "La cerradura susurrante",
    storyText:
      "Una vieja nota junto a la torre del reloj dice: 'Al anochecer, cada letra avanza un lugar.'",
    prompt: "Descifra el mensaje: MB MMBWF FTUB FO MB DBSQFUB",
    inputLabel: "Escribe el mensaje descifrado",
    answerKind: "text",
    answer: "LA LLAVE ESTA EN LA CARPETA",
    explanation:
      "Cada letra fue desplazada una posición hacia adelante, así que para descifrar hay que retroceder cada letra un lugar.",
    timeLimitSec: 30,
  },
  {
    id: "round-3",
    type: "memory-challenge",
    title: "El gabinete de curiosidades",
    storyText:
      "La puerta de un gabinete se abre por un instante y revela una secuencia de objetos escondidos en su interior.",
    prompt: "Cuando la secuencia desaparezca, escribe los objetos en el mismo orden separados por comas.",
    inputLabel: "Secuencia de objetos",
    answerKind: "text",
    answer: "BRUJULA, PLUMA, LLAVE, ESTRELLA",
    explanation:
      "El orden correcto era brújula, pluma, llave, estrella. Aquí la observación cuidadosa importa más que la velocidad.",
    timeLimitSec: 35,
    memorySequence: ["Brujula", "Pluma", "Llave", "Estrella"],
    memoryRevealMs: 6000,
  },
  {
    id: "round-4",
    type: "pattern-lock",
    title: "La ventana de símbolos",
    storyText:
      "Los cristales de colores de la ventana del observatorio forman un patrón. Solo una frase coincide con el orden desde el amanecer hasta el anochecer.",
    prompt: "Elige la frase que coincide con el patrón visible de símbolos: luna, ola, hoja, luna.",
    inputLabel: "Elige el patrón correcto",
    answerKind: "single-choice",
    options: [
      "Senda Lunar, Giro del Río, Paso del Helecho, Senda Lunar",
      "Campana Estelar, Paso del Helecho, Giro del Río, Senda Lunar",
      "Giro del Río, Senda Lunar, Paso del Helecho, Campana Estelar",
      "Senda Lunar, Senda Lunar, Giro del Río, Paso del Helecho",
    ],
    answer: "Senda Lunar, Giro del Río, Paso del Helecho, Senda Lunar",
    explanation:
      "Luna corresponde a Senda Lunar, ola a Giro del Río y hoja a Paso del Helecho, manteniendo toda la secuencia.",
    timeLimitSec: 25,
  },
  {
    id: "round-5",
    type: "final-deduction",
    title: "La deducción final",
    storyText:
      "Todas las pistas apuntan a una persona que escondió el farol para proteger un lugar secreto de reunión en los jardines de la mansión.",
    prompt: "¿Quién escondió el farol con mayor probabilidad, según las pistas reunidas durante el caso?",
    inputLabel: "Elige la deducción final",
    answerKind: "single-choice",
    options: [
      "Mira la cartógrafa, que conoce el sendero de la puerta con musgo",
      "Theo el profesor de violín, que permaneció en la sala de música",
      "Nell la panadera, que nunca salió del patio de la cocina",
      "Otis el cartero, que llegó después del atardecer",
    ],
    answer: "Mira la cartógrafa, que conoce el sendero de la puerta con musgo",
    explanation:
      "El fragmento de mapa con musgo y la ruta del jardín conectan directamente con el conocimiento de Mira sobre senderos ocultos al aire libre.",
    timeLimitSec: 30,
  },
];
