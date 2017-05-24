/**
 * Created by blackSheep on 17-May-17.
 */
var pPointInfo = function ($scope,pointService, $mdDialog,$window,$document,$timeout) {
   // angular.element($document).ready(function(){ document.getElementById('myMap').innerHTML = "hello";});
    //TODO : PROVIDE A FUNCTION TO DELETE PERSONAL POINTS
    $scope.initPpoint = function(){
        $scope.pPoint = pointService.getPpointDetailedInfo();
        console.log($scope.pPoint.lat);
        console.log($scope.pPoint.lat);
        $timeout(function() {
            $scope.initMap();
        }, 1000);
       // $scope.initMap();
    };//end of initPpoint
    $scope.initMap = function(){
        $scope.map = new google.maps.Map(document.getElementById('myMap'), {
            center: {lat: 33.9870993, lng: 51.4405203},
            zoom: 8
        });
        google.maps.event.addDomListener($window, 'load',  $scope.initMap);
        google.maps.event.trigger( $scope.map, 'resize');
    };
    //##################################################################################################################
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
};