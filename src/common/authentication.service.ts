import {FactoryProvider} from '@angular/core';
import {isFunction, isArray, isBlank} from '@anglr/common';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';
import {catchError} from 'rxjs/operators';
import {empty} from 'rxjs/observable/empty';

import {UserIdentity} from './userIdentity';
import {AuthenticationServiceOptions, AUTHENTICATION_SERVICE_OPTIONS} from './authenticationServiceOptions.interface';
import {AccessToken} from './accessToken';

/**
 * Authentication service managing authentication
 */
export class AuthenticationService<TUserInfo>
{
    //######################### private fields #########################

    /**
     * Authentication promise that was used for authentication
     */
    private _authenticationPromise: Promise<UserIdentity<TUserInfo>>|null;

    /**
     * Resolved function for isInitialized
     */
    private _isInitializedResolver: (indication: boolean) => void;

    /**
     * Subject used for indicating authenticationChanged
     */
    private _authenticationChangedSubject: Subject<UserIdentity<TUserInfo>> = new Subject<UserIdentity<TUserInfo>>();

    //######################### public properties #########################

    /**
     * Indication whether is authentication module initialized or not
     */
    public isInitialized: Promise<boolean>;

    /**
     * Gets observable that indicates when authentication has changed
     */
    public get authenticationChanged(): Observable<UserIdentity<TUserInfo>>
    {
        return this._authenticationChangedSubject.asObservable();
    }

    //######################### constructor #########################
    constructor(private _options: AuthenticationServiceOptions<TUserInfo>)
    {
        this.isInitialized = new Promise(resolve => this._isInitializedResolver = resolve);
    }

    //######################### public methods #########################

    /**
     * Tests whether is used authorized for specified permission
     * @param  {string} permission Permission name that is tested
     * @returns Promise<boolean> True if user is authorized otherwise false
     */
    public isAuthorized(permission: string) : Promise<boolean>
    {
        return new Promise((resolve, reject) =>
        {
            this.getUserIdentity()
                .then((userIdentity: UserIdentity<TUserInfo>) =>
                {
                    if(isArray(userIdentity.permissions))
                    {
                        if(userIdentity.permissions.indexOf(permission) > -1)
                        {
                            resolve(true);
                        }
                        else
                        {
                            resolve(false);
                        }
                    }
                    else
                    {
                        resolve(false);
                    }
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Gets user identity
     * @param  {boolean} refresh? Indication that server get user identity should be called, otherwise cached response will be used
     * @returns Promise
     */
    public getUserIdentity(refresh?: boolean): Promise<UserIdentity<TUserInfo>>
    {
        if(refresh === true)
        {
            this._authenticationPromise = null;
        }

        if(this._authenticationPromise != null)
        {
            return this._authenticationPromise;
        }

        this._authenticationPromise = new Promise((success, reject) =>
        {
            this._options
                .getUserIdentity()
                .pipe(catchError(error =>
                      {
                          reject(error);
                          this._isInitializedResolver(true);
  
                          return empty<UserIdentity<TUserInfo>>();
                      }))
                .subscribe((itm: UserIdentity<TUserInfo>) =>
                {
                    success(itm);
                    this._authenticationChangedSubject.next(itm);
                    this._isInitializedResolver(true);
                });
        });

        return this._authenticationPromise;
    }

    /**
     * Method logs user into system
     * @param  {AccessToken} accessToken Access token holding authentication information
     * @returns Observable
     */
    public login(accessToken: AccessToken): Observable<any>
    {
        return Observable.create((observer: Observer<any>) =>
        {
            this._options.login(accessToken)
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(() =>
                        {
                            observer.next(null);
                        });
                }, error =>
                {
                    observer.error(error);
                });
        });
    }

    /**
     * Methods logs out user out of system
     * @returns Observable
     */
    public logout(): Observable<any>
    {
        return Observable.create((observer: Observer<any>) =>
        {
            this._options.logout()
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(() =>
                        {
                            observer.next(null);
                        });
                }, error =>
                {
                    observer.error(error);
                });
        });
    }

    /**
     * Redirects current page to authentication page
     */
    public showAuthPage(): void
    {
        this._options.showAuthPage();
    }

    /**
     * Redirects current page to access denied page
     */
    public showAccessDenied(): void
    {
        this._options.showAccessDenied();
    }

    /**
     * Gets indicatio whether current state of app is displaying login page
     * @returns boolean
     */
    public isAuthPage(): boolean
    {
        return this._options.isAuthPage();
    }
}

/**
 * Factory used for creating AuthenticationService
 * @param options Options passed to created service
 */
export function authenticationServiceFactory(options: AuthenticationServiceOptions<any>)
{
    if(isBlank(options) ||
       isBlank(options.getUserIdentity) || !isFunction(options.getUserIdentity) ||
       isBlank(options.login) || !isFunction(options.login) ||
       isBlank(options.logout) || !isFunction(options.logout) ||
       isBlank(options.isAuthPage) || !isFunction(options.isAuthPage) ||
       isBlank(options.showAccessDenied) || !isFunction(options.showAccessDenied) ||
       isBlank(options.showAuthPage) || !isFunction(options.showAuthPage))
    {
        throw new Error("Options must be set and must implement AuthenticationServiceOptions");
    }

    return new AuthenticationService(options);
}

/**
 * Provider used for injecting authentication service
 */
export const AUTHENTICATION_SERVICE_PROVIDER: FactoryProvider =
{ 
    provide: AuthenticationService,
    useFactory: authenticationServiceFactory,
    deps: [AUTHENTICATION_SERVICE_OPTIONS]
};