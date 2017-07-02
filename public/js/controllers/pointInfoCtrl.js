/**
 * Created by blackSheep on 09-May-17.
 */
function pointInfoCtrl($scope, pointService, $mdDialog) {
    $scope.initPoint = function () {
        $scope.info = pointService.getDetailedInfo();
        $scope.point = $scope.info.pointInfo;
        $scope.canShare = $scope.info.sharePossibility;
        // console.log($scope.point);
    };//end of function init Point
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.shareIt = function (point) {
        // $scope.cancel();
        pointService.sharePoint(point, false);
        $mdDialog.show({
            controller: sharePointCtrl,
            templateUrl: 'templates/Panel/userPanelItems/composeAmsg.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false// Only for -xs, -sm breakpoints.
        });
    };//end of shareIt func
    /* ################################################################################################################# */
    $scope.showThePath = function (point) {
        pointService.sharePoint(point, true);
        $scope.cancel();
        $mdDialog.show({
            controller: mapCtrl,
            templateUrl: 'templates/Panel/userPanelItems/map.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false// Only for -xs, -sm breakpoints.
        });
    };//end of showThePath func
};
