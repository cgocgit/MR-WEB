// Preserve existing helper
export function getFriendlyError(err){
  if(!err) return 'Error desconocido';
  if(err.message) return err.message;
  return String(err);
}

// Global error handler to filter noisy injected/extension errors (e.g., VM###, third-party devtools)
function isInjectedErrorEvent(ev){
  try{
    const msg = (ev && ev.message) || '';
    const filename = (ev && ev.filename) || '';
    const stack = (ev && ev.error && ev.error.stack) || '';
    if(!msg && !stack && !filename) return false;
    if(msg.includes('startTime')) return true;
    if(stack.includes('reportAllChanges')) return true;
    if(/^VM\d+/.test(filename)) return true;
  }catch(e){ /* ignore */ }
  return false;
}

window.addEventListener('error', function(ev){
  try{
    if(isInjectedErrorEvent(ev)){
      // quiet noisy injected errors that are out-of-process (extensions, devtools)
      console.info('Ignored injected script error:', ev.message || ev.filename || ev.error);
      ev.preventDefault();
      return;
    }
  }catch(e){ /* fallthrough */ }
  // let other errors surface normally
}, true);

window.addEventListener('unhandledrejection', function(ev){
  try{
    const reason = ev && ev.reason;
    const msg = reason && (reason.message || String(reason)) || '';
    const stack = reason && reason.stack || '';
    if(msg.includes('startTime') || stack.includes('reportAllChanges')){
      console.info('Ignored injected unhandledrejection:', msg || stack);
      ev.preventDefault();
      return;
    }
  }catch(e){}
}, true);
