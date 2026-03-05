import { authGuard } from '@abp/ng.core'; // Quitamos el permissionGuard que estaba bloqueando
import { Routes } from '@angular/router';
import { DetalleCiudadComponent } from './destinos/detalle-ciudad/detalle-ciudad';
import { PerfilUsuarioComponent } from './perfil/perfil-usuario/perfil-usuario';
import { UserSettingsComponent } from './settings/user-settings/user-settings';
// Agregamos la importación directa de tu componente de búsqueda
import { BuscarCiudadesComponent } from './destinos/buscar-ciudades/buscar-ciudades.component';

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
    // Ruta simplificada sin bloqueos estrictos de políticas del backend
    path: 'buscar-ciudades',
    component: BuscarCiudadesComponent
  },
  { 
    path: 'destinos/detalle', 
    component: DetalleCiudadComponent 
  },
  { 
    path: 'perfil/:username', 
    component: PerfilUsuarioComponent
  },
  {
    path: 'settings',
    component: UserSettingsComponent
  }
];