import { listClientes } from '../../api/clientes.service.js';
import { requireRole, getSession } from '../../shared/auth-guard.js';
import { getFriendlyError } from '../../shared/error-handler.js';

export async function init(container){
	const card = (typeof container === 'string') ? document.getElementById(container) : container || document.getElementById('card');
	if(!card) return;
	try{
		if(!requireRole(['ADMIN','USER','SUPERVISOR'])){ card.innerHTML = '<div>Acceso denegado.</div>'; return }
		card.innerHTML = 'Cargando clientes...';
		const data = await listClientes();
		if(!data || data.length === 0){ card.innerHTML = '<div>No hay clientes registrados.</div>'; return }
		const table = document.createElement('table'); table.style.width='100%'; table.style.borderCollapse='collapse';
		table.innerHTML = `<thead><tr><th>Nombre</th><th>Contacto</th><th></th></tr></thead>`;
		const tbody = document.createElement('tbody');
		const session = getSession();
		data.forEach(c=>{
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${c.nombre}</td><td>${c.contacto}</td>`;
			const actions = document.createElement('td');
			const aView = document.createElement('a'); aView.href = `#/clientes/detalle?id=${c.id}`; aView.textContent = 'Ver'; aView.style.marginRight='8px';
			actions.appendChild(aView);
			if(session && session.user && session.user.roles && session.user.roles.includes('USER')){
				const aEdit = document.createElement('a'); aEdit.href = `#/clientes/formulario?id=${c.id}`; aEdit.textContent = 'Editar'; actions.appendChild(aEdit);
			}
			tr.appendChild(actions);
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		card.innerHTML = '<h2>Clientes</h2>';
		card.appendChild(table);
	}catch(e){
		card.innerHTML = `<div>Error al cargar clientes: ${getFriendlyError(e)}</div>`
	}
}

export default { init };
