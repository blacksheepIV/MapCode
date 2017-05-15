/**
 * Created by blackSheep on 04-May-17.
 */
function mapCtrl ($scope,$window){
    $scope.initMap = function(){
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 33.9870993, lng: 51.4405203},
            zoom: 10
            /* mapTypeIds: ['roadmap', 'satellite',
             'Dark'] */
        });
        // google.maps.event.addDomListener(window, 'load', initialize);
        google.maps.event.trigger( $scope.map, 'resize');
        google.maps.event.addDomListener($window, 'load',   $scope.initMap);
    };
};//end of mapCtrl
