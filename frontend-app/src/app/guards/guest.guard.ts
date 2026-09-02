import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';


export const guestGuard: CanActivateFn = () => {

  const router =
    inject(Router);


  const accessToken =
    localStorage.getItem(
      'accessToken'
    );


  // =========================================
  // No token
  // =========================================

  if (!accessToken) {

    return true;

  }


  // =========================================
  // Check token
  // =========================================

  try {

    const parts =
      accessToken.split('.');


    if (parts.length !== 3) {

      localStorage.removeItem(
        'accessToken'
      );

      return true;

    }


    const payload =
      JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );


    // =========================================
    // Token expired
    // =========================================

    if (
      payload.exp &&
      payload.exp * 1000 <= Date.now()
    ) {

      localStorage.removeItem(
        'accessToken'
      );

      localStorage.removeItem(
        'user'
      );

      return true;

    }


    // =========================================
    // Valid token
    // =========================================

    return router.parseUrl(
      '/dashboard'
    );

  }

  catch (error) {

    console.error(
      'Invalid access token:',
      error
    );


    localStorage.removeItem(
      'accessToken'
    );


    localStorage.removeItem(
      'user'
    );


    return true;

  }

};