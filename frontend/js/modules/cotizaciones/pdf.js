import {
  getCotizacion
} from '../../api/cotizaciones.service.js';

import {
  getClienteProspecto
} from '../../api/clientes.service.js';

import {
  construirFolioCotizacion,
  construirFolioVersion,
  escaparHtml
} from './cotizaciones-ui.js';

import {
  showNotification
} from '../../components/notification.js';

const el =
  id =>
    document.getElementById(id);

let cotizacion = null;
let clienteProspecto = null;

function obtenerParametrosHash() {
  const [
    ,
    queryString = ''
  ] =
    String(
      location.hash || ''
    ).split('?');

  return new URLSearchParams(
    queryString
  );
}

function obtenerEnteroParametro(
  nombre
) {
  const valor =
    Number(
      obtenerParametrosHash()
        .get(nombre)
    );

  return (
    Number.isInteger(valor) &&
    valor > 0
  )
    ? valor
    : null;
}

function nombreCliente(
  registro
) {
  if (!registro) {
    return 'No disponible';
  }

  return [
    registro.nombres,
    registro.apellidos
  ]
    .filter(Boolean)
    .join(' ')
    .trim() ||
    'No disponible';
}

function mostrarError(
  mensaje
) {
  const estado =
    el('pdfEstadoCarga');

  const contenido =
    el('pdfContenido');

  if (
    !estado ||
    !contenido
  ) {
    return;
  }

  estado.className =
    'cotizaciones-error';

  estado.innerHTML = `
    <strong>
      No fue posible cargar el documento.
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function cargarSelectorVersiones() {
  const select =
    el('pdfVersionSelect');

  if (!select) {
    return;
  }

  const versiones =
    Array.isArray(
      cotizacion.versiones
    )
      ? cotizacion.versiones
      : [];

  select.innerHTML = `
    <option value="">
      Selecciona una versión
    </option>

    ${versiones
      .map(
        version => `
          <option
            value="${
              Number(
                version.idVersion
              )
            }"
          >
            ${escaparHtml(
              construirFolioVersion(
                cotizacion
                  .ejercicio,
                cotizacion
                  .consecutivo,
                version
                  .numeroVersion
              )
            )}
          </option>
        `
      )
      .join('')}
  `;

  const idVersionSolicitada =
    obtenerEnteroParametro(
      'idVersion'
    );

  if (
    idVersionSolicitada &&
    versiones.some(
      version =>
        Number(
          version.idVersion
        ) ===
        idVersionSolicitada
    )
  ) {
    select.value =
      String(
        idVersionSolicitada
      );
  }

  actualizarSeleccionDocumento();
}

function renderCabecera() {
  const folio =
    construirFolioCotizacion(
      cotizacion.ejercicio,
      cotizacion.consecutivo
    );

  const breadcrumb =
    el(
      'pdfBreadcrumbCotizacion'
    );

  if (breadcrumb) {
    breadcrumb.textContent =
      folio;

    breadcrumb.href =
      `#/cotizaciones/detalle?id=${
        Number(
          cotizacion
            .idCotizacion
        )
      }`;
  }

  el(
    'pdfTitulo'
  ).textContent =
    `Documento de cotización ${folio}`;

  el(
    'pdfCotizacionFolio'
  ).textContent =
    folio;

  el(
    'pdfCliente'
  ).textContent =
    nombreCliente(
      clienteProspecto
    );
}

function actualizarSeleccionDocumento() {
  const select =
    el('pdfVersionSelect');

  const boton =
    el('btnGenerarPdf');

  if (
    !select ||
    !boton
  ) {
    return;
  }

  /*
   * Se reconoce la selección,
   * pero la generación permanece
   * deshabilitada porque el
   * contenido definitivo del PDF
   * continúa pendiente.
   */
  boton.disabled =
    true;
}

function renderHistorico() {
  const tbody =
    el('pdfHistorialBody');

  const mobile =
    el('pdfHistorialMobile');

  const empty =
    el('pdfHistorialEmpty');

  /*
   * El modelo actual todavía no
   * contiene documentos generados.
   * No se fabrican referencias
   * históricas.
   */
  if (tbody) {
    tbody.innerHTML = '';
  }

  if (mobile) {
    mobile.innerHTML = '';
  }

  if (empty) {
    empty.hidden = false;
  }
}

function registrarEventos() {
  el(
    'btnVolverPdf'
  )?.addEventListener(
    'click',
    () => {
      if (!cotizacion) {
        location.hash =
          '#/cotizaciones';

        return;
      }

      location.hash =
        `#/cotizaciones/detalle?id=${
          Number(
            cotizacion
              .idCotizacion
          )
        }`;
    }
  );

  el(
    'pdfVersionSelect'
  )?.addEventListener(
    'change',
    actualizarSeleccionDocumento
  );

  el(
    'btnGenerarPdf'
  )?.addEventListener(
    'click',
    () => {
      showNotification(
        'La generación del PDF permanece pendiente hasta definir su contenido comercial, fiscal y legal.',
        {
          type: 'info',
          timeout: 6000
        }
      );
    }
  );

  el(
    'btnConsultarPdf'
  )?.addEventListener(
    'click',
    () => {
      showNotification(
        'No existe todavía un documento generado para consultar.',
        {
          type: 'info'
        }
      );
    }
  );
}

async function inicializar() {
  const idCotizacion =
    obtenerEnteroParametro(
      'idCotizacion'
    );

  if (!idCotizacion) {
    mostrarError(
      'El identificador de la cotización no es válido.'
    );

    return;
  }

  try {
    cotizacion =
      await getCotizacion(
        idCotizacion
      );

    clienteProspecto =
      await getClienteProspecto(
        cotizacion
          .idClienteProspecto
      ).catch(
        () => null
      );

    renderCabecera();
    cargarSelectorVersiones();
    renderHistorico();

    el(
      'pdfDocumentoCard'
    ).hidden =
      true;

    el(
      'pdfEstadoCarga'
    ).hidden =
      true;

    el(
      'pdfContenido'
    ).hidden =
      false;
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

registrarEventos();
inicializar();