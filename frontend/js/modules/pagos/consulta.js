import {
  consultarCuentasPagos,
  consultarMovimientosPagos
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMetodoPago,
  formatPercentage,
  formatTipoMovimiento,
  getIndicadorMeta
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-consulta-root';

const LIMITE_PAGINA = 10;

const PERMISOS = {
  CONSULTAR:
    'pagos.consultar',

  GESTIONAR:
    'pagos.gestionar'
};

let estado = {
  vista: 'CUENTAS',

  folioCotizacion: '',
  version: '',
  cliente: '',

  fechaInicial: '',
  fechaFinal: '',

  metodo: '',
  tipo: '',

  situacion: '',
  usuarioResponsable: '',

  ordenCampo:
    'fechaUltimoMovimiento',

  ordenDireccion:
    'desc',

  skip: 0,
  limit: LIMITE_PAGINA,

  total: 0
};

let secuenciaConsulta = 0;

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
  valor
) {
  const destino =
    elemento(id);

  if (destino) {
    destino.hidden =
      valor;
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

function parametrosHash() {
  const partes =
    window.location.hash
      .split('?');

  return new URLSearchParams(
    partes[1] || ''
  );
}

function cargarContexto() {
  const parametros =
    parametrosHash();

  const vista =
    parametros.get(
      'vista'
    );

  if (
    ['CUENTAS', 'MOVIMIENTOS']
      .includes(vista)
  ) {
    estado.vista =
      vista;
  }

  [
    'folioCotizacion',
    'version',
    'cliente',
    'fechaInicial',
    'fechaFinal',
    'metodo',
    'tipo',
    'situacion',
    'usuarioResponsable',
    'ordenCampo',
    'ordenDireccion'
  ].forEach(campo => {
    const valor =
      parametros.get(campo);

    if (valor !== null) {
      estado[campo] =
        valor;
    }
  });

  const skip =
    Number(
      parametros.get(
        'skip'
      )
    );

  if (
    Number.isInteger(skip) &&
    skip >= 0
  ) {
    estado.skip =
      skip;
  }

  if (
    !parametros.has(
      'ordenCampo'
    )
  ) {
    estado.ordenCampo =
      estado.vista ===
        'MOVIMIENTOS'
        ? 'fechaHoraRegistro'
        : 'fechaUltimoMovimiento';
  }
}

function sincronizarHash() {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'vista',
    estado.vista
  );

  [
    'folioCotizacion',
    'version',
    'cliente',
    'fechaInicial',
    'fechaFinal',
    'metodo',
    'tipo',
    'situacion',
    'usuarioResponsable'
  ].forEach(campo => {
    if (estado[campo]) {
      parametros.set(
        campo,
        estado[campo]
      );
    }
  });

  if (estado.ordenCampo) {
    parametros.set(
      'ordenCampo',
      estado.ordenCampo
    );
  }

  if (estado.ordenDireccion) {
    parametros.set(
      'ordenDireccion',
      estado.ordenDireccion
    );
  }

  if (estado.skip > 0) {
    parametros.set(
      'skip',
      String(estado.skip)
    );
  }

  const nuevoHash =
    '#/pagos/consulta?' +
    parametros.toString();

    history.replaceState(
    null,
    '',
    nuevoHash
  );

  actualizarRutaRegistro();
}

function actualizarRutaRegistro() {
  const enlace =
    elemento(
      'btn-pagos-consulta-registrar'
    );

  if (!enlace) {
    return;
  }

  const parametros =
    new URLSearchParams();

  parametros.set(
    'returnTo',
    window.location.hash
  );

  enlace.href =
    '#/pagos/nuevo?' +
    parametros.toString();
}

function sincronizarFormulario() {
  const mapa = {
    'pagos-filtro-folio':
      'folioCotizacion',

    'pagos-filtro-version':
      'version',

    'pagos-filtro-cliente':
      'cliente',

    'pagos-filtro-fecha-inicial':
      'fechaInicial',

    'pagos-filtro-fecha-final':
      'fechaFinal',

    'pagos-filtro-metodo':
      'metodo',

    'pagos-filtro-tipo':
      'tipo',

    'pagos-filtro-situacion':
      'situacion',

    'pagos-filtro-usuario':
      'usuarioResponsable'
  };

  Object.entries(
    mapa
  ).forEach(
    ([id, campo]) => {
      const control =
        elemento(id);

      if (control) {
        control.value =
          estado[campo] || '';
      }
    }
  );
}

function configurarPermisos(
  root
) {
  root
    .querySelectorAll(
      '[data-pagos-requiere-permiso]'
    )
    .forEach(destino => {
      const permiso =
        destino.getAttribute(
          'data-pagos-requiere-permiso'
        );

      destino.hidden =
        !puede(permiso);
    });
}

function configurarVista() {
  const cuentas =
    elemento(
      'btn-pagos-vista-cuentas'
    );

  const movimientos =
    elemento(
      'btn-pagos-vista-movimientos'
    );

  const panelCuentas =
    elemento(
      'pagos-panel-cuentas'
    );

  const panelMovimientos =
    elemento(
      'pagos-panel-movimientos'
    );

  const esCuentas =
    estado.vista ===
    'CUENTAS';

  if (cuentas) {
    cuentas.setAttribute(
      'aria-selected',
      esCuentas
        ? 'true'
        : 'false'
    );
  }

  if (movimientos) {
    movimientos.setAttribute(
      'aria-selected',
      esCuentas
        ? 'false'
        : 'true'
    );
  }

  if (panelCuentas) {
    panelCuentas.hidden =
      !esCuentas;
  }

  if (panelMovimientos) {
    panelMovimientos.hidden =
      esCuentas;
  }
}

function leerFiltros() {
  const leer = id =>
    elemento(id)?.value
      ?.trim() || '';

  estado.folioCotizacion =
    leer(
      'pagos-filtro-folio'
    );

  estado.version =
    leer(
      'pagos-filtro-version'
    );

  estado.cliente =
    leer(
      'pagos-filtro-cliente'
    );

  estado.fechaInicial =
    leer(
      'pagos-filtro-fecha-inicial'
    );

  estado.fechaFinal =
    leer(
      'pagos-filtro-fecha-final'
    );

  estado.metodo =
    leer(
      'pagos-filtro-metodo'
    );

  estado.tipo =
    leer(
      'pagos-filtro-tipo'
    );

  estado.situacion =
    leer(
      'pagos-filtro-situacion'
    );

  estado.usuarioResponsable =
    leer(
      'pagos-filtro-usuario'
    );

  estado.skip = 0;
}

function filtrosServicio() {
  return {
    folioCotizacion:
      estado.folioCotizacion,

    version:
      estado.version,

    cliente:
      estado.cliente,

    fechaInicial:
      estado.fechaInicial,

    fechaFinal:
      estado.fechaFinal,

    metodo:
      estado.metodo,

    tipo:
      estado.tipo,

    situacion:
      estado.situacion,

    usuarioResponsable:
      estado.usuarioResponsable,

    ordenCampo:
      estado.ordenCampo,

    ordenDireccion:
      estado.ordenDireccion,

    skip:
      estado.skip,

    limit:
      estado.limit
  };
}

function hayFiltrosActivos() {
  return [
    'folioCotizacion',
    'version',
    'cliente',
    'fechaInicial',
    'fechaFinal',
    'metodo',
    'tipo',
    'situacion',
    'usuarioResponsable'
  ].some(
    campo =>
      Boolean(
        estado[campo]
      )
  );
}

function mostrarCarga(
  cargando
) {
  ocultar(
    'pagos-consulta-cargando',
    !cargando
  );

  const actualizar =
    elemento(
      'btn-pagos-consulta-actualizar'
    );

  const buscar =
    elemento(
      'btn-pagos-consulta-buscar'
    );

  if (actualizar) {
    actualizar.disabled =
      cargando;
  }

  if (buscar) {
    buscar.disabled =
      cargando;
  }
}

function limpiarEstados() {
  ocultar(
    'pagos-consulta-error',
    true
  );

  ocultar(
    'pagos-consulta-vacio',
    true
  );
}

function mostrarError(
  mensaje
) {
  texto(
    'pagos-consulta-error',
    mensaje ||
      'No fue posible consultar los pagos.'
  );

  ocultar(
    'pagos-consulta-error',
    false
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

function construirRutaCuenta(
  cuenta
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idCotizacion',
    String(
      cuenta.idCotizacion
    )
  );

  parametros.set(
    'idVersion',
    String(
      cuenta.idVersion
    )
  );

  parametros.set(
    'returnTo',
    window.location.hash
  );

  return (
    '#/pagos/cuenta?' +
    parametros.toString()
  );
}

function construirRutaCompensar(
  movimiento
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idPago',
    String(
      movimiento.idMovimiento
    )
  );

  parametros.set(
    'returnTo',
    window.location.hash
  );

  return (
    '#/pagos/compensar?' +
    parametros.toString()
  );
}

function crearEnlace(
  etiqueta,
  destino
) {
  const enlace =
    document.createElement(
      'a'
    );

  enlace.textContent =
    etiqueta;

  enlace.href =
    destino;

  enlace.className =
    'pagos-table-action';

  return enlace;
}

function mostrarComprobante(
  movimiento
) {
  const comprobante =
    movimiento.comprobante;

  if (
    !comprobante ||
    !comprobante
      .disponibleDuranteSesion
  ) {
    texto(
      'pagos-consulta-comprobante-nombre',
      'Este movimiento no cuenta con comprobante disponible.'
    );

    texto(
      'pagos-consulta-comprobante-tipo',
      '—'
    );

    texto(
      'pagos-consulta-comprobante-tamano',
      '—'
    );
  } else {
    texto(
      'pagos-consulta-comprobante-nombre',
      comprobante.nombreArchivo ||
        '—'
    );

    texto(
      'pagos-consulta-comprobante-tipo',
      comprobante.tipoArchivo ||
        '—'
    );

    texto(
      'pagos-consulta-comprobante-tamano',
      Number.isFinite(
        Number(
          comprobante.tamanoBytes
        )
      )
        ? `${comprobante.tamanoBytes} bytes`
        : '—'
    );
  }

  const dialogo =
    elemento(
      'pagos-consulta-comprobante-dialog'
    );

  if (
    dialogo &&
    typeof dialogo.showModal ===
      'function'
  ) {
    dialogo.showModal();
  }
}

function crearBotonComprobante(
  movimiento
) {
  const boton =
    document.createElement(
      'button'
    );

  boton.type =
    'button';

  boton.className =
    'pagos-table-action';

  boton.textContent =
    'Ver comprobante';

  boton.addEventListener(
    'click',
    () =>
      mostrarComprobante(
        movimiento
      )
  );

  return boton;
}

function renderizarCuentasTabla(
  items
) {
  const tbody =
    elemento(
      'pagos-cuentas-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  items.forEach(cuenta => {
    const fila =
      document.createElement(
        'tr'
      );

    fila.append(
      crearCelda(
        cuenta.folioCotizacion
      ),

      crearCelda(
        `Versión ${
          cuenta.numeroVersion
        }`
      ),

      crearCelda(
        cuenta.nombreCliente
      ),

      crearCelda(
        formatCurrency(
          cuenta.totalCotizacion
        )
      ),

      crearCelda(
        formatCurrency(
          cuenta.importeRequerido
        )
      ),

      crearCelda(
        formatCurrency(
          cuenta.acumuladoNeto
        )
      ),

      crearCelda(
        formatCurrency(
          cuenta.saldoConfirmacion
        )
      ),

      crearCelda(
        formatCurrency(
          cuenta.saldoLiquidacion
        )
      ),

      crearCelda(
        formatPercentage(
          cuenta.porcentajeCubierto
        )
      )
    );

    const indicador =
      document.createElement(
        'td'
      );

    indicador.appendChild(
      crearIndicador(
        cuenta
          .indicadorPresentacion
      )
    );

    fila.appendChild(
      indicador
    );

    fila.appendChild(
      crearCelda(
        formatDateTime(
          cuenta
            .fechaUltimoMovimiento
        )
      )
    );

    const acciones =
      document.createElement(
        'td'
      );

    acciones.className =
      'pagos-table-actions';

    acciones.appendChild(
      crearEnlace(
        'Ver cuenta',
        construirRutaCuenta(
          cuenta
        )
      )
    );

    fila.appendChild(
      acciones
    );

    tbody.appendChild(
      fila
    );
  });
}

function renderizarMovimientosTabla(
  items
) {
  const tbody =
    elemento(
      'pagos-movimientos-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  items.forEach(
    movimiento => {
      const fila =
        document.createElement(
          'tr'
        );

      if (
        movimiento.tipoMovimiento ===
        'COMPENSACION'
      ) {
        fila.classList.add(
          'pagos-movimiento-compensatorio'
        );
      }

      fila.append(
        crearCelda(
          movimiento.folioMovimiento
        ),

        crearCelda(
          formatDate(
            movimiento.fechaPago
          )
        ),

        crearCelda(
          formatDateTime(
            movimiento
              .fechaHoraRegistro
          )
        ),

        crearCelda(
          formatTipoMovimiento(
            movimiento
              .tipoMovimiento
          )
        ),

        crearCelda(
          movimiento.folioCotizacion
        ),

        crearCelda(
          `Versión ${
            movimiento.numeroVersion
          }`
        ),

        crearCelda(
          movimiento.nombreCliente
        ),

        crearCelda(
          formatMetodoPago(
            movimiento.metodoPago
          )
        ),

        crearCelda(
          formatCurrency(
            movimiento.monto
          )
        ),

        crearCelda(
          movimiento
            .usuarioResponsable
        ),

        crearCelda(
          movimiento
            .folioPagoOriginal ||
            '—'
        )
      );

      const acciones =
        document.createElement(
          'td'
        );

      acciones.className =
        'pagos-table-actions';

      acciones.appendChild(
        crearEnlace(
          'Ver cuenta',
          construirRutaCuenta(
            movimiento
          )
        )
      );

      if (
        movimiento
          .comprobante
          ?.disponibleDuranteSesion
      ) {
        acciones.appendChild(
          crearBotonComprobante(
            movimiento
          )
        );
      }

      if (
        movimiento.tipoMovimiento ===
          'PAGO' &&
        puede(
          PERMISOS.GESTIONAR
        )
      ) {
        acciones.appendChild(
          crearEnlace(
            'Compensar pago',
            construirRutaCompensar(
              movimiento
            )
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

function crearCampoCard(
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

function renderizarCards(
  items
) {
  const contenedor =
    elemento(
      'pagos-consulta-cards'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  items.forEach(item => {
    const card =
      document.createElement(
        'article'
      );

    card.className =
      'pagos-mobile-card';

    const header =
      document.createElement(
        'div'
      );

    header.className =
      'pagos-mobile-card-header';

    const titulo =
      document.createElement(
        'strong'
      );

    titulo.textContent =
      item.folioCotizacion;

    header.appendChild(
      titulo
    );

    const grid =
      document.createElement(
        'div'
      );

    grid.className =
      'pagos-mobile-card-grid';

    if (
      estado.vista ===
      'CUENTAS'
    ) {
      grid.append(
        crearCampoCard(
          'Cliente',
          item.nombreCliente
        ),

        crearCampoCard(
          'Versión',
          String(
            item.numeroVersion
          )
        ),

        crearCampoCard(
          'Acumulado',
          formatCurrency(
            item.acumuladoNeto
          )
        ),

        crearCampoCard(
          'Saldo para liquidar',
          formatCurrency(
            item.saldoLiquidacion
          )
        )
      );

      card.append(
        header,
        crearIndicador(
          item
            .indicadorPresentacion
        ),
        grid,
        crearEnlace(
          'Ver cuenta',
          construirRutaCuenta(
            item
          )
        )
      );
    } else {
      grid.append(
        crearCampoCard(
          'Movimiento',
          formatTipoMovimiento(
            item.tipoMovimiento
          )
        ),

        crearCampoCard(
          'Cliente',
          item.nombreCliente
        ),

        crearCampoCard(
          'Importe',
          formatCurrency(
            item.monto
          )
        ),

        crearCampoCard(
          'Registro',
          formatDateTime(
            item
              .fechaHoraRegistro
          )
        )
      );

      card.append(
        header,
        grid,
        crearEnlace(
          'Ver cuenta',
          construirRutaCuenta(
            item
          )
        )
      );

      if (
        item
          .comprobante
          ?.disponibleDuranteSesion
      ) {
        card.appendChild(
          crearBotonComprobante(
            item
          )
        );
      }

      if (
        item.tipoMovimiento ===
          'PAGO' &&
        puede(
          PERMISOS.GESTIONAR
        )
      ) {
        card.appendChild(
          crearEnlace(
            'Compensar pago',
            construirRutaCompensar(
              item
            )
          )
        );
      }
    }

    contenedor.appendChild(
      card
    );
  });
}

function renderizarPaginacion() {
  const inicio =
    estado.total === 0
      ? 0
      : estado.skip + 1;

  const fin =
    Math.min(
      estado.skip +
        estado.limit,
      estado.total
    );

  texto(
    'pagos-consulta-paginacion-texto',
    `${inicio}-${fin} de ${estado.total}`
  );

  const anterior =
    elemento(
      'btn-pagos-consulta-anterior'
    );

  const siguiente =
    elemento(
      'btn-pagos-consulta-siguiente'
    );

  if (anterior) {
    anterior.disabled =
      estado.skip <= 0;
  }

  if (siguiente) {
    siguiente.disabled =
      estado.skip +
        estado.limit >=
      estado.total;
  }
}

function renderizarResultado(
  resultado
) {
  const items =
    resultado.items || [];

  estado.total =
    resultado.total ?? 0;

  const vacio =
    items.length === 0;

  ocultar(
    'pagos-consulta-vacio',
    !vacio
  );

  ocultar(
    'pagos-consulta-resultados',
    vacio
  );

  if (vacio) {
    const mensaje =
      hayFiltrosActivos()
        ? 'No se encontraron resultados para los filtros seleccionados.'
        : (
            estado.vista ===
              'CUENTAS'
              ? 'No hay cuentas de pago registradas.'
              : 'No hay movimientos registrados.'
          );

    texto(
      'pagos-consulta-vacio',
      mensaje
    );

    renderizarPaginacion();
    return;
  }

  if (
    estado.vista ===
    'CUENTAS'
  ) {
    renderizarCuentasTabla(
      items
    );
  } else {
    renderizarMovimientosTabla(
      items
    );
  }

  renderizarCards(
    items
  );

  renderizarPaginacion();
}

async function consultar() {
  const consultaActual =
    ++secuenciaConsulta;

  limpiarEstados();
  mostrarCarga(true);

  sincronizarHash();

  try {
    const resultado =
      estado.vista ===
        'CUENTAS'
        ? await consultarCuentasPagos(
            filtrosServicio()
          )
        : await consultarMovimientosPagos(
            filtrosServicio()
          );

    if (
      consultaActual !==
      secuenciaConsulta
    ) {
      return;
    }

    renderizarResultado(
      resultado
    );
  } catch (error) {
    if (
      consultaActual !==
      secuenciaConsulta
    ) {
      return;
    }

    ocultar(
      'pagos-consulta-resultados',
      true
    );

    mostrarError(
      error?.message
    );
  } finally {
    if (
      consultaActual ===
      secuenciaConsulta
    ) {
      mostrarCarga(false);
    }
  }
}

function cambiarVista(
  vista
) {
  if (
    estado.vista ===
    vista
  ) {
    return;
  }

  estado.vista =
    vista;

  estado.ordenCampo =
    vista ===
      'MOVIMIENTOS'
      ? 'fechaHoraRegistro'
      : 'fechaUltimoMovimiento';

  estado.ordenDireccion =
    'desc';

  estado.skip = 0;

  configurarVista();

  consultar();
}

function ordenar(
  campo
) {
  if (
    estado.ordenCampo ===
    campo
  ) {
    estado.ordenDireccion =
      estado.ordenDireccion ===
        'asc'
        ? 'desc'
        : 'asc';
  } else {
    estado.ordenCampo =
      campo;

    estado.ordenDireccion =
      'asc';
  }

  estado.skip = 0;

  consultar();
}

function limpiarFiltros() {
  estado = {
    ...estado,

    folioCotizacion: '',
    version: '',
    cliente: '',

    fechaInicial: '',
    fechaFinal: '',

    metodo: '',
    tipo: '',

    situacion: '',
    usuarioResponsable: '',

    skip: 0
  };

  sincronizarFormulario();

  consultar();
}

function paginaAnterior() {
  estado.skip =
    Math.max(
      estado.skip -
        estado.limit,
      0
    );

  consultar();
}

function paginaSiguiente() {
  if (
    estado.skip +
      estado.limit >=
    estado.total
  ) {
    return;
  }

  estado.skip +=
    estado.limit;

  consultar();
}

function registrarEventos() {
  elemento(
    'btn-pagos-vista-cuentas'
  )?.addEventListener(
    'click',
    () =>
      cambiarVista(
        'CUENTAS'
      )
  );

  elemento(
    'btn-pagos-vista-movimientos'
  )?.addEventListener(
    'click',
    () =>
      cambiarVista(
        'MOVIMIENTOS'
      )
  );

  elemento(
    'btn-pagos-consulta-buscar'
  )?.addEventListener(
    'click',
    () => {
      leerFiltros();
      consultar();
    }
  );

  elemento(
    'btn-pagos-consulta-limpiar'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  elemento(
    'btn-pagos-consulta-actualizar'
  )?.addEventListener(
    'click',
    consultar
  );

  elemento(
    'btn-pagos-consulta-anterior'
  )?.addEventListener(
    'click',
    paginaAnterior
  );

  elemento(
    'btn-pagos-consulta-siguiente'
  )?.addEventListener(
    'click',
    paginaSiguiente
  );

  elemento(
    'btn-pagos-consulta-comprobante-cerrar'
  )?.addEventListener(
    'click',
    () =>
      elemento(
        'pagos-consulta-comprobante-dialog'
      )?.close()
  );

  document
    .querySelectorAll(
      '[data-pagos-orden]'
    )
    .forEach(boton => {
      boton.addEventListener(
        'click',
        () =>
          ordenar(
            boton.dataset
              .pagosOrden
          )
      );
    });
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

  cargarContexto();

  sincronizarFormulario();

  configurarPermisos(
    root
  );

  configurarVista();

  registrarEventos();

  consultar();
}