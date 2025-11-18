import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((c) => c.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((c) => c.Registro),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then((c) => c.Perfil),
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((c) => c.Publicaciones),
  },
  {
    path: 'publicacion/:id',
    loadComponent: () => import('./pages/detalle-publicacion/detalle-publicacion').then(c => c.DetallePublicacion),
  },
  ];