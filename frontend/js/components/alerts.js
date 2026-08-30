export function createAlertsComponent(){
  const el = document.createElement('div');
  el.className = 'card alerts-card';
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>Alertas</strong><button class="alerts-refresh" title="Actualizar" style="font-size:12px">⟳</button></div><div class="alerts-body" style="margin-top:8px">Cargando...</div>`;
  el.querySelector('.alerts-refresh').addEventListener('click', ()=> el.dispatchEvent(new CustomEvent('alerts:refresh')));
  return Object.assign(el, {
    setLoading(){ el.querySelector('.alerts-body').textContent = 'Cargando...'; },
    setAlerts(list){
      const body = el.querySelector('.alerts-body');
      if(!list || list.length === 0) { body.innerHTML = '<div>No hay alertas.</div>'; return }
      const ul = document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0'; ul.style.margin='0';
      list.forEach(a=>{
        const li = document.createElement('li');
        li.style.padding='6px 0';
        li.innerHTML = `<div style="font-weight:600">${a.tipo} <span style='color:#666;font-weight:400;font-size:12px'>${a.fecha}</span></div><div>${a.mensaje}</div>`;
        ul.appendChild(li);
      });
      body.innerHTML = ''; body.appendChild(ul);
    }
  });
}
