export function showNotification(message, {type='info', timeout=3000}={}){
  const root = document.getElementById('notifications');
  const el = document.createElement('div');
  el.className = 'card';
  el.style.marginTop = '8px';
  el.textContent = message;
  root.appendChild(el);
  if(timeout>0) setTimeout(()=> el.remove(), timeout);
}
