import {
  consultarAlertasInventario,
  TIPOS_ALERTA_INVENTARIO
} from '../../api/inventario-alertas.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

const STORAGE_KEY =
  'inventario.alertas.estado';

const LIMIT_PAGINA = 10;

let secuenciaCarga = 0;

let estado = {
  texto: '',
  tipo: '',
  ordenPor: 'tipo',
  direccion: 'asc',
  skip: 0,
  limit: LIMIT_PAGINA,
  datos: null
};

/**
 * Obtiene un elemento de la pantalla.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function elemento(id) {
  return document.getElementById(id);
}

/**
 * Coloca texto de forma segura.
 *
 * @param {string} id
 * @param {*} contenido
 */
function texto(id, contenido) {
  const destino = elemento(id);

  if (destino) {
    destino.textContent =
      contenido ?? '';
  }
}

/**
 * Controla visibilidad de un elemento.
 *
 * @param {string} id
 * @param {boolean} oculto
 */
function ocultar(id, oculto) {
  const destino = elemento(id);

  if (destino) {
    destino.hidden = oculto;
  }
}

/**
 * Formatea fecha y hora.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) {
    return '—';
  }

  const valor = new Date(fecha);

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(valor);
}

/**
 * Persiste filtros y paginación para conservar
 * el contexto al regresar a la pantalla.
 */
function guardarEstado() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        texto: estado.texto,
        tipo: estado.tipo,
        ordenPor:
          estado.ordenPor,
        direccion:
          estado.direccion,
        skip:
          estado.skip,
        limit:
          estado.limit
      })
    );
  } catch {
    /*
     * La persistencia es auxiliar.
     * Una falla en sessionStorage no debe impedir
     * utilizar la pantalla.
     */
  }
}

/**
 * Recupera el último contexto de consulta.
 */
function restaurarEstado() {
  try {
    const contenido =
      sessionStorage.getItem(
        STORAGE_KEY
      );

    if (!contenido) {
      return;
    }

    const guardado =
      JSON.parse(contenido);

    estado = {
      ...estado,

      texto:
        typeof guardado.texto ===
        'string'
          ? guardado.texto
          : '',

      tipo:
        typeof guardado.tipo ===
        'string'
          ? guardado.tipo
          : '',

      ordenPor:
        typeof guardado.ordenPor ===
        'string'
          ? guardado.ordenPor
          : 'tipo',

      direccion:
        guardado.direccion ===
        'desc'
          ? 'desc'
          : 'asc',

      skip:
        Number.isInteger(
          guardado.skip
        ) &&
        guardado.skip >= 0
          ? guardado.skip
          : 0,

      limit:
        Number.isInteger(
          guardado.limit
        ) &&
        guardado.limit > 0
          ? guardado.limit
          : LIMIT_PAGINA
    };
  } catch {
    /*
     * Si el contenido almacenado es inválido
     * simplemente se utiliza el estado inicial.
     */
  }
}

/**
 * Sincroniza los controles HTML con el estado.
 */
function sincronizarControles() {
  const busqueda =
    elemento('alertas-busqueda');

  const tipo =
    elemento('alertas-tipo');

  if (busqueda) {
    busqueda.value =
      estado.texto;
  }

  if (tipo) {
    tipo.value =
      estado.tipo;
  }
}

/**
 * Muestra el estado de carga sin destruir el
 * contenido anterior.
 *
 * @param {boolean} cargando
 */
function mostrarCarga(cargando) {
  ocultar(
    'alertas-estado-cargando',
    !cargando
  );

  const boton =
    elemento(
      'btn-alertas-actualizar'
    );

  if (boton) {
    boton.disabled = cargando;

    boton.setAttribute(
      'aria-busy',
      cargando
        ? 'true'
        : 'false'
    );
  }
}

/**
 * Limpia estados informativos.
 */
function limpiarEstados() {
  ocultar(
    'alertas-estado-error',
    true
  );

  ocultar(
    'alertas-estado-vacio',
    true
  );
}

/**
 * Crea una celda de tabla.
 *
 * @param {*} contenido
 * @returns {HTMLTableCellElement}
 */
function crearCelda(contenido) {
  const celda =
    document.createElement('td');

  celda.textContent =
    contenido ?? '—';

  return celda;
}

/**
 * Obtiene la etiqueta visible del tipo.
 *
 * @param {string} tipo
 * @returns {string}
 */
function etiquetaTipo(tipo) {
  switch (tipo) {
    case TIPOS_ALERTA_INVENTARIO.MINIMO:
      return 'Mínimo';

    case TIPOS_ALERTA_INVENTARIO.MAXIMO:
      return 'Máximo';

    case TIPOS_ALERTA_INVENTARIO
      .CONFIGURACION_INCONSISTENTE:
      return 'Configuración inconsistente';

    default:
      return 'Alerta';
  }
}

/**
 * Crea indicador semántico del tipo de alerta.
 *
 * @param {string} tipo
 * @returns {HTMLElement}
 */
function crearTipoAlerta(tipo) {
  const indicador =
    document.createElement('span');

  indicador.classList.add(
    'inventario-alertas-tipo'
  );

  switch (tipo) {
    case TIPOS_ALERTA_INVENTARIO.MINIMO:
      indicador.classList.add(
        'inventario-alertas-tipo-minimo'
      );
      break;

    case TIPOS_ALERTA_INVENTARIO.MAXIMO:
      indicador.classList.add(
        'inventario-alertas-tipo-maximo'
      );
      break;

    case TIPOS_ALERTA_INVENTARIO
      .CONFIGURACION_INCONSISTENTE:
      indicador.classList.add(
        'inventario-alertas-tipo-inconsistente'
      );
      break;
  }

  indicador.textContent =
    etiquetaTipo(tipo);

  return indicador;
}

/**
 * Crea la representación del producto.
 *
 * @param {Object} alerta
 * @returns {HTMLElement}
 */
function crearProducto(alerta) {
  const contenedor =
    document.createElement('div');

  contenedor.className =
    'inventario-alertas-producto';

  if (alerta.imagenUrl) {
    const imagen =
      document.createElement('img');

    imagen.src =
      alerta.imagenUrl;

    imagen.alt =
      `Imagen de ${alerta.nombre}`;

    imagen.loading = 'lazy';

    contenedor.appendChild(
      imagen
    );
  }

  const datos =
    document.createElement('div');

  const nombre =
    document.createElement('strong');

  nombre.textContent =
    alerta.nombre;

  const codigo =
    document.createElement('span');

  codigo.textContent =
    alerta.codigo;

  datos.append(
    nombre,
    codigo
  );

  contenedor.appendChild(
    datos
  );

  return contenedor;
}

/**
 * Crea una acción de navegación SPA.
 *
 * @param {string} etiqueta
 * @param {string} destino
 * @returns {HTMLAnchorElement}
 */
function crearAccion(
  etiqueta,
  destino
) {
  const enlace =
    document.createElement('a');

  enlace.href =
    destino;

  enlace.textContent =
    etiqueta;

  enlace.className =
    'inventario-alertas-accion';

  return enlace;
}

/**
 * Construye las acciones permitidas para una
 * alerta utilizando permisos efectivos.
 *
 * @param {Object} alerta
 * @returns {HTMLElement}
 */
function crearAcciones(alerta) {
  const contenedor =
    document.createElement('div');

  contenedor.className =
    'inventario-alertas-acciones';

  const session =
    getSession();

  if (
    hasPermission(
      session,
      'catalogo.consultar'
    )
  ) {
    contenedor.appendChild(
      crearAccion(
        'Ver artículo',
        '#/catalogo/productos/detalle' +
          `?id=${alerta.idProducto}` +
          '&origen=inventario-alertas'
      )
    );
  }

  if (
    hasPermission(
      session,
      'inventario.consultar'
    )
  ) {
    acciones.appendChild(
      crearAccion(
        'Ver existencia',
        '#/inventario/existencias/detalle' +
          `?idProducto=${alerta.idProducto}`
      )
    );
  }

  if (
    hasPermission(
      session,
      'inventario.movimientos.consultar'
    )
  ) {
    acciones.appendChild(
      crearAccion(
        'Ver movimientos',
        '#/inventario/movimientos' +
          `?idProducto=${alerta.idProducto}` +
          '&origen=alertas'
      )
    );
  }

    contenedor.appendChild(
      crearAccion(
        'Ver movimientos',
        '#/inventario/movimientos' +
          `?idProducto=${alerta.idProducto}` +
          '&origen=alertas'
      )
    );
  }

  return contenedor;
}

/**
 * Renderiza tabla para escritorio.
 *
 * @param {Object[]} alertas
 */
function renderizarTabla(alertas) {
  const cuerpo =
    elemento('alertas-tbody');

  if (!cuerpo) {
    return;
  }

  cuerpo.replaceChildren();

  alertas.forEach(alerta => {
    const fila =
      document.createElement('tr');

    const tipo =
      document.createElement('td');

    tipo.appendChild(
      crearTipoAlerta(
        alerta.tipo
      )
    );

    const producto =
      document.createElement('td');

    producto.appendChild(
      crearProducto(alerta)
    );

    const diferencia =
      alerta.diferencia === null
        ? '—'
        : String(
            alerta.diferencia
          );

    const acciones =
      document.createElement('td');

    acciones.appendChild(
      crearAcciones(alerta)
    );

    fila.append(
      tipo,
      producto,
      crearCelda(
        alerta.almacen
      ),
      crearCelda(
        `${alerta.cantidadActual} ${alerta.unidadMedida}`
      ),
      crearCelda(
        alerta.stockMinimo ??
          '—'
      ),
      crearCelda(
        alerta.stockMaximo ??
          '—'
      ),
      crearCelda(
        diferencia
      ),
      crearCelda(
        formatearFecha(
          alerta.fechaActualizacion
        )
      ),
      acciones
    );

    cuerpo.appendChild(
      fila
    );
  });
}

/**
 * Crea una pareja etiqueta / valor para las
 * tarjetas móviles.
 *
 * @param {string} etiqueta
 * @param {*} valor
 * @returns {HTMLElement}
 */
function crearDatoTarjeta(
  etiqueta,
  valor
) {
  const grupo =
    document.createElement('div');

  grupo.className =
    'inventario-alertas-card-dato';

  const titulo =
    document.createElement('span');

  titulo.textContent =
    etiqueta;

  const contenido =
    document.createElement('strong');

  contenido.textContent =
    valor ?? '—';

  grupo.append(
    titulo,
    contenido
  );

  return grupo;
}

/**
 * Renderiza tarjetas para presentación móvil.
 *
 * @param {Object[]} alertas
 */
function renderizarTarjetas(alertas) {
  const contenedor =
    elemento('alertas-cards');

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  alertas.forEach(alerta => {
    const tarjeta =
      document.createElement('article');

    tarjeta.className =
      'card inventario-alertas-card';

    const encabezado =
      document.createElement('header');

    encabezado.appendChild(
      crearTipoAlerta(
        alerta.tipo
      )
    );

    const producto =
      crearProducto(alerta);

    const datos =
      document.createElement('div');

    datos.className =
      'inventario-alertas-card-grid';

    datos.append(
      crearDatoTarjeta(
        'Alcance',
        alerta.almacen
      ),

      crearDatoTarjeta(
        'Existencia actual',
        `${alerta.cantidadActual} ${alerta.unidadMedida}`
      ),

      crearDatoTarjeta(
        'Mínimo',
        alerta.stockMinimo
      ),

      crearDatoTarjeta(
        'Máximo',
        alerta.stockMaximo
      ),

      crearDatoTarjeta(
        'Diferencia',
        alerta.diferencia
      ),

      crearDatoTarjeta(
        'Actualización',
        formatearFecha(
          alerta.fechaActualizacion
        )
      )
    );

    tarjeta.append(
      encabezado,
      producto,
      datos,
      crearAcciones(alerta)
    );

    contenedor.appendChild(
      tarjeta
    );
  });
}

/**
 * Actualiza los contadores superiores.
 *
 * @param {Object} resumen
 */
function renderizarResumen(resumen) {
  texto(
    'alertas-total',
    resumen.total
  );

  texto(
    'alertas-total-minimos',
    resumen.minimos
  );

  texto(
    'alertas-total-maximos',
    resumen.maximos
  );

  texto(
    'alertas-total-inconsistentes',
    resumen.inconsistentes
  );
}

/**
 * Actualiza la información de paginación.
 *
 * @param {Object} datos
 */
function renderizarPaginacion(datos) {
  const paginaActual =
    Math.floor(
      datos.skip /
      datos.limit
    ) + 1;

  const paginas =
    Math.max(
      1,
      Math.ceil(
        datos.total /
        datos.limit
      )
    );

  texto(
    'alertas-pagina',
    `${paginaActual} de ${paginas}`
  );

  texto(
    'alertas-resultados',
    datos.total === 1
      ? '1 resultado'
      : `${datos.total} resultados`
  );

  const anterior =
    elemento(
      'btn-alertas-anterior'
    );

  const siguiente =
    elemento(
      'btn-alertas-siguiente'
    );

  if (anterior) {
    anterior.disabled =
      datos.skip <= 0;
  }

  if (siguiente) {
    siguiente.disabled =
      datos.skip +
        datos.limit >=
      datos.total;
  }
}

/**
 * Renderiza la respuesta completa.
 *
 * @param {Object} datos
 */
function renderizar(datos) {
  estado.datos = datos;

  renderizarResumen(
    datos.resumen
  );

  renderizarTabla(
    datos.items
  );

  renderizarTarjetas(
    datos.items
  );

  renderizarPaginacion(
    datos
  );

  texto(
    'alertas-ultima-actualizacion',
    formatearFecha(
      datos.fechaConsulta
    )
  );

  const sinResultados =
    datos.total === 0;

  ocultar(
    'alertas-estado-vacio',
    !sinResultados
  );

  ocultar(
    'alertas-resultados-contenido',
    sinResultados
  );
}

/**
 * Ejecuta la consulta actual.
 */
async function cargarAlertas() {
  const solicitudActual =
    ++secuenciaCarga;

  limpiarEstados();
  mostrarCarga(true);

  try {
    const datos =
      await consultarAlertasInventario({
        texto:
          estado.texto,

        tipo:
          estado.tipo,

        ordenPor:
          estado.ordenPor,

        direccion:
          estado.direccion,

        skip:
          estado.skip,

        limit:
          estado.limit
      });

    /*
     * Evita aplicar una respuesta anterior
     * cuando el usuario cambia filtros rápido.
     */
    if (
      solicitudActual !==
      secuenciaCarga
    ) {
      return;
    }

    /*
     * Si la página actual quedó fuera del
     * rango después de filtrar, regresar
     * automáticamente al inicio.
     */
    if (
      datos.total > 0 &&
      datos.skip >=
        datos.total
    ) {
      estado.skip = 0;

      guardarEstado();

      await cargarAlertas();

      return;
    }

    renderizar(datos);
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaCarga
    ) {
      return;
    }

    texto(
      'alertas-error-mensaje',
      error?.message ||
        'No fue posible obtener las alertas de inventario.'
    );

    ocultar(
      'alertas-estado-error',
      false
    );
  } finally {
    if (
      solicitudActual ===
      secuenciaCarga
    ) {
      mostrarCarga(false);
    }
  }
}

/**
 * Aplica filtros desde controles.
 */
function aplicarFiltros() {
  estado.texto =
    elemento(
      'alertas-busqueda'
    )?.value?.trim() ||
    '';

  estado.tipo =
    elemento(
      'alertas-tipo'
    )?.value ||
    '';

  estado.skip = 0;

  guardarEstado();

  cargarAlertas();
}

/**
 * Restablece filtros de consulta.
 */
function limpiarFiltros() {
  estado.texto = '';
  estado.tipo = '';
  estado.skip = 0;

  sincronizarControles();
  guardarEstado();

  cargarAlertas();
}

/**
 * Cambia el filtro directamente desde una
 * tarjeta del resumen.
 *
 * @param {string} tipo
 */
function filtrarPorTipo(tipo) {
  estado.tipo =
    estado.tipo === tipo
      ? ''
      : tipo;

  estado.skip = 0;

  sincronizarControles();
  guardarEstado();

  cargarAlertas();
}

/**
 * Cambia criterio de ordenamiento.
 *
 * @param {string} campo
 */
function ordenarPor(campo) {
  if (
    estado.ordenPor === campo
  ) {
    estado.direccion =
      estado.direccion === 'asc'
        ? 'desc'
        : 'asc';
  } else {
    estado.ordenPor =
      campo;

    estado.direccion =
      'asc';
  }

  estado.skip = 0;

  guardarEstado();

  cargarAlertas();
}

/**
 * Registra los manejadores de la pantalla.
 */
function registrarEventos() {
  elemento(
    'btn-alertas-actualizar'
  )?.addEventListener(
    'click',
    cargarAlertas
  );

  elemento(
    'btn-alertas-reintentar'
  )?.addEventListener(
    'click',
    cargarAlertas
  );

  elemento(
    'btn-alertas-limpiar'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  elemento(
    'alertas-tipo'
  )?.addEventListener(
    'change',
    aplicarFiltros
  );

  let temporizadorBusqueda = null;

  elemento(
    'alertas-busqueda'
  )?.addEventListener(
    'input',
    () => {
      window.clearTimeout(
        temporizadorBusqueda
      );

      temporizadorBusqueda =
        window.setTimeout(
          aplicarFiltros,
          250
        );
    }
  );

  elemento(
    'btn-alertas-anterior'
  )?.addEventListener(
    'click',
    () => {
      estado.skip =
        Math.max(
          0,
          estado.skip -
            estado.limit
        );

      guardarEstado();

      cargarAlertas();
    }
  );

  elemento(
    'btn-alertas-siguiente'
  )?.addEventListener(
    'click',
    () => {
      if (
        !estado.datos ||
        estado.skip +
          estado.limit >=
          estado.datos.total
      ) {
        return;
      }

      estado.skip +=
        estado.limit;

      guardarEstado();

      cargarAlertas();
    }
  );

  document
    .querySelectorAll(
      '[data-alertas-tipo]'
    )
    .forEach(control => {
      control.addEventListener(
        'click',
        () => {
          filtrarPorTipo(
            control.dataset
              .alertasTipo
          );
        }
      );
    });

  document
    .querySelectorAll(
      '[data-alertas-sort]'
    )
    .forEach(control => {
      control.addEventListener(
        'click',
        () => {
          ordenarPor(
            control.dataset
              .alertasSort
          );
        }
      );
    });
}

/**
 * Inicializa la pantalla.
 */
export async function init() {
  /*
   * Permite detectar una integración incompleta
   * sin interferir con otras pantallas.
   */
  if (
    !elemento('alertas-page')
  ) {
    return;
  }

  restaurarEstado();
  sincronizarControles();
  registrarEventos();

  await cargarAlertas();
}