/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource','ngMessages','lr.upload','LocalStorageModule']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mainCtrl',mainCtrl)
        .controller('userCtrl',userCtrl)
        .service('userService',userService)
        .service('authentication',authentication)
        .service('authenticationToken',authenticationToken)
        .service('authInterceptor',authInterceptor)
        .filter('date',date);
