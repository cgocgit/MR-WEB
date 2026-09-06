import {
  buscarCotizacionesHabilitadas,
  obtenerCuentaPago,
  registrarPago
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  proyectarPago
} from './pagos.calculations.js';

import {
  formatCurrency,
  formatPercentage,
  getIndicadorMeta
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-registro-root';

const PERMISOS = {
  GESTIONAR:
    'pagos.gestionar',

  ALERTAS:
    'pagos.alertas.consultar'
};

let cuentaSeleccionada = null;
let archivoSeleccionado = null;
let procesando = false;
let busquedaSecuencia = 0;

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

function texto(id, valor) {
  const destino =
    elemento(id);

  if (destino) {
    destino.textContent =
      valor ?? '';
  }
}

function valor(id) {
  return elemento(id)?.value
    ?.trim() || '';
}

function ocultar(id, oculto) {
  const destino =
    elemento(id);

  if (destino) {
    destino.hidden =
      oculto;
  }
}

function mostrarMensaje(
  id,
  mensaje
) {
  texto(id, mensaje);

  ocultar(
    id,
    !mensaje
  );
}

function configurarPermisos(
  root
) {
  root
    .querySelectorAll(
      '[data-pagos-requiere-permiso]'
    )
    .forEach(control => {
      const permiso =
        control.getAttribute(
          'data-pagos-requiere-permiso'
        );

      control.hidden =
        !puede(permiso);
    });
}

function crearIndicador(
  codigo
) {
  const meta =
    getIndicadorMeta(
      codigo
    );

  const indicador =
    document.createElement(
      'span'
    );

  indicador.className =
    `pagos-indicador ${meta.clase}`;

  indicador.textContent =
    meta.texto;

  indicador.setAttribute(
    'aria-label',
    meta.texto
  );

  return indicador;
}

function limpiarResultadosBusqueda() {
  elemento(
    'pagos-registro-resultados'
  )?.replaceChildren();

  ocultar(
    'pagos-registro-sin-resultados',
    true
  );
}

function construirResultadoCotizacion(
  cuenta
) {
  const boton =
    document.createElement(
      'button'
    );

  boton.type =
    'button';

  boton.className =
    'pagos-cotizacion-option';

  boton.dataset.idCotizacion =
    String(
      cuenta.idCotizacion
    );

  boton.dataset.idVersion =
    String(
      cuenta.idVersion
    );

  const folio =
    document.createElement(
      'strong'
    );

  folio.textContent =
    cuenta.folioCotizacion;

  const cliente =
    document.createElement(
      'span'
    );

  cliente.textContent =
    cuenta.nombreCliente;

  const version =
    document.createElement(
      'span'
    );

  version.textContent =
    `Versión ${cuenta.numeroVersion}`;

  const saldo =
    document.createElement(
      'span'
    );

  saldo.textContent =
    `Saldo: ${formatCurrency(
      cuenta.saldoLiquidacion
    )}`;

  boton.append(
    folio,
    cliente,
    version,
    saldo
  );

  boton.addEventListener(
    'click',
    () =>
      seleccionarCotizacion(
        cuenta.idCotizacion,
        cuenta.idVersion
      )
  );

  return boton;
}

function renderizarResultadosBusqueda(
  resultados
) {
  const contenedor =
    elemento(
      'pagos-registro-resultados'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  if (!resultados.length) {
    ocultar(
      'pagos-registro-sin-resultados',
      false
    );

    return;
  }

  ocultar(
    'pagos-registro-sin-resultados',
    true
  );

  resultados.forEach(
    cuenta => {
      contenedor.appendChild(
        construirResultadoCotizacion(
          cuenta
        )
      );
    }
  );
}

async function buscarCotizaciones() {
  const termino =
    valor(
      'pagos-registro-busqueda'
    );

  const secuencia =
    ++busquedaSecuencia;

  limpiarResultadosBusqueda();

  mostrarMensaje(
    'pagos-registro-busqueda-error',
    ''
  );

  ocultar(
    'pagos-registro-busqueda-cargando',
    false
  );

  try {
    const resultado =
      await buscarCotizacionesHabilitadas(
        {
          termino
        }
      );

    if (
      secuencia !==
      busquedaSecuencia
    ) {
      return;
    }

    renderizarResultadosBusqueda(
      resultado.items || []
    );
  } catch (error) {
    if (
      secuencia !==
      busquedaSecuencia
    ) {
      return;
    }

    mostrarMensaje(
      'pagos-registro-busqueda-error',
      error?.message ||
        'No fue posible consultar las cotizaciones habilitadas.'
    );
  } finally {
    if (
      secuencia ===
      busquedaSecuencia
    ) {
      ocultar(
        'pagos-registro-busqueda-cargando',
        true
      );
    }
  }
}

function renderizarCuentaSeleccionada() {
  const cuenta =
    cuentaSeleccionada;

  ocultar(
    'pagos-registro-cuenta',
    !cuenta
  );

  if (!cuenta) {
    return;
  }

  texto(
    'pagos-registro-id-cotizacion',
    cuenta.idCotizacion
  );

  texto(
    'pagos-registro-folio',
    cuenta.folioCotizacion
  );

  texto(
    'pagos-registro-version',
    `Versión ${cuenta.numeroVersion}`
  );

  texto(
    'pagos-registro-id-version',
    cuenta.idVersion
  );

  texto(
    'pagos-registro-cliente',
    cuenta.nombreCliente
  );

  texto(
    'pagos-registro-vendedor',
    cuenta.vendedorResponsable
  );

  texto(
    'pagos-registro-total',
    formatCurrency(
      cuenta.totalCotizacion
    )
  );

  texto(
    'pagos-registro-porcentaje-requerido',
    formatPercentage(
      cuenta.porcentajeRequerido
    )
  );

  texto(
    'pagos-registro-importe-requerido',
    formatCurrency(
      cuenta.importeRequerido
    )
  );

  texto(
    'pagos-registro-acumulado',
    formatCurrency(
      cuenta.acumuladoNeto
    )
  );

  texto(
    'pagos-registro-saldo-confirmacion',
    formatCurrency(
      cuenta.saldoConfirmacion
    )
  );

  texto(
    'pagos-registro-saldo-liquidacion',
    formatCurrency(
      cuenta.saldoLiquidacion
    )
  );

  const indicador =
    elemento(
      'pagos-registro-indicador'
    );

  if (indicador) {
    indicador.replaceChildren(
      crearIndicador(
        cuenta
          .indicadorPresentacion
      )
    );
  }

  texto(
    'pagos-registro-resultado-previo',
    cuenta.resultadoIntegracion
      ?.mensaje ||
      'Sin proceso previo'
  );

  actualizarProyeccion();
}

async function seleccionarCotizacion(
  idCotizacion,
  idVersion
) {
  mostrarMensaje(
    'pagos-registro-error',
    ''
  );

  try {
    cuentaSeleccionada =
      await obtenerCuentaPago(
        idCotizacion,
        idVersion
      );

    renderizarCuentaSeleccionada();

    elemento(
      'pagos-registro-fecha'
    )?.focus();
  } catch (error) {
    cuentaSeleccionada =
      null;

    renderizarCuentaSeleccionada();

    mostrarMensaje(
      'pagos-registro-error',
      error?.message ||
        'No fue posible obtener la cuenta seleccionada.'
    );
  }
}

function montoCapturado() {
  const monto =
    Number(
      valor(
        'pagos-registro-monto'
      )
    );

  return Number.isFinite(monto)
    ? monto
    : 0;
}

function obtenerProyeccion() {
  if (!cuentaSeleccionada) {
    return null;
  }

  return proyectarPago({
    totalCotizacion:
      cuentaSeleccionada
        .totalCotizacion,

    importeRequerido:
      cuentaSeleccionada
        .importeRequerido,

    acumuladoBruto:
      cuentaSeleccionada
        .acumuladoBruto,

    totalCompensado:
      cuentaSeleccionada
        .totalCompensado,

    montoPago:
      montoCapturado()
  });
}

function actualizarProyeccion() {
  const proyeccion =
    obtenerProyeccion();

  ocultar(
    'pagos-registro-resumen-previo',
    !proyeccion
  );

  if (!proyeccion) {
    return;
  }

  texto(
    'pagos-registro-resumen-anterior',
    formatCurrency(
      cuentaSeleccionada
        .acumuladoNeto
    )
  );

  texto(
    'pagos-registro-resumen-pago',
    formatCurrency(
      montoCapturado()
    )
  );

  texto(
    'pagos-registro-resumen-nuevo',
    formatCurrency(
      proyeccion
        .acumuladoNeto
    )
  );

  texto(
    'pagos-registro-resumen-requerido',
    formatCurrency(
      cuentaSeleccionada
        .importeRequerido
    )
  );

  texto(
    'pagos-registro-resumen-saldo-confirmacion',
    formatCurrency(
      proyeccion
        .saldoConfirmacion
    )
  );

  texto(
    'pagos-registro-resumen-saldo-liquidacion',
    formatCurrency(
      proyeccion
        .saldoLiquidacion
    )
  );

  texto(
    'pagos-registro-resumen-excedente',
    formatCurrency(
      proyeccion.excedente
    )
  );

  const superaSaldo =
    montoCapturado() >
    cuentaSeleccionada
      .saldoLiquidacion;

  ocultar(
    'pagos-registro-advertencia-excedente',
    !superaSaldo
  );

  if (superaSaldo) {
    texto(
      'pagos-registro-excedente-importe',
      formatCurrency(
        proyeccion.excedente
      )
    );
  }

  const alcanzaUmbral =
    cuentaSeleccionada
      .acumuladoNeto <
      cuentaSeleccionada
        .importeRequerido &&
    proyeccion
      .acumuladoNeto >=
      cuentaSeleccionada
        .importeRequerido;

  ocultar(
    'pagos-registro-alcanza-umbral',
    !alcanzaUmbral
  );
}

function limpiarErroresFormulario() {
  [
    'pagos-registro-fecha-error',
    'pagos-registro-monto-error',
    'pagos-registro-metodo-error',
    'pagos-registro-error'
  ].forEach(
    id =>
      mostrarMensaje(
        id,
        ''
      )
  );
}

function validarFormulario() {
  limpiarErroresFormulario();

  let valido = true;

  if (!cuentaSeleccionada) {
    mostrarMensaje(
      'pagos-registro-error',
      'Seleccione una cotización habilitada.'
    );

    valido = false;
  }

  if (
    !valor(
      'pagos-registro-fecha'
    )
  ) {
    mostrarMensaje(
      'pagos-registro-fecha-error',
      'La fecha del pago es obligatoria.'
    );

    valido = false;
  }

  const monto =
    montoCapturado();

  if (
    !Number.isFinite(monto) ||
    monto <= 0
  ) {
    mostrarMensaje(
      'pagos-registro-monto-error',
      'El monto debe ser mayor que cero.'
    );

    valido = false;
  }

  const metodo =
    valor(
      'pagos-registro-metodo'
    );

  if (
    ![
      'EFECTIVO',
      'TRANSFERENCIA'
    ].includes(metodo)
  ) {
    mostrarMensaje(
      'pagos-registro-metodo-error',
      'Seleccione Efectivo o Transferencia.'
    );

    valido = false;
  }

  return valido;
}

function datosPago() {
  return {
    idCotizacion:
      cuentaSeleccionada
        .idCotizacion,

    idVersion:
      cuentaSeleccionada
        .idVersion,

    fechaPago:
      valor(
        'pagos-registro-fecha'
      ),

    monto:
      montoCapturado(),

    metodoPago:
      valor(
        'pagos-registro-metodo'
      ),

    referencia:
      valor(
        'pagos-registro-referencia'
      ),

    observaciones:
      valor(
        'pagos-registro-observaciones'
      ),

    comprobante:
      archivoSeleccionado
  };
}

function prepararConfirmacion() {
  const proyeccion =
    obtenerProyeccion();

  texto(
    'pagos-confirmacion-cotizacion',
    cuentaSeleccionada
      .folioCotizacion
  );

  texto(
    'pagos-confirmacion-version',
    `Versión ${
      cuentaSeleccionada
        .numeroVersion
    }`
  );

  texto(
    'pagos-confirmacion-cliente',
    cuentaSeleccionada
      .nombreCliente
  );

  texto(
    'pagos-confirmacion-monto',
    formatCurrency(
      montoCapturado()
    )
  );

  texto(
    'pagos-confirmacion-metodo',
    valor(
      'pagos-registro-metodo'
    ) ===
      'TRANSFERENCIA'
      ? 'Transferencia'
      : 'Efectivo'
  );

  texto(
    'pagos-confirmacion-acumulado',
    formatCurrency(
      proyeccion
        .acumuladoNeto
    )
  );

  texto(
    'pagos-confirmacion-saldo',
    formatCurrency(
      proyeccion
        .saldoLiquidacion
    )
  );

  ocultar(
    'pagos-confirmacion-excedente',
    proyeccion.excedente <= 0
  );

  if (
    proyeccion.excedente > 0
  ) {
    texto(
      'pagos-confirmacion-excedente-importe',
      formatCurrency(
        proyeccion.excedente
      )
    );
  }
}

function abrirConfirmacion() {
  if (!validarFormulario()) {
    return;
  }

  prepararConfirmacion();

  const dialogo =
    elemento(
      'pagos-registro-dialog'
    );

  if (
    dialogo &&
    typeof dialogo.showModal ===
      'function'
  ) {
    dialogo.showModal();
  }
}

function cerrarConfirmacion() {
  elemento(
    'pagos-registro-dialog'
  )?.close();
}

function establecerProcesando(
  estado
) {
  procesando = estado;

  const root =
    obtenerRoot();

  root
    ?.querySelectorAll(
      'input, select, textarea, button'
    )
    .forEach(control => {
      if (
        control.id !==
        'pagos-registro-resultado-ver-cuenta' &&
        control.id !==
        'pagos-registro-resultado-ver-alerta'
      ) {
        control.disabled =
          estado;
      }
    });

  ocultar(
    'pagos-registro-procesando',
    !estado
  );
}

function construirRutaCuenta(
  resultado
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idCotizacion',
    String(
      resultado.idCotizacion
    )
  );

  parametros.set(
    'idVersion',
    String(
      resultado.idVersion
    )
  );

  return (
    '#/pagos/cuenta?' +
    parametros.toString()
  );
}

function renderizarResultado(
  resultado
) {
  ocultar(
    'pagos-registro-formulario',
    true
  );

  ocultar(
    'pagos-registro-resultado',
    false
  );

  texto(
    'pagos-registro-resultado-titulo',
    resultado
      .falloIntegracion
      ? 'Pago registrado con fallo de integración'
      : 'Pago registrado correctamente'
  );

  texto(
    'pagos-registro-resultado-folio',
    resultado.folioPago
  );

  texto(
    'pagos-registro-resultado-acumulado',
    formatCurrency(
      resultado.cuenta
        .acumuladoNeto
    )
  );

  texto(
    'pagos-registro-resultado-saldo-confirmacion',
    formatCurrency(
      resultado.cuenta
        .saldoConfirmacion
    )
  );

  texto(
    'pagos-registro-resultado-saldo-liquidacion',
    formatCurrency(
      resultado.cuenta
        .saldoLiquidacion
    )
  );

  ocultar(
    'pagos-registro-resultado-integracion',
    !resultado
      .resultadoIntegracion
  );

  if (
    resultado
      .resultadoIntegracion
  ) {
    texto(
      'pagos-registro-resultado-integracion-mensaje',
      resultado
        .resultadoIntegracion
        .mensaje
    );

    texto(
      'pagos-registro-resultado-cotizacion',
      resultado
        .resultadoIntegracion
        .referenciaCotizacionConfirmada ||
        '—'
    );

    texto(
      'pagos-registro-resultado-reserva',
      resultado
        .resultadoIntegracion
        .referenciaReserva ||
        '—'
    );

    texto(
      'pagos-registro-resultado-orden',
      resultado
        .resultadoIntegracion
        .referenciaOrdenServicio ||
        '—'
    );
  }

  const alerta =
    resultado
      .resultadoIntegracion
      ?.idAlerta;

  ocultar(
    'pagos-registro-resultado-alerta',
    !alerta
  );

  if (alerta) {
    texto(
      'pagos-registro-resultado-alerta-folio',
      resultado
        .folioAlerta ||
        alerta
    );
  }

  const verCuenta =
    elemento(
      'pagos-registro-resultado-ver-cuenta'
    );

  if (verCuenta) {
    verCuenta.href =
      construirRutaCuenta(
        resultado
      );
  }

  const verAlerta =
    elemento(
      'pagos-registro-resultado-ver-alerta'
    );

  if (verAlerta) {
    verAlerta.hidden =
      !alerta ||
      !puede(
        PERMISOS.ALERTAS
      );

    if (alerta) {
      verAlerta.href =
        `#/pagos/alertas?idAlerta=${encodeURIComponent(
          alerta
        )}`;
    }
  }
}

async function confirmarRegistro() {
  if (procesando) {
    mostrarMensaje(
      'pagos-registro-error',
      'La operación ya se encuentra en proceso.'
    );

    return;
  }

  cerrarConfirmacion();

  establecerProcesando(
    true
  );

  mostrarMensaje(
    'pagos-registro-error',
    ''
  );

  try {
    const resultado =
      await registrarPago(
        datosPago()
      );

    renderizarResultado(
      resultado
    );
  } catch (error) {
    mostrarMensaje(
      'pagos-registro-error',
      error?.message ||
        'No fue posible registrar el pago.'
    );
  } finally {
    establecerProcesando(
      false
    );
  }
}

function capturarComprobante(
  event
) {
  const archivo =
    event.target.files?.[0];

  archivoSeleccionado =
    archivo
      ? {
          nombreArchivo:
            archivo.name,

          tipoArchivo:
            archivo.type,

          tamanoBytes:
            archivo.size,

          disponibleDuranteSesion:
            true
        }
      : null;

  texto(
    'pagos-registro-comprobante-nombre',
    archivoSeleccionado
      ?.nombreArchivo ||
      'Sin archivo seleccionado'
  );
}

function registrarEventos() {
  elemento(
    'btn-pagos-registro-buscar'
  )?.addEventListener(
    'click',
    buscarCotizaciones
  );

  elemento(
    'pagos-registro-busqueda'
  )?.addEventListener(
    'keydown',
    event => {
      if (
        event.key ===
        'Enter'
      ) {
        event.preventDefault();

        buscarCotizaciones();
      }
    }
  );

  elemento(
    'pagos-registro-monto'
  )?.addEventListener(
    'input',
    actualizarProyeccion
  );

  elemento(
    'pagos-registro-comprobante'
  )?.addEventListener(
    'change',
    capturarComprobante
  );

  elemento(
    'btn-pagos-registro-guardar'
  )?.addEventListener(
    'click',
    abrirConfirmacion
  );

  elemento(
    'btn-pagos-confirmacion-cancelar'
  )?.addEventListener(
    'click',
    cerrarConfirmacion
  );

  elemento(
    'btn-pagos-confirmacion-confirmar'
  )?.addEventListener(
    'click',
    confirmarRegistro
  );
}

export function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  if (
    !puede(
      PERMISOS.GESTIONAR
    )
  ) {
    ocultar(
      'pagos-registro-contenido',
      true
    );

    mostrarMensaje(
      'pagos-registro-acceso-denegado',
      'No cuenta con permiso para acceder a esta función.'
    );

    return;
  }

  configurarPermisos(
    root
  );

  registrarEventos();

  ocultar(
    'pagos-registro-resultado',
    true
  );

  ocultar(
    'pagos-registro-formulario',
    false
  );
}