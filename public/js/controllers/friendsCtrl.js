/**
 * Created by blackSheep on 21-May-17.
 */
function friendsCtrl ($scope,friendService,$mdDialog,toastr){
    var getFriend =  window.apiHref + 'friends';
    $scope.initFriends = function(){
     /*   $scope.availableFeatures=
            [ 'لیست دوستان','لیست گروه ها','درخواست های در حال بررسی','درخواست های دوستی'];
        selectedFeature = ''; */
        $scope.myFriends = [];
        $scope.sentReqs = [];
        $scope.noSentReq = false;
        $scope.pendingReqs = [];
        $scope.noPendingReq = false;
        $scope.noFriends = false;
        friendService.getFriends().then(
            function(friendsList){
                console.log(friendsList);
                if(friendsList.data.length === 0)
                    $scope.noFriends = true;
                else if(friendsList.data.length !== 0)
                    $scope.myFriends = friendsList.data;
            },
            function(friendsList){
                console.log(friendsList);
            });
        friendService.getAlistOfFriendRequest().then(
            function(requestList){
                $scope.sentReqs=requestList.data.fromMe;
                console.log( $scope.sentReqs);
                console.log( $scope.noSentReq);
                if( $scope.sentReqs.length === 0)
                    $scope.noSentReq = true;
                $scope.pendingReqs = requestList.data.toMe;
                if( $scope.pendingReqs.length === 0)
                    $scope.noPendingReq = true;
            },
            function(requestList){
                console.log(requestList);
            });
    };//end of initFriends func
    $scope.abortSentReq = function (username){
        friendService.cancelFriendReq(username).then(
            function(cancelResult){
                angular.forEach($scope.pendingReqs,function(value,key){
                    if(username === value)
                        $scope.pendingReqs.splice(key,1);
                });
                toastr.info( 'شما درخواست دوستی را رد کردید!', {
                    closeButton: true
                });
              //  console.log(cancelResult);

            },
            function(cancelResult){
                toastr.warning( 'ارسال درخواست با خطا مواجه شده؛با ادمین تماس بگیرید!','خطا', {
                    closeButton: true
                });
                //console.log(cancelResult);
            });
    };//end of acceptFriendReq func
    $scope.acceptReq = function(username){
        console.log(username);
        friendService.acceptFriendReq(username).then(
            function(acceptResult){
                angular.forEach($scope.pendingReqs,function(value,key){
                    if(username === value)
                        $scope.pendingReqs.splice(key,1);
                });
                toastr.success( 'شما درخواست دوستی را پذیرفتید!', {
                    closeButton: true
                });
                console.log(acceptResult);

            },
            function(acceptResult){
                console.log(acceptResult);
            });
};//end of acceptReq func
    /* #################################################################################################################### */
    /* #################################################################################################################### */
    $scope.shareIt = function (){
        //console.log("hello");
            $mdDialog.show({
                controller: friendsCtrl,
                templateUrl: 'templates/Panel/userPanelItems/composeAmsg.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            });
    };//end of shareIt func
    /* ###################################################################################################################### */
    $scope.unfriended = function(friendUsrname){
          console.log(friendUsrname);
        friendService.unfriend(friendUsrname)
            .then(function(unfriendedResult){
                angular.forEach($scope.myFriends,function(value,key){
                   if(friendUsrname === value)
                       $scope.myFriends.splice(key,1);
                });
                toastr.info( 'حذف دوست با موفقیت انجام شد!', {
                    closeButton: true
                });
            },function(unfriendedResult){
               // console.log(unfriendedResult);
                toastr.warning( 'ارسال درخواست با خطا مواجه شده؛با ادمین تماس بگیرید!','خطا', {
                    closeButton: true
                });
            });
    };//end of unfriended func
};//end of friendsCtrl
