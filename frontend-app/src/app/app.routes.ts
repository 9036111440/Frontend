import {
  Routes
} from '@angular/router';


import {
  adminGuard
} from './guards/admin.guard';

import {
  authGuard
} from './guards/auth.guard';

import {
  guestGuard
} from './guards/guest.guard';


export const routes: Routes = [

  // ==========================================
  // LOGIN
  // ==========================================

  {
    path: 'login',

    canActivate: [
      guestGuard
    ],

    loadComponent: () =>
      import('./login/login')
        .then(
          m => m.Login
        )
  },


  // ==========================================
  // REGISTER
  // ==========================================

  {
    path: 'register',

    canActivate: [
      guestGuard
    ],

    loadComponent: () =>
      import('./register/register')
        .then(
          m => m.Register
        )
  },


  // ==========================================
  // PRICING
  // ==========================================

  {
    path: 'pricing',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./pricing/pricing')
        .then(
          m => m.Pricing
        )
  },


  // ==========================================
  // DASHBOARD
  // ==========================================

  {
    path: 'dashboard',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./dashboard/dashboard')
        .then(
          m => m.Dashboard
        )
  },


  // ==========================================
  // ADMIN
  // ==========================================

  {
    path: 'admin',

    canActivate: [
      authGuard,
      adminGuard
    ],

    loadComponent: () =>
      import('./admin/admin')
        .then(
          m => m.Admin
        )
  },


  // ==========================================
  // DEFAULT
  // ==========================================

  {
    path: '',

    redirectTo:
      'login',

    pathMatch:
      'full'

  }

];