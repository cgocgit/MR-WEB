// Mock roles service

const ROLES_MOCK = [
  {
    id: 'ADMIN',
    nombre: 'Administrador del sistema',
    desc: 'Gestión total'
  },
  {
    id: 'INVENTARIO',
    nombre: 'Responsable de Inventario',
    desc: 'Manejo inventario'
  },
  {
    id: 'USER',
    nombre: 'Ventas',
    desc: 'Ejecutivo de ventas'
  },
  {
    id: 'ADMINISTRATIVO',
    nombre: 'Administrativo',
    desc: 'Soporte y registro administrativo'
  },
  {
    id: 'TECH',
    nombre: 'Técnico',
    desc: 'Soporte técnico y ejecución'
  },
  {
    id: 'SUPERVISOR',
    nombre: 'Supervisor',
    desc: 'Supervisión de operaciones'
  },
  {
    id: 'DIRECCION',
    nombre: 'Dirección',
    desc: 'Gerencia y dirección ejecutiva'
  }
];

export async function listRoles() {
  await new Promise(resolve => setTimeout(resolve, 80));

  return ROLES_MOCK.map(rol => ({ ...rol }));
}

export async function getRole(id) {
  await new Promise(resolve => setTimeout(resolve, 60));

  const role = ROLES_MOCK.find(
    rol => String(rol.id) === String(id)
  );

  return role ? { ...role } : null;
}

export default {
  listRoles,
  getRole
};