/**
 * Created by blackSheep on 01-Jun-17.
 */
function panelCtrl ($scope,$location,authenticationToken,$rootScope){
    $scope.takeMeHome =  function(){
        $location.path('/');
    };//end of function take me home
    //******************************************************************************************************************
    var originatorEv;

    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);

    };
    /* ##################################################################################### */
    $scope.logOut=function(){
        console.log("user just logged out.");
        //TODO:sth needed to distroy user's session/token,whatever
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/");
    };
};//end of panelCtrl func
