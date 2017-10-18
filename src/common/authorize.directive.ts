import {Directive, TemplateRef, ViewContainerRef, OnInit, Input, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {isString, isBoolean, isBlank} from '@anglr/common';
import {AuthenticationService} from './authentication.service';
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

    /**
     * Indication that AND condition should be used instead of OR condition if multiple permissions are provided
     */
    @Input("authorizeAndCondition")
    public andCondition: boolean = false;

    /**
     * Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
     */
    @Input("authorizeConditionString")
    public conditionString: boolean = false;
    
    //######################### constructor #########################
    constructor(private _template: TemplateRef<any>,
                private _viewContainer: ViewContainerRef,
                private _authService: AuthenticationService<any>,
                private _changeDetector: ChangeDetectorRef)
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

        if(!isBoolean(this.andCondition))
        {
            throw new Error("Parameter 'andCondition' must be boolean value!");
        }

        if(!isBoolean(this.conditionString))
        {
            throw new Error("Parameter 'conditionString' must be boolean value!");
        }

        if(isString(this.permission) && this.permission.indexOf(",") > -1)
        {
            this.permission = this.permission.split(",").map(itm => itm.trim());
        }

        this._authService
            .getUserIdentity()
            .then(userIdentity =>
            {
                this._renderIfPermission(userIdentity);
                this._changeDetector.detectChanges();
            });

        this._subscription = this._authService
            .authenticationChanged
            .subscribe(userIdentity =>
            {
                this._renderIfPermission(userIdentity);
                this._changeDetector.detectChanges();
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
    private _renderIfPermission(userIdentity: UserIdentity<any>)
    {
        if(!isString(this.permission) && !Array.isArray(this.permission))
        {
            throw new Error("Invalid argument type! Permission must be string or array of strings.");
        }

        if(userIdentity)
        {
            this._viewContainer.clear();
        
            //Multiple conditions
            if(Array.isArray(this.permission))
            {
                let arrayPermission: string[] = <string[]>this.permission;

                if(this.andCondition)
                {
                    //AND Condition
                    if(arrayPermission.map(perm => userIdentity.permissions.indexOf(perm) > -1).every(itm => itm === true))
                    {
                        this._viewContainer.createEmbeddedView(this._template);
                    }
                }
                else
                {
                    //OR Condition
                    if(arrayPermission.map(perm => userIdentity.permissions.indexOf(perm) > -1).indexOf(true) > -1)
                    {
                        this._viewContainer.createEmbeddedView(this._template);
                    }
                }
            }
            //Single condition
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