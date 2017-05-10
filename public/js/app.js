/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource','ngMessages','lr.upload','LocalStorageModule']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mainCtrl',mainCtrl)
        .controller('mapCtrl',mapCtrl)
        .controller('userCtrl',userCtrl)
        .controller('pointCtrl',pointCtrl)
        .controller('PanelCodeVerfication',PanelCodeVerfication)
        .controller('pointInfoCtrl',pointInfoCtrl)
        .controller('searchCtrl',searchCtrl)
        .service('userService',userService)
        .service('authentication',authentication)
        .service('authenticationToken',authenticationToken)
        .service('authInterceptor',authInterceptor)
        .service('pointService',pointService)
        .factory('RegisteredUsr',RegisteredUsr);

