/**
 * Created by blackSheep on 15-Jun-17.
 */
function usrPointsCtrl ($scope,pointService,toastr,$mdDialog){
    $scope.initUsrPoints = function(){
        $scope.noPointsYet =true;
        $scope.myPoints = [];
        pointService.getPointInfos().then(function(res){
            // console.log(res);
            $scope.myPoints=res.data;
            if($scope.myPoints.length !== 0)
               $scope.noPointsYet = false;
        },function(res){
           // console.log(res);
            toastr.error('خطا در دریافت لیست نقاط!', 'خطا');
        });
    };//end of initUsrPoints func
    /* **************************************** Point Details **************************************************************************** */
    $scope.showPointDetails = function(point, ev) {
        pointService.setDetailedInfo(point,true);
        $mdDialog.show({
            controller: pointInfoCtrl,
            templateUrl: 'templates/Panel/userPanelItems/pointDetailedInfo.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    /* **************************************** Point Details **************************************************************************** */
};//end of usrPointsCtrl
