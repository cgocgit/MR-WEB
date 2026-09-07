import {
  obtenerTraslado,
  registrarHitoTraslado
} from '../../api/logistica.service.js';

import {
  HITOS_TRASLADO,
  HITOS_TRASLADO_LABELS,
  esIdPositivo
} from '../../api/logistica.constants.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-traslado-root';

const SECUENCIA = [
  HITOS_TRASLADO
    .CARGA_REALIZADA,

  HITOS_TRASLADO
    .SALIDA_INICIADA,

  HITOS_TRASLADO
    .SALIDA_TERMINADA,

  HITOS_TRASLADO
    .RETORNO_INICIADO,

  HITOS_TRASLADO
    .RETORNO_TERMINADO
];

const CAMPOS = {
  CARGA_REALIZADA:
    'cargaRealizadaEn',

  SALIDA_INICIADA:
    'salidaIniciadaEn',

  SALIDA_TERMINADA:
    'salidaTerminadaEn',

  RETORNO_INICIADO:
    'retornoIniciadoEn',

  RETORNO_TERMINADO:
    'retornoTerminadoEn'
};

let traslado = null;

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

function siguientePendiente() {
  return SECUENCIA.find(
    hito =>
      !traslado[
        CAMPOS[hito]
      ]
  );
}

function renderHitos(
  contenedor
) {
  const lista =
    contenedor.querySelector(
      '#trasladoHitos'
    );

  lista?.replaceChildren();

  const siguiente =
    siguientePendiente();

  SECUENCIA.forEach(
    hito => {
      const item =
        document.createElement(
          'li'
        );

      const titulo =
        document.createElement(
          'strong'
        );

      titulo.textContent =
        HITOS_TRASLADO_LABELS[
          hito
        ];

      const fecha =
        document.createElement(
          'span'
        );

      fecha.textContent =
        traslado[
          CAMPOS[hito]
        ] ||
        'Pendiente';

      item.append(
        titulo,
        fecha
      );

      if (
        siguiente === hito &&
        traslado.puedeRegistrar
      ) {
        const boton =
          document.createElement(
            'button'
          );

        boton.type = 'button';

        boton.textContent =
          'Registrar';

        boton.addEventListener(
          'click',
          () =>
            registrar(
              contenedor,
              hito
            )
        );

        item.appendChild(
          boton
        );
      }

      lista?.appendChild(item);
    }
  );
}

async function registrar(
  contenedor,
  hito
) {
  if (
    !window.confirm(
      `¿Confirma "${HITOS_TRASLADO_LABELS[hito]}"?`
    )
  ) {
    return;
  }

  try {
    traslado =
      await registrarHitoTraslado(
        traslado.idRuta,
        hito,
        {
          comentario:
            contenedor
              .querySelector(
                '#trasladoComentario'
              )
              ?.value.trim() ||
            '',

          version:
            traslado.version
        }
      );

    renderHitos(
      contenedor
    );

    showNotification(
      'Hito registrado.',
      {
        type: 'success'
      }
    );
  } catch (error) {
    contenedor.querySelector(
      '#trasladoEstado'
    ).textContent =
      error?.message ||
      'No fue posible registrar el hito.';
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
      '#trasladoEstado'
    ).textContent =
      'Identificador de ruta inválido.';

    return;
  }

  try {
    traslado =
      await obtenerTraslado(
        idRuta
      );

    texto(
      contenedor,
      'trasladoRuta',
      traslado.rutaIdentificador
    );

    texto(
      contenedor,
      'trasladoPlaca',
      traslado.placaVehiculo
    );

    texto(
      contenedor,
      'trasladoChofer',
      traslado.chofer
    );

    texto(
      contenedor,
      'trasladoRepresentante',
      traslado.representante
    );

    texto(
      contenedor,
      'trasladoOrdenes',
      traslado
        .ordenesTexto
    );

    renderHitos(
      contenedor
    );

    const incidencia =
      contenedor.querySelector(
        '#trasladoReportarIncidencia'
      );

    if (incidencia) {
      incidencia.href =
        `#/logistica/incidencias?idRuta=${idRuta}&modo=reporte`;
    }
  } catch (error) {
    contenedor.querySelector(
      '#trasladoEstado'
    ).textContent =
      error?.message ||
      'Registro no encontrado.';
  }
}