/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope,$http,$rootScope,RegisteredUsr,localStorageService,$location,userService,$mdDialog,authenticationToken){
    var alteredData = {};
    $scope.initVars = function(){
        $scope.investigate = false; // user's not been investigated and approved yet
        $scope.myPoint = {};
        $scope.newPass = "";
        $scope.newPassConfirm = "";
        $scope.claimedPass = "";
        $scope.user = {
            name: '',
            melli_code: 0,
            email: '',
            date: '',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat:'',
            address: '',
            description: '',
            isRecommended: false,
            recommender: 0,
            type: '',
            code: '',
            credit: 0,
            bonus: 0
        };
        //****************************************************************************************
        RegisteredUsr.getUSrInfo().then(
            function (Info) {
                console.log(Info);
                var temp = persianDate(new Date(Info.data.date)).format();
                var usrDate = temp.split(" ");
                console.log(usrDate);

                $scope.user = {
                    name: Info.data.name,
                    melli_code: Info.data.melli_code,
                    email: Info.data.email,
                    date: usrDate,
                    mobile_phone: Info.data.mobile_phone,
                    phone: Info.data.phone,
                    username:Info.data.username,
                    password: Info.data.password,
                    passRepeat:'',
                    address: Info.data.address,
                    description:Info.data.description,
                    isRecommended: false,
                    recommender: Info.data.recommender_user,
                    code: '',
                    credit: Info.data.credit,
                    bonus: Info.data.bonus
                };
                console.log(Info.data.type);
                switch( Info.data.type ){
                    case 0 :
                        $scope.investigate = false;
                        $scope.user.type = "حقیقی تایید نشده";
                        break;
                    case 2:
                        $scope.investigate = false;
                        $scope.user.type = "حقوقی تایید نشده";
                        break;
                    default:
                        $scope.user.type = " ";
                        break;
                }; //end of switchCase
             /*   var pointUrl = window.apiHref+"point/";
                $http({
                    url : pointUrl ,
                    method: "GET"
                })
                    .then(function(response){
                        console.log(response);
                        $scope.myPoint=response.data[0];
                    },function(data){
                        console.log(data);
                    }); */

            },function (Info) {
                if(Info.status === 401) {
                    console.log("نقض قوانین!کاربر احراز هویت نشده!");
                    RegisteredUsr.goodriddance();
                }
                if(Info.status === 404){
                    console.log("کاربری با این مشخصات در سامانه وجود ندارد.");
                    RegisteredUsr.goodriddance();
                }

            }
        );
        //****************************************************************************************
       /* if(localStorageService.isSupported) {
           $scope.myPoint = localStorageService.get('point1');
            console.log($scope.myPoint);
        } */


    };
    $(document).ready(function () {
        $("#creationDate").pDatepicker(
            {
                format:"YYYY - MM - DD dddd",
                viewMode : "year",
                persianDigit: true,
                altField: '#dateAltEdit',
                altFormat: 'unix',
                position: "auto",
                autoClose: true
            });
    });
//**********************************************************************************************************************
$scope.takeMeHome =  function(){
    $location.path('/');
};//end of function take me home
    //******************************************************************************************************************
    var originatorEv;

   /* this.openMenu = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
    }; */
//*************************************************************************************************************************
    $scope.showDlg = function() {
        $mdDialog.show({
            controller: PanelCodeVerfication,
            templateUrl: 'templates/Panel/userPanelItems/VerificationCode.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    $scope.edit = function(){
        console.log($scope.userForm.cellNumber.$pristine);
        if($scope.userForm.cellNumber.$pristine) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                phone: $scope.user.phone,
                username: $scope.user.username,
                description: $scope.user.description,
                address: $scope.user.description
            };
            $scope.updateInfo();
        }
        else if(!$scope.userForm.cellNumber.$pristine){
            var mysmsUrl = window.apiHref+"sms/";
            $http({
                url :mysmsUrl ,
                method: "POST" ,
                data : {
                    mobile_phone: $scope.user.mobile_phone
                }
            }).then(
                function(response) {
                    userService.setUserInfo($scope.user);
                    console.log(response.data.sms_code);
                    $scope.showDlg();

                },function(response){
                    console.log(response);
                });
        }
    };//end of edit
   $scope.updateInfo =function()
    {
        RegisteredUsr.updateUsrInfo(alteredData).then(
            function (response) {
                console.log(response);
            },
            function (response) {
                console.log(response);
            });
    };//end of updateInfo
//**************************************** pass Change *******************************************************************************
    $scope.submitPass = function(){
        console.log($scope.user.password);
        if($scope.claimedPass !== $scope.user.password)
            $scope.showAlert3();
          if($scope.newPass !== $scope.newPassConfirm)
              $scope.showAlert();
        if($scope.newPass === $scope.claimedPass)
            $scope.showAlert2();
        else if($scope.newPass === $scope.newPassConfirm) {
            var alteredPass = {
                password: $scope.newPass,
            };
            RegisteredUsr.updateUsrInfo(alteredPass).then(
                function (response) {
                    console.log(response);
                    $scope.logOut(); //password was changed user's gotta be dumped
                },
                function (response) {
                    console.log(response);
                });
        }
    };//end of submit
    $scope.logOut=function(){
        console.log("user just logged out.");
        //TODO:sth needed to distroy user's session/token,whatever
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/");
    };

    $scope.showAlert = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('رمز عبور و تکرار رمز عبور مشابه نیستند!!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
            // .targetEvent(ev)
        );
    };
    //*******************************************************************************************************************
    $scope.showAlert2 = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('رمز عبور جدید و  قدیم نمی توانند مشابه باشند!!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
            // .targetEvent(ev)
        );
    };

    $scope.showAlert3 = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('عدم مطابقت!')
                .textContent('رمز عبور فعلی به درستی وارد نشده !!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
            // .targetEvent(ev)
        );
    };
    // **************************************** pass Change *******************************************************************************
}//end of userCtrl controller