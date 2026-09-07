import {
  guardarSeguimientoIncidencia,
  iniciarSeguimientoIncidencia,
  listarIncidencias,
  obtenerIncidencia,
  reportarIncidencia,
  resolverIncidencia
} from '../../api/logistica.service.js';

import {
  ESTADOS_INCIDENCIA_LABELS,
  TIPOS_INCIDENCIA_LABELS,
  TIPOS_INCIDENCIA_POR_ROL,
  esIdPositivo
} from '../../api/logistica.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-incidencias-root';

let incidenciaActual = null;

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function query() {
  return new URLSearchParams(
    location.hash.split('?')[1] ||
    ''
  );
}

function roles() {
  return (
    getSession()
      ?.user?.roles ||
    []
  );
}

function tiposPermitidos() {
  const permitidos =
    new Set();

  roles().forEach(
    rol => {
      (
        TIPOS_INCIDENCIA_POR_ROL[
          rol
        ] ||
        []
      ).forEach(
        tipo =>
          permitidos.add(tipo)
      );
    }
  );

  return [
    ...permitidos
  ];
}

function cargarTipos(
  contenedor
) {
  const select =
    contenedor.querySelector(
      '#incidenciaTipoReporte'
    );

  select?.replaceChildren();

  const inicio =
    document.createElement(
      'option'
    );

  inicio.value = '';
  inicio.textContent =
    'Seleccione';

  select?.appendChild(
    inicio
  );

  tiposPermitidos().forEach(
    tipo => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        tipo;

      option.textContent =
        TIPOS_INCIDENCIA_LABELS[
          tipo
        ] ||
        tipo;

      select?.appendChild(
        option
      );
    }
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

function renderListado(
  contenedor,
  items
) {
  const tbody =
    contenedor.querySelector(
      '#incidenciasBody'
    );

  tbody?.replaceChildren();

  items.forEach(
    item => {
      const tr =
        document.createElement(
          'tr'
        );

      const accion =
        document.createElement(
          'td'
        );

      const ver =
        document.createElement(
          'button'
        );

      ver.type = 'button';
      ver.textContent =
        'Ver detalle';

      ver.addEventListener(
        'click',
        () =>
          cargarDetalle(
            contenedor,
            item.idIncidencia
          )
      );

      accion.appendChild(ver);

      tr.append(
        td(item.folioIncidencia),
        td(item.reportadoEnTexto),
        td(item.referencia),
        td(item.faseTexto),
        td(item.tipoTexto),
        td(item.reportadoPorTexto),
        td(item.estadoTexto),
        td(item.supervisorTexto),
        td(item.ultimaActualizacionTexto),
        accion
      );

      tbody?.appendChild(tr);
    }
  );
}

function filtros(
  contenedor
) {
  return {
    folio:
      contenedor.querySelector(
        '#incidenciasFolio'
      )?.value.trim() || '',

    orden:
      contenedor.querySelector(
        '#incidenciasOrden'
      )?.value.trim() || '',

    ruta:
      contenedor.querySelector(
        '#incidenciasRuta'
      )?.value.trim() || '',

    tipo:
      contenedor.querySelector(
        '#incidenciasTipo'
      )?.value || '',

    estado:
      contenedor.querySelector(
        '#incidenciasEstadoFiltro'
      )?.value || '',

    perfil:
      contenedor.querySelector(
        '#incidenciasPerfil'
      )?.value || '',

    fechaInicio:
      contenedor.querySelector(
        '#incidenciasFechaInicio'
      )?.value || '',

    fechaFin:
      contenedor.querySelector(
        '#incidenciasFechaFin'
      )?.value || '',

    supervisor:
      contenedor.querySelector(
        '#incidenciasSupervisor'
      )?.value.trim() || ''
  };
}

async function consultar(
  contenedor
) {
  try {
    const respuesta =
      await listarIncidencias(
        filtros(
          contenedor
        )
      );

    renderListado(
      contenedor,
      respuesta.items ||
      respuesta
    );
  } catch (error) {
    contenedor.querySelector(
      '#incidenciasEstado'
    ).textContent =
      error?.message ||
      'No fue posible consultar incidencias.';
  }
}

function mostrarDetalle(
  contenedor,
  incidencia
) {
  incidenciaActual =
    incidencia;

  const panel =
    contenedor.querySelector(
      '#incidenciaDetallePanel'
    );

  panel.hidden = false;

  const campos = {
    incidenciaDetalleFolio:
      incidencia
        .folioIncidencia,

    incidenciaDetalleTipo:
      incidencia.tipoTexto ||
      TIPOS_INCIDENCIA_LABELS[
        incidencia.tipoIncidencia
      ],

    incidenciaDetalleEstado:
      incidencia.estadoTexto ||
      ESTADOS_INCIDENCIA_LABELS[
        incidencia.estadoIncidencia
      ],

    incidenciaDetalleReporte:
      incidencia
        .descripcionReporte,

    incidenciaDetalleReportadoPor:
      incidencia
        .reportadoPorTexto,

    incidenciaDetalleFecha:
      incidencia
        .reportadoEnTexto,

    incidenciaDetalleSupervisor:
      incidencia
        .supervisorTexto,

    incidenciaDetalleResolucion:
      incidencia.resolucion
  };

  Object.entries(
    campos
  ).forEach(
    ([id, valor]) => {
      const elemento =
        contenedor.querySelector(
          `#${id}`
        );

      if (elemento) {
        elemento.textContent =
          valor || '—';
      }
    }
  );

  const seguimiento =
    contenedor.querySelector(
      '#incidenciaSeguimientoAcciones'
    );

  const resolucion =
    contenedor.querySelector(
      '#incidenciaResolucion'
    );

  const puedeGestionar =
    hasPermission(
      getSession(),
      'logistica.gestionar'
    );

  if (seguimiento) {
    seguimiento.disabled =
      !puedeGestionar ||
      incidencia.estadoIncidencia ===
        'RESUELTA';
  }

  if (resolucion) {
    resolucion.disabled =
      !puedeGestionar ||
      incidencia.estadoIncidencia !==
        'EN_SEGUIMIENTO';
  }

  const iniciar =
    contenedor.querySelector(
      '#incidenciaIniciarSeguimiento'
    );

  if (iniciar) {
    iniciar.hidden =
      !puedeGestionar ||
      incidencia.estadoIncidencia !==
        'REPORTADA';
  }

  const guardar =
    contenedor.querySelector(
      '#incidenciaGuardarSeguimiento'
    );

  if (guardar) {
    guardar.hidden =
      !puedeGestionar ||
      incidencia.estadoIncidencia !==
        'EN_SEGUIMIENTO';
  }

  const resolver =
    contenedor.querySelector(
      '#incidenciaResolver'
    );

  if (resolver) {
    resolver.hidden =
      !puedeGestionar ||
      incidencia.estadoIncidencia !==
        'EN_SEGUIMIENTO';
  }
}

async function cargarDetalle(
  contenedor,
  idIncidencia
) {
  try {
    const incidencia =
      await obtenerIncidencia(
        idIncidencia
      );

    mostrarDetalle(
      contenedor,
      incidencia
    );
  } catch (error) {
    contenedor.querySelector(
      '#incidenciasEstado'
    ).textContent =
      error?.message ||
      'No fue posible consultar la incidencia.';
  }
}

async function enviarReporte(
  contenedor
) {
  const params =
    query();

  const tipo =
    contenedor.querySelector(
      '#incidenciaTipoReporte'
    )?.value;

  const descripcion =
    contenedor.querySelector(
      '#incidenciaDescripcion'
    )?.value.trim();

  if (
    !tipo ||
    !descripcion
  ) {
    contenedor.querySelector(
      '#incidenciasEstado'
    ).textContent =
      'Debe indicar tipo y descripción de la incidencia.';

    return;
  }

  try {
    await reportarIncidencia({
      idOrden:
        Number(
          params.get(
            'idOrden'
          )
        ) ||
        null,

      idRuta:
        Number(
          params.get(
            'idRuta'
          )
        ) ||
        null,

      idFase:
        Number(
          params.get(
            'idFase'
          )
        ) ||
        null,

      tipoIncidencia:
        tipo,

      descripcionReporte:
        descripcion
    });

    showNotification(
      'La incidencia fue registrada. El proceso puede continuar.',
      {
        type: 'success',
        timeout: 5000
      }
    );

    contenedor.querySelector(
      '#incidenciaReporteForm'
    )?.reset();

    await consultar(
      contenedor
    );
  } catch (error) {
    contenedor.querySelector(
      '#incidenciasEstado'
    ).textContent =
      error?.message ||
      'No fue posible reportar la incidencia.';
  }
}

async function iniciarSeguimiento(
  contenedor
) {
  const acciones =
    contenedor.querySelector(
      '#incidenciaSeguimientoAcciones'
    )?.value.trim();

  if (!acciones) {
    return;
  }

  incidenciaActual =
    await iniciarSeguimientoIncidencia(
      incidenciaActual.idIncidencia,
      acciones,
      incidenciaActual.version
    );

  mostrarDetalle(
    contenedor,
    incidenciaActual
  );

  await consultar(
    contenedor
  );
}

async function guardarSeguimiento(
  contenedor
) {
  const acciones =
    contenedor.querySelector(
      '#incidenciaSeguimientoAcciones'
    )?.value.trim();

  if (!acciones) {
    return;
  }

  incidenciaActual =
    await guardarSeguimientoIncidencia(
      incidenciaActual.idIncidencia,
      acciones,
      incidenciaActual.version
    );

  mostrarDetalle(
    contenedor,
    incidenciaActual
  );

  await consultar(
    contenedor
  );
}

async function resolver(
  contenedor
) {
  const resolucion =
    contenedor.querySelector(
      '#incidenciaResolucion'
    )?.value.trim();

  if (!resolucion) {
    return;
  }

  incidenciaActual =
    await resolverIncidencia(
      incidenciaActual.idIncidencia,
      {
        resolucion,

        version:
          incidenciaActual
            .version
      }
    );

  mostrarDetalle(
    contenedor,
    incidenciaActual
  );

  await consultar(
    contenedor
  );
}

export function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  cargarTipos(
    contenedor
  );

  const params =
    query();

  const reporte =
    params.get('modo') ===
      'reporte' &&
    tiposPermitidos().length >
      0;

  contenedor.querySelector(
    '#incidenciaReportePanel'
  ).hidden =
    !reporte;

  contenedor
    .querySelector(
      '#incidenciasFiltros'
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
      '#incidenciaReporteForm'
    )
    ?.addEventListener(
      'submit',
      event => {
        event.preventDefault();

        enviarReporte(
          contenedor
        );
      }
    );

  contenedor
    .querySelector(
      '#incidenciaIniciarSeguimiento'
    )
    ?.addEventListener(
      'click',
      () =>
        iniciarSeguimiento(
          contenedor
        )
    );

  contenedor
    .querySelector(
      '#incidenciaGuardarSeguimiento'
    )
    ?.addEventListener(
      'click',
      () =>
        guardarSeguimiento(
          contenedor
        )
    );

  contenedor
    .querySelector(
      '#incidenciaResolver'
    )
    ?.addEventListener(
      'click',
      () =>
        resolver(
          contenedor
        )
    );

  consultar(
    contenedor
  );

  const id =
    Number(
      params.get(
        'idIncidencia'
      )
    );

  if (esIdPositivo(id)) {
    cargarDetalle(
      contenedor,
      id
    );
  }
}