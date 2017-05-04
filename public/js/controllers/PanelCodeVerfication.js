/**
 * Created by blackSheep on 04-May-17.
 */
function PanelCodeVerfication($scope,userService,$mdDialog,RegisteredUsr,$timeout,$http){
    $scope.usr={};
 $scope.initUserInfo = function(){
    $scope.usr= userService.getUserInfo();
     $scope.v_code = 0;
     $scope.smsPattern='[0-9]+';
     $scope.reSend = false;
     $scope.resubmits = 0; //counts the times user asked for resubmission
 };
    $scope.counter = 120;
    $scope.onTimeout=function(){
        // console.log($rootScope.user.cDate / 1000);
        $scope.counter --;
        mytimeout = $timeout($scope.onTimeout,1000);
        if($scope.counter === 0) {
            //if($scope.resubmits == 3)
            $timeout.cancel(mytimeout);
            $scope.reSend= true ;
        }
    };//end of function on time out
    var mytimeout = $timeout($scope.onTimeout,1000);
    //*****************************************************************************************************************
    $scope.resendCode = function () {
        var mysmsUrl = window.apiHref + "sms/";
        //here u gotta send a request to server to ask for code again
        $http({
            url: mysmsUrl,
            method: "POST",
            data: {

                mobile_phone: $scope.usr.mobile_phone
            }
        }).then(
            function (response) {
                console.log(response);
                console.log(response.data.sms_code);
            },
            function (response) {
                console.log(response); // failure
            }
        );
    };
    //*****************************************************************************************************************
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    $scope.submit = function(){
      //  userService.setVerificationCode($scope.v_code);
       var  alteredData = {
            name: $scope.usr.name,
            melli_code: $scope.usr.melli_code,
            email: $scope.usr.email,
            mobile_phone: $scope.usr.mobile_phone,
            phone: $scope.usr.phone,
            username: $scope.usr.username,
            description: $scope.usr.description,
            address: $scope.usr.description,
            sms_code: String($scope.v_code)
        };
        RegisteredUsr.updateUsrInfo(alteredData).then(
            function (response) {
                console.log(response);
                $mdDialog.hide();
                $scope.showSucces();
            },
            function (response) {
                console.log(response);
            });
    };
    $scope.showSucces = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('تبریک')
                .textContent('اطلاعات با موفقیت بروز شد!')
                .ariaLabel('successDialog')
                .ok('مرسی')
        );
    };
};//end of ctrl
