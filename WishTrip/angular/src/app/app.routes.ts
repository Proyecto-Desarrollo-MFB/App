import { authGuard } from '@abp/ng.core'; 
import { Routes } from '@angular/router';
import { DetalleCiudadComponent } from './destinos/detalle-ciudad/detalle-ciudad';
import { PerfilUsuarioComponent } from './perfil/perfil-usuario/perfil-usuario';
import { UserSettingsComponent } from './settings/user-settings/user-settings';
import { BuscarCiudadesComponent } from './destinos/buscar-ciudades/buscar-ciudades.component';
import { MisFavoritosComponent } from './perfil/perfil-favoritos/perfil-favoritos';
import { PerfilReviewsComponent } from './perfil/perfil-reviews/perfil-reviews';
import { PerfilWishlistComponent } from './perfil/perfil-wishlist/perfil-wishlist';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(c => c.createRoutes()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(c => c.createRoutes()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule),
  },
  {
    path: 'buscar-ciudades',
    component: BuscarCiudadesComponent
  },
  { 
    path: 'destinos/detalle', 
    component: DetalleCiudadComponent 
  },
  {
    path: 'perfil/perfil-favoritos',
    component: MisFavoritosComponent
  },
  {
    path: 'perfil/perfil-reviews',
    component: PerfilReviewsComponent
  },
  {
    // --- ESTA RUTA TIENE QUE ESTAR ANTES DEL :username ---
    path: 'perfil/perfil-wishlist',
    component: PerfilWishlistComponent
  },
  { 
    // --- LA RUTA DINÁMICA QUEDA AL FINAL DE LOS PERFILES ---
    path: 'perfil/:username', 
    component: PerfilUsuarioComponent
  },
  {
    path: 'settings',
    component: UserSettingsComponent
  }
];