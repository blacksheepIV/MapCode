/**
 * Created by blackSheep on 21-May-17.
 */
function friendsCtrl ($scope,friendService){
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
        friendService.getFriends().then(
            function(friendsList){
                console.log(friendsList);
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
};//end of friendsCtrl
