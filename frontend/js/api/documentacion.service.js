// Mock documentacion service
export async function listDocumentos(){ await new Promise(r=>setTimeout(r,80)); return [{id:1,nombre:'Manual Técnico',version:'1.0',fecha:'2026-08-01',url:'/docs/manual-v1.pdf'}] }
export async function getDocumento(id){ await new Promise(r=>setTimeout(r,60)); return {id,nombre:'Manual Técnico',version:'1.0',fecha:'2026-08-01',url:'/docs/manual-v1.pdf'} }

export default { listDocumentos, getDocumento };
