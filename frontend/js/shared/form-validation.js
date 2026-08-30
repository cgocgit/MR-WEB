export function validateRequired(formData, fields){
  const errors = {};
  fields.forEach(f=>{ if(!formData.get(f) || String(formData.get(f)).trim()==='') errors[f]='Requerido'; });
  return errors;
}
