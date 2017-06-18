/**
 * Created by blackSheep on 27-May-17.
 */
function sharePointCtrl ($scope,pointService,$mdDialog,msgService,toastr,groupService,friendService){
    $scope.initCompose = function (){
        $scope.isPersonal = false;
        $scope.msg = {
            receiver :"",
            gpReceiver:"",
            point : "",
            personal_point :  0 ,
            message : ""
        };
        $scope.friends = [];
        $scope.groupList = [];
        var sharedPoint = pointService.getSharedPoint();
        if(sharedPoint.isPersonal) {
            $scope.msg.personal_point = pointService.sharedPoint.pointInfo.code;
            $scope.isPersonal = true;
        }
        if(!sharedPoint.isPersonal)
            $scope.msg.point =  pointService.sharedPoint.pointInfo.code ;

    };//end of initCompose
    /* ########################################################################################################################## */
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    /* ######################################################################################################################### */
    $scope.loadGroupList = function(){
        return groupService.getGroupsList()
            .then(
                function(groupsList){
                    $scope.groupList= groupsList.data;
                }
                ,function(groupsList){
                    console.log(groupsList);
                });
    };//end of loadGroupList func
    /* ######################################################################################################################### */
    $scope.loadFriendList = function(){
        return  friendService.getFriends()
            .then(
                function(friendsList){
                    $scope.friends = friendsList.data;
                }
                ,function(friendsList){
                    console.log(friendsList);
                });
    };//end of loadFriendList func
    /* ######################################################################################################################### */
    $scope.submit = function (){
        var msgTemplate = {};
        if($scope.sendMsg.gpReciever.$pristine && $scope.sendMsg.receiver.$pristine )
            toastr.error('گیرنده پیغام مشخص نشده است', 'خطا',{ closeButton: true});
        if(!$scope.sendMsg.gpReciever.$pristine && !$scope.sendMsg.receiver.$pristine )
            toastr.error('ارسال پیغام تنها به فرد یا به گروه ممکن است و نه هردو', 'خطا',{ closeButton: true});
        if($scope.sendMsg.gpReciever.$pristine && !$scope.sendMsg.receiver.$pristine ){
            if($scope.isPersonal)
                msgTemplate = {
                    receiver: $scope.msg.receiver,
                    personal_point: pointService.sharedPoint.pointInfo.code,
                    message: $scope.msg.message
                };
            else if (!$scope.isPersonal)
                msgTemplate = {
                    receiver :$scope.msg.receiver,
                    point :  pointService.sharedPoint.pointInfo.code ,
                    message : $scope.msg.message
                };
            msgService.sendMsg(msgTemplate)
                .then(
                    function(sentResult){
                        console.log(sentResult);
                        // showSimpleToast();
                        toastr.info( 'پیغام ارسال شد.', {
                            closeButton: true
                        });
                        $scope.cancel();
                    },function(sentResult){
                        console.log(sentResult);
                    }
                );
        }//end if condition
        if(!$scope.sendMsg.gpReciever.$pristine && $scope.sendMsg.receiver.$pristine ){
            if($scope.isPersonal)
                msgTemplate = {
                    personal_point: pointService.sharedPoint.pointInfo.code,
                    message: $scope.msg.message
                };
            else if (!$scope.isPersonal) {
                msgTemplate = {
                    point: pointService.sharedPoint.pointInfo.code,
                    message: $scope.msg.message
                };
                console.log(msgTemplate);
            }
            groupService.sendGroupMsg(msgTemplate,$scope.msg.gpReceiver)
                .then(
                    function(msgResult){
                        toastr.success('پیغام به گروه ارسال شد.');
                    },
                    function(msgResult){
                        toastr.error('با ادمین سیستم تماس بگیرید!', 'خطا');
                        console.log(msgResult);
                    });
        }
    };
    /*  ####################################################################################################################### */
};//end of sharePointCtrl
