// Mock configuracion service
export async function listReglas(){
  await new Promise(r=>setTimeout(r,90));
  return [ {id:'precios',nombre:'Listas de precios',valor:'v1'}, {id:'abc',nombre:'Clasificación ABC',valor:'habilitado'} ];
}

export async function getRegla(id){ await new Promise(r=>setTimeout(r,60)); return {id,nombre:id,valor:'valor'} }

export default { listReglas, getRegla };
