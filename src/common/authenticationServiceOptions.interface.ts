import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';
import {UserIdentity} from './userIdentity';
import {AccessToken} from './accessToken';

/**
 * Options for authentication service
 */
export interface AuthenticationServiceOptions<TUserInfo>
{
    /**
     * Method logs user into system
     * @param  {AccessToken} accessToken Access token holding authentication information
     * @returns Observable
     */
    login(accessToken: AccessToken): Observable<any>;
    
    /**
     * Gets indication whether current state of app is displaying auth page
     * @returns boolean
     */
    isAuthPage(): boolean;

    /**
     * Methods logs out user out of system
     * @returns Observable
     */
    logout(): Observable<any>;

    /**
     * Gets information about user
     * @returns Observable
     */
    getUserIdentity(): Observable<UserIdentity<TUserInfo>>;

    /**
     * Redirects current page to authentication page
     */
    showAuthPage(): void;

    /**
     * Redirects current page to access denied page
     */
    showAccessDenied(): void;
}

/**
 * Authentication options token used for injecting into authentication service
 */
export const AUTHENTICATION_SERVICE_OPTIONS: InjectionToken<AuthenticationServiceOptions<any>> = new InjectionToken<AuthenticationServiceOptions<any>>("AuthenticationServiceOptions");