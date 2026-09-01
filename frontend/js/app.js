import './shared/error-handler.js';
import { initRouter } from './router.js';
import { renderTopbar } from './components/topbar.js';
import { renderSidebar } from './components/sidebar.js';
import { showNotification } from './components/notification.js';

const topbar = document.getElementById('topbar');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

const sidebarBackdrop =
  document.getElementById(
    'sidebarBackdrop'
  );

const MOBILE_LAYOUT_QUERY =
  '(max-width: 900px), ' +
  '(hover: none) and (pointer: coarse)';

function isMobileLayout() {
  return window.matchMedia(
    MOBILE_LAYOUT_QUERY
  ).matches;
}

function getSession(){
  try{ return JSON.parse(localStorage.getItem('mr_session')) }catch(e){return null}
}

function init(){
  const session = getSession();
  // Ensure root opens at login when there is no session; otherwise go to dashboard
  if(!session){
    if(!location.hash || !location.hash.startsWith('#/')) location.hash = '#/login';
    // hide layout pieces until authentication
    if(topbar) { topbar.classList.add('auth-only'); topbar.setAttribute('aria-hidden','true') }
    if(sidebar) { sidebar.classList.add('auth-only'); sidebar.setAttribute('aria-hidden','true'); }
    // ensure content uses full width
    if(content) { content.style.marginLeft = '0' }
  } else {
    if(!location.hash || location.hash === '' || location.hash === '#/login') location.hash = '#/dashboard';
    // show layout pieces
    if(topbar) { topbar.classList.remove('auth-only'); topbar.removeAttribute('aria-hidden') }
    if(sidebar) { sidebar.classList.remove('auth-only'); sidebar.removeAttribute('aria-hidden') }
  }

  renderTopbar(topbar, session);
  renderSidebar(sidebar, session || null);
  initRouter(content);
  showNotification('Aplicación inicial lista', {type:'info',timeout:1500});
}

// Adjust main content margin when sidebar visibility changes or on resize
function adjustContentForSidebar() {
  const sidebarEl =
    document.getElementById(
      'sidebar'
    );

  const main =
    document.getElementById(
      'content'
    );

  const toggle =
    document.getElementById(
      'sidebarToggle'
    );

  if (!main) {
    return;
  }

  const root =
    document.documentElement;

  if (isMobileLayout()) {
    /*
     * sidebar-collapsed no se utiliza
     * para controlar móvil.
     */
    root.classList.remove(
      'sidebar-collapsed'
    );

    main.style.marginLeft =
      '0';

    const expanded =
      root.classList.contains(
        'sidebar-open'
      );

    if (toggle) {
      toggle.setAttribute(
        'aria-expanded',
        String(expanded)
      );
    }

    return;
  }

  /*
   * Si cambiamos de móvil a
   * escritorio, eliminamos el
   * estado off-canvas.
   */
  root.classList.remove(
    'sidebar-open'
  );

  const isCollapsed =
    root.classList.contains(
      'sidebar-collapsed'
    );

  if (isCollapsed) {
    main.style.marginLeft =
      '0';
  } else if (sidebarEl) {
    const gap = 20;

    const width =
      sidebarEl
        .getBoundingClientRect()
        .width || 240;

    main.style.marginLeft =
      `${width + gap}px`;
  }

  if (toggle) {
    toggle.setAttribute(
      'aria-expanded',
      String(!isCollapsed)
    );
  }
}

// listen for changes triggered by topbar/sidebar controls
window.addEventListener('sidebar:changed', adjustContentForSidebar);
if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener(
    'click',
    () => {
      document.documentElement
        .classList
        .remove('sidebar-open');

      adjustContentForSidebar();
    }
  );
}
document.addEventListener(
  'keydown',
  event => {
    if (
      event.key !== 'Escape' ||
      !isMobileLayout()
    ) {
      return;
    }

    const root =
      document.documentElement;

    if (
      !root.classList.contains(
        'sidebar-open'
      )
    ) {
      return;
    }

    root.classList.remove(
      'sidebar-open'
    );

    adjustContentForSidebar();

    document.getElementById(
      'sidebarToggle'
    )?.focus();
  }
);

window.addEventListener('resize', adjustContentForSidebar);

// call once on load in case initial state needs correction
document.addEventListener('DOMContentLoaded', ()=> setTimeout(adjustContentForSidebar, 40));

document.addEventListener('DOMContentLoaded', init);
