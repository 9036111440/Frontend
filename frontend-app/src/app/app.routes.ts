import { Routes } from '@angular/router';

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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];