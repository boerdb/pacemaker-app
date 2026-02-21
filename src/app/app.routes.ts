import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing', // <--- HIER DE WIJZIGING (Was 'dashboard')
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.page').then( m => m.LandingPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  // ... hieronder staan je settings, simulation en mode-list routes, die laat je staan
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
  {
    path: 'pm-skill-lab',
    loadComponent: () => import('./pages/pm-skill-lab/pm-skill-lab.page').then( m => m.PmSkillLabPage)
  },
];
