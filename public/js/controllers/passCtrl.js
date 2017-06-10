/**
 * Created by blackSheep on 10-Jun-17.
 */
function passCtrl ($scope,RegisteredUsr,toastr){
    $scope.initPassStuff = function(){
        $scope.newPass = "";
        $scope.newPassConfirm = "";
    };//end of initPassStuff
    //**************************************** pass Change *******************************************************************************
    $scope.submitPass = function(){
         RegisteredUsr.getUSrInfo().then(function(Info){
             console.log(Info);
         },function(Info){
             console.log(Info);
         });

     /*   console.log($scope.user.password);
        if($scope.claimedPass !== $scope.user.password) //TODO:pass is not obtained from database query so obviously it's not working
            $scope.showAlert3();
        if($scope.newPass !== $scope.newPassConfirm)
            $scope.showAlert();
        if($scope.newPass === $scope.claimedPass)
            $scope.showAlert2();
        else if($scope.newPass === $scope.newPassConfirm && $scope.claimedPass === $scope.user.password ) {
            var alteredPass = {
                password: $scope.newPass
            };
            RegisteredUsr.updateUsrInfo(alteredPass).then(
                function (response) {
                    console.log(response);
                    $scope.logOut(); //password was changed user's gotta be dumped
                },
                function (response) {
                    console.log(response);
                });
        } */
    };//end of submit
};//end of passCtrl func
