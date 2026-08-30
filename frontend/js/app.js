import './shared/error-handler.js';
import { initRouter } from './router.js';
import { renderTopbar } from './components/topbar.js';
import { renderSidebar } from './components/sidebar.js';
import { showNotification } from './components/notification.js';

const topbar = document.getElementById('topbar');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

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
function adjustContentForSidebar(){
  const sidebarEl = document.getElementById('sidebar');
  const main = document.getElementById('content');
  if(!main) return;
  const isCollapsed = document.documentElement.classList.contains('sidebar-collapsed');
  const small = window.innerWidth <= 720;
  if(isCollapsed || small){
    main.style.marginLeft = '0';
  } else if(sidebarEl){
    // keep a small gap (20px) consistent with previous layout
    const gap = 20;
    const w = sidebarEl.getBoundingClientRect().width || 220;
    main.style.marginLeft = (w + gap) + 'px';
  }
}

// listen for changes triggered by topbar/sidebar controls
window.addEventListener('sidebar:changed', adjustContentForSidebar);
window.addEventListener('resize', adjustContentForSidebar);

// call once on load in case initial state needs correction
document.addEventListener('DOMContentLoaded', ()=> setTimeout(adjustContentForSidebar, 40));

document.addEventListener('DOMContentLoaded', init);
