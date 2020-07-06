/**
 * This file is meant to be used as one centralized location to handle
 * the cookies for the client. That way the type can be managed and we can
 * keep track of which ones are available.
 */

import Cookies from 'js-cookie';

/**
 * Gets a particular cookie.
 *
 * @param {ClientCookies} cookieName the type of cookie to retrieve
 * @returns {string} the value of the cookie or an empty string if the cookie
 * wasn't set
 */
export function getCookie(cookieName: ClientCookies): string {
  const returnedCookie = Cookies.get(cookieName);
  if (returnedCookie) {
    return returnedCookie;
  }
  return '';
}

/**
 * The enum containing the different cookies that are managed by the client.
 */
export enum ClientCookies {
  fontSize = 'fontSize',
}

/**
 * Sets the specified cookie to the given value.
 *
 * @param {ClientCookies} name the type of cookie to set
 * @param {string} value the value to set to that cookie
 */
export function setCookie(name: ClientCookies, value: string): void {
  document.cookie = `${name}=${value}`;
}
