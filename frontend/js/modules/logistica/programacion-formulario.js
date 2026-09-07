import {
  consultarDisponibilidadRecursos,
  crearProgramacion,
  listarOrdenesAgrupables,
  listarTolerancias,
  obtenerOrdenLogistica,
  obtenerProgramacionPorOrden,
  obtenerRecursosProgramacion,
  reprogramar
} from '../../api/logistica.service.js';

import {
  FASES_LOGISTICAS,
  TIPOS_PARADA_LABELS,
  TIPOS_PARADA_LOGISTICA,
  esIdPositivo,
  obtenerFasesAplicables
} from '../../api/logistica.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-programacion-form-root';

const state = {
  orden: null,
  programacion: null,
  tolerancias: [],
  recursos: null,
  paradas: [],
  ordenesAgrupables: []
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

function valor(
  contenedor,
  id,
  contenido
) {
  const elemento =
    contenedor.querySelector(
      `#${id}`
    );

  if (elemento) {
    elemento.textContent =
      contenido ?? '—';
  }
}

function mostrarError(
  contenedor,
  mensaje
) {
  const estado =
    contenedor.querySelector(
      '#programacionFormularioEstado'
    );

  if (estado) {
    estado.textContent =
      mensaje;

    estado.setAttribute(
      'role',
      'alert'
    );

    estado.focus?.();
  }
}

function cargarResumen(
  contenedor,
  orden
) {
  valor(
    contenedor,
    'pfFolioOrden',
    orden.folioOrden
  );

  valor(
    contenedor,
    'pfCotizacion',
    [
      orden.folioCotizacion,
      orden.versionCotizacion
    ]
      .filter(Boolean)
      .join(' · ')
  );

  valor(
    contenedor,
    'pfEstadoOrden',
    orden.estadoOrden
  );

  valor(
    contenedor,
    'pfTipoOrden',
    orden.tipoOrden
  );

  valor(
    contenedor,
    'pfCliente',
    orden.cliente
  );

  valor(
    contenedor,
    'pfContacto',
    orden.contacto
  );

  valor(
    contenedor,
    'pfDomicilio',
    orden.domicilioEvento
  );

  valor(
    contenedor,
    'pfEvento',
    orden.fechaHoraEventoTexto ||
      orden.fechaHoraEvento
  );

  valor(
    contenedor,
    'pfObservaciones',
    orden.observaciones
  );

  valor(
    contenedor,
    'pfSupervisor',
    getSession()?.user?.name ||
      getSession()?.user?.username ||
      'Supervisor'
  );
}

function toleranciaPorCodigo(
  codigo
) {
  return (
    state.tolerancias.find(
      item =>
        item.codigoFase === codigo
    ) || null
  );
}

function renderFases(
  contenedor
) {
  const rootFases =
    contenedor.querySelector(
      '#programacionFases'
    );

  rootFases?.replaceChildren();

  const aplicables =
    obtenerFasesAplicables(
      state.orden.tipoOrden
    );

  FASES_LOGISTICAS.forEach(
    fase => {
      const aplica =
        aplicables.some(
          item =>
            item.codigo ===
            fase.codigo
        );

      const fila =
        document.createElement(
          'div'
        );

      fila.className =
        'logistica-fase-config';

      const nombre =
        document.createElement(
          'span'
        );

      nombre.textContent =
        fase.nombre;

      fila.appendChild(
        nombre
      );

      if (!aplica) {
        const noAplica =
          document.createElement(
            'span'
          );

        noAplica.textContent =
          'No aplica';

        fila.appendChild(
          noAplica
        );

        rootFases?.appendChild(
          fila
        );

        return;
      }

      if (fase.traslado) {
        const traslado =
          document.createElement(
            'span'
          );

        traslado.textContent =
          'Control por fecha y hora';

        fila.appendChild(
          traslado
        );

        rootFases?.appendChild(
          fila
        );

        return;
      }

      const input =
        document.createElement(
          'input'
        );

      input.type = 'number';
      input.min = '1';
      input.step = '1';

      input.value =
        String(
          state.programacion
            ?.fases
            ?.find(
              item =>
                item.codigoFase ===
                fase.codigo
            )
            ?.duracionEstimadaMinutos ||
          60
        );

      input.dataset.codigoFase =
        fase.codigo;

      input.setAttribute(
        'aria-label',
        `Duración estimada para ${fase.nombre}`
      );

      const tolerancia =
        document.createElement(
          'span'
        );

      const config =
        toleranciaPorCodigo(
          fase.codigo
        );

      tolerancia.textContent =
        `Tolerancia: ${
          config?.valorMinutos ??
          30
        } min`;

      fila.append(
        input,
        tolerancia
      );

      rootFases?.appendChild(
        fila
      );
    }
  );
}

function llenarSelect(
  select,
  items,
  obtenerValor,
  obtenerTexto
) {
  if (!select) {
    return;
  }

  select.replaceChildren();

  const opcionInicial =
    document.createElement(
      'option'
    );

  opcionInicial.value = '';
  opcionInicial.textContent =
    'Seleccione';

  select.appendChild(
    opcionInicial
  );

  items.forEach(
    item => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        obtenerValor(item);

      option.textContent =
        obtenerTexto(item);

      option.disabled =
        item.disponible === false;

      select.appendChild(
        option
      );
    }
  );
}

function aplicarSeleccionActual(
  contenedor
) {
  if (!state.programacion) {
    return;
  }

  const valores = {
    programacionRepresentante:
      state.programacion
        .idRepresentante,

    programacionChofer:
      state.programacion
        .idChofer,

    programacionVehiculo:
      state.programacion
        .placaVehiculo,

    programacionRutaNombre:
      state.programacion
        .nombreRuta ||
      ''
  };

  Object.entries(
    valores
  ).forEach(
    ([id, contenido]) => {
      const control =
        contenedor.querySelector(
          `#${id}`
        );

      if (
        control &&
        contenido != null
      ) {
        control.value =
          String(contenido);
      }
    }
  );
}

async function cargarRecursos(
  contenedor
) {
  const inicio =
    contenedor.querySelector(
      '#programacionFechaHora'
    )?.value;

  state.recursos =
    await obtenerRecursosProgramacion({
      fechaHoraInicio:
        inicio || null,

      excluirIdProgramacion:
        state.programacion
          ?.idProgramacion ||
        null
    });

  llenarSelect(
    contenedor.querySelector(
      '#programacionRepresentante'
    ),
    state.recursos
      .representantes || [],
    item => item.id,
    item =>
      `${item.nombre}${
        item.disponible === false
          ? ' — No disponible'
          : ''
      }`
  );

  llenarSelect(
    contenedor.querySelector(
      '#programacionChofer'
    ),
    state.recursos.choferes ||
      [],
    item => item.id,
    item =>
      `${item.nombre}${
        item.disponible === false
          ? ' — No disponible'
          : ''
      }`
  );

  llenarSelect(
    contenedor.querySelector(
      '#programacionVehiculo'
    ),
    state.recursos.vehiculos ||
      [],
    item => item.placa,
    item =>
      `${item.placa}${
        item.disponible === false
          ? ' — No disponible'
          : ''
      }`
  );

  aplicarSeleccionActual(
    contenedor
  );
}

function renderOrdenesAgrupables(
  contenedor
) {
  const zona =
    contenedor.querySelector(
      '#programacionOrdenesAgrupables'
    );

  zona?.replaceChildren();

  const todas = [
    state.orden,
    ...state.ordenesAgrupables
      .filter(
        item =>
          Number(item.idOrden) !==
          Number(
            state.orden.idOrden
          )
      )
  ];

  todas.forEach(
    item => {
      const label =
        document.createElement(
          'label'
        );

      label.className =
        'logistica-check-item';

      const input =
        document.createElement(
          'input'
        );

      input.type =
        'checkbox';

      input.value =
        String(item.idOrden);

      input.checked =
        Number(item.idOrden) ===
          Number(
            state.orden.idOrden
          ) ||
        state.programacion
          ?.idOrdenes
          ?.some(
            id =>
              Number(id) ===
              Number(
                item.idOrden
              )
          );

      input.disabled =
        Number(item.idOrden) ===
        Number(
          state.orden.idOrden
        );

      const texto =
        document.createElement(
          'span'
        );

      texto.textContent =
        `${item.folioOrden} · ${item.cliente}`;

      label.append(
        input,
        texto
      );

      zona?.appendChild(
        label
      );
    }
  );
}

function nuevaParada() {
  return {
    idParada: null,

    posicion:
      state.paradas.length + 1,

    tipoParada:
      TIPOS_PARADA_LOGISTICA
        .ENTREGA,

    domicilio:
      state.orden
        ?.domicilioEvento ||
      '',

    horario:
      state.orden
        ?.fechaHoraEvento ||
      '',

    idOrden:
      state.orden?.idOrden ||
      null,

    codigoFase:
      'ENTREGA',

    situacion:
      'PENDIENTE'
  };
}

function moverParada(
  indice,
  desplazamiento
) {
  const destino =
    indice +
    desplazamiento;

  if (
    destino < 0 ||
    destino >=
      state.paradas.length
  ) {
    return;
  }

  [
    state.paradas[indice],
    state.paradas[destino]
  ] = [
    state.paradas[destino],
    state.paradas[indice]
  ];

  state.paradas.forEach(
    (item, posicion) => {
      item.posicion =
        posicion + 1;
    }
  );
}

function renderParadas(
  contenedor
) {
  const tbody =
    contenedor.querySelector(
      '#programacionParadasBody'
    );

  tbody?.replaceChildren();

  state.paradas.forEach(
    (parada, indice) => {
      const tr =
        document.createElement(
          'tr'
        );

      const posicion =
        document.createElement(
          'td'
        );

      posicion.textContent =
        String(
          parada.posicion
        );

      const tipo =
        document.createElement(
          'td'
        );

      tipo.textContent =
        TIPOS_PARADA_LABELS[
          parada.tipoParada
        ] ||
        parada.tipoParada;

      const domicilio =
        document.createElement(
          'td'
        );

      domicilio.textContent =
        parada.domicilio ||
        '—';

      const orden =
        document.createElement(
          'td'
        );

      orden.textContent =
        String(
          parada.idOrden ||
          '—'
        );

      const acciones =
        document.createElement(
          'td'
        );

      const subir =
        document.createElement(
          'button'
        );

      subir.type = 'button';
      subir.textContent = 'Subir';

      subir.disabled =
        indice === 0;

      subir.addEventListener(
        'click',
        () => {
          moverParada(
            indice,
            -1
          );

          renderParadas(
            contenedor
          );
        }
      );

      const bajar =
        document.createElement(
          'button'
        );

      bajar.type = 'button';
      bajar.textContent = 'Bajar';

      bajar.disabled =
        indice ===
        state.paradas.length - 1;

      bajar.addEventListener(
        'click',
        () => {
          moverParada(
            indice,
            1
          );

          renderParadas(
            contenedor
          );
        }
      );

      const eliminar =
        document.createElement(
          'button'
        );

      eliminar.type = 'button';
      eliminar.textContent =
        'Quitar';

      eliminar.addEventListener(
        'click',
        () => {
          state.paradas.splice(
            indice,
            1
          );

          state.paradas.forEach(
            (item, posicionActual) => {
              item.posicion =
                posicionActual + 1;
            }
          );

          renderParadas(
            contenedor
          );
        }
      );

      acciones.append(
        subir,
        bajar,
        eliminar
      );

      tr.append(
        posicion,
        tipo,
        domicilio,
        orden,
        acciones
      );

      tbody?.appendChild(tr);
    }
  );
}

function obtenerDuraciones(
  contenedor
) {
  return Array.from(
    contenedor.querySelectorAll(
      '[data-codigo-fase]'
    )
  ).map(
    input => ({
      codigoFase:
        input.dataset
          .codigoFase,

      duracionEstimadaMinutos:
        Number(
          input.value
        )
    })
  );
}

function obtenerOrdenesSeleccionadas(
  contenedor
) {
  return Array.from(
    contenedor.querySelectorAll(
      '#programacionOrdenesAgrupables input[type="checkbox"]'
    )
  )
    .filter(
      item =>
        item.checked
    )
    .map(
      item =>
        Number(item.value)
    );
}

function construirPayload(
  contenedor
) {
  return {
    idOrden:
      state.orden.idOrden,

    idOrdenes:
      obtenerOrdenesSeleccionadas(
        contenedor
      ),

    fechaHoraPreparacion:
      contenedor.querySelector(
        '#programacionFechaHora'
      )?.value,

    idSupervisor:
      getSession()?.user?.id ||
      301,

    idRepresentante:
      Number(
        contenedor.querySelector(
          '#programacionRepresentante'
        )?.value
      ),

    idChofer:
      Number(
        contenedor.querySelector(
          '#programacionChofer'
        )?.value
      ),

    placaVehiculo:
      contenedor.querySelector(
        '#programacionVehiculo'
      )?.value,

    nombreRuta:
      contenedor.querySelector(
        '#programacionRutaNombre'
      )?.value.trim(),

    motivoReprogramacion:
      contenedor.querySelector(
        '#programacionMotivo'
      )?.value.trim() ||
      null,

    fases:
      obtenerDuraciones(
        contenedor
      ),

    paradas:
      state.paradas.map(
        item => ({
          ...item
        })
      ),

    version:
      state.programacion
        ?.version ||
      null
  };
}

function validarPayload(
  payload
) {
  if (
    !payload
      .fechaHoraPreparacion
  ) {
    return (
      'Debe indicar la fecha y hora de preparación.'
    );
  }

  if (
    !payload
      .idRepresentante ||
    !payload.idChofer ||
    !payload
      .placaVehiculo
  ) {
    return (
      'Debe seleccionar Representante, Chófer y placa.'
    );
  }

  if (
    !payload.paradas.length
  ) {
    return (
      'Debe registrar al menos una parada.'
    );
  }

  if (
    payload.fases.some(
      fase =>
        !Number.isInteger(
          fase
            .duracionEstimadaMinutos
        ) ||
        fase
          .duracionEstimadaMinutos <=
          0
    )
  ) {
    return (
      'Las duraciones deben ser enteros mayores que cero.'
    );
  }

  if (
    state.programacion &&
    !payload
      .motivoReprogramacion
  ) {
    return (
      'Debe indicar el motivo de la reprogramación.'
    );
  }

  return null;
}

async function guardar(
  contenedor
) {
  const payload =
    construirPayload(
      contenedor
    );

  const error =
    validarPayload(
      payload
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
      state.programacion
        ? '¿Confirma la reprogramación?'
        : '¿Confirma la programación?'
    )
  ) {
    return;
  }

  try {
    await consultarDisponibilidadRecursos(
      {
        ...payload,

        excluirIdProgramacion:
          state.programacion
            ?.idProgramacion ||
          null
      }
    );

    const resultado =
      state.programacion
        ? await reprogramar(
            state.orden.idOrden,
            payload
          )
        : await crearProgramacion(
            payload
          );

    showNotification(
      state.programacion
        ? 'Reprogramación guardada.'
        : 'Programación confirmada.',
      {
        type: 'success'
      }
    );

    location.hash =
      `#/logistica/orden/detalle?idOrden=${resultado.idOrden || state.orden.idOrden}`;
  } catch (ex) {
    mostrarError(
      contenedor,
      ex?.message ||
      'No fue posible guardar la programación.'
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

  if (!esIdPositivo(idOrden)) {
    mostrarError(
      contenedor,
      'Identificador de Orden inválido.'
    );

    return;
  }

  try {
    [
      state.orden,
      state.programacion,
      state.tolerancias,
      state.ordenesAgrupables
    ] =
      await Promise.all([
        obtenerOrdenLogistica(
          idOrden
        ),

        obtenerProgramacionPorOrden(
          idOrden
        ).catch(
          () => null
        ),

        listarTolerancias(),

        listarOrdenesAgrupables(
          idOrden
        )
      ]);

    cargarResumen(
      contenedor,
      state.orden
    );

    const fecha =
      contenedor.querySelector(
        '#programacionFechaHora'
      );

    if (fecha) {
      fecha.value =
        state.programacion
          ?.fechaHoraPreparacion
          ?.slice(0, 16) ||
        state.orden
          .fechaHoraEvento
          ?.slice(0, 16) ||
        '';
    }

    const motivo =
      contenedor.querySelector(
        '#programacionMotivoGrupo'
      );

    if (motivo) {
      motivo.hidden =
        !state.programacion;
    }

    renderFases(
      contenedor
    );

    renderOrdenesAgrupables(
      contenedor
    );

    state.paradas =
      state.programacion
        ?.paradas
        ?.map(
          item => ({
            ...item
          })
        ) ||
      [
        nuevaParada()
      ];

    renderParadas(
      contenedor
    );

    await cargarRecursos(
      contenedor
    );

    fecha?.addEventListener(
      'change',
      () =>
        cargarRecursos(
          contenedor
        )
    );

    contenedor
      .querySelector(
        '#programacionAgregarParada'
      )
      ?.addEventListener(
        'click',
        () => {
          state.paradas.push(
            nuevaParada()
          );

          renderParadas(
            contenedor
          );
        }
      );

    contenedor
      .querySelector(
        '#programacionFormulario'
      )
      ?.addEventListener(
        'submit',
        event => {
          event.preventDefault();

          guardar(
            contenedor
          );
        }
      );
  } catch (error) {
    mostrarError(
      contenedor,
      error?.message ||
      'No fue posible cargar la Orden.'
    );
  }
}