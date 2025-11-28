import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
// No necesitas importar el componente arriba si usas Lazy Loading (recomendado)

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
  // --- AQUI ESTA EL CAMBIO ---
  {
    path: 'buscar-ciudades',
    // 1. Lazy Loading: Carga el componente solo cuando se visita (Mejor rendimiento)
    loadComponent: () => 
      import('./destinos/buscar-ciudades/buscar-ciudades.component')
      .then(c => c.BuscarCiudadesComponent),
    
    // 2. Seguridad: Cumple el requisito de "Autenticación" y "Autorización" del TP 
    canActivate: [authGuard, permissionGuard],
    
    // 3. Permisos: Define qué permiso específico del Backend se necesita
    data: {
      requiredPolicy: 'TravelTracker.Destinations', // <--- OJO: Revisa el nombre exacto en tu API
    },
  },
];