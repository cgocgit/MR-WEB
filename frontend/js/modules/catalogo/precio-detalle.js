/**
 * Módulo: Catálogo - Detalle de Lista de Precios
 * Funcionalidad: Consulta y baja lógica de listas de precios
 */

import {
  obtenerListaPrecio,
  cambiarEstadoListaPrecio
} from '../../api/catalogo.service.js';

import {
  PERMISOS_CATALOGO
} from '../../api/catalogo.constants.js';

import {
  getSession,
  requireAuth
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  showNotification
} from '../../components/notification.js';

import {
  showLoader,
  hideLoader
} from '../../components/loader.js';

import {
  renderNavegacionCatalogo
} from './catalogo-ui.js';

let listaActual = null;

function obtenerElementos() {
  return {
    detalleContent:
      document.getElementById(
        'detalle-content'
      ),

    estadoCargando:
      document.getElementById(
        'estado-cargando'
      ),

    estadoError:
      document.getElementById(
        'estado-error'
      ),

    errorMensaje:
      document.getElementById(
        'error-mensaje'
      ),

    listaNombre:
      document.getElementById(
        'lista-nombre'
      ),

    listaEstado:
      document.getElementById(
        'lista-estado'
      ),

    listaVigenciaInicio:
      document.getElementById(
        'lista-vigencia-inicio'
      ),

    listaVigenciaFin:
      document.getElementById(
        'lista-vigencia-fin'
      ),

    listaDescripcion:
      document.getElementById(
        'lista-descripcion'
      ),

    seccionAuditoria:
      document.getElementById(
        'seccion-auditoria'
      ),

    listaRegistro:
      document.getElementById(
        'lista-registro'
      ),

    listaModificacion:
      document.getElementById(
        'lista-modificacion'
      ),

    btnVolver:
      document.getElementById(
        'btn-volver'
      ),

    btnEditar:
      document.getElementById(
        'btn-editar'
      ),

    btnEstado:
      document.getElementById(
        'btn-estado'
      )
  };
}

function obtenerIdListaPrecio() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '—';
  }

  return new Date(fecha).toLocaleDateString(
    'es-MX',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );
}

function formatearFechaHora(fecha) {
  if (!fecha) {
    return '—';
  }

  return new Date(fecha).toLocaleString(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  );
}

async function cargarListaPrecio(id) {
  const elementos =
    obtenerElementos();

  try {
    elementos.estadoCargando.style.display =
      'flex';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'none';

    listaActual =
      await obtenerListaPrecio(id);

    elementos.listaNombre.textContent =
      listaActual.nombre;

    elementos.listaEstado.textContent =
      listaActual.activo
        ? 'Activo'
        : 'Inactivo';

    elementos.listaEstado.className =
      listaActual.activo
        ? 'catalogo-detail-meta-value estado-activo'
        : 'catalogo-detail-meta-value estado-inactivo';

    elementos.listaVigenciaInicio.textContent =
      formatearFecha(
        listaActual.vigenciaInicio
      );

    elementos.listaVigenciaFin.textContent =
      formatearFecha(
        listaActual.vigenciaFin
      );

    elementos.listaDescripcion.textContent =
      listaActual.descripcion ||
      'Sin descripción';

    const session = getSession();

    const puedeGestionar =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PRECIOS_GESTIONAR
      );

    elementos.btnEditar.style.display =
      puedeGestionar
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.style.display =
      puedeGestionar
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.textContent =
      listaActual.activo
        ? 'Desactivar'
        : 'Activar';

    if (puedeGestionar) {
      elementos.seccionAuditoria.style.display =
        'block';

      elementos.listaRegistro.textContent =
        `${listaActual.creadoPor || 'Sistema'} • ` +
        `${formatearFechaHora(
          listaActual.fechaRegistro
        )}`;

      elementos.listaModificacion.textContent =
        `${listaActual.modificadoPor || 'Sistema'} • ` +
        `${formatearFechaHora(
          listaActual.fechaModificacion
        )}`;
    }

    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'block';

  } catch (error) {
    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'flex';

    elementos.errorMensaje.textContent =
      error.message ||
      'No fue posible consultar la lista de precios.';
  }
}

async function manejarCambioEstado() {
  const nuevoEstado =
    !Boolean(listaActual.activo);

  const confirmar =
    window.confirm(
      nuevoEstado
        ? '¿Activar esta lista de precios?'
        : '¿Desactivar esta lista de precios?'
    );

  if (!confirmar) {
    return;
  }

  try {
    showLoader();

    await cambiarEstadoListaPrecio(
      listaActual.idListaPrecio,
      nuevoEstado
    );

    showNotification(
      nuevoEstado
        ? 'Lista de precios activada correctamente.'
        : 'Lista de precios desactivada correctamente.',
      { type: 'success' }
    );

    await cargarListaPrecio(
      listaActual.idListaPrecio
    );

  } catch (error) {
    showNotification(
      error.message ||
        'No fue posible cambiar el estado.',
      { type: 'error' }
    );

  } finally {
    hideLoader();
  }
}

export async function init() {
  if (!requireAuth()) {
    return;
  }

  renderNavegacionCatalogo();

  const session = getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.CONSULTAR
    )
  ) {
    window.location.hash =
      '#/catalogo/precios';

    return;
  }

  const idListaPrecio =
    obtenerIdListaPrecio();

  if (!idListaPrecio) {
    showNotification(
      'ID de lista de precios no especificado.',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/precios';

    return;
  }

  await cargarListaPrecio(
    idListaPrecio
  );

  const {
    btnVolver,
    btnEditar,
    btnEstado
  } = obtenerElementos();

  btnVolver?.addEventListener(
    'click',
    () => {
      window.location.hash =
        '#/catalogo/precios';
    }
  );

  btnEditar?.addEventListener(
    'click',
    () => {
      window.location.hash =
        `#/catalogo/precios/formulario?id=${listaActual.idListaPrecio}`;
    }
  );

  btnEstado?.addEventListener(
    'click',
    manejarCambioEstado
  );
}