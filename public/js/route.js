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
            url:'/verify', templateUrl: "../templates/Registeration/2Step_verification.html"
        })
        .state('panel', {
            url:'/panel', templateUrl: "../templates/Panel/userPanel.html"
        })
        .state('advancedSearch', {
            url:'/advancedSearch', templateUrl: "../templates/Panel/advancedSearch.html"
        })
        .state('home.mainTheme', {
            url: 'main',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/mainView.html',
                    controller: mainViewCtrl
                }
            }
        })
        .state('home.showMap', {
            url: 'map',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/map.html',
                    controller: mapPointCtrl
                }
            }
        })
        .state('home.aboutUs', {
            url: 'aboutUS',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/aboutUs.html'
                }
            }
        })
        .state('home.contactUs', {
            url: 'contactUs',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/contactUs.html'
                }
            }
        })
        .state('home.rules', {
            url: 'rules',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/rules.html'
                }
            }
        })
        .state('home.guide', {
            url: 'guide',
            views: {
                'mainContent': {
                    templateUrl: '../templates/Panel/mainPageStuff/guide.html'
                }
            }
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
                    controller: passCtrl
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
                    controller: usrPointsCtrl
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
                    controller: usrPpointCtrl
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
                    templateUrl: '../templates/Panel/userPanelItems/FriendStuff/friends.html',
                    controller: friendsCtrl
                }
            }
        })
        .state('panel.friends.friendsList', {
            url: '/friendsList',
            views: {
                'friendStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/FriendStuff/friendsList.html',
                    controller: friendsCtrl
                }
            }
        })
        .state('panel.friends.pendingReqs', {
            url: '/pendingReqs',
            views: {
                'friendStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/FriendStuff/pendingReqs.html',
                    controller: friendsCtrl
                }
            }
        })
        .state('panel.friends.sentInvitations', {
            url: '/sentInvitations',
            views: {
                'friendStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/FriendStuff/SentReqs.html',
                    controller: friendsCtrl
                }
            }
        })
        .state('panel.groups', {
            url: '/groups',
            data: {
                'selectedTab': 5
            },
            views: {
                'groups': {
                    templateUrl: '../templates/Panel/userPanelItems/groupStuff/groups.html',
                    controller: groupCtrl
                }
    }
    })
        .state('panel.groups.showGroupList', {
            url: '/groupsList',
            views: {
                'groupStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/groupStuff/groupsList.html',
                    controller: groupCtrl
                }
            }
        })
        .state('panel.groups.createGp', {
            url: '/gpCreation',
            views: {
                'groupStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/groupStuff/gpCreation.html',
                    controller: groupCtrl
                }
            }
        })
        .state('panel.messages', {
            url: '/messages',
            data: {
                'selectedTab': 6
            },
            views: {
                'messages': {
                    templateUrl: '../templates/Panel/userPanelItems/messageStuff/messages.html',
                    controller: msgCTRL
                }
            }
        })
        .state('panel.messages.checkInbox', {
            url: '/inbox',
            views: {
                'groupStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/messageStuff/inbox.html',
                    controller: msgCTRL
                }
            }
        })
        .state('panel.messages.checkOutbox', {
            url: '/outbox',
            views: {
                'groupStuff': {
                    templateUrl: '../templates/Panel/userPanelItems/messageStuff/outBox.html',
                    controller: msgCTRL
                }
            }
        });
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
});
