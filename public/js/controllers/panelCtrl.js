/**
 * Created by blackSheep on 01-Jun-17.
 */
function panelCtrl ($scope,$state,authenticationToken,$rootScope){
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.currentTab = toState.data.selectedTab;
        });
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
      //  $location.path("/");
        $state.go('home');
    };
};//end of panelCtrl func
