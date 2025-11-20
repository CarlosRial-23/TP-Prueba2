import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard-guard'; // Importar guard

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
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones').then((c) => c.Publicaciones),
  },
  {
    path: 'publicacion/:id',
    loadComponent: () =>
      import('./pages/detalle-publicacion/detalle-publicacion').then(
        (c) => c.DetallePublicacion
      ),
  },

  {
    path: 'admin/usuarios',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin-usuarios/admin-usuarios').then(
        (c) => c.AdminUsuarios
      ),
  },
  {
    path: 'admin/estadisticas',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/estadisticas/estadisticas').then(
        (c) => c.Estadisticas
      ),
  },
];
