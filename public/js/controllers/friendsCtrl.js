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
                console.log(cancelResult);
             //   this.parentElement.style.display='none';
            },
            function(cancelResult){
                console.log(cancelResult);
            });
    };//end of acceptFriendReq func
    $scope.acceptReq = function(username){
        console.log(username);
        friendService.acceptFriendReq(username).then(
            function(acceptResult){
                console.log(acceptResult);
                rem();
            },
            function(acceptResult){
                console.log(acceptResult);
            });
};//end of acceptReq func
    /* #################################################################################################################### */
    function rem(){
        var list = document.getElementById('pendingRequests'),
            items = Array.prototype.slice.call(list.childNodes),
            item;
        while (item = items.pop()) {
            if (item.firstChild && item.firstChild.checked) {
                list.removeChild(item);
            }
        }
    };//end of rem func
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
