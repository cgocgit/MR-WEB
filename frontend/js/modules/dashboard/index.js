import { getSession } from '../../shared/auth-guard.js';
import { hasPermission } from '../../shared/permissions.js';
import panelService from '../../api/panel.service.js';
import { createPanelCard } from '../../components/panel-card.js';
import { createAlertsComponent } from '../../components/alerts.js';

export async function init(containerId){
	const root = document.getElementById(containerId) || document.querySelector('.container');
	if(!root) return;
	const session = getSession();
	const roles = (session && session.user && session.user.roles) || [];
	const username = session && session.user && session.user.name ? session.user.name : 'Invitado';
	const activeRole = roles[0] || '';

	// header with user and role
	const header = document.createElement('div');
	header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center';
	header.innerHTML = `<div><strong>Panel</strong><div style="font-size:13px;color:#666">${username} — ${activeRole}</div></div><div><button id="dashboard-refresh">Actualizar todo</button></div>`;

	// grid for cards
	const grid = document.createElement('div');
	grid.style.display = 'grid';
	grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(220px,1fr))';
	grid.style.gap = '12px';
	grid.style.marginTop = '12px';

	// alerts column
	const alertsComp = createAlertsComponent();
	alertsComp.setLoading();

	const cards = [];

	// Build card list driven by permissions (spec 9.a)
	const config = [
		{id:'admin-users', title:'Usuarios y roles', permission:'usuarios.*', loader: async ()=> panelService.getAdminSummary(), render: (d)=> ({html:`<div>Total usuarios: <strong>${d.usersTotal}</strong></div><div style="margin-top:6px">Roles: <strong>${Object.keys(d.roles).length}</strong></div><div style="margin-top:8px"><a href="#/administracion">Abrir Administración</a></div>`, meta:``})},
		{id:'inv-summary', title:'Inventario', permission:'inventario.consultar', loader: async ()=> panelService.getInventorySummary(), render: (d)=> ({html:`<div>Total artículos: <strong>${d.totalItems}</strong></div><div>Artículos en bajo stock: <strong>${d.lowStock}</strong></div><div style="margin-top:8px"><a href="#/inventario">Ver existencias</a> • <a href="#/inventario/movimientos">Movimientos</a></div>`, meta:`Periodo: ${d.period} — Actualizado: ${new Date().toLocaleString()}`})},
		{id:'ventas-summary', title:'Ventas y Cotizaciones', permission:'cotizaciones.consultar', loader: async ()=> panelService.getSalesSummary(), render: (d)=> ({html:`<div>Prospectos: <strong>${d.prospects}</strong></div><div>Cotizaciones recientes: <strong>${d.cotizacionesRecent.length}</strong></div><div style="margin-top:8px"><a href="#/cotizaciones">Ver cotizaciones</a></div>`, meta:`Periodo: ${d.period} — Actualizado: ${new Date().toLocaleString()}`})},
		{id:'adm-summary', title:'Administración', permission:'pagos.consultar', loader: async ()=> panelService.getAdminSummary(), render: (d)=> ({html:`<div>Auditoría reciente: <strong>${d.recentAudit.length}</strong></div><div style="margin-top:8px"><a href="#/administracion">Abrir administración</a></div>`, meta:`Actualizado: ${new Date().toLocaleString()}`})},
		{id:'tech-orders', title:'Órdenes asignadas', permission:'ordenes.asignadas', loader: async ()=> panelService.getAssignedOrders(session && session.user && session.user.id), render: (d)=> ({html:`<div>Órdenes asignadas: <strong>${d.length}</strong></div><div style="margin-top:8px"><a href="#/logistica">Ver mis asignadas</a></div>`, meta:`Actualizado: ${new Date().toLocaleString()}`})},
		{id:'sup-orders', title:'Supervisión', permission:'reportes.consultar', loader: async ()=> panelService.getInventorySummary(), render: (d)=> ({html:`<div>Artículos totales: <strong>${d.totalItems}</strong></div><div style="margin-top:8px"><a href="#/reportes">Ver reportes</a></div>`, meta:`Actualizado: ${new Date().toLocaleString()}`})},
		{id:'dir-reports', title:'Dirección', permission:'dashboard.consultar', loader: async ()=> panelService.getSalesSummary(), render: (d)=> ({html:`<div>Ventas periodo: <strong>${d.cotizacionesRecent && d.cotizacionesRecent[0] ? d.cotizacionesRecent[0].importe : 0}</strong></div><div style="margin-top:8px"><a href="#/reportes">Ver reportes</a></div>`, meta:`Actualizado: ${new Date().toLocaleString()}`})}
	];

	for(const item of config){
		if(hasPermission(session, item.permission) || (session && session.user && session.user.roles && session.user.roles.includes('ADMIN') && item.permission !== 'ordenes.asignadas')){
			const card = createPanelCard(item.title);
			const load = async ()=>{
				card.setLoading();
				try{
					const data = await item.loader();
					const r = item.render(data);
					card.setContent(r.html, r.meta || `Actualizado: ${new Date().toLocaleString()}`);
				}catch(e){ card.setError('Error al cargar la tarjeta') }
			};
			card.addEventListener('card:refresh', load);
			grid.appendChild(card);
			cards.push(load);
		}
	}

	// alerts composition based on permissions
	const alertsList = [];
	if(hasPermission(session,'usuarios.*') || (session && session.user && session.user.roles && session.user.roles.includes('ADMIN'))){
		const a = await panelService.getAdminAlerts(); alertsList.push(...a);
	}
	if(hasPermission(session,'inventario.consultar')){
		const a = await panelService.getInventoryAlerts(); alertsList.push(...a);
	}
	if(hasPermission(session,'cotizaciones.consultar')){
		const a = await panelService.getSalesAlerts(); alertsList.push(...a);
	}
	alertsComp.setAlerts(alertsList);

	// assemble container
	const composed = document.createElement('div');
	composed.className = 'dashboard-composed';
	composed.appendChild(header);
	// layout: main grid then alerts below
	composed.appendChild(grid);
	composed.appendChild(alertsComp);
	const existing = root.querySelector('.dashboard-composed');
	if(existing) existing.replaceWith(composed); else root.appendChild(composed);

	// initial load all cards
	for(const l of cards) l();
	document.getElementById('dashboard-refresh').addEventListener('click', ()=> cards.forEach(f=> f()));
}

export default { init };


