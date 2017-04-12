/**
 * Created by blackSheep on 30-Mar-17.
 */
var loginCtrl = function ($scope,$location,$mdDialog) {
    $scope.init = function(){
        $scope.user={
           username : '' ,
            pass : ''
        };
    }//end of function Init
    $scope.login={
        submit:function(){
            var incomer = {
                username : $scope.user.username ,
                password : $scope.user.pass
            };
            //TODO : Gotta send incomer to a service which will fetch the user
            console.log(incomer);
            //set $rootScope.guest equal to false if login was a success
        }//end of login
    };
    $scope.register = function(){
        $location.path('/registration'); //sets the path to registrationPage
    }//end of registration function


}//end of loginCtrl