/**
 * Created by blackSheep on 01-Jun-17.
 */
function panelCtrl ($scope,$state,authenticationToken,$rootScope,$mdDialog){
      /*  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.currentTab = toState.data.selectedTab;
        }); */
    $scope.selectedIndex = 0;
    $scope.$watch('selectedIndex', function(current, old) {
        switch (current) {
            case 0:
                $state.go(".edit");
                break;

        }
    });
    //******************************************************************************************************************
    var originatorEv;

    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);

    };
    /* ################################################################################################################# */
    $scope.showOffers = function(ev){
        $mdDialog.show({
            controller: paymentCtrl,
            templateUrl: 'templates/Panel/buyApackage.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: false // Only for -xs, -sm breakpoints.
        });
    };
    /* ################################################################################################################# */
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
