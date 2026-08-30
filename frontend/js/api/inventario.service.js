export async function getExistencias(){
  return Promise.resolve([
    {producto:'Silla',almacen:'Central',cantidad:120},
    {producto:'Mesa',almacen:'Almacén 1',cantidad:30}
  ]);
}

export async function getMovimientos(){
  return Promise.resolve([
    {id:1,producto:'Silla',tipo:'Salida',cantidad:10,fecha:'2026-08-20'},
  ]);
}
