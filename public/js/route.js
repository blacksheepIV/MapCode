/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            //templateUrl: "./templates/login.html"
             templateUrl: "./templates/Panel/home.html"
        })
        .when("/registration", {
            templateUrl: "./templates/Registeration/register.html"
        })
        .when('/verify', {
            templateUrl: "./templates/Registeration/2step_verification.html"
        })
        .otherwise({
            template: "<h2>oh oh!Nothing went Right!!!</h2>"
        });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});
