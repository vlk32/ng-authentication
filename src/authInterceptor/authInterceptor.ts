import {FactoryProvider, InjectionToken, Injector} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler} from '@angular/common/http';
import {isBlank, isFunction, IgnoredInterceptorsService, HttpRequestIgnoredInterceptorId} from '@anglr/common';
import {Observable, ObservableInput, Observer} from 'rxjs';
import {catchError} from 'rxjs/operators';

/**
 * Configuration object that is used by AuthInterceptor, overriding its properties allows you to customize configuration
 */
export abstract class AuthInterceptorConfig
{
    /**
     * Gets indication whether is user authenticated or not
     * @returns boolean
     */
    abstract isAuthenticated(): Promise<boolean>;

    /**
     * Gets indication whether request was done from authentication page
     * @returns boolean
     */
    abstract isAuthPage(): boolean;

    /**
     * Redirects current page to authentication page
     */
    abstract showAuthPage(): void;

    /**
     * Redirects current page to access denied page
     */
    abstract showAccessDenied(): void;
}

/**
 * Token used for injecting custom configuration for AuthInterceptor
 */
export const AUTH_INTERCEPTOR_CONFIG: InjectionToken<AuthInterceptorConfig>  = new InjectionToken<AuthInterceptorConfig>("auth-interceptor-config");

/**
 * AuthInterceptor used for intercepting http responses and handling 401, 403 statuses
 */
export class AuthInterceptor implements HttpInterceptor
{
    //######################### constructors #########################
    constructor(private _config: AuthInterceptorConfig,
                private _ignoredInterceptorsService: IgnoredInterceptorsService)
    {
    }

    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param {HttpRequestIgnoredInterceptorId<any>} req Request to be intercepted
     * @param {HttpHandler} next Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequestIgnoredInterceptorId<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        return next.handle(req).pipe(catchError((err) =>
        {
            return Observable.create((observer: Observer<any>) =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    (this._ignoredInterceptorsService && this._ignoredInterceptorsService.isIgnored(AuthInterceptor, req)))
                {
                    observer.error(err);
                    observer.complete();

                    return;
                }

                //if auth error
                if(err.status == 403 || err.status == 401)
                {
                    //auth error from auth page
                    if(this._config.isAuthPage())
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    //auth error from other pages
                    this._config.isAuthenticated()
                        .then(isAuthenticated =>
                        {
                            //access denied user authenticated, not authorized
                            if(isAuthenticated)
                            {
                                this._config.showAccessDenied();

                                observer.complete();

                                return;
                            }

                            //show auth page, user not authenticated
                            this._config.showAuthPage();

                            observer.complete();

                            return;
                        })
                        .catch(() => observer.complete());

                    return;
                }

                //other errors
                observer.error(err);
                observer.complete();
            }) as ObservableInput<HttpEvent<any>>;
        }));
    }
}

/**
 * Factory used for creating auth interceptor
 * @param {AuthInterceptorConfig} config Configuration for auth interceptor
 */
export function authInterceptorProviderFactory(config: AuthInterceptorConfig, injector: Injector)
{
    if(isBlank(config) ||
       isBlank(config.isAuthenticated) || !isFunction(config.isAuthenticated) ||
       isBlank(config.isAuthPage) || !isFunction(config.isAuthPage) ||
       isBlank(config.showAccessDenied) || !isFunction(config.showAccessDenied) ||
       isBlank(config.showAuthPage) || !isFunction(config.showAuthPage))
    {
        throw new Error("Provided configuration for 'AuthInterceptor' is not of type 'AutInterceptorConfig', you must provide one!");
    }

    return new AuthInterceptor(config, injector.get(IgnoredInterceptorsService));
};

/**
 * Provider for proper use of AuthInterceptor, use this provider to inject this interceptor
 */
export const AUTH_INTERCEPTOR_PROVIDER: FactoryProvider =
{
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useFactory: authInterceptorProviderFactory,
    deps: [AUTH_INTERCEPTOR_CONFIG, Injector]
};