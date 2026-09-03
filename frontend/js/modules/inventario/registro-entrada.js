import {
  listarProductosEntrada,
  listarOrdenesReingreso,
  obtenerOrdenReingreso,
  listarProductosReingreso,
  consultarProductoEntrada,
  registrarEntrada
} from '../../api/inventario-entradas.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

let productoActual = null;
let ordenActual = null;

let secuenciaProducto = 0;
let secuenciaOrden = 0;
let secuenciaMotivo = 0;

let procesandoRegistro = false;

function elemento(id) {
  return document.getElementById(id);
}

function texto(id, valor) {
  const nodo = elemento(id);

  if (nodo) {
    nodo.textContent =
      valor === null ||
      valor === undefined ||
      valor === ''
        ? '—'
        : String(valor);
  }
}

function formatoFecha(valor) {
  if (!valor) {
    return '—';
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(fecha);
}

function limpiarFeedback() {
  texto('entrada-feedback', '');
}

function mostrarError(mensaje) {
  texto(
    'entrada-feedback',
    mensaje ||
      'Ocurrió un error durante la operación.'
  );
}

function obtenerUsuario() {
  const session = getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function establecerDatosAuditoria() {
  elemento('entrada-fecha').value =
    formatoFecha(
      new Date().toISOString()
    );

  elemento('entrada-usuario').value =
    obtenerUsuario();
}

function limpiarSelector(
  selector,
  mensaje
) {
  selector.replaceChildren();

  const option =
    document.createElement('option');

  option.value = '';
  option.textContent = mensaje;

  selector.appendChild(option);
}

function llenarProductos(productos) {
  const selector =
    elemento('entrada-producto');

  limpiarSelector(
    selector,
    'Seleccione un producto'
  );

  productos.forEach(producto => {
    const option =
      document.createElement('option');

    option.value =
      String(producto.idProducto);

    option.textContent =
      `${producto.codigo} — ${producto.nombre}`;

    selector.appendChild(option);
  });

  selector.disabled =
    productos.length === 0;
}

function llenarOrdenes(ordenes) {
  const selector =
    elemento('entrada-orden');

  limpiarSelector(
    selector,
    'Seleccione una orden'
  );

  ordenes.forEach(orden => {
    const option =
      document.createElement('option');

    option.value =
      String(orden.idOrdenServicio);

    option.textContent =
      `${orden.folio} — ${orden.cliente}`;

    selector.appendChild(option);
  });
}

function limpiarProducto() {
  productoActual = null;

  elemento(
    'entrada-producto-detalle'
  ).hidden = true;

  elemento(
    'entrada-existencia-section'
  ).hidden = true;

  elemento(
    'entrada-proyeccion-section'
  ).hidden = true;

  elemento(
    'entrada-cantidad'
  ).value = '';

  elemento(
    'entrada-cantidad'
  ).disabled = true;

  elemento(
    'entrada-observaciones'
  ).disabled = true;

  elemento(
    'entrada-registrar'
  ).disabled = true;

  elemento(
    'entrada-advertencia-maximo'
  ).hidden = true;
}

function mostrarProducto(datos) {
  productoActual = datos;

  texto(
    'entrada-producto-codigo',
    datos.codigo
  );

  texto(
    'entrada-producto-nombre',
    datos.nombre
  );

  texto(
    'entrada-producto-unidad',
    datos.unidadMedida
  );

  texto(
    'entrada-producto-estado',
    datos.activo ? 'ACTIVO' : 'INACTIVO'
  );

  const imagen =
    elemento('entrada-producto-imagen');

  const placeholder =
    elemento(
      'entrada-producto-placeholder'
    );

  if (datos.imagenUrl) {
    imagen.src = datos.imagenUrl;
    imagen.alt =
      `Imagen de ${datos.nombre}`;
    imagen.hidden = false;
    placeholder.hidden = true;
  } else {
    imagen.removeAttribute('src');
    imagen.alt = '';
    imagen.hidden = true;
    placeholder.hidden = false;
  }

  texto(
    'entrada-existencia',
    datos.existenciaFisica
  );

  texto(
    'entrada-reservada',
    datos.cantidadReservada
  );

  texto(
    'entrada-disponible',
    datos.disponibilidad
  );

  texto(
    'entrada-minimo',
    datos.minimo
  );

  texto(
    'entrada-maximo',
    datos.maximo
  );

  texto(
    'entrada-actualizacion',
    datos.fechaActualizacion
      ? formatoFecha(
          datos.fechaActualizacion
        )
      : 'Sin registro previo'
  );

  elemento(
    'entrada-producto-detalle'
  ).hidden = false;

  elemento(
    'entrada-existencia-section'
  ).hidden = false;

  elemento(
    'entrada-proyeccion-section'
  ).hidden = false;

  elemento(
    'entrada-cantidad'
  ).disabled = false;

  elemento(
    'entrada-observaciones'
  ).disabled = false;

  actualizarProyeccion();
}

function actualizarProyeccion() {
  if (!productoActual) {
    return;
  }

  const cantidad =
    Number(
      elemento(
        'entrada-cantidad'
      ).value
    );

  const cantidadValida =
    Number.isInteger(cantidad) &&
    cantidad > 0;

  const entrada =
    cantidadValida
      ? cantidad
      : 0;

  const existenciaProyectada =
    productoActual.existenciaFisica +
    entrada;

  const disponibilidadProyectada =
    Math.max(
      0,
      existenciaProyectada -
      productoActual.cantidadReservada
    );

  texto(
    'proyeccion-actual',
    productoActual.existenciaFisica
  );

  texto(
    'proyeccion-cantidad',
    entrada
  );

  texto(
    'proyeccion-existencia',
    existenciaProyectada
  );

  texto(
    'proyeccion-disponible',
    disponibilidadProyectada
  );

  const advertencia =
    elemento(
      'entrada-advertencia-maximo'
    );

  const maximo =
    productoActual.maximo;

  if (
    cantidadValida &&
    Number.isInteger(maximo) &&
    existenciaProyectada > maximo
  ) {
    const exceso =
      existenciaProyectada - maximo;

    advertencia.textContent =
      `La existencia proyectada (${existenciaProyectada}) ` +
      `excede el máximo configurado (${maximo}) por ` +
      `${exceso} unidades. La entrada puede ser registrada.`;

    advertencia.hidden = false;
  } else {
    advertencia.textContent = '';
    advertencia.hidden = true;
  }

  elemento(
    'entrada-registrar'
  ).disabled =
    !cantidadValida ||
    procesandoRegistro;
}

async function cargarProducto(
  idProducto
) {
  const solicitudActual =
    ++secuenciaProducto;

  limpiarFeedback();
  limpiarProducto();

  if (!idProducto) {
    return;
  }

  try {
    const datos =
      await consultarProductoEntrada(
        idProducto
      );

    if (
      solicitudActual !==
      secuenciaProducto
    ) {
      return;
    }

    mostrarProducto(datos);
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaProducto
    ) {
      return;
    }

    mostrarError(
      error.message ||
        'No fue posible consultar el producto.'
    );
  }
}

function mostrarOrden(orden) {
  ordenActual = orden;

  texto(
    'entrada-orden-folio',
    orden.folio
  );

  texto(
    'entrada-orden-cliente',
    orden.cliente
  );

  texto(
    'entrada-orden-fecha',
    orden.fechaEvento
  );

  texto(
    'entrada-orden-estado',
    orden.estadoRecoleccion
  );

  elemento(
    'entrada-orden-resumen'
  ).hidden = false;
}

function limpiarOrden() {
  ordenActual = null;

  elemento(
    'entrada-orden-resumen'
  ).hidden = true;

  limpiarSelector(
    elemento('entrada-producto'),
    'Seleccione un producto'
  );

  elemento(
    'entrada-producto'
  ).disabled = true;

  limpiarProducto();
}

async function cargarOrden(
  idOrdenServicio
) {
  const solicitudActual =
    ++secuenciaOrden;

  limpiarFeedback();
  limpiarOrden();

  if (!idOrdenServicio) {
    return;
  }

  try {
    const [
      orden,
      productos
    ] = await Promise.all([
      obtenerOrdenReingreso(
        idOrdenServicio
      ),
      listarProductosReingreso(
        idOrdenServicio
      )
    ]);

    if (
      solicitudActual !==
      secuenciaOrden
    ) {
      return;
    }

    mostrarOrden(orden);
    llenarProductos(productos);

    if (productos.length === 0) {
      mostrarError(
        'La Orden de Servicio no contiene productos disponibles para reingreso.'
      );
    }
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaOrden
    ) {
      return;
    }

    mostrarError(
      error.message ||
        'No fue posible consultar la Orden de Servicio.'
    );
  }
}

async function cargarCargaInicial() {
  const productos =
    await listarProductosEntrada();

  llenarProductos(productos);

  if (productos.length === 0) {
    mostrarError(
      'No existen productos activos disponibles.'
    );
  }
}

async function cargarReingresos() {
  const ordenes =
    await listarOrdenesReingreso();

  llenarOrdenes(ordenes);

  if (ordenes.length === 0) {
    mostrarError(
      'No existen recolecciones disponibles para reingreso.'
    );
  }
}

async function cambiarMotivo() {
  limpiarFeedback();

  const solicitudActual =
    ++secuenciaMotivo;

  const motivo =
    elemento(
      'entrada-motivo'
    ).value;

  ++secuenciaOrden;
  ++secuenciaProducto;

  limpiarOrden();

  const seccionOrden =
    elemento(
      'entrada-orden-section'
    );

  if (motivo === 'CARGA_INICIAL') {
    seccionOrden.hidden = true;

    try {
      const productos =
        await listarProductosEntrada();

      if (
        solicitudActual !==
        secuenciaMotivo
      ) {
        return;
      }

      llenarProductos(productos);

      if (productos.length === 0) {
        mostrarError(
          'No existen productos activos disponibles.'
        );
      }
    } catch (error) {
      if (
        solicitudActual !==
        secuenciaMotivo
      ) {
        return;
      }

      mostrarError(
        error.message ||
          'No fue posible cargar los productos.'
      );
    }

    return;
  }

  if (motivo === 'REINGRESO') {
    seccionOrden.hidden = false;

    try {
      const ordenes =
        await listarOrdenesReingreso();

      if (
        solicitudActual !==
        secuenciaMotivo
      ) {
        return;
      }

      llenarOrdenes(ordenes);

      if (ordenes.length === 0) {
        mostrarError(
          'No existen recolecciones disponibles para reingreso.'
        );
      }
    } catch (error) {
      if (
        solicitudActual !==
        secuenciaMotivo
      ) {
        return;
      }

      mostrarError(
        error.message ||
          'No fue posible cargar las órdenes.'
      );
    }

    return;
  }

  seccionOrden.hidden = true;
}

function validarFormulario() {
  const motivo =
    elemento(
      'entrada-motivo'
    ).value;

  if (
    motivo !== 'CARGA_INICIAL' &&
    motivo !== 'REINGRESO'
  ) {
    mostrarError(
      'Seleccione un motivo de entrada.'
    );

    return null;
  }

  if (
    motivo === 'REINGRESO' &&
    !ordenActual
  ) {
    mostrarError(
      'Seleccione una Orden de Servicio.'
    );

    return null;
  }

  if (!productoActual) {
    mostrarError(
      'Seleccione un producto.'
    );

    return null;
  }

  const cantidad =
    Number(
      elemento(
        'entrada-cantidad'
      ).value
    );

  if (
    !Number.isInteger(cantidad) ||
    cantidad <= 0
  ) {
    mostrarError(
      'La cantidad debe ser un número entero mayor que cero.'
    );

    return null;
  }

  return {
    motivoEntrada:
      motivo,

    idProducto:
      productoActual.idProducto,

    cantidad,

    idOrdenServicio:
      motivo === 'REINGRESO'
        ? ordenActual.idOrdenServicio
        : null,

    observaciones:
      elemento(
        'entrada-observaciones'
      ).value
  };
}

function abrirConfirmacion(datos) {
  const existenciaResultante =
    productoActual.existenciaFisica +
    datos.cantidad;

  texto(
    'confirmacion-motivo',
    datos.motivoEntrada ===
      'CARGA_INICIAL'
      ? 'Carga inicial'
      : 'Reingreso'
  );

  texto(
    'confirmacion-producto',
    `${productoActual.codigo} — ${productoActual.nombre}`
  );

  texto(
    'confirmacion-cantidad',
    datos.cantidad
  );

  texto(
    'confirmacion-existencia',
    existenciaResultante
  );

  const dialog =
    elemento(
      'entrada-confirmacion'
    );

  dialog.showModal();
}

async function confirmarRegistro() {
  if (procesandoRegistro) {
    return;
  }

  const datos =
    validarFormulario();

  if (!datos) {
    elemento(
      'entrada-confirmacion'
    ).close();

    return;
  }

  procesandoRegistro = true;

  const botonRegistrar =
    elemento(
      'entrada-registrar'
    );

  const botonConfirmar =
    elemento(
      'confirmacion-aceptar'
    );

  botonRegistrar.disabled = true;
  botonConfirmar.disabled = true;

  limpiarFeedback();

  elemento(
    'entrada-confirmacion'
  ).close();

  try {
    const resultado =
      await registrarEntrada(datos);

    texto(
      'resultado-folio',
      resultado.folioMovimiento
    );

    texto(
      'resultado-anterior',
      resultado.existenciaAnterior
    );

    texto(
      'resultado-cantidad',
      resultado.cantidadIngresada
    );

    texto(
      'resultado-existencia',
      resultado.existenciaResultante
    );

    texto(
      'resultado-disponible',
      resultado.disponibilidadResultante
    );

    elemento(
      'entrada-resultado'
    ).hidden = false;

    /*
     * La existencia visual solo cambia
     * después de respuesta exitosa.
     */
    const productoActualizado =
      await consultarProductoEntrada(
        datos.idProducto
      );

    mostrarProducto(
      productoActualizado
    );

    elemento(
      'entrada-cantidad'
    ).value = '';

    elemento(
      'entrada-observaciones'
    ).value = '';

    actualizarProyeccion();

    texto(
      'entrada-feedback',
      'La entrada se registró correctamente.'
    );
  } catch (error) {
    mostrarError(
      error.message ||
        'No fue posible registrar la entrada.'
    );
  } finally {
    procesandoRegistro = false;

    botonConfirmar.disabled = false;

    actualizarProyeccion();
  }
}

function solicitarRegistro(evento) {
  evento.preventDefault();

  limpiarFeedback();

  const datos =
    validarFormulario();

  if (!datos) {
    return;
  }

  abrirConfirmacion(datos);
}

function limpiarPantalla() {
  ++secuenciaMotivo;
  ++secuenciaOrden;
  ++secuenciaProducto;

  productoActual = null;
  ordenActual = null;

  elemento(
    'entrada-form'
  ).reset();

  elemento(
    'entrada-resultado'
  ).hidden = true;

  elemento(
    'entrada-orden-section'
  ).hidden = true;

  elemento(
    'entrada-orden-resumen'
  ).hidden = true;

  limpiarSelector(
    elemento('entrada-orden'),
    'Seleccione una orden'
  );

  limpiarSelector(
    elemento('entrada-producto'),
    'Seleccione un producto'
  );

  elemento(
    'entrada-producto'
  ).disabled = true;

  limpiarProducto();
  limpiarFeedback();
  establecerDatosAuditoria();
}

function cancelar() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  location.hash =
    '#/inventario';
}

export function init() {
  establecerDatosAuditoria();

  elemento(
    'entrada-motivo'
  ).addEventListener(
    'change',
    cambiarMotivo
  );

  elemento(
    'entrada-orden'
  ).addEventListener(
    'change',
    evento =>
      cargarOrden(
        evento.target.value
      )
  );

  elemento(
    'entrada-producto'
  ).addEventListener(
    'change',
    evento =>
      cargarProducto(
        evento.target.value
      )
  );

  elemento(
    'entrada-cantidad'
  ).addEventListener(
    'input',
    actualizarProyeccion
  );

  elemento(
    'entrada-form'
  ).addEventListener(
    'submit',
    solicitarRegistro
  );

  elemento(
    'entrada-limpiar'
  ).addEventListener(
    'click',
    limpiarPantalla
  );

  elemento(
    'entrada-cancelar'
  ).addEventListener(
    'click',
    cancelar
  );

  elemento(
    'confirmacion-cancelar'
  ).addEventListener(
    'click',
    () =>
      elemento(
        'entrada-confirmacion'
      ).close()
  );

  elemento(
    'confirmacion-aceptar'
  ).addEventListener(
    'click',
    confirmarRegistro
  );
}