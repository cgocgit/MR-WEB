import {
  confirmarFase,
  guardarAvanceParcial,
  obtenerFase
} from '../../api/logistica.service.js';

import {
  esIdPositivo
} from '../../api/logistica.constants.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-ejecucion-root';

const state = {
  fase: null,
  evidencias: [
    null,
    null,
    null
  ]
};

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

function renderDatos(
  contenedor
) {
  const fase =
    state.fase;

  texto(
    contenedor,
    'ejecucionOrden',
    fase.folioOrden
  );

  texto(
    contenedor,
    'ejecucionFase',
    fase.nombre
  );

  texto(
    contenedor,
    'ejecucionResponsable',
    fase.responsable
  );

  texto(
    contenedor,
    'ejecucionProgramada',
    fase.fechaHoraProgramadaTexto
  );

  texto(
    contenedor,
    'ejecucionPrevisto',
    fase.duracionEstimadaMinutos ==
    null
      ? 'No aplica'
      : `${fase.duracionEstimadaMinutos} min`
  );

  texto(
    contenedor,
    'ejecucionTolerancia',
    fase.toleranciaMinutos ==
    null
      ? 'No aplica'
      : `${fase.toleranciaMinutos} min`
  );

  texto(
    contenedor,
    'ejecucionTranscurrido',
    fase.tiempoTranscurridoTexto
  );

  texto(
    contenedor,
    'ejecucionEstadoFase',
    fase.estadoTexto ||
    fase.estadoFase
  );

  const cantidad =
    contenedor.querySelector(
      '#ejecucionCantidad'
    );

  if (cantidad) {
    cantidad.max =
      String(
        fase.cantidadPendiente
      );
  }

  texto(
    contenedor,
    'ejecucionCantidadPrevista',
    fase.cantidadPrevista
  );

  texto(
    contenedor,
    'ejecucionCantidadAtendida',
    fase.cantidadAtendida
  );

  texto(
    contenedor,
    'ejecucionCantidadPendiente',
    fase.cantidadPendiente
  );

  if (fase.concluida) {
    contenedor.querySelectorAll(
      'input, textarea, button[data-operacion]'
    ).forEach(
      elemento => {
        elemento.disabled =
          true;
      }
    );
  }
}

function configurarEvidencias(
  contenedor
) {
  [0, 1, 2].forEach(
    indice => {
      const input =
        contenedor.querySelector(
          `#ejecucionFoto${indice + 1}`
        );

      const preview =
        contenedor.querySelector(
          `#ejecucionPreview${indice + 1}`
        );

      input?.addEventListener(
        'change',
        () => {
          const archivo =
            input.files?.[0];

          if (!archivo) {
            state.evidencias[
              indice
            ] = null;

            preview?.removeAttribute(
              'src'
            );

            return;
          }

          const reader =
            new FileReader();

          reader.onload =
            () => {
              state.evidencias[
                indice
              ] =
                reader.result;

              if (preview) {
                preview.src =
                  reader.result;

                preview.alt =
                  `Evidencia ${
                    indice + 1
                  } de la fase`;
              }
            };

          reader.readAsDataURL(
            archivo
          );
        }
      );
    }
  );

  (
    state.fase.evidencias ||
    []
  )
    .slice(0, 3)
    .forEach(
      (url, indice) => {
        state.evidencias[
          indice
        ] = url;

        const preview =
          contenedor.querySelector(
            `#ejecucionPreview${indice + 1}`
          );

        if (preview) {
          preview.src = url;

          preview.alt =
            `Evidencia ${
              indice + 1
            } de la fase`;
        }
      }
    );
}

function payload(
  contenedor
) {
  return {
    cantidad:
      Number(
        contenedor.querySelector(
          '#ejecucionCantidad'
        )?.value
      ),

    comentario:
      contenedor.querySelector(
        '#ejecucionComentario'
      )?.value.trim() ||
      '',

    evidencias:
      state.evidencias.filter(
        Boolean
      ),

    confirmacion:
      contenedor.querySelector(
        '#ejecucionConfirmacion'
      )?.checked ||
      false,

    version:
      state.fase.version
  };
}

function validarParcial(
  datos
) {
  if (
    !Number.isFinite(
      datos.cantidad
    ) ||
    datos.cantidad <= 0
  ) {
    return (
      'La cantidad del avance debe ser mayor que cero.'
    );
  }

  if (
    datos.cantidad >
    state.fase
      .cantidadPendiente
  ) {
    return (
      'La cantidad no puede exceder lo pendiente.'
    );
  }

  return null;
}

function validarConclusion(
  datos
) {
  const parcial =
    validarParcial(
      datos
    );

  if (parcial) {
    return parcial;
  }

  if (
    datos.cantidad !==
    state.fase
      .cantidadPendiente
  ) {
    return (
      'Para concluir debe completar la cantidad pendiente.'
    );
  }

  if (
    datos.evidencias.length !==
    3
  ) {
    return (
      'Se requieren tres fotografías para concluir la fase.'
    );
  }

  if (!datos.comentario) {
    return (
      'Debe registrar un comentario.'
    );
  }

  if (
    !datos.confirmacion
  ) {
    return (
      'Debe marcar la confirmación.'
    );
  }

  return null;
}

function mostrarError(
  contenedor,
  mensaje
) {
  const estado =
    contenedor.querySelector(
      '#ejecucionEstado'
    );

  estado.textContent =
    mensaje;

  estado.setAttribute(
    'role',
    'alert'
  );
}

async function guardarParcial(
  contenedor
) {
  const datos =
    payload(
      contenedor
    );

  const error =
    validarParcial(
      datos
    );

  if (error) {
    mostrarError(
      contenedor,
      error
    );

    return;
  }

  try {
    state.fase =
      await guardarAvanceParcial(
        state.fase.idOrden,
        state.fase.idFase,
        datos
      );

    renderDatos(
      contenedor
    );

    showNotification(
      'Avance parcial guardado.',
      {
        type: 'success'
      }
    );
  } catch (ex) {
    mostrarError(
      contenedor,
      ex?.message ||
      'No fue posible guardar el avance.'
    );
  }
}

async function concluir(
  contenedor
) {
  const datos =
    payload(
      contenedor
    );

  const error =
    validarConclusion(
      datos
    );

  if (error) {
    mostrarError(
      contenedor,
      error
    );

    return;
  }

  if (
    !window.confirm(
      '¿Confirma la conclusión de la fase?'
    )
  ) {
    return;
  }

  try {
    state.fase =
      await confirmarFase(
        state.fase.idOrden,
        state.fase.idFase,
        datos
      );

    renderDatos(
      contenedor
    );

    showNotification(
      'Fase concluida.',
      {
        type: 'success'
      }
    );
  } catch (ex) {
    mostrarError(
      contenedor,
      ex?.message ||
      'No fue posible concluir la fase.'
    );
  }
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

  const idFase =
    Number(
      parametro('idFase')
    );

  if (
    !esIdPositivo(idOrden) ||
    !esIdPositivo(idFase)
  ) {
    mostrarError(
      contenedor,
      'La Orden o fase indicada no es válida.'
    );

    return;
  }

  try {
    state.fase =
      await obtenerFase(
        idOrden,
        idFase
      );

    renderDatos(
      contenedor
    );

    configurarEvidencias(
      contenedor
    );

    contenedor
      .querySelector(
        '#ejecucionGuardarParcial'
      )
      ?.addEventListener(
        'click',
        () =>
          guardarParcial(
            contenedor
          )
      );

    contenedor
      .querySelector(
        '#ejecucionConcluir'
      )
      ?.addEventListener(
        'click',
        () =>
          concluir(
            contenedor
          )
      );

    const incidencia =
      contenedor.querySelector(
        '#ejecucionIncidencia'
      );

    if (incidencia) {
      incidencia.href =
        `#/logistica/incidencias?idOrden=${idOrden}&idFase=${idFase}&modo=reporte`;
    }
  } catch (error) {
    mostrarError(
      contenedor,
      error?.message ||
      'Registro no encontrado.'
    );
  }
}