import {
  listAsignadas
} from '../../api/logistica.service.js';

const ROOT_ID =
  'logistica-asignadas-root';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function filtros(
  contenedor
) {
  return {
    periodo:
      contenedor.querySelector(
        '#asignadasPeriodo'
      )?.value || '',

    estado:
      contenedor.querySelector(
        '#asignadasEstado'
      )?.value || '',

    incidencia:
      contenedor.querySelector(
        '#asignadasIncidencia'
      )?.checked ||
      false,

    evidenciaPendiente:
      contenedor.querySelector(
        '#asignadasEvidencia'
      )?.checked ||
      false
  };
}

function render(
  contenedor,
  items
) {
  const zona =
    contenedor.querySelector(
      '#asignadasLista'
    );

  zona?.replaceChildren();

  items.forEach(
    item => {
      const article =
        document.createElement(
          'article'
        );

      article.className =
        'card logistica-asignacion-card';

      const titulo =
        document.createElement(
          'h2'
        );

      titulo.textContent =
        item.referencia;

      const fecha =
        document.createElement(
          'p'
        );

      fecha.textContent =
        item.fechaHoraTexto;

      const fase =
        document.createElement(
          'p'
        );

      fase.textContent =
        `Actividad: ${item.actividadSiguiente || item.fase}`;

      const estado =
        document.createElement(
          'p'
        );

      estado.textContent =
        `Estado: ${item.estadoTexto || item.estado}`;

      const detalle =
        document.createElement(
          'a'
        );

      detalle.href =
        item.tipoAsignacion ===
        'TRASLADO'
          ? `#/logistica/traslado?idRuta=${item.idRuta}`
          : `#/logistica/ejecucion?idOrden=${item.idOrden}&idFase=${item.idFase}`;

      detalle.textContent =
        'Abrir asignación';

      article.append(
        titulo,
        fecha,
        fase,
        estado,
        detalle
      );

      zona?.appendChild(
        article
      );
    }
  );

  const vacio =
    contenedor.querySelector(
      '#asignadasVacio'
    );

  if (vacio) {
    vacio.hidden =
      Boolean(items.length);
  }
}

async function consultar(
  contenedor
) {
  const estado =
    contenedor.querySelector(
      '#asignadasEstadoCarga'
    );

  estado.textContent =
    'Cargando...';

  try {
    const respuesta =
      await listAsignadas(
        filtros(
          contenedor
        )
      );

    const items =
      respuesta.items ||
      respuesta;

    render(
      contenedor,
      items
    );

    estado.textContent = '';
  } catch (error) {
    estado.textContent =
      error?.message ||
      'No fue posible consultar las asignaciones.';
  }
}

export function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  contenedor
    .querySelector(
      '#asignadasFiltros'
    )
    ?.addEventListener(
      'change',
      () =>
        consultar(
          contenedor
        )
    );

  consultar(
    contenedor
  );
}