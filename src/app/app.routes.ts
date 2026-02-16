import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // <--- HIER ZAT HET PROBLEEM (was 'home')
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'simulation',
    loadComponent: () => import('./pages/simulation/simulation.page').then( m => m.SimulationPage)
  },
  {
    path: 'modes/mode-list',
    loadComponent: () => import('./pages/modes/mode-list/mode-list.page').then( m => m.ModeListPage)
  },
  {
    path: 'modes/mode-detail/:id',
    loadComponent: () => import('./pages/modes/mode-detail/mode-detail.page').then( m => m.ModeDetailPage)
  },
];
