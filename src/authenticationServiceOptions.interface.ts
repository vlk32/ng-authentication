import {OpaqueToken, provide, Provider} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {UserIdentity} from './userIdentity';
import {AccessToken} from './accessToken';

/**
 * Authentication options token used for injecting into authentication service
 */
export const AUTHENTICATION_SERVICE_OPTIONS: OpaqueToken = new OpaqueToken("AuthenticationServiceOptions");

/**
 * Options for authentication service
 */
export interface AuthenticationServiceOptions
{
    /**
     * Method logs user into system
     * @param  {AccessToken} accessToken Access token holding authentication information
     * @returns Observable
     */
    login(accessToken: AccessToken): Observable<any>;
    
    /**
     * Gets indicatio whether current state of app is displaying login page
     * @returns boolean
     */
    isLoginPage(): boolean;

    /**
     * Methods logs out user out of system
     * @returns Observable
     */
    logout(): Observable<any>;

    /**
     * Gets information about user
     * @returns Observable
     */
    getUserIdentity(): Observable<UserIdentity>;

    /**
     * Redirects current page to authentication page
     */
    showAuthPage(): void;

    /**
     * Redirects current page to access denied page
     */
    showAccessDenied(): void;
}
