export function openModal({title='',body='',confirmText='Confirmar',cancelText='Cancelar',danger=false}){
  return new Promise((resolve)=>{
    const overlay = document.createElement('div');
    overlay.style.position='fixed'; overlay.style.left=0; overlay.style.top=0; overlay.style.right=0; overlay.style.bottom=0; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.background='rgba(0,0,0,0.3)'; overlay.style.zIndex=1200;
    const card = document.createElement('div'); card.className='card'; card.style.minWidth='320px'; card.innerHTML = `<div style="font-weight:700;margin-bottom:8px">${title}</div><div class="modal-body">${body}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="modal-cancel">${cancelText}</button><button class="modal-confirm" style="background:${danger? '#c33':'var(--primary)'};color:#fff">${confirmText}</button></div>`;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    const cleanup = ()=>{ overlay.remove(); };
      function collectFormData(container){
        const data = {};
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(i=>{
          const key = i.id || i.name || null;
          if(!key) return;
          if(i.type === 'checkbox') data[key] = i.checked;
          else data[key] = i.value;
        });
        return data;
      }
      card.querySelector('.modal-cancel').addEventListener('click', ()=>{ cleanup(); resolve({confirmed:false}) });
      card.querySelector('.modal-confirm').addEventListener('click', ()=>{
        // collect any form inputs inside modal before removing it
        const values = collectFormData(card);
        cleanup(); resolve({confirmed:true, values});
      });
  });
}
export function showModal(title, content){
  const el = document.createElement('div');
  el.style.position='fixed';el.style.left=0;el.style.top=0;el.style.right=0;el.style.bottom=0;el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.background='rgba(0,0,0,0.4)';
  el.innerHTML = `<div class="card" style="max-width:640px;width:100%"><h3>${title}</h3><div>${content}</div><div style="text-align:right;margin-top:12px"><button id="closeModal">Cerrar</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('#closeModal').addEventListener('click', ()=> el.remove());
}
