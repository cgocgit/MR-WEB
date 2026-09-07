import {
  listarOrdenesProgramacion
} from '../../api/logistica.service.js';

import {
  ESTADOS_ORDEN_LABELS,
  TIPOS_ORDEN_LABELS
} from '../../api/logistica.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

const ROOT_ID =
  'logistica-programacion-root';

const STORAGE_KEY =
  'mr_logistica_programacion_filtros';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function crearCelda(
  valor
) {
  const td =
    document.createElement('td');

  td.textContent =
    valor ?? '—';

  return td;
}

function obtenerFiltros(
  contenedor
) {
  return {
    folio:
      contenedor
        .querySelector(
          '#programacionFolio'
        )
        ?.value.trim() || '',

    cliente:
      contenedor
        .querySelector(
          '#programacionCliente'
        )
        ?.value.trim() || '',

    fechaInicio:
      contenedor
        .querySelector(
          '#programacionFechaInicio'
        )
        ?.value || '',

    fechaFin:
      contenedor
        .querySelector(
          '#programacionFechaFin'
        )
        ?.value || '',

    tipoOrden:
      contenedor
        .querySelector(
          '#programacionTipo'
        )
        ?.value || '',

    situacion:
      contenedor
        .querySelector(
          '#programacionSituacion'
        )
        ?.value || '',

    placa:
      contenedor
        .querySelector(
          '#programacionPlaca'
        )
        ?.value.trim() || '',

    chofer:
      contenedor
        .querySelector(
          '#programacionChofer'
        )
        ?.value.trim() || '',

    representante:
      contenedor
        .querySelector(
          '#programacionRepresentante'
        )
        ?.value.trim() || ''
  };
}

function guardarFiltros(
  filtros
) {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(filtros)
  );
}

function restaurarFiltros(
  contenedor
) {
  let filtros = null;

  try {
    filtros =
      JSON.parse(
        sessionStorage.getItem(
          STORAGE_KEY
        )
      );
  } catch {
    filtros = null;
  }

  if (!filtros) {
    return;
  }

  const campos = {
    programacionFolio:
      filtros.folio,

    programacionCliente:
      filtros.cliente,

    programacionFechaInicio:
      filtros.fechaInicio,

    programacionFechaFin:
      filtros.fechaFin,

    programacionTipo:
      filtros.tipoOrden,

    programacionSituacion:
      filtros.situacion,

    programacionPlaca:
      filtros.placa,

    programacionChofer:
      filtros.chofer,

    programacionRepresentante:
      filtros.representante
  };

  Object.entries(
    campos
  ).forEach(
    ([id, valor]) => {
      const control =
        contenedor.querySelector(
          `#${id}`
        );

      if (control) {
        control.value =
          valor || '';
      }
    }
  );
}

function crearAccion(
  item,
  puedeGestionar
) {
  const td =
    document.createElement('td');

  const detalle =
    document.createElement('a');

  detalle.href =
    `#/logistica/orden/detalle?idOrden=${item.idOrden}`;

  detalle.textContent =
    'Consultar';

  td.appendChild(detalle);

  if (puedeGestionar) {
    const separador =
      document.createTextNode(' · ');

    const accion =
      document.createElement('a');

    accion.href =
      `#/logistica/programacion/formulario?idOrden=${item.idOrden}`;

    accion.textContent =
      item.estadoOrden ===
      'PENDIENTE_PROGRAMACION'
        ? 'Programar'
        : 'Reprogramar';

    td.append(
      separador,
      accion
    );
  }

  return td;
}

function render(
  contenedor,
  items
) {
  const tbody =
    contenedor.querySelector(
      '#programacionBody'
    );

  const vacio =
    contenedor.querySelector(
      '#programacionVacio'
    );

  tbody?.replaceChildren();

  const puedeGestionar =
    hasPermission(
      getSession(),
      'logistica.gestionar'
    );

  (items || []).forEach(
    item => {
      const tr =
        document.createElement('tr');

      tr.append(
        crearCelda(
          item.folioOrden
        ),

        crearCelda(
          item.fechaHoraEventoTexto
        ),

        crearCelda(
          item.cliente
        ),

        crearCelda(
          TIPOS_ORDEN_LABELS[
            item.tipoOrden
          ] ||
          item.tipoOrden
        ),

        crearCelda(
          item.destinoResumen
        ),

        crearCelda(
          item.ruta || '—'
        ),

        crearCelda(
          item.placaVehiculo ||
          '—'
        ),

        crearCelda(
          item.chofer || '—'
        ),

        crearCelda(
          item.representante ||
          '—'
        ),

        crearCelda(
          ESTADOS_ORDEN_LABELS[
            item.estadoOrden
          ] ||
          item.situacion ||
          '—'
        ),

        crearAccion(
          item,
          puedeGestionar
        )
      );

      tbody?.appendChild(tr);
    }
  );

  if (vacio) {
    vacio.hidden =
      Boolean(items?.length);
  }
}

async function consultar(
  contenedor
) {
  const estado =
    contenedor.querySelector(
      '#programacionEstado'
    );

  estado.textContent =
    'Cargando...';

  try {
    const filtros =
      obtenerFiltros(
        contenedor
      );

    guardarFiltros(
      filtros
    );

    const respuesta =
      await listarOrdenesProgramacion(
        filtros
      );

    render(
      contenedor,
      respuesta.items ||
      respuesta
    );

    estado.textContent = '';
  } catch (error) {
    estado.textContent =
      error?.message ||
      'No fue posible consultar la programación.';
  }
}

export function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  restaurarFiltros(
    contenedor
  );

  contenedor
    .querySelector(
      '#programacionForm'
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
      '#programacionLimpiar'
    )
    ?.addEventListener(
      'click',
      () => {
        contenedor
          .querySelector(
            '#programacionForm'
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

  contenedor
    .querySelector(
      '#programacionActualizar'
    )
    ?.addEventListener(
      'click',
      () =>
        consultar(
          contenedor
        )
    );

  consultar(
    contenedor
  );
}