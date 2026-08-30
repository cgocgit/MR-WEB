export async function listOrdenes(){
  return Promise.resolve([
    {id:5001,cliente:'Cliente A',estatus:'Pendiente'},
  ]);
}

export async function getOrden(id){
  return Promise.resolve({id,cliente:'Cliente X',estatus:'En preparación'});
}
