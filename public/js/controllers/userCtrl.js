/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function ($scope, $http, $rootScope, RegisteredUsr, $state, userService, $mdDialog, authenticationToken,toastr) {
    var alteredData = {};
    $scope.initVars = function () {
        $scope.investigate = false; // user's not been investigated and approved yet
        $scope.emailPattern = '([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})';
        $scope.namePattern = '[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
        $scope.avatar = null;
        // $scope.namePattern='[a-zA-Z]+';
        $scope.mobilePattern = '09[1|2|3][0-9]{8}';
        $scope.user = {
            name: '',
            melli_code: 0,
            email: '',
            date: '',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat: '',
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
                //  console.log(usrDate);

                $scope.user = {
                    name: Info.data.name,
                    melli_code: Info.data.melli_code,
                    email: Info.data.email,
                    date: usrDate,
                    mobile_phone: Info.data.mobile_phone,
                    phone: Info.data.phone,
                    username: Info.data.username,
                    password: '',
                    passRepeat: '',
                    address: Info.data.address,
                    description: Info.data.description,
                    isRecommended: false,
                    recommender: Info.data.recommender_user,
                    code: '',
                    credit: Info.data.credit,
                    bonus: Info.data.bonus
                };
                console.log(Info.data.type);
                switch (Info.data.type) {
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
                }
                ; //end of switchCase
            }, function (Info) {
                if (Info.status === 401) {
                    console.log("نقض قوانین!کاربر احراز هویت نشده!");
                    RegisteredUsr.goodriddance();
                }
                if (Info.status === 404) {
                    console.log("کاربری با این مشخصات در سامانه وجود ندارد.");
                    RegisteredUsr.goodriddance();
                }

            }
        );
        //***********************************************************************************************************************************************
        /* if(localStorageService.isSupported) {
         $scope.myPoint = localStorageService.get('point1');
         console.log($scope.myPoint);
         } */

        $("#creationDate").pDatepicker(
            {
                format: "YYYY - MM - DD dddd",
                viewMode: "year",
                persianDigit: true,
                altField: '#dateAltEdit',
                altFormat: 'unix',
                position: "auto",
                autoClose: true
            });
    }; //end of initVars func


//**********************************************************************************************************************
//*************************************************************************************************************************
    $scope.showDlg = function () {
        $mdDialog.show({
            controller: PanelCodeVerfication,
            templateUrl: 'templates/Panel/userPanelItems/VerificationCode.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    /*  ######################################################Edit User Info ################################################################# */
    $scope.edit = function () {
        console.log($scope.userForm.cellNumber.$pristine);
        if ($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
            console.log("phone number was not changed!");
            alteredData = {
                name: $scope.user.name,
                melli_code: $scope.user.melli_code,
                email: $scope.user.email,
                username: $scope.user.username,
            };
            $scope.updateInfo(alteredData);
        }
        else if ($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
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
        else if ($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
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
        else if ($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
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

        else if ($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
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
        else if ($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
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
        else if ($scope.userForm.cellNumber.$pristine && !$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
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
        else if ($scope.userForm.cellNumber.$pristine && $scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
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
        else if (!$scope.userForm.cellNumber.$pristine) {
            var mysmsUrl = window.apiHref + "sms/";
            $http({
                url: mysmsUrl,
                method: "POST",
                data: {
                    mobile_phone: $scope.user.mobile_phone
                }
            }).then(
                function (response) {
                    userService.setUserInfo($scope.user);
                    console.log(response.data.sms_code);
                    $scope.sCode = response.data.sms_code;
                    if ($scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            username: $scope.user.username,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if (!$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            username: $scope.user.username,
                            address: $scope.user.address,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if ($scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if ($scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            username: $scope.user.username,
                            description: $scope.user.description,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if (!$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            address: $scope.user.address,
                            description: $scope.user.description,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if (!$scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && $scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if ($scope.userForm.address.$pristine && !$scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            email: $scope.user.email,
                            mobile_phone: $scope.user.mobile_phone,
                            phone: $scope.user.phone,
                            username: $scope.user.username,
                            description: $scope.user.description,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    else if (!$scope.userForm.address.$pristine && $scope.userForm.phoneNum.$pristine && !$scope.userForm.description.$pristine) {
                        alteredData = {
                            name: $scope.user.name,
                            melli_code: $scope.user.melli_code,
                            mobile_phone: $scope.user.mobile_phone,
                            email: $scope.user.email,
                            username: $scope.user.username,
                            description: $scope.user.description,
                            sms_code: $scope.sCode
                        };
                        RegisteredUsr.setAlteredData(alteredData);
                    }
                    $scope.showDlg();

                }, function (response) {
                    console.log(response);
                });
        }
    };//end of edit
    $scope.updateInfo = function (alteredData) {
        RegisteredUsr.updateUsrInfo(alteredData).then(
            function (response) {
                toastr.success('اطلاعات با موفقیت بروزرسانی شد!', 'تبریک!');
            },
            function (response) {
                console.log(response);
            });
    };//end of updateInfo
    /*  ######################################################Edit User Info ################################################################# */
    /* ####################################################################################################################################### */
    $scope.update = function(){
        console.log($scope.userForm.myavatar);
        console.log($scope.avatar);
        upload({
            url: window.apiHref +"users-avatar",
            method: 'POST',
            avatar: {
                aFile: $scope.userForm.myavatar // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
            }
        }).then(
            function (response) {
                console.log(response.data); // will output whatever you choose to return from the server on a successful upload
            },
            function (response) {
                console.error(response); //  Will return if status code is above 200 and lower than 300, same as $http
            }
        );
    }

    /* ####################################################################################################################################### */
    $scope.logOut = function () {
        //console.log("user just logged out.");
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        // $location.path("/");
        $state.go('home');
    }; //end of logOut func


}//end of userCtrl controller