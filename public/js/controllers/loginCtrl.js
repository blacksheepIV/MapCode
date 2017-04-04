/**
 * Created by blackSheep on 30-Mar-17.
 */
var loginCtrl = function ($scope,$location) {
    $scope.register = function(){
        $location.path('/registration'); //sets the path to registrationPage
    }//end of registration function
}