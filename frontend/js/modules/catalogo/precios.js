import {
  requireAuth
} from '../../shared/auth-guard.js';

import {
  renderNavegacionCatalogo
} from './catalogo-ui.js';

export function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();
}