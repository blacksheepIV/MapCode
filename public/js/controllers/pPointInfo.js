/**
 * Created by blackSheep on 17-May-17.
 */
var pPointInfo = function ($scope,pointService) {
    $scope.initPpoint = function(){
        $scope.pPoint = pointService.getPpointDetailedInfo();
    };//end of initPpoint
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
};