export function renderTable(container, columns, rows){
  const tbl = document.createElement('table');
  tbl.style.width='100%';tbl.style.borderCollapse='collapse';
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  columns.forEach(c=>{ const th = document.createElement('th'); th.textContent = c; th.style.borderBottom='1px solid #eee'; th.style.textAlign='left'; th.style.padding='8px'; tr.appendChild(th)});
  thead.appendChild(tr); tbl.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r=>{ const tr = document.createElement('tr'); columns.forEach(c=>{ const td = document.createElement('td'); td.textContent = r[c.toLowerCase()] || ''; td.style.padding='8px'; tr.appendChild(td)}); tbody.appendChild(tr)});
  tbl.appendChild(tbody);
  container.innerHTML=''; container.appendChild(tbl);
}
