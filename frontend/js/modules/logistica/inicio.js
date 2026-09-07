import {
  obtenerInicioLogistica
} from '../../api/logistica.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

const ROOT_ID =
  'logistica-inicio-root';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function texto(
  elemento,
  valor
) {
  if (elemento) {
    elemento.textContent =
      String(valor ?? '');
  }
}

function configurarAccesos(
  contenedor,
  session
) {
  contenedor
    .querySelectorAll(
      '[data-logistica-permisos]'
    )
    .forEach(
      elemento => {
        const permisos =
          String(
            elemento.dataset
              .logisticaPermisos ||
            ''
          )
            .split('|')
            .filter(Boolean);

        elemento.hidden =
          !permisos.some(
            permiso =>
              hasPermission(
                session,
                permiso
              )
          );
      }
    );
}

function renderIndicadores(
  contenedor,
  indicadores
) {
  Object.entries(
    indicadores || {}
  ).forEach(
    ([clave, valor]) => {
      texto(
        contenedor.querySelector(
          `[data-indicador="${clave}"]`
        ),
        valor
      );
    }
  );
}

function crearCelda(
  valor
) {
  const td =
    document.createElement('td');

  td.textContent =
    valor ?? '—';

  return td;
}

function renderActividad(
  contenedor,
  actividades
) {
  const tbody =
    contenedor.querySelector(
      '#logisticaActividadBody'
    );

  tbody?.replaceChildren();

  (actividades || [])
    .slice(0, 5)
    .forEach(
      item => {
        const tr =
          document.createElement(
            'tr'
          );

        tr.append(
          crearCelda(
            item.fechaHoraTexto
          ),

          crearCelda(
            item.referencia
          ),

          crearCelda(
            item.actividad
          ),

          crearCelda(
            item.responsable
          ),

          crearCelda(
            item.situacion
          )
        );

        tbody?.appendChild(tr);
      }
    );
}

function renderIncidencias(
  contenedor,
  incidencias
) {
  const tbody =
    contenedor.querySelector(
      '#logisticaIncidenciasBody'
    );

  tbody?.replaceChildren();

  (incidencias || [])
    .slice(0, 5)
    .forEach(
      item => {
        const tr =
          document.createElement(
            'tr'
          );

        tr.append(
          crearCelda(
            item.folioIncidencia
          ),

          crearCelda(
            item.referencia
          ),

          crearCelda(
            item.tipoTexto
          ),

          crearCelda(
            item.estadoTexto
          )
        );

        tbody?.appendChild(tr);
      }
    );
}

function mostrarError(
  contenedor,
  error
) {
  const estado =
    contenedor.querySelector(
      '#logisticaInicioEstado'
    );

  if (!estado) {
    return;
  }

  estado.hidden = false;
  estado.textContent =
    error?.message ||
    'No fue posible consultar el estado de Logística.';
}

export async function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  const session =
    getSession();

  configurarAccesos(
    contenedor,
    session
  );

  try {
    const datos =
      await obtenerInicioLogistica();

    renderIndicadores(
      contenedor,
      datos.indicadores
    );

    renderActividad(
      contenedor,
      datos.actividadesProximas
    );

    renderIncidencias(
      contenedor,
      datos.incidenciasRecientes
    );
  } catch (error) {
    mostrarError(
      contenedor,
      error
    );
  }
}