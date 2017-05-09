/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope,$http,$rootScope,RegisteredUsr,localStorageService,$location,userService,$mdDialog,authenticationToken,pointService){
    var alteredData = {};
    $scope.initVars = function(){
        $scope.investigate = false; // user's not been investigated and approved yet
        $scope.myPoints = [];
        $scope.newPass = "";
        $scope.newPassConfirm = "";
        $scope.claimedPass = "";
        $scope.emailPattern = '([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})';
        $scope.namePattern='[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
        // $scope.namePattern='[a-zA-Z]+';
        $scope.mobilePattern='09[1|2|3][0-9]{8}';
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
                    password:'', // TODO:gotta get this password thing
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

                pointService.getPointInfos().then(function(res){
                   // console.log(res);
                    $scope.myPoints=res.data;
                },function(res){
                    console.log(res);
                });
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
    /*  ######################################################Edit User Info ################################################################# */
    $scope.edit = function(){
        console.log($scope.userForm.cellNumber.$pristine);
        if($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                username: $scope.user.username,
            };
            $scope.updateInfo(alteredData);
        }
        else if($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                username: $scope.user.username,
                address: $scope.user.address
            };
            $scope.updateInfo(alteredData);
        }
        else if($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                phone: $scope.user.phone,
                username: $scope.user.username
            };
            $scope.updateInfo(alteredData);
        }
       else if($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                username: $scope.user.username,
                description: $scope.user.description
            };
            $scope.updateInfo(alteredData);
        }

        else if($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                phone: $scope.user.phone,
                username: $scope.user.username,
                address: $scope.user.address,
                description: $scope.user.description
            };
            $scope.updateInfo(alteredData);
        }
        else if($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                phone: $scope.user.phone,
                email: $scope.user.email,
                username: $scope.user.username,
                address: $scope.user.address
            };
            $scope.updateInfo(alteredData);
        }
        else if($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                username: $scope.user.username,
                address: $scope.user.address,
                description: $scope.user.description
            };
            $scope.updateInfo(alteredData);
        }
        else if($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                phone: $scope.user.phone,
                email: $scope.user.email,
                username: $scope.user.username,
                description: $scope.user.description
            };
            $scope.updateInfo(alteredData);
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
                    if($scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            username: $scope.user.username
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if(!$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            username: $scope.user.username,
                            address: $scope.user.address
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if($scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            phone: $scope.user.phone,
                            username: $scope.user.username
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if($scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            username: $scope.user.username,
                            description: $scope.user.description
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if(!$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            address: $scope.user.address,
                            description: $scope.user.description
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if(!$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            phone: $scope.user.phone,
                            username: $scope.user.username
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if($scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            description: $scope.user.description
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if(!$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine ) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            username: $scope.user.username,
                            description: $scope.user.description
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    $scope.showDlg();

                },function(response){
                    console.log(response);
                });
        }
    };//end of edit
   $scope.updateInfo =function(alteredData)
    {
        RegisteredUsr.updateUsrInfo(alteredData).then(
            function (response) {
                console.log(response);
            },
            function (response) {
                console.log(response);
            });
    };//end of updateInfo
    /*  ######################################################Edit User Info ################################################################# */
//**************************************** pass Change *******************************************************************************
    $scope.submitPass = function(){
        console.log($scope.user.password);
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
    /* **************************************** Point Details **************************************************************************** */
    $scope.showPointDetails = function(point, ev) {
        pointService.setDetailedInfo(point);
        $mdDialog.show({
            controller: pointInfoCtrl,
            templateUrl: 'templates/Panel/userPanelItems/pointDetailedInfo.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            });
    };
    /* **************************************** Point Details **************************************************************************** */
}//end of userCtrl controller