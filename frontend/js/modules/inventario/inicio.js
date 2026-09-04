import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasAnyRole,
  hasPermission
} from '../../shared/permissions.js';

const ROOT_ID = 'inventario-inicio-root';

const PERMISOS = {
  CONSULTAR:
    'inventario.consultar',

  MOVIMIENTOS:
    'inventario.movimientos.consultar',

  GESTIONAR:
    'inventario.gestionar',

  ALERTAS:
    'inventario.alertas.consultar',

  DISPONIBILIDAD:
    'inventario.disponibilidad.consultar',

  CORTES:
    'inventario.cortes.consultar',

  RESERVAS:
    'inventario.reservas.consultar'
};

/**
 * Obtiene el elemento raíz de la pantalla.
 *
 * @returns {HTMLElement|null}
 */
function obtenerRoot() {
  return document.getElementById(
    ROOT_ID
  );
}

/**
 * Valida un permiso efectivo de sesión.
 *
 * @param {Object|null} session
 * @param {string} permiso
 * @returns {boolean}
 */
function puede(
  session,
  permiso
) {
  return hasPermission(
    session,
    permiso
  );
}

/**
 * Replica exclusivamente la regla ya utilizada
 * por el router para Registro de retorno:
 *
 * - gestión de inventario; o
 * - Dirección con permiso de consulta.
 *
 * @param {Object|null} session
 * @returns {boolean}
 */
function puedeAbrirRetorno(
  session
) {
  if (
    puede(
      session,
      PERMISOS.GESTIONAR
    )
  ) {
    return true;
  }

  return (
    hasAnyRole(
      session,
      ['DIRECCION']
    ) &&
    puede(
      session,
      PERMISOS.CONSULTAR
    )
  );
}

/**
 * Aplica la visibilidad de cada acceso
 * utilizando los permisos efectivos
 * existentes.
 *
 * @param {HTMLElement} root
 * @param {Object} session
 */
function configurarTarjetas(
  root,
  session
) {
  root
    .querySelectorAll(
      '[data-inventario-inicio-permiso]'
    )
    .forEach(
      tarjeta => {
        const permiso =
          tarjeta.getAttribute(
            'data-inventario-inicio-permiso'
          );

        tarjeta.hidden =
          !puede(
            session,
            permiso
          );
      }
    );

  const retorno =
    root.querySelector(
      '[data-inventario-inicio-retorno]'
    );

  if (retorno) {
    retorno.hidden =
      !puedeAbrirRetorno(
        session
      );
  }
}

/**
 * Oculta una sección cuando el usuario
 * no tiene ninguna funcionalidad disponible.
 *
 * @param {HTMLElement} root
 */
function configurarSecciones(
  root
) {
  root
    .querySelectorAll(
      '[data-inventario-inicio-seccion]'
    )
    .forEach(
      seccion => {
        const tarjetas =
          Array.from(
            seccion.querySelectorAll(
              '.inventario-inicio-card'
            )
          );

        const tieneOpciones =
          tarjetas.some(
            tarjeta =>
              !tarjeta.hidden
          );

        seccion.hidden =
          !tieneOpciones;
      }
    );
}

/**
 * Inicializa Inicio de Inventario.
 */
export function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  const session =
    getSession();

  if (!session?.user) {
    return;
  }

  configurarTarjetas(
    root,
    session
  );

  configurarSecciones(
    root
  );
}
