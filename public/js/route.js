/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function ( $locationProvider,$httpProvider,$stateProvider,$urlRouterProvider) {
    /* $routeProvider
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
            templateUrl: "./templates/Registeration/2Step_verification.html"
        })
        .when('/panel',{
            templateUrl:"./templates/Panel/userPanel.html"
        })
        .when('/advancedSearch',{
            templateUrl:"./templates/Panel/advancedSearch.html"
        })
        .otherwise({
            redirectTo:"/"
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor'); */
    /* #################################################################################################################### */
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home',{
            url: '/',
            templateUrl:"./templates/Panel/home.html"
        })
        .state('registration', {
                url:'/registration', templateUrl: "./templates/Registeration/register.html"
        })
        .state('login', {
            url:'/login', templateUrl:"./templates/LogIn/login.html"
        })
        .state('verify', {
            url:'/verify', templateUrl: "./templates/Registeration/2Step_verification.html"
        })
        .state('panel', {
            url:'/panel', templateUrl: "./templates/Panel/userPanel.html"
        })
        .state('advancedSearch', {
            url:'/advancedSearch', templateUrl: "./templates/Panel/advancedSearch.html"
        })
        .state('panel.edit', {
            url: '/editInfo',
            data: {
                'selectedTab': 0
            },
            views: {
                'edited': {
                    templateUrl: '../templates/Panel/userPanelItems/EditInfo.html',
                    controller: userCtrl
                }
            }
        })
        .state('panel.passChange', {
            url: '/passChange',
            data: {
                'selectedTab': 1
            },
            views: {
                'passChange': {
                    templateUrl: '../templates/Panel/userPanelItems/passChange.html',
                    controller: userCtrl
                }
            }
        })
        .state('panel.usrPoints', {
            url: '/usrPoints',
            data: {
                'selectedTab': 2
            },
            views: {
                'usrPoints': {
                    templateUrl: '../templates/Panel/userPanelItems/UsrPoints.html',
                    controller: userCtrl
                }
            }
        })
        .state('panel.usrPersonalPoints', {
            url: '/usrPersonalPoints',
            data: {
                'selectedTab': 3
            },
            views: {
                'usrPersonalPoints': {
                    templateUrl: '../templates/Panel/userPanelItems/usrPersonalPoints.html',
                    controller: userCtrl
                }
            }
        })
        .state('panel.friends', {
            url: '/friends',
            data: {
                'selectedTab': 4
            },
            views: {
                'friends': {
                    templateUrl: '../templates/Panel/userPanelItems/FriendStuff/friendsList.html',
                    controller: userCtrl
                }
            }
        })
        .state('panel.messages', {
            url: '/messages',
            data: {
                'selectedTab': 5
            },
            views: {
                'messages': {
                    templateUrl: '../templates/Panel/userPanelItems/messages.html',
                    controller: userCtrl
                }
            }
        });
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
});
