/**
 * Created by blackSheep on 27-May-17.
 */
function sharePointCtrl ($scope,pointService,$mdDialog,msgService,toastr,groupService){
    $scope.initCompose = function (){
        $scope.isPersonal = false;
        $scope.msg = {
            receiver :"",
            gpReceiver:"",
            point : "",
            personal_point :  0 ,
            message : ""
        };
        $scope.groupList = [];
        var sharedPoint = pointService.getSharedPoint();
        if(sharedPoint.isPersonal) {
            $scope.msg.personal_point = pointService.sharedPoint.pointInfo.code;
            $scope.isPersonal = true;
        }
        if(!sharedPoint.isPersonal)
            $scope.msg.point =  pointService.sharedPoint.pointInfo.code ;
        groupService.getGroupsList()
            .then(
                function(groupsList){
                    $scope.groupList= groupsList.data;
                }
                ,function(groupsList){
                    console.log(groupsList);
                });

    };//end of initCompose
    /* ########################################################################################################################## */
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    /* ######################################################################################################################### */
    /* ######################################################################################################################### */
    $scope.submit = function (){
        var msgTemplate = {};
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
    };
    /*  ####################################################################################################################### */
};//end of sharePointCtrl
