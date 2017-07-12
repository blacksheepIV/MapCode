/**
 * Created by blackSheep on 30-Mar-17.
 */
var loginCtrl = function ($scope, $state, $mdDialog, authentication, authenticationToken, toastr) {
    $scope.init = function () {
        $scope.user = {
            username: '',
            pass: ''
        };
        if (authenticationToken.getToken())
            $state.go('home');
    }//end of function Init
    $scope.login = {
        submit: function () {
            var incomer = {
                username: $scope.user.username,
                password: $scope.user.pass
            };
            authentication.validateUser(incomer).then(
                function (res) {
                    //  console.log(res.data.token); // gotta set the token
                    authenticationToken.setToken(res.data.token);
                    $state.go('home');
                },
                function (res) {
                    console.log(res);
                    if (res.status === 400)
                        toastr.error('نام کاربری با الگوی غیر معتبر!', 'خطا');
                    else if (res.status === 404) {
                        console.log("نام کاربری یا رمز عبور صحیح نمی باشد.");
                        $scope.showAlert();
                    }
                }//failure
            );
        }//end of login function
    };
    $scope.register = function () {
        $state.go('registration');
    }//end of registration function
    /* ############################################################################################################## */
    $scope.showAlert = function () {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('نام کاربری یا رمز عبور صحیح نمی باشد!!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
            // .targetEvent(ev)
        );
    };
}//end of loginCtrl