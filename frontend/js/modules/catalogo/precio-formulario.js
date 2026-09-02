/**
 * Módulo: Catálogo - Formulario de Lista de Precios
 * Funcionalidad: Alta y cambio de listas de precios
 */

import {
  registrarListaPrecio,
  obtenerListaPrecio,
  actualizarListaPrecio
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
let esEdicion = false;

function obtenerElementos() {
  return {
    form:
      document.getElementById('lista-precio-form'),

    formTitle:
      document.getElementById('form-title'),

    nombre:
      document.getElementById('nombre'),

    descripcion:
      document.getElementById('descripcion'),

    vigenciaInicio:
      document.getElementById('vigenciaInicio'),

    vigenciaFin:
      document.getElementById('vigenciaFin'),

    activo:
      document.getElementById('activo'),

    btnCancelar:
      document.getElementById('btn-cancelar'),

    errorNombre:
      document.getElementById('error-nombre'),

    errorDescripcion:
      document.getElementById('error-descripcion'),

    errorVigenciaInicio:
      document.getElementById(
        'error-vigenciaInicio'
      ),

    errorVigenciaFin:
      document.getElementById(
        'error-vigenciaFin'
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

function limpiarErrores() {
  const {
    errorNombre,
    errorDescripcion,
    errorVigenciaInicio,
    errorVigenciaFin
  } = obtenerElementos();

  [
    errorNombre,
    errorDescripcion,
    errorVigenciaInicio,
    errorVigenciaFin
  ].forEach(elemento => {
    if (elemento) {
      elemento.textContent = '';
    }
  });
}

function mostrarError(campo, mensaje) {
  const elemento =
    document.getElementById(
      `error-${campo}`
    );

  if (elemento) {
    elemento.textContent = mensaje;
  }
}

async function cargarListaPrecio(id) {
  try {
    showLoader();

    listaActual =
      await obtenerListaPrecio(id);

    esEdicion = true;

    const {
      formTitle,
      nombre,
      descripcion,
      vigenciaInicio,
      vigenciaFin,
      activo
    } = obtenerElementos();

    formTitle.textContent =
      'Editar Lista de Precios';

    nombre.value =
      listaActual.nombre || '';

    descripcion.value =
      listaActual.descripcion || '';

    vigenciaInicio.value =
      listaActual.vigenciaInicio || '';

    vigenciaFin.value =
      listaActual.vigenciaFin || '';

    activo.checked =
      listaActual.activo === 1;

  } catch (error) {
    showNotification(
      error.message ||
        'No fue posible cargar la lista de precios.',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/precios';

  } finally {
    hideLoader();
  }
}

async function manejarEnvio(evento) {
  evento.preventDefault();

  const {
    nombre,
    descripcion,
    vigenciaInicio,
    vigenciaFin,
    activo
  } = obtenerElementos();

  limpiarErrores();

  const datos = {
    nombre:
      nombre.value.trim(),

    descripcion:
      descripcion.value.trim(),

    vigenciaInicio:
      vigenciaInicio.value,

    vigenciaFin:
      vigenciaFin.value,

    activo:
      Boolean(activo.checked)
  };

  try {
    showLoader();

    let resultado;

    if (esEdicion && listaActual) {
      resultado =
        await actualizarListaPrecio(
          listaActual.idListaPrecio,
          datos
        );

      showNotification(
        'Lista de precios actualizada correctamente.',
        { type: 'success' }
      );
    } else {
      resultado =
        await registrarListaPrecio(datos);

      showNotification(
        'Lista de precios registrada correctamente.',
        { type: 'success' }
      );
    }

    window.location.hash =
      `#/catalogo/precios/detalle?id=${resultado.idListaPrecio}`;

  } catch (error) {
    if (
      Array.isArray(error.detalles)
    ) {
      error.detalles.forEach(detalle => {
        mostrarError(
          detalle.campo,
          detalle.mensaje
        );
      });
    } else {
      showNotification(
        error.message ||
          'No fue posible guardar la lista de precios.',
        { type: 'error' }
      );
    }

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
      PERMISOS_CATALOGO.PRECIOS_GESTIONAR
    )
  ) {
    showNotification(
      'No tiene permisos para administrar listas de precios.',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/precios';

    return;
  }

  const idListaPrecio =
    obtenerIdListaPrecio();

  if (idListaPrecio) {
    await cargarListaPrecio(
      idListaPrecio
    );
  }

  const {
    form,
    btnCancelar
  } = obtenerElementos();

  form?.addEventListener(
    'submit',
    manejarEnvio
  );

  btnCancelar?.addEventListener(
    'click',
    () => {
      window.location.hash =
        '#/catalogo/precios';
    }
  );
}