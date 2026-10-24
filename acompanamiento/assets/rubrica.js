/* Pauta de Observación y Retroalimentación de Aula · Innovación Pedagógica
 * Colegio María Montessori.
 * Dimensiones 1–3: interacciones pedagógicas (tiempo, ambiente socioafectivo, aprendizaje profundo).
 * Dimensión 4: Integración pedagógica de la IA.
 *
 * Cada indicador tiene:
 *   desc      descripción de lo que se evalúa
 *   observar  conductas concretas que el observador debe buscar en la clase
 *   niveles   descriptor observable de cada nivel (1 a 4)
 *   sug       sugerencias de acción para la retroalimentación
 */
(function () {
  const I = (id, nombre, desc, observar, niveles, sug, extra) => ({ id, nombre, desc, observar, niveles, sug, ...(extra || {}) });

  window.RUBRICA = {
    version: "2026-10b",
    // Criterios generales para decidir el nivel (aplican a todos los indicadores)
    niveles: [
      { n: 1, nombre: "Por desarrollar", corto: "PD", def: "La acción no ocurre durante la clase observada." },
      { n: 2, nombre: "En desarrollo", corto: "ED", def: "La acción ocurre, pero de forma aislada o irregular, solo con algunos estudiantes, o no logra su propósito." },
      { n: 3, nombre: "Desarrollado", corto: "D", def: "La acción ocurre de forma sistemática durante la clase, alcanza a la mayoría de los estudiantes y logra su propósito. Es el nivel esperado." },
      { n: 4, nombre: "Destacado", corto: "DS", def: "Cumple el nivel Desarrollado y, además, los estudiantes asumen un rol autónomo o protagónico en esa acción." }
    ],
    dimensiones: [
      {
        id: "D1", nombre: "Gestión del tiempo",
        sub: [{
          id: "1.1", nombre: "Uso eficiente del tiempo",
          ind: [
            I("1.1.1", "Implementación de rutinas",
              "El docente utiliza procedimientos conocidos por el curso para iniciar la clase, cambiar de actividad, organizar el trabajo y cerrar, de modo que los estudiantes saben qué hacer sin instrucciones extensas.",
              ["Inicio: saludo, objetivo o agenda visible y actividad de inicio.",
                "Transiciones con señales conocidas (cuenta regresiva, timbre, gesto).",
                "Procedimientos para pedir la palabra, repartir materiales y trabajar en grupo.",
                "Cierre con síntesis o ticket de salida."],
              ["No hay rutinas reconocibles: el inicio, las transiciones y el cierre se improvisan y los estudiantes no saben qué hacer sin instrucciones repetidas.",
                "Hay algunas rutinas, pero se aplican de forma irregular o los estudiantes no las siguen: el docente repite instrucciones y se pierde tiempo en el inicio o en las transiciones.",
                "Las rutinas de inicio, transición y cierre son claras y la mayoría de los estudiantes las sigue sin que el docente repita instrucciones; las actividades fluyen sin interrupciones.",
                "Además, los estudiantes ejecutan las rutinas de forma autónoma: asumen roles, comienzan el trabajo por sí mismos o guían a sus compañeros."],
              ["Establecer y visibilizar rutinas de inicio, transición y cierre (por ejemplo, agenda de la clase en la pizarra).",
                "Modelar y practicar explícitamente las rutinas al comienzo, reforzándolas de forma positiva.",
                "Asignar roles rotativos a estudiantes (encargado de materiales, del tiempo, de la tecnología) para promover autonomía."]),
            I("1.1.2", "Organización de los espacios educativos y recursos para el aprendizaje",
              "Los materiales, los recursos tecnológicos y la disposición de la sala están preparados y son adecuados a la actividad, de modo que no interrumpen el aprendizaje.",
              ["Materiales y recursos listos al inicio (guías, proyector, plataformas, dispositivos).",
                "Disposición del mobiliario acorde a la actividad (individual, parejas, grupos).",
                "Recursos accesibles para todos, incluidos quienes requieren apoyo.",
                "Forma ordenada de repartir y recoger materiales."],
              ["Los recursos no están preparados o no funcionan y la sala no está organizada para la actividad; esto impide o retrasa significativamente el trabajo.",
                "Los recursos están disponibles, pero con fallas o demoras (proyector que no funciona, copias que faltan) o la disposición de la sala dificulta parte de la actividad.",
                "Los recursos están preparados y funcionan, la disposición de la sala es adecuada a la actividad y todos los estudiantes acceden a los materiales sin pérdida de tiempo.",
                "Además, los estudiantes participan en la organización del espacio y los recursos: proponen la disposición o administran materiales y tecnología."],
              ["Preparar y probar con anticipación los recursos tecnológicos (proyector, conexión, plataformas, cuentas).",
                "Adecuar la disposición del mobiliario al tipo de actividad (individual, parejas, grupos).",
                "Invitar a los estudiantes a proponer y gestionar la organización de materiales y espacios."]),
            I("1.1.3", "Tiempo para el aprendizaje",
              "La mayor parte de la clase se dedica a actividades de aprendizaje: el docente comunica los tiempos, ajusta el ritmo y evita los tiempos muertos.",
              ["Proporción de la clase en que los estudiantes están trabajando en actividades de aprendizaje.",
                "Tiempos comunicados para cada actividad (temporizador, avisos).",
                "Actividades previstas para quienes terminan antes.",
                "Ajuste del ritmo cuando el curso se adelanta o se atrasa."],
              ["Gran parte de la clase (más de un tercio) se pierde en tiempos muertos, esperas o actividades sin relación con el aprendizaje.",
                "Se dedica tiempo al aprendizaje, pero hay periodos de espera o inactividad relevantes (estudiantes que terminan y no tienen qué hacer, demoras largas) o el ritmo no se ajusta al curso.",
                "Casi toda la clase se dedica a actividades de aprendizaje: los tiempos se comunican, las esperas son breves y el docente ajusta el ritmo cuando es necesario.",
                "Además, los estudiantes gestionan su propio tiempo: controlan los plazos y avanzan a actividades de extensión por iniciativa propia."],
              ["Comunicar el tiempo asignado a cada actividad y usar un temporizador visible.",
                "Planificar actividades de extensión para quienes terminan antes y apoyos para quienes necesitan más tiempo.",
                "Reducir los tiempos muertos en transiciones y en la puesta en marcha de recursos digitales."])
          ]
        }]
      },
      {
        id: "D2", nombre: "Ambiente socioafectivo para el aprendizaje",
        sub: [
          {
            id: "2.1", nombre: "Relaciones seguras y sensibles",
            ind: [
              I("2.1.1", "Altas expectativas educativas",
                "El docente comunica, con palabras y acciones, que todos los estudiantes pueden aprender y lograr desafíos exigentes, y trata el error como parte del aprendizaje.",
                ["Mensajes de confianza en las capacidades («tú puedes», «inténtalo de nuevo»).",
                  "Tareas y preguntas desafiantes para todo el curso, no solo para algunos.",
                  "Participación distribuida: pregunta también a quienes no levantan la mano.",
                  "Respuesta al error: lo analiza en lugar de sancionarlo o ignorarlo."],
                ["No se observan mensajes de confianza ni desafíos; se expresan bajas expectativas («esto es muy difícil para ustedes») o el error se sanciona o se ignora.",
                  "Hay mensajes de confianza o desafíos, pero son ocasionales o dirigidos solo a algunos estudiantes; el error se corrige sin aprovecharlo para aprender.",
                  "El docente plantea desafíos a todo el curso, distribuye la participación, expresa confianza en sus capacidades y usa los errores como oportunidad de aprendizaje.",
                  "Además, los estudiantes se plantean metas, persisten ante la dificultad o piden apoyo por iniciativa propia, y valoran el error como parte del aprendizaje."],
                ["Verbalizar confianza en las capacidades de todos los estudiantes y plantear desafíos alcanzables pero exigentes.",
                  "Tratar el error como oportunidad de aprendizaje, analizándolo en conjunto.",
                  "Distribuir la participación de forma equitativa (por ejemplo, palitos con nombres) y no solo a quienes levantan la mano."]),
              I("2.1.2", "Responsividad",
                "El docente detecta y responde a tiempo las necesidades académicas, socioemocionales o físicas de los estudiantes, y ajusta la actividad cuando es necesario.",
                ["Circula por la sala y se acerca a quienes tienen dificultades.",
                  "Responde preguntas y solicitudes con atención y a tiempo.",
                  "Atiende señales de malestar, cansancio o desmotivación.",
                  "Ajusta la explicación o la actividad cuando muchos no comprenden."],
                ["No se atienden las dudas, solicitudes ni señales de dificultad de los estudiantes, o se responden de forma descalificadora.",
                  "Se atiende solo a algunos estudiantes o a quienes piden ayuda, con respuestas tardías o generales; no se ajusta la actividad aunque haya dificultades evidentes.",
                  "El docente detecta a tiempo las necesidades (circula, observa, pregunta), apoya de forma individual o grupal y ajusta la actividad cuando es necesario.",
                  "Además, se anticipa a las necesidades ofreciendo opciones de apoyo o de trabajo según intereses, y los estudiantes se apoyan entre ellos."],
                ["Circular por la sala durante el trabajo autónomo para detectar y atender dudas oportunamente.",
                  "Ajustar la actividad en curso cuando se evidencian dificultades o desinterés.",
                  "Ofrecer opciones de respuesta o de actividad según intereses y necesidades (principios DUA)."]),
              I("2.1.3", "Comodidad de los y las estudiantes",
                "Los estudiantes se ven tranquilos y seguros para participar, preguntar y equivocarse sin temor a burlas o sanciones.",
                ["Los estudiantes participan voluntariamente y hacen preguntas.",
                  "Se arriesgan a responder aunque no estén seguros.",
                  "Clima sin burlas ni tensión; trato cálido del docente.",
                  "Variedad de formas de participar (oral, escrita, en parejas)."],
                ["Los estudiantes se muestran inhibidos o tensos: no participan, no preguntan o hay burlas que el docente no aborda.",
                  "Participan algunos estudiantes, mientras otros se mantienen al margen o evitan exponerse; el docente promueve la participación de forma limitada.",
                  "La mayoría de los estudiantes participa con tranquilidad, pregunta y se arriesga a responder; el docente acoge las intervenciones y ofrece distintas formas de participar.",
                  "Además, los estudiantes participan espontáneamente, expresan dudas o desacuerdos con confianza y se animan entre ellos."],
                ["Generar instancias de participación de bajo riesgo (pensar-parejas-compartir, pizarras individuales).",
                  "Acoger con calidez las intervenciones, validando el esfuerzo y no solo la respuesta correcta.",
                  "Acordar con el curso normas de participación que den seguridad para opinar."])
            ]
          },
          {
            id: "2.2", nombre: "Convivencia armónica",
            ind: [
              I("2.2.1", "Comunicación respetuosa",
                "El trato entre docente y estudiantes, y entre estudiantes, es respetuoso en el lenguaje verbal y no verbal; el docente modela y resguarda ese trato.",
                ["Lenguaje y tono respetuosos del docente.",
                  "Escucha y respeto de turnos entre estudiantes.",
                  "Intervención oportuna ante faltas de respeto.",
                  "Uso de normas de convivencia acordadas."],
                ["Se observan faltas de respeto (gritos, descalificaciones, burlas) que el docente no aborda o en las que participa.",
                  "El trato es mayormente respetuoso, pero hay faltas de respeto entre estudiantes que se abordan tarde o solo con sanción, sin un enfoque formativo.",
                  "El trato es respetuoso durante toda la clase; el docente modela un lenguaje respetuoso y aborda las faltas de manera oportuna y formativa.",
                  "Además, los estudiantes regulan su propia convivencia: respetan turnos, se escuchan y resuelven diferencias de forma autónoma y respetuosa."],
                ["Modelar un lenguaje respetuoso y explicitar normas de escucha activa y turnos de habla.",
                  "Intervenir de manera formativa y oportuna ante faltas de respeto entre estudiantes.",
                  "Reconocer públicamente las interacciones respetuosas y colaborativas."]),
              I("2.2.2", "Valoración de la diversidad",
                "Se reconocen y valoran las diferencias entre los estudiantes (culturales, de género, de aprendizaje, neurodiversidad, entre otras) y se evita cualquier forma de discriminación.",
                ["Lenguaje inclusivo y sin estereotipos.",
                  "Ejemplos y recursos que representan la diversidad del curso.",
                  "Ajustes para estudiantes con necesidades de apoyo (DUA, PIE).",
                  "Mediación ante comentarios discriminatorios."],
                ["No se consideran las diferencias entre los estudiantes, o hay expresiones discriminatorias o estereotipos que el docente no aborda.",
                  "Se evitan expresiones discriminatorias, pero la diversidad no se considera en las actividades ni en los recursos; los ajustes para estudiantes con necesidades de apoyo son escasos.",
                  "El docente usa lenguaje inclusivo, incorpora recursos o ejemplos diversos, hace ajustes para quienes los requieren y media ante cualquier expresión discriminatoria.",
                  "Además, la diversidad se aborda como contenido o valor en la clase, y los estudiantes reflexionan sobre ella o la integran en su trabajo."],
                ["Usar un lenguaje inclusivo que no reproduzca estereotipos de género, culturales o sociales.",
                  "Incorporar ejemplos, imágenes y recursos que representen la diversidad del curso.",
                  "Diversificar las formas de representación, expresión y participación (DUA)."])
            ]
          }
        ]
      },
      {
        id: "D3", nombre: "Apoyo al aprendizaje profundo",
        sub: [
          {
            id: "3.1", nombre: "Construcción de sentidos",
            ind: [
              I("3.1.1", "Conexión con las experiencias previas",
                "El docente activa y utiliza los conocimientos previos y las experiencias de los estudiantes y de su entorno para dar sentido a los nuevos aprendizajes.",
                ["Preguntas o actividades para activar conocimientos previos.",
                  "Ejemplos cercanos a la vida y el contexto de los estudiantes.",
                  "Propósito de la clase explicitado y su utilidad.",
                  "Uso de los aportes de los estudiantes en la explicación."],
                ["La clase no se conecta con los conocimientos previos ni con las experiencias de los estudiantes; el contenido se presenta de forma aislada.",
                  "Se mencionan conocimientos previos o ejemplos cercanos, pero de forma breve o solo por parte del docente, sin usarlos para construir el nuevo aprendizaje.",
                  "Se activan los conocimientos previos y se usan ejemplos o experiencias de los estudiantes para construir el nuevo aprendizaje; el propósito de la clase se explicita.",
                  "Además, los estudiantes aportan sus propias experiencias o aprendizajes de fuera del colegio y estos se integran en el desarrollo de la clase."],
                ["Activar conocimientos previos con preguntas o situaciones cercanas al contexto de los estudiantes.",
                  "Explicitar el propósito de la clase y su relación con la vida cotidiana.",
                  "Invitar a los estudiantes a aportar aprendizajes construidos dentro y fuera del colegio."]),
              I("3.1.2", "Organización o práctica de lo aprendido",
                "Los estudiantes tienen oportunidades durante la clase para practicar, aplicar y organizar lo aprendido.",
                ["Práctica guiada y luego práctica independiente.",
                  "Tareas de aplicación a situaciones nuevas.",
                  "Organizadores gráficos, síntesis o esquemas.",
                  "Tiempo suficiente para practicar."],
                ["Los estudiantes no practican ni aplican lo aprendido: la clase es principalmente exposición del docente o copia.",
                  "Hay práctica, pero es breve, mecánica (ejercicios repetitivos) o solo la realizan algunos estudiantes.",
                  "Todos los estudiantes practican y aplican lo aprendido en actividades con progresión (de guiada a independiente) y organizan la información.",
                  "Además, los estudiantes aplican lo aprendido en situaciones nuevas o auténticas, eligiendo cómo resolverlas o representarlas."],
                ["Incluir práctica guiada y luego práctica independiente con complejidad creciente.",
                  "Usar organizadores gráficos para que los estudiantes estructuren lo aprendido.",
                  "Plantear tareas de aplicación auténticas o de resolución de problemas."])
            ]
          },
          {
            id: "3.2", nombre: "Acompañamiento formativo",
            ind: [
              I("3.2.1", "Monitoreo del proceso de aprendizaje",
                "El docente recoge evidencia durante la clase sobre lo que los estudiantes están comprendiendo, para detectar dificultades y ofrecer apoyo.",
                ["Preguntas de verificación a distintos estudiantes.",
                  "Estrategias para recoger respuestas de todos (pizarras, tarjetas, ticket de salida).",
                  "Revisión del trabajo mientras los estudiantes trabajan.",
                  "Uso de la evidencia para ajustar la enseñanza."],
                ["No se verifica la comprensión, o solo se pregunta «¿entendieron?» sin recoger evidencia.",
                  "Se verifica la comprensión de algunos estudiantes (los que responden voluntariamente) o en un solo momento, sin usar la información para ajustar la enseñanza.",
                  "Se recoge evidencia de la comprensión de la mayoría del curso en distintos momentos y se usa para apoyar a quienes tienen dificultades o ajustar la clase.",
                  "Además, los estudiantes monitorean su propio avance (con criterios, listas de cotejo o semáforos) y comunican sus dificultades."],
                ["Usar estrategias de evaluación formativa en distintos momentos (tarjetas, pulgares, ticket de salida).",
                  "Formular preguntas que exijan explicar el razonamiento, no solo responder sí o no.",
                  "Registrar la evidencia recogida para ajustar la enseñanza en la misma clase o la siguiente."]),
              I("3.2.2", "Retroalimentación del proceso de aprendizaje",
                "El docente entrega a los estudiantes información específica sobre lo logrado y lo que falta mejorar, y les da oportunidad de usarla.",
                ["Retroalimentación específica: qué está bien, qué mejorar y cómo.",
                  "Referida al objetivo o a criterios conocidos.",
                  "Tiempo para que los estudiantes corrijan o mejoren.",
                  "Retroalimentación entre pares."],
                ["No se entrega retroalimentación, o se limita a «bien/mal» o a la nota.",
                  "Se entrega retroalimentación general o solo a algunos estudiantes, sin indicar cómo mejorar ni dar tiempo para usarla.",
                  "Se entrega retroalimentación específica y oportuna, referida al objetivo, que indica qué está logrado y cómo mejorar; los estudiantes tienen tiempo para usarla.",
                  "Además, los estudiantes se retroalimentan entre pares o se autoevalúan con criterios claros y mejoran su trabajo a partir de ello."],
                ["Entregar retroalimentación específica y descriptiva, referida al objetivo y no solo a la nota.",
                  "Dar tiempo para que los estudiantes usen la retroalimentación y mejoren su trabajo.",
                  "Promover la retroalimentación entre pares con criterios claros."])
            ]
          },
          {
            id: "3.3", nombre: "Pensamiento de orden superior",
            ind: [
              I("3.3.1", "Oportunidad de pensar creativamente",
                "Los estudiantes tienen oportunidades para generar ideas, soluciones o productos propios y originales.",
                ["Tareas abiertas con más de una respuesta posible.",
                  "Posibilidad de elegir el formato del producto.",
                  "Valoración de ideas originales.",
                  "Tiempo para proponer y probar ideas."],
                ["Las actividades solo admiten una respuesta o la reproducción de un modelo; no hay espacio para ideas propias.",
                  "Hay alguna actividad abierta, pero muy guiada o breve, y la mayoría de los estudiantes reproduce lo que propone el docente.",
                  "Hay actividades abiertas en que los estudiantes generan ideas, soluciones o productos propios, y el docente valora la originalidad.",
                  "Además, los estudiantes deciden el enfoque o el formato de su trabajo y crean productos originales que comparten o mejoran con sus pares."],
                ["Plantear tareas abiertas con más de una solución posible.",
                  "Permitir que los estudiantes elijan el formato de su producto (afiche, cómic, audio, maqueta).",
                  "Usar la IA como punto de partida para que los estudiantes mejoren, transformen o superen una propuesta."]),
              I("3.3.2", "Oportunidad de pensar críticamente",
                "Los estudiantes analizan problemas o situaciones, consideran distintas perspectivas y fundamentan sus opiniones y decisiones.",
                ["Preguntas de por qué, cómo y qué pasaría si.",
                  "Contraste de fuentes o puntos de vista (incluidas respuestas de IA).",
                  "Exigencia de fundamentar las respuestas.",
                  "Debates o discusiones."],
                ["Las preguntas son solo de memoria o de respuesta literal; no se pide analizar ni fundamentar.",
                  "Se plantean algunas preguntas de análisis, pero el docente responde por los estudiantes o acepta respuestas sin fundamento.",
                  "Se plantean preguntas o problemas que exigen analizar y fundamentar; los estudiantes argumentan sus respuestas y consideran otras perspectivas.",
                  "Además, los estudiantes debaten entre ellos, contraargumentan y evalúan la validez de fuentes o afirmaciones por iniciativa propia."],
                ["Formular preguntas de por qué, cómo y qué pasaría si, que exijan fundamentar.",
                  "Contrastar fuentes o puntos de vista, incluyendo respuestas generadas por IA, para evaluar su validez.",
                  "Organizar debates o discusiones breves con roles definidos."]),
              I("3.3.3", "Oportunidad de pensar metacognitivamente",
                "Los estudiantes reflexionan sobre cómo aprenden: planifican, monitorean y evalúan su trabajo, e identifican qué mejorar.",
                ["Preguntas metacognitivas (¿qué aprendí?, ¿cómo lo hice?, ¿qué me costó?).",
                  "Pautas de autoevaluación o coevaluación.",
                  "Explicitación de estrategias para resolver tareas.",
                  "Reflexión al cierre sobre el proceso."],
                ["No se promueve que los estudiantes reflexionen sobre su forma de aprender.",
                  "Se hace alguna pregunta de reflexión, generalmente al final y de forma superficial (por ejemplo, «¿les gustó la clase?»).",
                  "Se promueve que los estudiantes reflexionen sobre su proceso, identifiquen dificultades y estrategias, y usen pautas de autoevaluación o coevaluación.",
                  "Además, los estudiantes ajustan sus estrategias durante la clase a partir de su reflexión y lo explicitan."],
                ["Incluir preguntas metacognitivas en el cierre (¿qué aprendí?, ¿cómo lo aprendí?, ¿qué me costó?).",
                  "Usar pautas de autoevaluación y coevaluación con criterios comprensibles.",
                  "Pedir a los estudiantes que reflexionen sobre cómo les ayudó (o no) la herramienta de IA en su aprendizaje."])
            ]
          }
        ]
      },
      {
        id: "D4", nombre: "Integración pedagógica de la Inteligencia Artificial",
        sub: [
          {
            id: "4.1", nombre: "Diseño y preparación con IA",
            ind: [
              I("4.1.1", "Planificación apoyada con IA",
                "La clase fue planificada o mejorada con apoyo de IA, y el docente revisó y ajustó la propuesta al curso y al objetivo de aprendizaje.",
                ["Planificación o diseño de la clase elaborado con IA (solicitar la evidencia).",
                  "Coherencia de las actividades con el objetivo de aprendizaje.",
                  "Ajustes del docente a la propuesta de la IA (contexto, nivel, DUA).",
                  "El docente puede explicar cómo usó la IA."],
                ["No se evidencia uso de IA en la planificación de la clase.",
                  "Hay planificación con IA, pero es genérica: no está ajustada al curso, tiene incoherencias con el objetivo o el docente no la revisó.",
                  "La planificación con IA es coherente con el objetivo y está ajustada al curso; el docente puede explicar qué tomó de la IA y qué modificó.",
                  "Además, la IA se usó para diversificar la clase (distintos niveles, ritmos o formatos según DUA) y la experiencia se compartió en la CPA."],
                ["Usar instrucciones (prompts) que incluyan el objetivo de aprendizaje, el nivel, el contexto del curso y las necesidades de apoyo.",
                  "Revisar y ajustar siempre la propuesta de la IA según el currículum y el conocimiento del curso.",
                  "Compartir en la CPA los prompts que funcionaron y las decisiones de ajuste tomadas."],
                { evidencia: true }),
              I("4.1.2", "Materiales y recursos elaborados con IA",
                "Los materiales usados en la clase (guías, textos, imágenes, presentaciones) fueron elaborados o adaptados con IA, son correctos y adecuados al curso.",
                ["Materiales elaborados o adaptados con IA (solicitar la evidencia).",
                  "Exactitud del contenido (sin errores).",
                  "Adecuación al nivel y al contexto del curso.",
                  "Versiones o apoyos para distintos estudiantes."],
                ["No se usan materiales elaborados o adaptados con IA.",
                  "Se usan materiales con IA, pero tienen errores, no se ajustan al nivel del curso o no aportan al objetivo.",
                  "Los materiales con IA son correctos, se ajustan al nivel y contexto del curso y apoyan el logro del objetivo.",
                  "Además, los materiales ofrecen versiones o apoyos diferenciados (distintos niveles de lectura, apoyos visuales) y despiertan el interés de los estudiantes."],
                ["Verificar la exactitud de los contenidos generados antes de llevarlos al aula.",
                  "Generar versiones del material con distintos niveles de lectura o apoyos visuales.",
                  "Contextualizar ejemplos e imágenes a la realidad del curso y del colegio."],
                { evidencia: true })
            ]
          },
          {
            id: "4.2", nombre: "Implementación en el aula",
            ind: [
              I("4.2.1", "Uso de la IA al servicio del objetivo de aprendizaje",
                "La IA se usa durante la clase con un propósito pedagógico claro, conectado con el objetivo de aprendizaje.",
                ["Momento de la clase en que se usa la IA.",
                  "Propósito explicado a los estudiantes.",
                  "Aporte de la IA al logro del objetivo.",
                  "Plan alternativo ante fallas técnicas."],
                ["No se usa IA durante la clase.",
                  "Se usa IA, pero de forma accesoria o decorativa (por ejemplo, una imagen o un video sin relación con el objetivo) o con fallas técnicas que interrumpen la clase.",
                  "La IA se usa en un momento definido, con un propósito explicado a los estudiantes, y aporta claramente al logro del objetivo.",
                  "Además, el uso de la IA permite una experiencia de aprendizaje que no sería posible sin ella (simulación, personalización, creación)."],
                ["Explicitar a los estudiantes para qué se usará la IA en la actividad.",
                  "Planificar el momento de la clase en que la IA aporta más valor (inicio, desarrollo o cierre).",
                  "Tener un plan alternativo ante fallas de conexión o de la herramienta."])
            ]
          },
          {
            id: "4.3", nombre: "Evaluación y uso ético",
            ind: [
              I("4.3.1", "Evaluación formativa apoyada con IA",
                "Durante la clase se usan estrategias o instrumentos de evaluación formativa elaborados o enriquecidos con IA, y la información recogida se usa para ajustar la enseñanza.",
                ["Instrumento o preguntas elaboradas con IA (ticket de salida, rúbrica, preguntas de monitoreo).",
                  "Alineación con el objetivo de la clase.",
                  "Uso de la información para retroalimentar o ajustar.",
                  "Participación de todo el curso en la evaluación."],
                ["No se usa IA en la evaluación formativa de la clase.",
                  "Se usa un instrumento elaborado con IA, pero es genérico, no está alineado con el objetivo o la información recogida no se usa.",
                  "El instrumento elaborado con IA está alineado con el objetivo, se aplica a todo el curso y su información se usa para retroalimentar o ajustar la enseñanza.",
                  "Además, la evaluación se diversifica en niveles o formatos y promueve la autoevaluación o coevaluación de los estudiantes."],
                ["Elaborar con IA preguntas de monitoreo de distintos niveles de complejidad para usar en el desarrollo de la clase.",
                  "Generar con IA tickets de salida o rúbricas y ajustarlos a los criterios y al lenguaje del curso.",
                  "Analizar con apoyo de IA las respuestas de los estudiantes para decidir ajustes en la siguiente clase."],
                { evidencia: true }),
              I("4.3.2", "Uso ético, crítico y responsable de la IA",
                "El docente promueve un uso responsable de la IA: verificar la información, reconocer errores y sesgos, transparentar su uso y proteger los datos personales.",
                ["Verificación de la información generada por IA.",
                  "Mención de errores, sesgos o límites de la IA.",
                  "Transparencia sobre el uso de IA (qué hizo la IA y qué hizo la persona).",
                  "Resguardo de datos personales (no ingresar nombres ni información sensible)."],
                ["No se abordan aspectos éticos ni se verifica la información generada por IA.",
                  "Se menciona algún aspecto ético de forma breve o aislada, sin modelarlo ni practicarlo.",
                  "El docente modela explícitamente el uso responsable: verifica la información, transparenta su uso de la IA y resguarda los datos personales.",
                  "Además, los estudiantes reflexionan sobre los límites, sesgos o autoría de la IA y construyen acuerdos de uso responsable."],
                ["Mostrar ejemplos de errores o sesgos de la IA y analizarlos con el curso.",
                  "Acordar con los estudiantes normas de uso: citar la IA, no ingresar datos personales, verificar con otras fuentes.",
                  "Explicitar qué parte del trabajo es del estudiante y qué parte fue apoyada por IA."])
            ]
          }
        ]
      }
    ],
    // Evidencias que el docente presenta sobre su clase con IA (solo para registro interno)
    evidenciasIA: [
      "Planificación elaborada o mejorada con IA",
      "Material o recurso elaborado con IA",
      "Instrumento de evaluación o retroalimentación con IA",
      "Uso de IA durante la clase",
      "Diseño trabajado en la CPA"
    ],
    usosIA: ["Planificación", "Materiales", "Evaluación", "Retroalimentación", "Desarrollo de la clase"]
  };
})();

// Utilidades compartidas
window.RUB = (function () {
  const R = window.RUBRICA;
  const indicadores = [];
  R.dimensiones.forEach(d => d.sub.forEach(s => s.ind.forEach(i => indicadores.push({ ...i, dim: d.id, dimNombre: d.nombre, sub: s.id, subNombre: s.nombre }))));
  const porId = Object.fromEntries(indicadores.map(i => [i.id, i]));
  function promedio(arr) { const v = arr.filter(x => typeof x === "number" && x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
  function promediosObs(niveles) {
    const out = {};
    R.dimensiones.forEach(d => {
      out[d.id] = promedio(indicadores.filter(i => i.dim === d.id).map(i => niveles[i.id]));
    });
    out.general = promedio(indicadores.map(i => niveles[i.id]));
    return out;
  }
  function nivelNombre(n) { const x = R.niveles.find(l => l.n === Math.round(n)); return x ? x.nombre : "—"; }
  function fmt(n) { return n == null ? "—" : n.toFixed(1).replace(".", ","); }
  function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  return { indicadores, porId, promedio, promediosObs, nivelNombre, fmt, esc };
})();
