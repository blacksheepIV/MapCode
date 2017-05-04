/**
 * Created by blackSheep on 30-Mar-17.
 */
var loginCtrl = function ($scope,$location,$mdDialog,authentication,authenticationToken) {
    $scope.init = function(){
        $scope.user={
           username : '' ,
            pass : ''
        };
        // somehow check wether user is already signed in or not
        if(authenticationToken.getToken())
            $location.path('/');
    }//end of function Init
    $scope.login={
        submit:function(){
            var incomer = {
                username : $scope.user.username ,
                password : $scope.user.pass
            };
            //TODO : Gotta send incomer to a service which will fetch the user in case it exists
           authentication.validateUser(incomer).then(
             function(res){
                 console.log(res.data.token); // gotta set the token
                 authenticationToken.setToken(res.data.token);
                 $location.path('/');
             },
             function(res){
                 console.log(res);
                // console.log(res.status);
                 if(res.status == 400)
                     console.log("نام کاربری با الگوی غیر معتبر!");
                     else if(res.status == 404) {
                     console.log("نام کاربری یا رمز عبور صحیح نمی باشد.");
                     $scope.showAlert();
                 }
             }//failure
           );

            console.log(incomer);
            //set $rootScope.guest equal to false if login was a success
        }//end of login
    };
    $scope.register = function(){
        $location.path('/registration'); //sets the path to registrationPage
    }//end of registration function
    $scope.showAlert = function() {
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