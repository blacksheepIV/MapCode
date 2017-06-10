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
        if($scope.newPass !== $scope.newPassConfirm)
            toastr.error('رمز جدید و تکرار رمز جدید مشابه نیستند', 'خطا');
       //TODO:new pass shouldn't be equal to old pass
        else if($scope.newPass === $scope.newPassConfirm) {
            var alteredPass = {
                password: $scope.newPass
            };
            RegisteredUsr.updateUsrInfo(alteredPass).then(
                function (response) {
                    toastr.success('رمزعبور با موفقیت تغییر داده شد!', 'تبریک');
                   // $scope.logOut(); //password was changed user's gotta be dumped
                },
                function (response) {
                    console.log(response);
                    if(response.status === 400)
                        toastr.error('لطفا فیلدهای خالی را پر کنید!', 'خطا');
                });
        }
    };//end of submit

};//end of passCtrl func
