export async function listCotizaciones(){
  return Promise.resolve([
    {id:9001,cliente:'Cliente A',total:150,estado:'Borrador'},
  ]);
}

export async function createCotizacion(payload){
  return Promise.resolve(Object.assign({id:Date.now(),estado:'Borrador'}, payload));
}
