import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  const user = authService.currentUser();

  if (user && user.perfil === 'administrador') {
    return true;
  }

  router.navigate(['/publicaciones']);
  return false;
};
