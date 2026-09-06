import {
  consultarResumenPagos
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  formatCurrency,
  formatDateTime,
  formatTipoMovimiento
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-inicio-root';

const PERMISOS = {
  CONSULTAR:
    'pagos.consultar',

  GESTIONAR:
    'pagos.gestionar',

  ALERTAS:
    'pagos.alertas.consultar'
};

function elemento(id) {
  return document.getElementById(id);
}

function obtenerRoot() {
  return elemento(ROOT_ID);
}

function sesionActual() {
  return getSession();
}

function puede(permiso) {
  return hasPermission(
    sesionActual(),
    permiso
  );
}

function ocultar(
  id,
  oculto
) {
  const destino =
    elemento(id);

  if (destino) {
    destino.hidden =
      oculto;
  }
}

function texto(
  id,
  valor
) {
  const destino =
    elemento(id);

  if (destino) {
    destino.textContent =
      valor ?? '';
  }
}

function configurarPermisos(
  root
) {
  root
    .querySelectorAll(
      '[data-pagos-requiere-permiso]'
    )
    .forEach(elementoPermiso => {
      const permiso =
        elementoPermiso.getAttribute(
          'data-pagos-requiere-permiso'
        );

      elementoPermiso.hidden =
        !puede(permiso);
    });
}

function mostrarCarga(
  cargando
) {
  ocultar(
    'pagos-inicio-cargando',
    !cargando
  );

  const boton =
    elemento(
      'btn-pagos-inicio-actualizar'
    );

  if (boton) {
    boton.disabled =
      cargando;

    boton.setAttribute(
      'aria-busy',
      cargando
        ? 'true'
        : 'false'
    );
  }
}

function limpiarEstados() {
  ocultar(
    'pagos-inicio-error',
    true
  );

  ocultar(
    'pagos-inicio-vacio',
    true
  );
}

function mostrarError(
  mensaje
) {
  texto(
    'pagos-inicio-error',
    mensaje ||
      'No fue posible consultar la información de Pagos.'
  );

  ocultar(
    'pagos-inicio-error',
    false
  );
}

function renderizarResumen(
  resumen
) {
  texto(
    'pagos-inicio-pendientes',
    resumen
      .pendientesConfirmacion ??
      0
  );

  texto(
    'pagos-inicio-confirmadas',
    resumen
      .confirmadasSaldoPendiente ??
      0
  );

  texto(
    'pagos-inicio-liquidadas',
    resumen
      .liquidadas ??
      0
  );

  texto(
    'pagos-inicio-alertas',
    resumen
      .conAlertaIntegracion ??
      0
  );
}

function crearCelda(
  valor
) {
  const celda =
    document.createElement(
      'td'
    );

  celda.textContent =
    valor ?? '—';

  return celda;
}

function construirRutaCuenta(
  movimiento
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idCotizacion',
    String(
      movimiento.idCotizacion
    )
  );

  parametros.set(
    'idVersion',
    String(
      movimiento.idVersion
    )
  );

  return (
    '#/pagos/cuenta?' +
    parametros.toString()
  );
}

function crearAccionCuenta(
  movimiento
) {
  const enlace =
    document.createElement(
      'a'
    );

  enlace.href =
    construirRutaCuenta(
      movimiento
    );

  enlace.textContent =
    'Ver cuenta';

  enlace.className =
    'pagos-table-action';

  return enlace;
}

function renderizarTablaActividad(
  movimientos
) {
  const tbody =
    elemento(
      'pagos-inicio-actividad-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  movimientos.forEach(
    movimiento => {
      const fila =
        document.createElement(
          'tr'
        );

      fila.appendChild(
        crearCelda(
          formatDateTime(
            movimiento
              .fechaHoraRegistro
          )
        )
      );

      fila.appendChild(
        crearCelda(
          formatTipoMovimiento(
            movimiento
              .tipoMovimiento
          )
        )
      );

      fila.appendChild(
        crearCelda(
          movimiento
            .folioCotizacion
        )
      );

      fila.appendChild(
        crearCelda(
          `Versión ${
            movimiento
              .numeroVersion
          }`
        )
      );

      fila.appendChild(
        crearCelda(
          movimiento
            .nombreCliente
        )
      );

      fila.appendChild(
        crearCelda(
          formatCurrency(
            movimiento.monto
          )
        )
      );

      fila.appendChild(
        crearCelda(
          movimiento
            .usuarioResponsable
        )
      );

      const acciones =
        document.createElement(
          'td'
        );

      if (
        puede(
          PERMISOS.CONSULTAR
        )
      ) {
        acciones.appendChild(
          crearAccionCuenta(
            movimiento
          )
        );
      }

      fila.appendChild(
        acciones
      );

      tbody.appendChild(
        fila
      );
    }
  );
}

function crearCampoTarjeta(
  etiqueta,
  valor
) {
  const campo =
    document.createElement(
      'div'
    );

  campo.className =
    'pagos-mobile-card-field';

  const label =
    document.createElement(
      'span'
    );

  const contenido =
    document.createElement(
      'strong'
    );

  label.textContent =
    etiqueta;

  contenido.textContent =
    valor ?? '—';

  campo.append(
    label,
    contenido
  );

  return campo;
}

function renderizarCardsActividad(
  movimientos
) {
  const contenedor =
    elemento(
      'pagos-inicio-actividad-cards'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  movimientos.forEach(
    movimiento => {
      const tarjeta =
        document.createElement(
          'article'
        );

      tarjeta.className =
        'pagos-mobile-card';

      const encabezado =
        document.createElement(
          'div'
        );

      encabezado.className =
        'pagos-mobile-card-header';

      const titulo =
        document.createElement(
          'strong'
        );

      titulo.textContent =
        movimiento
          .folioCotizacion;

      encabezado.appendChild(
        titulo
      );

      const grid =
        document.createElement(
          'div'
        );

      grid.className =
        'pagos-mobile-card-grid';

      grid.append(
        crearCampoTarjeta(
          'Movimiento',
          formatTipoMovimiento(
            movimiento
              .tipoMovimiento
          )
        ),

        crearCampoTarjeta(
          'Fecha',
          formatDateTime(
            movimiento
              .fechaHoraRegistro
          )
        ),

        crearCampoTarjeta(
          'Versión',
          String(
            movimiento
              .numeroVersion
          )
        ),

        crearCampoTarjeta(
          'Cliente',
          movimiento
            .nombreCliente
        ),

        crearCampoTarjeta(
          'Importe',
          formatCurrency(
            movimiento.monto
          )
        ),

        crearCampoTarjeta(
          'Usuario',
          movimiento
            .usuarioResponsable
        )
      );

      tarjeta.append(
        encabezado,
        grid
      );

      if (
        puede(
          PERMISOS.CONSULTAR
        )
      ) {
        tarjeta.appendChild(
          crearAccionCuenta(
            movimiento
          )
        );
      }

      contenedor.appendChild(
        tarjeta
      );
    }
  );
}

function renderizarActividad(
  movimientos = []
) {
  const hayActividad =
    movimientos.length > 0;

  ocultar(
    'pagos-inicio-vacio',
    hayActividad
  );

  ocultar(
    'pagos-inicio-actividad',
    !hayActividad
  );

  if (!hayActividad) {
    return;
  }

  renderizarTablaActividad(
    movimientos
  );

  renderizarCardsActividad(
    movimientos
  );
}

async function cargar() {
  limpiarEstados();

  mostrarCarga(true);

  try {
    const resultado =
      await consultarResumenPagos();

    renderizarResumen(
      resultado.resumen || {}
    );

    renderizarActividad(
      resultado
        .actividadReciente || []
    );

    ocultar(
      'pagos-inicio-contenido',
      false
    );
  } catch (error) {
    ocultar(
      'pagos-inicio-contenido',
      true
    );

    mostrarError(
      error?.message
    );
  } finally {
    mostrarCarga(false);
  }
}

function registrarEventos() {
  const actualizar =
    elemento(
      'btn-pagos-inicio-actualizar'
    );

  if (actualizar) {
    actualizar.addEventListener(
      'click',
      cargar
    );
  }
}

export function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  const session =
    sesionActual();

  if (!session?.user) {
    return;
  }

  configurarPermisos(
    root
  );

  registrarEventos();

  cargar();
}