import {Injectable, Inject, OpaqueToken, provide, Provider} from 'angular2/core';
import {UserIdentity} from './userIdentity';
import {AuthenticationServiceOptions, AUTHENTICATION_SERVICE_OPTIONS} from './authenticationServiceOptions.interface';
import {AccessToken} from './accessToken';
import {isBlank, isFunction, isPresent} from 'angular2/src/facade/lang';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

/**
 * Instance of created authentication service
 */
var authenticationServiceObj: AuthenticationService = null;

/**
 * Authentication service managing authentication
 */
@Injectable()
export class AuthenticationService
{
    //######################### private fields #########################

    /**
     * Authentication promise that was used for authentication
     */
    private _authenticationPromise: Promise<UserIdentity>;

    /**
     * Resolved function for isInitialized
     */
    private _isInitializedResolver: (indication: boolean) => void;

    /**
     * Subject used for indicating authenticationChanged
     */
    private _authenticationChangedSubject: Subject<UserIdentity> = new Subject();

    //######################### public properties #########################

    /**
     * Indication whether is authentication module initialized or not
     */
    public isInitialized: Promise<boolean>;

    /**
     * Gets observable that indicates when authentication has changed
     */
    public get authenticationChanged(): Observable<UserIdentity>
    {
        return this._authenticationChangedSubject.asObservable();
    }

    //######################### constructor #########################
    constructor(private _options: AuthenticationServiceOptions)
    {
        this.isInitialized = new Promise(resolve => this._isInitializedResolver = resolve);
    }

    //######################### public methods #########################

    /**
     * Gets user identity
     * @param  {boolean} refresh? Indication that server get user identity should be called, otherwise cached response will be used
     * @returns Promise
     */
    public getUserIdentity(refresh?: boolean): Promise<UserIdentity>
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
                .catch(error =>
                {
                    reject(error);
                    this._isInitializedResolver(true);
                    
                    return Observable.empty();
                })
                .subscribe(itm =>
                {
                    success(itm);
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
                .subscribe(result =>
                {
                    this.getUserIdentity(true)
                        .then(userIdentity =>
                        {
                            this._authenticationChangedSubject.next(userIdentity);
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
                .subscribe(result =>
                {
                    this.getUserIdentity(true)
                        .then(userIdentity =>
                        {
                            this._authenticationChangedSubject.next(userIdentity);
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
    public isLoginPage(): boolean
    {
        return this._options.isLoginPage();
    }
}

/**
 * Provider used for injecting authentication service
 */
export const AUTHENTICATION_SERVICE_PROVIDER = provide(AuthenticationService,
                                               {
                                                   useFactory: (options: AuthenticationServiceOptions) =>
                                                   {
                                                       if(isBlank(options) ||
                                                          isBlank(options.getUserIdentity) || !isFunction(options.getUserIdentity) ||
                                                          isBlank(options.login) || !isFunction(options.login) ||
                                                          isBlank(options.logout) || !isFunction(options.logout) ||
                                                          isBlank(options.isLoginPage) || !isFunction(options.isLoginPage) ||
                                                          isBlank(options.showAccessDenied) || !isFunction(options.showAccessDenied) ||
                                                          isBlank(options.showAuthPage) || !isFunction(options.showAuthPage))
                                                       {
                                                           throw new Error("Options must be set and must implement AuthenticationServiceOptions");
                                                       }

                                                       authenticationServiceObj = new AuthenticationService(options);

                                                       return authenticationServiceObj;
                                                   },
                                                   deps: [AUTHENTICATION_SERVICE_OPTIONS]
                                               });

/**
 * Used for authentication of component
 * @param  {string} permission Name of requested permission, that is used for displaying of component
 * @returns ClassDecorator
 */
export function Authenticate(permission: string): ClassDecorator
{
    return function <TFunction extends Function> (target: TFunction): TFunction
    {
        var component: any = target;
        var originalOnInit = () => {};

        if(isPresent(component.prototype.ngOnInit))
        {
            originalOnInit = component.prototype.ngOnInit;
        }
        
        component.prototype.ngOnInit = function()
        {
            if(isBlank(authenticationServiceObj))
            {
                throw new Error("Authentication service was not initialized before first use.");
            }
            
            authenticationServiceObj
                .getUserIdentity()
                .catch(error =>
                {
                    console.error("Unexpected error in Authenticate!");
                })
                .then(userData =>
                {
                    if(userData.permissions.indexOf(permission) < 0 && userData.isAuthenticated)
                    {
                        authenticationServiceObj.showAccessDenied();
                        
                        return;
                    }
                    else if(userData.permissions.indexOf(permission) < 0 && !userData.isAuthenticated && !authenticationServiceObj.isLoginPage())
                    {
                        authenticationServiceObj.showAuthPage();
                        
                        return;
                    }
                    
                    originalOnInit.call(this);
                });
        };
        
        return target;
    };
}