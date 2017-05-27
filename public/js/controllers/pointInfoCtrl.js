/**
 * Created by blackSheep on 09-May-17.
 */
function pointInfoCtrl ($scope,pointService,$mdDialog){
  $scope.initPoint = function(){
      $scope.point = pointService.getDetailedInfo();
     // console.log($scope.point);
  };//end of function init Point
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    $scope.shareIt = function(point){
       // $scope.cancel();
        pointService.sharePoint (point);
            $mdDialog.show({
                controller: sharePointCtrl,
                templateUrl: 'templates/Panel/userPanelItems/composeAmsg.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: false// Only for -xs, -sm breakpoints.
            });

    };//end of shareIt func
};
