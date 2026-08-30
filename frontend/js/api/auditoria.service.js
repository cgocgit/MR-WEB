// Mock auditoria service
export async function listEventos(filter){
  await new Promise(r=>setTimeout(r,100));
  return [
    {id:1,fecha:'2026-08-28 10:00',usuario:'admin',modulo:'usuarios',accion:'crear',registro:2,resultado:'OK'},
    {id:2,fecha:'2026-08-27 09:30',usuario:'admin',modulo:'cotizaciones',accion:'modificar',registro:9001,resultado:'OK'}
  ];
}

export async function getEvento(id){ await new Promise(r=>setTimeout(r,60)); return {id,detalle:'Detalle del evento '+id}; }

export default { listEventos, getEvento };
