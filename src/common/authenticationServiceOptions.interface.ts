import {OpaqueToken, ClassProvider, Type} from '@angular/core';
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
 * Creates provider for AuthenticationServiceOptions<TUserInfo>
 * @param  {Type<AuthenticationServiceOptions<TUserInfo>>} providerType Registered type that must implement AuthenticationServiceOptions<TUserInfo>
 * @returns ClassProvider
 */
export function provideAuthenticationServiceOptions<TUserInfo>(providerType: Type<AuthenticationServiceOptions<TUserInfo>>): ClassProvider
{
    return {
        provide: AUTHENTICATION_SERVICE_OPTIONS,
        useClass: providerType
    };
}