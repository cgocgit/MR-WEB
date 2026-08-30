// Mock permisos service
export async function listPermisos(){
  await new Promise(r=>setTimeout(r,80));
  return [
    'clientes.*','catalogo.*','inventario.*','cotizaciones.*','ordenes.*','pagos.*','reportes.*','administracion.consultar'
  ];
}

export async function permisosPorRol(rol){
  await new Promise(r=>setTimeout(r,60));
  return [ 'clientes.consultar', 'cotizaciones.consultar' ];
}

export async function updatePermisosPorRol(rol, permisos){
  await new Promise(r=>setTimeout(r,120));
  // mock save — in a real backend this would persist and return audit info
  return { success: true, audit: { id: 'AUD-'+Date.now(), rol, permisos } };
}

export default { listPermisos, permisosPorRol };
