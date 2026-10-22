/** Dataset ficticio neutral para las vistas previas; no forma parte de los componentes instalables. */
export const MOTION_PROJECTS = [
  {
    id: "biblioteca",
    name: "Biblioteca de barrio",
    summary: "Un equipo prepara dos objetivos para mejorar el acceso a los talleres de la biblioteca.",
    items: [
      {
        id: "acceso",
        title: "Facilitar el acceso",
        summary: "Inscripción clara y horarios visibles.",
        content:
          "Publicar un calendario accesible y reunir la información de inscripción en una sola página. La primera entrega incluye horarios, cupos y una forma de contacto. Meta ficticia: revisar el recorrido con cinco participantes.",
      },
      {
        id: "continuidad",
        title: "Sostener la participación",
        summary: "Un seguimiento simple entre talleres.",
        content:
          "Preparar una guía breve para cada sesión y un registro voluntario de intereses. El equipo revisará las preguntas recibidas antes de organizar el siguiente ciclo. Meta ficticia: completar dos ciclos de talleres.",
      },
    ],
    comments: {
      overview: "Explora uno de los objetivos. El contexto permanece visible cuando se abre el detalle.",
      detail:
        "Puedes abrir el otro objetivo o cambiar de proyecto: el objetivo elegido conserva su lugar y el contenido se actualiza con un fundido.",
    },
  },
  {
    id: "huerto",
    name: "Huerto comunitario",
    summary: "Otro proyecto con los mismos objetivos y contenidos distintos para probar el cambio de estado.",
    items: [
      {
        id: "acceso",
        title: "Facilitar el acceso",
        summary: "Primeras visitas sin barreras.",
        content:
          "Señalizar las zonas de cultivo y publicar los días de visita. El primer recorrido incluye un plano sencillo, las herramientas disponibles y las tareas aptas para principiantes. Meta ficticia: recibir a ocho personas nuevas.",
      },
      {
        id: "continuidad",
        title: "Sostener la participación",
        summary: "Turnos compartidos y tareas acotadas.",
        content:
          "Organizar turnos voluntarios y una ficha visible con las tareas de la semana. Cada grupo deja una nota para el turno siguiente. Meta ficticia: sostener cuatro semanas de cuidado compartido.",
      },
    ],
    comments: {
      overview: "Este proyecto usa la misma escena y conserva el orden de los objetivos.",
      detail:
        "El contenido pertenece ahora al huerto. La clave de contenido cambió sin cerrar ni volver a ampliar el objetivo.",
    },
  },
] as const;
