import {Directive, TemplateRef, ViewContainerRef, OnInit, Input, OnDestroy} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {isBlank} from '@angular/core/src/facade/lang';
import {Subscription} from 'rxjs/Subscription';

@Directive(
{
    selector: "[authenticate]"
})
export class AuthenticateDirective implements OnInit, OnDestroy
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
    @Input("authenticate")
    public permission: string;
    
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
            throw new Error("You must specify 'authenticate' attribute value.");
        }

        this._authService
            .getUserIdentity()
            .then(userIdentity =>
            {
                if(userIdentity)
                {
                    this._viewContainer.clear();
                
                    if(userIdentity.permissions.indexOf(this.permission) > -1)
                    {
                        this._viewContainer.createEmbeddedView(this._template);
                    }
                }
            });

        this._subscription = this._authService
            .authenticationChanged
            .subscribe(userIdentity =>
            {
                if(userIdentity)
                {
                    this._viewContainer.clear();
                
                    if(userIdentity.permissions.indexOf(this.permission) > -1)
                    {
                        this._viewContainer.createEmbeddedView(this._template);
                    }
                }
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
}