/**
 * Created by blackSheep on 04-Jun-17.
 */
function usrInfoCtrl($scope, userService, $mdDialog, pointService, friendService, toastr) {
    $scope.initUsr = function () {
        $scope.info = {};
        $scope.SendInvitation = false;
        //$scope.info = userService.getUsrInfo();
        $scope.friendshipStatus = "";
        $scope.usrpoints = [];
        $scope.hasPoints = false;
        //console.log($scope.info); phone number if it has value
        $scope.getThisUsr = userService.getUsername();
        if ($scope.getThisUsr !== "" || $scope.getThisUsr !== null)
            userService.getUsrInfo($scope.getThisUsr).then(
                function (data) {
                    $scope.info = data.data;
                    switch ($scope.info.friendship) {
                        case 'no':
                            $scope.friendshipStatus = "دوست شما نیست";
                            $scope.SendInvitation = true;
                            break;
                        case 'friend':
                            $scope.friendshipStatus = "دوست هستید";
                            break;
                        case 'pending_to_me':
                            $scope.friendshipStatus = "درخواست دوستی فرستاده";
                            break;
                        case 'pending_from_me':
                            $scope.friendshipStatus = "درخواست دوستی فرستادید";
                            break;
                    }
                    ;
                    if ($scope.info.description === "" || $scope.info.description === null)
                        $scope.info.description = "-ندارد-";
                    if ($scope.info.phone === "" || $scope.info.phone === null)
                        $scope.info.phone = "-ندارد-";
                    if ($scope.info.email === "" || $scope.info.email === null)
                        $scope.info.email = "-ندارد-";
                },
                function (data) {
                    if (data.status === 400)
                        toastr.error('جستجو برای نام کاربری بدون در نظر کرفتن مقدار یا نام کاربری غیر معتبر(طول کمتر از 5)', {
                            closeButton: true
                        });
                    else if (data.status === 404)
                        toastr.warning('متاسفانه کاربری با این نام کاربری یافت نشد):', {
                            closeButton: true
                        });
                });

    };//end of initUsr
    /* ################################################################################################################################################# */
    $scope.getUsrPoints = function () {
        var uname = userService.getUsername();
        if (uname !== "" || uname !== null) {
            userService.GetPoints(uname).then(
                function (data) {
                    $scope.usrpoints = data.data;
                   // console.log(data.data);
                   // console.log($scope.usrpoints);
                    if ($scope.usrpoints.length > 0)
                        $scope.hasPoints = true;
                },
                function (data) {
                    if (data.status === 400)
                        toastr.error(' مقداری برای نام کاربری درنظر گرفته نشده یا نام کاربری غیر معتبر(طول کمتر از 5)', {
                            closeButton: true
                        });
                });
        }
        else {
            toastr.error('در سیستم خطایی رخ داده،لطفا با ادمین تماس بگیرید!', 'خطا');
        }
    };
    /* ################################################################################################################################################ */
    /* ########################################## Show Point Details ################################################################################### */
    $scope.showPointDetails = function (point, ev) {
        pointService.setDetailedInfo(point , false);
        $mdDialog.show({
            controller: pointInfoCtrl,
            templateUrl: 'templates/Panel/userPanelItems/pointDetailedInfo.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    /* ########################################## Show Point Details ################################################################################### */
    /* ########################################### Send Friend Request ################################################################################# */
    $scope.sendReq = function (username) {
        console.log(username);
        friendService.sendFriendReq(username)
            .then(
                function (requestResult) {
                    //  console.log(requestResult);
                    toastr.success('درخواست دوستی ارسال شد.', 'موفقیت', {
                        closeButton: true
                    });
                },
                function (requestResult) {
                    // console.log(requestResult);
                    toastr.error('درخواست قبلی شما در حال انتظار است', 'خطا', {
                        closeButton: true
                    });
                });
    };//end of sendFriendReq func
    /* ########################################### Send Friend Request ################################################################################# */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
};//end of usrInfoCtrl func
