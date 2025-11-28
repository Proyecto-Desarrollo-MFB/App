import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';


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

    loadComponent: () => 
      import('./destinos/buscar-ciudades/buscar-ciudades.component')
      .then(c => c.BuscarCiudadesComponent),
    

    canActivate: [authGuard, permissionGuard],
    

    data: {
      requiredPolicy: 'WishTrip.CitySearch', 
    },
  },
];