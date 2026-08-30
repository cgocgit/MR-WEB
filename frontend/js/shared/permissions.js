export function hasAnyRole(session, allowedRoles){
  if(!session || !session.user) return false;
  const roles = session.user.roles || [];
  return allowedRoles.some(r=> roles.includes(r));
}

export function hasPermission(session, permission){
  if(!session) return false;
  const perms = session.permissions || [];
  if(!permission) return false;
  // support wildcard suffix like 'clientes.*'
  if(perms.includes(permission)) return true;
  const parts = permission.split('.');
  const wildcard = parts[0] + '.*';
  return perms.includes(wildcard);
}
