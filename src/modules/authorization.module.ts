import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthorizeDirective} from '../common/authorize.directive';

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
}