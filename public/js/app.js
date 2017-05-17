/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource','ngMessages','lr.upload','LocalStorageModule']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mapCtrl',mapCtrl)
        .controller('mainCtrl',mainCtrl)
        .controller('userCtrl',userCtrl)
        .controller('pointCtrl',pointCtrl)
        .controller('PanelCodeVerfication',PanelCodeVerfication)
        .controller('pointInfoCtrl',pointInfoCtrl)
        .controller('searchCtrl',searchCtrl)
        .controller('pPointCtrl',pPointCtrl)
        .controller('pPointInfo',pPointInfo)
        .service('userService',userService)
        .service('authentication',authentication)
        .service('authenticationToken',authenticationToken)
        .service('authInterceptor',authInterceptor)
        .service('pointService',pointService)
        .factory('sysMessagesService',sysMessagesService)
        .factory('RegisteredUsr',RegisteredUsr);

