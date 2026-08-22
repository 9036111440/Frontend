import { Routes } from '@angular/router';
import {
  adminGuard
} from './guards/admin.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login')
        .then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./register/register')
        .then(m => m.Register)
  },
{
  path: 'pricing',

  loadComponent: () =>
    import('./pricing/pricing')
      .then(
        m => m.Pricing
      )
},

  {
  path: 'dashboard',

  loadComponent: () =>
    import('./dashboard/dashboard')
      .then(
        m => m.Dashboard
      )
},
 {
    path: 'admin',

    canActivate: [
      adminGuard
    ],

    loadComponent: () =>
      import('./admin/admin')
        .then(m => m.Admin)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];