// Mock panel service: provides consolidated data used by the dashboard
export async function getAdminSummary(){
  // simulate delay
  await new Promise(r=>setTimeout(r,120));
  return {
    usersTotal: 42,
    roles: {ADMIN:1,USER:30,INVENTARIO:2,TECH:3,SUPERVISOR:2,ADMINISTRATIVO:4},
    recentAudit: [ {fecha:'2026-08-29 10:12',usuario:'admin',modulo:'catalogo',accion:'actualizar producto'} ]
  };
}

export async function getInventorySummary(){
  await new Promise(r=>setTimeout(r,150));
  return {
    totalItems: 120,
    lowStock: 5,
    movementsRecent: [ {id:1,producto:'Silla',tipo:'Salida',cantidad:10,fecha:'2026-08-20'} ],
    period: 'Últimos 30 días'
  }
}

export async function getSalesSummary(){
  await new Promise(r=>setTimeout(r,120));
  return {
    prospects: 12,
    cotizacionesRecent: [ {id:9001,cliente:'Cliente A',importe:150,estado:'Borrador'} ],
    period: 'Mes actual'
  }
}

export async function getAdminAlerts(){
  await new Promise(r=>setTimeout(r,80));
  return [ {tipo:'Cuenta',mensaje:'Usuario inactivo: juan',fecha:'2026-08-28 09:23'} ];
}

export async function getInventoryAlerts(){
  await new Promise(r=>setTimeout(r,80));
  return [ {tipo:'Inventario',mensaje:'Silla (Central) en bajo stock: 5',fecha:'2026-08-29 08:10'} ];
}

export async function getSalesAlerts(){
  await new Promise(r=>setTimeout(r,80));
  return [ {tipo:'Comercial',mensaje:'Cotización 9001 por vencer',fecha:'2026-08-29 07:00'} ];
}

export async function getAssignedOrders(userId){
  await new Promise(r=>setTimeout(r,120));
  // simple mock: return one order if userId exists
  if(!userId) return [];
  return [ {id:5001,folio:'OS-5001',cliente:'Cliente A',fecha:'2026-08-25',fase:'Salida',asignadoA:userId} ];
}

export default { getAdminSummary, getInventorySummary, getSalesSummary, getAdminAlerts, getInventoryAlerts, getSalesAlerts, getAssignedOrders };
