export function getSession(){
  try{ return JSON.parse(localStorage.getItem('mr_session')) }catch(e){return null}
}

export function requireAuth(){
  const s = getSession();
  if(!s){ location.hash = '#/login'; return false }
  return true;
}

export function requireRole(allowedRoles){
  const s = getSession();
  if(!s || !s.user) { location.hash = '#/login'; return false }
  const roles = s.user.roles || [];
  return allowedRoles.some(r=> roles.includes(r));
}
