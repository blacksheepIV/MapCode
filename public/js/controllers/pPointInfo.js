/**
 * Created by blackSheep on 17-May-17.
 */
var pPointInfo = function ($scope,pointService, $mdDialog,$window,$document) {
   // angular.element($document).ready(function(){ document.getElementById('myMap').innerHTML = "hello";});
    //TODO : PROVIDE A FUNCTION TO DELETE PERSONAL POINTS
    $scope.initPpoint = function(){
        $scope.pPoint = pointService.getPpointDetailedInfo();
      //  console.log($scope.pPoint.lat);
     //   console.log($scope.pPoint.lat);

    };//end of initPpoint
    //##################################################################################################################
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    //##################################################################################################################
    $scope.shareIt = function (point){
      //  console.log(point);
        pointService.sharePoint (point,true);
        $mdDialog.show({
            controller: sharePointCtrl,
            templateUrl: 'templates/Panel/userPanelItems/composeAmsg.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: false// Only for -xs, -sm breakpoints.
        });
    };//end of shareIt func
        /* ################################################################################################################ */
        $scope.showThePath = function(point){
            pointService.sharePoint (point,true);
            $scope.cancel();
            $mdDialog.show({
                controller: mapCtrl,
                templateUrl: 'templates/Panel/userPanelItems/map.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: false// Only for -xs, -sm breakpoints.
            });
        };//end of showThePath func
        /* ################################################################################################################ */

};