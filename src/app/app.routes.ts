import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'simulation',
        loadComponent: () => import('./pages/simulation/simulation.page').then(m => m.SimulationPage)
      },
      {
        path: 'skill-lab',
        loadComponent: () => import('./pages/pm-skill-lab/pm-skill-lab.page').then(m => m.PmSkillLabPage)
      },
      {
        path: 'modes',
        loadComponent: () => import('./pages/modes/mode-list/mode-list.page').then(m => m.ModeListPage)
      },
      {
        path: 'modes/detail/:id',
        loadComponent: () => import('./pages/modes/mode-detail/mode-detail.page').then(m => m.ModeDetailPage)
      },
      {
        path: 'info',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Redirects voor backward compatibility (bijv. deeplinks)
  { path: 'dashboard', redirectTo: '/tabs/dashboard', pathMatch: 'full' },
  { path: 'simulation', redirectTo: '/tabs/simulation', pathMatch: 'full' },
  { path: 'pm-skill-lab', redirectTo: '/tabs/skill-lab', pathMatch: 'full' },
  { path: 'settings', redirectTo: '/tabs/info', pathMatch: 'full' },
  { path: 'modes/mode-list', redirectTo: '/tabs/modes', pathMatch: 'full' },
];
