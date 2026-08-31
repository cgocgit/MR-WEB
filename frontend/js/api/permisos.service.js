const PERMISOS_POR_ROL = {
  ADMIN: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Administración',
      codigo: 'administracion.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Clientes y prospectos',
      codigo: 'clientes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Cotizaciones',
      codigo: 'cotizaciones.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Pagos manuales',
      codigo: 'pagos.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ],

  INVENTARIO: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ],

  USER: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Clientes y prospectos',
      codigo: 'clientes.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Cotizaciones',
      codigo: 'cotizaciones.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ],

  ADMINISTRATIVO: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Clientes y prospectos',
      codigo: 'clientes.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Cotizaciones',
      codigo: 'cotizaciones.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Pagos manuales',
      codigo: 'pagos.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ],

  TECH: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.consultar',
      accion: 'Consultar',
      alcance: 'Órdenes asignadas',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.ejecutar',
      accion: 'Ejecutar',
      alcance: 'Órdenes asignadas',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'Asignadas',
      estado: 'Permitido'
    }
  ],

  SUPERVISOR: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Clientes y prospectos',
      codigo: 'clientes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Cotizaciones',
      codigo: 'cotizaciones.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.gestionar',
      accion: 'Administrar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Pagos manuales',
      codigo: 'pagos.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ],

  DIRECCION: [
    {
      modulo: 'Panel principal',
      codigo: 'panel.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Catálogo',
      codigo: 'catalogo.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Inventario',
      codigo: 'inventario.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Cotizaciones',
      codigo: 'cotizaciones.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Órdenes de servicio',
      codigo: 'ordenes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Logística operativa',
      codigo: 'logistica.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Pagos manuales',
      codigo: 'pagos.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Reportes',
      codigo: 'reportes.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    },
    {
      modulo: 'Alertas',
      codigo: 'alertas.consultar',
      accion: 'Consultar',
      alcance: 'General',
      estado: 'Permitido'
    }
  ]
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock permisos service
export async function listPermisos() {
  await delay(80);

  return [
    ...new Set(
      Object.values(PERMISOS_POR_ROL)
        .flat()
        .map(item => item.codigo)
    )
  ].sort();
}

export async function permisosPorRol(rol) {
  await delay(60);

  return (PERMISOS_POR_ROL[rol] || [])
    .map(item => item.codigo);
}

export async function detallePermisosPorRol(rol) {
  await delay(60);

  return (PERMISOS_POR_ROL[rol] || [])
    .map(item => ({ ...item }));
}

export default {
  listPermisos,
  permisosPorRol,
  detallePermisosPorRol
};
