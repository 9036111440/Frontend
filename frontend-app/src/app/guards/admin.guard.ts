import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';


export const adminGuard: CanActivateFn = () => {

  const router =
    inject(Router);


  const userJson =
    localStorage.getItem('user');


  if (!userJson) {

    return router.parseUrl('/login');

  }


  try {

    const user =
      JSON.parse(userJson);


    if (user.role === 'admin') {

      return true;

    }

  } catch (error) {

    console.error(
      'Invalid user data:',
      error
    );

  }


  return router.parseUrl('/dashboard');

};