/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource','ngMessages']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mainCtrl',mainCtrl)
        .service('regService',regService);
