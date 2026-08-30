// Mock roles service
export async function listRoles(){
  await new Promise(r=>setTimeout(r,80));
  return [
    {id:'ADMIN',nombre:'Administrador del sistema',desc:'Gestión total'},
    {id:'INVENTARIO',nombre:'Responsable de Inventario',desc:'Manejo inventario'},
    {id:'USER',nombre:'Ventas',desc:'Ejecutivo de ventas'},
    {id:'ADMINISTRATIVO',nombre:'Administrativo',desc:'Soporte y registro administrativo'},
    {id:'TECH',nombre:'Técnico',desc:'Soporte técnico y ejecución'},
    {id:'SUPERVISOR',nombre:'Supervisor',desc:'Supervisión de operaciones'},
    {id:'DIRECCION',nombre:'Dirección',desc:'Gerencia y dirección ejecutiva'}
  ];
}

export async function getRole(id){
  await new Promise(r=>setTimeout(r,60));
  return {id,nombre:id,desc:'Descripción de '+id, permisos: [] };
}

export default { listRoles, getRole };
