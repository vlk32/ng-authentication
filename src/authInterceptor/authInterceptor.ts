import {FactoryProvider, InjectionToken, Injector} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler} from '@angular/common/http';
import {isBlank} from '@jscrpt/common';
import {IgnoredInterceptorsService, HttpRequestIgnoredInterceptorId} from '@anglr/common';
import {Observable, ObservableInput, Observer} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

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
    abstract showAuthPage(): Promise<boolean>;

    /**
     * Redirects current page to access denied page
     */
    abstract showAccessDenied(): Promise<boolean>;
}

/**
 * Token used for injecting custom configuration for AuthInterceptor
 */
export const AUTH_INTERCEPTOR_CONFIG: InjectionToken<AuthInterceptorConfig> = new InjectionToken<AuthInterceptorConfig>("auth-interceptor-config");

/**
 * AuthInterceptor used for intercepting http responses and handling 401, 403 statuses
 */
export class AuthInterceptor implements HttpInterceptor
{
    //######################### private fields #########################

    /**
     * Counter for requests in progress
     */
    private _requestsInProgress: number = 0;

    /**
     * Indication whether is handling of 401, 403 blocked because one request is already handled
     */
    private _blocked: boolean = false;

    //######################### private properties #########################

    /**
     * Counter for requests in progress
     */
    private get requestsInProgress(): number
    {
        return this._requestsInProgress;
    }
    private set requestsInProgress(value: number)
    {
        this._requestsInProgress = value;

        if(value < 1)
        {
            this._blocked = false;
            this._requestsInProgress = 0;
        }
    }

    //######################### constructors #########################
    constructor(private _config: AuthInterceptorConfig,
                private _ignoredInterceptorsService: IgnoredInterceptorsService)
    {
    }

    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param req - Request to be intercepted
     * @param next - Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequestIgnoredInterceptorId<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        this.requestsInProgress++;

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
                    if(this._blocked)
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    this._blocked = true;

                    //auth error from auth page
                    if(this._config.isAuthPage())
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    //auth error from other pages
                    this._config.isAuthenticated()
                        .then(async isAuthenticated =>
                        {
                            //access denied user authenticated, not authorized
                            if(isAuthenticated)
                            {
                                await this._config.showAccessDenied();

                                observer.complete();

                                return;
                            }

                            //show auth page, user not authenticated
                            await this._config.showAuthPage();

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
        }),
        tap(() => this.requestsInProgress--, () => this.requestsInProgress--));
    }
}

/**
 * Factory used for creating auth interceptor
 * @param config - Configuration for auth interceptor
 */
export function authInterceptorProviderFactory(config: AuthInterceptorConfig, injector: Injector)
{
    if(isBlank(config) || !(config instanceof AuthInterceptorConfig))
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