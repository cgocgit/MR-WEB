import {
  listarProductos
} from './catalogo.service.js';

import {
  obtenerConfiguracionLimites
} from './inventario-limites.service.js';

/**
 * Tipos de alerta soportados por la pantalla.
 */
export const TIPOS_ALERTA_INVENTARIO =
  Object.freeze({
    MINIMO: 'MINIMO',
    MAXIMO: 'MAXIMO',
    CONFIGURACION_INCONSISTENTE:
      'CONFIGURACION_INCONSISTENTE'
  });

const PRIORIDAD_TIPO = {
  [TIPOS_ALERTA_INVENTARIO.CONFIGURACION_INCONSISTENTE]: 1,
  [TIPOS_ALERTA_INVENTARIO.MINIMO]: 2,
  [TIPOS_ALERTA_INVENTARIO.MAXIMO]: 3
};

/**
 * Normaliza texto para búsquedas.
 *
 * @param {*} valor
 * @returns {string}
 */
function normalizarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Determina si un valor representa un límite válido.
 *
 * Los límites actuales de la pantalla de configuración
 * son enteros mayores que cero.
 *
 * @param {*} valor
 * @returns {boolean}
 */
function esLimiteValido(valor) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}

/**
 * Convierte un valor numérico válido.
 *
 * @param {*} valor
 * @param {number} valorDefault
 * @returns {number}
 */
function numeroSeguro(
  valor,
  valorDefault = 0
) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorDefault;
}

/**
 * Construye una alerta a partir del producto,
 * su existencia global y sus límites.
 *
 * No modifica la configuración recibida.
 *
 * @param {Object} producto
 * @param {Object} configuracion
 * @param {string} fechaEvaluacion
 * @returns {Object|null}
 */
function evaluarProducto(
  producto,
  configuracion,
  fechaEvaluacion
) {
  const limites =
    configuracion?.limites ?? null;

  if (!limites) {
    return null;
  }

  const minimoValido =
    esLimiteValido(limites.minimo);

  const maximoValido =
    esLimiteValido(limites.maximo);

  /*
   * Si no existe ningún límite válido,
   * no se infiere ningún valor.
   */
  if (
    !minimoValido &&
    !maximoValido
  ) {
    return null;
  }

  const cantidadActual =
    numeroSeguro(
      configuracion?.totales
        ?.existenciaFisica
    );

  const cantidadReservada =
    numeroSeguro(
      configuracion?.totales
        ?.cantidadReservada
    );

  const disponibilidad =
    numeroSeguro(
      configuracion?.totales
        ?.disponibilidad
    );

  const stockMinimo =
    minimoValido
      ? Number(limites.minimo)
      : null;

  const stockMaximo =
    maximoValido
      ? Number(limites.maximo)
      : null;

  let tipo = null;
  let limiteAplicable = null;
  let diferencia = null;

  /*
   * La especificación de Alertas establece que
   * mínimo >= máximo representa configuración
   * inconsistente.
   *
   * Esta evaluación no modifica ni bloquea la
   * pantalla ya construida de configuración.
   */
  if (
    minimoValido &&
    maximoValido &&
    stockMinimo >= stockMaximo
  ) {
    tipo =
      TIPOS_ALERTA_INVENTARIO
        .CONFIGURACION_INCONSISTENTE;
  } else if (
    minimoValido &&
    cantidadActual <= stockMinimo
  ) {
    tipo =
      TIPOS_ALERTA_INVENTARIO.MINIMO;

    limiteAplicable =
      stockMinimo;

    diferencia =
      stockMinimo - cantidadActual;
  } else if (
    maximoValido &&
    cantidadActual >= stockMaximo
  ) {
    tipo =
      TIPOS_ALERTA_INVENTARIO.MAXIMO;

    limiteAplicable =
      stockMaximo;

    diferencia =
      cantidadActual - stockMaximo;
  }

  /*
   * El producto se excluye cuando se encuentra
   * dentro de sus límites.
   */
  if (!tipo) {
    return null;
  }

  return {
    idAlerta:
      `${tipo}-${producto.idProducto}`,

    tipo,

    idProducto:
      producto.idProducto,

    codigo:
      producto.codigo,

    nombre:
      producto.nombre,

    descripcion:
      producto.descripcion ?? '',

    imagenUrl:
      producto.imagenUrl ?? null,

    tipoProducto:
      producto.tipoProducto ?? null,

    unidadMedida:
      producto.unidadMedida ?? '',

    /*
     * Los límites actualmente construidos
     * son globales por producto.
     */
    alcance: 'GLOBAL',

    idAlmacen: null,
    almacen: 'Global',

    cantidadActual,
    cantidadReservada,
    disponibilidad,

    stockMinimo,
    stockMaximo,

    limiteAplicable,
    diferencia,

    severidad: null,
    estado: null,

    fechaConfiguracion:
      limites.fechaUltimaModificacion ??
      null,

    usuarioConfiguracion:
      limites.usuarioUltimaModificacion ??
      null,

    fechaActualizacion:
      fechaEvaluacion
  };
}

/**
 * Obtiene las alertas vigentes utilizando
 * únicamente operaciones de consulta.
 *
 * @returns {Promise<Object[]>}
 */
async function obtenerAlertasBase() {
  const resultadoProductos =
    await listarProductos({
      soloActivos: true,
      skip: 0,
      limit: 1000
    });

  const productos =
    resultadoProductos.items ?? [];

  const fechaEvaluacion =
    new Date().toISOString();

  /*
   * Se consulta la configuración de todos los
   * productos en paralelo para evitar esperas
   * acumulativas innecesarias.
   */
  const resultados =
    await Promise.allSettled(
      productos.map(
        async producto => {
          const configuracion =
            await obtenerConfiguracionLimites(
              producto.idProducto
            );

          return evaluarProducto(
            producto,
            configuracion,
            fechaEvaluacion
          );
        }
      )
    );

  return resultados
    .filter(
      resultado =>
        resultado.status === 'fulfilled'
    )
    .map(
      resultado => resultado.value
    )
    .filter(Boolean);
}

/**
 * Calcula los indicadores del encabezado.
 *
 * @param {Object[]} alertas
 * @returns {Object}
 */
function calcularResumen(alertas) {
  return {
    total: alertas.length,

    minimos:
      alertas.filter(
        alerta =>
          alerta.tipo ===
          TIPOS_ALERTA_INVENTARIO.MINIMO
      ).length,

    maximos:
      alertas.filter(
        alerta =>
          alerta.tipo ===
          TIPOS_ALERTA_INVENTARIO.MAXIMO
      ).length,

    inconsistentes:
      alertas.filter(
        alerta =>
          alerta.tipo ===
          TIPOS_ALERTA_INVENTARIO
            .CONFIGURACION_INCONSISTENTE
      ).length
  };
}

/**
 * Aplica búsqueda y filtros.
 *
 * @param {Object[]} alertas
 * @param {Object} filtros
 * @returns {Object[]}
 */
function aplicarFiltros(
  alertas,
  filtros
) {
  let resultado = [...alertas];

  const texto =
    normalizarTexto(
      filtros.texto
    );

  if (texto) {
    resultado =
      resultado.filter(alerta => {
        const contenido =
          normalizarTexto(
            [
              alerta.codigo,
              alerta.nombre,
              alerta.descripcion
            ].join(' ')
          );

        return contenido.includes(texto);
      });
  }

  if (
    filtros.tipo &&
    Object.values(
      TIPOS_ALERTA_INVENTARIO
    ).includes(filtros.tipo)
  ) {
    resultado =
      resultado.filter(
        alerta =>
          alerta.tipo === filtros.tipo
      );
  }

  return resultado;
}

/**
 * Obtiene el valor usado para ordenar.
 *
 * @param {Object} alerta
 * @param {string} campo
 * @returns {*}
 */
function obtenerValorOrden(
  alerta,
  campo
) {
  switch (campo) {
    case 'codigo':
      return alerta.codigo ?? '';

    case 'producto':
      return alerta.nombre ?? '';

    case 'cantidadActual':
      return alerta.cantidadActual;

    case 'limite':
      return alerta.limiteAplicable ?? 0;

    case 'diferencia':
      return alerta.diferencia ?? 0;

    case 'tipo':
    default:
      return (
        PRIORIDAD_TIPO[
          alerta.tipo
        ] ?? 99
      );
  }
}

/**
 * Ordena las alertas sin modificar el arreglo
 * recibido.
 *
 * @param {Object[]} alertas
 * @param {string} campo
 * @param {string} direccion
 * @returns {Object[]}
 */
function ordenarAlertas(
  alertas,
  campo,
  direccion
) {
  const factor =
    direccion === 'desc'
      ? -1
      : 1;

  return [...alertas].sort(
    (a, b) => {
      const valorA =
        obtenerValorOrden(
          a,
          campo
        );

      const valorB =
        obtenerValorOrden(
          b,
          campo
        );

      if (
        typeof valorA === 'string' ||
        typeof valorB === 'string'
      ) {
        return (
          String(valorA)
            .localeCompare(
              String(valorB),
              'es-MX',
              {
                sensitivity: 'base'
              }
            ) * factor
        );
      }

      return (
        (
          Number(valorA) -
          Number(valorB)
        ) * factor
      );
    }
  );
}

/**
 * Normaliza parámetros de paginación.
 *
 * @param {*} valor
 * @param {number} defaultValue
 * @returns {number}
 */
function enteroNoNegativo(
  valor,
  defaultValue
) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero >= 0
  )
    ? numero
    : defaultValue;
}

/**
 * Consulta principal utilizada por la pantalla.
 *
 * Preparada para que en una iteración futura
 * esta implementación interna sea sustituida
 * por un endpoint REST sin modificar la UI.
 *
 * @param {Object} filtros
 * @returns {Promise<Object>}
 */
export async function consultarAlertasInventario(
  filtros = {}
) {
  const alertasBase =
    await obtenerAlertasBase();

  /*
   * El resumen representa todas las alertas
   * vigentes, independientemente del filtro
   * aplicado en el listado.
   */
  const resumen =
    calcularResumen(alertasBase);

  const filtradas =
    aplicarFiltros(
      alertasBase,
      filtros
    );

  const ordenadas =
    ordenarAlertas(
      filtradas,
      filtros.ordenPor || 'tipo',
      filtros.direccion || 'asc'
    );

  const skip =
    enteroNoNegativo(
      filtros.skip,
      0
    );

  const limitSolicitado =
    enteroNoNegativo(
      filtros.limit,
      10
    );

  const limit =
    Math.min(
      Math.max(
        limitSolicitado,
        1
      ),
      100
    );

  const items =
    ordenadas.slice(
      skip,
      skip + limit
    );

  return {
    items,

    total:
      ordenadas.length,

    totalGeneral:
      alertasBase.length,

    skip,
    limit,

    resumen,

    fechaConsulta:
      new Date().toISOString()
  };
}