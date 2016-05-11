import {Directive, TemplateRef, ViewContainerRef, OnInit} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Directive(
{
    selector: "[authenticationInitialized]"
})
export class AuthenticationInitializedDirective implements OnInit
{
    //######################### private fields #########################
    
    /**
     * Indication whether was this component initialized
     */
    private _isInitialized: boolean = false;
    
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
        this._authService
            .getUserIdentity(true);
        
        this._authService
            .isInitialized
            .then(initialized =>
            {
                if(this._isInitialized)
                {
                    return;
                }
                
                this._isInitialized = true;
                this._viewContainer.createEmbeddedView(this._template);
            });
    }
}