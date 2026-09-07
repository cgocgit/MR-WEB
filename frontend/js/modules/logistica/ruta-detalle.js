import {
  guardarOrdenParadas,
  obtenerRuta
} from '../../api/logistica.service.js';

import {
  esIdPositivo
} from '../../api/logistica.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-ruta-detalle-root';

const state = {
  ruta: null,
  paradas: [],
  modificada: false
};

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function parametro(
  nombre
) {
  const query =
    location.hash.split('?')[1] ||
    '';

  return new URLSearchParams(
    query
  ).get(nombre);
}

function texto(
  contenedor,
  id,
  valor
) {
  const elemento =
    contenedor.querySelector(
      `#${id}`
    );

  if (elemento) {
    elemento.textContent =
      valor ?? '—';
  }
}

function mover(
  indice,
  direccion
) {
  const nuevo =
    indice + direccion;

  if (
    nuevo < 0 ||
    nuevo >=
      state.paradas.length
  ) {
    return;
  }

  [
    state.paradas[indice],
    state.paradas[nuevo]
  ] = [
    state.paradas[nuevo],
    state.paradas[indice]
  ];

  state.paradas.forEach(
    (item, posicion) => {
      item.posicion =
        posicion + 1;
    }
  );

  state.modificada = true;
}

function render(
  contenedor
) {
  const lista =
    contenedor.querySelector(
      '#rutaParadas'
    );

  lista?.replaceChildren();

  const puedeEditar =
    hasPermission(
      getSession(),
      'logistica.gestionar'
    );

  state.paradas.forEach(
    (parada, indice) => {
      const item =
        document.createElement(
          'li'
        );

      item.className =
        'logistica-ruta-parada';

      const posicion =
        document.createElement(
          'strong'
        );

      posicion.textContent =
        `${parada.posicion}. ${parada.tipoTexto || parada.tipoParada}`;

      const detalle =
        document.createElement(
          'span'
        );

      detalle.textContent =
        `${parada.domicilio || 'Sin domicilio'} · ${
          parada.horarioTexto ||
          parada.horario ||
          'Sin horario'
        }`;

      const orden =
        document.createElement(
          'a'
        );

      orden.href =
        `#/logistica/orden/detalle?idOrden=${parada.idOrden}`;

      orden.textContent =
        parada.folioOrden ||
        `Orden ${parada.idOrden}`;

      item.append(
        posicion,
        detalle,
        orden
      );

      if (puedeEditar) {
        const acciones =
          document.createElement(
            'div'
          );

        const subir =
          document.createElement(
            'button'
          );

        subir.type = 'button';
        subir.textContent =
          'Subir';

        subir.disabled =
          indice === 0;

        subir.addEventListener(
          'click',
          () => {
            mover(
              indice,
              -1
            );

            render(
              contenedor
            );
          }
        );

        const bajar =
          document.createElement(
            'button'
          );

        bajar.type = 'button';
        bajar.textContent =
          'Bajar';

        bajar.disabled =
          indice ===
          state.paradas.length - 1;

        bajar.addEventListener(
          'click',
          () => {
            mover(
              indice,
              1
            );

            render(
              contenedor
            );
          }
        );

        acciones.append(
          subir,
          bajar
        );

        item.appendChild(
          acciones
        );
      }

      lista?.appendChild(item);
    }
  );

  const guardar =
    contenedor.querySelector(
      '#rutaGuardarOrden'
    );

  if (guardar) {
    guardar.hidden =
      !puedeEditar;

    guardar.disabled =
      !state.modificada;
  }
}

async function guardar(
  contenedor
) {
  if (!state.modificada) {
    return;
  }

  if (
    !window.confirm(
      '¿Confirma el nuevo orden de las paradas?'
    )
  ) {
    return;
  }

  try {
    const actualizada =
      await guardarOrdenParadas(
        state.ruta.idRuta,
        state.paradas.map(
          item => ({
            idParada:
              item.idParada,

            posicion:
              item.posicion
          })
        ),
        state.ruta.version
      );

    state.ruta =
      actualizada;

    state.paradas =
      actualizada.paradas.map(
        item => ({
          ...item
        })
      );

    state.modificada = false;

    render(
      contenedor
    );

    showNotification(
      'Orden de paradas actualizado.',
      {
        type: 'success'
      }
    );
  } catch (error) {
    const estado =
      contenedor.querySelector(
        '#rutaDetalleEstado'
      );

    estado.textContent =
      error?.message ||
      'No fue posible guardar el orden.';
  }
}

export async function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  const idRuta =
    Number(
      parametro('idRuta')
    );

  if (!esIdPositivo(idRuta)) {
    contenedor.querySelector(
      '#rutaDetalleEstado'
    ).textContent =
      'Identificador de ruta inválido.';

    return;
  }

  try {
    state.ruta =
      await obtenerRuta(
        idRuta
      );

    state.paradas =
      state.ruta.paradas.map(
        item => ({
          ...item
        })
      );

    texto(
      contenedor,
      'rutaIdentificador',
      state.ruta.identificador
    );

    texto(
      contenedor,
      'rutaFecha',
      state.ruta.fechaTexto ||
      state.ruta.fecha
    );

    texto(
      contenedor,
      'rutaPlaca',
      state.ruta.placaVehiculo
    );

    texto(
      contenedor,
      'rutaChofer',
      state.ruta.chofer
    );

    texto(
      contenedor,
      'rutaRepresentante',
      state.ruta.representante
    );

    texto(
      contenedor,
      'rutaResumen',
      `${state.ruta.numeroOrdenes || state.ruta.ordenes.length} Órdenes · ${
        state.ruta.paradas.length
      } paradas`
    );

    texto(
      contenedor,
      'rutaAvance',
      `${state.ruta.avance || 0}%`
    );

    render(
      contenedor
    );

    contenedor
      .querySelector(
        '#rutaGuardarOrden'
      )
      ?.addEventListener(
        'click',
        () =>
          guardar(
            contenedor
          )
      );
  } catch (error) {
    contenedor.querySelector(
      '#rutaDetalleEstado'
    ).textContent =
      error?.message ||
      'Registro no encontrado.';
  }
}