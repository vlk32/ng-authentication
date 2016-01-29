import {OpaqueToken, provide} from 'angular2/core';
import Authentication from './authentication';
import Authorization from './authorization';

export const AUTHORIZATION_PROVIDERS = [Authentication, Authorization];