import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';


export const authGuard: CanActivateFn = () => {

  const router =
    inject(Router);


  const accessToken =
    localStorage.getItem(
      'accessToken'
    );


  // =========================================
  // No access token
  // =========================================

  if (!accessToken) {

    return router.parseUrl(
      '/login'
    );

  }


  // =========================================
  // Check JWT structure
  // =========================================

  try {

    const parts =
      accessToken.split('.');


    if (parts.length !== 3) {

      localStorage.removeItem(
        'accessToken'
      );

      return router.parseUrl(
        '/login'
      );

    }


    // =========================================
    // Decode JWT payload
    // =========================================

    const payload =
      JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );


    // =========================================
    // Check expiration
    // =========================================

    if (
      payload.exp &&
      payload.exp * 1000 <= Date.now()
    ) {

      console.warn(
        'Access token expired'
      );


      localStorage.removeItem(
        'accessToken'
      );


      localStorage.removeItem(
        'user'
      );


      return router.parseUrl(
        '/login'
      );

    }


    // =========================================
    // Token is available and not expired
    // =========================================

    return true;

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


    return router.parseUrl(
      '/login'
    );

  }

};