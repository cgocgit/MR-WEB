import {
  actualizarTolerancias,
  listarTolerancias,
  obtenerHistorialTolerancia
} from '../../api/logistica.service.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'logistica-tolerancias-root';

let tolerancias = [];

function root() {
  return document.getElementById(
    ROOT_ID
  );
}

function validar(
  valor
) {
  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}

function render(
  contenedor
) {
  const tbody =
    contenedor.querySelector(
      '#toleranciasBody'
    );

  tbody?.replaceChildren();

  tolerancias.forEach(
    item => {
      const tr =
        document.createElement(
          'tr'
        );

      const fase =
        document.createElement(
          'td'
        );

      fase.textContent =
        item.nombreFase;

      const unidad =
        document.createElement(
          'td'
        );

      unidad.textContent =
        item.aplica
          ? 'Minutos'
          : 'No aplica';

      const valor =
        document.createElement(
          'td'
        );

      if (item.aplica) {
        const input =
          document.createElement(
            'input'
          );

        input.type = 'number';
        input.min = '1';
        input.step = '1';

        input.value =
          String(
            item.valorMinutos
          );

        input.dataset.codigoFase =
          item.codigoFase;

        input.setAttribute(
          'aria-label',
          `Tolerancia de ${item.nombreFase}`
        );

        valor.appendChild(
          input
        );
      } else {
        valor.textContent =
          'No aplica';
      }

      const usuario =
        document.createElement(
          'td'
        );

      usuario.textContent =
        item.modificadoPor ||
        '—';

      const fecha =
        document.createElement(
          'td'
        );

      fecha.textContent =
        item.modificadoEnTexto ||
        item.modificadoEn ||
        '—';

      const historial =
        document.createElement(
          'td'
        );

      const boton =
        document.createElement(
          'button'
        );

      boton.type = 'button';
      boton.textContent =
        'Historial';

      boton.addEventListener(
        'click',
        () =>
          mostrarHistorial(
            contenedor,
            item.codigoFase
          )
      );

      historial.appendChild(
        boton
      );

      tr.append(
        fase,
        unidad,
        valor,
        usuario,
        fecha,
        historial
      );

      tbody?.appendChild(tr);
    }
  );
}

async function mostrarHistorial(
  contenedor,
  codigoFase
) {
  const historial =
    await obtenerHistorialTolerancia(
      codigoFase
    );

  const lista =
    contenedor.querySelector(
      '#toleranciasHistorial'
    );

  lista?.replaceChildren();

  if (!historial.length) {
    const li =
      document.createElement(
        'li'
      );

    li.textContent =
      'Sin cambios registrados.';

    lista?.appendChild(li);

    return;
  }

  historial.forEach(
    item => {
      const li =
        document.createElement(
          'li'
        );

      li.textContent =
        `${
          item.fechaHoraTexto ||
          item.fechaHora
        } · ${
          item.usuario
        } · ${
          item.valorAnterior
        } → ${
          item.valorNuevo
        } min`;

      lista?.appendChild(li);
    }
  );
}

function cambios(
  contenedor
) {
  return Array.from(
    contenedor.querySelectorAll(
      '[data-codigo-fase]'
    )
  ).map(
    input => {
      const codigoFase =
        input.dataset
          .codigoFase;

      const actual =
        tolerancias.find(
          item =>
            item.codigoFase ===
            codigoFase
        );

      return {
        codigoFase,

        valorMinutos:
          Number(
            input.value
          ),

        version:
          actual?.version ??
          null
      };
    }
  );
}

async function guardar(
  contenedor
) {
  const datos =
    cambios(
      contenedor
    );

  if (
    datos.some(
      item =>
        !validar(
          item.valorMinutos
        )
    )
  ) {
    contenedor.querySelector(
      '#toleranciasEstado'
    ).textContent =
      'Todos los valores deben ser enteros mayores que cero.';

    return;
  }

  if (
    !window.confirm(
      '¿Confirma los cambios de tolerancias? Los cambios no alteran fases iniciadas o concluidas.'
    )
  ) {
    return;
  }

  try {
    tolerancias =
      await actualizarTolerancias(
        datos
      );

    render(
      contenedor
    );

    showNotification(
      'Tolerancias actualizadas.',
      {
        type: 'success'
      }
    );
  } catch (error) {
    contenedor.querySelector(
      '#toleranciasEstado'
    ).textContent =
      error?.message ||
      'No fue posible guardar las tolerancias.';
  }
}

export async function init() {
  const contenedor = root();

  if (!contenedor) {
    return;
  }

  try {
    tolerancias =
      await listarTolerancias();

    render(
      contenedor
    );

    contenedor
      .querySelector(
        '#toleranciasGuardar'
      )
      ?.addEventListener(
        'click',
        () =>
          guardar(
            contenedor
          )
      );

    contenedor
      .querySelector(
        '#toleranciasCancelar'
      )
      ?.addEventListener(
        'click',
        async () => {
          tolerancias =
            await listarTolerancias();

          render(
            contenedor
          );
        }
      );
  } catch (error) {
    contenedor.querySelector(
      '#toleranciasEstado'
    ).textContent =
      error?.message ||
      'No fue posible consultar las tolerancias.';
  }
}