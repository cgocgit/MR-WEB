export async function listAsignadas(usuario){
  return Promise.resolve([
    {id:7001,orden:5001,fase:'Salida',direccion:'Evento A'}
  ]);
}

export async function actualizarFase(ordenId,fase){
  return Promise.resolve({ordenId,fase,ok:true});
}
