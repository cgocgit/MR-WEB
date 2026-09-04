/**
 * Registros mock generados por la operación
 * Registro de ajuste autorizado.
 *
 * No duplica productos, existencias, límites
 * ni cortes físicos.
 */
export const AJUSTES_INVENTARIO_MOCK = [];

export function clonarDatosAjustes(datos) {
  return structuredClone(datos);
}

export function simularLatenciaAjustes(
  ms = 150
) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}