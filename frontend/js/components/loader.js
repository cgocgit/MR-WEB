let loaderEl = null;
export function showLoader(){
  if(loaderEl) return;
  loaderEl = document.createElement('div');
  loaderEl.style.position='fixed';loaderEl.style.left=0;loaderEl.style.top=0;loaderEl.style.right=0;loaderEl.style.bottom=0;loaderEl.style.display='flex';loaderEl.style.alignItems='center';loaderEl.style.justifyContent='center';loaderEl.style.background='rgba(255,255,255,0.6)';
  loaderEl.innerHTML = '<div class="card">Cargando...</div>';
  document.body.appendChild(loaderEl);
}
export function hideLoader(){ if(loaderEl){ loaderEl.remove(); loaderEl=null }}
