const MOBILE_LAYOUT_QUERY =
  '(max-width: 900px), ' +
  '(hover: none) and (pointer: coarse)';

function isMobileLayout() {
  return window.matchMedia(
    MOBILE_LAYOUT_QUERY
  ).matches;
}

function isSidebarOpen() {
  if (isMobileLayout()) {
    return document.documentElement
      .classList
      .contains('sidebar-open');
  }

  return !document.documentElement
    .classList
    .contains('sidebar-collapsed');
}

function updateToggleState(toggle) {
  if (!toggle) {
    return;
  }

  const expanded =
    isSidebarOpen();

  toggle.setAttribute(
    'aria-expanded',
    String(expanded)
  );

  toggle.setAttribute(
    'aria-label',
    expanded
      ? 'Cerrar menú de navegación'
      : 'Abrir menú de navegación'
  );

  toggle.title =
    expanded
      ? 'Cerrar menú'
      : 'Abrir menú';
}

function toggleSidebar(toggle) {
  const root =
    document.documentElement;

  if (isMobileLayout()) {
    /*
     * Móvil:
     * sidebar-open controla si el
     * menú off-canvas está visible.
     */
    root.classList.remove(
      'sidebar-collapsed'
    );

    root.classList.toggle(
      'sidebar-open'
    );
  } else {
    /*
     * Escritorio:
     * conservamos el comportamiento
     * de sidebar colapsable.
     */
    root.classList.remove(
      'sidebar-open'
    );

    root.classList.toggle(
      'sidebar-collapsed'
    );
  }

  updateToggleState(toggle);

  window.dispatchEvent(
    new Event('sidebar:changed')
  );
}

export function renderTopbar(
  container,
  session
) {
  if (!container) {
    return;
  }

  const hasSession =
    Boolean(session?.user);

  const userLabel =
    session?.user?.name ||
    'Invitado';

  container.replaceChildren();

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'container topbar-container';

  const brandGroup =
    document.createElement('div');

  brandGroup.className =
    'topbar-brand-group';

  const toggle =
    document.createElement('button');

  toggle.id =
    'sidebarToggle';

  toggle.type =
    'button';

  toggle.className =
    'sidebar-toggle';

  toggle.setAttribute(
    'aria-controls',
    'sidebar'
  );

  toggle.textContent =
    '☰';

  updateToggleState(
    toggle
  );

  const brand =
    document.createElement('div');

  brand.className =
    'topbar-brand';

  brand.textContent =
    'Mesa Regia';

  brandGroup.append(
    toggle,
    brand
  );

  const actions =
    document.createElement('div');

  actions.className =
    'topbar-actions';

  const alerts =
    document.createElement('button');

  alerts.id =
    'alertsBtn';

  alerts.type =
    'button';

  alerts.className =
    'topbar-alerts';

  alerts.setAttribute(
    'aria-label',
    'Alertas'
  );

  alerts.title =
    'Alertas';

  alerts.append(
    document.createTextNode('🔔')
  );

  const alertsCount =
    document.createElement('span');

  alertsCount.id =
    'alertsCount';

  alertsCount.className =
    'topbar-alerts-count';

  alertsCount.textContent =
    '0';

  alerts.appendChild(
    alertsCount
  );

  const welcome =
    document.createElement('div');

  welcome.className =
    'topbar-welcome';

  welcome.textContent =
    `Bienvenido, ${userLabel}`;

  actions.append(
    alerts,
    welcome
  );

  if (hasSession) {
    const logout =
      document.createElement('button');

    logout.id =
      'logoutBtn';

    logout.type =
      'button';

    logout.className =
      'topbar-logout';

    logout.textContent =
      'Salir';

    logout.setAttribute(
      'aria-label',
      'Cerrar sesión'
    );

    actions.appendChild(
      logout
    );

    logout.addEventListener(
      'click',
      () => {
        localStorage.removeItem(
          'mr_session'
        );

        document.documentElement
          .classList.remove(
            'sidebar-open',
            'sidebar-collapsed'
          );

        location.hash =
          '#/login';

        location.reload();
      }
    );
  }

  wrapper.append(
    brandGroup,
    actions
  );

  container.appendChild(
    wrapper
  );

  toggle.addEventListener(
    'click',
    () => {
      toggleSidebar(
        toggle
      );
    }
  );
}