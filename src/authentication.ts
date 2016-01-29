import {Injectable, Inject} from 'angular2/core';
import {AUTHENTICATION_SERVICE, IAuthenticationService} from './core';

@Injectable()
export default class Authentication
{
    constructor(@Inject(AUTHENTICATION_SERVICE) private _authService: IAuthenticationService)
    {
    }
}