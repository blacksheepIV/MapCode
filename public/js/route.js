/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function ($routeProvider, $locationProvider,$httpProvider) {
    $routeProvider
        .when("/", {
            //templateUrl: "./templates/login.html"
             templateUrl: "./templates/Panel/home.html"
        })
        .when("/registration", {
            templateUrl: "./templates/Registeration/register.html"
        })
        .when("/login",{
            templateUrl:"./templates/login.html"
        })
        .when('/verify', {
            templateUrl: "./templates/Registeration/2step_verification.html"
        })
        .when('/panel',{
            templateUrl:"./templates/Panel/userPanel.html"
        })
        .otherwise({
            redirectTo:"/"
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
});
