import {
  listarRutas
} from '../../api/logistica.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

const ROOT_ID =
  'logistica-rutas-root';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function td(
  valor
) {
  const elemento =
    document.createElement('td');

  elemento.textContent =
    valor ?? '—';

  return elemento;
}

function filtros(
  contenedor
) {
  return {
    fecha:
      contenedor.querySelector(
        '#rutasFecha'
      )?.value || '',

    placa:
      contenedor.querySelector(
        '#rutasPlaca'
      )?.value.trim() || '',

    responsable:
      contenedor.querySelector(
        '#rutasResponsable'
      )?.value.trim() || ''
  };
}

function render(
  contenedor,
  items
) {
  const tbody =
    contenedor.querySelector(
      '#rutasBody'
    );

  tbody?.replaceChildren();

  const gestionar =
    hasPermission(
      getSession(),
      'logistica.gestionar'
    );

  items.forEach(
    item => {
      const tr =
        document.createElement(
          'tr'
        );

      const acciones =
        document.createElement(
          'td'
        );

      const detalle =
        document.createElement(
          'a'
        );

      detalle.href =
        `#/logistica/rutas/detalle?idRuta=${item.idRuta}`;

      detalle.textContent =
        'Consultar';

      acciones.appendChild(
        detalle
      );

      if (gestionar) {
        const texto =
          document.createTextNode(
            ' · '
          );

        const reprogramar =
          document.createElement(
            'a'
          );

        reprogramar.href =
          `#/logistica/programacion/formulario?idOrden=${item.ordenPrincipal}`;

        reprogramar.textContent =
          'Reprogramar';

        acciones.append(
          texto,
          reprogramar
        );
      }

      tr.append(
        td(item.identificador),
        td(item.fechaTexto),
        td(item.placaVehiculo),
        td(item.chofer),
        td(item.representante),
        td(item.numeroOrdenes),
        td(item.numeroParadas),
        td(item.primeraSalidaTexto),
        td(item.retornoPrevistoTexto),
        td(`${item.avance || 0}%`),
        td(item.incidenciasAbiertas),
        acciones
      );

      tbody?.appendChild(tr);
    }
  );
}

async function consultar(
  contenedor
) {
  const estado =
    contenedor.querySelector(
      '#rutasEstado'
    );

  estado.textContent =
    'Cargando...';

  try {
    const respuesta =
      await listarRutas(
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

    estado.textContent =
      items.length
        ? ''
        : 'No existen rutas para los filtros seleccionados.';
  } catch (error) {
    estado.textContent =
      error?.message ||
      'No fue posible consultar las rutas.';
  }
}

export function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  contenedor
    .querySelector(
      '#rutasForm'
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
      '#rutasLimpiar'
    )
    ?.addEventListener(
      'click',
      () => {
        contenedor
          .querySelector(
            '#rutasForm'
          )
          ?.reset();

        consultar(
          contenedor
        );
      }
    );

  consultar(
    contenedor
  );
}