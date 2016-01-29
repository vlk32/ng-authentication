import {Observable} from 'rxjs/Observable';
import {OpaqueToken} from 'angular2/core';

/**
 * 
 */
export const AUTHENTICATION_SERVICE: OpaqueToken = new OpaqueToken("AuthenticationService");

/**
 * 
 */
export interface IUserData
{
    
}

/**
 * Service used for authentication management
 */
export interface IAuthenticationService
{
    /**
     * Authenticates user against server and returns response with user data 
     * @param  {string} login User login for authentication
     * @param  {string} password User password for authentication
     * @returns Observable
     */
    authenticate(login: string, password: string): Observable<IUserData>;
    
    //TODO
    getPermissions():any;
}