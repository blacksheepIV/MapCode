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
            templateUrl:"./templates/LogIn/login.html"
        })
        .when('/verify', {
            templateUrl: "./templates/Registeration/2step_verification.html"
        })
        .when('/panel',{
            templateUrl:"./templates/Panel/userPanel.html"
        })
        .when('/advancedSearch',{
            templateUrl:"./templates/Panel/advancedSearch.html"
        })
        .when('/FriendsGroups',{
            templateUrl:"./templates/Panel/userPanelItems/FriendsGroups.html"
        })
        .otherwise({
            redirectTo:"/"
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
});
