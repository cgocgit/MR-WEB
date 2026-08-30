export function renderTopbar(container, session){
  const userLabel = session && session.user ? `${session.user.name}` : 'Invitado';
  const hasSession = session && session.user;
  container.innerHTML = `
    <div class="container" style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:12px;align-items:center">
        <button id="sidebarToggle" aria-label="Mostrar u ocultar menú" title="Mostrar/Ocultar menú" style="display:inline-block">☰</button>
        <div style="font-weight:600">Mesa Regia</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center">
        <button id="alertsBtn" aria-label="Alertas" title="Alertas" style="background:transparent;border:none;cursor:pointer">🔔 <span id="alertsCount" style="font-weight:600;color:var(--accent);margin-left:6px;">0</span></button>
        <div style="color:var(--muted)">Bienvenido, ${userLabel}</div>
        ${hasSession ? '<button id="logoutBtn">Cerrar sesión</button>' : ''}
      </div>
    </div>
  `;

  const toggle = container.querySelector('#sidebarToggle');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('sidebar-collapsed');
      // update aria-expanded
      const expanded = !document.documentElement.classList.contains('sidebar-collapsed');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      // notify layout to adjust main content
      window.dispatchEvent(new Event('sidebar:changed'));
    });
  }

  const btn = container.querySelector('#logoutBtn');
  if(btn) btn.addEventListener('click', ()=>{ localStorage.removeItem('mr_session'); location.hash = '#/login'; location.reload(); });

  // simple alerts count placeholder
  const alertsCount = container.querySelector('#alertsCount');
  if(alertsCount) alertsCount.textContent = '0';
}
