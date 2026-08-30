export async function request(path, options = {}){
  // Centralized wrapper: inject Authorization if session token exists
  const defaults = {method:'GET', headers: {'Content-Type':'application/json'}};
  const cfg = Object.assign({}, defaults, options);
  try{
    try{
      const raw = localStorage.getItem('mr_session');
      if(raw){
        const session = JSON.parse(raw);
        if(session && session.token){
          cfg.headers = Object.assign({}, cfg.headers, { Authorization: `Bearer ${session.token}` });
        }
      }
    }catch(e){ /* ignore parsing errors */ }
    const res = await fetch(path, cfg);
    const contentType = res.headers.get('content-type') || '';
    if(contentType.includes('application/json')) return await res.json();
    return await res.text();
  }catch(err){
    throw new Error('Network error');
  }
}
