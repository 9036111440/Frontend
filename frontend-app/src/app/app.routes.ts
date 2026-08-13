import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'register',
    loadComponent: () =>
      import('./register/register')
        .then(m => m.Register)
  },

  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  }

];