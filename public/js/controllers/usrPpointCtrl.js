/**
 * Created by blackSheep on 17-Jun-17.
 */
function usrPpointCtrl ($scope,toastr,$mdDialog,pointService,RegisteredUsr){
    $scope.initPpoint = function(){
        $scope.noPpointsYet =true;
        $scope.myPpoints = [];
        pointService.getPpointInfo()
            .then (
            function(pPointResult){
            console.log(pPointResult);
            $scope.myPpoints = pPointResult.data;
                if($scope.myPpoints.length !== 0)
                    $scope.noPpointsYet = false;
        },
            function(pPointResult){
            console.log(pPointResult);
            if(pPointResult.status = 401){
                toastr.error('نقض قوانین!کاربر احراز هویت نشده!', 'خطا');
                RegisteredUsr.goodriddance();
            }
        });
    };//end of initPpoint
    /* **************************************** Personal Point Detail ********************************************************************  */
    $scope.pPointDetails = function(pPoint,ev){
        pointService.setPpointDetailedInfo(pPoint);
        var templateUrl = 'templates/Panel/userPanelItems/pPointDetailedInfo.html';
        $mdDialog.show({
            controller: pPointInfo,
            templateUrl: templateUrl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

    };
    /* **************************************** Personal Point Detail ********************************************************************  */
};//end of usrPpointCtrl
