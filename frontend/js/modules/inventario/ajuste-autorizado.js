import {
  listarCortesAjustables,
  obtenerCorteAjustable,
  listarProductosAjustables,
  consultarProductoAjuste,
  registrarAjuste
} from '../../api/inventario-ajustes.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasAnyRole
} from '../../shared/permissions.js';

let corteActual = null;
let detalleCorteActual = null;
let productoActual = null;

let secuenciaOrigen = 0;
let secuenciaCorte = 0;
let secuenciaProducto = 0;

let procesandoRegistro = false;
let registroCompletado = false;

function elemento(id) {
  return document.getElementById(id);
}

function texto(id, valor) {
  const nodo = elemento(id);

  if (!nodo) {
    return;
  }

  nodo.textContent =
    valor === null ||
    valor === undefined ||
    valor === ''
      ? '—'
      : String(valor);
}

function formatoFecha(valor) {
  if (!valor) {
    return '—';
  }

  const fecha = new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
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

function sesionActual() {
  return getSession();
}

function esAdministrador() {
  return hasAnyRole(
    sesionActual(),
    ['ADMIN']
  );
}

function obtenerUsuario() {
  const session = sesionActual();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function limpiarFeedback() {
  texto(
    'ajuste-feedback',
    ''
  );
}

function mostrarError(mensaje) {
  texto(
    'ajuste-feedback',
    mensaje ||
      'Ocurrió un error durante la operación.'
  );
}

function limpiarSelector(
  selector,
  mensaje
) {
  selector.replaceChildren();

  const option =
    document.createElement(
      'option'
    );

  option.value = '';
  option.textContent = mensaje;

  selector.appendChild(option);
}

function establecerAuditoria() {
  elemento(
    'ajuste-fecha'
  ).value =
    formatoFecha(
      new Date().toISOString()
    );

  elemento(
    'ajuste-usuario'
  ).value =
    obtenerUsuario();
}

function configurarOrigenes() {
  const soporte =
    elemento(
      'ajuste-origen-soporte'
    );

  soporte.hidden =
    !esAdministrador();

  if (!esAdministrador()) {
    elemento(
      'ajuste-origen'
    ).value =
      'CORTE_FISICO';
  }
}

function ocultarAdvertencia(id) {
  const nodo = elemento(id);

  nodo.textContent = '';
  nodo.hidden = true;
}

function limpiarProductoVisual() {
  productoActual = null;
  detalleCorteActual = null;

  elemento(
    'ajuste-producto-section'
  ).hidden = true;

  elemento(
    'ajuste-existencia-section'
  ).hidden = true;

  elemento(
    'ajuste-captura-section'
  ).hidden = true;

  elemento(
    'ajuste-proyeccion-section'
  ).hidden = true;

  elemento(
    'ajuste-cantidad'
  ).value = '';

  elemento(
    'ajuste-comentario'
  ).value = '';

  elemento(
    'ajuste-registrar'
  ).disabled = true;

  ocultarAdvertencia(
    'ajuste-advertencia-minimo'
  );

  ocultarAdvertencia(
    'ajuste-advertencia-maximo'
  );

  ocultarAdvertencia(
    'ajuste-advertencia-reserva'
  );
}

function mostrarProducto(datos) {
  productoActual = datos;

  texto(
    'ajuste-producto-codigo',
    datos.codigo
  );

  texto(
    'ajuste-producto-nombre',
    datos.nombre
  );

  texto(
    'ajuste-producto-unidad',
    datos.unidadMedida
  );

  texto(
    'ajuste-producto-estado',
    datos.activo
      ? 'ACTIVO'
      : 'INACTIVO'
  );

  const imagen =
    elemento(
      'ajuste-producto-imagen'
    );

  const placeholder =
    elemento(
      'ajuste-producto-placeholder'
    );

  if (datos.imagenUrl) {
    imagen.src =
      datos.imagenUrl;

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
    'ajuste-existencia',
    datos.existenciaFisica
  );

  texto(
    'ajuste-reservada',
    datos.cantidadReservada
  );

  texto(
    'ajuste-disponible',
    datos.disponibilidad
  );

  texto(
    'ajuste-minimo',
    datos.minimo
  );

  texto(
    'ajuste-maximo',
    datos.maximo
  );

  texto(
    'ajuste-actualizacion',
    formatoFecha(
      datos.fechaActualizacion
    )
  );

  elemento(
    'ajuste-producto-section'
  ).hidden = false;

  elemento(
    'ajuste-existencia-section'
  ).hidden = false;

  elemento(
    'ajuste-captura-section'
  ).hidden = false;

  elemento(
    'ajuste-proyeccion-section'
  ).hidden = false;
}

function actualizarProyeccion() {
  if (!productoActual) {
    return;
  }

  const valor =
    elemento(
      'ajuste-cantidad'
    ).value;

  const cantidad =
    Number(valor);

  const cantidadValida =
    valor !== '' &&
    Number.isInteger(cantidad) &&
    cantidad >= 0;

  const existenciaAnterior =
    productoActual.existenciaFisica;

  const resultante =
    cantidadValida
      ? cantidad
      : existenciaAnterior;

  const diferencia =
    resultante -
    existenciaAnterior;

  const disponibilidad =
    Math.max(
      0,
      resultante -
        productoActual
          .cantidadReservada
    );

  elemento(
    'ajuste-diferencia'
  ).value =
    cantidadValida
      ? String(diferencia)
      : '';

  elemento(
    'ajuste-sentido'
  ).value =
    !cantidadValida ||
    diferencia === 0
      ? ''
      : diferencia > 0
        ? 'Incremento'
        : 'Decremento';

  texto(
    'ajuste-proyeccion-anterior',
    existenciaAnterior
  );

  texto(
    'ajuste-proyeccion-diferencia',
    cantidadValida
      ? diferencia
      : 0
  );

  texto(
    'ajuste-proyeccion-resultante',
    resultante
  );

  texto(
    'ajuste-proyeccion-reserva',
    productoActual
      .cantidadReservada
  );

  texto(
    'ajuste-proyeccion-disponible',
    disponibilidad
  );

  const minimo =
    productoActual.minimo;

  const maximo =
    productoActual.maximo;

  const advertenciaMinimo =
    elemento(
      'ajuste-advertencia-minimo'
    );

  if (
    cantidadValida &&
    Number.isInteger(minimo) &&
    resultante < minimo
  ) {
    advertenciaMinimo.textContent =
      `La existencia resultante (${resultante}) ` +
      `quedará por debajo del mínimo configurado (${minimo}). ` +
      'El ajuste puede registrarse.';

    advertenciaMinimo.hidden = false;
  } else {
    ocultarAdvertencia(
      'ajuste-advertencia-minimo'
    );
  }

  const advertenciaMaximo =
    elemento(
      'ajuste-advertencia-maximo'
    );

  if (
    cantidadValida &&
    Number.isInteger(maximo) &&
    resultante > maximo
  ) {
    advertenciaMaximo.textContent =
      `La existencia resultante (${resultante}) ` +
      `superará el máximo configurado (${maximo}). ` +
      'El ajuste puede registrarse.';

    advertenciaMaximo.hidden = false;
  } else {
    ocultarAdvertencia(
      'ajuste-advertencia-maximo'
    );
  }

  const advertenciaReserva =
    elemento(
      'ajuste-advertencia-reserva'
    );

  if (
    cantidadValida &&
    resultante <
      productoActual
        .cantidadReservada
  ) {
    advertenciaReserva.textContent =
      'La reserva vigente supera la existencia resultante. ' +
      'Las reservas se conservarán y la disponibilidad será 0.';

    advertenciaReserva.hidden = false;
  } else {
    ocultarAdvertencia(
      'ajuste-advertencia-reserva'
    );
  }

  const comentario =
    elemento(
      'ajuste-comentario'
    ).value.trim();

  elemento(
    'ajuste-registrar'
  ).disabled =
    !cantidadValida ||
    diferencia === 0 ||
    !comentario ||
    procesandoRegistro ||
    registroCompletado;
}

function llenarCortes(cortes) {
  const selector =
    elemento(
      'ajuste-corte'
    );

  limpiarSelector(
    selector,
    'Seleccione un corte'
  );

  cortes.forEach(corte => {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      String(corte.idCorte);

    option.textContent =
      `${corte.folio} — ${corte.productos.length} producto(s) con diferencia`;

    selector.appendChild(
      option
    );
  });

  selector.disabled =
    cortes.length === 0;
}

function llenarProductosSoporte(
  productos
) {
  const selector =
    elemento(
      'ajuste-soporte-producto'
    );

  limpiarSelector(
    selector,
    'Seleccione un producto'
  );

  productos.forEach(producto => {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      String(
        producto.idProducto
      );

    option.textContent =
      `${producto.codigo} — ${producto.nombre}` +
      (
        producto.activo
          ? ''
          : ' — INACTIVO'
      );

    selector.appendChild(
      option
    );
  });

  selector.disabled =
    productos.length === 0;
}

function llenarProductosCorte(
  productos
) {
  const selector =
    elemento(
      'ajuste-corte-producto'
    );

  limpiarSelector(
    selector,
    'Seleccione un producto'
  );

  productos.forEach(producto => {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      String(
        producto.idProducto
      );

    option.textContent =
      `${producto.codigo} — ${producto.nombre}`;

    selector.appendChild(
      option
    );
  });

  selector.disabled =
    productos.length === 0;

  elemento(
    'ajuste-corte-producto-field'
  ).hidden = false;
}

function limpiarCorte() {
  corteActual = null;
  detalleCorteActual = null;

  elemento(
    'ajuste-corte-resumen'
  ).hidden = true;

  elemento(
    'ajuste-corte-producto-field'
  ).hidden = true;

  elemento(
    'ajuste-corte-cantidades'
  ).hidden = true;

  limpiarSelector(
    elemento(
      'ajuste-corte-producto'
    ),
    'Seleccione un producto'
  );

  limpiarProductoVisual();
}

function mostrarCorte(corte) {
  corteActual = corte;

  texto(
    'ajuste-corte-folio',
    corte.folio
  );

  texto(
    'ajuste-corte-fecha',
    formatoFecha(
      corte.fechaConclusion ||
      corte.fechaInicio
    )
  );

  texto(
    'ajuste-corte-responsable',
    corte.responsable
  );

  texto(
    'ajuste-corte-observaciones',
    corte.observaciones
  );

  elemento(
    'ajuste-corte-resumen'
  ).hidden = false;

  llenarProductosCorte(
    corte.productos
  );
}

async function cargarCortes() {
  const solicitudActual =
    ++secuenciaCorte;

  try {
    const cortes =
      await listarCortesAjustables();

    if (
      solicitudActual !==
      secuenciaCorte
    ) {
      return;
    }

    llenarCortes(cortes);

    if (cortes.length === 0) {
      mostrarError(
        'No existen cortes físicos con diferencias pendientes susceptibles de ajuste.'
      );
    }
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaCorte
    ) {
      return;
    }

    mostrarError(
      error.message ||
      'No fue posible consultar los cortes físicos.'
    );
  }
}

async function cargarCorte(idCorte) {
  const solicitudActual =
    ++secuenciaCorte;

  limpiarFeedback();
  limpiarCorte();

  if (!idCorte) {
    return;
  }

  try {
    const corte =
      await obtenerCorteAjustable(
        idCorte
      );

    if (
      solicitudActual !==
      secuenciaCorte
    ) {
      return;
    }

    mostrarCorte(corte);
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaCorte
    ) {
      return;
    }

    mostrarError(
      error.message ||
      'No fue posible consultar el corte físico.'
    );
  }
}

async function cargarProducto(
  idProducto,
  detalleCorte = null
) {
  const solicitudActual =
    ++secuenciaProducto;

  limpiarFeedback();
  limpiarProductoVisual();

  if (!idProducto) {
    return;
  }

  try {
    const datos =
      await consultarProductoAjuste(
        idProducto
      );

    if (
      solicitudActual !==
      secuenciaProducto
    ) {
      return;
    }

    detalleCorteActual =
      detalleCorte;

    mostrarProducto(datos);

    const origen =
      elemento(
        'ajuste-origen'
      ).value;

    if (
      origen ===
        'CORTE_FISICO' &&
      detalleCorte
    ) {
      elemento(
        'ajuste-cantidad'
      ).value =
        String(
          detalleCorte
            .cantidadFisica
        );

      elemento(
        'ajuste-cantidad'
      ).readOnly = true;

      texto(
        'ajuste-corte-registrada',
        detalleCorte
          .cantidadRegistrada
      );

      texto(
        'ajuste-corte-fisica',
        detalleCorte
          .cantidadFisica
      );

      texto(
        'ajuste-corte-diferencia',
        detalleCorte
          .diferencia
      );

      elemento(
        'ajuste-corte-cantidades'
      ).hidden = false;
    } else {
      elemento(
        'ajuste-cantidad'
      ).readOnly = false;

      elemento(
        'ajuste-cantidad'
      ).value = '';

      elemento(
        'ajuste-corte-cantidades'
      ).hidden = true;
    }

    actualizarProyeccion();
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

function cambiarProductoCorte(
  idProducto
) {
  ++secuenciaProducto;

  if (
    !idProducto ||
    !corteActual
  ) {
    limpiarProductoVisual();
    return;
  }

  const detalle =
    corteActual.productos.find(
      item =>
        item.idProducto ===
        Number(idProducto)
    );

  if (!detalle) {
    mostrarError(
      'El producto seleccionado no pertenece a las diferencias pendientes del corte.'
    );

    limpiarProductoVisual();
    return;
  }

  cargarProducto(
    idProducto,
    detalle
  );
}

async function cargarProductosSoporte() {
  const solicitudActual =
    ++secuenciaProducto;

  try {
    const productos =
      await listarProductosAjustables();

    if (
      solicitudActual !==
      secuenciaProducto
    ) {
      return;
    }

    llenarProductosSoporte(
      productos
    );

    if (
      productos.length === 0
    ) {
      mostrarError(
        'No existen productos con registro de Inventario.'
      );
    }
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaProducto
    ) {
      return;
    }

    mostrarError(
      error.message ||
      'No fue posible consultar los productos.'
    );
  }
}

async function cambiarOrigen() {
  const solicitudActual =
    ++secuenciaOrigen;

  ++secuenciaCorte;
  ++secuenciaProducto;

  limpiarFeedback();

  registroCompletado = false;

  corteActual = null;
  detalleCorteActual = null;

  limpiarProductoVisual();

  const origen =
    elemento(
      'ajuste-origen'
    ).value;

  const corteSection =
    elemento(
      'ajuste-corte-section'
    );

  const soporteSection =
    elemento(
      'ajuste-soporte-section'
    );

  if (
    origen ===
    'SOPORTE_ADMINISTRADOR'
  ) {
    if (!esAdministrador()) {
      elemento(
        'ajuste-origen'
      ).value =
        'CORTE_FISICO';

      mostrarError(
        'Solo el Administrador puede utilizar el origen Soporte del Administrador.'
      );

      await cargarCortes();
      return;
    }

    corteSection.hidden = true;
    soporteSection.hidden = false;

    limpiarSelector(
      elemento(
        'ajuste-soporte-producto'
      ),
      'Seleccione un producto'
    );

    await cargarProductosSoporte();

    if (
      solicitudActual !==
      secuenciaOrigen
    ) {
      return;
    }

    return;
  }

  soporteSection.hidden = true;
  corteSection.hidden = false;

  limpiarSelector(
    elemento(
      'ajuste-corte'
    ),
    'Seleccione un corte'
  );

  limpiarCorte();

  await cargarCortes();
}

function validarFormulario() {
  if (!productoActual) {
    mostrarError(
      'Seleccione un producto.'
    );

    return null;
  }

  const origen =
    elemento(
      'ajuste-origen'
    ).value;

  if (
    origen ===
      'CORTE_FISICO' &&
    (
      !corteActual ||
      !detalleCorteActual
    )
  ) {
    mostrarError(
      'Seleccione un corte y un producto con diferencia.'
    );

    return null;
  }

  if (
    origen ===
      'SOPORTE_ADMINISTRADOR' &&
    !esAdministrador()
  ) {
    mostrarError(
      'Solo el Administrador puede registrar un ajuste por soporte.'
    );

    return null;
  }

  const valorCantidad =
    elemento(
      'ajuste-cantidad'
    ).value;

  const cantidad =
    Number(valorCantidad);

  if (
    valorCantidad === '' ||
    !Number.isInteger(cantidad) ||
    cantidad < 0
  ) {
    mostrarError(
      'La cantidad física corregida debe ser un número entero igual o mayor que cero.'
    );

    return null;
  }

  const diferencia =
    cantidad -
    productoActual
      .existenciaFisica;

  if (diferencia === 0) {
    mostrarError(
      'La cantidad física corregida es igual a la existencia vigente; no existe ajuste para registrar.'
    );

    return null;
  }

  const comentario =
    elemento(
      'ajuste-comentario'
    ).value.trim();

  if (!comentario) {
    mostrarError(
      'El comentario del ajuste es obligatorio.'
    );

    return null;
  }

  return {
    origenAjuste: origen,

    idAlmacen:
      productoActual.idAlmacen,

    idProducto:
      productoActual.idProducto,

    idCorte:
      origen ===
        'CORTE_FISICO'
        ? corteActual.idCorte
        : null,

    cantidadFisicaCorregida:
      cantidad,

    comentario,

    existenciaConsultada:
      productoActual
        .existenciaFisica,

    fechaActualizacionConsultada:
      productoActual
        .fechaActualizacion
  };
}

function abrirConfirmacion(datos) {
  const diferencia =
    datos.cantidadFisicaCorregida -
    productoActual
      .existenciaFisica;

  const disponible =
    Math.max(
      0,
      datos.cantidadFisicaCorregida -
        productoActual
          .cantidadReservada
    );

  texto(
    'ajuste-confirmacion-origen',
    datos.origenAjuste ===
      'CORTE_FISICO'
      ? 'Corte físico'
      : 'Soporte del Administrador'
  );

  texto(
    'ajuste-confirmacion-producto',
    `${productoActual.codigo} — ${productoActual.nombre}`
  );

  texto(
    'ajuste-confirmacion-anterior',
    productoActual
      .existenciaFisica
  );

  texto(
    'ajuste-confirmacion-cantidad',
    datos.cantidadFisicaCorregida
  );

  texto(
    'ajuste-confirmacion-diferencia',
    diferencia
  );

  texto(
    'ajuste-confirmacion-disponible',
    disponible
  );

  elemento(
    'ajuste-confirmacion'
  ).showModal();
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

function mostrarResultado(resultado) {
  texto(
    'ajuste-resultado-folio',
    resultado.folioMovimiento
  );

  texto(
    'ajuste-resultado-anterior',
    resultado.existenciaAnterior
  );

  texto(
    'ajuste-resultado-diferencia',
    resultado.diferencia
  );

  texto(
    'ajuste-resultado-existencia',
    resultado.existenciaResultante
  );

  texto(
    'ajuste-resultado-reserva',
    resultado.reservaConservada
  );

  texto(
    'ajuste-resultado-disponible',
    resultado.disponibilidadResultante
  );

  elemento(
    'ajuste-resultado'
  ).hidden = false;
}

async function confirmarRegistro() {
  if (
    procesandoRegistro ||
    registroCompletado
  ) {
    return;
  }

  const datos =
    validarFormulario();

  if (!datos) {
    elemento(
      'ajuste-confirmacion'
    ).close();

    return;
  }

  procesandoRegistro = true;

  const botonRegistrar =
    elemento(
      'ajuste-registrar'
    );

  const botonConfirmar =
    elemento(
      'ajuste-confirmacion-aceptar'
    );

  botonRegistrar.disabled = true;
  botonConfirmar.disabled = true;

  elemento(
    'ajuste-confirmacion'
  ).close();

  limpiarFeedback();

  try {
    const resultado =
      await registrarAjuste(
        datos
      );

    /*
     * Solo después de respuesta exitosa
     * se refleja visualmente el resultado.
     */
    mostrarResultado(
      resultado
    );

    registroCompletado = true;

    const productoActualizado =
      await consultarProductoAjuste(
        datos.idProducto
      );

    mostrarProducto(
      productoActualizado
    );

    elemento(
      'ajuste-cantidad'
    ).value =
      String(
        resultado
          .existenciaResultante
      );

    elemento(
      'ajuste-cantidad'
    ).readOnly = true;

    actualizarProyeccion();

    texto(
      'ajuste-feedback',
      'El ajuste se registró correctamente.'
    );
  } catch (error) {
    mostrarError(
      error.message ||
      'No fue posible registrar el ajuste.'
    );

    /*
     * Si la existencia cambió, se recuperan
     * los datos vigentes antes de continuar.
     */
    if (
      error.codigo ===
        'EXISTENCIA_DESACTUALIZADA' ||
      error.codigo ===
        'EXISTENCIA_CAMBIO_DESDE_CORTE'
    ) {
      try {
        const vigente =
          await consultarProductoAjuste(
            datos.idProducto
          );

        mostrarProducto(
          vigente
        );

        if (
          datos.origenAjuste ===
          'CORTE_FISICO'
        ) {
          elemento(
            'ajuste-cantidad'
          ).value =
            detalleCorteActual
              ? String(
                  detalleCorteActual
                    .cantidadFisica
                )
              : '';

          elemento(
            'ajuste-cantidad'
          ).readOnly = true;
        }

        actualizarProyeccion();
      } catch (
        consultaError
      ) {
        console.error(
          'No fue posible actualizar la existencia.',
          consultaError
        );
      }
    }
  } finally {
    procesandoRegistro = false;
    botonConfirmar.disabled = false;

    actualizarProyeccion();
  }
}

function limpiarPantalla() {
  ++secuenciaOrigen;
  ++secuenciaCorte;
  ++secuenciaProducto;

  corteActual = null;
  detalleCorteActual = null;
  productoActual = null;

  procesandoRegistro = false;
  registroCompletado = false;

  elemento(
    'ajuste-form'
  ).reset();

  elemento(
    'ajuste-resultado'
  ).hidden = true;

  limpiarProductoVisual();
  limpiarFeedback();

  establecerAuditoria();
  configurarOrigenes();

  elemento(
    'ajuste-origen'
  ).value =
    'CORTE_FISICO';

  elemento(
    'ajuste-soporte-section'
  ).hidden = true;

  elemento(
    'ajuste-corte-section'
  ).hidden = false;

  limpiarCorte();

  cargarCortes();
}

function cancelar() {
  if (
    window.history.length > 1
  ) {
    window.history.back();
    return;
  }

  location.hash =
    '#/inventario';
}

export function init() {
  establecerAuditoria();
  configurarOrigenes();

  elemento(
    'ajuste-origen'
  ).addEventListener(
    'change',
    cambiarOrigen
  );

  elemento(
    'ajuste-corte'
  ).addEventListener(
    'change',
    evento =>
      cargarCorte(
        evento.target.value
      )
  );

  elemento(
    'ajuste-corte-producto'
  ).addEventListener(
    'change',
    evento =>
      cambiarProductoCorte(
        evento.target.value
      )
  );

  elemento(
    'ajuste-soporte-producto'
  ).addEventListener(
    'change',
    evento =>
      cargarProducto(
        evento.target.value
      )
  );

  elemento(
    'ajuste-cantidad'
  ).addEventListener(
    'input',
    actualizarProyeccion
  );

  elemento(
    'ajuste-comentario'
  ).addEventListener(
    'input',
    actualizarProyeccion
  );

  elemento(
    'ajuste-form'
  ).addEventListener(
    'submit',
    solicitarRegistro
  );

  elemento(
    'ajuste-limpiar'
  ).addEventListener(
    'click',
    limpiarPantalla
  );

  elemento(
    'ajuste-cancelar'
  ).addEventListener(
    'click',
    cancelar
  );

  elemento(
    'ajuste-confirmacion-cancelar'
  ).addEventListener(
    'click',
    () =>
      elemento(
        'ajuste-confirmacion'
      ).close()
  );

  elemento(
    'ajuste-confirmacion-aceptar'
  ).addEventListener(
    'click',
    confirmarRegistro
  );

  cargarCortes();
}