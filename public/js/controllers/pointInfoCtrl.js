/**
 * Created by blackSheep on 09-May-17.
 */
function pointInfoCtrl ($scope,pointService,$mdDialog){
  $scope.initPoint = function(){
      $scope.point = pointService.getDetailedInfo();
      console.log($scope.point);
  };//end of function init Point
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
};
