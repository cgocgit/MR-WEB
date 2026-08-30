// Mock intercambio CSV service
export async function validarArchivo(meta){ await new Promise(r=>setTimeout(r,100)); return {total:10,validos:8,rechazados:2,errores:[{fila:3,error:'Formato fecha'}]} }
export async function procesarImportacion(file){ await new Promise(r=>setTimeout(r,150)); return {status:'OK',referencia:Date.now()} }
export async function exportar(tipo){ await new Promise(r=>setTimeout(r,120)); return {url:'/downloads/'+tipo+'.csv'} }

export default { validarArchivo, procesarImportacion, exportar };
