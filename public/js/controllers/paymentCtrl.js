/**
 * Created by blackSheep on 24-Jun-17.
 */
function paymentCtrl($scope,$mdDialog){
 $scope.initPayment = function(){

 };//end of initPayment func

    /* ################################################################################################################ */
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
};
