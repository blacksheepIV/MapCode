/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource','ngMessages','lr.upload','LocalStorageModule','ngAnimate','toastr','ui.router','ui.select', 'ngSanitize']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mapCtrl',mapCtrl)
        .controller('mainCtrl',mainCtrl)
        .controller('panelCtrl',panelCtrl)
        .controller('userCtrl',userCtrl)
        .controller('passCtrl',passCtrl)
        .controller('pointCtrl',pointCtrl)
        .controller('PanelCodeVerfication',PanelCodeVerfication)
        .controller('pointInfoCtrl',pointInfoCtrl)
        .controller('searchCtrl',searchCtrl)
        .controller('usrInfoCtrl',usrInfoCtrl)
        .controller('pPointCtrl',pPointCtrl)
        .controller('pPointInfo',pPointInfo)
        .controller('friendsCtrl',friendsCtrl)
        .controller('msgCTRL',msgCTRL)
        .controller('sharePointCtrl',sharePointCtrl)
        .controller('groupCtrl',groupCtrl)
        .controller('gpEditCtrl',gpEditCtrl)
        .service('userService',userService)
        .service('authentication',authentication)
        .service('authenticationToken',authenticationToken)
        .service('authInterceptor',authInterceptor)
        .service('pointService',pointService)
        .factory('sysMessagesService',sysMessagesService)
        .factory('RegisteredUsr',RegisteredUsr)
        .factory('friendService',friendService)
        .factory('msgService',msgService)
        .factory('groupService',groupService);

