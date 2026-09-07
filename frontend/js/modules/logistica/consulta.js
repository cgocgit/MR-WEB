import {
  listarConsultaLogistica
} from '../../api/logistica.service.js';

const ROOT_ID =
  'logistica-consulta-root';

const STORAGE_KEY =
  'mr_logistica_consulta_estado';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function crearTexto(
  etiqueta,
  valor
) {
  const elemento =
    document.createElement(
      etiqueta
    );

  elemento.textContent =
    valor ?? '—';

  return elemento;
}

function filtros(
  contenedor
) {
  return {
    periodo:
      contenedor.querySelector(
        '#consultaPeriodo'
      )?.value || '',

    orden:
      contenedor.querySelector(
        '#consultaOrden'
      )?.value.trim() || '',

    ruta:
      contenedor.querySelector(
        '#consultaRuta'
      )?.value.trim() || '',

    fase:
      contenedor.querySelector(
        '#consultaFase'
      )?.value || '',

    responsable:
      contenedor.querySelector(
        '#consultaResponsable'
      )?.value.trim() || '',

    placa:
      contenedor.querySelector(
        '#consultaPlaca'
      )?.value.trim() || '',

    tiempo:
      contenedor.querySelector(
        '#consultaTiempo'
      )?.value || '',

    incidencia:
      contenedor.querySelector(
        '#consultaIncidencia'
      )?.value || ''
  };
}

function renderLista(
  contenedor,
  items
) {
  const tbody =
    contenedor.querySelector(
      '#consultaListaBody'
    );

  tbody?.replaceChildren();

  items.forEach(
    item => {
      const tr =
        document.createElement(
          'tr'
        );

      [
        item.fechaHoraTexto,
        item.referencia,
        item.clienteDestino,
        item.fase,
        item.responsable,
        item.placaVehiculo,
        item.situacionTiempo,
        item.incidenciasAbiertas
      ].forEach(
        dato =>
          tr.appendChild(
            crearTexto(
              'td',
              dato
            )
          )
      );

      tr.addEventListener(
        'click',
        () => {
          location.hash =
            item.idRuta
              ? `#/logistica/rutas/detalle?idRuta=${item.idRuta}`
              : `#/logistica/orden/detalle?idOrden=${item.idOrden}`;
        }
      );

      tbody?.appendChild(tr);
    }
  );
}

function renderCalendario(
  contenedor,
  items
) {
  const zona =
    contenedor.querySelector(
      '#consultaCalendario'
    );

  zona?.replaceChildren();

  const porFecha =
    new Map();

  items.forEach(
    item => {
      const fecha =
        item.fecha ||
        item.fechaHora
          ?.slice(0, 10) ||
        'Sin fecha';

      if (!porFecha.has(fecha)) {
        porFecha.set(
          fecha,
          []
        );
      }

      porFecha.get(fecha).push(
        item
      );
    }
  );

  porFecha.forEach(
    (eventos, fecha) => {
      const columna =
        document.createElement(
          'section'
        );

      columna.className =
        'logistica-calendario-dia';

      const titulo =
        document.createElement(
          'h3'
        );

      titulo.textContent =
        fecha;

      columna.appendChild(
        titulo
      );

      eventos.forEach(
        evento => {
          const enlace =
            document.createElement(
              'a'
            );

          enlace.className =
            'logistica-calendario-evento';

          enlace.href =
            evento.idRuta
              ? `#/logistica/rutas/detalle?idRuta=${evento.idRuta}`
              : `#/logistica/orden/detalle?idOrden=${evento.idOrden}`;

          enlace.append(
            crearTexto(
              'strong',
              evento.hora ||
              evento.fechaHoraTexto
            ),

            crearTexto(
              'span',
              evento.referencia
            ),

            crearTexto(
              'span',
              evento.fase
            )
          );

          columna.appendChild(
            enlace
          );
        }
      );

      zona?.appendChild(
        columna
      );
    }
  );
}

async function consultar(
  contenedor
) {
  const estado =
    contenedor.querySelector(
      '#consultaEstado'
    );

  estado.textContent =
    'Cargando...';

  try {
    const vista =
      contenedor.querySelector(
        '#consultaVista'
      )?.value || 'LISTA';

    const respuesta =
      await listarConsultaLogistica({
        ...filtros(
          contenedor
        ),

        vista
      });

    const items =
      respuesta.items ||
      respuesta;

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        filtros:
          filtros(
            contenedor
          ),
        vista
      })
    );

    const lista =
      contenedor.querySelector(
        '#consultaLista'
      );

    const calendario =
      contenedor.querySelector(
        '#consultaCalendario'
      );

    if (vista === 'LISTA') {
      lista.hidden = false;
      calendario.hidden = true;

      renderLista(
        contenedor,
        items
      );
    } else {
      lista.hidden = true;
      calendario.hidden = false;

      renderCalendario(
        contenedor,
        items
      );
    }

    estado.textContent =
      items.length
        ? ''
        : 'Sin resultados para los filtros seleccionados.';
  } catch (error) {
    estado.textContent =
      error?.message ||
      'No fue posible consultar la operación.';
  }
}

function restaurar(
  contenedor
) {
  let guardado = null;

  try {
    guardado =
      JSON.parse(
        sessionStorage.getItem(
          STORAGE_KEY
        )
      );
  } catch {
    guardado = null;
  }

  if (!guardado) {
    return;
  }

  const mapa = {
    consultaPeriodo:
      guardado.filtros
        ?.periodo,

    consultaOrden:
      guardado.filtros
        ?.orden,

    consultaRuta:
      guardado.filtros
        ?.ruta,

    consultaFase:
      guardado.filtros
        ?.fase,

    consultaResponsable:
      guardado.filtros
        ?.responsable,

    consultaPlaca:
      guardado.filtros
        ?.placa,

    consultaTiempo:
      guardado.filtros
        ?.tiempo,

    consultaIncidencia:
      guardado.filtros
        ?.incidencia,

    consultaVista:
      guardado.vista
  };

  Object.entries(
    mapa
  ).forEach(
    ([id, contenido]) => {
      const control =
        contenedor.querySelector(
          `#${id}`
        );

      if (
        control &&
        contenido != null
      ) {
        control.value =
          contenido;
      }
    }
  );
}

export function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  restaurar(
    contenedor
  );

  contenedor
    .querySelector(
      '#consultaForm'
    )
    ?.addEventListener(
      'submit',
      event => {
        event.preventDefault();
        consultar(
          contenedor
        );
      }
    );

  contenedor
    .querySelector(
      '#consultaVista'
    )
    ?.addEventListener(
      'change',
      () =>
        consultar(
          contenedor
        )
    );

  contenedor
    .querySelector(
      '#consultaLimpiar'
    )
    ?.addEventListener(
      'click',
      () => {
        contenedor
          .querySelector(
            '#consultaForm'
          )
          ?.reset();

        sessionStorage
          .removeItem(
            STORAGE_KEY
          );

        consultar(
          contenedor
        );
      }
    );

  consultar(
    contenedor
  );
}