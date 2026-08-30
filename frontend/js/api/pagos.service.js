export async function listPagos(){
  return Promise.resolve([
    {id:8001,orden:5001,monto:150,fecha:'2026-08-21',metodo:'Efectivo'}
  ]);
}

export async function registrarPago(pago){
  return Promise.resolve(Object.assign({id:Date.now()}, pago));
}
