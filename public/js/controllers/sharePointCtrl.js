/**
 * Created by blackSheep on 27-May-17.
 */
function sharePointCtrl ($scope,pointService,$mdDialog,msgService,toastr){
    $scope.initCompose = function (){
        $scope.isPersonal = false;
        $scope.msg = {
            receiver :"",
            point : "",
            personal_point :  0 ,
            message : ""
        };
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
  /*  var last = {
        bottom: true,
        top: false,
        left: true,
        right: false
    };

    $scope.toastPosition = angular.extend({},last);

    $scope.getToastPosition = function() {
        sanitizePosition();

        return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
    };

    function sanitizePosition() {
        var current = $scope.toastPosition;

        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;

        last = angular.extend({},current);
    }
    function showSimpleToast (){
        var pinTo = $scope.getToastPosition();
        $mdToast.show(
            $mdToast.simple()
                .textContent('پیغام ارسال شد.')
                .position(pinTo )
                .hideDelay(5000)
        );
    }; */
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
