import {Directive, TemplateRef, ViewContainerRef, OnInit, Input, OnDestroy} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {isBlank, isArray} from '@angular/core/src/facade/lang';
import {UserIdentity} from './userIdentity';
import {Subscription} from 'rxjs/Subscription';

@Directive(
{
    selector: "[authorize]"
})
export class AuthorizeDirective implements OnInit, OnDestroy
{
    //######################### private fields #########################

    /**
     * Subscription for changes in authentication
     */
    private _subscription: Subscription = null;

    //######################### public properties - inputs #########################

    /**
     * Name of permission that is requested for displaying element
     */
    @Input("authorize")
    public permission: string | string[];
    
    //######################### constructor #########################
    constructor(private _template: TemplateRef<any>,
                private _viewContainer: ViewContainerRef,
                private _authService: AuthenticationService)
    {
    }

    //######################### public methods - implementation of OnInit #########################

    /**
     * Initialize component
     */
    public ngOnInit()
    {
        if(isBlank(this.permission))
        {
            throw new Error("You must specify 'authorize' attribute value.");
        }

        this._authService
            .getUserIdentity()
            .then(userIdentity =>
            {
                this._renderIfPermission(userIdentity);
            });

        this._subscription = this._authService
            .authenticationChanged
            .subscribe(userIdentity =>
            {
                this._renderIfPermission(userIdentity);
            }, err => {});
    }
    
    //######################### public methods - implementation of OnDestroy #########################
    
    /**
     * Called when component is destroyed
     */
    public ngOnDestroy()
    {
        if(this._subscription)
        {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }

    //######################### private methods #########################

    /**
     * Renders content if user has permissions
     */
    private _renderIfPermission(userIdentity: UserIdentity)
    {
        if(userIdentity)
        {
            this._viewContainer.clear();
        
            if(isArray(this.permission))
            {
                let arrayPermission: string[] = <string[]>this.permission;

                if(arrayPermission.map(perm => userIdentity.permissions.indexOf(perm) > -1).indexOf(true) > -1)
                {
                    this._viewContainer.createEmbeddedView(this._template);
                }
            }
            else
            {
                let stringPermission: string = <string>this.permission;

                if(userIdentity.permissions.indexOf(stringPermission) > -1)
                {
                    this._viewContainer.createEmbeddedView(this._template);
                }
            }
        }
    }
}