import {
  obtenerDetalleLogisticoOrden
} from '../../api/logistica.service.js';

import {
  ESTADOS_FASE_LABELS,
  ESTADOS_INCIDENCIA_LABELS,
  esIdPositivo
} from '../../api/logistica.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

const ROOT_ID =
  'logistica-orden-detalle-root';

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function parametro(
  nombre
) {
  return new URLSearchParams(
    location.hash.split('?')[1] ||
    ''
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

function renderFases(
  contenedor,
  fases
) {
  const zona =
    contenedor.querySelector(
      '#ordenDetalleFases'
    );

  zona?.replaceChildren();

  fases.forEach(
    fase => {
      const article =
        document.createElement(
          'article'
        );

      article.className =
        'card logistica-fase-card';

      const titulo =
        document.createElement(
          'h3'
        );

      titulo.textContent =
        fase.nombre;

      const estado =
        document.createElement(
          'p'
        );

      estado.textContent =
        ESTADOS_FASE_LABELS[
          fase.estadoFase
        ] ||
        fase.estadoFase;

      const tiempo =
        document.createElement(
          'p'
        );

      tiempo.textContent =
        fase.toleranciaMinutos ==
        null
          ? 'Traslado: control por fecha y hora'
          : `Previsto: ${
              fase.duracionEstimadaMinutos ??
              '—'
            } min · Tolerancia: ${
              fase.toleranciaMinutos
            } min`;

      const cantidades =
        document.createElement(
          'p'
        );

      cantidades.textContent =
        `Prevista: ${
          fase.cantidadPrevista ??
          '—'
        } · Atendida: ${
          fase.cantidadAtendida ??
          '—'
        } · Pendiente: ${
          fase.cantidadPendiente ??
          '—'
        }`;

      article.append(
        titulo,
        estado,
        tiempo,
        cantidades
      );

      if (
        fase.puedeAbrir
      ) {
        const enlace =
          document.createElement(
            'a'
          );

        enlace.href =
          `#/logistica/ejecucion?idOrden=${fase.idOrden}&idFase=${fase.idFase}`;

        enlace.textContent =
          fase.soloConsulta
            ? 'Consultar fase'
            : 'Abrir fase';

        article.appendChild(
          enlace
        );
      }

      zona?.appendChild(
        article
      );
    }
  );
}

function renderIncidencias(
  contenedor,
  incidencias
) {
  const lista =
    contenedor.querySelector(
      '#ordenDetalleIncidencias'
    );

  lista?.replaceChildren();

  incidencias.forEach(
    incidencia => {
      const li =
        document.createElement(
          'li'
        );

      const enlace =
        document.createElement(
          'a'
        );

      enlace.href =
        `#/logistica/incidencias?idIncidencia=${incidencia.idIncidencia}`;

      enlace.textContent =
        `${incidencia.folioIncidencia} · ${
          incidencia.tipoTexto
        } · ${
          ESTADOS_INCIDENCIA_LABELS[
            incidencia.estadoIncidencia
          ] ||
          incidencia.estadoIncidencia
        }`;

      li.appendChild(
        enlace
      );

      lista?.appendChild(li);
    }
  );
}

function renderHistorial(
  contenedor,
  historial
) {
  const lista =
    contenedor.querySelector(
      '#ordenDetalleHistorial'
    );

  lista?.replaceChildren();

  historial.forEach(
    item => {
      const li =
        document.createElement(
          'li'
        );

      li.textContent =
        `${item.fechaHoraTexto || item.fechaHora || '—'} · ${
          item.usuario || 'Sistema'
        } · ${
          item.accion || ''
        }`;

      lista?.appendChild(li);
    }
  );
}

export async function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  const idOrden =
    Number(
      parametro('idOrden')
    );

  if (!esIdPositivo(idOrden)) {
    contenedor.querySelector(
      '#ordenDetalleEstado'
    ).textContent =
      'Identificador de Orden inválido.';

    return;
  }

  try {
    const datos =
      await obtenerDetalleLogisticoOrden(
        idOrden
      );

    texto(
      contenedor,
      'ordenDetalleFolio',
      datos.orden.folioOrden
    );

    texto(
      contenedor,
      'ordenDetalleCliente',
      datos.orden.cliente
    );

    texto(
      contenedor,
      'ordenDetalleEstadoOrden',
      datos.orden.estadoOrden
    );

    texto(
      contenedor,
      'ordenDetalleTipo',
      datos.orden.tipoOrden
    );

    texto(
      contenedor,
      'ordenDetalleEvento',
      datos.orden.fechaHoraEventoTexto ||
      datos.orden.fechaHoraEvento
    );

    texto(
      contenedor,
      'ordenDetalleDomicilio',
      datos.orden.domicilioEvento
    );

    texto(
      contenedor,
      'ordenDetalleRuta',
      datos.programacion
        ?.rutaIdentificador
    );

    texto(
      contenedor,
      'ordenDetallePlaca',
      datos.programacion
        ?.placaVehiculo
    );

    texto(
      contenedor,
      'ordenDetalleChofer',
      datos.programacion
        ?.chofer
    );

    texto(
      contenedor,
      'ordenDetalleRepresentante',
      datos.programacion
        ?.representante
    );

    renderFases(
      contenedor,
      datos.fases || []
    );

    renderIncidencias(
      contenedor,
      datos.incidencias || []
    );

    renderHistorial(
      contenedor,
      datos.historial || []
    );

    const ruta =
      contenedor.querySelector(
        '#ordenDetalleVerRuta'
      );

    if (
      ruta &&
      datos.programacion?.idRuta
    ) {
      ruta.href =
        `#/logistica/rutas/detalle?idRuta=${datos.programacion.idRuta}`;
    } else if (ruta) {
      ruta.hidden = true;
    }

    const traslado =
      contenedor.querySelector(
        '#ordenDetalleTraslado'
      );

    if (
      traslado &&
      datos.programacion?.idRuta
    ) {
      traslado.href =
        `#/logistica/traslado?idRuta=${datos.programacion.idRuta}`;
    } else if (traslado) {
      traslado.hidden = true;
    }

    const reprogramar =
      contenedor.querySelector(
        '#ordenDetalleReprogramar'
      );

    if (reprogramar) {
      reprogramar.hidden =
        !hasPermission(
          getSession(),
          'logistica.gestionar'
        ) ||
        datos.orden.cancelada ||
        datos.orden.estadoOrden ===
          'REALIZADA';

      reprogramar.href =
        `#/logistica/programacion/formulario?idOrden=${idOrden}`;
    }

    const inventario =
      contenedor.querySelector(
        '#ordenDetalleInventario'
      );

    if (inventario) {
      inventario.hidden =
        !datos.permiteAbrirInventario;
    }
  } catch (error) {
    contenedor.querySelector(
      '#ordenDetalleEstado'
    ).textContent =
      error?.message ||
      'Registro no encontrado.';
  }
}