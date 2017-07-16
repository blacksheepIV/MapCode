/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function ($scope, $rootScope, $mdSidenav, $log, $state, authenticationToken, $mdDialog, pointService, RegisteredUsr,toastr) {
    $scope.initVar = function () {
        $scope.toggleFlag = true;
        $rootScope.isUser = false;
        $scope.NotLoggedIn = true;
        $scope.U = {
           username: "بازدیدکننده ",
            credit: 0,
            bonus: 0
        };
        if (authenticationToken.getToken()) {
            $rootScope.isUser = true;
            $scope.NotLoggedIn = false;
            console.log(authenticationToken.getToken());
            RegisteredUsr.getUSrInfo().then(
                function (Info) {
                    $scope.U.username = Info.data.username;
                    $scope.U.credit = Info.data.credit;
                    $scope.U.bonus = Info.data.bonus;
                },
                function (Info) {
                    console.log(Info); //failure in obtaining data
                    toastr.error(" دریافت اطلاعات کاربر با خطا مواجه شد، لطفا با ادمین تماس بگیرید","خطا");
                    $scope.logOut();

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
      //  if( $scope.isAguest)
          // $scope.showAlert();
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
    $scope.showAlert = function () {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('متاسفانه کاربر میهمان مجاز به استفاده از امکانات نمی باشد.')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
            // .targetEvent(ev)
        );
    };
    /* #################################################################################################################### */
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
       // $scope.initVar();
        $scope.toggleRight();
        $state.go('home.mainTheme');
    }
    //******************************************************************************************************************
    $scope.routeTo = function(path){
        console.log(path);
        switch(path){
            case 'aboutUs':
                $state.go('home.aboutUs');
                $scope.toggleRight();
                break;
            case 'contactUs':
                $state.go('home.contactUs');
                $scope.toggleRight();
                break;
            case 'rules':
                $state.go('home.rules');
                $scope.toggleRight();
                break;
            case 'guide':
                $state.go('home.guide');
                $scope.toggleRight();
                break;
        };
    };//end of routTo function
    //******************************************************************************************************************
    $scope.addPoint = function () {
      //  console.log($state.current);
        if($scope.U.credit <1)
          toastr.warning('عدم موجودی کافی برای ثبت نقطه،لطفا بسته خریداری کنید.','هشدار!');
        else if ($state.current.name === "home.showMap" && $scope.U.credit >=1 )
            $state.go('home.showMap', {}, {reload: "home.showMap"});
        else if($state.current.name !== "home.showMap" && $scope.U.credit >=1)
            $state.go('home.showMap');
        $scope.toggleRight();
        pointService.wannaSubmit("public");
    };//end of addPoint
    //######################################################################################################################################
    $scope.addPersonalPoint = function () {
        console.log($state.current);
        if($scope.U.credit <1)
            toastr.warning('عدم موجودی کافی برای ثبت نقطه،لطفا بسته خریداری کنید.','هشدار!');
       else if ($state.current.name === "home.showMap" && $scope.U.credit >=1)
            $state.transitionTo('home.showMap', {}, {reload: "home.showMap"});
        else if($state.current.name !== "home.showMap" && $scope.U.credit >=1)
            $state.go('home.showMap');
        $scope.toggleRight();
        pointService.wannaSubmit("personal");
    };//end of addPersonalPoint
    //######################################################################################################################################
}//end of main controller