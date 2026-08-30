export function createPanelCard(title){
  const el = document.createElement('div');
  el.className = 'card panel-card';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong class="pc-title">${title}</strong>
      <div>
        <button class="pc-refresh" title="Actualizar" style="font-size:12px">⟳</button>
      </div>
    </div>
    <div class="pc-body" style="margin-top:8px">Cargando...</div>
    <div class="pc-meta" style="margin-top:8px;font-size:12px;color:#666"></div>
  `;
  const btn = el.querySelector('.pc-refresh');
  btn.addEventListener('click', ()=> el.dispatchEvent(new CustomEvent('card:refresh')));
  return Object.assign(el, {
    setLoading(){ el.querySelector('.pc-body').textContent = 'Cargando...'; el.querySelector('.pc-meta').textContent = ''; },
    setContent(html, meta){ el.querySelector('.pc-body').innerHTML = html; if(meta) el.querySelector('.pc-meta').textContent = meta; },
    setEmpty(msg){ el.querySelector('.pc-body').innerHTML = `<div>${msg}</div>`; },
    setError(msg){ el.querySelector('.pc-body').innerHTML = `<div style="color:#900">${msg}</div>`; },
    setMeta(meta){ el.querySelector('.pc-meta').textContent = meta; }
  });
}
