import {
  consultarExistenciasInventario
} from '../../api/inventario.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  escapeHtml
} from '../../shared/formatters.js';

const ROOT_ID = 'existencias-root';
const LIMITE_PAGINA = 10;

const PERMISOS = {
  CONSULTAR:
    'inventario.consultar',

  OPERATIVO:
    'inventario.existencias.operativas.consultar',

  INACTIVOS:
    'inventario.existencias.inactivos.consultar',

  DISPONIBILIDAD:
    'inventario.disponibilidad.consultar',

  CORTES:
    'inventario.cortes.consultar',

  ALERTAS:
    'inventario.alertas.consultar',

  GESTIONAR:
    'inventario.gestionar'
};

let secuenciaConsulta = 0;
let temporizadorBusqueda = null;

let estado = {
  texto: '',
  disponibilidad: '',
  nivel: '',
  estadoProducto: 'ACTIVO',
  mostrarInactivos: false,
  idProducto: null,
  skip: 0,
  limit: LIMITE_PAGINA,
  datos: null
};

/**
 * Obtiene un elemento por identificador.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function elemento(id) {
  return document.getElementById(id);
}

/**
 * Obtiene el elemento raíz de la pantalla.
 *
 * @returns {HTMLElement|null}
 */
function obtenerRoot() {
  return elemento(ROOT_ID);
}

/**
 * Obtiene la sesión actual.
 *
 * @returns {Object|null}
 */
function sesionActual() {
  return getSession();
}

/**
 * Valida un permiso efectivo.
 *
 * @param {string} permiso
 * @returns {boolean}
 */
function puede(permiso) {
  return hasPermission(
    sesionActual(),
    permiso
  );
}

/**
 * Controla la visibilidad de un elemento.
 *
 * @param {string} id
 * @param {boolean} valor
 */
function ocultar(id, valor) {
  const destino =
    elemento(id);

  if (destino) {
    destino.hidden =
      valor;
  }
}

/**
 * Coloca texto de forma segura.
 *
 * @param {string} id
 * @param {*} valor
 */
function texto(id, valor) {
  const destino =
    elemento(id);

  if (destino) {
    destino.textContent =
      valor ?? '';
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

  const valor =
    new Date(fecha);

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
 * Obtiene los parámetros incluidos
 * en el hash de navegación.
 *
 * @returns {URLSearchParams}
 */
function parametrosHash() {
  const partes =
    window.location.hash
      .split('?');

  return new URLSearchParams(
    partes[1] || ''
  );
}

/**
 * Recupera un producto recibido
 * desde otra pantalla.
 */
function cargarContextoInicial() {
  const parametros =
    parametrosHash();

  estado = {
    texto: '',
    disponibilidad: '',
    nivel: '',
    estadoProducto: 'ACTIVO',
    mostrarInactivos: false,
    idProducto: null,
    skip: 0,
    limit: LIMITE_PAGINA,
    datos: null
  };

  const idProducto =
    Number(
      parametros.get(
        'idProducto'
      )
    );

  if (
    Number.isInteger(
      idProducto
    ) &&
    idProducto > 0
  ) {
    estado.idProducto =
      idProducto;
  }

  const texto =
    parametros.get(
      'texto'
    );

  if (texto !== null) {
    estado.texto =
      texto;
  }

  const disponibilidad =
    parametros.get(
      'disponibilidad'
    );

  if (
    [
      '',
      'DISPONIBLE',
      'NO_DISPONIBLE'
    ].includes(
      disponibilidad
    )
  ) {
    estado.disponibilidad =
      disponibilidad;
  }

  const nivel =
    parametros.get(
      'nivel'
    );

  if (
    [
      '',
      'BAJO_MINIMO',
      'EN_RANGO',
      'SOBRE_MAXIMO',
      'SIN_CONFIGURAR'
    ].includes(nivel)
  ) {
    estado.nivel =
      nivel;
  }

  const estadoProducto =
    parametros.get(
      'estadoProducto'
    );

  if (
    [
      'ACTIVO',
      'INACTIVO'
    ].includes(
      estadoProducto
    )
  ) {
    estado.estadoProducto =
      estadoProducto;
  }

  const mostrarInactivos =
    parametros.get(
      'mostrarInactivos'
    );

  if (
    mostrarInactivos !==
    null
  ) {
    estado.mostrarInactivos =
      mostrarInactivos ===
      'true';
  }

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
    estado.skip = skip;
  }
}

/**
 * Sincroniza los filtros HTML
 * con el estado interno.
 */
function sincronizarControles() {
  const estadoProducto =
  elemento(
    'existencias-estado'
  );

  if (estadoProducto) {
    estadoProducto.value =
      estado.estadoProducto;
  }

  const busqueda =
    elemento(
      'existencias-busqueda'
    );

  const disponibilidad =
    elemento(
      'existencias-disponibilidad'
    );

  const nivel =
    elemento(
      'existencias-nivel'
    );

  const inactivos =
    elemento(
      'existencias-inactivos'
    );

  if (busqueda) {
    busqueda.value =
      estado.texto;
  }

  if (disponibilidad) {
    disponibilidad.value =
      estado.disponibilidad;
  }

  if (nivel) {
    nivel.value =
      estado.nivel;
  }

  if (inactivos) {
    inactivos.checked =
      estado.mostrarInactivos;
  }
}

/**
 * Aplica visibilidad a controles
 * según permisos efectivos.
 */
function configurarVisibilidadPermisos() {
  const opcionInactivo =
    elemento(
      'existencias-estado'
    )?.querySelector(
      'option[value="INACTIVO"]'
    );

  if (opcionInactivo) {
    const autorizado =
      puede(
        PERMISOS.INACTIVOS
      );

    opcionInactivo.hidden =
      !autorizado;

    opcionInactivo.disabled =
      !autorizado;
  }

  document
    .querySelectorAll(
      '[data-existencias-requiere-permiso]'
    )
    .forEach(enlace => {
      const permiso =
        enlace.getAttribute(
          'data-existencias-requiere-permiso'
        );

      enlace.hidden =
        !puede(permiso);
    });
}

/**
 * Controla el estado visual de carga.
 *
 * @param {boolean} cargando
 */
function mostrarCarga(cargando) {
  ocultar(
    'existencias-estado-cargando',
    !cargando
  );

  const boton =
    elemento(
      'btn-existencias-actualizar'
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

/**
 * Limpia estados informativos.
 */
function limpiarEstados() {
  ocultar(
    'existencias-estado-error',
    true
  );

  ocultar(
    'existencias-estado-vacio',
    true
  );
}

/**
 * Obtiene la etiqueta visible
 * para un nivel.
 *
 * @param {string} nivel
 * @returns {string}
 */
function etiquetaNivel(nivel) {
  switch (nivel) {
    case 'BAJO_MINIMO':
      return 'Bajo mínimo';

    case 'EN_RANGO':
      return 'En rango';

    case 'SOBRE_MAXIMO':
      return 'Sobre máximo';

    case 'SIN_CONFIGURAR':
      return 'Sin configurar';

    default:
      return '—';
  }
}

/**
 * Obtiene la clase visual del nivel.
 *
 * @param {string} nivel
 * @returns {string}
 */
function claseNivel(nivel) {
  switch (nivel) {
    case 'BAJO_MINIMO':
      return (
        'inventario-existencias-nivel-bajo'
      );

    case 'EN_RANGO':
      return (
        'inventario-existencias-nivel-rango'
      );

    case 'SOBRE_MAXIMO':
      return (
        'inventario-existencias-nivel-alto'
      );

    default:
      return (
        'inventario-existencias-nivel-sin-configurar'
      );
  }
}

/**
 * Crea el indicador visual
 * del nivel de inventario.
 *
 * @param {string} nivel
 * @returns {HTMLElement}
 */
function crearIndicadorNivel(
  nivel
) {
  const indicador =
    document.createElement(
      'span'
    );

  indicador.className =
    'inventario-existencias-nivel ' +
    claseNivel(nivel);

  indicador.textContent =
    etiquetaNivel(nivel);

  return indicador;
}

/**
 * Crea el indicador de disponibilidad.
 *
 * @param {Object} item
 * @returns {HTMLElement}
 */
function crearIndicadorDisponibilidad(
  item
) {
  const indicador =
    document.createElement(
      'span'
    );

  const disponible =
    item.estadoDisponibilidad ===
    'DISPONIBLE';

  indicador.className =
    'inventario-existencias-disponibilidad ' +
    (
      disponible
        ? 'inventario-existencias-disponible'
        : 'inventario-existencias-no-disponible'
    );

  indicador.textContent =
    disponible
      ? 'Disponible'
      : 'No disponible';

  return indicador;
}

/**
 * Construye la presentación del producto.
 *
 * @param {Object} item
 * @returns {HTMLElement}
 */
function crearProducto(item) {
  const contenedor =
    document.createElement(
      'div'
    );

  contenedor.className =
    'inventario-existencias-producto';

  if (item.imagenUrl) {
    const imagen =
      document.createElement(
        'img'
      );

    imagen.src =
      item.imagenUrl;

    imagen.alt =
      `Imagen de ${item.nombre}`;

    imagen.loading =
      'lazy';

    contenedor.appendChild(
      imagen
    );
  }

  const datos =
    document.createElement(
      'div'
    );

  const nombre =
    document.createElement(
      'strong'
    );

  const codigo =
    document.createElement(
      'span'
    );

  nombre.textContent =
    item.nombre || '—';

  codigo.textContent =
    item.codigo || '—';

  datos.append(
    nombre,
    codigo
  );

  if (
  item.activo === false
) {
  const inactivo =
    document.createElement(
      'small'
    );

  inactivo.textContent =
    'Inactivo';

  inactivo.className =
    'inventario-existencias-inactivo';

  datos.appendChild(
    inactivo
  );
}

if (
  item.reservaInconsistente ===
  true
) {
  const advertencia =
    document.createElement(
      'small'
    );

  advertencia.className =
    'inventario-existencias-advertencia';

  advertencia.textContent =
    'Reserva mayor a existencia registrada';

  datos.appendChild(
    advertencia
  );
}

contenedor.appendChild(
  datos
);

  return contenedor;
}

/**
 * Crea una celda de tabla.
 *
 * @param {*} valor
 * @returns {HTMLTableCellElement}
 */
function crearCelda(valor) {
  const celda =
    document.createElement(
      'td'
    );

  celda.textContent =
    valor ?? '—';

  return celda;
}

/**
 * Crea una acción SPA.
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
    document.createElement(
      'a'
    );

  enlace.href =
    destino;

  enlace.textContent =
    etiqueta;

  enlace.className =
    'inventario-existencias-accion';

  return enlace;
}

/**
 * Determina si el producto tiene
 * una alerta contextual.
 *
 * @param {Object} item
 * @returns {boolean}
 */
function itemTieneAlerta(item) {
  return (
    item.nivel ===
      'BAJO_MINIMO' ||
    item.nivel ===
      'SOBRE_MAXIMO' ||
    item.configuracionInconsistente ===
      true ||
    item.tieneAlerta ===
      true
  );
}

/**
 * Construye las acciones disponibles
 * para una existencia.
 *
 * @param {Object} item
 * @returns {HTMLElement}
 */
function crearAcciones(item) {
  const contenedor =
    document.createElement(
      'div'
    );

  contenedor.className =
    'inventario-existencias-acciones';

  contenedor.appendChild(
    crearAccion(
      'Ver detalle',
      construirRutaDetalle(item)
    )
  );

  if (
    puede(
      PERMISOS.DISPONIBILIDAD
    )
  ) {
    contenedor.appendChild(
      crearAccion(
        'Disponibilidad futura',
        '#/inventario/disponibilidad-futura' +
          `?idProducto=${item.idProducto}`
      )
    );
  }

  if (
    puede(
      PERMISOS.ALERTAS
    ) &&
    itemTieneAlerta(item)
  ) {
    contenedor.appendChild(
      crearAccion(
        'Ver alerta',
        '#/inventario/alertas' +
          `?idProducto=${item.idProducto}`
      )
    );
  }

  if (
    puede(
      PERMISOS.GESTIONAR
    )
  ) {
    contenedor.appendChild(
      crearAccion(
        'Configurar límites',
        '#/inventario/limites' +
          `?idProducto=${item.idProducto}`
      )
    );
  }

  return contenedor;
}

function construirRutaDetalle(
  item
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idProducto',
    String(
      item.idProducto
    )
  );

  if (estado.texto) {
    parametros.set(
      'texto',
      estado.texto
    );
  }

  if (
    estado.disponibilidad
  ) {
    parametros.set(
      'disponibilidad',
      estado.disponibilidad
    );
  }

  if (estado.nivel) {
    parametros.set(
      'nivel',
      estado.nivel
    );
  }

  if (
    estado.estadoProducto
  ) {
    parametros.set(
      'estadoProducto',
      estado.estadoProducto
    );
  }

  parametros.set(
    'mostrarInactivos',
    String(
      estado.mostrarInactivos ===
      true
    )
  );

  if (estado.skip > 0) {
    parametros.set(
      'skip',
      String(
        estado.skip
      )
    );
  }

  return (
    '#/inventario/existencias/detalle?' +
    parametros.toString()
  );
}

/**
 * Agrega una celda solamente cuando
 * el usuario puede consultar datos
 * operativos.
 *
 * @param {HTMLTableRowElement} fila
 * @param {*} valor
 */
function agregarCeldaOperativa(
  fila,
  valor
) {
  if (
    puede(
      PERMISOS.OPERATIVO
    )
  ) {
    fila.appendChild(
      crearCelda(valor)
    );
  }
}

/**
 * Renderiza resultados para escritorio.
 *
 * @param {Object[]} items
 */
function renderizarTabla(items) {
  const cuerpo =
    elemento(
      'existencias-tbody'
    );

  if (!cuerpo) {
    return;
  }

  cuerpo.replaceChildren();

  items.forEach(item => {
    const fila =
      document.createElement(
        'tr'
      );

    const producto =
      document.createElement(
        'td'
      );

    const disponibilidad =
      document.createElement(
        'td'
      );

    const nivel =
      document.createElement(
        'td'
      );

    const acciones =
      document.createElement(
        'td'
      );

    producto.appendChild(
      crearProducto(item)
    );

    disponibilidad.appendChild(
      crearIndicadorDisponibilidad(
        item
      )
    );

    nivel.appendChild(
      crearIndicadorNivel(
        item.nivel
      )
    );

    acciones.appendChild(
      crearAcciones(item)
    );

    fila.appendChild(
      producto
    );

    fila.appendChild(
      crearCelda(
        item.unidadMedida
      )
    );

    agregarCeldaOperativa(
      fila,
      item.cantidadRegistrada
    );

    agregarCeldaOperativa(
      fila,
      item.cantidadReservada
    );

    fila.appendChild(
      crearCelda(
        item.cantidadDisponible
      )
    );

    agregarCeldaOperativa(
      fila,
      item.stockMinimo ?? '—'
    );

    agregarCeldaOperativa(
      fila,
      item.stockMaximo ?? '—'
    );

    fila.append(
      disponibilidad,
      nivel
    );

    agregarCeldaOperativa(
      fila,
      formatearFecha(
        item.fechaActualizacion
      )
    );

    fila.appendChild(
      acciones
    );

    cuerpo.appendChild(
      fila
    );
  });
}

/**
 * Crea un dato para tarjeta móvil.
 *
 * @param {string} etiqueta
 * @param {*} valor
 * @param {boolean} operativo
 * @returns {HTMLElement|null}
 */
function crearDatoTarjeta(
  etiqueta,
  valor,
  operativo = false
) {
  if (
    operativo &&
    !puede(
      PERMISOS.OPERATIVO
    )
  ) {
    return null;
  }

  const grupo =
    document.createElement(
      'div'
    );

  grupo.className =
    'inventario-existencias-card-dato';

  const titulo =
    document.createElement(
      'span'
    );

  const contenido =
    document.createElement(
      'strong'
    );

  titulo.textContent =
    etiqueta;

  contenido.textContent =
    valor ?? '—';

  grupo.append(
    titulo,
    contenido
  );

  return grupo;
}

/**
 * Renderiza tarjetas móviles.
 *
 * @param {Object[]} items
 */
function renderizarTarjetas(
  items
) {
  const contenedor =
    elemento(
      'existencias-cards'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  items.forEach(item => {
    const tarjeta =
      document.createElement(
        'article'
      );

    const producto =
      crearProducto(item);

    const indicadores =
      document.createElement(
        'div'
      );

    const datos =
      document.createElement(
        'div'
      );

    tarjeta.className =
      'card inventario-existencias-card';

    indicadores.className =
      'inventario-existencias-card-indicadores';

    datos.className =
      'inventario-existencias-card-grid';

    indicadores.append(
      crearIndicadorDisponibilidad(
        item
      ),
      crearIndicadorNivel(
        item.nivel
      )
    );

    [
      crearDatoTarjeta(
        'Unidad',
        item.unidadMedida
      ),

      crearDatoTarjeta(
        'Registrada',
        item.cantidadRegistrada,
        true
      ),

      crearDatoTarjeta(
        'Reservada',
        item.cantidadReservada,
        true
      ),

      crearDatoTarjeta(
        'Disponible',
        item.cantidadDisponible
      ),

      crearDatoTarjeta(
        'Mínimo',
        item.stockMinimo ?? '—',
        true
      ),

      crearDatoTarjeta(
        'Máximo',
        item.stockMaximo ?? '—',
        true
      ),

      crearDatoTarjeta(
        'Actualización',
        formatearFecha(
          item.fechaActualizacion
        ),
        true
      )
    ]
      .filter(Boolean)
      .forEach(dato => {
        datos.appendChild(
          dato
        );
      });

    tarjeta.append(
      producto,
      indicadores,
      datos,
      crearAcciones(item)
    );

    contenedor.appendChild(
      tarjeta
    );
  });
}

/**
 * Oculta encabezados de información
 * interna cuando no corresponde.
 */
function renderizarEncabezadosOperativos() {
  document
    .querySelectorAll(
      '[data-existencias-operativo]'
    )
    .forEach(
      elementoOperativo => {
        elementoOperativo.hidden =
          !puede(
            PERMISOS.OPERATIVO
          );
      }
    );
}

/**
 * Renderiza información de paginación.
 *
 * @param {Object} datos
 */
function renderizarPaginacion(
  datos
) {
  const total =
    Number(datos.total) || 0;

  const limit =
    Number(datos.limit) ||
    estado.limit;

  const skip =
    Number(datos.skip) || 0;

  const pagina =
    Math.floor(
      skip / limit
    ) + 1;

  const paginas =
    Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

  texto(
    'existencias-resultados',
    total === 1
      ? '1 resultado'
      : `${total} resultados`
  );

  texto(
    'existencias-pagina',
    `${pagina} de ${paginas}`
  );

  const anterior =
    elemento(
      'btn-existencias-anterior'
    );

  const siguiente =
    elemento(
      'btn-existencias-siguiente'
    );

  if (anterior) {
    anterior.disabled =
      skip <= 0;
  }

  if (siguiente) {
    siguiente.disabled =
      skip + limit >= total;
  }
}

/**
 * Renderiza la respuesta completa.
 *
 * @param {Object} datos
 */
function renderizar(datos) {
  estado.datos =
    datos;

  renderizarTabla(
    datos.items || []
  );

  renderizarTarjetas(
    datos.items || []
  );

  renderizarPaginacion(
    datos
  );

  texto(
    'existencias-ultima-actualizacion',
    formatearFecha(
      datos.fechaConsulta
    )
  );

  const sinResultados =
    !Array.isArray(
      datos.items
    ) ||
    datos.items.length === 0;

  ocultar(
    'existencias-estado-vacio',
    !sinResultados
  );

  ocultar(
    'existencias-resultados-contenido',
    sinResultados
  );
}

/**
 * Construye los parámetros
 * que recibirá el servicio.
 *
 * @returns {Object}
 */
function filtrosConsulta() {
  return {
    texto:
      estado.texto,

    disponibilidad:
      estado.disponibilidad,

    nivel:
      estado.nivel,

    mostrarInactivos:
    puede(
      PERMISOS.INACTIVOS
    ),

    idProducto:
      estado.idProducto,

    skip:
      estado.skip,

    estadoProducto:
      estado.estadoProducto,

    limit:
      estado.limit
  };
}

/**
 * Ejecuta la consulta de existencias.
 *
 * Una respuesta anterior se descarta
 * cuando el usuario modifica rápidamente
 * los criterios.
 */
async function cargarExistencias() {
  const consultaActual =
    ++secuenciaConsulta;

  limpiarEstados();
  mostrarCarga(true);

  try {
    const datos =
      await consultarExistenciasInventario(
        filtrosConsulta()
      );

    if (
      consultaActual !==
      secuenciaConsulta
    ) {
      return;
    }

    if (
      datos.total > 0 &&
      datos.skip >=
        datos.total
    ) {
      estado.skip = 0;

      await cargarExistencias();

      return;
    }

    renderizar(datos);
  } catch (error) {
    if (
      consultaActual !==
      secuenciaConsulta
    ) {
      return;
    }

    texto(
      'existencias-error-mensaje',
      error?.message ||
        'No fue posible consultar las existencias.'
    );

    ocultar(
      'existencias-estado-error',
      false
    );

    ocultar(
      'existencias-resultados-contenido',
      true
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

/**
 * Recupera filtros capturados.
 */
function leerFiltros() {
  estado.estadoProducto =
  elemento(
    'existencias-estado'
  )?.value ||
  '';

  estado.texto =
    elemento(
      'existencias-busqueda'
    )?.value?.trim() ||
    '';

  estado.disponibilidad =
    elemento(
      'existencias-disponibilidad'
    )?.value ||
    '';

  estado.nivel =
    elemento(
      'existencias-nivel'
    )?.value ||
    '';

  estado.mostrarInactivos =
    elemento(
      'existencias-inactivos'
    )?.checked ===
    true;

  /*
   * Al aplicar manualmente filtros,
   * se libera el idProducto recibido
   * desde otra pantalla.
   */
  estado.idProducto =
    null;

  estado.skip =
    0;
}

/**
 * Aplica los filtros actuales.
 */
function aplicarFiltros() {
  leerFiltros();
  cargarExistencias();
}

/**
 * Limpia todos los filtros.
 */
function limpiarFiltros() {
  estado = {
    ...estado,

    texto: '',
    disponibilidad: '',
    nivel: '',
    mostrarInactivos: false,
    idProducto: null,
    estadoProducto: 'ACTIVO',
    skip: 0
  };

  sincronizarControles();
  cargarExistencias();
}

/**
 * Registra los eventos de pantalla.
 */
function registrarEventos() {
  elemento(
    'btn-existencias-buscar'
  )?.addEventListener(
    'click',
    aplicarFiltros
  );
  
  elemento(
    'btn-existencias-actualizar'
  )?.addEventListener(
    'click',
    cargarExistencias
  );

  elemento(
    'btn-existencias-reintentar'
  )?.addEventListener(
    'click',
    cargarExistencias
  );

  elemento(
    'btn-existencias-limpiar'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  elemento(
    'existencias-disponibilidad'
  )?.addEventListener(
    'change',
    aplicarFiltros
  );

  elemento(
    'existencias-nivel'
  )?.addEventListener(
    'change',
    aplicarFiltros
  );

  elemento(
    'existencias-inactivos'
  )?.addEventListener(
    'change',
    aplicarFiltros
  );

  elemento(
    'existencias-busqueda'
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
    'btn-existencias-anterior'
  )?.addEventListener(
    'click',
    () => {
      estado.skip =
        Math.max(
          0,
          estado.skip -
            estado.limit
        );

      cargarExistencias();
    }
  );

  elemento(
    'btn-existencias-siguiente'
  )?.addEventListener(
    'click',
    () => {
      estado.skip +=
        estado.limit;

      cargarExistencias();
    }
  );
}

/**
 * Presenta la pantalla sin autorización.
 *
 * @param {HTMLElement} root
 */
function mostrarSinPermiso(
  root
) {
  root.setAttribute(
    'aria-busy',
    'false'
  );

  root.innerHTML = `
    <div
      class="
        inventario-state
        inventario-state-error
      "
    >
      ${escapeHtml(
        'No tiene permisos para consultar existencias de inventario.'
      )}
    </div>
  `;
}

/**
 * Inicializa Consulta de existencias.
 */
export async function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  if (
    !puede(
      PERMISOS.CONSULTAR
    )
  ) {
    mostrarSinPermiso(
      root
    );

    return;
  }

  cargarContextoInicial();
  sincronizarControles();
  configurarVisibilidadPermisos();
  renderizarEncabezadosOperativos();
  registrarEventos();

  root.setAttribute(
    'aria-busy',
    'false'
  );

  await cargarExistencias();
}