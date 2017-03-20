import {NgModule, ModuleWithProviders, ClassProvider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthorizeDirective} from '../common/authorize.directive';
import {AUTHENTICATION_SERVICE_PROVIDER} from '../common/authentication.service';
import {AUTHENTICATION_SERVICE_OPTIONS, AuthenticationServiceOptions} from '../common/authenticationServiceOptions.interface';
import {AuthGuard} from '../common/auth.guard';

/**
 * Module for authorization 
 */
@NgModule(
{
    imports: [CommonModule],
    declarations: [AuthorizeDirective],
    exports: [AuthorizeDirective]
})
export class AuthorizationModule
{
    //######################### public methods #########################
    
    /**
     * Returns module with authentication services registered
     */
    public static forRoot<TAdditionalData>(authenticationServiceOptions: Type<AuthenticationServiceOptions<TAdditionalData>>): ModuleWithProviders 
    {
        return {
            ngModule: AuthorizationModule,
            providers: 
            [
                AUTHENTICATION_SERVICE_PROVIDER,
                AuthGuard,
                <ClassProvider>
                {
                    provide: AUTHENTICATION_SERVICE_OPTIONS,
                    useClass: authenticationServiceOptions
                }
            ]
        };
    }
}