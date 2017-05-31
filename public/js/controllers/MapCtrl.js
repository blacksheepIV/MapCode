/**
 * Created by blackSheep on 04-May-17.
 */
function mapCtrl ($scope,pointService,$timeout,$window,$mdDialog,toastr){
   $scope.initStuff = function (){
       $scope.currentPosition = {};
       $timeout(function() {
           $scope.initMap();
       }, 1000);
      $scope.destinationInfo = pointService.getSharedPoint().pointInfo;
       $scope.latLng = {lat:$scope.destinationInfo.lat,lng:$scope.destinationInfo.lng};
       console.log($scope.latLng);
       console.log($scope.destinationInfo);
       getLocation();
   };//end of initStuff func
    /* ########################################################################################################## */
    function getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            toastr.info( 'جئولوکیشن توسط این مرورگر ساپورت نمی شود.','هشدار', {
                closeButton: true
            });
        }
    };
    function showPosition(position) {
        $scope.currentPosition.lat = position.coords.latitude ;
        $scope.currentPosition.lng = position.coords.longitude;
        console.log($scope.currentPosition);
    };
    /* ########################################################################################################## */
    $scope.initMap = function(){
        $scope.map = new google.maps.Map(document.getElementById('myMap'), {
            center: $scope.currentPosition,
            zoom: 14
        });
        google.maps.event.addDomListener($window, 'load', $scope.initMap);
        google.maps.event.trigger( $scope.map, 'resize');
       // directionsDisplay.setMap($scope.map);
        var infowindow = new google.maps.InfoWindow({

            content:'<div dir="rtl" style="font-family: Koodak">' +'<i class="fa fa-map-marker"></i>'+' '+
            'نام:'+$scope.destinationInfo.name+'<br/>'+'<i class="fa fa-address-card"></i>'+' '
            +'آدرس:' + $scope.destinationInfo.address + '<br/>'+'<i class="fa fa-phone"></i>'
            +' '+ 'شماره تماس:'+ $scope.destinationInfo.phone
            +'</div>'
        });
        var marker = new google.maps.Marker({
            icon:'../img/Icons/1.png',
            position:$scope.latLng,
            map:$scope.map
        });
        marker.addListener('click', function() {
            infowindow.open($scope.map, marker);
        });
        var currentMarker = new google.maps.Marker({
            icon:'../img/Icons/curentPosition.png',
            position:$scope.currentPosition,
            map:$scope.map
        });
    }; //end of initMap func
    /* ########################################################################################################## */
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
};//end of mapCtrl
