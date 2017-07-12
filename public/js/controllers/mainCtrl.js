/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function ($scope, $rootScope, $mdSidenav, $log, $state, authenticationToken, $mdDialog, pointService, RegisteredUsr) {
    $scope.initVar = function () {
        $scope.toggleFlag = true;
        $rootScope.isUser = false;
        $scope.NotLoggedIn = true;
        $scope.U = {
            name: "کاربر مهمان",
            credit: 0,
            bonus: 0
        };
        if (authenticationToken.getToken()) {
            $rootScope.isUser = true;
            $scope.NotLoggedIn = false;
            console.log(authenticationToken.getToken());
            RegisteredUsr.getUSrInfo().then(
                function (Info) {
                    $scope.U.name = Info.data.name;
                    $scope.U.credit = Info.data.credit;
                    $scope.U.bonus = Info.data.bonus;
                },
                function (Info) {
                    console.log(Info); //failure in obtaining data
                }
            );
        }
        // console.log( $rootScope.isUser );
        $scope.customFullscreen = false;

        $state.go('.mainTheme');
    }//end of initVar
    //################################################################################################################################################################################

    //################################################################################################################################################################################
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function () {
        return $mdSidenav('right').isOpen();
    };
    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }

    //##################################################################################################################
    $scope.login = function () {
        //  $location.path("/login");
        $state.go('login');
    };
    $scope.register = function () {
        //$location.path("/registration");
        $state.go('registration');
    };
    $scope.logOut = function () {

        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $scope.initVar();
        //$location.path("/");
        $state.go('home.mainTheme');
    }
    //******************************************************************************************************************
    //******************************************************************************************************************
    $scope.addPoint = function () {
        console.log($state.current);
        if ($state.current.name === "home.showMap")
            $state.go('home.showMap', {}, {reload: "home.showMap"});
        else
            $state.go('home.showMap');
        $scope.toggleRight();
        pointService.wannaSubmit("public");
    };//end of addPoint
    //######################################################################################################################################
    $scope.addPersonalPoint = function () {
        console.log($state.current);
        if ($state.current.name === "home.showMap")
            $state.transitionTo('home.showMap', {}, {reload: "home.showMap"});
        else
            $state.go('home.showMap');
        $scope.toggleRight();
        pointService.wannaSubmit("personal");
    };//end of addPersonalPoint
    //######################################################################################################################################
}//end of main controller