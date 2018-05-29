# Changelog

## Version 5.0.1
 - updated regular expression for `conditionString` for `AuthorizeDirective`, now should support `!` statements

## Version 5.0.0
 - stabilized for angular v6

## Version 5.0.0-beta.2
 - `@anglr/authentication` is now marked as *sideEffects* free
 - removed `forRoot` methods from `AuthorizationModule`
 - guard `AuthGuard` is now *tree-shakeable*
 - provider `AUTHENTICATION_SERVICE_OPTIONS` must be provided explictly
 - provider `AuthenticationService` is now *tree-shakeable*

## Version 5.0.0-beta.1
 - aktualizácia balíčkov `Angular` na `6`
 - aktualizácia `Webpack` na verziu `4`
 - aktualizácia `rxjs` na verziu `6`
 - automatické generovanie dokumentácie

## Version 4.0.5
 - `AuthorizeDirective` now supports condition expressions if `conditionString` is set to true

## Version 4.0.4
 - `AuthInterceptor` now handles also `isAuthenticated` rejection

## Version 4.0.3
 - moved `AuthInterceptor` from `@anglr/http-extensions`
 - `AuthInterceptor` now using `HttpRequestIgnoredInterceptorId`

## Version 4.0.2
 - returned typescript version back to 2.4.2 and removed distJit

## Version 4.0.1
 - added compiled outputs for Angular JIT

## Version 4.0.0
 - updated angular to 5.0.0 (final)
 - changed dependencies of project to peerDependencies
 - more strict compilation
 - updated usage of rxjs, now using operators

## Version 4.0.0-beta.0
 - updated angular to >=5.0.0-rc.7