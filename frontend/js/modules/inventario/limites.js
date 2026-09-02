import {
  listarProductosInventariables,
  obtenerConfiguracionLimites,
  guardarConfiguracionLimites
} from '../../api/inventario-limites.service.js';

import {
  showNotification
} from '../../components/notification.js';

let configuracionCargada = null;
let secuenciaCargaProducto = 0;

function bloquearInteraccion(bloqueada) {
  elemento('idProducto').disabled = bloqueada;

  elemento('btn-guardar').disabled =
    bloqueada || !configuracionCargada;

  elemento('btn-cancelar').disabled =
    bloqueada || !configuracionCargada;
}

function elemento(id) {
  return document.getElementById(id);
}

function texto(id, valor) {
  const destino = elemento(id);

  if (destino) {
    destino.textContent = valor ?? '';
  }
}

function valor(id, contenido) {
  const destino = elemento(id);

  if (destino) {
    destino.value = contenido ?? '';
  }
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin modificaciones registradas';
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(fecha));
}

function limpiarErrores() {
  ['minimo', 'maximo'].forEach(campo => {
    texto(`error-${campo}`, '');
    elemento(campo).removeAttribute('aria-invalid');
  });

  texto('form-feedback', '');
  elemento('limites-advertencia').hidden = true;
}

function mostrarError(campo, mensaje) {
  texto(`error-${campo}`, mensaje);
  elemento(campo).setAttribute('aria-invalid', 'true');
}

function validarFormulario() {
  limpiarErrores();

  const minimoTexto = elemento('minimo').value.trim();
  const maximoTexto = elemento('maximo').value.trim();

  const minimo = Number(minimoTexto);
  const maximo = Number(maximoTexto);

  let valido = true;

  if (
    minimoTexto === '' ||
    !Number.isInteger(minimo) ||
    minimo <= 0
  ) {
    mostrarError(
      'minimo',
      'Capture un número entero mayor que cero.'
    );

    valido = false;
  }

  if (
    maximoTexto === '' ||
    !Number.isInteger(maximo) ||
    maximo <= 0
  ) {
    mostrarError(
      'maximo',
      'Capture un número entero mayor que cero.'
    );

    valido = false;
  }

  if (valido && maximo < minimo) {
    mostrarError(
      'maximo',
      'El máximo debe ser mayor o igual que el mínimo.'
    );

    valido = false;
  }

  if (
    valido &&
    configuracionCargada &&
    maximo < configuracionCargada.totales.disponibilidad
  ) {
    texto(
      'limites-advertencia',
      'La disponibilidad global actual supera el máximo. Puede guardar, pero el producto quedará en condición de alerta máxima.'
    );

    elemento('limites-advertencia').hidden = false;
  }

  return valido
    ? { minimo, maximo }
    : null;
}

function crearCelda(contenido, encabezado = false) {
  const celda = document.createElement(
    encabezado ? 'th' : 'td'
  );

  celda.textContent = String(contenido);

  if (encabezado) {
    celda.scope = 'row';
  }

  return celda;
}

function renderizarAlmacenes(datos) {
  const cuerpo = elemento('almacenes-tbody');
  cuerpo.replaceChildren();

  datos.almacenes.forEach(almacen => {
    const fila = document.createElement('tr');

    fila.append(
      crearCelda(almacen.almacen, true),
      crearCelda(almacen.existenciaFisica),
      crearCelda(almacen.cantidadReservada),
      crearCelda(almacen.disponibilidad)
    );

    cuerpo.appendChild(fila);
  });

  const total = document.createElement('tr');
  total.className = 'inventario-limites-total';

  total.append(
    crearCelda('Total global', true),
    crearCelda(datos.totales.existenciaFisica),
    crearCelda(datos.totales.cantidadReservada),
    crearCelda(datos.totales.disponibilidad)
  );

  cuerpo.appendChild(total);
}

function aplicarConfiguracion(datos) {
  configuracionCargada = datos;

  texto('producto-codigo', datos.producto.codigo);
  texto('producto-unidad', datos.producto.unidadMedida);

  valor(
    'cantidad-actual',
    datos.totales.existenciaFisica
  );

  valor(
    'cantidad-reservada',
    datos.totales.cantidadReservada
  );

  valor(
    'disponibilidad-global',
    datos.totales.disponibilidad
  );

  valor('minimo', datos.limites?.minimo ?? '');
  valor('maximo', datos.limites?.maximo ?? '');

  texto(
    'ultima-modificacion',
    formatearFecha(
      datos.limites?.fechaUltimaModificacion
    )
  );

  texto(
    'usuario-modificacion',
    datos.limites?.usuarioUltimaModificacion ||
      'Sin registro'
  );

  renderizarAlmacenes(datos);
  limpiarErrores();

  bloquearInteraccion(false);
}

async function cargarProducto(idProducto) {
  if (!idProducto) {
    configuracionCargada = null;
    bloquearInteraccion(false);
    return;
  }

  const solicitudActual = ++secuenciaCargaProducto;

  configuracionCargada = null;
  bloquearInteraccion(true);
  elemento('estado-cargando').hidden = false;

  try {
    const datos =
      await obtenerConfiguracionLimites(idProducto);

    if (solicitudActual !== secuenciaCargaProducto) {
      return;
    }

    aplicarConfiguracion(datos);
  } catch (error) {
    if (solicitudActual !== secuenciaCargaProducto) {
      return;
    }

    texto(
      'form-feedback',
      error.message ||
        'No fue posible consultar el producto.'
    );
  } finally {
    if (solicitudActual === secuenciaCargaProducto) {
      elemento('estado-cargando').hidden = true;
      bloquearInteraccion(false);
    }
  }
}

async function cargarProductos() {
  const selector = elemento('idProducto');

  const productos =
    await listarProductosInventariables();

  productos.forEach(producto => {
    const opcion = document.createElement('option');

    opcion.value = String(producto.idProducto);
    opcion.textContent =
      `${producto.codigo} — ${producto.nombre}`;

    selector.appendChild(opcion);
  });

  if (productos.length > 0) {
    selector.value = String(productos[0].idProducto);
    await cargarProducto(selector.value);
  }
}

async function guardar(evento) {
  evento.preventDefault();

  const limites = validarFormulario();

  if (!limites) {
    texto(
      'form-feedback',
      'Revise los campos señalados antes de guardar.'
    );

    return;
  }

  const boton = elemento('btn-guardar');
  const idProductoSeleccionado =
  elemento('idProducto').value;

  bloquearInteraccion(true);
  boton.disabled = true;

  try {
    const actualizado =
      await guardarConfiguracionLimites({
        idProducto: idProductoSeleccionado,
        ...limites
      });

    aplicarConfiguracion(actualizado);

    showNotification(
      'Los límites se guardaron correctamente.',
      { type: 'success' }
    );
  } catch (error) {
    if (error.campo) {
      mostrarError(error.campo, error.message);
    }

    texto(
      'form-feedback',
      error.message ||
        'No fue posible guardar los límites.'
    );
  } finally {
    bloquearInteraccion(false);
  }
}

function cancelar() {
  if (configuracionCargada) {
    aplicarConfiguracion(configuracionCargada);
  }
}

export async function init() {
  elemento('idProducto').addEventListener(
    'change',
    evento => cargarProducto(evento.target.value)
  );

  elemento('limites-form').addEventListener(
    'submit',
    guardar
  );

  elemento('btn-cancelar').addEventListener(
    'click',
    cancelar
  );

  ['minimo', 'maximo'].forEach(id => {
    elemento(id).addEventListener(
      'input',
      validarFormulario
    );
  });

  try {
    await cargarProductos();
  } catch (error) {
    texto(
      'form-feedback',
      error.message ||
        'No fue posible cargar los productos.'
    );
  } finally {
    elemento('estado-cargando').hidden = true;
  }
}